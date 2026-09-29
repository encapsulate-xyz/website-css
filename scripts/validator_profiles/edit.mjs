// Edits our Cosmos validators' name and description, as the operator or through its authz grant.
//   node edit.mjs --dry  [--only chain]     sign and SIMULATE only; nothing is broadcast
//   node edit.mjs --send [--only chain]     sign, simulate, broadcast, wait, read the validator back
// The mnemonic is read from SEED_FILE by this process and is never printed, logged or written anywhere.
import { readFileSync } from "node:fs";
import { DirectSecp256k1HdWallet, Registry, encodePubkey, makeAuthInfoBytes, makeSignDoc } from "@cosmjs/proto-signing";
import { defaultRegistryTypes } from "@cosmjs/stargate";
import { encodeSecp256k1Pubkey } from "@cosmjs/amino";
import { fromBase64, toBase64, toHex } from "@cosmjs/encoding";
import { sha256 } from "@cosmjs/crypto";
import { MsgEditValidator } from "cosmjs-types/cosmos/staking/v1beta1/tx.js";
import { MsgExec } from "cosmjs-types/cosmos/authz/v1beta1/tx.js";
import { TxRaw, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx.js";
import { Int53 } from "@cosmjs/math";

const args = process.argv.slice(2);
const SEND = args.includes("--send");
const ONLY = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const SEED_FILE = process.env.SEED_FILE;      // a file outside the repository, chmod 600
if (!SEED_FILE) { console.log(JSON.stringify({ result: "set SEED_FILE to the file that holds the seed" })); process.exit(1); }
const DESC = "Validator infrastructure for new chains, since 2020. Early to testnet, quick to upgrade, easy to reach. Trusted by Sui, NEAR, Monad, Lido, Starknet and more.";
const KEEP = "[do-not-modify]";
const plan = JSON.parse(readFileSync(new URL("./plan.json", import.meta.url), "utf8"));

let SECRET = "";
const scrub = s => { const t = String(s); return SECRET && t.includes(SECRET) ? "[output withheld: it contained the seed]" : t; };
const say = o => console.log(scrub(JSON.stringify(o)));
const rest = (p, path) => `https://rest.cosmos.directory/${p.registry}${path}`;
async function get(url) { const r = await fetch(url, { headers: { accept: "application/json" } }); const t = await r.text(); try { return JSON.parse(t); } catch { throw new Error("not JSON from " + url.split("/").slice(0, 4).join("/") + ": " + t.slice(0, 120)); } }
async function post(url, body) { const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const t = await r.text(); try { return JSON.parse(t); } catch { throw new Error("not JSON: " + t.slice(0, 160)); } }
const sleep = ms => new Promise(r => setTimeout(r, ms));

function price(p) {                       // [denom, price per gas]
  const [denom, fixed, low, avg] = p.fees[0];
  let v = avg ?? low ?? fixed ?? 0;
  if (!v || v <= 0) v = 0.01;
  return [denom, v];
}
function fee(gas, p) {
  const [denom, v] = price(p);
  const amount = BigInt(Math.ceil(gas * v * 1e6)) * 1n / 1000000n + 1n;       // exact for the large 18-decimal prices too
  return { amount: [{ denom, amount: amount.toString() }], gas: String(gas) };
}

async function account(p) {
  const a = (await get(rest(p, `/cosmos/auth/v1beta1/accounts/${p.signer}`))).account;
  const b = a.base_account || a;
  return { accountNumber: Number(b.account_number), sequence: Number(b.sequence) };
}

async function signed(wallet, pubkey, p, msgs, registry, gas, acc) {
  const bodyBytes = registry.encodeTxBody({ messages: msgs, memo: "" });
  const f = fee(gas, p);
  const authInfoBytes = makeAuthInfoBytes([{ pubkey, sequence: acc.sequence }], f.amount, Int53.fromString(f.gas).toNumber(), undefined, undefined);
  const doc = makeSignDoc(bodyBytes, authInfoBytes, p.chain_id, acc.accountNumber);
  const { signature, signed: s } = await wallet.signDirect(p.signer, doc);
  const raw = TxRaw.fromPartial({ bodyBytes: s.bodyBytes, authInfoBytes: s.authInfoBytes, signatures: [fromBase64(signature.signature)] });
  const bytes = TxRaw.encode(raw).finish();
  return { bytes, fee: f, hash: toHex(sha256(bytes)).toUpperCase() };
}

async function run(p, mnemonic) {
  const out = { chain: p.chain, validator: p.valoper.slice(0, 18) + "…" + p.valoper.slice(-6), mode: p.mode };
  if (p.mode === "NONE") return { ...out, result: "skipped: no permission found" };
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: p.prefix });
  const [acct] = await wallet.getAccounts();
  if (acct.address !== p.signer) return { ...out, result: "STOPPED: the seed's address on this chain is " + acct.address + ", not " + p.signer };
  const pubkey = encodePubkey(encodeSecp256k1Pubkey(acct.pubkey));
  const registry = new Registry(defaultRegistryTypes);
  registry.register("/cosmos.authz.v1beta1.MsgExec", MsgExec);

  const before = (await get(rest(p, `/cosmos/staking/v1beta1/validators/${p.valoper}`))).validator;
  const rename = before.description.moniker !== "Encapsulate";
  const edit = MsgEditValidator.fromPartial({
    description: { moniker: rename ? "Encapsulate" : KEEP, identity: KEEP, website: KEEP, securityContact: KEEP, details: DESC },
    validatorAddress: p.valoper, commissionRate: "", minSelfDelegation: "",
  });
  if (before.description.moniker === "Encapsulate" && before.description.details === DESC) return { ...out, result: "already right; nothing sent" };
  const inner = { typeUrl: "/cosmos.staking.v1beta1.MsgEditValidator", value: edit };
  const msgs = p.mode === "direct" ? [inner]
    : [{ typeUrl: "/cosmos.authz.v1beta1.MsgExec", value: MsgExec.fromPartial({ grantee: p.signer, msgs: [{ typeUrl: inner.typeUrl, value: MsgEditValidator.encode(edit).finish() }] }) }];
  out.changes = { name: rename ? before.description.moniker + " -> Encapsulate" : "kept", description: "set", commission: "untouched (" + before.commission.commission_rates.rate + ")" };

  let acc = await account(p);
  const probe = await signed(wallet, pubkey, p, msgs, registry, 400000, acc);
  const sim = await post(rest(p, "/cosmos/tx/v1beta1/simulate"), { tx_bytes: toBase64(probe.bytes) });
  if (!sim.gas_info) return { ...out, result: "simulation failed", error: (sim.message || JSON.stringify(sim)).slice(0, 300) };
  const used = Number(sim.gas_info.gas_used);
  const gas = Math.ceil(used * 1.5);
  out.gas = gas;
  const tx = await signed(wallet, pubkey, p, msgs, registry, gas, acc);
  out.fee = tx.fee.amount[0].amount + " " + tx.fee.amount[0].denom;
  if (!SEND) return { ...out, result: "simulated OK; not sent" };

  const b = await post(rest(p, "/cosmos/tx/v1beta1/txs"), { tx_bytes: toBase64(tx.bytes), mode: "BROADCAST_MODE_SYNC" });
  const r = b.tx_response;
  if (!r) return { ...out, result: "broadcast failed", error: (b.message || JSON.stringify(b)).slice(0, 300) };
  out.tx = r.txhash;
  if (r.code) return { ...out, result: "rejected", code: r.code, error: String(r.raw_log).slice(0, 300) };
  for (let i = 0; i < 30; i++) {
    await sleep(4000);
    try {
      const q = await get(rest(p, `/cosmos/tx/v1beta1/txs/${r.txhash}`));
      if (q.tx_response) { out.height = q.tx_response.height; out.code = q.tx_response.code; if (q.tx_response.code) out.error = String(q.tx_response.raw_log).slice(0, 300); break; }
    } catch (e) { /* not in a block yet */ }
  }
  if (out.code === undefined) return { ...out, result: "sent; not seen in a block within two minutes" };
  if (out.code) return { ...out, result: "failed in the block" };
  await sleep(3000);
  const after = (await get(rest(p, `/cosmos/staking/v1beta1/validators/${p.valoper}`))).validator;
  out.now = { name: after.description.moniker, description_ok: after.description.details === DESC, website: after.description.website, identity: after.description.identity,
    security_contact: after.description.security_contact, commission: after.commission.commission_rates.rate, same_commission: after.commission.commission_rates.rate === before.commission.commission_rates.rate };
  return { ...out, result: "done" };
}

let mnemonic;
try {
  mnemonic = readFileSync(SEED_FILE, "utf8").trim().split(/\s+/).join(" ");
  SECRET = mnemonic;
} catch (e) { console.log(JSON.stringify({ result: "cannot open the seed file", code: e.code })); process.exit(1); }
say({ seed_file: "read by this process", words: mnemonic.split(" ").length, mode: SEND ? "SEND" : "dry run" });
for (const p of plan) {
  if (ONLY && p.chain !== ONLY && p.valoper !== ONLY) continue;
  try { say(await run(p, mnemonic)); }
  catch (e) { say({ chain: p.chain, result: "error", error: scrub(e && e.message || e).slice(0, 300) }); }
}
