# SEO

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## SEO (asked 2026-09-26; done 2026-09-27/28 except the items at the end)

**How Super sets SEO — as found, not as documented.** A page's title, description and social image
default to its Notion title, first text block and cover. **Super's Page SEO Settings override** them
(Pages → a row's globe icon; stored per page as `seo {title, description, imageUrl, keywords}`), and
**an override beats the Notion properties**: database items read `meta:title`, `meta:description`,
`meta:image` from Notion only where Super holds no override for that field. No view has to show the
`meta:*` properties (the documented requirement did not hold here). **Super only sees a Notion edit
after it refetches the page**: its own sync did not come within 15 minutes; the dashboard's ↻ over the
preview refetches one page at once. A cleared override is stored as `""`.

**Driving Super without its UI.** The dashboard's API is GraphQL at `https://api.super.so/graphql`,
authorised with `Bearer <localStorage.token>` from the dashboard tab (never print it). What was used:
`sitePages(id: <site id>) { id path seo {…} }` lists every page with its overrides;
`updateSitePage(input: {id, seo: {title, description, imageUrl, keywords}})` writes them (send back the
fields you keep — it replaces the object); `siteDataForDashboard(input: {domainName, page, noCache: true,
revalidateImmediately: true})` is the ↻ refetch. A page id is `<site id>:::<uuid>`. The UI is slow and,
in a hidden automation tab, stops rendering; opening a row's settings is a full page load, so in-page
scripts do not survive it. **A refetch of a page trashed in Notion makes it 404** — Super had been
serving /blog/mina-hard-fork from cache (see the open items).

**The separator is a hyphen, " - "** (the user, 2026-09-28, after measuring and reading the studies):
in Arial 20px, Google's desktop title font, " - " is 17.8px, " | " 16.3px and " — " 31.1px. Google often
swaps a pipe for a dash (it removed or replaced pipes in 41% of titles against 19.7% for dashes, Zyppy's
2022 study of 80,959 titles), which is why Yoast dropped the pipe in 2021. Google names the hyphen first
among separators, and no separator affects ranking. Every "<Page> - Encapsulate" title uses it: the 12
main pages (Super overrides) and the chain pages (`meta:title`, written by `og_cards.py`).

**What is set now:**

| Where | What |
|---|---|
| Super → SEO | Default Social Image = the kit's `og-default.png`; Default Domain Indexing (the super.site copy) off |
| the 12 main pages | title, description and image from the brand kit's `seo.csv` and `og-*.png` (Super overrides; the kit's " — " became " - " on 2026-09-28) |
| the old pages | 2026-09-28: 13 removed from Super (/snapshots and its nine — their downloads were dead, minioapi.kingsuper.services gone and snapshots.encapsulate.xyz 502 — /services/celestia, /investments/portfolio, /investments/axelar), 6 redirected (/lido-dvt-staking and its three clusters → /networks/lido-dvt, /eigen-layer → /networks/eigencloud, /team → /); /rewards-calculator removed too (the user, the same day). The Notion pages are untouched; their ids are in `backups/old-super-pages-2026-09-28.json`. **Never put noindex in the site-wide Code head** |
| every post (38) | `meta:image` = its 17d card, `meta:description` = its Lede; three long titles shortened by `meta:title` (Berachain, Symbiotic, Canton) |
| every chain page (27) | `meta:image` = its hero, `meta:title` = "<Name> staking - Encapsulate", `meta:description` = its facts sentence, and the facts as a paragraph in the page for crawlers that run no script (`chain_pages.py --facts`, 2026-09-28; chain.js hides it once it has built) |
| every guide (32) | `meta:image` = its head, `meta:description` = "Title. Lede" (the Ledes alone repeated: 17 guides, 5 descriptions), `meta:title` = "Axelar Staking Guide" (in Notion since 2026-09-30; it was a Super override until then) |
| every page but the two noindex ones | a canonical `<link>` of its own address in its head (2026-09-28; see "Head files") |
| structured data | v319 — see below |

