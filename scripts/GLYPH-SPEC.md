# Network glyphs — how to make one

Every network mark on the site is the same object: **the project's own logo, flattened to pure black, on transparency, in a 600×600 frame, with its longest solid-ink side at exactly 288px, centred.** Files live in `network-glyphs/` as `NN-slug.png` (NN = next free number, slug = lowercase name with hyphens, e.g. `44-data.png`).

`make_glyph.py` (next to this file) does steps 2–5. Read the steps anyway: choosing the wrong mode produces a silent, wrong-looking result, and the checks catch it.

---

## 1 · Get the source

- **Best: an SVG** of the logo. Colour is fine — often easier than a pre-made mono version.
- **Acceptable: a PNG at least 1000px** on its longest side.
- **Not acceptable:** a favicon or anything under ~600px. Upscaling can't add detail, and small sources are why glyphs come out blurry. Ask for a vector instead.
- Public icon CDNs (web3icons, the Cosmos chain registry) cover older chains, but not most new ones.
- Never use Google's favicon endpoint. It sends no CORS headers, so its pixels can't be read, and the disc renders blank in any PNG export.

## 2 · Flatten to black — pick the branch by what the file is

| Source | Mode | Alpha comes from |
|---|---|---|
| Already transparent, any colour | `alpha` | the file's own alpha; RGB forced to black |
| Opaque, dark mark on a light ground | `inverse` | inverse luminance, stretched between the ground and the darkest ink, so white showing through the mark stays transparent |
| White (light) mark on a coloured disc — a badge | `badge` | luminance, stretched between the disc colour and the lightest pixels, so only the light mark survives |

- `--mode auto` detects the branch: it checks for a transparent border, and otherwise the border's brightness.
- If `alpha` produces a filled blob (step 3), auto retries as `badge`, because a badge on transparency looks like the `alpha` case.
- **Treating a badge as `alpha` turns it into a solid black circle.** That's the Pell failure.

## 3 · Check it isn't a filled blob

- Measure the opaque share of the final 600×600 frame (pixels with alpha > 50%).
- **A real glyph lands between 5% and 13%.**
- A filled disc is about 18%. Over 15% almost always means the wrong branch.
- **Known exception:** UX is a filled wave by design, at about 15%.

## 4 · Trim against solid ink, not any visible pixel

- Take the bounding box from pixels **at or above 50% opacity** only.
- Faint artifact pixels (invisible to the eye) must not count. That's the Avail bug: specks near the corners pushed a naive trim box to 303px when the mark was 186px, and the glyph rendered at 60% of every other one's size.
- The script keeps a 2px anti-aliasing fringe around the solid box, so edges stay smooth.

## 5 · Scale and centre

- Scale so the **longest side of that solid box is 288px**, in **one** Lanczos resample from the high-resolution working copy.
- Centre it in a transparent 600×600 frame. RGB is pure black (0,0,0), and only the alpha carries the shape.
- Don't use 80% fill (480px). The four glyphs exported at 480 came out 60% larger than the rest.

**Sharpness rules (why some earlier glyphs looked soft):**
1. Rasterise SVGs large: the working copy is 2400px on its longest side.
2. Do every step at working resolution, and resample down **once**, at the end.
3. Never threshold the final alpha to hard 0/255. The anti-aliasing is what keeps edges crisp at small sizes.
4. Never re-save a glyph through another resample (for example, opening a 600px file and saving it at 600 again with a filter).

## 6 · Wire it up

- Add the row to `SET` in `Networks Set.dc.html`: `[id, name, rate, mainnet, testnet, tier]`.
  - `rate` is `""` unless the chain publishes one.
  - `tier` is one of god / high / medium / low / filth. It orders the marks only and is **never rendered**.
- Other pages carry copies of the set, so search the project for an existing id (e.g. `"03-sui"`) to find every list. Known copies:
  - Networks Index
  - Chain Page Combined (the marquee band)
  - 404 Page (`NETS`, used by the search)
  - Navbar 4f Search (search index)
  - Network Count
  - Footer and navbar counts
- Counts on the site are derived from the arrays where the code allows. Re-check any typed count after adding a chain.

**Blog variant:** `blog-glyphs/` holds the same marks at 80% ink fill for small inline use. Generate with `--ink 480`.

## Verify before handing over

- [ ] The background is fully transparent. Open it on a dark surface.
- [ ] The ink is pure black. No colour, no grey fill.
- [ ] The longest solid side is 288 inside 600, and nothing touches the frame edge.
- [ ] The opaque share is between 5% and 13% (the script prints it).
- [ ] The mark is recognisably that project's logo.
- [ ] Put it beside an existing glyph at the same size. If one looks bigger, re-check step 4 before changing anything else.
- [ ] After a bulk import, re-run the trim check across the whole set.

## Usage

```bash
pip install pillow numpy cairosvg        # cairosvg only needed for SVG sources
python make_glyph.py logo.svg network-glyphs/44-data.png            # auto mode
python make_glyph.py badge.png network-glyphs/45-foo.png --mode badge
python make_glyph.py logo.svg blog-glyphs/44-data.png --ink 480     # blog variant
```

The script prints the mode it used, the solid box before scaling, and the opaque share. It exits non-zero if the share is outside 5–13% (pass `--allow-filled` for a mark like UX).
