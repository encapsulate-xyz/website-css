# What is still to do

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## TODO — run both governance jobs from a GitHub Action (agreed 2026-09-17, not built)

Part of the GitHub Actions plan (2026-09-26): see "TODO — the GitHub Actions" and
`notion/github-actions-plan.md`.

Both scripts above are written to be run unattended; nothing about them needs a browser. The shape:

- a scheduled workflow in this repo (weekly is enough for upgrades; rationales only need running
  after rows are added), `python3 scripts/gov_upgrades.py` then `python3 scripts/gov_rationales.py`;
- `NOTION_TOKEN` as a repo secret — the integration already has access to the database. `GITHUB_TOKEN`
  is read if present, only to raise the GitHub API rate limit;
- run `--dry` on a pull request and the real write on the schedule, so a human sees what a new
  release would add before it lands on a public page;
- the same Action is the natural home for the APY job below — one scheduled job that writes Notion,
  rather than two.

## TODO — a GitHub Action to fill the APY property (agreed 2026-09-16, not built)

Part of the GitHub Actions plan (2026-09-26): see "TODO — the GitHub Actions" and
`notion/github-actions-plan.md`.

APY values in the Networks database are **updated by hand for now**. When it is worth automating,
the shape is a scheduled Action in this repo — not client-side fetching, which would mean CORS, a
flash of empty values and a key in the page.

- **Cosmos chains are free and verified working:** `https://chains.cosmos.directory/<chain>` returns
  `params.calculated_apr` (Agoric read 7.05% on 2026-09-16) and answers with
  `access-control-allow-origin: https://encapsulate.xyz`. Covers Agoric, Althea, Gravity Bridge,
  Passage, Sommelier, Terra, Lumera, Gitopia, Chain4Energy and others — about a third of the set.
- **Everything else is one API per chain** (Sui, NEAR, Monad, Avalanche, Starknet, Mina, IOTA,
  Zilliqa, Axelar, Supra, Vara…), with different maths and no shared format. Aggregators that cover
  them all are paid and key-based, so the key would have to be a repo secret — another reason the
  job runs in CI rather than the browser.
- **The job writes to Notion** through the integration (the API can set a property), so the site
  keeps rendering an ordinary property and any value can still be overridden by hand. Add a
  `Last updated` property so the page can say when, and have the job skip rows marked manual.
- Publish network APR, not the delegator's figure, unless commission is subtracted — and date it.

## TODO — the Networks set's open values (2026-09-24)

