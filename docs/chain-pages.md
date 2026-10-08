# The chain pages

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## The chain pages (2026-09-24, design *Chain Page Combined*)

Every **mainnet** row of the Networks set is a Notion page, and since 2026-09-24 each has a path
of its own in Super: **/networks/&lt;chain&gt;** since 2026-09-28 (it was /networks/mainnet/&lt;chain&gt;; see
"Paths") (avalanche, lido-dvt, monad,
near, sui, axelar, cosmos-hub (2026-10-05), eigencloud, iota, mina, starknet, terra, zilliqa, avail, espresso, ika, supra,
vara, agoric, althea, gitopia, gravity-bridge, humans, ixo, lumera, passage, sommelier,
chain4energy), each pointing at the row's share URL. `/<row id>` 307-redirects there. Added from
the automation tab (the user asked); the Super editor loads slowly (15–45 s) and coordinate clicks
stop landing after the window changes — what worked was JavaScript: expand the rows by clicking
their `.lucide-chevron-right`, `.click()` the last "Add sub-page", focus each input and type with
real keys, `.click()` "Create page". **Giving the rows paths changed Super's markup:** a set card
is now `id="block-networks-<chain>"` with a `.notion-collection-card__anchor` link, not
`block-<row id>` with `.no-click` — anything that reads a card's row id must accept either.

**Where everything comes from** (nothing is typed in chain.js):

| What | Where |
|---|---|
| The figures (rate, commission, unbonding, slashing events), the address, explorer, glyph, token, since, compounding, validators run | the row's **properties** — Super renders none of them on the row's page but embeds all of them in its data (`self.__next_f.push` scripts: `propertySort` names them, `propertyValues` holds them, beside `"blockId"`). chain.js decodes that; after a client-side navigation it fetches the page once |
| The line under the name, the buttons, "What we run" (a two-column table), the five questions (Heading 3 + paragraph) | the **row page's own blocks**, written by `scripts/chain_pages.py` from `notion/chain-pages.json` |
| The words every chain page shares (band names, figure labels, captions, the estimate's lines) | the **"Chain page copy" toggle on /networks** (`3e5e800a…81d484b8…`), hidden there by chain.css |
| A chain's own words where the shared ones are untrue (Lido's fee, Avalanche's staking period, Mina's and Zilliqa's reward lines) and the Lido validators band | the row page's own **"Chain page copy" toggle**, which overrides the shared one key by key |
| The other chains (the drifting pills) and each page's tint | the set's view on **/services** (it shows Tier, Stage and Order): god, high and medium tiers, Order-sorted; the tint is the chain's position in that order, the same pastel as its /networks card |

**No raw Notion before the build.** chain.js runs deferred, after the first paint, and Super's
hydration strips its attribute once more before it settles — the raw blocks showed twice (437ms,
and again at 664 before the build at 967). chain.css hides them from the first paint by the class
Super server-renders on every chain page, `.super-content.parent-page__networks`, with a
5s `visibility` reveal in case the build never comes. The shared words and the chain list live in
localStorage (`enc-chain-copy`, `enc-chain-list`), used at once and re-read in the background
past half an hour, so a repeat visit is built at ~140ms.

**The dock** rises once the hero has gone and slides away as the last band's foot reaches the
viewport's (`hero.bottom < 80 && last.bottom > innerHeight − 8`), so it never lies over the
footer; the last band carries `[data-enc-last]` (handoff, 2026-09-24).

**Page id.** Super names the page after its path (`main#page-networks-monad`, class
`parent-page__networks`), so chain.js finds the row id in the page's data by `"uri"`.
Only a page under /networks or a bare row id is looked at, so other pages cost nothing.

**Decisions made against the file** (all reported to the user, 2026-09-24):
- The rate is **after our commission** (the row's Reward rate, as researched), so the caption says
  "After our commission" where the design says "Before", and the estimate does not take the
  commission off again. The estimate is `stake × rate` per year for every chain — the rates are
  measured yields, so compounding them again would overstate.
- The slashing caption is "No slash since we joined. A slash would break this line" (the design's
  "Signed every day since launch" is not true everywhere — Avalanche's node missed three months),
  and a chain that cannot slash says so ("{chain} does not slash stake. The line cannot break").
- The Lido band sits **after the hero** (the file shows it first, above its own note).
- **The buttons (the user, 2026-09-24):** the green one is **our own guide** for that chain —
  "Delegate with <the guide's wallet>", linked as the guide's Notion page so Super writes
  /guides/<chain> — and the gray one is **"Our validator"**, the row's Explorer. Lido,
  Vara and Chain4Energy have no guide and keep an external staking link (stake.lido.fi, the Vara
  dashboard, DTEAM's ping.pub-style explorer with Keplr). No REStake anywhere: Passage's and
  Sommelier's explorer is Keplr's validator card (Mintscan dropped both; ping.pub, stavr and
  explorers.guru did not show them). Gitopia's ping.pub loads without the validator's data.
- **Headings are stated with !important.** minima sets every heading's size, weight and tracking
  that way — the name measured Outfit 800 at 48px and the band headings 500 at 35.2px until v266.
  Check computed styles against the file whenever a script builds an h1–h3.
- **The marquee runs the window's width**: it starts one gutter left of the content column. The
  design's `left: 50%; margin-left: -50vw` centres on the parent, which here is the 1280px column
  set against the left padding, so it stopped 270px short on a 1920 screen.
- The address ring repeats a short address more than twice so it is not stretched thin; a value
  that is not an address (Lido's "Simple DVT node operator #43") is not a copy button.
- "Since" is the **current** validator's start (Axelar, Agoric, ixo and Sui ran older validators).
- Avalanche's calendar draws the shortest period (2 weeks); a year would be 53 rows.

**The research** (six agents, 2026-09-24) is in `notion/chain-pages.json` per chain: cadence,
minimums, downtime rules read from each chain's own params, unbonding, wallet deep links (loaded
where possible), sources and notes. Explorer links for Passage and Sommelier (Mintscan dropped
them) now point at REStake; Chain4Energy at explorer.stavr.tech.
