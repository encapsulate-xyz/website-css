# website-css

Custom CSS and JS for the Super.so (Notion) site at https://encapsulate.xyz. Designs come as Claude
Design handoffs (project `9da1c502-69a5-4e9f-9b05-9b435acb854b`, read with the DesignSync tool,
`get_file`) and are implemented section by section, verified on the live site.

## How we work (agreed 2026-09-15)

The user shares a design handoff. I:

1. read the handoff carefully (every value — misses were pointed out several times);
2. **edit the Notion page myself** through the API (see "Editing Notion"), so the content is shaped
   for the design;
3. write the CSS/JS in the repo, build, verify on the live page, commit, tag a release;
4. reply with **one table of what to paste** — `File | Paste into` — listing only the `head/*.html`
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
   | Republish a page | Super | the site head is baked per page; after a site-head paste, pages pick it up unevenly, and a stale page runs an old script for every page you navigate to from it |
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

## Files

| File | What | Loaded from |
|---|---|---|
| `main.css` | site-wide styles, no `#block-…` ids | site Head |
| `navbar.js` | the bar's panels — design *Navbar 4f Page*; Super still owns the menu — and, under 960px, the compact bar's Menu button and sheet | site Head |
| `booking.js` | the booking drawer — every "Book a call" on the site, except /contact-us | site Head |
| `footer.js` | footer 44b, built inside Super's footer | site Head |
| `covers.js` | inner-page cover graphics ("fields") | site Head |
| `filterbar.js` | the filter bar (design *Filter Bar Patterns*, G · the command field) — one component for /networks, /governance-record and /blog; styles main.css §13c | site Head, before the page scripts |
| `blocks.js` | Notion's generic blocks (design *Blog Article Blocks*): the code block's line numbers, prompts, colours, kicker and copy tick — the rest of the four blocks is main.css §12–13 | site Head |
| `home.css`, `home-dial.css`, `home.js` | homepage sections, JS-enhanced styles, homepage scripts | homepage Head |
| `brand.css`, `brand.js` | /brand — four spreads with a sticky rail, the marks slab, the colour band (design *Brand Page*) | page Head + site Head |
| `blog.css`, `blog.js` | /blog — the index (design J); blog.js builds each card's cover and its band span, and is loaded from the site head | page Head + site Head |
| `post.css`, `post.js` | /blog/&lt;post&gt; — every post page (design *Blog Post Page*, variant J). A post has no page head of its own, so both are in the site head and scoped by path | site Head |
| `chain.css`, `chain.js` | /networks/mainnet/&lt;chain&gt; — the 27 chain pages (design *Chain Page Combined*), built from each Networks set row page. Site head, scoped by `[data-enc-chain]` | site Head |
| `notion/chain-pages.json`, `scripts/chain_pages.py` | each chain page's words and facts, researched per chain (sources, notes, how "since" was found), and the writer that puts them into the row pages | — |
| `guide.css`, `guide.js` | /guides/&lt;stage&gt;/&lt;chain&gt; — every guide page (design *Staking Guide Variation 1d*). A guide has no page head of its own, so both are in the site head and scoped by path | site Head |
| `network.css`, `network.js` | /networks — the Network Count band (the hollow; network.js draws its tally), the set as the Networks Index, 5m. network.js is in the site head | its page Head + site Head |
| `services.css`, `services.js` | /services — four services and the ask under the cover (design *Services Categories Chosen*), built from the page's callouts, four inline tables and a copy toggle | page Head + site Head |
| `investments.css`, `investments.js` | /investments — two bands (design *Investments Page*): the thesis and the running band of positions on ink, the six questions on paper | page Head + site Head |
| `legal.css` | /privacy-policy and /terms-of-use — one template for both (designs *Privacy Policy* and *Terms of Use*); no script | both pages' Head |
| `governance.css` + `governance.js` (the record page: count band, pillars, controls, rows — and the rows of the homepage's governance table, drawn by main.css §13d), `blog.css`, `brand.css`, `contact-us.css`, `guides.css`, `investments.css`, `security.css`, `services.css` | each page's CSS, moved out of Super's page Code panels on 2026-09-15 (old cover rules removed, the rest kept as it was) | each page's Head |
| `svg/`, `img/` | every drawing and icon the CSS references, served from jsDelivr beside the CSS | referenced as `../svg/…` / `../img/…` from `dist/` |
| `notion/page-covers.md` | cover copy for the nine inner pages | — |
| `notion/guide-screenshots.md` | how guide screenshots are captured and composed (agreed 2026-09-18, not yet applied) | — |
| `build.py` | strips comments into `dist/`, copies the JS | — |
| `scripts/paste_table.py` | prints the paste table from head/*.html vs what the live pages serve | — |
| `scripts/livecheck.mjs` | loads a live page in headless Chrome with pinned tags' files served from this repo (or a pushed commit) — pass every tag the page pins, comma-separated (`v263,v227,v220`), runs a check in the page, optional real mouse, wheel and key steps (`move`, `click` — a real press and release — `wheel(x, y, dy)` and `press(key)`) and a screenshot. The scratchpad copies it replaced were lost on 2026-09-24 | — |
| `scripts/audit.mjs` | audits a live page at many widths (default 16, 320–2560; touch under 835) with every tag it pins served from this repo: sideways scroll and what causes it, text cut by its box, broken images, script errors, failed requests, screenshots per screen (`--shots`), a page check of your own (`--check`). `BLOCK=1` loads the page with none of our files, `ALLOW=a.js,b.js` with only those scripts — how a fault is traced to us or to Super. Built for the audit of 2026-09-26 |
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
3. Commit (with the session's attribution trailer), push, `git tag -a vN -m … && git push origin vN`.
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
| `head/governance.html` | /governance-record → Code → Head |
| `head/blog.html` | /blog → Code → Head (blog.css; blog.js is in the site head) |
| `head/brand.html` | /brand → Code → Head (brand.css; brand.js is in the site head) |
| `head/contact-us.html` | /contact-us → Code → Head |
| `head/guides.html` | /guides → Code → Head (view-picker + guides.css) |
| `head/investments.html` | /investments → Code → Head (investments.css; investments.js is in the site head) |
| `head/security.html` | /security → Code → Head |
| `head/services.html` | /services → Code → Head |
| `head/privacy-policy.html` | /privacy-policy → Code → Head (legal.css) |
| `head/terms-of-use.html` | /terms-of-use → Code → Head (legal.css) |

A page whose CSS moved to the repo has its Code → CSS box emptied. Pages not listed (team, etc.)
have no repo file yet.

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

**Button System (§07).** *The primary's hover steps UP* (29c, revised 2026-09-21): fill
`#99CC66` → **`#A8D67A`**, the ring stays `#7CAE48`, and the top highlight brightens from
`rgba(255,255,255,.78)` to full white, so the button reads as lit. Press still steps down
(`#7CAE48` / `#5F8A37`, inner shadow instead of the lift). The greens are tokens on `:root` —
`--btn-1-fill/ring/fill-hover/ring-hover/fill-press/ring-press/highlight/highlight-hover/press` —
and every primary hover on the site reads them, including the ones page CSS draws (the contact
band's two submits, the guide card, the post foot) and the cal.com embed's `cal-brand-emphasis`.
**The old darker pair `#8CBF56` / `#6F9E41` is retired**; if it turns up again outside `backups/`,
it is a mistake. Selection states that happen to be green (the institutional toggle, the guide
chain pills, the contact Copy button's "Copied") keep the `.78` highlight — they are not hovers.

*Disabled is a state, not a tier* (design *Button System* 29c/29d,
implemented 2026-09-21): primary takes the hairline fill `#E2E2DB` with a `#D9D9D2` ring and
`#575B55` text; secondary keeps paper with a hairline ring and grey text; tertiary greys its label
and mutes its badge to `#D9D9D2`; on ink the disabled text lifts to `#93978F`. Nothing fades —
the design holds disabled text above 4.5:1 — and the cursor is `not-allowed`. The tokens are
`--btn-1-dis-*`, `--btn-2-dis-*`, `--btn-3-dis-text`. Notion cannot mark a callout disabled, so
this is for buttons a page script builds.
 A callout is a button when
`.notion-callout > .notion-callout__content > span.notion-semantic-string > .notion-link` (span, not
`p` — text blocks share the `notion-semantic-string` class). Tier = callout colour: Gray →
secondary, Default → tertiary (label + up-right arrow badge, SVG), any other colour (green, purple…)
→ primary. Sizes via `--btn-h/--btn-px/--btn-fs` (44px; 48px where a section redefines them). Ink
sections redefine the ink tokens. Minima's `.link:hover{opacity:.7}` is cancelled.
**Button groups:** a column list containing only callouts (empty texts allowed) shrinks to its
buttons with a 12px gap; stacks under 520px. Design rule: one primary per view.

**Card System (§09).** `.notion-collection-gallery .notion-collection-card`: fill = page ground,
ring + highlight, 12px radius, hover keeps the fill (Minima's hover wash restated), press #FAFAF8.
Density from the gallery's Notion card size (small/medium/large); 6px bleed; `.no-click` has no hover.

**Page covers (§14 + covers.js).** Every inner page's first block is a callout holding, in order:
Text crumb ("Encapsulate · Networks"), Text eyebrow, Heading 1, Text lede, a button column list
(Green "Book a call" → calendar, Gray secondary → content on the page), Text foot, Text "Scroll ↓".
CSS selects `.notion-root > .notion-callout:first-child:has(> .notion-callout__content > h1)` and
places texts by `p.notion-text:nth-of-type(n)` — an empty line inside the callout shifts them.
One screen tall from where it starts (`--cover-top`, measured by covers.js because of the banner).
covers.js picks the field by path (/networks 9a, /contact-us 8a, /investments 3c,
/governance-record 2c, /brand 6a, /blog 5b, /security 7l, /guides 4h, /services 1m), copies the
design's 924×540 %-based geometry into divs, and:
- uses the cover's computed background as "paper" for knock-outs and 3px rings (the design's
  #FAFAF8 showed as pale discs on the #FFFEFC ground);
- measures the crumb and foot so each label pair sits together (`[data-enc-pairs]`) — the two rows
  shared a grid column and the shorter pair opened a gap;
- Networks glyphs are the homepage gallery's original `assets.super.so` PNGs (hardcoded list);
  the Brand mark is `svg/mark-a.svg` via jsDelivr.
Cover copy per page: `notion/page-covers.md`.

**One-screen bands snap the same way** (guides picker, the governance record's count band,
/networks' Network Count band since 2026-09-26): one
stop rather than a deck — a gesture heading at the panel from within half a screen lands on it, a
rest within a third of a screen settles onto it, nothing snaps under 701px or with reduced motion.
The catch rule is testable in Node (`scratchpad/snaptest.js`); the automation tab fires no scroll
events.

**Network Count (/networks, network.css + network.js; design *Network Count Patterns*, "I · The
hollow", 2026-09-25, v298).** One ink band a screen tall right after the cover (callout
`3dce800a…8154931a…`), replacing the two sticky panels, their rail and fields, the fixed kicker
with its collision rule, and network.js's paging (all removed). The eyebrow is two Notion texts, 26px
down at the band's sides: "Encapsulate · where we run" and "27 mainnets · 20 testnets" (its numbers
from the set). The column list dissolves into one grid: the mainnet Heading 1 as a hollow at
clamp(200px, 38vw, 560px) — the ground-coloured glyph ringed by eight paper text-shadow copies — and
beside it, bottom-aligned, "Mainnets secured", the line "A validator of ours in the active set on
every one of them." with **the tally** (network.js: one #99CC66 stroke per mainnet, five to a gate,
the fifth struck; the count's own), and the testnet callout kept as a row under a hairline: Heading
1 "20" solid and small with "testnets we help"; and a foot, 26px up, "Every network we validate |
Scroll ↓" (a callout of the two texts, `3e6e800a…8105922f…`, the rule drawn in CSS). Removed from Notion: the panels' "01 / 02" and
"02 / 02" and the note "Testnets we joined before there was anything to earn.". Super's heading
anchor span is a flex and grid item — it is taken out of the layout. Under 760 the figure stands
over the rest and the tally goes under its line.
**It is a snap stop** (the user, 2026-09-26, v314): one screen tall, and network.js ports the
record's count-band rules (a gesture towards it from within half a screen lands on it, a rest within
a third settles onto it; nothing under 701px or with reduced motion). Driven with real wheel events
in headless Chrome (`livecheck.mjs` `wheel()`) at 1440×900, 1920×1080 and 800×1000.

**The navigation bar (§04 + navbar.js, 2026-09-21, design *Navbar 4f Page*).** The bar is
**Super's own navigation** — its items, its groups and its radix dropdown, keyboard included —
drawn as 4f draws it: **it takes no space** — `margin-bottom: -64px`, `z-index: 50` — so the page
starts at the top edge and the bar lies over the cover, transparent with no rule at rest and
scrolling away with it; paper and a hairline while a menu is open (`nav.super-navbar[data-enc-nav-open]`, set by navbar.js), the
wordmark at 140px, the items in one recessed pill group (second paper, hairline, 12px radius,
44px items at 15/500), and Super's CTA drawn from §07's primary tokens.

`navbar.js` fills each panel with the 4f columns: the numbered ledger of the group's own pages
with a line under each, the destination in the middle column (a tile and its name), its note in
the third, and a foot carrying the group's line and the page count. The lines and notes live in
`CONTENT` **keyed by href** — Super's navigation holds a label and a URL and nothing else, and the
bar is on every page, so there is no block to read; the same exception as the footer's CTA and the
drawer's copy. Add a page to the menu in Super and it appears; give it a CONTENT entry and it also
carries its line.

**The lit item is an ink tab** (handoff 2026-09-25, v278 — "M" in the file's Navbar Rest State
Patterns): the page you are on at rest, and the hovered or open group while anything in the bar
is under the pointer, is a **36px ink pill with paper type** drawn behind the label (`::after`, inset
3px inside the 44px item's 1px border); on the ink bar a **paper pill with ink type**. Its caret is
`#9FA39B` on the ink pill at rest and paper once hovered or open; `#6B6F68` on the paper pill at
rest, ink hovered. No ring and no highlight. The caret sits 11px from its label (the file's 6px
gap plus the caret's 5). The file's own pill renders 34px — its `top: 4, bottom: 4` sit inside a
1px border — and the user's note says 36, which is what is built. **Super draws every navbar item
at `opacity: .7` until hovered** (super.css `.super-navbar__item, .super-navbar__list`): the resting
labels had shown at 70% since the bar was built; §04 now sets 1. The history below is the ring the
tab replaced.
**A hovered group is "open" from the moment the pointer arrives** (v279): the file's `open` is
simply "hov is a group", so the bar turns paper, the paper wordmark returns and the hovered group
becomes the ink tab at once. Ours waited for radix to mount the panel (~200ms), and on an ink page
spent that time lighting the hovered item the at-rest ink way — a paper pill — before flipping to
the ink tab on the paper bar (the user's report, 2026-09-25). `navbar.js` `paint()` counts
`.super-navbar__list:hover` as open and repaints on the bar's `pointerover`/`pointerout`; the
ink bar's hover rules were deleted. Book a call is not a group: over it the bar stays ink and
nothing is lit, as in the file.

**One ring, one job** (handoff, 2026-09-23, v259; restyled 2026-09-24, v267): the ring — since
v267 a **transparent** pill with a `#D9D9D2` ring and the full-white top highlight, ink type, on a
**paper** track (it was a paper fill on the `#F2F2ED` track); on ink, paper type in a
`rgba(250,250,248,.4)` ring with no highlight — marks the current page while the bar is at
rest, and moves to the hovered or open group while anything in the bar is under the pointer
(Book a call included, which lights nothing), then returns. Never two rings at once: the current
pill's rule carries `:not([data-enc-nav-open]):not(:has(… :hover))`. Lit is the same on ink as on
paper, the current pill on ink included. The caret is ink on the hovered group, `#6B6F68` on a lit
pill at rest, and `#9FA39B` on ink only where a pill is not lit. Measured on /networks (paper) and
the Axelar guide (ink) with real mouse moves in headless Chrome (now `scripts/livecheck.mjs --steps`).

**The ink bar at rest** (handoff, read 2026-09-23): labels `#C9C9C4` with the caret at `#9FA39B`
(the hover wash and the paper-only ring described here were replaced by the one-ring rule above); an **opaque `#373834` track** on a `rgba(250,250,248,.18)` border, so the cover's discs
do not show through it; Book a call keeps the inset lift and drops the shadow under it; the current
page's pill is paper on both grounds. The geometry is the same on both: 44px, 15px, 12px, 10px.
Opening a menu is a **colour-only change, .16s**, and the whole bar turns paper on ink too, so bar
and panel read as one sheet; the panel itself is paper everywhere. The change list for that round
said "paper type on the nav items", which read as `#FAFAF8` at rest — the file says otherwise, and
the file is what the values come from.

**Moving between groups is a swap, not a slide** (v287): Super's radix animates the panel change
— the old one leaves 200px sideways, the new one enters from the other side over 200ms
(`[data-motion]` enterFromLeft/Right, exitTo…). 4f just shows the next panel; §04 sets
`animation: none` on `.super-navbar__list-content[data-motion]`. The first open keeps Super's fade.
**So a panel is built before it paints** (v290): navbar.js built a newly mounted panel in a task
after the mutation, and the browser painted one frame of Super's raw list (540px against the
built 475) in between — the slide had hidden it; without it every swap flashed and jumped (the
user: "choppy"). The observer's own callback, which runs before paint, now builds any
`.super-navbar__list-content:not([data-enc-nav])`; over 12 swaps, 0 raw frames and one height.
Anything else that must never show unbuilt goes there too, not in `tick()`.

**The bar is one hover band.** Radix closes a panel the moment the pointer is on neither the
trigger nor the panel, so the gaps beside the logo and before the CTA shut it. `navbar.js`
`band()` holds it open while the pointer is anywhere over the bar or its panel — the gaps never
*open* one, since nothing is dispatched unless a panel is already open — and hovering Book a call
closes it, as the design does.

**Read against the file element by element on 2026-09-23** (bar, track, item, caret, CTA, panel,
ledger row, preview, third column, about, foot — every size, colour and string) and two pixels
were off: the bar measured **65** (the design's 64 is border-box *with* its rule; the content
row is 63 now, the nav 64), and Super hangs the panel at **63px**, painting it over the bar's own
hairline, where the design paints from 64 and keeps the rule visible between bar and panel — the
wrapper's `top` is `calc(100% + 1px)`, since 100% of an absolute box's containing block is the
padding box, which stops above the border. Everything else matched.

Because the bar lies over the page, **the cover's content starts 96px down** (§14 adds the bar's
64 to its own top padding) and a page that opens on ink takes the bar's on-ink variants until a
menu opens: labels `#C9C9C4`, the pill group on the .06 wash, and **`svg/wordmark-reversed.svg`
in place of Super's logo** — the brand's own reversed drawing, not the logo turned inside out by
a filter (the user's file, 2026-09-23; the filter is left only for the instant before the swap).
The reversed mark is worn **only while the bar is actually on ink**: the moment a menu opens the
bar takes its paper ground, and a paper mark on paper is invisible (reported 2026-09-23), so
Super's own logo goes back for that moment. `paint()` settles the mark on every tick rather than
only when the open state changes there — an older build left running on the page can set the
attribute first, and this one would return before putting the mark right.
**Which pages those are is measured, not listed:** `navbar.js` `ground()` reads the ground under
the bar's own line — `elementsFromPoint`, since the bar is the topmost thing at that line and
walking up from it never reaches what it lies over — and marks the bar `[data-enc-nav-ink]` when
its luminance is under half. It was keyed off Super's `parent-page__blog` until then, which is
why a guide page kept the paper bar over its ink head; that class stays as the no-JS fallback
for a post. The bar scrolls away with the page, so the measurement is only taken at the top.
**It is read again on the way back to the top** (v283): a guide builds its ink head while the
browser has scrolled away (anchoring holds the reader's place as the bands go in above), then
guide.js returns to the top with no mutation, so no tick measured again and the bar kept the paper
it read before the head existed — 4 of 6 loads of the Axelar guide. A passive scroll listener
re-reads the ground whenever the page arrives at the top, and it is read once more 1.2s and 3s
after load. 6 of 6 loads correct after; paper pages unaffected.
**Anything fixed over the page is not its ground** (2026-09-25, v280): the booking drawer's ink
half lies under the bar's line while it is open, so the bar was marked ink, took the ink track and
the reversed wordmark, and kept them after the drawer closed — white letters on the /brand cover.
`overlay()` skips every element that is, or sits in, a `position: fixed` box, and the bar measures
again when `html[data-enc-locked]` changes. The bar's links and groups carry the file's focus ring
(3px at .32 ink, 2px out; paper .5 on ink) — the drawer hands focus back to Book a call on close,
and Chrome drew its own blue ring there.

Three traps: **Super's `.super-navbar__list-content` is a flex row with `align-items: flex-start`**,
which it keeps when the direction is turned to column — the 4f grid inside then shrinks to its
content, full width under the chains grid and a third of it under a short list, so the preview
was 520px on one group and 184px on another; it is `align-items: stretch` now, with the grid and
the foot at `width: 100%`. **Super's own rules carry two classes** (`.super-navbar.simple`), so every rule that
fights one is anchored on `.super-root`; and **Super slides its dropdown viewport under the
trigger with an inline transform**, which 4f's full-width panel cancels (`transform: none`).
**The panel's preview is the page's own cover, captured**: the design's nine `cover-thumbs`, now in
`img/nav-covers/` beside the CSS so a capture cannot drift from the page it shows, drawn
`left center / cover` in a 16/10 box as the file draws them. navbar.js keys them by href and marks
the tile `[data-enc-shot]`; without one — "Institutional staking", whose capture the design itself
does not ship — the tile is the design's ink fallback carrying the page's name.

**The current page is marked** the way the design marks it (paper, ring, inset highlight). Every
item is a group, and a group is current when the page is one of its links — by prefix, so a guide
or a post marks the group that holds `/guides` or `/blog`. **Which links a group holds is read
from Super's own data** (v258): Super embeds the whole navbar configuration in the page's inline
data scripts — each group `{"id": <uuid>, "type": "list", …, "list": [{…"link": "/networks"}]}`
— and that uuid is the one in the group's trigger (`aria-controls="…-content-<uuid>"`). The quotes
are escaped once in the HTML and three deep in the browser's script text, so every run of
backslashes before a quote is dropped before reading. Groups are keyed by the uuid, not the
trigger's element id, which radix regenerates after hydration.
  **Never open the menu with synthetic events again.** Until v258 the groups were harvested by
  opening each one behind a hidden viewport; each was held 90ms, under radix's open delay, so
  nothing mounted, the harvest retried for half a minute, and its enters and leaves fought the
  reader's pointer — pointing at Services opened Company, and no page was ever marked current.
  Reproduced in headless Chrome with real mouse events (`scripts/livecheck.mjs`, which
  reroutes a tag's files to a commit or to the local repo); with the harvest off, Services opened
  Services. `mouse(type)` (a `PointerEvent` with `pointerType: "mouse"`, the only kind radix
  answers) is still used by `band()` to hold an open panel open. A group's section links (`/#block-…`) never make it current — "Institutional staking" is a
section of the homepage and lit Networks there until v281. A section link is its own destination, so `CONTENT` is keyed by the whole
href — `/services#block-…` is not `/services`.

**One row height for every group** (handoff, 2026-09-24): the preview — the 16:10 capture and its
name line — sets the panel's row (357px at the design width); the ledger and the third column
fill it without growing it and clip what does not fit (`contain: size` on both, standing in for
the file's absolutely positioned inner box). The counts are chosen to fill it: 21 chains, 7
guides, 4 posts, 6 votes; lists are 51px rows. **The foot lines go somewhere**: See all →
/networks, "What we build for chains" → /services, "Read the governance record" → the record,
"Read the blog" → /blog, Company's "Book a call" → the drawer (`FOOT_HREF` in navbar.js).
**Captures**: the file's covers were recaptured at 1496px with the page chrome painted out. DesignSync's
`get_file` stops at 256 KB — a larger image comes back cut off (no IEND chunk; check for it) — so
the Networks cover and the Dashboards panel came as the user's export (v269).
**The captures are WebP and fetched ahead of use** (v284): the PNGs were 80–650KB each (2.1MB),
requested only when a panel first opened, so the first preview drew in late (the user,
2026-09-25). Each has a WebP beside it at the same 1496px (q88, `cwebp -m 6 -sharp_yuv`; 451KB in
all, indistinguishable at 100%) and navbar.js uses those; the PNGs stay as the design's files.
`warm()` fetches each group's first capture once the page is idle (desktop only, never when the
reader asked to save data), every capture when the pointer or focus first reaches the bar, and on a
phone the five sheet covers when Menu is pressed.

**The Services column** is two by two, filling the panel's height, each capture drawn whole from its
top-left (handoff, 2026-09-24; it was a corner at 170%). **The wide bar holds down to 960px**, the
design's own switch, at its own 44px gutters — five items, the mark and the CTA fit from 960 up
(measured: items 222–738, Book a call ending at 916). **Super pads the logo link `0 16px` and the
actions `0 8px 0 16px`, the CTA's link `0 8px 0 0`**, which had set the mark at 60 and Book a
call 16px short of the gutter since the bar was built; all three are zeroed (2026-09-24).

**The compact bar, under 960px** (handoff 2026-09-24, *Navbar 4f Page*, "D2" in its comments):
the wordmark at 124, Super's Book a call, and one icon-only **Menu** button (44px, the
secondary's paper and ring; `.06` fill and `.3` ring on ink) that navbar.js puts in Super's
actions. It opens **a sheet under the bar**: a rail on ink (both grounds) carrying the groups as
01–05 in Outfit 44 — paper when chosen, otherwise an ink glyph ringed in paper by eight
text-shadows (never text-stroke; Outfit's digits are overlapping contours) — and beside it the
chosen group: its first page's cover (16:10, 4px, the nav-covers capture), the group's name in
mono, its pages as 20px Outfit rows with their line. It opens on the first group, one at a time.
The bar comes back to the top (`position: fixed`) with its ground while it is open, the page is
locked (`html[data-enc-sheet]`), and the sheet sits at z 55 — over the chain dock (50), under the
booking drawer (60). Escape, the button, a row or a resize past 959 close it.
- **Super's hamburger and accordion are hidden, not restyled**: the accordion opens several groups
  at once and the design shows exactly one. The sheet is built from **Super's own navigation
  data** (the same harvest as the panels' groups, `pagesOf`), so the groups, their names, their
  pages and their order stay Super's; the line under a page is the description Super holds for
  the link if one is set (none are), else `CONTENT`'s.
- **A row opens its page through `window.next.router.push`** — the app router Super's own links
  use — so it stays a client-side navigation (checked: same document, /networks → /services).
- **The rail is 98px, not the file's `128px` grid track**: the file's `.nav-compact {display:
  flex !important}` also lands on the sheet, so the design renders as a flex row and the rail takes
  its numerals' width. The render is what the user sees, and every number matched it at 390
  (rail 98, cover 260×163, tabs 66×60, rows 67). Its comment's "88px rail, Outfit 34" is stale.
- **`ground()` does not measure while the sheet is open** — the ground under the bar is then the
  sheet's own ink rail, and the paper bar turned ink (seen on /networks).
- The design's row hover (`.nav-row:hover`, the second paper) is kept on paper only; on ink it
  would put paper type on a paper wash.

**The third column is read, not written.** The handoff's rule (Aditya, 2026-09-21): it lists the
page's own sub-pages or section headings, *taken from the page as built — nothing typed in, so it
cannot drift* — and only a page with neither carries the note. `navbar.js` `READ` has one reader
per destination; the page is fetched **once per visit, only when a pointer rests on its row**
(220ms — a sweep across the bar fetches nothing), parsed with DOMParser and kept. While it loads,
or if it yields nothing, the note stands in.

| Destination | Column | Read from |
|---|---|---|
| /networks | chains, 3 across | the Networks set, first **twenty-one** cards of the Order-sorted view, with rates — seven rows fill the column |
| /services | tiles, 2 across | no fetch — the group's own section links that have a panel capture, each tile drawn at 170% from its top-left |
| Dashboards (`/services#block-…81cf…`) | list, "Live now" | the Dashboards table on /services, in Order: each row's **Menu** property ("Sui RGP dashboard"), linked to its Link. Menu was added to the table for this on 2026-09-23 |
| /governance-record | votes, "The latest votes" | the record's own table, newest first, six rows: the chain's mark (the set's glyph from the counts, else covers.js), "Terra · 4851" (Network · Reference), the vote as a dot — green yes, ink no, hollow abstain — and the day (since 2026-09-24; it was the four pillars' questions) |
| /security | list | the page's `h2` headings |
| /guides | guides | Guides database, first **seven**: chain mark (from the set on the same page), chain, wallet |
| /blog | posts | first **four** cards, 89px rows: cover in miniature at 112×70 (the design's tint filter), title, first pill |
| /brand | list | the rail's numbers — `01 · The marks` → *The marks* |
| /investments | holds, 2 across | the Portfolio cards: logo, name, the four-digit year |
| /contact-us | list | four blocks by id: the booking headline, "Or write to us", the fold, "Elsewhere" |
| any other section link (Playbooks, Bots, Monitoring, Institutional staking) | the note | — |

A section link is its own key in `READ` and `KIND` (after the `MOVED` alias), and its page is
fetched by path. /governance-record is 405KB gzipped (the record table),
which is why nothing is fetched on a pass-through.

**Two kinds of capture** in the middle column, as the design draws them: a page's cover
(`img/nav-covers/`, `cover / left center`) and a tool's panel (`img/nav-panels/`, drawn
`cover / left top` since the handoff of 2026-09-23 — the four tool captures are now the Services
page's own sections, 1100×619 and 1491 wide; the Services column's small tiles still draw them at
170% from the top-left); the institutional dial is a panel file drawn as a cover. The Services
cover capture was re-exported with the new cover text the same day. The
tile holds an `<img>` and `[data-enc-shot="cover|panel"]` picks the draw. `window.encNav` exposes
the build's version and its readers, so each can be run against its page from the console — the
live page's older script otherwise races a newer one for the panels, which is why the end-to-end
check was done in a clean `srcdoc` frame.

**The Services group points at the page's own bands** (`/services#block-<callout id>`) since the
page was rebuilt on 2026-09-23: Dashboards `…81cf8a82c41c2f9f8c78`, Playbooks
`…81719a14e42a6532c579`, Bots `…81598024c57e15cbd370`, Monitoring `…8115ac0dd17fb46b383d` (all
`3e4e800a5138…`) — set in Super → Navigation → Menu items. navbar.js keys its copy by those hrefs
and aliases the four old ids (`MOVED`), so the panels read right either way; a click on an old id
lands at the top of /services. **Super's editor cannot be trusted from the automation tab:**
editing an item there (native value setter + `input`, then Save) updated the editor's own list and
read back correctly when the item was reopened, but a fresh load showed the old link — nothing
had reached Super's server. A second try with real key events and a real click could not be
checked, because the hidden tab then stopped rendering the app at all (throttled timers). Menu
edits are the user's to make. **minima frosts the navbar** (`backdrop-filter: blur(12px)` plus a white wash) — 4f's bar is
plain glass, so both are cancelled, or whatever the bar lies over is smeared.

**The reconstruction banner is gone** (2026-09-26): the user deleted its snippet from Super's Body code,
head/site-body.html is empty, and main.css §15b (its styles, hidden by default) was removed in v307.
If a notice is ever wanted again, it is markup in the Body code plus styles; §15b's history is in git.

**Footer 44b (§16 + footer.js).** Its own top edge carries the `rgba(250,250,248,.2)` paper
hairline and **nothing sits under the disc field** — the field runs straight into the body
(handoff, 2026-09-21). The link columns are spaced by the design's 44px rows, not by a gap.
Super's footer (type Stack) is rendered into the design: menu
items named `Group: Label` become columns ("Legal" group → bottom right, no colon → "More"),
Socials → "Social" column, Footnote → bottom left. CTA copy, calendar URL and the rotating disc
glyphs are in footer.js by the user's choice; wordmark `svg/wordmark-reversed.svg`.

## The brand colour band names three sets (2026-09-21)

The handoff's 02 band is the brand pair, then **the grounds**, then the pastels — the grounds were
missing from Notion and were added: the `Colour` database (`3dee800a…de667797d25c`) gained a
**Ground** option on Set, a **Job** rich-text property and the two rows (Paper `#FAFAF8` "Every
light page and slide", Ink ground `#2A2C28` "Every dark section and slide"), and the page gained
the pair of texts that head them ("The grounds" + "Our paper is not white and our dark sections are
not black. Put the mark on these, not on #FFF or #000.").

`brand.js` builds one group per set and pairs each strip with the next two Notion paragraphs in
page order, so the heads are Notion's words and the order is Notion's. A ground swatch is the
handoff's `swatchJob`: 132px, the name and its job line at the top, the value at the foot, a
hairline outline. **Job has to be switched on in the gallery view by hand** — the API cannot change
a view; without it the cell still reads as name and value.

Every property on a Notion card carries `.notion-collection-card__property`, **the title included** —
a "the property that is not X" reader must skip `.notion-property__title` or it picks up the title.

## Homepage (home.css, home-dial.css, home.js)

**The hero's lede has no lines around it** (v287, the user's decision 2026-09-25, "remember the
lines if I don't like it I may ask you to add them back"). Design 11a draws none; the page carried
two gradient hairlines from its old "Earn Rewards" copy. To restore them exactly, put this back in
home.css:

```css
#block-0dea66c8640e43628360c627219fdb79:before,
#block-0dea66c8640e43628360c627219fdb79:after {
    content: "";
    display: block;
    height: 1px;
    margin: 4px 0;
    background: linear-gradient(to right, black, rgba(204, 204, 204, 0));
}
```

Under 900px the lede keeps the design's 28px under the headline (the empty paragraph that spaces
them on desktop is hidden there), and the headline's `margin-bottom: 0` stays so that gap is exact.
The headline's font comes from main.css §06 alone; home.css adds only its #000 (Super's heading is
#111).

**The hero is centred by code** (2026-09-25, v291; the user: "use code to center align it"). It
is one Notion column list, the page's first block: the headline, the lede and the two buttons in
the left column, the loop (a video block, external, the jsDelivr `home-loop-paper.mp4`) in the
right. **Nothing in it makes space**: its six dividers, eight empty paragraphs and the button row's
empty third column were deleted, and the loop moved in from the top of the page, where it had
hung at fixed offsets (`top: -40px`, `90px` under 1728). home.css: the hero is one screen tall
(`100svh`), the words sit between two flex springs 28px apart (design 11a), centred under the
bar; the lower spring is never shorter than the loop's small orbs (their tops 14% of the loop's
width above its foot), so on a short screen (1440×900, 1536×864) the words rise clear of them
rather than the buttons landing on one — from 1300px, below which the loop is cropped past them.
The loop is the hero's backdrop, bottom-right, `max(100%, min(1728px, 140vw))` wide (under 1235
it shrinks so the sphere stays right of the words), its top edge masked into the paper. 901–1024
stays side by side (the old ≤1024 rule at the top of home.css sets every column to 100%); stacked
(≤900) the loop follows the words as a band. A divider or empty paragraph typed into the hero is
hidden. **Remove** the marked transitional rule for `#block-1ee04e9f…` (the old loop block) once
Super serves the new structure.

**No divider makes space anywhere** (2026-09-25, v292). main.css §11 used to keep a divider in a
column as hidden height, and four page files hid it under 1024px — that was how the hero was
aligned. §11 and every copy are gone, and all dividers were deleted from Notion: the hero's, the
section rules in the posts (design J separates sections with the heading's 18px and the article's
24px gap, no line — 42px above a heading now, 76 with the rule), and the hidden ones at the foot of
every guide and post, and the old pages outside the designs — /snapshots and its nine snapshot
pages, the three Lido DVT cluster pages, /services/celestia — whose FAQ sections were split by
visible lines (the hero's 7, then 321 on 117 pages; ids in
`backups/removed-dividers-2026-09-25.json`, restorable from Notion's trash). Found by sweeping
every URL in the sitemap for `notion-divider`, which is quicker than walking Notion. **Make space with CSS, and pair things with Notion columns — never
with a divider or an empty paragraph.**

home.css starts with older page CSS, then "HOMEPAGE SECTIONS": stats band/figures/deck (00–00c),
hero, Audience split 51l (07b), testimonials deck (09), Why Stake 49a, governance 37h, Services 42m
(09a), Who we are (09b), blog, networks 21b, Contact 48c (16).

home.js is a set of IIFEs: the dial (institutional form), homepage decks (snapping), networks
glyph columns, blog rail (Cover glyphs via CSS mask, dots), services
selection (swaps covers to the original PNG), Why Stake graphics (derived figures), contact copy.

**Snapping — lessons.** Use native `scrollTo({behavior:"smooth"})` (scripted animation was choppy);
cache stops, invalidate on resize/mutation; trackpad momentum lasts seconds — a new gesture is a
250ms gap, or after a 450ms MIN_LOCK and decay below half peak, a rise 4× the smallest delta (≥20);
one-screen sections (Who we are, Services) are caught on the swipe within half a screen, and the
settle retries. No CSS scroll-snap on html (fights the script). Gesture logic is testable in Node
with a stubbed window.

**Notion forms (§13b)** render natively (no iframe): `div.notion-form__wrapper > form.notion-form >
div.notion-form__field.<type>`; dropdown questions still render as radios (drawn as chips);
"Invalid email" shows on empty fields (hidden while placeholder shows). The dial: a Number question
"Amount" is driven by the slider; choice questions with >6 options become a glyph listbox. React
inputs: click labels, use the native value setter + `input` event; mark with attributes
(`[data-enc-…]`), not classes — React resets className.

## The booking drawer (2026-09-18, design *Drawer Variations*)

Every "Book a call" on the site used to open cal.com in a new tab. `booking.js` (site head) now
catches the click and opens the drawer the design settles on: the **split takeover** with the
**green-edge chrome** — the band's own ink on the left carrying the eyebrow, the headline with its
circled word and the three spec rows, cal.com's calendar on the paper half, a 3px green rule and an
inline title instead of a header bar. Escape, the backdrop and the 44px close all shut it; the body
scrolls only inside the drawer (`html[data-enc-locked]`). Styles: **main.css § 18** — the drawer
opens on every page, and main.css is the only stylesheet that is on every page.

- **It binds by href**, on the document: any `a[href*="cal.com/aditya-encapsulate/30min"]`, whenever
  Super renders it. So nothing in Notion changed and nothing needs to — the covers' green buttons,
  the homepage hero, the footer CTA are all already links to that URL. A ⌘/ctrl/shift/alt click is
  left alone, so "open in a new tab" still works.
- **/contact-us is excluded** by path: that page has the calendar in its own band and its own
  confirmation built from Notion's words.
- **When the booking lands**, the paper half becomes the confirmation — tick, the facts, the two
  buttons, the cancel line and the four calendar exports — built from cal.com's payload.
- **The drawer's words are in `CONTENT` at the top of booking.js, not in Notion.** They have to be:
  Super ships only the current page's blocks, so there is no block to read on eleven of the twelve
  pages. This is the same exception already made for the footer's CTA copy and the Copy button's
  "Copied" feedback, and the user agreed to it on 2026-09-18.
- `window.encBook` publishes `when()`, `calendarLinks()` and `meetUrl()` so contact.js and the
  drawer cannot drift on the payload; the design file asks for exactly that extraction.

## The governance page's last two sections (2026-09-19, design *Governance Record Wow*)

**The pillars are a quadrant**: a 2×2 of pastel fields, each carrying one word at display scale
(Read. / Weigh. / Listen. / Step back.), the number in mono at the top right, the question and its
line at the foot, and an ink "then / Vote" disc at the crosshair. The word is a **Word** property on
the `Governance Mechanism` database (added 2026-09-19); **it has to be switched on in the record
page's gallery view by hand** — the API cannot change a view. Without it the field still reads
(number, question, line), so it degrades rather than breaks. `governance.js` marks each card's text
properties by view order (`data-enc-pillar="title|line|word"`) so no CSS depends on Super's property
hashes. The handoff's `auto-fit` track expression resolves its percentage against the wrong box
inside a Notion collection and gave four tracks in a row — the 2×2 is stated outright instead.

**The record is one line per ballot** (revised by the record handoff of 2026-09-26, v301): five
tracks — the chain's 30px mark, the proposal, Our vote as a mono capsule, the date as the file
prints it ("Sep 11, 2026", shortened by governance.js; the sort reads the day kept in
`tr[data-enc-t]`), the arrow — `30px minmax(0,1fr) auto minmax(0,auto) 20px`, 18px apart. **The
table is the grid and every row a subgrid** (`thead`/`tbody` are `display: contents`), so capsules
and dates line up down the page and under the header; the file draws each line as its own grid.
**The line is two targets:** the left (mark, title with a ± after it, CHAIN · reference) is a
`button.enc-rec__open` governance.js lays over the title cell — it opens the rationale beneath the
line, one row at a time (`tr[data-enc-open]`, `aria-expanded`, `aria-controls` on the rationale
cell); the right (capsule, date, arrow) is the Proof link, whose cell spans those three tracks and
whose `::after` fills it. Either one hovered or keyboard-focused, or the row open, darkens the rule
and turns the capsule and the reference line ink. **The dot is by the vote's word**
(`td[data-vote]`), not Notion's option colour: No is pink in Notion and drew as a veto until v301.
Ten rows a page. The empty state is the shared empty set (see the filter bar). On a phone the rationale
is collapsed too — a tap is a press.

**The homepage's table is the same component** (the user, 2026-09-26, "in line fully"; v304). Both
tables are views of the one database, so `governance.js` builds both (`ROW_TABLES`: the record, and
the homepage's `4529386b…` with its first six rows only) and **main.css §13d** draws both, keyed by
`[data-enc-rows]`, which governance.js sets. What each page keeps: governance.css the record's
filter bar, pager, empty state and group headings; home.css the six-row limit and the section's
grid area. home.js's own 37h builder (`.enc-chain`, `.enc-gov__*`, tint by row) and home.css's 330
lines of row rules were removed. The disc's tint is per chain on both (`tintFor`). **The homepage
view must show Rationale** for its rows to open — a row with no rationale cell gets neither the
button nor the ±. Moving the rules was proved by snapshotting 87 elements' computed styles on the
record at 1440 and 390 before and after: no difference. The disc's glyph now comes from the page's
galleries or covers.js's `encGlyphs()`, re-read when more cards arrive, and a disc still waiting is
filled on later passes (up to 12 at 300ms).

**The date column's header is "Recorded"** (the property was renamed on 2026-09-26).
`governance.js` and `scripts/notion.py` `date_prop()` accept "Voted on" too.

## The contact band's fold holds the dial (2026-09-18)

The toggle at the foot of /contact-us ("Staking a treasury or a fund?") is a Notion **form block**,
and that form is the institutional one — so `home.js` claims it as the Institutional Dial exactly as
it does on the homepage. Consequences, all of them learned the hard way:

- **`home-dial.css` is linked from `head/contact-us.html`** as well as the homepage's. Without it
  the dial renders as a bare Notion form with a 90px title.
- `contact.js` recognises the dial the same way `home.js` does — by a Number question labelled
  **Amount** — and leaves it alone; its own plain-form shaping (descriptions into placeholders,
  Send on a row) stands down, and every fold-form rule in contact-us.css is scoped
  `:not([data-enc-dial])`.
- The band redraws the dial **fully on ink**: the paper half takes #2A2C28 with a
  `rgba(250,250,248,.18)` hairline for the split, fields and duration pills go to the .06 fill with
  the .3 ring (a picked pill is paper with ink text), the listbox panel is ink. The pastel glyph
  wells and the green Send are the only colour left.
- **Glyphs on a page with no gallery:** `covers.js` publishes `window.encGlyphs()` — its own
  fallback list keyed by chain ("gravitybridge") plus anything the page renders — and `home.js`
  merges it when a name has no card. `mark()` matches on the flattened key too.
- **React resets className on the toggle when it opens**, which took the band's fold styling with
  it. The fold is marked `[data-enc-fold]` (an attribute, per the rule above) and re-marked, with
  its split label and its form, on every tick of contact.js's observer.
- **The meeting link is `booking.videoCallUrl`** (top level), not `booking.metadata.videoCallUrl`
  where cal.com's own success screen reads it — measured from a real booking through the embed on
  2026-09-18: the payload is `{uid, title, startTime, endTime, eventTypeId, status,
  paymentRequired, isRecurring, videoCallUrl}` and carries no metadata, attendees or organizer.
  `contact.js` tries every place the link can be and keeps the payload at `window.encBooking` and
  in `sessionStorage["enc-booking"]`, which is how that shape was read.
- On a booking the confirmation scrolls to the top of the viewport; the band the reader was looking
  at has gone, so the page would otherwise sit mid-scroll where the calendar was.
- Removed from Notion on 2026-09-18: the fold's "Open the institutional dial" button (the dial is
  in the fold now) and, by the user's own edit, the paragraph "Size, custody and jurisdiction are
  the first things we will ask."

## The blog post page (2026-09-21, design *Blog Post Page*)

Every post is an item of the `Blogs` database (`a148eb7f…`) and Super gives it the same shape:
Super's own `.notion-header` with the title, then the article — a **two-column block** whose first
column is a Notion table of contents and whose second is the post (banner image, the byline as a
quote block, the H1, then the body) — followed by "More Blog Posts", a related collection, a
button row and the newsletter.

**The post is the column block carrying Notion's contents**, not the page's first one. The XMTP
post keeps its article at the *foot* of its page, after "More Blog Posts", so the first column
list there is a divider beside the "View More Blog Posts" button — and that button was the entire
article until 2026-09-23. Checked across all thirty-nine posts: every one is found by its contents
block, and only XMTP changes (1 block → 50). The longest column list is the fallback if a post has
no contents block.

`post.js` re-reads that into the design and writes no copy into a post:

- **The head** is ink and one screen tall (`min(92vh, 940px)`): the meta line, the title at
  `clamp(38px,5.8vw,92px)` and the lede, over the chain's mark bled off the right at 16%.
  The **lede is the post's own opening paragraph**, lifted out of the body.
- **The body** is `236px | 720px`, centred: the reading rail — progress (one anchor 40% down the
  viewport drives both the percentage and the current section), the contents built from the post's
  own `h2`s, and the standing ask — beside the article.
- **The byline** is the post's "Written by …" block, and the **next post** comes from the index.
- Super's header, the Notion contents block, "More Blog Posts" and its collection are marked
  `data-enc-source` and hidden; the newsletter stays.
- **No image is hidden.** post.js used to hide a post's first `.notion-image` as "the banner",
  which cost the Gno.land post its first figure (reported 2026-09-23). Checked through the API
  that day: **none of the forty posts opens with an image** — the banner blocks went when the head
  became the title — and the 114 images left are the bodies' own. A page that still shows a banner
  is one Super has not republished.

**The tag, the date and the mark are database properties, and Super does not render them on an
item page.** They are read from `/blog`, which does render them on its cards — one fetch, cached,
and the page still builds without it. The same fetch gives the next post.

**Every word is in Notion.** The page's own copy — the rail's ask, the foot's three variants, the
labels — is a **"Post page copy" toggle on the /blog page**, as `key · value` lines; post.js reads
them from the index it already fetches, so forty posts share one source, and blog.js marks the
toggle so blog.css can hide it on the index. `{chain}` and `{ticker}` in those lines are filled
from the post's own row. `post.js`'s `CONTENT` is only the fallback if that toggle goes missing.

**The Blogs database carries the page's facts**: `Lede` (the head's two lines — a post's own
opening is the fallback, cut to the same length), `Chain`, `Ticker`, `Mainnet` (Live / Not yet
launched — which picks the foot's ask) and `Author` (the byline). All are read off the index's
cards, so **they must be shown on the /blog gallery view**; blog.css hides Super's card content, so
the index looks unchanged.

**The post's own duplicate title and its "Written by" block were removed from all forty posts**
(2026-09-21): the head is the title now, so the title comes from the header Super always renders,
and the byline is drawn from `Author`. The read time is derived at 230 words a minute, as the
handoff insists — stating it is what let it claim six minutes for a one-minute post.

**The index is fetched once and parsed once, but the post is looked up on every build.** Caching
the lookup gave every post the first one's mark, lede and next, because index → post is a
client-side navigation and the script stays alive across it.

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

## The legal pages (2026-09-26, designs *Privacy Policy* and *Terms of Use*)

/privacy-policy (`a767bb44…`) and /terms-of-use (`c4486f09…`; the user moved it from
/terms-and-conditions the same day, and the footer's Legal links follow) share one template, drawn
by `legal.css` from native blocks — **no script**. Each page is, in order: a column list (the crumb
"Encapsulate · Privacy" | "Updated 26 Sep 2026", a 1px `#A5A5A5` rule drawn between them), Heading
1, the lede, then a column list of [Text "Contents" + Notion's **table of contents**] | [per section:
Heading 2, texts, bulleted items; then "Questions about this document" and the line carrying the
mailto link]. The words are the handoffs' verbatim, except the foot line, which is the user's: "Write
to hello@encapsulate.xyz. A person replies, usually within a few days."

- **The rail is Notion's table of contents.** It lists the page's Heading 1 too, so its first item
  is hidden; 01, 02… beside the rail's links and the headings are CSS counters (a hidden item counts
  nothing). The rail is sticky at 88px; under 900 it stands over the document.
- **The design's section box is flat blocks here**: each Heading 2 after the first carries the rule
  and the 44px above it, and so does the foot label (full width — its 68ch cap is lifted, or the rule
  stops short). Texts sit 40px in, capped at the file's 68ch (lists 66ch, foot 60ch).
- **Super's contents click scrolls 62px past `scroll-margin-top`** (measured: 0 → 62, 96 → 158), so
  the headings carry 34px and a section lands 96px down, as the file's `#id` links do.
- Super pads the page's main 80/90px and gives every text a 32px `min-height`: both zeroed on these
  pages. The page runs the file's own sides, `clamp(28px, 6vw, 96px)`.
- **Removed from Notion** (backup `backups/legal-pages-2026-09-26.json`, and Notion's trash): the old
  privacy policy (36 blocks — Introduction, Information We Collect, Purpose of Data Collection…) and
  the old terms (88 blocks, eleven numbered sections from Definitions and Interpretation to
  Governing Language). The page titles in Notion ("Privacy Policy", "Terms of Use") are unchanged.

## /investments (2026-09-21, design *Investments Page*)

Two full-bleed bands after the cover, built by `investments.js` from Notion:

- **01, on ink**: the kicker, "We invest in the chains we operate." at clamp(38,5.6vw,84), the lede,
  then the positions as a band of pastel discs that runs (30s, `enc-inv-run`) and **pauses on the
  mark under the pointer**; the line beneath prints that position — name, `category · since YEAR`,
  and the Validator pill's own words beside a dot that is green when we run one.
- **02, on paper**: the six questions as a segmented control, one answer at a time with the verdict
  as a disc (green Yes / ink No), and the ask at the foot with Book a call and **Send the spec**,
  which links to the contact page's form block (`/contact-us#block-3dee800a51388006bd4aeba0fb2a72c7`, "Get in touch"; it pointed at `…808c8e81…` until 2026-09-26, a block no longer on the page, and landed at the top).

**The positions are the `Portfolio` database** (`807c8bde…`), one row per position: Name,
Description, **Category** (select), **Since** (text), **Validator** (select, whose two options are
the design's own labels — "we run a validator here" / "not yet in the set"), Files & media (the
logo, drawn in the disc), Tags, super:Link. The script reads the rendered cards, so nothing about a
position lives in the code: the category and the validator line are matched by value, not by
Super's property hashes, and a missing year or pill just drops out of the line.

**Its gallery view must show Category, Since and Validator** — the API cannot switch a view's
properties on. Without them the band still runs and names each position.

Removed from the page on 2026-09-21: the Tally form column ("Looking for Investments?", its
paragraph and the quote) and the "Our Investments" heading — the design has neither, and the ask's
second button goes to the contact page's form instead.

## The chain pages (2026-09-24, design *Chain Page Combined*)

Every **mainnet** row of the Networks set is a Notion page, and since 2026-09-24 each has a path
of its own in Super: **Pages → /networks → /mainnet → /&lt;chain&gt;** (avalanche, lido-dvt, monad,
near, sui, axelar, eigencloud, iota, mina, starknet, terra, zilliqa, avail, espresso, ika, supra,
vara, agoric, althea, gitopia, gravity-bridge, humans, ixo, lumera, passage, sommelier,
chain4energy), each pointing at the row's share URL. `/<row id>` 307-redirects there. Added from
the automation tab (the user asked); the Super editor loads slowly (15–45 s) and coordinate clicks
stop landing after the window changes — what worked was JavaScript: expand the rows by clicking
their `.lucide-chevron-right`, `.click()` the last "Add sub-page", focus each input and type with
real keys, `.click()` "Create page". **Giving the rows paths changed Super's markup:** a set card
is now `id="block-networks-mainnet-<chain>"` with a `.notion-collection-card__anchor` link, not
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
Super server-renders on every chain page, `.super-content.parent-page__networks-mainnet`, with a
5s `visibility` reveal in case the build never comes. The shared words and the chain list live in
localStorage (`enc-chain-copy`, `enc-chain-list`), used at once and re-read in the background
past half an hour, so a repeat visit is built at ~140ms.

**The dock** rises once the hero has gone and slides away as the last band's foot reaches the
viewport's (`hero.bottom < 80 && last.bottom > innerHeight − 8`), so it never lies over the
footer; the last band carries `[data-enc-last]` (handoff, 2026-09-24).

**Page id.** Super names the page after its path (`main#page-networks-mainnet-monad`, class
`parent-page__networks-mainnet`), so chain.js finds the row id in the page's data by `"uri"`.
Only a page under /networks/mainnet or a bare row id is looked at, so other pages cost nothing.

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
  /guides/mainnet/<chain> — and the gray one is **"Our validator"**, the row's Explorer. Lido,
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

## The guide page (2026-09-22, design *Staking Guide Variation 1d*)

One step per screen. An ink head with the chain's disc and the wallet's mark, the Title and the
Lede; a paper band per step carrying the number, the surface as a link, the title, the body, the
"Watch out" note and the capture, with the step's numeral hollow at the bottom right and its green
fill rising with the reader's progress; an ink close with the next guide.

**Every word is Notion's**, in three places:

| What | Where |
|---|---|
| A step: its capture and its words | **one row of the guide's own slide database** — `Name` ("01 · Unlock Keplr"), `Step`, `Body`, `Watch`, `Surface`, `Link`, and the capture as the row's `Cover`. Everything about a step is one record (asked for 2026-09-22; the copy was briefly in toggles on the page and that is gone) |
| The head's Title and Lede | **properties of the `Guides Database` row** (added 2026-09-22) — Super does not render a row's properties on its own page, so they are read off /guides, as post.js reads the blog index |
| The crumb, "Watch out", "{N} screens", the close band, the Discord line | the **"Guide page copy" toggle on /guides**, `key · value` lines — one place for 33 guides. `{n}` is the step count, `{N}` the same spelled ("Eight screens"), `{next}` and `{chain}` the next guide |

**Each guide's slide view must show Step, Body, Watch, Surface and Link** — the API cannot switch
a view's properties on, and it is one view per guide. A guide whose slides carry none of them is
left exactly as it was, so the set can be converted one guide at a time.

`guide.js` reads the deck and nothing else: it is **the collection whose cards are not links**
(the other one is "View More Guides"), a row without a `Step` is skipped (the cover slide), the
**longer of the two text properties is the body** and the other is the note — position would break
on a step with no note, and Super's property hashes differ from one guide's database to the next.
A mark is the `data-full-size` on the Networks set's and the Wallet Set's own cards on /guides,
never a guide card, or "Axelar" answers with the guide's cover instead of the chain's glyph.

**The close band carries a way out** (handoff, 2026-09-23): "Need help? Ask on Discord" on its own
line under the two buttons, so it is not weighed against them — its words and its URL are two more
lines of the copy toggle (`help`, `help url`). The **capture frame is 4px on paper with a 1px ink
border** — the selected-state hairline, because on this page the capture is the one thing to look
at; it was 12px on ink with a `#D9D9D2` ring until that pass.

**A step is the design's own boxes** (re-read 2026-09-25, v293): a header (count and surface |
title, body, and on a wide step the note), then the capture 24px under it — or, tall, a row of
the capture and the note beside it. It had been one grid whose note row was `1fr`; in a
one-screen band that row took the spare height and the capture sank to the bottom (334px down at
1440×900 against 196). Tall or wide is guessed from the surface ("extension") at build and settled
by the capture on load. The headings carry `!important` (minima had the head at Outfit 800 48px and
the step and close titles at 500 35.2px), the numeral is the file's own formula (488px at
1440×900), and the dots are `background-attachment: fixed` — the file's single sticky ground.
**The frame follows the capture**: a wallet shot is tall (360:788) and stands beside the note; a
dashboard shot is wide (16:9) and runs under the header. `guide.js` reads the file's own
proportions on load and sets `[data-enc-shot]`. The band is one grid, so opening a note never
squeezes the capture. Sizes and how the captures are taken: `notion/guide-screenshots.md`.

