# goi

**English** | [日本語](README.ja.md)

A route map of Japanese words worth using. Each word is a station on a line for its type (proverb, idiom, four-character compound, word), and each station has its own sign with the meaning, origin, an example and sources.

Site: <https://0-draft.github.io/goi/> (English) and <https://0-draft.github.io/goi/ja/> (Japanese)

## What is in here

- Idioms, proverbs and words such as 関の山, 日下開山 and 痘痕も靨, which most people know but rarely say themselves
- One page per word at `/goi/w/<id>/`, with the Japanese version at `/goi/ja/w/<id>/`
- Meanings and origins checked against dictionaries, local governments, newspapers and other sources. Every word lists its source URLs. When an origin has competing theories, all of them are given as theories
- English pages keep the Japanese headword, reading and example sentence, and add an English gloss, meaning, origin and a translation of the example
- A per-word OGP image in each language, a sitemap with hreflang links, and a 404 page that points old URLs to their new location

## Data

All words live in [`src/data/words.json`](src/data/words.json):

```json
{
  "id": "seki-no-yama",
  "word": "関の山",
  "reading": "せきのやま",
  "kind": "慣用句",
  "meaning": "どう頑張ってもそこまでが限度、という精一杯のところ。",
  "origin": "「関」は東海道の宿場町・関宿、「山」は祭りの山車。",
  "example": "この予算では現状維持が関の山だ。",
  "sources": [{ "label": "和樂web", "url": "https://intojapanwaraku.com/rock/culture-rock/164072/" }],
  "en": {
    "gloss": "the most one can manage",
    "meaning": "The utmost one can do; the limit that no amount of effort will get past.",
    "origin": "Seki refers to Seki-juku, a post town on the Tōkaidō, and yama to festival floats (dashi).",
    "example": "With this budget, keeping things as they are is the best we can manage."
  }
}
```

The schema is in [`src/lib/schema.ts`](src/lib/schema.ts):

- `id` is lowercase romaji with hyphens, and `reading` is hiragana only
- `kind` is one of `ことわざ`, `慣用句`, `四字熟語` or `ことば`. The field an expression comes from (Buddhism, sumo, kabuki and so on) goes in `origin`
- A confirmed word needs a reading, a meaning and at least one source
- A word that can't be identified yet keeps its reason in `pending` and gets no page

The build and the tests fail on data that doesn't match.

## Development

```bash
pnpm install
pnpm dev          # http://localhost:4321/goi/
pnpm build
pnpm lint         # Biome + markdownlint
pnpm check        # astro check
pnpm test         # Vitest
pnpm test:e2e     # Playwright + axe (run pnpm build first)
pnpm lhci         # Lighthouse CI (run pnpm build first)
```

- Search runs in the browser ([`src/lib/search.ts`](src/lib/search.ts)). It normalizes with NFKC, turns katakana into hiragana and matches substrings of the headword, reading, romaji and meaning
- UI strings for both languages are in [`src/i18n/ui.ts`](src/i18n/ui.ts). Pages under `src/pages/` and `src/pages/ja/` are thin wrappers around the views in `src/views/`
- OGP images are rendered at build time with satori and resvg. The font (BIZ UDPGothic) is fetched from Google Fonts with only the glyphs in use, so the build needs network access

### Visual regression tests

`tests/e2e/visual.spec.ts` runs only inside the same Playwright container as CI, because font rendering differs between operating systems. It is left out of `pnpm test:e2e` on macOS.

To regenerate the baseline screenshots after adding words or changing the design:

1. Run the `Visual baseline` workflow in GitHub Actions
2. Download the `visual-snapshots` artifact and check the images
3. Put them in `tests/e2e/visual.spec.ts-snapshots/` and commit

## Stack

| Area | Tools |
| --- | --- |
| Framework | Astro 7 (static output) |
| Runtime | Node 26, pnpm 12 |
| Types and schema | TypeScript 6, Zod 4 (Astro content collections) |
| Lint and format | Biome 2, markdownlint-cli2 |
| Tests | Vitest 5, Playwright, axe-core, Lighthouse CI |
| OGP images | satori, resvg |
| Hosting | GitHub Pages |

## CI

| Workflow | What it does |
| --- | --- |
| `ci.yml` | Lint, astro check, unit tests, build, e2e on desktop and mobile, Lighthouse |
| `deploy.yml` | Deploys to GitHub Pages on push to `main` (OIDC) |
| `security.yml` | Checks the workflows with actionlint and zizmor |
| `visual-baseline.yml` | Regenerates the visual regression baselines (run by hand) |

- Every action is pinned to a commit SHA, and the repository settings require it
- Dependabot updates npm packages and GitHub Actions weekly, grouped, with a 7-day cooldown
- `main` can't be deleted or force-pushed
