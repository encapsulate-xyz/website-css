# A new row in a database — the checklist

Asked for on 2026-09-28: every time a page is added to one of the site's databases, these are the
extra steps, beyond writing the page itself. Go through the section for that database top to bottom;
each box is something that has gone wrong, or would have, when it was skipped.

**For every new row, whatever the database:**

- [ ] The row is **shared to the web** in Notion, or Super cannot fetch it (a trashed or private page
      is a 404; one that was already live keeps serving from Super's cache until its next refetch).
- [ ] Its **path in Super** (Pages) is the one we want — short and lower-case, like the others.
- [ ] **No spacing blocks**: no dividers, no empty paragraphs — space is CSS (CLAUDE.md, "No divider
      makes space anywhere").
- [ ] **Refresh the page in Super**, and the pages that list it (named below) — Super does not pick up
      a Notion edit until it refetches, and its own sync can take hours.
- [ ] **Check it on the live site**: the page builds, it is in `sitemap.xml`, it has no `noindex`, and
      its `og:image`, title and description are the new ones.

## SEO — every new page, whatever it is

The user, 2026-09-28: every page added to the site goes through all of these before it is done — they are
the steps of the SEO audit of 2026-09-26/28, for Google and for AI search. Keep this list current.

- [ ] **Its head in Super carries its canonical**, `<link rel="canonical" href="https://encapsulate.xyz/<path>">`
      (the homepage's ends in `/`). A page with a `head/*.html` file: add the line to the file, commit,
      and paste the **whole file** over the page's head. A post, guide or chain page (no file): its head is
      that one line. **Read the page's snippets first — a page holds one head, and writing a new one
      replaces what is there** (on 2026-09-28 that took every main page's CSS; see CLAUDE.md "Head files").
- [ ] **Title** under 60 characters, " - " as the separator where the page carries the site's name: a post's
      own Name (or a shorter `meta:title`), a chain page "<Name> staking - Encapsulate" (`og_cards.py
      chains`), a guide "<Chain> Staking Guide" in Super's SEO settings, a main page "<Page> - Encapsulate".
- [ ] **A description of its own**, 120–160 characters, not shared with any other page: a post's Lede, a
      guide's "Title. Lede" (`og_cards.py guides`), a chain page's facts sentence (`chain_pages.py --facts
      "<Name>"`), a main page's Super SEO description. The pre-audit crawl found 17 guides sharing 5.
- [ ] **Social card**: `scripts/og_cards.py posts|chains|guides --only <path>`, then **refresh the page in
      Super twice** — the first build serves Notion's signed file link, which expires; the second serves
      Super's `assets.super.so` copy. Check `og:image`'s host.
- [ ] **The facts are in the HTML**, not only drawn by a script — AI crawlers (GPTBot, ClaudeBot,
      PerplexityBot) do not run JavaScript. A chain page: `chain_pages.py --facts "<Name>"` after its
      properties are set (and again whenever they change). A post or guide: its words are Notion blocks.
- [ ] **Links in**: a plain `<a>` reaches it — a post from /blog, a chain page from /networks, a guide from
      /guides and its chain page's green button, and a post about a chain that is live links that chain's
      page in its foot.
- [ ] **Structured data** builds: `script#enc-ld-post|chain|guide` in the head once the page has built
      (post.js, chain.js, guide.js); the homepage's Organization and WebSite are in `head/home.html`.
- [ ] **Not ready, not public**: a draft has no path in Super or is not Live; noindex only in that page's
      own head, **never** in the site-wide head.
- [ ] **A renamed or moved page** 308s from its old path (a `permRedirect` page in Super), and any typed
      link to the old path in Notion is updated. A removed page with a clear successor redirects to it;
      one without simply goes (404).
- [ ] **Check the live HTML** after the refresh: status 200, one canonical and it is its own, the title, the
      description, `og:image` on assets.super.so, no noindex, in `sitemap.xml`. For an important page, ask
      Google to index it (Search Console → URL inspection → Request indexing — the user's account).

## Removing a row

- [ ] Back it up first (the row and its blocks, as `backups/<what>-<date>.json`).
- [ ] Remove its page in Super (`removeSitePage`), then put it in Notion's trash — a refetch of a trashed
      page makes it 404, but Super keeps serving its cached copy until then.
- [ ] A successor exists (a guide for a guide post)? Add a 308 at the old path to it.
- [ ] Refresh every page that listed it — /blog, the homepage, **and every post** (each still carries the
      old "More Blog Posts" gallery in its HTML, hidden on screen but read by crawlers).
- [ ] A post: the /blog cards and the social cards take their tint from the post's place on the index, so
      the posts after it shift — re-run `og_cards.py posts --only …` for those whose `i % 5` changed.

## Blogs — a new post (`a148eb7f…`)

- [ ] **Start from the template** — "New page", the database's default (rebuilt 2026-09-28): the
      contents column (Notion's table of contents) beside the article column, which opens on an empty
      paragraph — nothing else. Status starts as In Progress — set Live when it is ready. ("More Blog
      Posts", its gallery and its button were taken out on 2026-09-28: the post page hides them and
      takes the next post from the /blog index, and its foot links back to /blog.)
- [ ] **Properties:** Name (the title), Published Time, Tags (**one**, the post's category: Networks,
      Trends, Security, Zero knowledge or Operations), Status = **Live** (anything else is left off the index),
      **Lede** (the head's two lines), **Network** — pick the post's row in the Networks set (its mainnet row
      if we run the mainnet, else its testnet row; leave it empty for a chain not in the set or a post about
      no chain): it gives the closing ask, its chain name, the link and, through **Network token**, the ticker —
      **Read** (minutes at 230 words a minute — "Shortest read"; the daily job fills it). **The byline is whoever creates the row** (Person =
      Notion's "Created by"; there is no Author property since 2026-10-01), so the post's author creates it.
- [ ] **Cover (2000 * 408)**, first file = the post's **glyph**: a 600×600 PNG, black mark, the ink 80%
      of the frame (the `blog-glyphs` convention). It is the index card's mark, the post head's mark and
      the social card's glyph. No chain? Leave it empty — the card takes a pastel shape.
- [ ] **The page:** the article in a two-column block with Notion's **table of contents** in the first
      column (post.js finds the post by it); **no** H1 repeating the title and **no** "Written by" block
      (the head is the title, the byline comes from Person, the row's creator); no banner image at the top; section
      headings are Heading 2; a code block's caption starts with its file name in inline code for the
      kicker; a table with column labels has **Header row** on.
- [ ] **Social card:** `python3 scripts/og_cards.py posts --only <slug>` (after the post is live — it
      finds the row through the sitemap). Sets `meta:image` and `meta:description` (the Lede). No
      `meta:title`: the post's own title is the page title.
- [ ] **Refresh:** the post, /blog and the homepage (its rail shows the newest three).
- [ ] **Check:** its card on /blog (category, date, glyph), the post's head, rail and "next post", and
      the Learn panel in the navbar (it reads the first four cards).

## Networks set — a new chain we validate (`3dde800a…33b7f1…`) — the whole run

Done end to end for **Cosmos Hub on 2026-10-05** (mainnet and testnet, after Axelar); the user asked for it to be
written down as a repeatable process. Go top to bottom; nothing here follows from anything else by itself unless it
says so. Ask the user only what is theirs: the chain's place in the order ("after Axelar"), whether its testnet goes
in too, and which logo if the chain has more than one.

**1. The glyph** — the chain's own current mark, never a re-drawing.
- [ ] Find the official vector: the chain's site (its structured data names the logo file — cosmos.network's
      `"logo": …/images/cosmos-logo.svg`), its brand kit, then `cosmos/chain-registry` `<chain>/images`. A
      wordmark carrying the mark can be cut: take the mark's `<path>` alone into its own SVG (the Cosmos Ø is
      path 5 of the wordmark). The site icon (`/icon.png`) shows what the mark is meant to look like.
- [ ] `scripts/make_glyph.py <mark.svg> <out.png> --mode alpha` (see `scripts/GLYPH-SPEC.md`). It needs
      pillow, numpy and cairosvg, which no Python here has: `python3 -m venv <scratchpad>/glyphenv &&
      <scratchpad>/glyphenv/bin/pip install pillow numpy cairosvg`, then run it with that python. Pass: 600×600,
      opaque share 5–13%. Look at it on a pastel disc on paper and on ink before uploading.

**2. The facts, read from the chain** — and written down in `notion/networks-set-values.md` (Per chain).
- [ ] Rate: the site-data reader, `node -e` on `sources/cosmos.mjs` `apr({rate:{source:"measured",slug}})`
      (staking-explorer.com; check the slug answers — `cosmoshub`, not `cosmos`), cross-checked with
      `calculated_apr` and the wallet's own figure. **The row's rate is after our commission**: APR × (1 − rate),
      one decimal.
- [ ] Commission (rate, max, max change), unbonding, slashing params, minimum self-delegation, delegators.
- [ ] **Since** = the validator's signing-info `start_height` → that block's time (the commission's
      `update_time` is the creation time too). Block time = blocks since then over the seconds since then.
- [ ] Any older validator of ours on the chain (KingSuper on the Hub): its state, and that it is not the one shown.

**3. The rows**
- [ ] Back up the whole set (`backups/networks-set-before-<chain>-<date>.json`).
- [ ] **Make room in the Order**: every row (mainnet and testnet) at or after the new place moves down one —
      a chain's mainnet and testnet rows share one Order, and every view sorts by it.
- [ ] **Mainnet row**: Name, Stage Mainnet, Order, **Tier** (god, high, medium, low, filth — its row in the
      /networks close, its tile on /services; the L1 openings page's `tiers` in picks.json says what it was rated),
      Cover (the glyph, `notion.upload`, one upload per row), Token, Address, Reward rate + Rate updated,
      Commission, Compounding, Unbonding, Unbonding days, Chain slashes, Slashing events, Explorer, Since.
      Leave Status and Role empty (mainnet rows carry neither).
- [ ] **Testnet row** if we run its testnet: Name, Stage Testnet, the same Order and Tier, Cover, Status
      ("Live on both" — or "Not launched yet" for a testnet-only chain), Role ("Operating its testnet").

**4. The chain page** (mainnet rows only)
- [ ] `notion/chain-pages.json`: a record after its neighbour, in the others' shape — the line, the green
      button, the four "what we run" rows, the five questions from step 2's facts, `research` with "since how",
      "cadence", the rate, sources and notes, and `other` (our validator on the explorer).
- [ ] **The green button** is our guide for that chain once the guide is Live; until then the wallet's own
      staking page with our validator — for a Keplr chain
      `https://wallet.keplr.app/chains/<keplr slug>?modal=staking&chain=<chain id>&validator_address=<valoper>&step_id=2`.
      Load it in headless Chrome (`scripts/livecheck.mjs`) and check it lands on the chain.
- [ ] `python3 scripts/chain_pages.py --dry "<Name>"`, then without `--dry`, then `--facts "<Name>"` (the facts
      paragraph and `meta:description`).
- [ ] **Super**: `createSitePage(input: {siteId, type: "page", notionPage: <row id, no dashes>, path:
      "networks/<slug>"})`, then — the new page has no head — `createSiteSnippets` with its one canonical line.
      (On a page that has a head, read it first and `updateSiteSnippet` the whole thing.)

**5. The counts typed as fallbacks** — the live counts come from the set (`encCounts`, read from /services), but
these are what shows before that read lands, and what a crawler reads. Find them by scanning the served HTML of /,
/networks and /services for the numbers; on 2026-10-05 they were (block ids):
- [ ] homepage stat `5a0aab75…` ("28"), Why Stake database (`bd1e4d48…`), the "No slashing" row (`464530ed…`)'s **Caption right**
      ("28 secured");
- [ ] /networks eyebrow `3e6e800a…8084ef7b` ("28 mainnets · 21 testnets"), the mainnet count `3dce800a…8471935d`
      ("28"), the testnet count `3dce800a…75afdf49a2` ("21"), the close's heading `3e7e800a…fd75c9b60` ("Thirty-six
      teams chose us." — the number of distinct chains, mainnet or testnet);
- [ ] /services ask `3e4e800a…2f95f47fb4` ("Thirty-six chain teams…");
- [ ] `navbar.js` CONTENT["/networks"] ("28 mainnets, 21 testnets") and FOOT ("See all 28") → build, release,
      paste the site head (by hash), refresh every page.
- Back up each block first; they are single plain runs — write plain text.

**6. What follows by itself — check it, do not assume it** (`encCounts()` returns a **promise**: await it)
- [ ] `await encCounts()` on /networks: mainnet, testnet and chains counts, and the chain in `list` at its Order
      with glyph, href and tier.
- [ ] /networks: its row in the index after its neighbour; **the lens** — save `.enc-lens-fill`'s background
      (a canvas PNG) and look for the glyph after its neighbour; the close's drifting rows (`a.enc-set-name`).
- [ ] **Homepage network section**: `.enc-net__disc` images in order (the chain after its neighbour), the stat,
      "N secured".
- [ ] The navbar's Networks panel and search, the /services ask tiles, other chain pages' pills.
- Two lists are fixed designs and do **not** follow: footer.js ROTATE (ten chains) and covers.js's /networks cover
  field (24 placed marks). Leave them unless the user asks.

**7. The jobs (site-data, the GitHub Actions)**
- [ ] `config/chains.json` (a Cosmos chain: set, record — the Governance Record's Network option, created on
      the first vote — registry, prefix, valopers, explorer, proposal, since, rate) and `config/stake.json`
      (family, registry, address, decimals, coingecko, reference). Another family needs its reader in `sources/`
      first. **Keep the files' own formatting** (2-space JSON) or the diff is the whole file.
- [ ] Dry-run with the chain in: `NOTION_TOKEN="$(cat ~/.notion-covers-token)" DRY=1 node jobs/networks/values.mjs`,
      `jobs/governance/votes.mjs`, `STAKE_NO_WALK=1 … jobs/homepage/stake.mjs`; read the chain's lines in `out/*.md`
      (values unchanged, the stake read).
- [ ] Pull request, merge it at once (`gh pr merge N --admin --merge`).

**8. Its guide** (the user, 2026-10-05: a new chain gets a guide page too)
- [ ] Create it **from the template through the API** — Notion-Version `2025-09-03`, `POST /v1/pages` with
      `parent: {type: "data_source_id", data_source_id: "1f6e800a-5138-8164-8d5d-000b068d57da"}` and
      `template: {type: "template_id", template_id: "1f6e800a-5138-8128-ad09-dc4efb52033d"}` ("Stake TICKER with
      WALLET"), properties Name ("Delegate ATOM with Keplr" — the verb its wallet's siblings use), Networks set →
      the mainnet row, Wallet Set, Network Mainnet, **Status Soon**. The template's column and step database arrive
      a few minutes after the page.
- [ ] It stays Soon with no path in Super until the team adds the captures; then follow "Guides Database — a new
      guide" below (the words, Live, /guides/<slug> with its canonical, the card, refresh /guides) and **switch
      the chain page's green button to the guide** (`chain-pages.json` wallet → the guide's Notion URL,
      `chain_pages.py --buttons "<Name>"`).

**9. The social card** — after the chain page builds live:
- [ ] `python3 scripts/og_cards.py chains --only <slug>` (sets `meta:image` and `meta:title` "<Name> staking -
      Encapsulate"), then refresh the page **twice** and check `og:image` is on assets.super.so.

**10. The L1 openings page** (the networks we do not validate yet)
- [ ] Add the chain to `OURS` in `scripts/l1_openings/build.py`; take it out of `picks.json`'s `overrides`, `flags`,
      `rename` and `picks` (the build exits on a name it no longer lists), and correct the Start here lede's counts.
      Rebuild into the scratchpad and republish the artifact.

**11. Refresh and check live**
- [ ] Refresh the chain page, /networks, /services and the homepage — and every page after a site-head paste
      (in-page loop, 3 at a time, a 30 s abort; retry the ones that time out with 90 s).
- [ ] Every sitemap URL serves the new site head; the chain page is in the sitemap, 200, its own canonical,
      title, description, `og:image` on assets.super.so, robots "index, follow", the facts paragraph in the HTML,
      `script#enc-ld-chain`.
- [ ] Optional, the user's: Search Console → URL inspection → Request indexing for the new page.
- [ ] Update CLAUDE.md's chain page list and `notion/networks-set-values.md`.

## Guides Database — a new guide (`1f6e800a…8181…`)

- [ ] **Start from the template** "Stake TICKER with WALLET" (rebuilt 2026-09-28 after the Axelar guide; it was named
      "NETWORK_NAME"): the step
      database with Axelar's properties and one sample step ("01 · Step title") — nothing else.
      Network starts as Mainnet and Status as Soon — set Live when it is ready. Name the page and its Title
      the same way, "Stake SUI with Slush" (the ticker and the wallet), and
      replace the sample step with the real ones. ("View More Guides", its gallery and its button were
      taken out on 2026-09-28: a guide page hides them and takes the next guide from the /guides index,
      and its close band carries "All guides". It was taken out of every other guide the same day.)
- [ ] **Properties:** **Name** — the guide's title, "Stake AXL with Keplr" (the head, the navbar, the picker, the card;
      there is no Title property since 2026-10-01), **Lede** (the head's
      line; also the description), **Networks set** relation (the mainnet row — the chain's mark; its
      path in Super is /guides/<chain>), **Wallet Set** relation (the wallet must be a
      Wallet Set row with its glyph in Files & media), Step, Time, Network (Mainnet / Testnet; Rough
      keeps it off the picker), Status. (Cover went on 2026-09-28 with the "View More Guides" sections it
      pictured; Ticker is read by nothing.)
- [ ] **The steps:** the guide's own slide database, one row per step — Name ("01 · Unlock Keplr"),
      Step, Body, Watch, Surface, Link, and the capture as the row's Cover. **Its gallery must show Body,
      Link, Step, Surface and Watch, in that order** (Axelar's); the template's gallery carries that
      once it is set there, so a guide made from it inherits it — without them the page stays raw.
- [ ] **A chain page that pointed outside the site** (Lido DVT, Vara, Chain4Energy) now points at the
      guide: set the chain's `wallet` in `notion/chain-pages.json` and run
      `python3 scripts/chain_pages.py --buttons "<Name>"`.
- [ ] **Social card:** `python3 scripts/og_cards.py guides --only <slug>`. Sets `meta:image` and
      `meta:description` (the Lede). Give it the title the other 33 carry, "<Chain> Staking Guide", the
      way they carry it: as the title in Super's SEO settings for that page (the Guides database has no
      `meta:title`).
- [ ] **Refresh:** the guide, /guides.
- [ ] **Check:** the picker offers it (chain and wallet), its head (disc, wallet mark, title, lede, "N
      screens"), a step band, the close's "next guide", the navbar's Learn panel.

## The other databases

- **Governance Record** (`c458e5dd…`): rows come from `scripts/gov_*.py` — run
  `gov_rationales.py` after adding any, and check a new chain has a glyph (the set's, or covers.js's
  list). Vote rows get no social card.
- **Portfolio** (/investments, `807c8bde…`): Name, Description, Category, Since, Validator (one of its
  two options), the logo in Files & media. Refresh /investments.
- **Wallet Set** (`3dde800a…8097…`): Name and the wallet's glyph in Files & media — a guide's badge and
  the picker read it. **Make the glyph with `scripts/make_glyph.py`** from the wallet's own logo, an SVG if at
  all possible (a wallet's npm package or wallet-standard registration often carries it as a data URI —
  Slush's came from `@mysten/slush-wallet`), following `scripts/GLYPH-SPEC.md`: pure black on transparency,
  600×600, longest solid side 288, centred, opaque share 5–13%. Check it beside the others on paper and ink.
- **Team** (homepage "Who we are"): Photo (first file = the portrait), roles as pills — **a role pill's
  colour is the portrait's tint**, set it in Notion (the API cannot).
- **/services tables** (Dashboards, Playbooks, Bot events, Monitoring builds): fill **Order** — Super
  serves rows newest first and the page sorts by it — and a Dashboard needs its Capture and Menu.
- **Colour** (/brand): Name, the value, Set; a ground also its Job line.
