# website-css

Custom CSS and JS for the Super.so (Notion) site at https://encapsulate.xyz. Designs come as Claude
Design handoffs (project `9da1c502-69a5-4e9f-9b05-9b435acb854b`, read with the DesignSync tool,
`get_file`) and are implemented section by section, verified on the live site.

**The validator business is not here** (split on 2026-10-08, the user: "we have merged two big things into this one
claude session"): the L1 openings page and its research, every validator profile and the profile tracker, the agreed
profile description, and the notes on single networks (Cosmos Hub's delegation programme, Zcash, Canton, TRON, the
watch list) are in **`~/IdeaProjects/validator-research`** (private, github.com/encapsulate-xyz/validator-research),
with its own CLAUDE.md and its own Claude session. Do that work there, not here. They meet in two places: a chain we
start validating (that side decides it and takes it off the L1 page; this side runs the new-chain checklist), and a
commission changed by a profile edit (the site's rate follows; see "The Discord invite, and commission changes").

## The notes, by subject (split out 2026-10-08)

This file holds what every task needs. **Each page's and system's notes are in `docs/`** — the handoffs, the
decisions, the measurements, the traps — moved there as they were on 2026-10-08 because this file had grown past
Claude Code's 150k-character limit for a CLAUDE.md (it was 228k). **Before working on a page or a system, read its
file.** A section a code comment or a note names ("see CLAUDE.md, …") is in the file this table gives. A new
note goes into its subject's file, not here; only a rule for every task belongs in this file.

| File | Read it before working on | Its sections |
|---|---|---|
| `docs/navbar.md` | the bar, its panels, the compact bar and the panel search (§04 + navbar.js) | The navigation bar |
| `docs/main-css.md` | the Button and Card Systems, page covers, one-screen bands, the footer and the article blocks | Buttons, cards, covers, bands and the footer; Article blocks — the four generic Notion blocks; A page that ends in a band runs into the footer |
| `docs/homepage.md` | home.css, home-dial.css, home.js | Homepage |
| `docs/networks.md` | the Network Count band and its lens, the set, its values | The Network Count band; The Networks set; Done — the Networks set's rates are real |
| `docs/filter-bar.md` | filterbar.js, main.css §13c, the recipe it follows | The filter bar — one component on three pages; Search and sort on a Notion gallery — the working recipe |
| `docs/chain-pages.md` | /networks/<chain>, chain.css + chain.js | The chain pages |
| `docs/guides.md` | the guide page, its link to the chain page, the /guides picker | The guide page; A guide links its chain page; The guides picker |
| `docs/blog.md` | /blog/<post>, post.css + post.js | The blog post page |
| `docs/governance.md` | the record page's last two sections, how the record is filled | The governance page's last two sections; The governance record — how it is filled |
| `docs/services.md` | services.css + services.js | /services |
| `docs/security.md` | what the page's claims rest on | /security — what its claims rest on |
| `docs/investments.md` | investments.css + investments.js | /investments |
| `docs/legal.md` | /privacy-policy and /terms-of-use, legal.css | The legal pages |
| `docs/brand.md` | the colour band's three sets | The brand colour band names three sets |
| `docs/booking-and-contact.md` | booking.js, main.css §18, the dial in the contact fold | The booking drawer; The contact band's fold holds the dial |
| `docs/paths-and-404.md` | the paths, the redirects, notfound.css + notfound.js | Paths — no /mainnet, and the 404 page |
| `docs/seo.md` | how Super sets it, what is set, the SEO job | SEO; The SEO job — every database row's card, title, description, and four content properties |
| `docs/site-data.md` | the private repo whose scheduled jobs write Notion | site-data — the jobs |
| `docs/audit.md` | the phone work and the full-width audit | Below 900px; The audit of 2026-09-26 — every page the navbar and footer reach, 320–2560 |
| `docs/todo.md` | every TODO and the open items | TODO — run both governance jobs from a GitHub Action; TODO — a GitHub Action to fill the APY property; TODO — the Networks set's open values; TODO — three chain pages still point outside the site; TODO — the Sui guide moves to Slush; TODO — the GitHub Actions; TODO — check every line break against its handoff; TODO — the newsletter; TODO — the Services tiles come from the menu, not the page; Open items |

**On "what's left to do", read `docs/todo.md`.** **React #418 on every page is settled: leave it and do not
raise it again** (`docs/audit.md`).

## How we work (agreed 2026-09-15)

The user shares a design handoff. I:

1. read the handoff carefully (every value — misses were pointed out several times);
2. **edit the Notion page myself** through the API (see "Editing Notion"), so the content is shaped
   for the design;
3. write the CSS/JS in the repo, build, verify on the live page, commit, tag a release;
4. **paste the changed `head/*.html` files into Super myself and refresh every page** — the user,
   2026-09-28: "why dont you do it using claude chrome extension"; the steps are kept in memory
   (`reference-super-dashboard`), not in this public file. What follows is the fallback, for a head
   I could not paste: reply with **one table of what to paste** — `File | Paste into` — listing only the `head/*.html`
   files **whose tag changed in that reply**. A file the user has already pasted never appears
   again: repeating a row makes them re-do work and hides the one file that is actually new
   (asked for 2026-09-21). If nothing was rebuilt, there is no paste table at all.

   The same applies to the **Action table**: before repeating an action, **check whether it has
   already been done** — fetch the page, read the database, look at the live HTML — and drop the
   row if it has (asked for 2026-09-21). An action the user has completed must not be asked for
   twice.

   **Run `python3 scripts/paste_table.py` and copy what it prints** (2026-09-21). It compares
   what each `head/*.html` pins against what the live page actually serves and prints only the
   rows that differ — `--why` adds the commits behind each one. The table is never written from
   memory: the one time it was, /networks was carried into a reply where nothing about it had
   changed, which is the mistake this exists to stop. If the script cannot reach the site, fall
   back to the per-file check below.

   **Verify every row before sending it** (asked for 2026-09-21, after /investments was listed
   twice with nothing in it). For each head file you are about to list, run

   ```bash
   git log --oneline <the tag the user last pasted>..HEAD -- <its source files>
   ```

   and drop the row if that prints nothing. `head/site.html` counts as changed when **any** script
   it carries changed. Do the check as a command, not from memory — the source of truth is the
   diff, not what feels recent. Keep the second column to the name of the target and nothing else: `site`
   for the site head, otherwise the page (`brand`, `guides`, `/networks`). The full
   Settings → Code → Head path is noise; the table below says where each file goes.
5. **and a second table of everything else the user has to do** — `Action | Where | Why` — for
   anything I cannot do from here (set 2026-09-19). Never leave one of these as a sentence in the
   middle of a reply: if the user has to act, it is a row in that table. The recurring ones:

   | Action | Where | Why |
   |---|---|---|
   | Show a property on a view | Notion → the view → view options → Properties | the API cannot switch a view's properties on (Guides Step/Time, the pillars' Word) |
   | Switch a database between table and gallery, or set a view's sort or filter | Notion → the view | same — the API cannot change a view at all |
   | Rotate the integration token | Notion → integration settings | it was shown in chat once |

**The order of work on a handoff (set 2026-09-17):**

1. **Read the handoff first, every time** — including when a section is being revisited. The file
   changes between passes; copy carried over from an earlier version is the most common way a
   section ends up wrong. Check it string by string before saying a section is done.
2. **Put everything the handoff needs into Notion** — texts, headings, buttons, database rows,
   uploaded files. Verbatim: the handoff's words, nothing added, nothing dropped, nothing reworded.
3. **Say what cannot be done from here and needs the user.** The API cannot change a view: it
   cannot switch a database between table and gallery, show or hide a property on a view, set a
   view's sort or filter, or create a linked view. Ask for those explicitly rather than working
   around them in code.
4. **Then implement it verbatim** in CSS/JS, verify on the live page, and hand back the paste table.

User rules that stand on every task:

- **Content stays in Notion.** Never create text, links or buttons with JS unless Notion + CSS
  genuinely cannot produce it, and say so first. Allowed so far: Why Stake derived figures (years
  since 2020, networks count), the footer CTA copy and its glyph list (footer.js), the contact
  Copy button's "Copied" feedback. JS for behaviour and decoration is fine (snapping, glyph
  columns, cover fields, dot pagers).
