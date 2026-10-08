# The guides

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## The guide page (2026-09-22, design *Staking Guide Variation 1d*)

One step per screen. An ink head with the chain's disc and the wallet's mark, the Title and the
Lede; a paper band per step carrying the number, the surface as a link, the title, the body, the
"Watch out" note and the capture, with the step's numeral hollow at the bottom right and its green
fill rising with the reader's progress; an ink close with the next guide.

**Every word is Notion's**, in three places:

| What | Where |
|---|---|
| A step: its capture and its words | **one row of the guide's own slide database** — `Name` ("01 · Unlock Keplr"), `Step`, `Body`, `Watch`, `Surface`, `Link`, and the capture as the row's `Cover`. Everything about a step is one record (asked for 2026-09-22; the copy was briefly in toggles on the page and that is gone) |
| The head's title and Lede | the `Guides Database` row's **Name** (its page title) and **Lede** — Super does not render a row's properties on its own page, so they are read off /guides, as post.js reads the blog index. **Since 2026-10-01 (v346) the title is the Name**: a Title property ("Stake AVAX with Core") had stood beside a Name that drifted ("AVALANCHE", "Delegate ESP with Metamask"), and the /guides picker's answer card, which read the Name, showed the drifted one. Every Title was copied into its Name and Title deleted (`backups/guides-name-title-2026-10-01.json`); guide.js, navbar.js, og_cards.py and the SEO job read Name. Proved on the live site before and after each step (`scratchpad/guidename/`): all 32 guide pages, the picker's card for every chain and the navbar's Learn rows identical but the picker's card, now the guide's title. The 7 guides with no Networks set row (Stargaze, UX, Quicksilver, OmniFlix, Mellow, Namada, Juno) are **Status Concluded** (to be removed — the user); the /guides view lists only Live, so Mellow left it and the picker's counter reads "24 chains · 24 guides" |
| The crumb, "Watch out", "{N} screens", the close band, the Discord line | the **"Guide page copy" toggle on /guides**, `key · value` lines — one place for 33 guides. `{n}` is the step count, `{N}` the same spelled ("Eight screens"), `{next}` and `{chain}` the next guide |

**Converted guides so far: Axelar, Sui (ten steps, SuiVision + Slush), Espresso, Monad (below), Terra, Agoric, NEAR, Lumera,
Passage, Gravity Bridge and ixo** (2026-10-08: Passage on the Keplr flow; Gravity Bridge and ixo are seven steps on **ping.pub**
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
1440×900), and the dots are `background-attachment: fixed` — the file's single sticky ground.
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

Snapping is the design's, moved to the document: Super is the scroller, so
`scroll-snap-type: y mandatory` is set on `html` for this page and every band is a stop, the
footer included, off under 701px and with reduced motion. **A step rests at the top** since v348 (the user's
screenshot, 2026-10-02): Super's `html { scroll-padding-top: 62px }` had stood every key and trackpad snap 62px
down with the band before it showing above — the chain pages' fault of v339, and older than the old page CSS
(checked with it put back). guide.css sets it to 0 on a built guide. **Test a snap with a real key press**
(`livecheck.mjs --steps`, `press('ArrowDown')`): a scripted `scrollTo` re-snaps to the band's own top and
hides the padding.

**The page opened at its foot** until 2026-09-23: ten screens are inserted above the reader on
build, and Chrome's scroll anchoring answered by holding what they were looking at — the footer —
in place. `overflow-anchor: none` for the page, and guide.js restores the top when the build
started there (a `#block-…` link is left alone).
**And it still opened at its foot and climbed** until v340 (the user, 2026-09-30: "why does every reload start
at the bottom and scroll up"): the snap was keyed on the build, so the footer — the raw page's one snap stop — was
the snapped target when the bands went in above it, a mandatory snap re-aligned the page to it (not anchoring:
that was already off), and the restore to the top ran as a 1.5s smooth scroll under the page's own
`scroll-behavior`. Now guide.js switches the snap on (`html[data-enc-guide-snap]`, which guide.css keys the snap
rules on) only 120ms after the built page stands at its top, and the restore is `behavior: "instant"`. Reproduced
and proved with a reload in headless Chrome, sampling scrollY every 60ms (`scratchpad/guide-handoff/steps-reload.mjs`):
0 → 8038 → a 1.5s climb before; 0 throughout after. Headless wheel gestures do not move this page (mandatory snap
with smooth scrolling), before or after — the snap was checked by computed style instead, identical to v338.

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
every band its key as an `id` (`terms`, `estimate`, `s0`…) and **holds the `#terms` landing** (`landHash()`): the bands
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