**A new page runs through all of it** — the steps are "SEO — every new page" in `notion/new-row-checklist.md`
(the user, 2026-09-28).

The 16 posts and 32 guides whose Super overrides held an old image or description had those two
cleared (titles kept) so the Notion values apply. **On 2026-09-30 the title overrides went too** — all 11 posts' and
32 guides' (backup `backups/super-title-overrides-2026-09-30.txt`); Double Zero's short title is its row's `meta:title`
now. **No database page has a Super SEO override**, so whatever Notion holds is what is served — a new override in
Super would hide the SEO job's writes. **A new post, guide or chain page gets its card with
`python3 scripts/og_cards.py posts|guides|chains --only <slug>`**, then ↻ in Super (or its sync).

**The cards** (1200×630, rendered at 2–3× and scaled down, one tab at a time — six tabs in one Chrome
painted one card with another's strip): a post is *Blog Cover System* 17d, "Pastel glyph" — the only
per-item card the design project has (`blog-covers/gnoland-og-1200x630.png` is its sample; the render
matches it but for antialiasing); the pastel is the post's place on the index (Live, newest first,
TINTS[i % 5]); a title that would run into the glyph wraps short of its ink, and Berachain's 89
characters take one step down (22); a hyphenated word is kept whole. A chain page is its own hero at
1440×756. A guide is its own head (design 1d) built from the row at 800×420 — at 1440 it left the card
two-thirds empty; the seven guides with no chain in the set (Stargaze, UX, Quicksilver, OmniFlix,
Mellow, Namada, Juno) have a tint-only disc, as their head would.

