# /services

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## /services (2026-09-23, design *Services Categories Chosen*)

Everything under the cover was deleted on 2026-09-23 (the old column lists: Governance Alerting,
Network Visualization, Celestia Node Health Checker and PFB Submit UI, Faucet Bot, Aptos Validator
Geographical Distribution, Super Sui, Protocol Level Dashboard, Custom Discord Bots, their images
and "Contact Us" buttons, and the Playbooks heading and paragraph). The page is now, in Notion
order: the cover, then six **band callouts** — each a Heading 2, texts and button callouts — with
an **inline database after four of them**, then a **"Services page copy" toggle**:

| Band callout | What it holds | Database after it |
|---|---|---|
| Dashboards `3e4e800a…81cf…` | H2, line (not drawn since 2026-10-21), the ask's H3 "Want one for your chain?", "Ask for a scoped view" (→ /contact, the user, 2026-10-21: "should open contact us page"; it was the cal.com booking), "What we have built" | `Dashboards` — Name (the chain), **Tool** (Tidemark), **Kind** ("reference gas price"), Address, Status, Description, Link, Menu (the navbar's line), **Capture** (the 1400×788 @2x shot), **Glyph** (the disc's mark), Order |
| Playbooks `3e4e800a…8171…` | H2, line, then the seven steps as **Heading 3 + text** pairs | — |
| Repositories `3e4e800a…81f4…` | the mono label, the paragraph, "All repositories on GitHub" | `Playbooks` — Name, Repository, Visibility (Public/Private), Description, Link (public only), **Glyph**, Order |
| Bots `3e4e800a…8159…` | H2, line, "Chain", "Discord", "Add one to your server" | `Bot events` — Name (the pill), Event, **Earlier** (two log lines, one per line), Headline, Detail, Glyph, Order |
| Monitoring `3e4e800a…8115…` | H2, line, the sentence with `___` for the hole, the resting line, two buttons | `Monitoring builds` — Name (the word), Repository, Description, Link, Order |
| Ask `3e4e800a…8156…` | H2, lead, "Your chain", Book a call, All networks | — |

`services.js` (site head) finds each band **by id**, reads the table after it **by header
labels**, and sorts by **Order** — Super serves the rows newest first. The tables are API-made
table views with every property shown, so nothing has to be switched on; **a table turned into a
gallery would stop being read**. Each built band is inserted right after its callout and the
callout is folded to no height (`[data-enc-anchor]`), not hidden, so `/services#block-<callout>` —
the navbar's section links and the cover's "See services" — still lands on the band.

- **Numbers** 01–04 are derived from the order of the headed bands; the repositories' big count is
  the row count. The ask's lead starts with the number of chains in the set, spelled; the script
  rewrites that first word from the set, so the Notion line reads right on its own ("Thirty-six").
- **The ask's tiles are a linked view of the Networks set** placed anywhere on the page (the user
  adds it — the API cannot create a linked view). It is found by content: the collection whose
  rows carry a tier. One tile per chain name, sorted by Order, sized by Tier (god 3, high and
  medium 2, low and filth 1). Without it the "Your chain" card stands alone with the link under it.
- **The packing is the design's exact-rectangle algorithm**, which it checked for 8–30 columns. A
  window past ~1800px lands on counts with no exact fit, so `pack()` retries one column fewer
  until one packs — tested for every width 300–2600 in Node.
- **Deviations, on purpose:** no `ch` caps on body or lead text (the ask's lead gets half the row);
  the display sentence and both ask headings keep the design's 16ch as **10.56em** (Outfit 600's
  `0` is 0.66em).
- **The Bots band's link is "Contact us for a bot" → /contact-us** (the user's wording, 2026-09-23);
  the design's "Add one to your server" pointed nowhere.
- **Gno.land is Order 33** in the Networks set (Pell 34, Spicenet 35), with no Tier, so it is a
  1×1 tile. The ask's tiles read a **gallery** view of the set on /services, sorted by Order, whose
  cards show Tier and Order.
