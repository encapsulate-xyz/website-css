# The blog post page

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

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

- **The head** is ink and one screen tall (`min(92vh, 940px)` — **open**: it starts 107px down under the bar and
  Super's padding, so at 1440×900 it ends 35px past the fold where the file's ends above it; the fix proposed on
  2026-09-21 is `calc(100svh - var(--cover-top))`, as the covers do; the user: "don't change anything yet"): the meta line, the title at
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

**The Blogs database carries the page's facts** (reshaped 2026-10-01): `Lede` (the head's two lines — a post's own
opening is the fallback, cut to the same length), **`Network`** — a one-way relation to the post's row of the Networks
set — and **`Network token`**, a rollup of that row's Token. Super draws the relation as a link to the row:
`/networks/<chain>` where it is a mainnet of ours, a bare id where it is a testnet. post.js (v345) takes the chain's
name from the link, our stage from where it points (a chain page → the "Delegate" ask; a testnet → "Running the …
testnet?"), the ticker from the rollup — **Super draws a rollup with the class `property-undefined`**, where every other
property carries a fixed `property-<hash>` — and sends the live ask's button to the linked page. A post about a chain
not in the set, or none, has no Network and gets the standing ask. **Chain, Ticker and Mainnet were deleted** the same
day (values in `backups/blogs-chain-ticker-mainnet-2026-10-01.json`): all three only repeated the set; reading them by
shape had misread XMTP as a ticker, and Mainnet's "Live" was the same word as Status's (v343). Proved before and after
on all 38 posts (`scratchpad/blogrel/`): head, byline, lede, read time, the closing ask, its buttons and the structured
data identical, but XMTP (its testnet ask, a fix) and Canton ("the Canton Network testnet", the set's name). The set's
Near row became **NEAR** (its chain page title follows; Gno.land's testnet row gained Token GNOT). Rollups are kept out
of every tag read (`.notion-property__select:not(.property-undefined)`). **The byline is Person** (Notion's "Created
by", which nobody can edit) with the role from the Team database; `Author` was read by nothing and was deleted
(`backups/blogs-author-2026-10-01.json`) — **a post's author must create its row**. **Tags, one per post since
2026-10-01**: Networks (22), Operations (5), Zero knowledge (5), Security (3), Trends (3); the old six (Informative on 33
posts, New Network, Testnet, Analysis, Services, Guide) are gone (`backups/blogs-tags-2026-10-01.json`). All of these
are read off the index's cards, so **Network and Network token must be shown on the /blog gallery view**; blog.css
hides Super's card content, so the index looks unchanged.

**The post's own duplicate title and its "Written by" block were removed from all forty posts**
(2026-09-21): the head is the title now, so the title comes from the header Super always renders,
and the byline was drawn from `Author` (since 2026-10-01 it is Person — see below). The read time is derived at 230 words a minute, as the
handoff insists — stating it is what let it claim six minutes for a one-minute post.

**The index is fetched once and parsed once, but the post is looked up on every build.** Caching
the lookup gave every post the first one's mark, lede and next, because index → post is a
client-side navigation and the script stays alive across it.

**A post has no Code → CSS of its own** (cleared 2026-09-28). Every post carried the old template's CSS in
Super: the blue table-of-contents rail, "More Blog Posts" limited to five, images centred, embeds 320px
tall under 1240, and — the one rule still doing anything — every Notion column full width under 1024.
Measured in headless Chrome on eight posts at 390–1440 with the CSS on and off: nothing moved but the
columns inside three posts (Governance Bot Improvements, IOTA Rebased, zk-SNARKs), which squeeze between
547 and 1024px without it. **So those columns were taken out in Notion** (the user, 2026-09-28: better than a
CSS rule): each column list became its own blocks in order, first column then second, where it stood —
Governance Bot's chain list and its image, IOTA Rebased's section and its embed, zk-SNARKs' figures 3 and 4
and its "Drawback" section and image; empty paragraphs dropped, the four Notion-hosted images uploaded
again (backup `backups/post-columns-2026-09-28.json`). The stacking rule that stood in for a day (v330) was
removed in v333. **No post has columns inside its article** — write a post in one column. The Solana post's YouTube embed now takes its true 16:9 on a phone (188px, was a 320px box).
