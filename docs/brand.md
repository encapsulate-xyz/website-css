# /brand

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## The brand colour band names three sets (2026-09-21)

The handoff's 02 band is the brand pair, then **the grounds**, then the pastels — the grounds were
missing from Notion and were added: the `Colour` database (`3dee800a…de667797d25c`) gained a
**Ground** option on Set, a **Job** rich-text property and the two rows (Paper `#FAFAF8` "Every
light page and slide", Ink ground `#2A2C28` "Every dark section and slide"), and the page gained
the pair of texts that head them ("The grounds" + "Our paper is not white and our dark sections are
not black. Put the mark on these, not on #FFF or #000.").

`brand.js` builds one group per set and pairs each strip with the next two Notion paragraphs in
page order, so the heads are Notion's words and the order is Notion's. A ground swatch is the
handoff's `swatchJob`: 132px, the name and its job line at the top, the value at the foot, a
hairline outline. **Job has to be switched on in the gallery view by hand** — the API cannot change
a view; without it the cell still reads as name and value.

Every property on a Notion card carries `.notion-collection-card__property`, **the title included** —
a "the property that is not X" reader must skip `.notion-property__title` or it picks up the title.
