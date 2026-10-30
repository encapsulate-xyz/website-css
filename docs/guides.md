# The guides

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## The guide page (2026-09-22, design *Staking Guide Variation 1d*)

One step per screen. An ink head with the chain's disc and the wallet's mark, the Title and the
Lede; a paper band per step carrying the number, the surface as a link, the title, the body, the
"Watch out" note and the capture, with the step's numeral hollow at the bottom right and its green
fill rising with the reader's progress; an ink close with the next guide. A link can open a step: /guides/<guide>#step-4, the
close #done (anchors.js, 2026-10-23 — `docs/paths-and-404.md`, "Section names").

**Every word is Notion's**, in three places:

| What | Where |
|---|---|
| A step: its capture and its words | **one row of the guide's own slide database** — `Name` ("01 · Unlock Keplr"), `Step`, `Body`, `Watch`, `Surface`, `Link`, and the capture as the row's `Cover`. Everything about a step is one record (asked for 2026-09-22; the copy was briefly in toggles on the page and that is gone) |
| The head's title and Lede | the `Guides Database` row's **Name** (its page title) and **Lede** — Super does not render a row's properties on its own page, so they are read off /guides, as post.js reads the blog index. **Since 2026-10-01 (v346) the title is the Name**: a Title property ("Stake AVAX with Core") had stood beside a Name that drifted ("AVALANCHE", "Delegate ESP with Metamask"), and the /guides picker's answer card, which read the Name, showed the drifted one. Every Title was copied into its Name and Title deleted (`backups/guides-name-title-2026-10-01.json`); guide.js, navbar.js, og_cards.py and the SEO job read Name. Proved on the live site before and after each step (`scratchpad/guidename/`): all 32 guide pages, the picker's card for every chain and the navbar's Learn rows identical but the picker's card, now the guide's title. The 7 guides with no Networks set row (Stargaze, UX, Quicksilver, OmniFlix, Mellow, Namada, Juno) are **Status Concluded** (to be removed — the user; **hidden in Super on 2026-10-30**, 404, `docs/seo.md`); the /guides view lists only Live, so Mellow left it and the picker's counter reads "24 chains · 24 guides" **Mina was missed** (its page was in the trash then, so it kept Name "MINA"; its Title had been "Stake MINA with Auro"): the user put the page back on 2026-10-18 with its old slides, still unconverted, and asked for its properties to match the others — Name "Stake MINA with Auro Wallet" (every guide is "<verb> <TICKER> with <its Wallet Set row's name>"), Status Live → Soon like the other unconverted guides, so the picker no longer offers it; the card and description made again (`og_cards.py guides --only mina`). Its old "View More Guides" heading, linked gallery and button stay on the page (the user: leave it). Old values `backups/mina-guide-2026-10-18.json` |
| The crumb, "Watch out", "{N} screens", the close band, the Discord line | the **"Guide page copy" toggle on /guides**, `key · value` lines — one place for 33 guides. `{n}` is the step count, `{N}` the same spelled ("Eight screens"), `{next}` and `{chain}` the next guide |

**Converted guides so far: Axelar, Sui (ten steps, SuiVision + Slush), Espresso, Monad (below), Terra, Agoric, NEAR, Lumera,
Passage, Gravity Bridge, ixo, Sommelier, IOTA, Mina, Starknet twice, Zilliqa and Cosmos Hub** (2026-10-22: Starknet, nine steps on Voyager's
Staking Dashboard (voyager.online) with the **Ready X** extension — Ready's browser wallet, once Argent X; "Ready X" is
its name in the Chrome Web Store and in Voyager's wallet list, so the guide is "Stake STRK with Ready X" (the team had
named it "Ready") and the Wallet Set has a Ready X row since that day, its glyph made with `make_glyph.py` from the
mark on ready.co (alpha, 10.2%). The row came from the template as Braavos: Wallet Set Braavos, a Lede and description
on "the Braavos extension and its dashboard", Step 9 for eight captures, and the chain page's button "Delegate with
Braavos" (`chain_pages.py --buttons Starknet`, now Ready X). Step 4's Watch gives our staker address as a press-to-copy:
Voyager's search finds only us by it, and only us by "encap" (checked on the live dashboard). Step 5's Watch is the
Reward address, which Voyager fills with the connected wallet; step 8 reads Rewards to Claim — every epoch, about an
hour, Claim or Restake — and the 7-day withdrawal (`chain-pages.json`). The first set was eight captures: after the
unlock the team's wallet was already connected to voyager.online, so a first-time reader's connection request had no
step; the team added it the same day as step 4, Ready X's "Connect to Voyager" (the site, the account, what the site
may do), and the row went to Step 9, Time 4, "Nine steps…". The captures are the house sizes (720 × 1576, 2800 × 1576). Old values `backups/stake-strk-with-ready-guide-2026-10-22.json`