**Structured data — done, v319 (2026-09-27).** The homepage head (`head/home.html`) carries Organization
(name, legal name, logo = the favicon PNG, 4097px square, founding year, email, the footer's four social
profiles) and WebSite (the site name Google shows) as static JSON-LD. The page scripts add the rest from
what the page shows, as `script#enc-ld-post|chain|guide` in the head, replaced on each build and removed
on any other page (checked through client-side navigations): **post.js** BlogPosting (headline, the
lede, the date in local time, the Author, the tag as articleSection) + breadcrumb Home → Blog → post;
**chain.js** the five questions as FAQPage (Google stopped showing FAQ results in May 2026 but still
reads them) + Home → Networks → chain; **guide.js** Home → Guides → guide (HowTo results are gone since
2023). **The site's name** (the user asked why results show "encapsulate.xyz"): Google takes it from the WebSite data
(name "Encapsulate", present once scripts run), the title and `og:site_name`. Super writes each page's title into its
own `og:site_name` and has no setting for it, so head/home.html carries `<meta property="og:site_name"
content="Encapsulate">` (2026-09-29, Super support's advice) — it is served *before* Super's, and parsers take the first.
Google shows the name once it re-crawls the homepage (indexing requested 2026-09-28).

**Search Console and Bing (2026-09-28, done from the automation tab at the user's request).** Google had only
`https://king.super.site/` (the site's old Super address, now a 404 with noindex, so nothing to move). A **Domain
property `encapsulate.xyz`** was added to the user's Google account (aditya.verma.manit@gmail.com) and verified by a
DNS TXT record in DigitalOcean, `google-site-verification=fYz06OKYsETn03m-AGcN7W7l9-dRvLkbXaEls9Mdzho` — **never
remove it**, the property unverifies. The domain's other TXT records are Gmail's SPF (`v=spf1 include:_spf.google.com
~all`) and an older `google-site-verification=IaV2…` belonging to another Google account (the one that set up
Workspace, most likely); keep both. The sitemap is submitted, and indexing was requested for /, /networks, /blog and
/guides — **Google had never seen /networks** ("URL is unknown to Google") and /blog was not indexed. Bing: the site
was added by hand (the Search Console import brought only king.super.site) and verified by a CNAME in DigitalOcean,
`36b290c4f7ac57fd3ecf97ffb2452be3` → `verify.bing.com.` (keep it); its sitemap is submitted. **Search Console showed the sitemap as "Couldn't
fetch" on 2026-09-29** ("Sitemap could not be read", nothing more): the file answers 200 as application/xml, parses, lists 111
URLs that all answer 200, robots.txt names it, and Google's own live test of the URL said "URL is available to Google" — the
status of a sitemap Google has queued and not read yet, on a property one day old. Two listed URLs are noindex on purpose
(/governance/votes, /page-not-found); Super writes the sitemap, so they will show as a warning in the Pages report. The homepage's
`google-site-verification` meta (`hMGL…`), which verified king.super.site, was removed from head/home.html (the user,
2026-09-29), and the king.super.site property was removed from Search Console; Bing's site list has only encapsulate.xyz.
**Nothing on the pages verifies the site now — the DNS records do.**
**Driving these consoles:** the extension cannot screenshot or inject into Search Console, DigitalOcean or Bing (script
injection times out), but `javascript_tool` works: read `document.body.innerText`, click a Wiz/Google button with
`pointerdown/mousedown/pointerup/mouseup/click` MouseEvents at its centre (a plain `.click()` and the computer tool's
click did nothing there), set inputs with the native value setter + `input`, press Enter with a keydown. Keep long waits
in the page (`window.__x`) and poll — an evaluate over 45s times out. Closing the second-last tab dissolves the group.

**Done 2026-09-28:** the Mina hard-fork post (a Home child page, in Notion's trash since 2026-09-25) is
removed from Super (the user: "let it be"); the listing pages /networks/mainnet, /guides/mainnet and
/guides/testnet are gone from Super with the paths (see "Paths") and redirect; /terms-and-conditions
308s to /terms-of-use (the user, 2026-09-28). **The guide posts are gone from the blog** (the user: "among
all the blog posts there shouldn't be a guide"): "How to Stake Celestia TIA?" (/blog/celestia-staking-guide, now
a 404 — there is no Celestia guide) and "How to Stake Agoric BLD?" (/blog/agoric-staking-guide, 308 to
/guides/agoric) — Super pages removed, Notion rows in the trash, both backed up with their blocks in
`backups/guide-posts-2026-09-28.json`; the nine posts behind them on the index changed tint, and their social
cards were made again. "Aleo Node Setup With Monitoring" is a node-operator walkthrough tagged Informative
and stays. **Still open:** the main pages' h1 counts; **phone speed** — Lighthouse 36–60 on phones on 2026-09-28, the
largest element 10.8–17.8 s against 2.5 s (the hero's poster, v334, and the resized glyphs, v335, came after; not
measured again); and the audit's item 10 — short dated statements for the homepage and /networks ("Encapsulate has run
validators since 2020 and secures 27 mainnets.") wait for the user's words; no date beside the rates on /networks
(Claude's advice). The rest of the audit is the artifact "Encapsulate Search Audit".
**Where the redirects are in Super:** Pages — each is a row in the tree at its old path (/networks → /mainnet
→ /<chain>, /guides → /mainnet …, /terms-and-conditions at the root) with a folder-and-arrow icon; its ⋯ menu
→ Redirect page shows Enabled, Permanent (301) and the destination.
**The vote pages are gone (2026-09-28):** 316 Super pages, one per row of the record, made in March–June
2023 (rows added since never got one), empty (every one of the 1,153 rows' Notion pages has no blocks),
linked from nowhere, yet in the sitemap and indexable. Removed from Super only — the Notion rows and the
record's tables are untouched; their addresses are in `backups/governance-vote-pages-2026-09-28.json`.
/governance-record and its database page /governance-record/governance-record stay; the database page has a
noindex head (2026-09-28). /investments/gravity-bridge (a 404 listed in the sitemap) was removed from Super.

## The SEO job — every database row's card, title, description, and four content properties (built 2026-09-30)

`site-data/jobs/content/seo.mjs`, `content.yml` (daily, 07:10 UTC; item E1 with B1, B2, U1, U3 in the plan): it goes
through the Notion databases whose rows are pages on the site and, for each row whose `meta:image`, `meta:title` or
`meta:description` is **missing or stale**, makes it and writes it — the card by **website-css's own `og_cards.py`**,
which the workflow checks out beside site-data and runs with the runner's Chrome (`CHROME=google-chrome`;
`og/render.mjs` takes the binary from that variable), so the card is the site's design and nothing is ported.
**First run 2026-09-30:** 96 card hashes seeded (no card redrawn), the posts' `meta:title` (= Name) and two `Read`
values written; a forced redraw (`REDRAW=<row ids>`) proved the path on the Mac (the Axelar guide) and on the
runner (the Double Zero post — identical to the Mac's card). The run's issue names each card's changed inputs. **Checked 2026-09-30 against the sitemap (111
pages) — every row page opened and read for content; only three databases qualify, 96 pages:**

| Database | Pages | Content | Card design |
|---|---|---|---|
| Blogs (`a148eb7f…`) | 38 at /blog/… | all open (200), 37–64+ blocks | post 17d |
| Networks set (`3dde800a…33b7f1…`), mainnet rows | 27 at /networks/… | all open, ~19 blocks each | the chain hero |
| Guides Database (`1f6e800a…`) | 31 of 32 at /guides/… | all open; **/guides/mina is empty** — its Notion page has no blocks, the live page shows only "MINA" | the guide head |

**The properties it writes, per database** (settled 2026-09-30: all three `meta:*`, plus **`Read`, `Time` and the two
`Lede`s** — "just these 4 more properties, keep the rest for manual update"; nothing else on a row is touched):

| Database | Property | Rule |
|---|---|---|
| **Blogs** (38) | `meta:image` | the 17d card — it shows the tag, the date, the title, the Cover glyph and the tint (the post's place on the index) and nothing else; remade when one of those changes |
| | `meta:title` | = the post's `Name`, written where empty; a title someone shortened by hand stays (Berachain, Symbiotic, Canton, "Double Zero"); a new `Name` over 60 characters is reported for a hand |
| | `meta:description` | = the row's `Lede` |
| | `Read` | the post's words at 230 a minute, rounded up (post.js's rule); written when it differs |
| | `Lede` | where empty: the post's opening paragraph cut at a sentence end to the head's length (post.js's own fallback), written down so the card and description have it; a Lede someone wrote stays |
| **Networks set** (27 mainnet rows) | `meta:image` | the chain hero — it shows the name, the line under it, the green button's label, the address in the ring, the glyph and the tint; remade when one of those changes. No rate, commission or unbonding is on the card |
| | `meta:title` | "<Name> staking - Encapsulate", written where missing or different |
| | `meta:description` | **not this job's** — the networks job writes it after every value change and where a row has none, and is its only writer |
| **Guides Database** (31; /guides/mina waits for content) | `meta:image` | the guide head — it shows the chain's name, `Title`, `Lede`, the step count, the chain's glyph and tint and the wallet's mark; remade when one of those changes |
| | `meta:title` | **"<Chain> staking guide - Encapsulate"** — the chain pages' pattern (the user, 2026-09-30); the chain is the Networks set relation's Name, else the name in the title today; a hand-written title stays (the EigenCloud pair needs one: see below) |
| | `meta:description` | = "`Title`. `Lede`" |
| | `Time` | half a minute a step, rounded to the nearest whole with a half going to the even one (9 → 4, 7 → 4, 13 → 6, 18 → 9) — the rule every guide but Monad (7 → 5) follows today; written when it differs. `Step` stays a person's, counted from the guide's slides |
| | `Lede` | where empty: the template every guide follows — "<N> steps across <the surfaces>, one per screen, each with the screen you should be looking at." — from `Step` and the slides' `Surface` values; where the leading count word disagrees with `Step` ("Seven steps…" on a nine-step guide) only that word is put right; otherwise a Lede someone wrote stays |

Everything else — Author, Tags, Chain, Ticker, Mainnet, Published Time on a post; Step, Title, Network, the relations,
Status on a guide; Tier, Order, Role, Since, Compounding, Address, Cover, Token on a chain — stays a person's.

**The guide titles, written 2026-09-30 on the chain pages' pattern** (the user: "yes do it"; old values in
`backups/guide-titles-2026-09-30.json`), live the same hour; Monad's Time went 5 → 4 with them:

| Guide | Today | Proposed |
|---|---|---|
| agoric, althea, avail, avalanche, axelar, espresso, gitopia, ika, lumera, mina, monad, passage, sommelier, starknet, sui, supra, terra, zilliqa | "<Chain> Staking Guide" | "<Chain> staking guide - Encapsulate" (Agoric, Althea, Avail, Avalanche, Axelar, Espresso, Gitopia, Ika, Lumera, Mina, Monad, Passage, Sommelier, Starknet, Sui, Supra, Terra, Zilliqa) |
| near | Near Staking Guide | Near staking guide - Encapsulate (the row's Name, as the chain page: "Near staking - Encapsulate") |
| gravity-bridge | Gravity Staking Guide | Gravity Bridge staking guide - Encapsulate |
| humans-ai | Humans Staking Guide | humans.ai staking guide - Encapsulate |
| iota | Iota Staking Guide | IOTA staking guide - Encapsulate |
| ixo | Ixo Staking Guide | ixo staking guide - Encapsulate |
| eigen-layer | Eigen Layer | EigenCloud staking guide - Encapsulate |
| eigen-layer-steth | Eigen Layer ETH Restaking Guide | **EigenCloud stETH restaking guide - Encapsulate** (the one hand exception — two guides share the chain; from its Title "Restake stETH with MetaMask") |
| juno, namada, quicksilver, stargaze, ux (no row in the set) | "<Chain> Staking Guide" | Juno / Namada / Quicksilver / Stargaze / UX staking guide - Encapsulate |
| omniflix | Omniflix Staking Guide | OmniFlix staking guide - Encapsulate |
| mellow | Mellow Vault Staking Guide | Mellow staking guide - Encapsulate |

**Left out:** `/guides/mina` until it has content (then it joins); `/governance/votes` (the record's database page:
noindex, a table, no card); and every other database — Portfolio, Team, Why Stake, Colour, Wallet Set, Governance
Mechanism, Governance Record (its 316 row pages were removed from Super on 2026-09-28), the /services tables
(Dashboards, Playbooks, Bot events, Monitoring builds) and the guides' slide databases — whose rows are not pages on
the site. The job takes its list from the sitemap each run, so a database that gains pages is picked up, and a row
page with no content is skipped and named in the issue.

- **the card** rendered as `scripts/og_cards.py` does today (post 17d, chain hero, guide head) in the runner's headless
  Chrome, uploaded through the file-upload API and attached to `meta:image`;
- **stale** means something the card actually shows changed since it was made — the lists in the table above, read off
  the live cards on 2026-09-30 — keep a hash of exactly those inputs per row in `state/`, and remake only when it
  differs. The chain page's rate is on the page, not on its card;
- **the text** from the same rules as now: a post's Lede, a chain page's facts sentence and "<Name> staking - Encapsulate",
  a guide's "Title. Lede";
- a Super override on the page beats the Notion value — report a row whose override hides a new card, do not clear it;
- one issue per run listing each card made (before → after), as the other jobs do.

A new row still goes through `notion/new-row-checklist.md` for what the job does not do (its path in Super, the
fallbacks, the checks); the card and the meta text come the next morning, or at once with
`python3 scripts/og_cards.py <kind> --only <slug>` here.
