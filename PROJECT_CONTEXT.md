# Project Context — Jabal Al Heerah Auto Paints

Last updated: 2026-10-27

## What it is

Bilingual (English `/en`, Arabic `/ar`, RTL) shop website for **Jabal Al Heerah Auto Paints**, an auto paint & car-care supply shop in Industrial Area 4, Sharjah, UAE (domain `jabalheerah.ae`).

- Customers browse ~1,224 products (3M, 4CR, DeVilbiss, Farecla, Armor All, Meguiar's, etc.), add to cart, and **send the order on WhatsApp**. No online payment.
- Customers can request **service quotes** (denting, painting, polishing, detailing, etc.) on WhatsApp.
- No database, no backend API, no user accounts. All content is JSON files in the repo.

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- `next-intl` for i18n (`messages/en.json`, `messages/ar.json`, `src/middleware.ts` redirects to a locale)
- Tailwind CSS 4, `motion` for animation, `@phosphor-icons/react`
- `sharp` + `tsx` scripts for catalog import and image download
- Deploy target: Vercel or Netlify (`netlify.toml`)

## Folder map

| Path | Role |
|---|---|
| `config/site.ts` | Shop facts: phone, WhatsApp number, address, hours, VAT flag, socials |
| `config/pricing.ts` | Markup rules applied during catalog import (currently 0%) |
| `content/*.json` | Generated/edited content: products, categories, brands, services, faq, about |
| `content/catalog-index.json` | Slim product index for the client-side shop browser (generated) |
| `data/source/` | Supplier catalog (Ugarit) CSV/JSON — raw input, do not edit |
| `data/*.csv` | Owner overrides: prices, hidden, featured, in-stock, Arabic names, image blocklist |
| `data/category-map.json` | Supplier category -> site category |
| `data/brands-extra.csv` | Brands listed even with no products yet (merged into `brands.json` by the importer with `count: 0`) |
| `data/import-report.md` | Output of last import |
| `scripts/import-ugarit.ts` | Main importer: source + overrides -> `content/*.json` |
| `scripts/import-csv.ts` | Older/simple Excel CSV importer |
| `scripts/fetch-images.ts` | Downloads product photos to `public/products/*.webp` |
| `src/app/[locale]/...` | Pages: home, shop, shop/[category], product/[slug], cart, checkout, confirmation, services, services/[slug], brands, about, faq, contact |
| `src/lib/catalog.ts` | Server-only data access layer for all content (swap point for CMS/Shopify later) |
| `src/lib/cart.ts` | Cart in `localStorage` (`jah-cart-v1`) via `useSyncExternalStore` |
| `src/lib/whatsapp.ts` | Builds order / service / product-question messages and `wa.me` links |
| `src/lib/orders.ts` | Saves sent orders in `localStorage` (`jah-orders-v1`, last 30) |
| `src/lib/tracking.ts` | Sends events to Meta Pixel + GA4 if env IDs present |
| `src/lib/utm.ts` | Captures `utm_source`/`utm_campaign`, appended to WhatsApp messages |
| `src/lib/schema.ts` | JSON-LD structured data for SEO |

## How it works

1. **Data pipeline (build-time, offline):** `npm run import:catalog` reads `data/source/ugarit-catalog.*`, applies `config/pricing.ts` + `data/*.csv` overrides, groups size variants, maps categories, and writes `content/products.json`, `categories.json`, `brands.json`, `catalog-index.json`, `translations-ar.csv`, and `import-report.md`. `npm run fetch:images` downloads photos.
2. **Pages (SSG):** `generateStaticParams` pre-renders every locale x product / category / service page from the JSON via `src/lib/catalog.ts`.
3. **Shop listing:** `ShopScreen` (server) -> `ShopBrowser` (client) imports `catalog-index.json` and filters/sorts/paginates in the browser; filters sync to the URL query.
4. **Cart:** `BuyBox` adds lines to `localStorage`; header/cart read via `useCart()`.
5. **Checkout:** `CheckoutForm` validates name + UAE mobile (+ address for delivery), creates ref `JAH-YYYYMMDD-XXXX`, builds message, saves order locally, opens `wa.me/971528533654?text=...`, redirects to confirmation page.
6. **Services:** `ServiceBooking` builds a quote message and opens WhatsApp.
7. **Analytics:** `track()` fires `view_item`, `add_to_cart`, `begin_checkout`, `generate_lead` when `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_GADS_ID` are set.

## Commands

- `npm install`, `npm run dev` (http://localhost:3000), `npm run build`, `npm run lint`
- `npm run import:catalog`, `npm run fetch:images`, `npm run import:csv -- ./file.csv`

## Architecture observations (reported 2026-10-27)

- `content/catalog-index.json` (~490 KB) is imported directly into the client component `shop-browser.tsx`, so it ships in the JS bundle of shop pages. Consider serving it as a static JSON fetched on demand, or filtering server-side.
- Dead/duplicate code: `src/lib/shop.ts` (`filterProducts`, `parseShopQuery`, `paginate`) and `src/components/shop-filters.tsx` are not used; `shop-browser.tsx` has its own filtering logic and its own `ShopQuery` type.
- README "Add a product" says edit `content/products.json` by hand, but `npm run import:catalog` regenerates that file (only images are carried over), so manual edits get overwritten. The owner override CSVs are the safe edit path.
- Two importers (`import-csv.ts` and `import-ugarit.ts`) write the same files with different rules.
- Product descriptions are just the product name; most Arabic names are empty (fallback to English).
- `config/pricing.ts` markup is 0, so live prices equal supplier starting prices — must be set before launch.
- "PPE & safety" category has 0 products after import.
- No automated tests.

## Hosting (Netlify)

- Netlify site: `legendary-tarsier-f02300` (team plan `nf_team_dev`), owner account Zeshan Iqbal (GitHub `Itszeshan`).
- Primary URL on Netlify: `https://jabalheerah.ae`; branch URL `master--legendary-tarsier-f02300.netlify.app`.
- `config/site.ts` `domain`/`url` set to `jabalheerah.ae` to match Netlify (was `jabalalheerah.ae`). `site.url` feeds canonical/hreflang URLs, sitemap, robots, JSON-LD, and `metadataBase`.
- Netlify MCP connected in Cursor via remote server `https://netlify-mcp.netlify.app/mcp` (global `~/.cursor/mcp.json`).

## Local environment

- Node.js 24.22.1 LTS installed via winget (`C:\Program Files\nodejs`). Shells opened before the install may need `$env:Path = "C:\Program Files\nodejs;" + $env:Path`.
- `npm install` done (npm 11 skipped install scripts for `@parcel/watcher`, `esbuild`, `@swc/core`, `unrs-resolver`; dev server works without them, `tsx` import scripts may need `npm install-scripts approve esbuild`).
- `npm run dev` serves http://localhost:3000. First compile of `/[locale]` takes ~60 s (13.8k modules, large JSON).
- Git 2.56 installed via winget (`C:\Program Files\Git\cmd`). This folder is now a git repo linked to `origin` = https://github.com/Itszeshan/Jabal-Heerah (branch `master`), repo-local author `imzeshan <malik_zeshan83@hotmail.com>` (same as earlier commits).
- Live Netlify deploys so far were **uploads** (`Deploy triggered by upload`, no commit ref), not GitHub-triggered. Pushing to GitHub alone does not update the live site unless the Netlify site is linked to the repo or a new deploy is uploaded.
- Hydration warnings mentioning `data-cursor-ref` in the Next.js overlay come from Cursor's browser automation, not the site.

## Work log

- 2026-10-27: Studied the full project and created this context file. No code changes.
- 2026-10-27: Connected Netlify MCP (remote) and verified access to the account and site.
- 2026-10-27: Fixed map pin showing Ajman. The map searched the text address and Google matched the Sheikh Khalifa Bin Zayed St in Ajman. Set `site.geo` to `25.335618, 55.409276` (Google listing, matches 2GIS; plus code `8CP5+6PR` Sharjah, Industrial Area 4). `map-embed.tsx` now uses `site.geo` first for both the iframe and the "open in maps" link; `mapQuery` is only a fallback. `geo` also feeds JSON-LD in `schema.ts`.
- 2026-10-27: Verified on Google Maps: hours (Sat–Thu 8 AM–1 PM, 4–9 PM, Fri closed), phone and pin all match `config/site.ts`.
- 2026-10-27: Removed all Hi Q (2) and HPC (4) products at owner's request. Offer IDs `4, 19, 20, 5, 364, 701` added to `data/hidden.csv` (source of truth, survives re-import). Node is not installed, so the importer's output was applied by hand: `hidden: true` in `products.json`, entries removed from `catalog-index.json`, `brands.json` (hiq, hpc) and `translations-ar.csv`, category counts updated (clear-coats 35, thinners 17, car-care 660), `import-report.md` counts updated. Visible products now 1,218. Product images in `public/products/` kept.
- Note: `data/in-stock.csv` is empty, so every product shows "Ask availability" instead of "In stock".
- 2026-10-27: Fixed domain mismatch: `config/site.ts` and README now use `jabalheerah.ae`. Needs a redeploy to go live.
- 2026-10-27: Removed brands 4CR (92 products) and Sibren (15) from the shop by adding their 113 offer ids to `data/hidden.csv` and re-running `npm run import:catalog`. HiQ (`JAH-4`, `JAH-19`) was already in `hidden.csv`. Visible products: 1111 (1224 incl. hidden). Verified no other product changed. Pre-change backup of `content/` and `data/`: `D:\Jabal-Heerah-backup-20261027`. To bring a brand back, delete its ids from `data/hidden.csv` and re-run the import.
- 2026-10-27: Added 11 brands via new `data/brands-extra.csv` (Numix, EasiCoat, Dixie, Alva, Ritver, Liberty, Challanger, First, Mido, E2, KnM; Alva and Mido already had products). `scripts/import-ugarit.ts` merges this file into `content/brands.json`. Brands page shows "Products coming soon. Ask on WhatsApp." (`brands.comingSoon` in en/ar messages) and no shop link when `count === 0`. Total brands: 71. When their products are added, the source `brand` value must slugify to the same slug (e.g. `KnM` -> `knm`) or a duplicate brand appears.
- 2026-10-27: Committed all local work as one commit on `master` (on top of `c963790`). It also includes earlier unpushed local edits not made in this chat: exact map coordinates in `config/site.ts` + `src/components/map-embed.tsx`, and HiQ/other ids in `data/hidden.csv`. Pushed on 2026-10-28 as `dedafca` (`master` now tracks `origin/master`).
- 2026-10-28: Local `npm run build` passed (1696 product pages). Deployed to production via Netlify MCP `deploy-site` (uploads source, Netlify builds): deploy `6ae1a4963b884e7618782a3a`, live at https://jabalheerah.ae. Verified live: carousel "1 of 5", canonical/sitemap on `jabalheerah.ae`, Brands page "Products coming soon", removed brands gone, shop shows 848 products. To redeploy later: call `deploy-site` again and run the `npx -y @netlify/mcp@latest --site-id ... --proxy-path ...` command it returns from the repo folder (stop `npm run dev` first if building locally).
- 2026-10-28: New shop logo (owner's "Jabal Al Heerah Auto Paints / commitment to quality" artwork) saved as `public/jabal-logo.png` (989x525, transparent, trimmed). Used in `src/components/header.tsx` (h-20, shop name kept as `sr-only` text for screen readers), `src/components/site-loader.tsx` and `src/app/[locale]/loading.tsx` (h-32). Favicon (`favicon-32.png`) and apple-touch icon still use the old round badge because the wide logo is unreadable at 32px. Local only until committed and redeployed.
- Known issue: removed/unknown product URLs show the not-found page but return HTTP 200 (soft 404), likely because `[locale]/loading.tsx` starts streaming before `notFound()`. Worth fixing for SEO.
- 2026-10-27: Removed 27 brands with their products via `data/hidden.csv` + import: caiman, doctor-hgu, dupli-color, dyo, generic, glasurit, gs-27, gunk, gyeon, halo-efx, iwata, loctite, luminous-car-care, ma-fra, menzerna, mirka, mobihel, motip, motsenbockers, phoenix-1, poka-premium, polytop, scangrip, stoner, system-x, teroson, toa (256 products), plus 2 mis-branded ones ("Scangrip Mag Pen 3" under safety-pro, "Toa Abrasive Paper" under turtle-wax). Visible products: 848; brands: 44; `hidden.csv` has 387 ids. Backup before this step: `D:\Jabal-Heerah-backup-20261027-2117`. Category counts now: car-care 499, polishing 143, spray-guns 51, abrasives 39, other 28, clear-coats 25, masking 25, spray-paints 14, body-fillers 9, thinners 9, primers 5, bed-liners 1, ppe 0.
- 2026-10-27: Added `sonax,Sonax` to `data/brands-extra.csv` (Sonax already listed with 91 visible products; entry keeps it listed if its products are ever hidden).
- 2026-10-27: Removed brand Dyna (5 products, offer ids 3, 18, 698, 699, 700) the same way. Visible products: 1106. `data/hidden.csv` now has 124 ids.
- 2026-10-27: Installed Node, ran the site locally, checked home, shop, product, add-to-cart, and Arabic home. Fixed homepage carousel `FORMATTING_ERROR`: `src/app/[locale]/page.tsx` now passes `t.raw("slidePosition")` because `HomeCarousel` fills `{current}`/`{total}` itself.
