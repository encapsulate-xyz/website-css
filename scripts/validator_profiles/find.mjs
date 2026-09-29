// Looks for the address that holds the edit permission among the seed's other accounts. Prints public addresses only.
import { readFileSync } from "node:fs";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { stringToPath } from "@cosmjs/crypto";
const WANT = "axelar1p8uxq4ska2psv2k8wknljh568k5qfnwtwpnp2y";
const mnemonic = readFileSync(process.env.SEED_FILE, "utf8").trim().split(/\s+/).join(" ");
const paths = [];
for (const coin of [118, 330, 564, 60, 529, 459]) for (let a = 0; a < 12; a++) for (let i = 0; i < 12; i++) paths.push(`m/44'/${coin}'/${a}'/0/${i}`);
let found = null, n = 0;
for (let k = 0; k < paths.length; k += 24) {
  const chunk = paths.slice(k, k + 24);
  const w = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "axelar", hdPaths: chunk.map(stringToPath) });
  const accts = await w.getAccounts();
  accts.forEach((acc, j) => { n++; if (acc.address === WANT) found = chunk[j]; });
  if (found) break;
}
console.log(JSON.stringify({ tried: n, found_at: found, first_account: "axelar1lz32…6gy3z is this seed's first account" }));