**Axelar is nine steps, not eight.** The handoff writes eight; the guide's own slides number nine
(its second file carries steps 1–3 in one frame, and the last is the dashboard confirmation), so
"Check us before you pick" is split into *Find us in the list* and *Check our numbers*. The row's
`Step` is what the picker and the head count, so it follows the slides.

**Three traps paid for.** The deck was found by "the cards that are not links" until `Link` was
switched on — Super renders a card with a url property as an anchor, so both collections became
links and the page fell back to raw Notion; it is found by **numbered titles** now. The body and
the note were told apart by length, which swapped them on every step whose note was the longer
line; they are read **in the view's order** (Body, then Watch — Super drops an empty property, so
a step with no note simply has one text), and a text repeating the step's title is skipped, which
is a `Title` property left on beside `Name` (the slide database had one; it was deleted). And the
build has to claim the page
(`[data-enc-guide]`) **before** the index fetch — the observer fires again while it is in flight
and two builds appended two sets of bands.

Snapping is the design's, moved to the document: Super is the scroller, so
`scroll-snap-type: y mandatory` is set on `html` for this page and every band is a stop, the
footer included, off under 701px and with reduced motion.

**The page opened at its foot** until 2026-09-23: ten screens are inserted above the reader on
build, and Chrome's scroll anchoring answered by holding what they were looking at — the footer —
in place. `overflow-anchor: none` for the page, and guide.js restores the top when the build
started there (a `#block-…` link is left alone).