**Cosmos Hub (2026-10-28): "Delegate ATOM with Keplr", seven steps on the Keplr Dashboard with the Keplr extension**,
/guides/cosmos-hub — the user: "review cosmos hub guide and add instrcutions". The team made a new row that morning,
"Stake ATOM with Keplr" (Status Soon, Step 7, Time 3, its seven captures at the house sizes, the template's sample words in
step 1 and their own step names: "Press start staking", "Search Encapsulate and select", "Check numbers and press stake",
"Enter numbers and stake", "Unlock wallet", "Approve the transaction", "Confirm your stake"), beside the empty row made
from the template on 2026-10-05, "Delegate ATOM with Keplr" (one sample step, no captures). The words are Lumera's,
Terra's and Agoric's with the ATOM facts (10% commission, 21 days, every block, `cosmosvaloper1p8uxq4ska2psv2k8wknljh568k5qfnwt0m3udk`
as step 2's press-to-copy), the step names the house ones, steps 5 and 6 linked to keplr.app (step 5 had
`wallet.keplr.app/`). Two changes from the siblings, for what the captures show: step 1 says "the page shows" (this
capture has no Staking tab), and step 2 leaves the unstaking period's number out, because Keplr's Stake to shows "21-24
days" there; step 3's panel says 21 days. Step 6's fee is "a fraction of a cent" (Keplr: 0.001843 ATOM, < $0.01). The row
was renamed "Delegate ATOM with Keplr", the verb of every Keplr guide but Sommelier's; Time 4; its Lede, description and
`meta:title` "Cosmos Hub staking guide - Encapsulate"; Live. The empty 10-05 row was archived (in Notion's trash;
`backups/delegate-atom-with-keplr-placeholder-2026-10-28.json`). The page made in Super with its canonical line, the card
made (`og_cards.py guides --only cosmos-hub`), and the chain page's "Delegate with Keplr" now opens the guide (it opened
Keplr's Stake to on our validator). Checked live: built, seven steps linked, every Watch out and the address pressed at
1440 and 390, `#step-4` lands on Enter an amount as Terra's does. Old values `backups/stake-atom-with-keplr-guide-2026-10-28.json`

**Zilliqa (2026-10-25): "Stake ZIL with Bearby", eight steps on Zilliqa's staking portal (stake.zilliqa.com) with the
Bearby extension** (bearby.io). Our pool is on the portal's Liquid tab, as Encapsulate with its token encapZIL; steps 6
and 8 link `https://stake.zilliqa.com/?poolId=MHgxMzEx`, which opens our panel (the pool id is base64 of 0x1311). Step
7's Watch is the delegation contract as a press-to-copy, `0x1311059DD836D7000Dc673eA4Cc834fe04e9933C` (the Networks
set's Address): Bearby's confirm sends the ZIL there and labels it Unknown. Step 8: rewards compound into encapZIL
every block, nothing to claim, and the unstake is claimed about 6 days later (the chain page's figure; the portal says
~7 days). The row came with "Enght steps across the Bearby extension and its dashboard" and Time 3; the chain page's
button said "Delegate with MetaMask" (now Bearby, `chain_pages.py --buttons Zilliqa`). Bearby was the one Wallet Set row
without a glyph: made with `make_glyph.py` from bearby.io's `favicon.svg` (a white paw on a gradient disc, rasterised
with ImageMagick, badge mode, 10.1%). The script needs numpy and Pillow, which the system Python lacks: a venv in the
scratchpad. Captures at the house sizes. Old values `backups/stake-zil-with-bearby-guide-2026-10-25.json`