- **No extra CSS on existing Notion text blocks** unless the section is new or redesigned.
- **Keep the handoff's `ch` caps** (the user, 2026-09-26, refining the 2026-09-15 rule). Drop a cap
  only when it is very small **and** the text already sits in a narrow column, where the cap would
  cramp it further — that was the 2026-09-15 complaint (Why Stake, Services, the Audience split:
  text broken early on purpose). Otherwise the handoff's measure is the design. Headings: when the
  user shows the break they want, set it with an em max-width and `text-wrap: wrap`.
- **Say what was removed** when a Notion edit deletes blocks.
- Commit, push and tag are allowed. Backups before editing any `.css` (below).
- **When something on the site is visibly uneven, fix it and say so — do not report it as out of scope.**
  (2026-09-29, from the navbar's notes.)
- **Make space with CSS, and pair things with Notion columns — never with a divider or an empty paragraph.**
  (2026-09-25, from the homepage's notes, "No divider makes space anywhere".)

## Files

| File | What | Loaded from |
|---|---|---|
| `main.css` | site-wide styles, no `#block-…` ids | site Head |
| `navbar.js` | the bar's panels — design *Navbar 4f Page*; Super still owns the menu — and, under 960px, the compact bar's Menu button and sheet | site Head |
| `booking.js` | the booking drawer — every "Book a call" on the site, except /contact-us | site Head |
| `footer.js` | footer 44b, built inside Super's footer | site Head |
| `covers.js` | inner-page cover graphics ("fields") | site Head |
| `filterbar.js` | the filter bar (design *Filter Bar Patterns*, G · the command field) — one component for /networks, /governance-record and /blog; styles main.css §13c | site Head, before the page scripts |
| `notfound.css`, `notfound.js` | the 404 page (design *404 Page*, D · the finder) — see "The 404 page". notfound.js is linked **async**, the only one | site Head |
| `blocks.js` | Notion's generic blocks (design *Blog Article Blocks*): the code block's line numbers, prompts, colours, kicker and copy tick — the rest of the four blocks is main.css §12–13 | site Head |
| `home.css`, `home-dial.css`, `home.js` | homepage sections, JS-enhanced styles, homepage scripts | homepage Head |
| `brand.css`, `brand.js` | /brand — four spreads with a sticky rail, the marks slab, the colour band (design *Brand Page*) | page Head + site Head |
| `blog.css`, `blog.js` | /blog — the index (design J); blog.js builds each card's cover and its band span, and is loaded from the site head | page Head + site Head |
| `post.css`, `post.js` | /blog/&lt;post&gt; — every post page (design *Blog Post Page*, variant J). A post has no page head of its own, so both are in the site head and scoped by path | site Head |
| `chain.css`, `chain.js` | /networks/&lt;chain&gt; — the 28 chain pages (design *Chain Page Combined*), built from each Networks set row page. Site head, scoped by `[data-enc-chain]` | site Head |
| `notion/chain-pages.json`, `scripts/chain_pages.py` | each chain page's words and facts, researched per chain (sources, notes, how "since" was found), and the writer that puts them into the row pages | — |
| `guide.css`, `guide.js` | /guides/&lt;chain&gt; — every guide page (design *Staking Guide Variation 1d*). A guide has no page head of its own, so both are in the site head and scoped by path | site Head |
| `network.css`, `network.js` | /networks — the Network Count band (the hollow; network.js draws its tally), the set as the Networks Index, 5m. network.js is in the site head | its page Head + site Head |
| `services.css`, `services.js` | /services — four services and the ask under the cover (design *Services Categories Chosen*), built from the page's callouts, four inline tables and a copy toggle | page Head + site Head |
| `investments.css`, `investments.js` | /investments — two bands (design *Investments Page*): the thesis and the running band of positions on ink, the six questions on paper | page Head + site Head |
| `legal.css` | /privacy-policy and /terms-of-use — one template for both (designs *Privacy Policy* and *Terms of Use*); no script | both pages' Head |
| `governance.css` + `governance.js` (the record page: count band, pillars, controls, rows — and the rows of the homepage's governance table, drawn by main.css §13d), `blog.css`, `brand.css`, `contact-us.css`, `guides.css`, `investments.css`, `security.css`, `services.css` | each page's CSS, moved out of Super's page Code panels on 2026-09-15 (old cover rules removed, the rest kept as it was) | each page's Head |
| `svg/`, `img/` | every drawing and icon the CSS references, served from jsDelivr beside the CSS | referenced as `../svg/…` / `../img/…` from `dist/` |
| `notion/page-covers.md` | cover copy for the nine inner pages | — |
| `notion/github-actions-plan.md` | the GitHub Actions plan (2026-09-26) and what runs (since 2026-09-30, in `site-data`): the 37 things that go stale, which ten a job writes, the structure, the build order and the decisions | — |
| `scripts/actions_plan/` | builds the plan as a page (an artifact, "Encapsulate Actions Plan", **paper theme only** — the user, 2026-09-30): `build.py` holds the inventory, the two repo trees, the workflows, the build order and the decisions; `template.html` the page. `OUT=<path> python3 scripts/actions_plan/build.py`, then republish | — |
| `notion/new-row-checklist.md` | **what a new row in each database needs beyond its page** (posts, chains, guides, the rest): its properties, its path in Super, the social card (`og_cards.py`), the fallback numbers and hardcoded lists, what to refresh and what to check. Go through it every time a row is added (the user, 2026-09-28) | — |
| `notion/staked-total-2026-09-29.md` | the stake with our validators on 2026-09-29, per chain, from each chain's own endpoints and CoinGecko prices: $84.8M, the Lido cluster counted in full; the homepage's live figure agreed within 1%. A record only; site-data's stake job cites it as its reference (`config/stake.json`) | — |
| `notion/sui-guide-review-2026-09-29.md` | the review of the Sui guide: the 12 findings still open (where, what it says, what is wrong, a suggested fix), the two fixed, the eight the user set aside | — |
| `notion/guide-screenshots.md`, `scripts/guide_shot.mjs` | how guide screenshots are captured and composed (agreed 2026-09-18; 2026-09-30: a device-mode capture zeroes the scroll of a page whose document scrolls (MonadVision) because Chromium grows the viewport to the page's height for it — two lines of CSS in the console make `body` a 788px scroller and the position survives; a popup window at the frame's size with device mode off, or `guide_shot.mjs hold <tab> dashboard\|wallet`, are the other two routes) | — |
| `docs/*.md` | the notes by subject — each page's and system's handoffs, decisions and traps (see "The notes, by subject" above) | — |
| `build.py` | strips comments into `dist/`, copies the JS | — |
| `scripts/paste_table.py` | prints the paste table from head/*.html vs what the live pages serve | — |
| `scripts/livecheck.mjs` | loads a live page in headless Chrome with pinned tags' files served from this repo (or a pushed commit) — pass every tag the page pins, comma-separated (`v263,v227,v220`), runs a check in the page, optional real mouse, wheel and key steps (`move`, `click` — a real press and release — `wheel(x, y, dy)` and `press(key)`) and a screenshot. The scratchpad copies it replaced were lost on 2026-09-24 | — |
| `scripts/audit.mjs` | audits a live page at many widths (default 16, 320–2560; touch under 835) with every tag it pins served from this repo: sideways scroll and what causes it, text cut by its box, broken images, script errors, failed requests, screenshots per screen (`--shots`), a page check of your own (`--check`). `BLOCK=1` loads the page with none of our files, `ALLOW=a.js,b.js` with only those scripts — how a fault is traced to us or to Super. Built for the audit of 2026-09-26 |
| `scripts/make_glyph.py`, `scripts/GLYPH-SPEC.md` | the glyph pipeline (the design project's, identical to the brand kit's): any logo → pure black on transparency, 600×600, longest solid side 288, centred; modes alpha / inverse / badge; the spec's checks | — |
| `scripts/og_cards.py`, `scripts/og/` | the social cards (og:image) of the database pages — `posts`, `chains` or `guides`: renders each page's card from its own design (`og/post.html` = Blog Cover System 17d, the chain hero captured live, `og/guide.html` = the guide head drawn by guide.css; `og/render.mjs` is the one-tab headless renderer) and attaches it to the row's `meta:image` with its text properties (see "SEO") | — |
| `img/og/` | the one card that cannot live in Notion: the Mina hard-fork post, which is not a Blogs row (set as its image override in Super) | Super's page settings |
| `scripts/guide_steps.py` | the first step of converting a guide: finds a guide by part of its Name, prints its row and every step (Name, Surface, Link, Body, the capture's file name — which is the step's Link), downloads the captures and writes `backups/<guide>-guide-<date>.json`. The whole run is "Converting a guide — the run" in `notion/new-row-checklist.md` (2026-10-08) | — |
| `scripts/guide_check.js` | the live check of a converted guide, for `livecheck.mjs`: built, title, steps in order, how many carry their surface as a link and which do not (2026-10-08) | — |
| `scripts/shots.py`, `img/shots/` | panel captures of the live tools (Sui RGP, the Solana graph), 1100×750 at DPR 2 from headless Chrome — the extension's screenshots time out on those pages, and a WebGL graph needs swiftshader or it comes back blank. Not wired into any page yet (2026-09-23): the tools table that names their tiles arrived cut off | — |

**Edit sources, run `python3 build.py`, commit source and `dist/` together. Never edit `dist/`.**
When a new page CSS file is added, add it to build.py's default list and create `head/<page>.html`.
If the user drops a file into `dist/`, move it to the root as the source.

## Back up before every change

Before editing any `.css` file, copy it into `backups/` (gitignored), one copy per session:

```bash
cp main.css backups/main.css.bak-$(date +%Y%m%d-%H%M%S)
```

Work has been lost before; `/tmp` is not good enough. When reverting, say which backup and what is
lost. Prune old backups once a change is confirmed.

## Serving and releasing

Repo **github.com/encapsulate-xyz/website-css** (public), served by jsDelivr:
`https://cdn.jsdelivr.net/gh/encapsulate-xyz/website-css@vN/dist/<file>`. Always pin a tag, never
`@main` (branch URLs cache for 12h).

1. Back up, edit, build.
2. Verify live: swap the page's `link`/`script` URLs to the commit SHA (`@<sha>/dist/…`) in the
   browser and measure. React may restore hrefs — swap again. **A brand-new tag can 404 on jsDelivr
   for a short while**; a test that loads nothing may just be that (reload the link and check
   `performance` entries). Seen again on 2026-09-24: for the first minutes after v273 the Axelar
   page ran no chain.js at all (no `window.encChain`, no resource entry) and showed its raw blocks
   after the 5s reveal; five fresh loads later all built. `NETLOG=1 scripts/livecheck.mjs …` prints
   every website-css request that fails.
3. **Never move a released tag — cut a new one.** jsDelivr caches per tag, so a moved tag can keep serving the old
   file (v191 was moved twice on 2026-09-21 and is dead; v194 replaced it).
   Commit (with the session's attribution trailer), push, `git tag -a vN -m … && git push origin vN`.
   **`main` has a protection rule since 2026-09-28** (a pull request and one approving review), with
   "enforce for admins" off (the user): a push to main goes through as an admin bypass (GitHub prints
   "Bypassed rule violations"), and a PR is merged with `gh pr merge N --admin --merge`. The PR author
   cannot approve their own PR, so do not wait for a review that cannot come.
4. Bump only the `head/*.html` files whose dist files changed — prove it with
   `git log --oneline <lastTag>..HEAD -- <source files>` before bumping or listing a row — and
   tell the user in a table. Carry a row forward only if that file changed again since they last
   pasted it; an empty log means no bump and no row.

Note: `git commit` also commits anything the user has staged — check `git status` first.

### Head files — what the user pastes

| File | Paste into (replace everything) |
|---|---|
| `head/site.html` | Super → Settings → Code → Head (minima, main.css, navbar.js, footer.js, covers.js, fonts) |
| `head/site-body.html` | Super → Settings → Code → Body (temporary "under reconstruction" banner) |
| `head/home.html` | Homepage → Code → Head (CSS only — home.js is in the site head) |
| `head/networks.html` | /networks → Code → Head (view-picker + network.css; network.js is in the site head) |
| `head/governance.html` | /governance → Code → Head (the page was /governance-record until 2026-09-28) |
| `head/blog.html` | /blog → Code → Head (blog.css; blog.js is in the site head) |
| `head/brand.html` | /brand → Code → Head (brand.css; brand.js is in the site head) |
| `head/contact-us.html` | /contact → Code → Head (the page was /contact-us until 2026-09-28) |
| `head/guides.html` | /guides → Code → Head (view-picker + guides.css) |
| `head/investments.html` | /investments → Code → Head (investments.css; investments.js is in the site head) |
| `head/security.html` | /security → Code → Head |
| `head/services.html` | /services → Code → Head |
| `head/privacy-policy.html` | /privacy-policy → Code → Head (legal.css) |
| `head/terms-of-use.html` | /terms-of-use → Code → Head (legal.css) |

A page whose CSS moved to the repo has its Code → CSS box emptied. Pages not listed (team, etc.)
have no repo file yet.

**Each head file ends with the page's canonical line**, and every other page in Super (posts, guides, chain
pages) has a head of that one line alone, `<link rel="canonical" href="https://encapsulate.xyz/<path>">`
(2026-09-28). **A page holds one head, and writing one replaces it**: the canonical lines were first written
into Super on their own, which replaced every head — /networks lost network.css (raw Notion, "2727"), every
main page its CSS, the homepage its JSON-LD and Search Console tag — until the heads were pasted back from
these files the same hour (the user: "edit our files … append the tags there and then copy that"). So a head
changes here first, and the whole file is pasted.
**No page has its own Code → CSS or Body any more.** The guides' old slide-deck CSS (one 2,126-character box,
identical on 30 guides: the medium gallery as an 80vh bordered, snapping deck, 20px padding on `.notion-root` and
`.super-content`, a 2px black rule above and below every `.notion-heading` — Super compiles the box and drops the
stray comma that made that rule look dead — and the old "View more" gallery) was cleared from all 30 on 2026-10-02 (the user: "clear it from all
the other guides too"). On the converted guides nothing visible moved (measured with the box switched off); **an
unconverted guide now shows its slides as Super's plain gallery of tiles** until it is converted. The CSS and every
box id are in `backups/guide-page-css-2026-10-02.json`, with how to put one back. The old
post CSS (38 copies of the old template's table-of-contents and viewport rules) and Super's `embed.js` loader
(on 17 pages; it only acts on a code block starting `super-embed:`, and none does) were cleared on
2026-09-28 — contents and page map in `backups/super-snippets-2026-09-28.*`.

**Super bakes the site Head into each page when it republishes that page.** After a site Head
paste, pages pick it up unevenly; check each page's served `website-css@vN` before diagnosing.

### Site Head notes (audited 2026-09-14)

- **minima.min.css is required** — Super does not load its theme itself on this site.
- Fonts rendered: Inter (Super, /fonts), Outfit, Hanken Grotesk, JetBrains Mono, Architects
  Daughter. Manrope went with the old slide-out menu (2026-09-22). Arial Black, Georgia, Verdana,
  Monaco are system fonts.
- Headings use `sans-serif` where "Archivo" was once asked for but never loaded — do not add an
  Archivo link.
- `@import` is stripped from Super's Custom CSS box; use `<link>` in a Head.
- **Analytics (checked 2026-09-26):** Super's own page views (`POST /api/view` on every page, the
  site setting `analytics: true`, read in Super's dashboard) and Vercel Speed Insights (web vitals).
  Neither sets a cookie. The only cookies on the site are cal.com's (`__cf_bm`, next-auth), from the
  booking calendar. The old head carried a Google tag (`G-V43J33BP97`), **every line already
  commented out**, so it had collected nothing; it was left out of `head/site.html` on 2026-09-14.

## Editing Notion

- Integration token in `~/.notion-covers-token` (chmod 600; integration "Encapsulate Website",
  connected at the Home parent page and /contact-us). Read it from the file; never print it. The token
  was once shown in chat — remind the user to refresh it.
- REST API, `Notion-Version: 2022-06-28`: `GET blocks/{id}/children`, `PATCH blocks/{id}/children`
  (optional `after` to insert after a block), `PATCH blocks/{id}`, `DELETE blocks/{id}`.
  Pagination via `start_cursor`. A small helper (`api`, `children`, `tree`) is quick to write.
- Live block id `block-<32 hex>` = Notion block id without dashes, so a live id maps straight to
  the API. Pages: Home `b6b487f74b484c2e97c6ab7513295c14`, Networks `adea0804…`, Governance Record
  `6915bef8…`, Blog `3c2dbe43…`, Guides `1f6e800a5138802a…`, Services and Tools `bf68edd2…`,
  Investment `d6347738…`, Brand `53c5a135…`, Security `29c24b09…`, Contact Us `a8ec9a05…`.
  Old copies of Contact Us / Brand / Security live under "Encapsulate Test Home" — not the live
  pages.
- **Write text through the API as plain `text.content`, never with the annotations read back.**
  The API returns `annotations` on every run, all defaults included; sending them back stores an
  explicit colour, and Super then wraps the run in `span.highlighted-color.color-default`, whose
  ink overrides whatever colour the page CSS gives the block. That turned /networks' testnet
  figure from pastel blue to `#111` on 2026-09-24 (14 → 20 written with the annotations copied);
  the 27 beside it, written plain, stayed pastel. Send only what differs from the default.
- **Make button callouts through the API** (`callout.rich_text` carrying the link). A callout made in
  the Notion app can render its label as a child `p.notion-text`, which the Button System does not
  match (seen on /networks: 79px/101px plain boxes).
- **A files property shows its first file** (the Team card's portrait is `Photo`'s first). To
  replace one, upload with `file_uploads`, then PATCH the property with the new
  `{type: "file_upload"}` first and every existing file passed back as `{name, type: "file",
  file: {url}}` — that keeps them; leaving one out deletes it. Done for Kowshik on 2026-09-25.
- **A select option cannot be renamed through the API**, and option names are unique
  case-insensitively, so "DevOps engineer" beside "DevOps Engineer" is refused. A new wording is a
  new option (colour set when it is created), assigned to the row; the old one stays in the schema.
- **A link to a section of a page is the site's own URL:** `https://encapsulate.xyz/<path>#block-<32
  hex>`, which Super serves as `/<path>#block-…`. **Not** `https://www.notion.so/<page>#<block>`: Super
  rewrites that to the page and drops the fragment — the /services cover's "See services" and
  /investments' "Send the spec" both came out as bare page links (found 2026-09-26; every working
  cover button used the site URL). Never invent an anchor name, and link to a block that is
  **visible** on the page: a link to a gallery a script hides (`[data-enc-source]`, display none)
  does not scroll — /guides' "Browse guides" pointed at the hidden Guides database and did nothing.
  Take the block's id from the API or the live page, and check the click lands.
- Links: a page link renders as `/<page-id>` or its slug; a database link as its page path
  (e.g. `/governance-record/governance-record`); a block link `https://www.notion.so/<page>#<block>`
  should become `/#block-…` — confirm after republish.
- Super republishes on its own schedule; edits are not live immediately.
- **A bulk delete matches each block's own text, never its descendants', and logs every id it removes** (2026-09-21): a
  newsletter sweep matched the XMTP post's table of contents — which lists the page's headings — and deleted the whole
  post column; it was put back by un-archiving the block from its id in the cached page.

## The systems in main.css

| § | Section |
|---|---|
| 01–04 | fonts, tokens (`--color-bg-default` = #FAFAF8 ground), layout, the 4f navbar (§04 + navbar.js). The old slide-out menu section (§05) and its per-page icons were removed on 2026-09-22; under 960px the compact bar (navbar.js's sheet) replaces Super's hamburger and menu |
| 06 | Type System: Notion Heading 1–4 → h1–h4, one to one (h1 clamp(40,6.2vw,92) … h4). No bold/underline on headings |
| 07 | Button System |
| 08 | databases and properties |
| 09 | Card System |
| 10–13 | pills, (§11 column dividers, removed 2026-09-25), **article blocks** (§12: code block, comparison table, toggle — design *Blog Article Blocks*, 2026-09-25 — and the pastel pull quote), link previews (§13, the same design's card) |
| 13b | Notion forms (22a-light) |
| 13c | the filter bar (filterbar.js) |
| 13d | the record's rows — /governance-record and the homepage's governance table (governance.js) |
| 14 | Page covers |
| 16 | Footer 44b |
| 17 | reduced motion |

The systems themselves — the Button and Card Systems, the covers, the footer, the article blocks — are in
`docs/main-css.md`; the navbar's in `docs/navbar.md`; the filter bar's in `docs/filter-bar.md`.

## Where each asset comes from — repo vs Notion (settled 2026-09-16)

**Repo + jsDelivr — anything that is part of the design.** Referenced from the built CSS as
`../svg/name.svg` or `../img/name.png`, which resolves next to `dist/` on the same tag, so a drawing
can never drift from the CSS that positions it.

| Asset | Files |
|---|---|
| Section fields and drawings | `svg/stat-field-*.svg`, `svg/circle-online.svg`, `svg/fork-arcs-*.svg`, `svg/5k-fan-and-rings.svg`, `svg/5o-twin-fans.svg`, `svg/9c-inverted-horizons.svg`, `svg/rail-dots.svg`, `svg/team-crew.svg` |
| Brand | `svg/wordmark-reversed.svg` (footer, the ink navbar), `svg/wordmark.svg` (the /brand cover, paper since 2026-09-24 — the reversed file with its letters and band in `#000000`), `svg/mark-a.svg` (covers.js's /brand field) |
| Navbar captures | `img/nav-covers/` (the nine page covers) and `img/nav-panels/` (the four tools and the institutional dial), the design's own files |

**Notion — anything that is content.** None of it is in the repo; Super stores and serves it.

| Asset | Where it lives | Who reads it |
|---|---|---|
| Network glyphs | the **Cover** files property on each row of the **Networks set** database `3dde800a…33b7f1…` (47 deployment rows, glyphs uploaded through the API 2026-09-16; the old "Networks" database is still on the page until it is deleted) | Super draws the gallery cards; `home.js` (glyph columns, staking listbox) and `covers.js` (/networks cover) read those cards off the page and take the original `assets.super.so` URL back out of Super's `/_next/image` link |
| Services, team, testimonial and blog covers | the same kind of Notion property | Super, plus `home.js` for the services swap |
| Every word on the site | Notion blocks | — |

**Glyphs are drawn from Super's image service, not the originals** (2026-09-29, v335). The set's covers are 600px
PNGs (25–69KB); network.js, covers.js, footer.js and navbar.js each ask `/_next/image?url=…&w=…&q=75` (same origin; AVIF
or WebP; 75 is the only quality it accepts) through a `sized(url, w)` helper, at least twice the drawn size: the
closing band's rows and the footer 256, the cover field 384, the stage 640, the navbar 128; the lens already used 128.
Checked side by side at 2× against the originals (mean difference under 0.6/255, the finest stripes identical).
/networks went from 39 originals (~960KB) to none. SVGs and anything off Super's asset host pass through. **The
favicon is `img/favicon-512.png`** (39KB, uploaded in Super → Settings → Site favicon on 2026-09-29; it was a 4097px,
202KB PNG loaded on every page). The homepage's Organization logo still points at the old 4097px file, which Super keeps.

The Notion API can now upload files (`POST /v1/file_uploads` → send the bytes → attach by
`file_upload` id), so a glyph can be replaced end to end from here; external URLs still work too.

**The exception:** `footer.js` holds 10 hardcoded `assets.super.so` glyph URLs (re-pointed at the
Networks set uploads on 2026-09-16), because the footer runs on pages with no networks gallery to read. Replace one of those Covers in Notion and the footer
keeps showing the old file until the list is updated.

**DigitalOcean is no longer used by the CSS** (was
`multimedias.nyc3.cdn.digitaloceanspaces.com/validator-website/…`) — not one reference is left; the
two dead homepage background rules went with it on 2026-09-16. Keep large content images off jsDelivr: it is
free for personal and commercial use with no bandwidth cap (20MB per file, 50MB per package), but it
is a package CDN and sustained media traffic invites a fair-use review.

## Page scripts belong in the SITE head (measured 2026-09-16)

Super is a single-page app. On a client-side navigation it **does inject the destination page's
stylesheets** but **does not execute that page's `<script>`** — so arriving at the homepage from
another page left every JS-built section unbuilt (the blog rail showed as the raw Notion gallery,
the glyph columns and Why Stake figures were missing, snapping was dead), while the CSS looked
right, which is what made it confusing.

`home.js` and `network.js` are therefore loaded from `head/site.html`, not from their page's head.
Every IIFE in both files already runs off a MutationObserver, so when Super swaps the page in they
build by themselves — verified live: loading home.js on /networks and then clicking Home gave the
rail (3 cards), the network columns and the figures. Page CSS stays in the page head.

A new page script must follow the same rule: site head, and driven by an observer rather than by
load order.

## Things that bite in Super / Notion markup

- **Every card property carries `z-index: 10` (Super's notion.css), and a grid or flex item's
  z-index works without `position`.** Where a gallery's cards are `display: contents`, their
  properties are items of the section's grid, so each is a stacking context of its own — and
  anything hung on one (a `::before`/`::after` meant to lie under the section at `z-index: -1`) is
  painted inside it, over its neighbours. That put Who we are's disc and rings over the portraits
  (2026-09-27). Set `z-index: auto` on a property that carries a background pseudo-element.

- **A copy toggle is hidden by its id in its page's CSS, never only by a script's mark** (the user,
  2026-09-26). "Empty state copy" was hidden by `[data-enc-copy]`, which filterbar.js set only when a
  search came up empty — so on /networks, /governance-record and /blog the toggle showed, drawn as a
  §12 article toggle, until then; the other copy toggles showed until their script ran. Each is now
  `#block-… { display: none }` in network.css (Empty state, Chain page copy), governance.css (Empty
  state), blog.css (Empty state, Post page copy), guides.css (Guide page copy) and services.css
  (Services page copy). A new copy toggle — or one recreated in Notion — gets its id added there.

- **A script that watches the page must not wake itself.** governance.js's observer rebuilt on
  every childList change, and its own pass rewrote the pager's two labels (a text write replaces
  the text node) and re-appended every row after a sort — so the record page rebuilt 8 times a
  second for as long as it was open (48 mutations in 3s, measured on the live page, 2026-09-26).
  Write text only when it differs, move nodes only when the order is wrong, and check an idle page
  with a MutationObserver count (0 in 3s) after any change to a builder.
- **A link gets ONE rule under it.** Notion draws its own `text-decoration: underline`, so any rule
  that gives a link a `border-bottom` must also set `text-decoration: none !important` in the same
  block, or the link shows two lines. This has been reported three times (the contact band's
  "Open it in a new tab", "Cancel this booking", the meeting link) — check it whenever a link is
  styled, on every page.
- **Do not make two links out of one fact.** A value and the line under it are not both links: the
  label stays plain text and the line under it carries the link.

- **minima gives every callout a drop shadow** (`--callout-shadow`, 2px 8.1px 20.1px at 3%). No
  design has one; it showed as a grey smear under the /brand cover once that went paper, and sat
  unseen on the ink bands (/networks count and chain-teams, the record's count band, the guides
  picker, the homepage stats panels). main.css §02 sets the variable to `none` (v276).
- **Minima `!important`s:** `.notion-semantic-string .link:hover{opacity:.7}`,
  `.notion-collection-card:hover{background:…}`, `h3{font-size:var(--h3-size)!important}`.
- **Old page Code-panel rules use `#id … !important`** — nothing in a stylesheet beats them; they
  must be deleted (this is why the covers looked broken until the panels were cleaned).
- **Clipping:** `.notion-property` has `overflow:hidden`, a 4px gap and min-height 24px; card
  content is overflow hidden — descenders, figures and badges get cut; set `overflow: visible`.
- **A descender can also be cut by the element that paints over it.** In a sticky pile each
  pinned card shows only the offset the next one sticks at; anything below that line is covered
  by the next card's own ground. /security's failover steps: the title's ink ends 122px in, and
  the design's 112 offset painted over the tail of a g. Measure the ink (`Range.getClientRects()`
  on the last text node) and give the offset ten pixels of clearance — the pile steps 132.
- **A descender is cut whenever a tight `line-height` meets that clipping** (the g in "Weigh.",
  the y in "Aditya" — reported more than once). A line-height under 1 makes the line box shorter
  than the glyphs, and `.notion-property` and `.notion-collection-card__content` clip to it. The
  fix is `overflow: visible !important` on **both** the property and the card's content box —
  never a bigger line-height, which changes the design. Check it on every display-scale word set
  on a property (the pillars' Word, card titles, the figures).
- **Covers on cards:** Super writes `object-fit/object-position` inline (only `!important` wins)
  and floors height with `min-height`.
- **Image optimizer:** covers come via `/_next/image?url=…&w=…&q=75` (WebP, only q75 allowed) and
  look soft; the original is on `assets.super.so` — swap to it when sharpness matters.
- **Column lists are flex rows** with inline widths; Super writes inline widths on `th`.
- **Grid gotchas seen:** `display:grid` overrides un-hid a table's limited rows (restate the
  limit); `1fr` rows inflate tall media (use ratio-based sizes).
- **Global classes are global** (`.notion-callout`, `.notion-pill`, `.notion-property`,
  `.notion-collection-card`, `.notion-column`) — page CSS files are full of such rules; scope new
  work to a block id or a structural `:has()`.
- **Block ids** are stable until a block is recreated (API-recreated buttons get new ids). Prefer
  `:has(a[href$="/slug"])` over `:nth-child()` for database items.
- **Specificity inside a file:** a `> *` reset can beat section margins; select through the
  content wrapper. Load order between Head links and inline styles was measured as irrelevant for
  the homepage (2026-09-14); page Heads now also carry repo CSS — if a rule seems to depend on
  order, measure.

## Verifying in the automation browser

- The automation tab is hidden: no rAF, no smooth scroll, **no scroll events at all** (a scripted
  `scrollTo` fires none, so scroll handlers cannot be exercised there — test their logic in Node or
  by calling the effect directly), transitions freeze
  (finish with `document.getAnimations()`), screenshots often time out — measure with
  `getBoundingClientRect`/computed styles instead, and use real hovers via the computer tool.
- Long checks across pages: load each page in a hidden 1920×992 iframe, one batch at a time, and
  store results on `window` — a single call over nine pages times out.
- To preview a page without its Code panel CSS, set that `<style>`'s `media="not all"`.
- The site is the source of truth: check what the browser actually has (served tag, matching
  rules) before assuming a file is deployed.

## The Discord invite, and commission changes (2026-09-29)

The profile work these came from is validator-research's since 2026-10-08; what is left here is the site's.

**The Discord invite is `https://discord.gg/PQJX5JVS8h`** since 2026-09-29 (the user made it from the announcement
channel; never expires, no use limit). It replaced `q6cmGycxsr` — made from `#moderator-only`, whose name showed in the
invite's preview — in 33 Notion blocks (the homepage's and /contact's Discord lines, the "Ask us on Discord" button of 29
guides, the guide copy's `help url`; old values in `backups/discord-invite-2026-09-29.json`), Super's footer, the homepage
head's `sameAs` and guide.js's fallback. The old invite is not to be revoked yet — a profile outside the site still carries
it (validator-research tracks it).

**A commission can change with a profile edit, and the site's rate is after our commission** — verified against the
measured rates when the user remembered otherwise — so a commission change always means a new rate, new facts and a
refresh. On 2026-09-29 the profile edits raised eight Cosmos commissions (Sommelier 2 → 10%, Lumera 8 → 10, Axelar 9 →
10, Passage 5 → 10, Gitopia, humans.ai, Althea and Agoric 5 → 9); the user confirmed them and the Networks set's
`Commission` and `Reward rate` were rewritten the same day (`notion/networks-set-values.md`). Since 2026-09-30
site-data's networks job reads Commission from chain daily on the Cosmos rows.