## The guides picker (/guides, guides.css + guides.js, 2026-09-16)

Design *Guides Set* 6d "One question at a time": the band asks "I want to stake &lt;chain&gt; with
&lt;wallet&gt;." and finishes the sentence as the reader picks. It reads three galleries Super already
renders on the page — the Guides Database, the **Networks set** and the **Wallet Set** — and writes
no copy of its own.

**A linked view is not the database.** Add a linked view of a database to a page and Super renders it
under the *view's* own block id; the source database's id is nowhere in the page, and the source
block can still exist as a plain page link with no rows in it. A view can also be a **table** rather
than a gallery. So `guides.js` finds its two sources by content: of every `.notion-collection` other
than the guides one, the chains are whichever overlaps most with the guide rows' own names, the other
is the wallets; items are gallery cards **or** `tbody tr`, both carrying the title and the glyph. It
marks what it used with `data-enc-source`, which is how the CSS hides them (ids alone did not).

**The Guides gallery view must show Networks set, Wallet Set, Step and Time** — the picker reads the
wallet, the step count and the minutes off the rendered card. They are hidden on the card by CSS.
Notion's API cannot switch view properties on; that is a manual step.

**The picker is its own screen** (design *Guides Picker*, 2026-09-16; *Guides Set* re-read
2026-09-26): the band is at least one viewport tall on the #F2F2ED ground, padded `64px
clamp(28px,7vw,110px) 64px` (88px on top under 500, where the bar is two lines), with a bar across
its top carrying the crumb and a counter — both Notion texts (the last two paragraphs in the callout);
only the counter's two numbers are rewritten by the script, from the chains that have a guide and the
guides it matched. A second IIFE in `guides.js` snaps to it with the Network Count gesture rules but a
single stop: a gesture heading at the panel from within half a screen lands on it, a rest within a
third of a screen settles onto it, nothing under 701px or with reduced motion. The catch rule is
testable in Node (`scratchpad/snaptest.js`) — the automation tab fires no scroll events.

**Once a chain is picked the band grows past the screen** (the wallet row and the 357px card join
the sentence: 1,021px at 1440×900 with the old padding). The handoff of 2026-09-26: 64px top padding
instead of up to 200, and on a pick, if the card's foot is below the fold, guides.js `keepInView()`
scrolls by just that difference (24px of air; never scrollIntoView, never when it fits). The snap
does not undo it — it only catches a scroll heading at the band. Measured with real clicks: 1440×900
and 1920×1080 fit without a scroll, 1366×768 and 1024×768 scroll 65 and 110px, 390×844 280px; the
card's foot at 24px above the screen's edge each time.

**Centre marks the design's way.** Every glyph is `left/top: 50%` + `translate(-50%, -50%)` at 116%
of its disc, so the overflow is clipped evenly. Centred as a grid item instead, the overflow fell to
one side and every mark sat 2.6px low (the user spotted it). Chain disc 24px, answer-card wallet
badge 38px around a 30px mark, answer field 520×272 (1.91:1, the blog covers' ratio).

**Step and Time came from the guides themselves** (2026-09-16): each guide's final slide, taken in
**gallery order** — not filename order — and the step badge read off the rendered image. Largest is
18 steps → 9 minutes, every other Time proportional. Guides for chains that are not in the Networks
set are `Network = Rough` (Stargaze, UX, Quicksilver, OmniFlix, Namada, Juno), which drops them from
the Mainnet view; MELLOW stays Mainnet and so is not reachable from the picker until Mellow is a row
in the Networks set.

## Search and sort on a Notion gallery — the working recipe (2026-09-16)

Super has no search snippet and Notion has no input or menu block, so a gallery's search field and
sort menu are ours to build. This is the shape that worked on /networks (network.js `controls()` /
`applyControls()`, network.css "THE CONTROL BAR"). Reuse it for any other database; only the block
id and the property class change.

**1. Put the controls OUTSIDE Super's markup.** Two earlier attempts failed:
- inside `.notion-dropdown__option-list` (the picker's menu) — the picker's own handlers run first
  and swallow the click, so the field never focused and the menu never opened;
- inside `.notion-collection__header-wrapper` — still Super's element, same result.
What works: append them to the `.notion-collection`, give it `position: relative`, and lay the
controls over the right-hand end of the header row (`position: absolute; top: 0; right: 10px;
height: 50px`), with `padding-right` on the header so the tabs cannot run under them.

**2. Never stopPropagation in the CAPTURE phase on the wrapper.** It looks like a way to keep
Super's handlers out; it actually stops the event before it reaches your own button and input.
This cost an hour. If Super must be kept out, do it on the element itself in the bubble phase.

**3. Focus and open on `pointerdown`, not on the default action.** Super listens on the document to
close its dropdown and cancels pointer events; a cancelled pointerdown focuses nothing. So:
`field.addEventListener("pointerdown", () => setTimeout(() => input.focus(), 0))`, and open the menu
on `pointerdown` with `preventDefault()`. Menu options too.

**4. `hidden` loses to any class-level `display`.** Super renders a card as `display: flex` and the
menu got `display: flex` from our own CSS, so both stayed visible. Always pair it:
`.card[hidden], .menu[hidden] { display: none !important; }`.

**5. Filter and sort the rendered cards, nothing else.**
- search: read `.notion-property__title`, set `card.hidden`;
- sort: set `card.style.order` on the visible ones, and park the hidden ones at a high order so they
  leave no gaps; remember each card's original index on first run for "Default";
- rate-style sorts: parse the property's text (`parseFloat` after stripping `%`), nulls last;
- re-apply on the MutationObserver that already watches for Super's re-renders.

**6. What cannot be done this way.** Counts per tab from the page itself (Super only ships the
active view's rows — the site's counts are read from /services's all-stages view instead, see The
Networks set), and searching rows Super did not render (a view limited to N cards).

**8. Stack the controls above the cards.** Since the set's rows became pages (2026-09-24) every
card carries Super's link overlay (`.notion-collection-card__anchor`, `position: absolute; z-index:
10`). The controls wrapper is a stacking context of its own, so the menu's z-index counts only
inside it; at `z-index: 5` the open sort menu lay under the cards and a click on an option opened
the chain page behind it (reported 2026-09-25). It is 30 now. And an option closes the menu only
after the press ends — hidden mid-press, the click that follows would land on the card. Checked
with `document.elementFromPoint` at the option's centre and a real click.

**7. Testing.** The automation browser delivers no real mouse clicks and freezes transitions, so
click-to-focus cannot be verified there — drive it with `input.focus()` plus a native value setter
and an `input` event, and ask the user to confirm the click itself.

## The filter bar — one component on three pages (2026-09-26, v300, design *Filter Bar Patterns*, G)

`filterbar.js` builds the design's command field: one 44px field — the page's tabs in its left
cell, the search in the middle (a facet option or a sort typed and **Enter** becomes an ink token;
**Backspace** on an empty field takes the last off; the × on a token clears it), and the page's
facets and its sort as icon-led cells at the right, each a panel of options with counts and a
check (a 0-count option is disabled; a panel scrolls past 332px). `window.encFilterBar({ ink,
placeholder, tabs, onTab, facets, sorts, state, onChange })` → `{ el, state, sync }`; it holds the
state and calls `onChange`, **the page keeps its own filtering** (network.js `applyControls`,
governance.js `apply`, blog.js `apply`). Styles main.css §13c, palettes by `[data-ink]`. Under
1024px the cells wrap inside the field and a panel opens the bar's width. It follows the recipe in
"Search and sort on a Notion gallery": choices on pointerdown, a panel closed after the press,
focus in a timeout. `paint()` writes only what changed — the pages' observers would loop on it.

| Page | Left cell | Facets | Sort |
|---|---|---|---|
| /networks | Mainnet / Testnet (Super's picker, hidden, clicked; counts from `encCounts`) | — | Default, Name A–Z, Highest rate (mainnet only) |
| /governance-record | — | Chain (the rows' chains, glyph discs), Vote (dots) | Recent votes, Oldest first, By chain |
| /blog (on ink) | — | Tag (the index's tags, a square mark) | Newest first, Oldest first, Shortest read |

**Nothing matches — the empty set** (handoffs Governance Record Wow, Networks Index, Blog Index
Layouts, 2026-09-26; the design's `FilterBar.emptySet`, "B · the whole set, quietly"). Where the list
would be: a headline quoting the search, the page's whole set as marks at 45% (full and an ink ring
under the pointer; a press filters to it), a count on the record, one line, and two tertiaries — the
page's destination and "Clear filters" — each with the 20px green disc. `window.encEmptySet()` →
`{ el, set(o) }` builds it (main.css `.enc-es`; set() rewrites only what changed, and a mark's node is
a getter, made only when the set's ids change — an image per mark per tick otherwise). The bar's
`update({ q, f, sort })` lets a mark or Clear set the bar's own state. **The words are Notion's**: an
"Empty state copy" toggle after each list (`key · value` lines; `{q}`, `{n}`, `{votes}`, `{chains}`
filled in; the action's link on its value, in the site-URL form), read by `window.encEmptyCopy()` and
hidden site-wide (`.notion-toggle[data-enc-copy]`); each page script keeps a FALLBACK of the same
words for a page Super has not republished.

| Page | Marks (press →) | Line and action |
|---|---|---|
| /governance-record | the record's chains as 22px wells (→ that chain), "1,153 votes · 29 chains" | "Every ballot we have cast…" · How we vote → the pillars heading |
| /networks | the tab's networks as 28px discs (→ search for it); the stage stays beside it | "These are the {n} mainnets we validate…" (testnets: "…we help…") · Book a call |
| /blog | the tags as outlined mono pills (→ that tag) | "These are the tags every post carries…" · Staking guides |

The list goes while it shows: the record's table and pager (`[data-enc-empty]`), the networks ledger
(the set sits in the ledger's own grid cell — in the row under it the two-row stage pushed it 250px
down), the blog's grid and pager. The record's old one-line empty state (a Notion paragraph) was
deleted; governance.css keeps its id hidden until Super republishes. The line keeps the file's 52ch.

**Shortest read** reads the Blogs database's **Read** property (number, minutes — added and filled
2026-09-26 from each post's words at 230 a minute, the rule post.js uses for its "N min"). It has
to be **shown on the /blog gallery view** before the option appears; until then the sort offers
the other two. A new post needs its Read filled (or the script re-run).

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

## Below 900px (2026-09-25, v282)

Every page was checked at 360–880 and fixed where broken, each file in a "BELOW 700px" section at
its end; **every added rule sits in a media query capped at 900px**, and 1440 was proved unchanged
by computed-style snapshots (base = the last release from the CDN, local = the new files; only the
footer's rotating discs differ, and they differ between any two loads). The user's rule: nothing
above 900px changes in this work. What was learned:

- **An absolute `::before` ground escapes a card that goes `position: static`.** The homepage's
  stats and testimonial decks fall back to static cards on phones; each card's ink `::before` then
  sized itself to the page (390×14,607px) and ten of them painted ink over every section below —
  black headings, empty rows. `position: relative` on the cards.
- **Covers (§19 + covers.js):** on phones and to 800px the field box is 93.5vw tall and some
  fields' marks rise above it, so the words reserve `93.5vw × (1 + --enc-field-rise) + 28px`
  (`rise()` measures it). A crumb or foot pair that does not fit on one line stacks
  (`fit()` → `data-enc-stack-top|foot`).
- **The homepage hero** is centred by code since v291 (see Homepage).
- Per page: /governance-record's controls and rows reflow (the rationale is always open on touch),
  /security's sticky blocks are static, /investments' six questions wrap into a grid under 800,
  /networks' sort and search sit under the tabs up to 860, the chain dock wraps under 640 and the
  hero stacks to 900, /blog's grid is two columns at 701–900, the raw guides clear the bar to 900.
- **Left alone on purpose:** the guide's hollow numeral lies behind the capture on a phone (the
  user: by design), the footer wordmark's crop, the cover field's left crop.
- **Still open above 900px** (the user said leave it): the unconverted guides start under the bar
  at every desktop width; /blog's grid squashes at 901–1024; the chain hero is tight at 901–960;
  the booking drawer wraps at 901–919.
- **livecheck** now lets Chrome pick its own port (`--remote-debugging-port=0` + the profile's
  DevToolsActivePort): with a random port, parallel runs attached to each other's browsers.

## The audit of 2026-09-26 — every page the navbar and footer reach, 320–2560

Six read-only auditors (one per group of pages) measured every width with `scripts/audit.mjs`,
reviewed screenshots and used every control with real mouse and keys; the fixes were then made
one at a time, each scoped to the widths where the fault was measured, and proved: the automated
checks clean on 15 pages at 10 widths, and a computed-style comparison at 1440 against the release
before (v304) showing only the intended changes. The old pages (snapshots, Lido DVT clusters, legal,
the rewards calculator) and every guide but Axelar were left alone (the user). v305.

What was broken, now fixed:
- **The navbar's Practices panel** read the record's date by the header "voted on", renamed
  "Recorded" the same day — the latest votes fell back to the note. `READ["/governance-record"]`
  accepts both.
- **Keyboard:** the navbar's group triggers are Super's spans with no tabindex, so Tab never reached a
  menu — navbar.js `keys()` gives each a tabindex, `role="button"` and Enter/Space (a click, once React
  has adopted the node). The compact sheet takes focus when it opens and Tab goes round the bar and
  the sheet only. Super's static.css sets `button { outline: unset }`: every button a script builds
  (`[class*="enc-"]`) takes the house ring on `:focus-visible` (main.css, in the button's own colour
  at 40%, so it reads on paper and ink); a component with its own ring keeps it.
- **/security 04 at 390:** a tap on "03" left "02" selected (the pile's heights moved under the
  smooth scroll) — the chosen step holds for 1.4s.
- **The record's "By chain"** put the database's three empty rows first — unbuilt rows are hidden.
- **/investments "Send the spec"** pointed at a block no longer on /contact-us (Notion link fixed).
- **Chain pages' names broke inside the word** at 901–1919 ("Avalan|che") — chain.js `fitName()`
  measures the longest word on a canvas in em and chain.css takes `min(design size, 100cqi / em)`.
- **React #418 (hydration mismatch) on every page — SETTLED: leave it, and do not raise it again (the
  user, 2026-09-26).** Measured, and left as it is by the user's rule:
  Our scripts build at DOMContentLoaded, before React adopts Super's HTML (the fiber key on
  `.notion-root`); React then throws the built DOM away and renders again, and the observers
  rebuild: a raw-Notion flash at the moment of adoption, 0.1–0.6s on a desktop, 0.3–2s at a 4x
  CPU throttle (`scratchpad/hyd.mjs`-style timelines, ten pages, three loads each). Holding every
  first build until adoption removes the flash but shows raw Notion from first paint until adoption
  — 0.7–7s on a phone-speed CPU (homepage ~3.9s against ~0.5s today). The user: if it makes the page
  slower with Notion visible, don't. So nothing waits for hydration; v305's Menu-button wait was
  reverted in v306 for the same reason (the phone's Menu came in seconds late). A fix that keeps the
  early build would have to rebuild before paint on adoption (observer callbacks, not timers) — not
  attempted.

Responsive, by width:
- **Super's side margin jumped from 24 to 96px at 547** (content narrower at 560 than at 546): from
  547 to 1024 main.css sets `--padding-left/right` on `.notion-root` to `clamp(24px, 16.667vw − 72px,
  96px)`; the homepage above 1920 uses the bands' `max(96px, 50vw − 864px)`.
- **Homepage:** the testimonial quote cleared the names rail (1180–1440); Who we are stacked is one
  left edge and hides "Pick a name"; the contact card's padding on phones and its routes as a list
  under 960; the Why Stake drawings capped at 440px (601–1099); the blog rail starts under its heading
  (≥547); the invisible link list and two empty paragraphs above the footer are hidden (not deleted);
  44px tap rows for LinkedIn and the routes; the table's discs load Super's 96px image, not the
  original (governance.js `small()`).
- **Record:** the vote field three blocks a row on phones (6px marks), the pillar fields without the
  2x2's floor, the ± after a wrapped title's last word (main.css §13d ≤900), the head's button at
  the lede's foot. **Investments:** the status line keeps its shown height; the tabs take arrow keys.
  **Services:** on touch a monitoring chip's first tap fills the sentence, the second follows.
- **/networks:** the count band's tally under the line at 761–1179. **Chain pages:** the dock's facts
  hidden at 761–899, the band tops stacked under 481, the hidden dock out of the tab order, 44px touch
  targets, captions `text-wrap: pretty`.
- **Guides:** the bar and "a wallet" slot on phones; the Axelar step keeps the 1728 composition above
  it; a tall capture held to the screen at 701–900. **Contact:** the calendar frame's floor is the
  booker's 560 under 900.
- **Posts:** empty paragraphs hidden (`:empty`), the rail's progress and ask hidden under 900, a table
  of up to three columns sizes to its words on phones. **Blog:** three-line titles under 900, the last
  card fills its row at 701–900, the lead title a step above the rest on phones; the filter bar's
  panel `min(392px, 60vh)`.
- **Security:** the diagram scales to its frame down to 0.7 (security.js `fitCanvas`) and fades its
  edge while it scrolls, the failover pile steps over its own words under 900, the 02 tabs two by two
  under 600. **Navbar:** the chains' rate hidden at 1101–1365, a 104px wordmark under 360, the stacked
  drawer's calendar a full screen.

Decided with the user after (2026-09-26): the record and the navbar run the full width at ≥1920
(as they are); "1882 votes" stays — it counts votes from before the record was kept; "Hover a
highlighted word" stays; the three blank record rows were deleted (Notion trash); the "Under
reconstruction" banner's Body snippet is to be removed in Super (head/site-body.html is empty); the
blog's no-results state waits for a design. **The EigenCloud pair in the Learn panel:** two guides for
one chain and one wallet — /guides/mainnet/eigen-layer (11 steps, delegate on EigenLayer) and
/guides/mainnet/eigen-layer-lst (18 steps, stake ETH on Lido and restake the stETH) — and the second
carried the first's Title. Its Title is now "Restake stETH with MetaMask", and navbar.js's /guides
reader labels twins by what their Title says they do. The picker still offers one guide per chain
and wallet, so the LST guide is not reachable from it.

**The zk-snarks post's prose** was three JSON code blocks (13, 23 and 31 lines of sentences, 2,096px
lines on a phone). Split at their blank lines, verbatim: 21 paragraphs, and the lines that are only
a formula as 10 plain-text code blocks (consecutive formula lines kept together); the three code
blocks were deleted (originals in backups/zk-snarks-code-blocks-2026-09-26.json).

Still open: the stage block under the index on touch phones, the code copy button over a phone's first
line.

## Things that bite in Super / Notion markup

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

## The Networks set (2026-09-16)

`Networks set` (`3dde800a…33b7f1…`) replaces the old `Networks` database: **one row per deployment**,
28 mainnet + 19 testnet, from design *Networks Set*. Properties: Name, Stage, Reward rate, Role,
Status, Tier, Order, Cover (glyph, uploaded via the file-upload API), Link. Two gallery views,
Mainnet and Testnet, sorted by Order — so the first twelve cards are the god and high tiers.

- **The set is the design's index** (design *Networks Index*, the ledger variant it renders;
  2026-09-25, v295; it replaced 5g, "the mark bleeding", and the old control bar). A Notion
  **Heading 2, "Every network we validate."**, leads the set (it took the place of an empty spacer
  paragraph) and shares its row with the controls, all built by network.js and hung off the
  collection (the recipe below): the **Mainnet/Testnet switch** — it clicks Super's own view picker,
  which stays in the page hidden (a click on a hidden option switches the view); its labels are the
  views' names, its counts `encCounts()` — the **sort** as the design's listbox (Default, Name A–Z,
  Highest rate, the last on mainnet only) and the **field**. Super's gallery cards are the
  **ledger's rows**, two columns under an ink rule: the Cover glyph at 1.28em, the title at
  clamp(30px, 3.4vw, 56px), and at the far end the rate in mono with a "Reward rate" tip, or on the
  Testnet view "Testnet"/"Also mainnet" (the chain runs both, from `encCounts().list`), "—" for a
  blank rate. Beside them a **sticky stage** filled from the card under the pointer: the glyph (the
  card's `data-full-size` original) in its disc, tinted by the chain's place in the whole set, the
  rate (on testnet the name and the Role), and "Open <chain>" to the row's page (a testnet row
  opens the chain's mainnet page). The fixed labels are CSS `content`, as 5g's "Reward rate" was.
  Traps met: the card's content box is `display: contents` but still the title's parent, carrying
  Super's 12px — `font-size: inherit` on it; the Card System clears the gallery's border, so the ink
  rule needs `!important`; the tips are pinned to the label's right edge, since a centred pill at
  the row's end widened a phone's page by 21px, unseen. The section runs the page's width at the
  design's sides (in the page's 96px margins the columns were too narrow for the names); the ledger
  is one column under 1300px (the design's 1100 broke "Avalanche" at 1280), the stage drops under it
  at 760. Only "Chain4Energy" still breaks mid-word, between 1300 and 1700 — as in the design.
- **The staking properties** stay on the Mainnet view for the chain pages and off the rows.
- **5m, the chain-teams band** (callout `3dde800a…9995f7…`; design *Networks Set v2*, 5m, 2026-09-26,
  v314 — it was ink with one strip until then): **paper-2 `#F2F2ED`**, full-bleed, padded `46px 44px
  48px` — the kicker "For chain teams" (mono 11, `#575B55`), "Thirty-five teams chose us." (Outfit 600
  42px, ink, 18ch; the number rewritten from the set), the line (16/1.56, `#3A3D38`, 46ch) and Book a
  call and What we run as the light pair at 48px — and **under them the set as two rows** flush with
  the band's sides and foot: every chain as a name at `clamp(40px, 5vw, 72px)` with its glyph at
  1.35em, **the god, high and medium tiers on the first row drifting left over 120s, low and filth on
  the second drifting right over 55s** (the tier is never shown). Names and glyphs rest `#6B6F68`; the
  glyph is a **CSS mask** filled with the name's colour (assets.super.so answers CORS with `*`);
  hovering or focusing a name fills it with its tint (the chain's place in the whole set), turns name
  and glyph ink and pauses both rows; reduced motion stills them; each row's loop copy is
  `aria-hidden` and out of the tab order. **The chains and their tiers come from the whole set, in its
  Order**: navbar.js's `readCounts()` keeps `list` — every chain once with its glyph, its **tier**
  (the Tier pill, since v314; a kept count without tiers is read again) and the page a mainnet row
  links to — from the all-stages view on /services, and `window.encCounts()` hands it to network.js.
  A testnet-only chain is a name with no link. If the read fails, the rows are drawn from the cards
  on the page, split at the middle of the Order. **The callout's content box clips** (Super's
  `overflow: hidden`): the rows' reach past the band's padding only shows with `overflow: visible`.