- **Mina reward rate:** blank on purpose (our pool is too small for a steady rate); decide later.
- **Mina fee:** Auro's list says 5%; the old Networks database's Mina page (its "Expected Reward
  Rate" list is stale) names no fee. Confirm.
- **Lido and SSV.network are one row, "Lido DVT"** (the user, 2026-09-24): the same 500 validators,
  Lido's Simple DVT module on an SSV cluster. The Lido row was renamed and carries Lido's values;
  the SSV.network row was archived (Notion trash, restorable). A new **Stake at** URL property holds
  `https://stake.lido.fi` for it — the chain page's action goes there instead of an address to copy
  (blank on every other row). **Validators run** (number, 500, from Lido's Simple DVT module:
  operator #43 "Lido x SSV: Arid Anubis", 500 deposited, 0 exited) is set on that row only; the
  30-day performance is not stored — uptime is shown nowhere else on the site. **Lido's 10% is the
  whole fee a staker pays, and ours is inside it**: the StakingRouter gives the Simple DVT module 8%
  and Lido's treasury 2%; the module's share for our cluster goes to a 0xSplits wallet
  (`0xcddc0b19…a187`) that returns 2/7 to Lido's Agent (`0x3e40D73E…9C8c`) and shares 5/7 equally
  among the seven operators, 10.2% of it each — **about 0.714% of the rewards our validators earn** (corrected
  2026-10-01 from the reward contracts on chain: 8% module fee × 87.5% × 10.2041% — a 12.5% cut comes off the module's
  share before the split, which the 0.82% of 2026-09-24 missed), about $7,663 a year on the 16,000 ETH. The cluster's
  future (the module is winding down, May 2027) and our SSV operator ids are validator-research's.
  Operator #48 "Lido x SSV: Mysterious Manta" (160 keys, all exited) was also ours, shut down on
  purpose (the user, 2026-09-24), so it counts toward nothing.
  The mainnet count went 28 → 27 everywhere: the homepage's "Number of
  Networks Supported", /networks's "Networks secured", navbar.js ("27 mainnets", "See all 27"), and
  /services's "Thirty-five chain teams" (35 distinct chains).

## TODO — three chain pages still point outside the site (2026-09-24)

Every chain page's green button opens **our own guide** for that chain, except the three chains
that have no guide yet. Until their guides exist the button goes elsewhere:

| Chain | Green button now | Goes to |
|---|---|---|
| Lido DVT | Stake with Lido | https://stake.lido.fi |
| Vara | Delegate with Vara Staking | https://staking.vara.network/#/nominate |
| Chain4Energy | Delegate with Keplr | DTEAM's explorer, our validator's page (Delegate connects Keplr) |

**When a guide for one of them is added** to the Guides Database (with its Networks set relation
pointing at the mainnet row; its path in Super is /guides/&lt;chain&gt;), switch that page over:

1. in `notion/chain-pages.json`, set the chain's `wallet` to `{"label": "Delegate with <the guide's
   wallet>", "url": "https://www.notion.so/<the guide's page id, no dashes>"}` — the same shape as
   the other 24;
2. `python3 scripts/chain_pages.py --buttons "<Name>"` (replaces only the button block);
3. after Super republishes, check the chain page's green button reads /guides/&lt;chain&gt;.

Raise this whenever guides are being worked on.

## TODO — the Sui guide moves to Slush (rebuilt 2026-09-28; reviewed 2026-09-29, the fixes wait for the user)

**What follows this paragraph is history.** The guide's slide database was rebuilt on 2026-09-28: **nine steps (ten since 2026-09-29) on
SuiVision's dashboard with the Slush extension**, no Suiet left, and the live page builds in the new design. A read-only
review on 2026-09-29 found 22 things (`notion/sui-guide-review-2026-09-29.md`). **The user's decisions the same day:**
fix 2 and 4 (done — the Lede reads "Ten steps across SuiVision and the Slush extension…" and the social card was made
again from it), and set aside 11, 12, 13, 15, 18, 20, 21 and 22. The team added step 04 "Select the wallet", so the guide
is **ten steps**. **The other twelve (1, 3, 5, 6, 7, 8, 9, 10, 14, 16, 17, 19) were fixed the same day at the user's
word** ("okay fix everything"): step wording, links and Watch notes, Time 5, the surfaces as "On suivision.xyz" / "In the
Slush extension" (new select options — the old two stay in the schema), and the shared close line, now "Rewards start
once your stake is active. Next up: {next}." for every guide (guide.js's fallback says the same from the next release).
Old values: `backups/sui-guide-fixes-2026-09-29.json`. **The review file still lists them as open ON PURPOSE**: the user
shared it with a teammate to go through his mistakes and will say when it can be marked done — do not update
`notion/sui-guide-review-2026-09-29.md` before that.

Slush (Mysten Labs' own wallet, formerly Sui Wallet, first on sui.io/get-started) replaced Suiet in the Sui
guide on 2026-09-28, at the user's word, before the new captures exist. **Done:** Slush is a Wallet Set row
(`3e9e800a…81ba…`) with its glyph, made from the icon in `@mysten/slush-wallet` (a badge: light mark on a
#0C0A1F disc) by `scripts/make_glyph.py` (the design project's pipeline, identical to the brand kit's;
`scripts/GLYPH-SPEC.md`); the guide's row (`1f9e800a…8064…`) has Wallet Set → Slush, Title "Stake SUI with
Slush", Lede and `meta:description` "Thirteen steps across the Slush extension …" (old values in
`backups/sui-guide-row-2026-09-28.json`); the Sui chain page's button reads "Delegate with Slush"
(`notion/chain-pages.json`, `chain_pages.py --buttons "Sui"`; Ika's guide stays on Suiet); the social card
is regenerated. **Still to do once someone captures Slush** (its web app is blocked from India — the
extension or the phone app): rebuild the guide's own slide database in the new design, as Axelar's is —
one row per step: Name ("01 · …"), Step, Body, Watch, Surface, Link, the capture as Cover
(`notion/guide-screenshots.md`) — then set the row's Step, Time and the Lede's count, re-run
`python3 scripts/og_cards.py guides --only sui`, and refresh. Until then the page is the thirteen Suiet
screens. Slush's link that opens "Stake with Encapsulate" (`my.slush.app/staking/native-stake?validatorAddress=…`)
is unverified — test it on a phone before using it on the button.

## TODO — the GitHub Actions (planned 2026-09-25/26, mostly built 2026-09-30 — see "site-data" above)

**The whole plan is `notion/github-actions-plan.md`** (rewritten 2026-09-27 as one document, and
corrected the same day): what the user asked and what was answered, **the inventory of everything on
the site that changes** (section 2 — verified by a scan of the live pages on 2026-09-27: what needs
updating by hand, with its value, what keeps it today and how it drifts; what already keeps itself
current; and four things fixable without the jobs), how the jobs work, the structure, the build order
and the decisions. Until it is built, values are updated by hand. When the user asks what numbers on
the site need updating, answer from section 2 — and check it against the live site first.

- **Decided (2026-09-25):** **JavaScript on Node**, plain ES modules, no TypeScript — chosen after the
  library research the user asked for (first-party JS libraries for every chain family; none current in
  Python for Avalanche, Mina, IOTA, Ika); **a new private repo, `site-data`**, for the jobs, while this
  repo stays public for jsDelivr; the logic in scripts, each Action only a scheduler; Notion the only
  thing written; logs that say almost nothing, details in a private summary; a decisions list so a
  check never re-argues a settled case (Gravity Bridge's 0). "1882" stays (2026-09-26).
- **The 2026-09-25 evening answer drifted back to Python in this repo**; the plan file records that and
  follows the morning's decisions. Do not repeat it: the language and the repo are settled.
- **Open, before any code:** where the private summary goes; whether the research notes move to
  `site-data`; which fields are written and which only reported (Status); **rotate the Notion token
  first**; new vote rows live or held, with whose rationale; public endpoints or our own nodes.
- **Remind the user of this when they ask what is left to do.**

## TODO — check every line break against its handoff (asked 2026-09-26, not started)

Go through every page and template the designs cover — the pages the navbar and footer reach, and
the post, guide, chain and legal templates — and compare each text's line breaks with its handoff.
Wherever the page breaks differently, find the cause and put the handoff's measure back, by the rule
of 2026-09-26: **keep the handoff's `ch` cap; drop one only when it is very small and the text
already sits in a narrow column.** The caps below were dropped under the older, blanket rule.

- **How:** render the handoff (`get_file`) and the live page at the handoff's own width in headless
  Chrome; for every text read its lines (`Range.getClientRects()` on its text, the word ending each
  line) with its computed `max-width` and `text-wrap`, and list every text whose lines differ. Then
  again at 1440 and 390.
- **Dropped caps to review first:**
  - homepage Why Stake 49a — the lead, and the cards' body and captions (home.css: "texts run the
    full width (user rule)", "no forced line breaks (user, 2026-09-15)"). The 2026-09-15 complaint
    was about these, so they may be the narrow-column exception — decide against the file;
  - homepage governance 37h lead (the file's 50ch) and Services 42m lead (home.css, "user rule");
  - /services — every body and lead text (services.css head: "no `ch` caps on body or lead text";
    the ask's lead takes half the row instead);
  - the homepage Audience split 51l, also named in the 2026-09-15 complaint.
- **Also check:** main.css §06 sets `text-wrap: balance !important` on every Notion heading, which
  the files mostly do not draw — it moves a heading's breaks on every page; and each heading whose
  break was set with an em max-width (the /services display sentence and ask heading, 10.56em)
  against the break the file shows.
- **Report** per page: the text, the file's break, ours, the cause and the fix, before changing it.

## TODO — the newsletter (removed 2026-09-21, to be rebuilt)

"Subscribe to newsletter" and its form were removed from the blog index and from all forty posts
at the user's request: they are not in the *Blog Post Page* design and the embedded form was the
old Tally one. When it comes back it should be a Notion form (main.css §13b renders those
natively) in one place, not a block copied into every post.

## TODO — the Services tiles come from the menu, not the page (agreed 2026-09-22)

**Half done (2026-09-23):** /services now has the Dashboards table (name, address, link,
capture), so "Dashboards" can carry the design's "Live now" list read from it; the other three
tiles still come from the menu.


The navbar's third column for "Services and tooling" is the only one not read from its page: the
four tool tiles are the Services group's own section links (`navbar.js` `build()`, `tools`),
because the built /services page has no database of tools to read — only eight old `h2` sections.
When /services is redesigned, give it a tools gallery (name, link, capture) and read that block by
id in `READ["/services"]`, the way every other row is read, so the column cannot drift from the
page. The four `img/nav-panels` captures would then come from that gallery too.

## Open items

- /services, /investments, /brand, /blog, /guides were still served with site Head v55 at the last
  check (needs Super republish); /networks needs `head/networks.html` (network.css v54).
- Homepage "View Voting History" and "View All" are purple (primary) beside a primary "Book a call";
  the design wants Default (tertiary). Offered, not done.
- Each page CSS file still has old `#block-… strong {Arial Black …}` title rules and old sub-heading
  rules; dead once titles are un-bolded — optional tidy-up (remind the user).
- Page CSS overriding the Card System: contact-us.css (black ring + hard shadow), guides.css
  (padding 0, image-only tiles), investments.css (radius), governance.css (old pastel cards).
- **Governance properties renamed (2026-09-17, done):** Chain → **Network**, Proposal Title →
  **Proposal**, Proposal Id → **Reference**, Vote Option → **Our vote**, Voted On → **Voted on**,
  Voting Proof → **Proof** (Rationale kept). The header labels are what `governance.js` and
  `home.js` read to tag cells, so both maps accept the old and the new names. `scripts/gov_*.py`
  use the new names.
- Notion content still owed: 3 more networks (to 28), "Six years" → "Since 2020", Why Stake card
  preview None. Stat card says 28 networks, the fork panel 38.
- Cover second buttons link to database pages (e.g. `/a148eb7f…`); switch to same-page anchors if
  the user prefers.
- Networks cover glyph URLs are hardcoded in covers.js; could read the /networks gallery instead.
- Mobile layout of the covers (field below the text under 800px) is not verified.
- **Found open by the audit of the session log on 2026-10-08** (each checked live that day):
  - `head/home.html`'s JSON-LD description still reads "Validator infrastructure for new chains, from the first testnet
    through mainnet." — not the agreed profile description (offered 2026-10-05, not answered).
  - covers.js's fallback glyphs for Avail, Althea, Ika, Espresso and Gitopia (`encGlyphs()`, ids `2671f960…`,
    `0f5ad2ad…`, `3420a833…`, `28c3a599…`, `16f82770…`) are the old files, none of them on /networks any more; point them
    at the set's current Covers (promised 2026-09-25 "once /networks is republished").
  - The navbar's Dashboards preview (`img/nav-panels/`) was exported mid-animation — the Solana frame shows through the
    Aptos one; it wants a re-export from a still frame (asked 2026-09-24).
  - Super's navbar CTA still reads "Book a Call"; the design writes "Book a call" (optional; Super → Navigation, the
    user's to change).
  - Gno.land's testnet row has no Status, where the other testnet-only chains say "Not launched yet" (asked 2026-09-26).
  - The record keeps two partial rows on purpose (2026-09-25/26): Sui #1 (NO, no title, no date — beside the complete
    Sui #1 row, YES, "Cetus Hack - Freezed Funds Rollback") and an undated twin of Omniflix #55. They need their data or
    deleting.
  - NEAR: Meteor shows 3.96% a year on every pool while our chain page shows 5.0% after our fee (2026-10-05) — a reader
    who uses both may ask.
  - **DATA** (Data Network, the Data Foundation, datafdn.org — not Streamr) has its glyph ready, `44-data.png`/`.svg` in
    the design project's `network-glyphs/` and `~/Downloads` (2026-09-23), for when it becomes a Networks set row.
- **A question for the user** (2026-09-28, not answered): the SEO section's "Driving Super without its UI" describes
  how Super's dashboard API is reached, in this public repo — whether to move it to private memory, as the paste steps
  were.
- Refresh the Notion integration token, and rotate the Blockberry key in site-data (both shown in chat once; the user
  asked not to be reminded — 2026-09-30).
- Search and sort controls for a gallery are possible but unbuilt: Super ships no search snippet
  (its "dynamic database filters" are roadmap), so an input plus reordering of the rendered cards
  would be ours. Sorting alone can be done with extra Notion views and the view picker.
- The booking drawer is designed in `demo/booking-compare.html` but **not** on the site — the user is
  sending a drawer design first. Every "Book a call" opens https://cal.com/aditya-encapsulate/30min
  in a new tab meanwhile.
