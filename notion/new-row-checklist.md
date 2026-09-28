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

## Blogs — a new post (`a148eb7f…`)

- [ ] **Start from the template** — "New page", the database's default (rebuilt 2026-09-28): the
      contents column (Notion's table of contents) beside the article column, which opens on an empty
      paragraph — nothing else. Status starts as In Progress — set Live when it is ready. ("More Blog
      Posts", its gallery and its button were taken out on 2026-09-28: the post page hides them and
      takes the next post from the /blog index, and its foot links back to /blog.)
- [ ] **Properties:** Name (the title), Published Time, Tags (the first tag that is not Informative is
      its category; Informative alone is fine), Status = **Live** (anything else is left off the index),
      **Lede** (the head's two lines), Chain, Ticker, Mainnet (Live / Not yet launched — picks the
      foot's ask), Author (the byline), **Read** (minutes at 230 words a minute — "Shortest read").
- [ ] **Cover (2000 * 408)**, first file = the post's **glyph**: a 600×600 PNG, black mark, the ink 80%
      of the frame (the `blog-glyphs` convention). It is the index card's mark, the post head's mark and
      the social card's glyph. No chain? Leave it empty — the card takes a pastel shape.
- [ ] **The page:** the article in a two-column block with Notion's **table of contents** in the first
      column (post.js finds the post by it); **no** H1 repeating the title and **no** "Written by" block
      (the head is the title, the byline comes from Author); no banner image at the top; section
      headings are Heading 2; a code block's caption starts with its file name in inline code for the
      kicker; a table with column labels has **Header row** on.
- [ ] **Social card:** `python3 scripts/og_cards.py posts --only <slug>` (after the post is live — it
      finds the row through the sitemap). Sets `meta:image` and `meta:description` (the Lede). No
      `meta:title`: the post's own title is the page title.
- [ ] **Refresh:** the post, /blog and the homepage (its rail shows the newest three).
- [ ] **Check:** its card on /blog (category, date, glyph), the post's head, rail and "next post", and
      the Learn panel in the navbar (it reads the first four cards).

## Networks set — a new chain (`3dde800a…33b7f1…`)

- [ ] **Properties:** Name, Stage (Mainnet / Testnet), **Order** (its place in the set — every view is
      sorted by it), **Tier** (god, high, medium, low, filth: which row of the /networks close it drifts
      in, and its tile size on /services), **Cover** (the glyph PNG, uploaded), Role, Status, Link.
      A mainnet row also: Address, Reward rate (after our commission, as text) with **Rate updated**,
      Commission, Compounding, Unbonding, Unbonding days, Chain slashes, Slashing events, Explorer,
      Token, Since — each read from the chain, with its source in `notion/networks-set-values.md`.
- [ ] **A mainnet row is a chain page:** Super → Pages → /networks → add /<chain>, pointed at
      the row's share URL. Research its words into `notion/chain-pages.json` (the line, what we run, the
      five questions, sources) and write them with `python3 scripts/chain_pages.py` for that chain. Its
      green button is our guide for that chain if there is one (see "three chain pages still point
      outside the site" in CLAUDE.md), else the chain's own staking page.
- [ ] **Counts follow by themselves** (read from the set on /services), but the numbers typed as the
      fallback do not: "27 mainnets · 20 testnets" and "Thirty-five teams chose us." on /networks, the
      homepage's stat, the /services ask, and CONTENT/FOOT in navbar.js ("27 mainnets", "See all 27").
- [ ] **Hardcoded glyph lists**, only if the chain should appear there: footer.js (ten glyphs) and
      covers.js (the /networks cover's discs).
- [ ] **Social card** (mainnet only, after the chain page builds live — it is a capture of its hero):
      `python3 scripts/og_cards.py chains --only <chain>`. Sets `meta:image` and `meta:title`
      "<Name> staking - Encapsulate". The description is the page's own line.
- [ ] **Refresh:** the chain page, /networks, /services and the homepage.
- [ ] **Check:** the chain page (figures, address ring, questions, buttons), its row in the /networks
      index and in the close's drifting rows, the navbar's Networks panel (first 21 in Order).

## Guides Database — a new guide (`1f6e800a…8181…`)

- [ ] **Start from the template** "NETWORK_NAME" (rebuilt 2026-09-28 after the Axelar guide): the step
      database with Axelar's properties and one sample step ("01 · Step title") — nothing else.
      Network starts as Mainnet and Status as Soon — set Live when it is ready. Rename the page, and
      replace the sample step with the real ones. ("View More Guides", its gallery and its button were
      taken out on 2026-09-28: a guide page hides them and takes the next guide from the /guides index,
      and its close band carries "All guides". Only the guides not yet redone still show them.)
- [ ] **Properties:** Name, **Title** ("Stake AXL with Keplr" — the head's title), **Lede** (the head's
      line; also the description), **Networks set** relation (the mainnet row — the chain's mark; its
      path in Super is /guides/<chain>), **Wallet Set** relation (the wallet must be a
      Wallet Set row with its glyph in Files & media), Step, Time, Network (Mainnet / Testnet; Rough
      keeps it off the picker), Status, Cover (its card in
      the "View More Guides" gallery of the guides not yet redone, and the /guides listings), Ticker.
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