**Starknet has a guide per wallet since 2026-10-23: Ready X and Braavos.** The team made "Stake STRK with Braavos" by
duplicating the Ready X row, with its own nine captures (the Braavos side panel at 720 × 1576: Login, "dApp Connection"
→ Approve, "Sign Transaction" → Sign, "Transaction completed" → OK, in place of Voyager's Stake Successful), the
step names, and step 1's words carried over. The words are mine, Ready X's wherever Braavos shows the same thing.
**Duplicating renamed the Ready X Wallet Set row to "Braavos"** (17:12 UTC, a minute after the copy) — the old Braavos
row was then linked to the new guide, so both rows read Braavos and the Ready X guide's wallet with them; renamed back
the next morning, before Super had picked it up. A duplicated guide row: check its Wallet Set row's name, not only the
relation. **The two paths**: both guides carry the wallet, /guides/starknet-ready-x and /guides/starknet-braavos (the
user: "make url different for both"); the Ready X page was moved (`updateSitePage` path, its canonical head rewritten),
the Braavos page created with its canonical, and **/guides/starknet 308s to Ready X**, the guide it was. Each has its own
`meta:title`, "Starknet staking guide with <wallet> - Encapsulate" (the SEO job writes "<Chain> staking guide -
Encapsulate" only where it is empty, so the two would have shared one). **The picker** (guides.js, v378) keeps a list
per chain, as the Guides Set design does: one guide fills its wallet in, several show every wallet with none picked
under "Pick the wallet you already have installed" — on a phone the pick scrolls that row into view (v379). **A chain in
the address** (v380, the user: "make /guides#starknet open the picker with Starknet selected … for every chain"):
/guides#<chain> — the chain's name or its chain page's slug, any case, a tracker's `?…` tail ignored — picks that chain
on load and on a hash change, as a press would, and brings the panel to the top of the screen (on a phone, then the
card or the wallets into view). A chain with no live guide is not picked; `#block-…` is left to the browser. A press
of the reader's own takes over. Nothing links there yet; the chain page's button could, for a chain with several
wallets. **A guide's
"Next"** skips its own chain's other wallet (guide.js, v378): both Starknet guides go to Terra, Mina's to Ready X, the
first Starknet card in the gallery. The chain page's button stays "Delegate with Ready X". Old values
`backups/stake-strk-with-braavos-guide-2026-10-23.json`, `backups/starknet-guides-rows-2026-10-23.json`.
and `…-guide-row-2026-10-22.json`. 2026-10-21: Mina, nine steps, all in the Auro Wallet extension, each "In the Auro Wallet extension" linked to https://www.aurowallet.com/ — the team had linked step 1 to the Chrome Web Store, and the house link for an extension step is the wallet's site. No amount: Mina delegates the whole balance, which step 6 says. Step 5's Watch names our key `B62qjW…uFaRYY` in full, step 7's must match the Block Producer Address; step 9 says the stake counts after one to two epochs and that we pay the share, less our 5% fee, every two epochs (the chain page's own FAQ). Step 6 had no Step number and capture 8 was not used (8 and 9 are the captures named (9) and (10)). The row had come back Live with its old Step 12, Time 6 and a "Twelve steps … and its dashboard" Lede: now 9, 4, "Nine steps in the Auro Wallet extension", as NEAR's "Eight steps in Meteor's web wallet". **Auro Wallet's popup is 375 × 596** (the user: "the wallet was weird so had to take at 375×596"), captures 750 × 1192, so the Mina guide has a 375:596 frame of its own (`#page-guides-mina`, v363), as IOTA's. Old values `backups/stake-mina-with-auro-wallet-guide-2026-10-21.json`. 2026-10-13: IOTA, seven steps — six in the IOTA Wallet extension, "In
the IOTA Wallet extension" linked to https://www.iota.org/products/wallet, and the last "On explorer.iota.org", linked to the
team's own stake as the capture's file name gives it. There is no approval screen: the form's Stake sends at once, which
step 5's Watch says; step 6 reads the wallet's two countdowns (Staking Rewards Start = the next epoch, Redeem Rewards = the
one after). 8% commission, minimum 1 IOTA, unstaking at once, rewards every 24 hours and compounding — `chain-pages.json`.
The row was Status Soon with a page already in Super (/guides/iota, its canonical, the chain page's button on it): now Live,
Time 3 → 4, a Lede on "the IOTA explorer" (it said "and its dashboard", the description "Four steps"). **IOTA Wallet's popup
is 360 × 600, not 360 × 788**, and its captures came in at that size (720 × 1200): the 360:788 wallet frame cut the sides
off their words ("taking APY"), so **guide.css gives the IOTA guide alone a 360:600 frame** (`#page-guides-iota`, v353;
the user: "just made this change for iota don't for all"). Old values `backups/stake-iota-with-iota-wallet-guide-2026-10-13.json`)
(2026-10-09: Sommelier on the Keplr flow, seven steps written as Passage's with
SOMM, 28 days and `sommvaloper1s0lankh…a8324s2`; step 3 says the APR the captures show is "0% since Sommelier's inflation and
incentives ended", the chain page's own reason. **The guide was named for MetaMask** — "Stake SOMM with MetaMask", Wallet
Set MetaMask, a Lede on "the MetaMask extension", a description of "Nine steps", and the chain page's button "Delegate with
MetaMask" — though MetaMask cannot stake SOMM and every capture is Keplr: now "Stake SOMM with Keplr", Wallet Set Keplr,
`notion/chain-pages.json` and `chain_pages.py --buttons "Sommelier"` "Delegate with Keplr", both cards made again by the
content job; old values `backups/stake-somm-with-metamask-guide-2026-10-09.json`) (2026-10-08: Passage on the Keplr flow; Gravity Bridge and ixo are seven steps on **ping.pub**
with Keplr — "On ping.pub", every page step linked to `https://ping.pub/<chain>`; Gravity's step 3 warns that its form's unit
was ugraviton, a millionth of a GRAV (its captures 1–3 and 6–7 are from two accounts); ixo's rewards are paid once a day; the
rows said nine (Passage) and six steps — all three are seven now, Time 4, new ledes and cards; old values
`backups/passage-gravity-ixo-guides-2026-10-08.json`; the run itself is now written down in `notion/new-row-checklist.md`)
(Lumera, 2026-10-06: seven steps, the Terra and Agoric flow, 10% commission; step 1 reads exactly as Terra's and Agoric's (the
user, 2026-10-06: a clause on the capture's "Open Keplr to approve request(s)" made it longer than its siblings); Lumera has no price in Keplr, so the fee is given in LUME; the
description said "Eight steps"; old values `backups/lumera-guide-2026-10-06.json`) (NEAR,
2026-10-05: eight steps in Meteor's web wallet at wallet.meteorwallet.app — no separate extension or confirmation window; the
Watch notes carry the two traps the captures show, "Stake Now & Start Earning" staking with Dew Finance and the form opening
on Meteor Pool, and the unlock as 22–30 hours though Meteor quotes 48–72; the Lede no longer says "extension and its dashboard";
old values `backups/near-guide-2026-10-05.json`) (2026-10-02:
seven steps each on the Keplr Dashboard with the Keplr extension, written from the team's captures; step 3 links Keplr's
staking window with our validator already open, the address the capture itself was taken at — Agoric's is the current
"Encapsulate" `agoricvaloper1p8uxq4…`, 9%, not the old "fka KingSuper" one; old values
`backups/terra-guide-2026-10-02.json`, `backups/agoric-guide-2026-10-02.json`) (2026-09-29: nine steps on
stake.espresso.network with MetaMask). For Espresso the team put the captures and step names in the slide database and
the user asked for the instructions to be written from the captures: each capture was looked at, and Name, Body,
Watch, Surface ("On stake.espresso.network" / "In the MetaMask extension") and Link written per step, the facts
checked against `notion/chain-pages.json` (minimum 1 ESP, fees in ETH, rewards per block we propose and claimed by
hand, 7 days to undelegate); the Lede names Espresso's dashboard, the card was made again. Old values:
`backups/espresso-guide-2026-09-29.json`. **Open with the team:** capture 4 rings Approve while the amount reads 0 —
the words say to type the amount first, so the capture wants retaking with an amount in.
**Monad (2026-09-30, rewritten 2026-10-02): eleven steps on MonadVision's MySpace → Stake with MetaMask** (the team
added "Switch the validator" as step 2 the same day: the ⇄ on the Validator line; step 3 is the search and the pick). The team
retook the captures with Encapsulate chosen (the first set showed MonadVision, the page's default) and split them into
ten; the words were written again from each capture (old values `backups/monad-guide-2026-10-02.json`): the amount,
choosing Encapsulate through the ⇄, Connect Wallet, MetaMask in the list, unlock, connect, Stake, confirm, the
success notice, the dashboard. Two Watch notes come from what the captures show: MetaMask names the staking contract
**"BSC: Validator Set"** — the label it has for `0x…1000` on BNB Chain, where that address is BSC's validator-set
contract; on Monad it is the staking precompile (docs.monad.xyz) — and **the Stake card goes back to MonadVision after
each stake**. Facts from `notion/chain-pages.json`: no minimum, 15% commission, rewards per proposed block claimed by
hand, a withdrawal 4.5 to 9 hours after unstaking. The row: Step 11, Time 6, the Lede "Eleven steps across MonadVision
and the MetaMask extension…".
**How to write a step from a capture:** say what the screen is, then the one action the ring is on; the Watch is the
one check that prevents a loss on that screen (the address bar, the validator's address, the amount, the unbonding
time) or nothing; never a sentence the capture does not show (Axelar's "the dollar value updates as you type" was
copied into Sui, whose screen has no dollar value).
**Every step carries a Surface and its Link** (the user, 2026-10-05: "are you not adding the surface link on every page", then
"every step has a surface and the surface link"): the Surface is where the reader is ("On wallet.keplr.app", "In the Keplr
extension") and the label is drawn as the Link. A website step links the page its capture shows, and the capture's own file name encodes the address
(`wallet.keplr.app_chains_terra_tab=staking&modal=staking…(Guide-dashboard).png` → `https://wallet.keplr.app/chains/terra?tab=staking&modal=staking…`).
A wallet-extension step links the wallet's site (`https://www.keplr.app/`, `https://slush.app/`, `https://metamask.io/`), as
Axelar, Sui and Espresso did from the start. Terra, Agoric, NEAR and Monad had links on a few steps only; the other 20 were
filled on 2026-10-05 (old values `backups/guide-step-links-before-2026-10-05.json`).

**The guide card's lede wraps with `text-wrap: pretty`** (`scripts/og/guide.html`, 2026-09-29): the Sui card ended on a
line of one word, "at.". It applies to each guide's card the next time that card is made.

**A Watch out opens on the first press, and its note holds an address** (2026-10-14, v355; reported by a teammate on
IOTA: "Gray Background not fills the text", "Watch out at step 5 … not getting opened in the first press"). On a tall
step the note hangs from a 0-height `.enc-gd__hang` beside the capture; a long Body brought the button down past the
row's top, and the row, later in the page, took the press — IOTA 5, Near 6 and 8, Monad 7 and 9 on a desktop. The hang
now sits above the row (`position: relative; z-index: 1`). A note with an address in it ran out of its grey box (IOTA 3
by 69px; step 2 of Agoric, Gravity Bridge, ixo, Lumera, Passage, Sommelier and Terra on a phone): `.enc-gd__note`
breaks anywhere. Pressed through on every note of the 13 converted guides at 1440 and 390 — the press is now
`scripts/guide_press.mjs`, and the conversion run ends with it.

**An address copies on a press** (2026-10-14, v357–v358; the user: "make it such that clicking on the address copies it",
agreed after "first discuss how"). **What can be copied is marked in Notion**: inline code (⌘E) in a step's Body or Watch,
which Super keeps as `<code class="code">` in the card's property; guide.js keeps a property's text as runs (`parts()`)
and draws each code run as a span with the button role (`.enc-gd__copy`, so a long address wraps in its sentence):
the address in JetBrains Mono, the code block's copy mark after it; a press or Enter/Space copies it
(`navigator.clipboard`, else `execCommand("copy")`, else it is selected) and for two seconds the mark is the tick.
**Hover changes the text, never the ground** (v358, the user: "dont change ground color on hover maybe change the tetx
color"): the address and the mark turn green ink `#3F6B27`, the code block's string colour. **The tooltip is the house
one** (the user: "use the same tooltip style we have been using everywhere else") — network.css's "Reward rate": mono
10px uppercase on a black pill, 4px corners — reading "Copy", then "Copied" for the two seconds (the native `title`
went). It hangs above where the address starts, not over the mark: a wrapped address put the mark on its last line and
the tip over its own first line. "Copy" and "Copied" are the copy toggle's `copy` and `copied` lines. A pattern was
rejected: `encapsulate.pool.near` reads like `stake.espresso.network`, and the short forms are not for pasting. Marked
on 2026-10-14, ten places: step 2's Watch of the seven Keplr guides that name a valoper (Agoric, Gravity Bridge, ixo,
Lumera, Passage, Sommelier, Terra), IOTA 3's Watch, NEAR 5's Watch and 8's Body (old text in
`backups/guide-addresses-2026-10-14.json`). Checked on all ten at 1440 and 390, and every guide's text unchanged.

**After changing a guide row's Title or Lede, refresh /guides as well as the guide's own page in Super** (2026-09-29):
the guide's head reads them off /guides, so the page kept the old Lede until the index was refreshed; then make the social
card again (`og_cards.py guides --only /guides/<chain>`), since it prints the Lede.

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
1440×900), and the ground is `background-attachment: fixed` — the file's single sticky ground. **That ground is a line grid**
(the handoff of 2026-10-22, the user: "change the dot grid to line grid"): 32px lines at 5% ink on the paper, and at
5% paper on the ink head and close (the head had no ground before, the close had paper dots), a line through the
screen's centre each way (`calc(50% + 16px)`); it was a 22px dot grid. It went in at 64px and 7% (v375), the cover of
/brand with it; the same afternoon the handoff drew the guide's tighter (the user: "made the grid more tighter", v376)
and took away the paper box behind the step's body (`.enc-gd__well`), which cut a blank rectangle into the lines — then
put it back (v377): solid paper behind the body paragraph only, 4px corners and a 6px paper spread, the title and Watch
out on the lines. /brand's handoff kept 64px at 7%.
**The frame follows the capture**: a wallet shot is tall (360:788) and stands beside the note; a
dashboard shot is wide (16:9) and runs under the header. `guide.js` reads the file's own
proportions on load and sets `[data-enc-shot]`. The band is one grid, so opening a note never
squeezes the capture. Sizes and how the captures are taken: `notion/guide-screenshots.md`.

**Axelar was nine steps, not eight** (2026-09-22: the handoff wrote eight; its slides numbered nine, so "Check us
before you pick" was split into *Find us in the list* and *Check our numbers*). **Today it is seven** (read 2026-10-08):
the team rebuilt it on the Keplr Dashboard with a capture for every step — 01 Open Keplr's Axelar staking dashboard …
07 Check it worked. The row's `Step` is what the picker and the head count, so it follows the slides.

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

**Every band is a stop of the site's snap** (`snap.js` since 2026-10-28, `docs/main-css.md`, "Snapping"): one gesture
or key, one band, and from the last the page goes on to the footer's top; off under 701px and with reduced motion. It
was the design's `scroll-snap-type: y mandatory` with `snap-stop: always` on `html` until then, Chrome's own snap, a
screen in under 200ms: the hardest on the site, and it pinned any scripted scroll. **A step rests at the top** since v348 (the user's
screenshot, 2026-10-02): Super's `html { scroll-padding-top: 62px }` had stood every key and trackpad snap 62px
down with the band before it showing above — the chain pages' fault of v339, and older than the old page CSS
(checked with it put back). guide.css sets it to 0 on a built guide; it still matters for every link to a step.

**The page opened at its foot** until 2026-09-23: ten screens are inserted above the reader on
build, and Chrome's scroll anchoring answered by holding what they were looking at — the footer —
in place. `overflow-anchor: none` for the page, and guide.js restores the top when the build
started there (a `#block-…` link is left alone).
**And it still opened at its foot and climbed** until v340 (the user, 2026-09-30: "why does every reload start
at the bottom and scroll up"): the snap was keyed on the build, so the footer — the raw page's one snap stop — was
the snapped target when the bands went in above it, a mandatory snap re-aligned the page to it (not anchoring:
that was already off), and the restore to the top ran as a 1.5s smooth scroll under the page's own
`scroll-behavior`. Now guide.js switches the snap on (`html[data-enc-guide-snap]`, which snap.js reads the bands
under, guide.css until 2026-10-28) only 120ms after the built page stands at its top, and the restore is `behavior: "instant"`. Reproduced
and proved with a reload in headless Chrome, sampling scrollY every 60ms (`scratchpad/guide-handoff/steps-reload.mjs`):
0 → 8038 → a 1.5s climb before; 0 throughout after. Headless wheel gestures did not move this page under the CSS snap
(each synthetic event was snapped back); with snap.js they do, and a reload stays at 0 (2026-10-28).

## A guide links its chain page (handoff 2026-09-30, v338)

**A guide carries no questions-and-answers band, and the chain page's questions are not copied onto it** (the user,
2026-09-29, "yes" to: they live once per chain on the chain page, with the FAQ data; two copies drift and engines pick
one). The link to the chain page below stands in for it.

The close band's last line is **the side routes**, as *Staking Guide Variation 1d* draws them: two tertiaries on ink
(Hanken 15/500, a 20px green badge that slides 3px on hover) 28px apart, 4px under the two buttons — **"Axelar's terms
and common questions" → /networks/axelar#terms**, then "Need help? Ask on Discord". The glyph carries the verb: a right
arrow stays on the site, the up-right arrow leaves it (`badge("go")` / `badge("arrow")` in guide.js). Nothing is typed:
the label is the copy toggle's new `terms · {chain}’s terms and common questions` line (fallback in `CONTENT`), and the
target is the Networks set card on /guides that carries the chain's name — a mainnet row is a page and its card links
to it (`marks()` keeps `__pages`), a testnet-only chain has no page and so no link, as the file says. chain.js gives
every band its key as an `id` (`terms`, `estimate`, and since 2026-10-23 a row page's section by its title, `what-we-run`, `common-questions`, in place of `s0`, `s1`; `validators`) and **holds the `#terms` landing** (`landHash()`): the bands
do not exist when the browser tries the jump, and React's adoption puts the scroll back at the top, so the landing is
retried over three seconds until a wheel, touch or key from the reader (v339: a check on scrollY had taken Super's
router's own scroll, 300ms after the first landing, for the reader and stopped half a screen short — the user's
screenshot). **The bands start at the top** (v339): Super's `html { scroll-padding-top: 62px }` had rested every
snap and every anchor jump 62px into the band; chain.css sets it to 0 on the chain page. Measured with the design rendered
beside the live page (`scratchpad/guide-handoff/`): the row's boxes match to the pixel at 1440 and 1920, and it stacks
at 390.
**The right margin (the user, 2026-09-30):** above 1728 the step's content had been centred at 1568px (the audit of
2026-09-26), so at 1920 the words ended 176px from the band's edge where the file has 80. The rule is gone; the words
sit at the edge at every width, as the file draws them. **Where the close band's words live** (the user asked): every
line of it is the "Guide page copy" toggle on /guides (`3e3e800a…a576f9`) — Done, Staked with Encapsulate., the close
line, Next, All guides, terms, help — read by guide.js from the index it already fetches; the step words are the
guide's own slide database and the Title and Lede the Guides Database row.

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
only the counter's two numbers are rewritten by the script: **the chains are the mainnets /networks counts**
(`window.encCounts().mainnet`, the Networks set's rows; the picker's own 28 until it answers) and **the guides are the
gallery's cards**, which its view keeps to the Live rows (2026-10-14, the user: "shouldn't the chain count be = what we
display in network … guide count should be equal to whatever we have live"; it had read "13 chains · 13 guides", the
chains that had a guide, and counted guides one per chain). It is a lone band of the
site's snap (`snap.js` since 2026-10-28; a second IIFE in guides.js until then): a gesture heading at the panel from
within half a screen lands on it, one gesture leaves it whole. Once a pick grows it past the screen it is no stop, so
keepInView's scroll stands (measured 2026-10-28: 1366×768 scrolls 65px and stays, 1024×768 110px).

**Once a chain is picked the band grows past the screen** (the wallet row and the 357px card join
the sentence: 1,021px at 1440×900 with the old padding). The handoff of 2026-09-26: 64px top padding
instead of up to 200, and on a pick, if the card's foot is below the fold, guides.js `keepInView()`
scrolls by just that difference (24px of air; never scrollIntoView, never when it fits). The snap
does not undo it: the grown band is no stop. Measured with real clicks: 1440×900
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