- **Kept as drawn:** the tertiary link sits 6px above a primary beside it (the design's tertiary
  carries `alignSelf: flex-start` inside a centred row), and "See it land" shows the previous
  event's card dimmed while the new one flies — on the first press that is the third event.

## 01 · Dashboards — two grounds (2026-10-21, design U in *Services Categories Chosen*)

The zoom of 2026-09-23 was replaced by the design's **U, "Two grounds"** (ported from *Dashboards Section*). Three
tools, each a row of the Dashboards table: **Tidemark** (Sui, tidemark.sui…), **Crux** (Solana, crux.solana…),
**Holdfast** (Crosslink, holdfast.crosslink…). The **Aptos row was archived** (it is in
`backups/services-dashboards-2026-10-21.json` with the table, the callout and the toggle as they were); the old
hosts rgp.sui and graph.solana redirect to the new ones.

- **The run** (760px up, motion allowed): a sticky 100vh stage, (100 + 150 × (n + .7))vh tall, on ink. Per tool,
  first its **disc** alone in the middle — the Glyph on the tool's pastel, "Sui · reference gas price" (Name ·
  Kind), the Tool at 56px, the Description, the Address — over a 64px hairline grid; then the **paper slides in**
  to the middle, the capture rises from the bottom on the seam, "The chain" + the chain's name on the ink and
  "The page" + the tool's name on the paper, at min(10vw, 16vh), "Open Tidemark" in the paper's corner. After the
  last tool, the ask over the grid. `uFrame()` is the design's arithmetic, pure (tested in Node).
- **It snaps** (the design's `useUSnap`, ported line for line as `uSnap()`): frames at 0, .68, 1.14, 1.68, 2.14,
  2.68, 3.7 of n + .7; one wheel turn, swipe or arrow key moves one frame in a 750ms sine glide; the swipe that
  carries the page in lands on the first or last frame; a new scroll at either end leaves. A pill goes to its
  tool's split. Its window listeners are removed when the band leaves the page (`live.stop`).
- **The Visit pill**: over the board the mouse pointer becomes a "Visit" pill. **Deviation:** the design keys its
  colour by tool (Tidemark light, Crux dark, Holdfast split down the middle); here each capture's columns are
  measured once from a 128px same-origin copy (`/_next/image`) and the pill is paper over a dark column, ink over a
  light one — the three come out as the design's table does (checked with real pointer moves), and a new tool
  needs no entry.
- **The reel** (under 760px, or reduced motion — the design's own fallback): eyebrow and pills, the capture full
  width, the credits, Open, then the ask on its own ink. **Deviation:** the credits' "Crosslink ·
  holdfast.crosslink.encapsulate.xyz" may wrap; on one line it ran past a 320px screen.
- **Words**: everything is Notion's — the band's H2 makes the eyebrow ("01 · Dashboards"), its H3 and buttons the
  ask, the rows the rest; "The chain", "The page", "Visit", "Open {tool}", "Choose a dashboard" and the aria lines
  are the copy toggle's.
- **Every image is the design's own, from the zip the user sent** (`~/Downloads/Encapsulate Website.zip`,
  `handoff-dashboards-section/`, 2026-10-21 — the user: "you will find all the images and glyphs here, use these"):
  `panels-hires/tidemark-sui`, `crux-solana`, `holdfast-crosslink` (2800×1576, 1400×788 at 2x, taken 2026-10-19,
  shown whole in a 1400/788 frame) as each row's Capture, and `network-glyphs/03-sui`, `42-solana`, `45-crosslink`
  (600×600, black on transparency, the Shielded Labs shield for Crosslink) as its Glyph. Tidemark first went up as a
  newer capture of 2026-10-21 from the Downloads folder and was put back to the design's the same day. When the
  design ships a zip, take the files from it: `get_file` cuts a binary at 256 KB.
