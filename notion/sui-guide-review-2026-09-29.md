# The Sui guide — review, 2026-09-29 (read-only; nothing was changed)

Asked for by the user: "review it and create a table with comments that needs to be fixed, let me review it dont fix it
yourself". Read: the guide's row in the Guides Database, its nine slide rows and their captures (each one looked at),
the page's blocks, the live page https://encapsulate.xyz/guides/sui, and Axelar's guide as the converted reference.

**State found.** The guide has been rebuilt: nine steps on SuiVision's dashboard with the Slush extension, rows created
2026-09-28, and the live page builds in the new design. No Suiet is left in any word, link or capture.

## Findings, most serious first

| # | Where | What it says now | What is wrong | Suggested fix |
|---|---|---|---|---|
| 1 | Close band — the "Guide page copy" toggle on /guides, `close line` | "Rewards accrue from the next block. Next up: {next}." | Wrong for Sui: new stake becomes active at the next epoch (about 24 h) and rewards are added per epoch. The line is shared by every converted guide | A neutral shared line ("Rewards start once your stake is active."), or a line of Sui's own — which needs a small guide.js change |
| 2 | Row, `meta:image` (the social card) | "Thirteen steps across the Slush extension…", "THIRTEEN SCREENS" | Stale: the row, the Lede and the page all say nine | `python3 scripts/og_cards.py guides --only sui`, then refresh twice in Super — after the wording fixes below |
| 3 | Steps 3–4 — a screen is missing | 03 "Open the Stake tab and click Connect Wallet." then 04 "Unlock your wallet" | Picking Slush from SuiVision's wallet list is not shown, and no step's Name, Body, Watch or Surface contains the word "Slush" | A step with a capture of the wallet list, Slush highlighted; or in step 3's Body "Click Connect Wallet and choose Slush.", and 04 renamed "Unlock Slush" |
| 4 | Row, `Lede` and `meta:description` | "Nine steps across the Slush extension and its dashboard…" | The dashboard is SuiVision's, not Slush's | "Nine steps across SuiVision and the Slush extension, one per screen, each with the screen you should be looking at." |
| 5 | Step 6, `Link` | Surface "SuiVision Dashboard", Link `https://slush.app/` | The surface link opens Slush's site on a SuiVision step | Step 3's link, `https://suivision.xyz/myspace?feature=Stake&validatorAddress=0x01d0…6ff7` |
| 6 | Step 6, `Body` | "Type the amount of SUI to stake with Encapsulate. The dollar value updates as you type." | The capture shows no dollar value (the sentence is Axelar's); the capture highlights Stake, the words never say to click it | "Type the amount of SUI to stake with Encapsulate, then click Stake." |
| 7 | Step 9, `Body` and `Watch` | "Rewards accrue as the stake becomes active."; Watch empty | Vague. The capture shows "Pending reward +0 SUI" and "Staking Rewards Start Epoch #1,265", which reads as nothing happening. Unstaking is never mentioned, though the capture shows the button | Body: "…Your stake becomes active at the next epoch, within about 24 hours. Pending reward reads +0 SUI until then." Watch: "Unstake returns your SUI at once. You give up only the current epoch's rewards." |
| 8 | Row, `Time` | 6 (with `Step` 9) | Left from the 13-step version; the rule gives 4.5 and the other nine-step guides carry 4. /guides shows 6 | 4 |
| 9 | Step 3, `Watch` | "Check that the wallet you want to use is selected." | Nothing is selected on this screen (the capture shows only Connect Wallet), and the guide has no address check, which Axelar's has | "Check the card reads Encapsulate, 0x01d0…6ff7. Anyone can name a validator Encapsulate." |
| 10 | Step 2, `Watch` | "Review the commission and APY shown on the page." | Repeats the Body and warns of nothing | "Commission is 8%. We keep 8% of the rewards, never of your stake." — or empty |
| 11 | Step 8, capture | Behind the confirmation: "Amount must be less than your available SUI" in orange, Stake greyed | The reader may think the stake failed (10 was still in the field after the balance fell to 2.41 SUI) | Recapture with the field cleared, or crop to the confirmation |
| 12 | Captures 5–9 | Account `0xeac3…09ec` | On its eight visible characters it is the pending Sui validator candidate named "dummyvalidator" | Recapture from a plain wallet, or remove the candidate first (row 23 of the profile list) |
| 13 | Captures 1, 2, 3, 6, 9 | "Staking APY 1.5%" | The Sui chain page says 1.4% after commission (rate dated 24 Sep) | Refresh the Networks set's Reward rate, or accept the difference |
| 14 | Step 1, `Name` | "01 · " plain, then the title formatted as inline code | The capture's alt text is cut to "01 · "; the built title looks normal | Clear the formatting on the Name |
| 15 | Step 1, `Body` | "…Search for Encapsulate and open our row." | The page has two search boxes; the capture uses the one above the validator list | "Type Encapsulate in the search box above the validator list and click our name." |
| 16 | Step 6, `Watch` | "Leave a little SUI back for fees." | Grammar; no amount, no minimum, no warning about Max | "Keep a little SUI back for fees. This stake cost about 0.01 SUI. Max stakes the whole balance. The minimum is 1 SUI." |
| 17 | All steps, `Surface` | "SuiVision Dashboard" / "Wallet extension" | Not the Axelar pattern ("On wallet.keplr.app" / "In the extension"), and never names Slush | "On suivision.xyz" / "In the Slush extension" |
| 18 | A decision — the dashboard | Title "Stake SUI with Slush"; the whole flow runs on suivision.xyz | SuiVision is BlockVision's explorer: capture 1 shows "Reference Validator: BlockVision" and the stake card can switch validator. Slush has its own staking screen | Keep SuiVision and say so in the Lede (4), or recapture in Slush's own flow |
| 19 | Steps 8 and 9, `Link` | `https://suivision.xyz/myspace` | Without `?feature=Stake` it may open the Wallet tab (not confirmed) | `https://suivision.xyz/myspace?feature=Stake` |
| 20 | Slide database, the view | Cards also show Cover as a file and Created | Axelar's view shows neither; hidden on the built page but in the raw HTML, each capture referenced twice | Switch both off in the view's options (by hand) |
| 21 | Page blocks | Column list → one column → the slide database | Axelar's database sits at the page root; harmless today | Drag the database out, delete the empty column list |
| 22 | Step 1 (optional) | Nothing on what the reader needs first | A first-time staker is not told to have Slush installed with SUI in it (Axelar's guide has the same gap) | One line in step 1's Watch |

The gas figure in 16 is the captures' own: 12.419350121 − 10 − 2.409720177 = 0.0096 SUI. A step added for 3 moves Step,
the Lede, `meta:description`, Time and the card to ten.

## What checked out

Nine rows numbered 01–09 with Step 1–9, Lede and `meta:description` both "Nine"; the order is the reader's; dashboard
captures 2800×1576 and wallet captures 720×1576, the wallet ones Slush; every link answers 200; the live page builds the
head, nine bands and the close, wide and tall detected, nothing cut at 390px; the chain page's button reads "Delegate
with Slush" and goes to /guides/sui; commission 8% matches the set; no dividers, empty paragraphs or old blocks.

## Not checked

SuiVision's wallet list (the flow needs a wallet — finding 3 is inferred from the jump between captures 3 and 4); which
tab `suivision.xyz/myspace` opens; whether SuiVision's APY is before or after commission; the full address behind
`0xeac3…09ec`; the Notion view's settings (the API cannot read a view — 20 is read from the served HTML); Slush's own
staking flow and deep link (blocked from India, and not used by the guide).