- **Every network count is the Networks set's own** (the user, 2026-09-24: one source). Super ships
  only the rendered view's rows, so no page can count the whole set from itself — except /services,
  whose linked view of the set shows every stage with **Stage switched on** (the user did that on
  2026-09-24). `navbar.js` `counts()` fetches /services once per visit (kept 30 minutes in
  `sessionStorage["enc-counts"]`), counts the cards whose Stage pill reads Mainnet or Testnet, and
  the distinct names, and publishes `window.encCounts()` → `{mainnet, testnet, chains}`. Readers:

  | Where | What | Script |
  |---|---|---|
  | navbar, Networks group | "27 mainnets, 20 testnets" (item line and preview), "See all 27" | navbar.js `applyCounts()` |
  | /networks count band | the two figures (27, 20) | network.js `figures()` |
  | /networks 5m band | "Thirty-five teams said yes.", "+23 more" | network.js `figures()` |
  | homepage stats band | "Number of Networks Supported" (27) | home.js, Why Stake IIFE |
  | homepage Why Stake | "27 secured" and the dots | home.js — falls back to the homepage gallery's cards |
  | /services ask | "Thirty-five chain teams…" | services.js — counts its own view of the set |

  Only the digits (or the leading spelled number) are replaced, so the words stay Notion's. **The
  numbers typed in Notion, and CONTENT/FOOT in navbar.js, are the fallback** — keep them right when
  the set changes, since they are what shows if /services cannot be read or before it arrives. If
  the view on /services loses its Stage property, every count falls back.
