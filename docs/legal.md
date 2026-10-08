# The legal pages

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

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
