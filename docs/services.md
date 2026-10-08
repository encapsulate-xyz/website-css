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
| Dashboards `3e4e800a…81cf…` | H2, line | `Dashboards` — Name, Address, Status, Description, Link, **Capture** (the 1400×788 @2x shot), Order |
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
  the display sentence and the ask heading keep the design's 16ch as **10.56em** (Outfit 600's
  `0` is 0.66em); under reduced motion the dashboards still follow the scroll, only without the
  zoom (the design pinned the last board, which left the pills dead).
- **The Bots band's link is "Contact us for a bot" → /contact-us** (the user's wording, 2026-09-23);
  the design's "Add one to your server" pointed nowhere.
- **Gno.land is Order 33** in the Networks set (Pell 34, Spicenet 35), with no Tier, so it is a
  1×1 tile. The ask's tiles read a **gallery** view of the set on /services, sorted by Order, whose
  cards show Tier and Order.
- **Kept as drawn:** the tertiary link sits 6px above a primary beside it (the design's tertiary
  carries `alignSelf: flex-start` inside a centred row), and "See it land" shows the previous
  event's card dimmed while the new one flies — on the first press that is the third event.
- **The three Captures are the design's own frames** (`exports/dashboards/dash-*.png` from
  Claude Design, 2800×1576, sent 2026-09-23): the dashboards redrawn in the brand with a browser
  bar carrying the address and LIVE. They replaced the raw headless shots of the live sites
  (`img/shots/dash-sui.png`, `dash-solana.png`), which stay in the repo as records; Aptos could not
  be shot headless at all — its map is WebGL and renders black.