- **The old `Networks` database is not to be used for anything** (the user, 2026-09-24) — not for
  values, not for chain pages. Its item pages (/networks/mainnet/<chain>) carry stale "Expected
  Reward Rate" lists.
- **Every script now prefers this database:** `covers.js` reads it by id, `home.js` uses it when a
  view of it is on the homepage (old gallery is the fallback), `network.js` builds 5m from it.
- **Staking values (2026-09-24):** the 28 mainnet rows carry Address, Reward rate (real, **after
  our commission**, as text), Rate updated, Commission (percent), Compounding (Auto/Manual),
  Unbonding (words), Chain slashes (principal can be taken), Slashing events (applied, any validator
  of ours on the chain) and Explorer — every value read from the chains, with method and sources in
  `notion/networks-set-values.md`. They are **not shown on the Mainnet view** yet; a chain page will
  read them off /networks (the Mainnet tab ships all 28 rows), so they must be switched on there and
  hidden on the cards by network.css (v262: every card property but the title, the rate and the
  role is `display: none`, and a card counts as testnet only when it shows nothing but its name).
  Testnet rows stay empty.
- **Slashing events count only our own incidents on a live validator** (the user's rule,
  2026-09-24): network-wide incidents and old validators we shut down deliberately do not count.
  So the old jailed Gitopia and ixo validators' 0.01% slashes are 0. Gravity Bridge is **0 by the
  user's decision** (2026-09-24), though the chain records three 0.1% slashes on our live validator
  (the bridge module's missed-confirmation penalty) that could not be dated or shown network-wide.
  Agoric lists the "Encapsulate" validator, not the "fka KingSuper" one.
- **Both views must be sorted by Order ascending** — without a sort Notion returns rows in reverse
  creation order, which puts the smallest chains first and gives 5m the wrong twelve marks.
- The old gallery's CSS (pill, pastel tiles, side image; 456 lines) was removed on 2026-09-16: every
  rule used global collection classes and reached the new cards.

## The governance record — how it is filled (2026-09-17)

The record is a Notion database, `Governance Record` `c458e5dd…`, read by the homepage's 37h table
and by /governance-record. Two jobs keep it current, both in `scripts/` and both re-runnable:

| Script | What it does |
|---|---|
| `scripts/notion.py` | the shared client. Token from `NOTION_TOKEN`, else `~/.notion-covers-token`. Never print it |
| `scripts/gov_rationales.py` | writes **Rationale** on every row |
| `scripts/gov_upgrades.py` | adds the upgrades on the god and high tier chains that asked something of the validator |
| `scripts/gov_proposals.py` | turns those rows into improvement proposals (ACP/NEP/MIP/ELIP), and retitles the rest |

**Rationales.** A rationale that already says something specific is kept and tightened — the
lead-ins ("Encapsulate votes YES because…", "We're in favour of…") dropped, cut to two sentences —
unless dropping the lead-in would leave the proposal's own title standing as the reason, in which
case the original wording stays. Boilerplate ("We support this proposal.", "Malicious Proposal.")
and empty ones are written from the vote and the proposal's type: upgrades, parameter changes,
spends, contract work, IBC repairs, signalling, and the scam airdrops that are vetoed. The wording
is picked by a hash of the row id, so a row always gets the same line and a re-run is a no-op.
The lines are **principle-based**: accurate about the vote and the kind of proposal, never claiming
a specific action we cannot evidence. 2026-09-17: 1,106 rows — 465 tightened, 641 written.

**Upgrades.** What counts is the user's rule: a proposal or release that required a **vote** or a
**software upgrade by the validator**. Weekly maintenance releases, rc/alpha builds and
testnet-only tags are left out. Every source is a public GitHub releases API and needs no key:

| Chain | Repo | What marks a row |
|---|---|---|
| Avalanche | `ava-labs/avalanchego` | notes say "must upgrade"; the named upgrade (Helicon, Granite, Fortuna) is in them |
| Near | `near/nearcore` | "protocol version N", and the date voting opens — NEAR counts a validator's vote only if it already runs the code |
| Sui | `MystenLabs/sui` | `mainnet-*` with "Protocol Version: N"; two thirds of the stake vote the version in |
| IOTA | `iotaledger/iota` | `[Mainnet]` releases, same shape |
| Zilliqa | `Zilliqa/zq2` | notes contain a hard fork |
| Mina | `MinaProtocol/mina` | mainnet hard-fork and stop-slot releases |
| Starknet | `NethermindEth/juno` | breaking releases of the client we attest with |
| EigenCloud | `Layr-Labs/eigenlayer-contracts` | the named protocol releases |
| Monad | `category-labs/monad-bft` | consensus client releases |

**The date is the release's own date**, or the day voting opens where the notes give it — never
today's. On a chain with no on-chain vote the row is YES because running the release is how support
is expressed, and the rationale says so. Rows are matched by (Chain, Proposal Title), so re-running
adds only what is missing. `--dry` prints without writing. A row may still predate our deployment
on that chain — the script cannot know, so check new rows before publishing.

**Proposals, not releases (2026-09-17).** The record is a record of *votes*, so a row has to read
as the proposal it is. `scripts/gov_proposals.py` rewrote what `gov_upgrades.py` had written:

| Chain | Where the reference comes from |
|---|---|
| Avalanche | the release note lists the ACPs the upgrade activates → one row per ACP, titled from the ACP's own README (`avalanche-foundation/ACPs`) |
| Near | nearcore notes link the NEPs a protocol version stabilises (`near/NEPs`) |
| Mina | the Mesa hard fork carries MIP-0006…0009 (`MinaProtocol/MIPs`) |
| EigenCloud | each core release implements named ELIPs (`eigenfoundation/ELIPs`) |
| Sui, IOTA, Zilliqa, Starknet, Monad | no proposal document — the vote is the protocol-version vote itself, or running the fork build. The reference stays empty and the row is titled as the protocol change, never as a release tag |

`Proposal Id` is **rich text** now (it holds "ACP-176"), which makes the id, the proof and the
rationale all `td.text`. Both tables therefore tag their cells from the **header labels**
(`governance.js` `columns()`, `home.js` `mark()`) and order on `[data-enc-cell]` — Notion's type
classes and `nth-of-type` cannot tell those three columns apart.

## TODO — run both governance jobs from a GitHub Action (agreed 2026-09-17, not built)

Both scripts above are written to be run unattended; nothing about them needs a browser. The shape:

- a scheduled workflow in this repo (weekly is enough for upgrades; rationales only need running
  after rows are added), `python3 scripts/gov_upgrades.py` then `python3 scripts/gov_rationales.py`;
- `NOTION_TOKEN` as a repo secret — the integration already has access to the database. `GITHUB_TOKEN`
  is read if present, only to raise the GitHub API rate limit;
- run `--dry` on a pull request and the real write on the schedule, so a human sees what a new
  release would add before it lands on a public page;
- the same Action is the natural home for the APY job below — one scheduled job that writes Notion,
  rather than two.

## Done — the Networks set's rates are real (2026-09-24)

The design's invented rates were replaced on 2026-09-24 with rates read from each chain (after our
commission, dated in **Rate updated**) for the 28 mainnet rows. Mina, EigenCloud and SSV.network
are blank on purpose — see `notion/networks-set-values.md`. They drift: refresh them by hand or
with the Action below, always with the date.

