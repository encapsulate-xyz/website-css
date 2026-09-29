# The Sui guide — review, 2026-09-29 (read-only; nothing was changed)

Asked for by the user: "review it and create a table with comments that needs to be fixed, let me review it dont fix it
yourself". Read: the guide's row in the Guides Database, its nine slide rows and their captures (each one looked at),
the page's blocks, the live page https://encapsulate.xyz/guides/sui, and Axelar's guide as the converted reference.

**State now (2026-09-29, after the user's decisions).** The guide is **ten steps**: the team added 04 "Select the
wallet" (SuiVision's Connect Your Wallet dialog, Slush highlighted, 2800×1576), which answers finding 3, and the Lede and
`meta:description` say "Ten". The step numbers below are the guide's present ones. **Findings 2 and 4 are fixed** (the Lede names SuiVision, and
the card was made again; the live page serves both). **Findings 11, 12, 13, 15, 18, 20, 21 and 22 were set aside by the user** and
are no longer in the table. Nothing else has been changed.

## Findings still open

| # | Where | What it says now | What is wrong | Suggested fix |
|---|---|---|---|---|
| 1 | Close band — the "Guide page copy" toggle on /guides, `close line` | "Rewards accrue from the next block. Next up: {next}." | Wrong for Sui: new stake becomes active at the next epoch (about 24 h) and rewards are added per epoch. The line is shared by every converted guide | A neutral shared line ("Rewards start once your stake is active."), or a line of Sui's own — which needs a small guide.js change |
| 3 | Step 4, the new card | Body "Select slush wallet from the wallet list" | The screen is there now, and its link is SuiVision's (set by the team). Its words: "slush" in lower case, no full stop. Step 5 still reads "Unlock your wallet" | Body "Choose Slush from the wallet list."; step 5 "Unlock Slush" |
| 5 | Step 7, `Link` | Surface "SuiVision Dashboard", Link `https://slush.app/` | The surface link opens Slush's site on a SuiVision step | Step 3's link, `https://suivision.xyz/myspace?feature=Stake&validatorAddress=0x01d0…6ff7` |
| 6 | Step 7, `Body` | "Type the amount of SUI to stake with Encapsulate. The dollar value updates as you type." | The capture shows no dollar value (the sentence is Axelar's); the capture highlights Stake, the words never say to click it | "Type the amount of SUI to stake with Encapsulate, then click Stake." |
| 7 | Step 10, `Body` and `Watch` | "Rewards accrue as the stake becomes active."; Watch empty | Vague. The capture shows "Pending reward +0 SUI" and "Staking Rewards Start Epoch #1,265", which reads as nothing happening. Unstaking is never mentioned, though the capture shows the button | Body: "…Your stake becomes active at the next epoch, within about 24 hours. Pending reward reads +0 SUI until then." Watch: "Unstake returns your SUI at once. You give up only the current epoch's rewards." |
| 8 | Row, `Time` | 6 (with `Step` 10) | Left from the 13-step version; the rule (18 steps = 9 minutes) gives 5 | 5 |
| 9 | Step 3, `Watch` | "Check that the wallet you want to use is selected." | Nothing is selected on this screen (the capture shows only Connect Wallet), and the guide has no address check, which Axelar's has | "Check the card reads Encapsulate, 0x01d0…6ff7. Anyone can name a validator Encapsulate." |
| 10 | Step 2, `Watch` | "Review the commission and APY shown on the page." | Repeats the Body and warns of nothing | "Commission is 8%. We keep 8% of the rewards, never of your stake." — or empty |
| 14 | Step 1, `Name` | "01 · " plain, then the title formatted as inline code | The capture's alt text is cut to "01 · "; the built title looks normal | Clear the formatting on the Name |
| 16 | Step 7, `Watch` | "Leave a little SUI back for fees." | Grammar; no amount, no minimum, no warning about Max | "Keep a little SUI back for fees. This stake cost about 0.01 SUI. Max stakes the whole balance. The minimum is 1 SUI." |
| 17 | All steps, `Surface` | "SuiVision Dashboard" / "Wallet extension" | Not the Axelar pattern ("On wallet.keplr.app" / "In the extension"), and never names Slush | "On suivision.xyz" / "In the Slush extension" |
| 19 | Steps 9 and 10, `Link` | `https://suivision.xyz/myspace` | Without `?feature=Stake` it may open the Wallet tab (not confirmed) | `https://suivision.xyz/myspace?feature=Stake` |

## Done

| # | What | How |
|---|---|---|
| 2 | The social card said "Thirteen steps" and "THIRTEEN SCREENS" | `python3 scripts/og_cards.py guides --only /guides/sui` on 2026-09-29, then the page refreshed in Super; made once more after finding 4. It reads "Ten steps across SuiVision and the Slush extension…" and "TEN SCREENS", served from Super's asset host (checked byte for byte) |
| 4 | Lede and `meta:description` said "…across the Slush extension and its dashboard…" | The user's yes, 2026-09-29. Lede: "Ten steps across SuiVision and the Slush extension, one per screen, each with the screen you should be looking at."; `meta:description` is the Title and that line. /guides/sui and /guides refreshed in Super (the guide's head reads the Lede off /guides). Old values in `backups/sui-guide-lede-2026-09-29.json` |

The gas figure in 16 is the captures' own: 12.419350121 − 10 − 2.409720177 = 0.0096 SUI.

## What checked out

Ten rows numbered 01–10 with Step 1–10, Lede and `meta:description` both "Ten"; the order is the reader's; dashboard
captures 2800×1576 and wallet captures 720×1576, the wallet ones Slush; every link answers 200; the live page builds the
head, a band per step and the close, wide and tall detected, nothing cut at 390px; the chain page's button reads "Delegate
with Slush" and goes to /guides/sui; commission 8% matches the set; no dividers, empty paragraphs or old blocks.

## Not checked

Which
tab `suivision.xyz/myspace` opens; whether SuiVision's APY is before or after commission; the full address behind
`0xeac3…09ec`; Slush's own
staking flow and deep link (blocked from India, and not used by the guide).
