# Paths and the 404 page

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## Paths (2026-09-28) — no /mainnet, and the 404 page

**The chain pages are /networks/&lt;chain&gt; and the guides /guides/&lt;chain&gt;** (the user, 2026-09-28: "remove
the mainnet subpath"). They were /networks/mainnet/&lt;chain&gt; and /guides/mainnet/&lt;chain&gt; — pages Super
nested under a folder page each (the Networks set database at /networks/mainnet, and two pages of
linked views, "Mainnet" and "Testnet", under /guides) whose listings were raw Notion. The 59 pages were
moved in place (`updateSitePage` path; each kept its SEO title and page code), the three folder pages
and the one testnet guide (Zilliqa: Super page removed, Notion row in the trash, copy in
`backups/zilliqa-testnet-guide-2026-09-28.json`) removed from Super. **Every old address 308s to its new
one** (64 redirects: the 59 pages, /networks/mainnet → /networks, /guides/mainnet and /guides/testnet and
/guides/testnet/zilliqa → /guides, /networks/mainnet/sommelier-finance → /networks/sommelier). They were
added the same day, once the site went to **Super Pro** (the user upgraded for them; Personal refuses
redirects) — through the API, `type: "permRedirect"` pages. The other 2024 chain URLs (solana, celestia,
osmosis… chains we no longer run) and /networks/testnet/* stay 404: no page stands for them.
A database page in Super also serves its rows by slug under its own path, so the old URLs kept
answering until /networks/mainnet was removed; each removed URL is served stale once more, then 404s.
The code accepts both shapes (v324): chain.css/chain.js know a chain page by `parent-page__networks`
(or `-mainnet`), guide.js takes `/guides/<chain>`, guide.css `[class*="parent-page__guides"]`,
network.js reads `/networks/<chain>` links, og_cards.py lists chains under /networks/.

**Renamed on 2026-09-28** (the user's review of every path; each old address 308s to its new one, and the
code accepts both — v328): /governance-record → **/governance** (its database page →
**/governance/votes**, noindex), /contact-us → **/contact**, /blog/agorictest-17-analysis →
/blog/agoric-testnet-17-analysis, /blog/monad → /blog/monad-l1-scaling, /guides/eigen-layer-lst →
/guides/eigen-layer-steth, /networks/humans and /guides/humans → humans-ai, /blog/zilliqa2 →
/blog/zilliqa-2-launch, /blog/arc → /blog/arc-network, /blog/double-zero → /blog/doublezero. **Super moves a
page's children with it** (the record's database page became /governance/governance-record, then was moved
on). The navbar's Governance and Contact links were typed addresses (`type: "url"`) and were updated through
`updateSite({navigation})` — the whole navigation object, read back identical but for those two; the footer's
links are page references and followed by themselves. Three typed links in Notion that went through a
redirect were updated (/investments' Send the spec, the record's empty-state and count-band links, an image
caption in the Solana post). A sweep of every internal link on the 113 pages then found none through a
redirect and none broken.
**The Guides database lost Cover and the View More sections (2026-09-28).** Cover held the old "Staking Guide"
thumbnails (the pre-rebrand card design; Sui's still showed Suiet) and was shown only in the "View More Guides"
grid at the foot of the guides not yet redone. That section — an empty paragraph, the heading, a linked view of
the Guides data source (`1f6e800a…8164…57da`, checked on each live page) and a column list holding a "View More
Guides" button to /guides — was deleted from 30 guides (120 blocks, `backups/view-more-guides-2026-09-28.json`),
then the property (its 32 images in `backups/guide-covers-2026-09-28/`). The guides end at their own content;
the navbar and the footer reach /guides. **Ticker** on the Guides database was read by nothing and was deleted on
2026-10-01 (values in `backups/guides-ticker-2026-10-01.json`); the ticker in a guide's Title ("Stake MON with
MetaMask") is typed by hand — no job writes Title.
**The picker falls back to a guide's Name when its Networks set is empty** (guides.js `read()`), so a guide named
"Stake … with …" (the template's pattern since 2026-09-28) must have its Networks set.

**Proof links:** 23 record rows (Axelar 348–369, Umee 187) linked "View Txn Hash" to private Notion pages
(404). The votes' transactions are gone from every public source (the nodes keep about a month; Axelarscan
keeps no votes of ended proposals), so each now reads "View proposal" and links the proposal on Mintscan
(old values in `backups/governance-proof-links-2026-09-28.json`).

**The 404 page** (design *404 Page*, "D · the finder", v325–v326). **/page-not-found is the site's custom
404** (Super Pro: `custom404PageId`, set 2026-09-28). Super shows it in a **full-screen iframe** over the
missing address, which keeps its 404 status; inside the frame it is an ordinary page, every script runs,
and notfound.js builds it with the **outer window's address** ("framed" mode): links, the finder's Enter
and any route change inside the frame go to the outer window (`leave()`, a capture-phase click handler,
since Next's router would route inside the frame; cal.com links stay for the drawer), and the tab takes
the page's title. Without the setting, every unknown address renders Super's own
`.super-error.super-error__not-found` ("This page doesn't seem to exist. Click anywhere to go back.")
between the bar and the footer; notfound.js then draws the design beside it and `notfound.css` hides it
(and, from the first paint, its text — shown again after 5s if nothing builds). Either way it draws:
the eyebrow, "Nothing at this address.", the lede, Book a call and Go to the homepage, the hollow 404
with its two notes (hover a part or its note and the pair lights), and the finder — the address's own
words already in the search field, searched against every page and every network (typing anywhere
focuses it; ↑↓, Enter, Escape).
- **Every word is on the Notion page "Page not found"** (`3e9e800a…814e8cfc…`, a child of Home, served at
  /page-not-found with a noindex head and the SEO title "Page not found - Encapsulate"): in order the
  eyebrow's two texts, the Heading 1, the lede, the two button callouts, the notes (tag, line, tag,
  line — `{path}` is the address), the finder's label, and a **"404 page copy" toggle** (hidden by id in
  notfound.css): `key · value` lines for the finder's words and a table **Page | Path | Words | Line** —
  the pages it finds, the words that find them and the line under each. A 404 carries none of those
  blocks, so the page is fetched and kept in localStorage (`enc-nf-copy`, read again past half an
  hour); FALLBACK in notfound.js is the design's words for a first visit before that arrives. The
  networks are the set's own (`encCounts().list`): a mainnet opens its chain page, a testnet-only chain
  /networks. On /page-not-found itself the design is built from the page's own blocks, with the
  design's example address, /staking-with-us.
- **On Super's own 404 (the setting off) it runs none of the site head's scripts.** It puts the head only into React's payload,
  and React renders `<script defer>` without running it (measured: no script of ours requested, only
  the stylesheets) — the bar was bare, the footer Super's own list. React 19 does load a `<script
  async>`, so **notfound.js is the one async script in the site head**, and on a 404 where navbar.js
  has not run (`!window.encNav`) it inserts every other website-css script again, in order (`async =
  false`): the bar, the footer, the booking drawer and the counts come back. Keep it async.
- **The finder's search is the design's revised one** (v327): each entry's own name words and weaker
  synonyms (a page's Words at .8, a network's generic words at .35), exact 1 / start .85 / overrun .7 ×
  share / typo .6 (OSA distance), results within half the top score, "Closest matches · N results" when
  nothing matched outright (the copy toggle's `closest` line). Checked against the design's own code on
  21 queries in Node: same results, same order.
- Deviations: the design's "Book a call" went to /contact-us — ours opens the drawer, as every Book a
  call does; its Governance page is /governance, ours /governance-record.