## TODO — a GitHub Action to fill the APY property (agreed 2026-09-16, not built)

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
- **Mina fee:** Auro's list says 5%; /networks/mainnet/mina (an existing chain page, from the old
  Networks database, whose "Expected Reward Rate" list is stale) names no fee. Confirm.
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
  among the seven operators, 10.2% of it each — about 0.82% of the rewards our validators earn.
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
pointing at the mainnet row, so it gets /guides/mainnet/&lt;chain&gt;), switch that page over:

1. in `notion/chain-pages.json`, set the chain's `wallet` to `{"label": "Delegate with <the guide's
   wallet>", "url": "https://www.notion.so/<the guide's page id, no dashes>"}` — the same shape as
   the other 24;
2. `python3 scripts/chain_pages.py --buttons "<Name>"` (replaces only the button block);
3. after Super republishes, check the chain page's green button reads /guides/mainnet/&lt;chain&gt;.

Raise this whenever guides are being worked on.

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

## A page that ends in a band runs into the footer

Super pads the article and the main below the content. Where the last thing on a page is a
full-bleed band, that padding reads as a strip of ground above the ink footer, so the page zeroes
it: `/guides`, `/security`, `/investments`, and since 2026-09-21 `/networks`, `/brand` and
`/contact-us` (`.super-content.page__<slug>` and its `.notion-root`). A page that ends in ordinary
content keeps the padding — it is breathing space, and on the paper ground it reads as such.

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

