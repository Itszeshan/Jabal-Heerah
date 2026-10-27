# Jabal Al Heerah Auto Paints

The shop website. Customers can browse products, put them in a cart, and send the order on WhatsApp. They can also ask for a service quote on WhatsApp. The site does not take payment.

English is at `/en`. Arabic is at `/ar`.

## Run it on your computer

1. Install Node.js 20 or newer.
2. In this folder, run:

```bash
npm install
npm run dev
```

3. Open http://localhost:3000. It sends you to the English homepage.

Copy `.env.example` to `.env.local` only when you have ad IDs. Leave them blank until then. Blank IDs mean the ad tags stay off.

## Change the shop details

Open `config/site.ts`.

- Phone and WhatsApp: `phoneDisplay`, `phoneTel`, and `whatsapp`. The WhatsApp value is digits only, with the country code and no plus sign: `971528533654`.
- Hours: replace the English and Arabic lines, then set `placeholder` to `false`.
- VAT: `pricesIncludeVat` is `false`, so the site says prices exclude 5% VAT. Set it to `true` if your shelf prices already include VAT.
- Instagram: paste the profile URL into `instagram` when the account is live. An empty string stays hidden.
- Map pin: paste the Google Maps link into `mapPinUrl`. Until then the map searches the street address.
- Exact map coordinates: leave `geo` as `null` until you copy the latitude and longitude from the pin. Do not guess them.

## Add or edit a product

Products live in `content/products.json`.

To change a price, find the product and edit the `price` on the size you sell. Prices are numbers, in dirhams, without a currency sign.

To mark a size out of stock, set `inStock` to `false` on that size. The page then says "Ask for availability".

To add one product, copy an existing product block and change:

- `id` and `slug`: a short English name with hyphens, used in the link
- `name.en` and `name.ar`
- `brand`: one of the slugs in `content/brands.json` (`3m`, `rupes`, `farecla`, `numix`, `upol-raptor`, `sonax`, `meguiars`)
- `category`: one of the slugs in `content/categories.json`
- `variants`: each size, with its own price, SKU, and stock
- `example`: set this to `false` for a real product. `true` shows an Example label so a sample price is not treated as real
- `images`: a path like `/products/photo.jpg` after you put the file in `public/products`, or a full image URL

Delete the sample products (the ones with `"example": true`) when the real list is loaded.

### Load many products from Excel

1. In Excel, save a sheet as CSV.
2. Use these column titles on the first row:

`name_en,name_ar,brand,category,price,size,sku,image_url,in_stock`

3. `in_stock` is `true` or `false`.
4. Run:

```bash
npm run import:csv -- ./your-file.csv
```

To also remove the sample products in the same step:

```bash
npm run import:csv -- ./your-file.csv --replace-examples
```

A matching SKU updates that size instead of creating a second product. `content/example-import.csv` shows one row.

## Add a service

Edit `content/services.json`. Copy a service and change the English and Arabic name, the short line, and the longer text. Leave `startingPrice` as `null` until you want a "starting from" price. Put a number there only when it is a real starting price. `image` can stay `""` until you have a photo.

## Other pages

- About text and photo list: `content/about.json`
- Questions: `content/faq.json`. Set `placeholder` to `false` when an answer is final.
- Brands: `content/brands.json`
- Categories: `content/categories.json`

## Orders

Checkout does not charge a card. It opens WhatsApp to the shop number with the order typed out, including a reference like `JAH-20261014-AB12`. The cart stays until the customer presses "I sent it". The order is also saved in that browser so they can resend it.

If the link includes `utm_source` or `utm_campaign`, those are stored and added to the WhatsApp message as `Source: ...`.

## Deploy

The site is a Next.js app. It does not need a separate database for this version.

### Vercel

1. Push the project to GitHub.
2. Import it at https://vercel.com/new.
3. Add the same `NEXT_PUBLIC_` values from `.env.example` if you have them.
4. Deploy. Point `jabalheerah.ae` at the Vercel project.

### Netlify

1. Push the project to GitHub.
2. Add a new site from that repo at Netlify.
3. Build command: `npm run build`. Publish directory: leave Netlify on its Next.js defaults. Do not set the publish folder to `out`.
4. Add the environment variables, then deploy.
5. Point the domain at Netlify.

After either deploy, run `npm run build` locally first so you know it compiles.

## Ads

When you have the IDs, put them in the host's environment settings:

- `NEXT_PUBLIC_META_PIXEL_ID`
- `NEXT_PUBLIC_GA4_ID`
- `NEXT_PUBLIC_GADS_ID`

The site then loads Meta and Google tags and sends product views, add to cart, checkout, and WhatsApp leads. Values are in AED.

## Update the product list

The shop list is built from the two files in `data/source/`. Do not edit those files by hand. Your own edits live in the files below, and a new import keeps them.

These starting prices are not the shop's prices. Before the site goes live, set your own markup in `config/pricing.ts`, or put real prices in `data/prices.override.csv`. A row there is `offer_id,price_aed` and it always wins.

1. Replace the two files in `data/source/` when you have a newer list.
2. Run `npm run import:catalog`.
3. Run `npm run fetch:images` if you want the photos downloaded again. Photos already saved are skipped.

What you can edit without code:

- `config/pricing.ts` — markup or discount, per brand or category, and rounding. `showCompareAt` stays off unless you want an old price shown.
- `data/prices.override.csv` — your price for one item. Use the number from the product SKU (`JAH-481` means offer id `481`).
- `data/translations-ar.csv` — Arabic names. Leave a cell empty and the site shows English.
- `data/hidden.csv` — offer ids to hide. Items that disappear from a later list are added here. Files are not deleted.
- `data/featured.csv` — offer ids to show on the home page.
- `data/in-stock.csv` — offer ids you know are in the shop. Everything else says "Ask for availability".
- `data/image-blocklist.csv` — offer ids whose downloaded photo should not be used.
- `data/brands-extra.csv` — brands to list on the Brands page before they have products (`slug,name`). A brand with no products says "Products coming soon".
- `data/category-map.json` — which shelf a source category belongs on.
- `public/products/custom/` — drop a photo named with the product link slug, for example `the-product-name.webp`. That photo is the one the site uses.

`data/import-report.md` lists new items, removed items, price changes, categories that still say Other, and photos that did not download.

## Later, not built yet

The product pages read from `src/lib/catalog.ts`. That file is the place to switch the JSON for a CMS or Shopify later. Checkout is one form, so a card payment step can be added there. Customer accounts and delivery fees by emirate are not in this version.
