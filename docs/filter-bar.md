# The filter bar, and search and sort on a gallery

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

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
