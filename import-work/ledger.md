# Parity rebuild ledger: rjrt.com (home)

Baseline at plan approval: context 146,061 tokens; account extra-usage meter $308.80 (from `get_usage`).
Gate: ≥99% pixel and 0 computed-style mismatches per section at 1440 and 1280 (default bar, not lowered).

The spend column is the **account-wide** meter. Other sessions of the same migration ran in
parallel on the same account, so the spend deltas are upper bounds, not this session's own cost.
Context deltas are this session only.

| Phase / iteration | Block / variant | Change | Mismatches before→after | Pixel before→after (1440 / 1280) | Context Δ | Spend Δ |
|---|---|---|---|---|---|---|
| Intake | — | Decided upstream: widths 1440+1280, images via DA, video poster only, dropdowns built not gated. `preflight.js`: `challenge` (an Imperva `_Incapsula_Resource` script is on the page; the page itself was served in full: title "Home Page", 659 elements). `capture.js` in `live` mode classified the page `ok`; no challenge was shown, nothing bypassed | n/a | n/a | (in 146k pre-approval) | n/a |
| Capture | — | 1 bundle × 2 widths, 6 gate sections (toaster bar, header, hero, swoop, footer, overlay open state at 1440). The source-side re-click that closes the overlay times out behind the overlay; harmless because it is the last section | n/a | n/a | (in 146k) | n/a |
| Map | — | 2 sections + header/footer; plan approved: header (toaster + overlay + 5 dropdowns), `hero`, `cards image-card` + section style `blue-swoop`, footer; estimate ~$10 ($8–14) | n/a | n/a | (in 146k) | n/a |
| Template it.1 | header (rewrite) | toaster bar, logo, top + primary nav, 5 dropdown panels, stripe SVG overlapping the hero by 36px | 0→0 | 92.87 / 91.75 (the hero shade was missing in the overlap strip) | | |
| Template it.1 | header toaster bar | Arial 10px/1.5 bar, orange underlined trigger | 0 | 99.61 / 99.56 first run | | |
| Template it.1–2 | header overlay (open state) | full-screen dialog from the `/nav` statements section, rules inserted between statements | 5→0 (`strong` in `h4` computed 900: set `strong { font-weight: 700 }`) | 99.34 (1440 only) | | |
| Section it.1–2 | hero (rewrite) | photo + overlay PNG + content container | 0→0 | 26.41 / 26.27 → 99.82 / 99.80 (source has a 50% black `::before` on the media layer, found by a pseudo-element probe) | | |
| Section it.1–2 | cards `image-card` + section style `blue-swoop` | tab SVG, colour gradient per card (authored colour cell), white button; section background photo + curve SVG in `scripts.js` | 12→0 (intro `p` margin collapsed through its wrapper: `display: flow-root`) | 84.09 / 82.27 → 99.90 / 99.89 | | |
| Template it.1–2 | footer (rewrite) | logo + legal links, disclaimer, copyright from `/footer` | 3→0 (the source colours text elements, not the footer; its hidden logo label stays black) | 99.58 / 99.53 | | |
| Build total (it.1–2) | all | 2 full gate runs (shared CSS changes both times) | 32→0 | 2/11 → 11/11 | +125k (146k→271k) | +$4.70 (account-wide) |
| Lint | header, cards | `npm run lint` fixes (line length, `inset` shorthand, selector order); full re-gate after: unchanged 11/11, `offsets.js` 10/10 | 0→0 | unchanged | | |

## Harness notes for this site
- **Records vs replay:** the MHTML replay reports the overlay text at 18px; the live-captured records
  (what the gate compares) say 14px. Values were taken from the records.
- **Fragments and icon tokens:** `build.py` converts `:icon:` tokens only in pages, not in fragment
  `.plain.html` files. `tools/fragments_local.py` applies the same conversion to the local nav/footer
  copies (the pipeline does it on DA content).
- **Port:** another session's `aem up` held port 3000, so this repo's local server ran on 3017
  (`site.json` / `gate/home.json`).
- **Image keys:** the gate pairs images by file name. Local media uses the source's rendered
  renditions (`…-1536x864.jpg` etc.) so they pair; after DA upload EDS renames content images to
  `media_<hash>`, which shows them as unpaired in a post-publish gate (expected, reported, not hidden).
- **Theme images vs content images:** the hero overlay PNG, swoop background, logos and SVG shapes are
  design assets of the theme, so they live in the repo (`/images`, `/icons`, inline SVG). The hero
  photo and the 4 card photos are content and go to DA.