## Article blocks — the four generic Notion blocks (2026-09-25, design *Blog Article Blocks*)

main.css §12–13 and `blocks.js` give four Notion blocks their house form **wherever a page has not
drawn that block itself** — in practice the blog posts, and any future page. The chosen variants:

| Block | Design | Built from |
|---|---|---|
| Code block | **H**, the terminal well: paper-2 `#F2F2ED`, 4px, no border; JetBrains Mono 13.5/1.6; line numbers and, in a shell, a `$` prompt (`›` on a continued line, nothing on a comment or a heredoc body), both grey and unselectable; four type colours (ink, ink 700, green ink `#3F6B27`, grey); Super's own copy button as the 32px icon control, a tick while it reads "Copied"; a mono kicker above and a grey caption beneath | CSS + `blocks.js` (Super serves the code as plain text, so numbering and colour need a script) |
| Comparison table | **A**, the hairline table: mono heads over a black rule, hairlines, the header column in Outfit 600 and pinned when the table scrolls (min width max(480, 112 × columns)) | CSS only. Notion's own options pick the parts: **Header row** → `.col-header`, **Header column** → `.row-header`. A table with no header row stands on the black rule |
| Toggle | **B**, hairline rows under a black rule, Outfit 600 17, the 20px green badge with a plus at rest and a minus open | CSS only (Super's `.open`/`.closed`) |
| Link preview | **D**, the 12px ring-and-highlight card: a 160px field (the page's image, or a paper-2 well with the site's icon), the domain in mono, the title, a two-line lede | CSS only; a bookmark and an external object (GitHub) take the same card |

**The claims.** Each family's selector excludes the scopes that draw the block themselves, entirely —
not property by property: toggles skip `[data-enc-security]`, `[data-enc-invest]`, `[data-enc-fold]`
and the hidden copy toggles; tables skip `[data-enc-chain]`; every family skips `[data-enc-source]`.
**A page that styles one of these blocks itself adds its scope to that family's claims in §12.**
Checked on 2026-09-25 by snapshotting 324 elements' computed styles on the eight pages with claims
(/security, /contact-us, /investments, a chain page, /services, /blog, /guides, /networks) before
and after: no differences.

**The kicker is written in Notion**: start the code block's caption with the file name as inline
code — `` `install.sh` Run as a user with sudo… `` — and blocks.js lifts it into the kicker ("bash ·
install.sh"); the rest stays the caption. No inline code at the start, no kicker. The language is
the block's own; **Plain text** is read as output (no numbers, no prompt; timestamps and levels
grey) or, when every line has the same number of commas, as a CSV grid. Notion has no CSV or log
language.

**Posts:** post.css caps a toggle at the code block's 680px and takes the article's 24px gap back
between two toggles, so a run reads as one list. The post's link rule (a green rule under
`.notion-link`) is one class more specific than a card, so the card's anchor is selected as
`a.notion-link`. Super fixes a bookmark's description at `height: 2rem` and `opacity: .6`; both
are undone.

**Notion changes made for it (2026-09-25):** Header row switched on for FogoChain's phases table,
Aleo's ports table and the second Zk-SNARKs table (their first rows were column labels); Header
column for Aleo's hardware table (CPU, Memory, Disk… are row labels); the Avalanche guide's NodeID
block from bash to plain text (a value, not a command — it would have carried a `$`).

**Not in the handoff, still open:** inline `code` spans, a code block on an ink band (the file
defines dark token colours but no ink well), a toggle heading (a heading block made toggleable),
and an internal link preview's field drawn from the post's chain glyph (every bookmark on the site
today is external).

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
- Refresh the Notion integration token.
- Search and sort controls for a gallery are possible but unbuilt: Super ships no search snippet
  (its "dynamic database filters" are roadmap), so an input plus reordering of the rendered cards
  would be ours. Sorting alone can be done with extra Notion views and the view picker.
- The booking drawer is designed in `demo/booking-compare.html` but **not** on the site — the user is
  sending a drawer design first. Every "Book a call" opens https://cal.com/aditya-encapsulate/30min
  in a new tab meanwhile.
