# Deployed artwork (WebP)

These are the compressed, display-sized WebP files the site actually loads —
referenced from `src/assets.js`. Full-resolution originals live in
`/art-source` (kept out of `/public` so they don't ship in the deploy bundle).

| File                          | Used in                    | Max display size |
|-------------------------------|----------------------------|------------------|
| `process-pour.webp`           | Process step 1             | ~340px           |
| `process-wick.webp`           | Process step 2             | ~340px           |
| `process-scent.webp`          | Process step 3             | ~340px           |
| `inside-cross-section.webp`   | Inside the Candle          | ~420px           |
| `hero-bg.webp`                | Hero background            | viewport         |
| `hero-mid.webp`               | Hero glow layer            | viewport         |
| `closing-scene.webp`          | Closing backdrop           | viewport         |
| `candle/bottom-candle.webp`   | Closing candle             | ~520px           |

To replace artwork: export a new WebP at roughly 2× its display size
(e.g. `npx sharp-cli resize 680 -i new.png -o process-pour.webp -f webp -q 80`),
drop it here under the same name, and keep the original in `/art-source`.
