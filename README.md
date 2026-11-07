# Sandal landing page (Astro + Tailwind + Alpine)

One-product landing page, cash on delivery, in 3 languages:

| Language | Address | Direction |
| --- | --- | --- |
| Arabic / Darija (main) | `/` | right-to-left |
| French | `/fr/` | left-to-right |
| English | `/en/` | left-to-right |

Orders go to a Google Sheet through a Google Apps Script.

```
src/config/product.ts      ← EDIT THIS: prices, colors, sizes, photos, links, pixels, languages
src/config/translations/   ← EDIT THIS: all texts — ar.ts, fr.ts, en.ts
src/assets/products/       ← product photos (auto-optimized to AVIF/WebP)
src/components/            ← one file per page section
src/scripts/app.ts         ← interactivity (form, live total, sticky bar…)
src/styles/global.css      ← brand colors & fonts (@theme)
google-apps-script.gs      ← paste into Google Apps Script (then run "setup" once)
```

---

## 1. Install and run

Requirements: **Node.js 22.12 or newer** (https://nodejs.org, choose "LTS").

```bash
npm install
npm run dev        # → open http://localhost:4321
```

In dev mode, if `scriptUrl` is not set yet, submitting the form **simulates** a successful order
(so you can test the thank-you page). In production it shows the error message instead.

Other commands:

```bash
npm run build      # builds the site into dist/
npm run preview    # serves dist/ locally to test the real build
```

## 2. Edit the settings and the texts

### `src/config/product.ts` — things shared by all languages

Replace every value between `[brackets]`.

- **`site`**: brand name, WhatsApp number (digits only, e.g. `212612345678`), Instagram URL,
  `scriptUrl` (step 4), pixel IDs (step 5). `reviews`: your **real** customer reviews
  (text, name, city); the reviews section stays hidden while this list is empty.
  `languages: ['ar', 'fr', 'en']` — remove `'fr'` or `'en'` to switch a language off
  (its pages and its button in the language switcher disappear).
- **`product`**: prices (`price`, `oldPrice`, the discount % is calculated automatically),
  `bundle` (e.g. `{ pairs: 2, totalPrice: 349 }` = every 2 pairs cost 349 MAD), `maxPairs`,
  `benefitIcons` (icon names are listed in `src/components/Benefits.astro`), size guide table.
- **Colors**: to add a color, copy one `{ id, label, hex, images, sizes }` block.
  `id` must be unique, in Latin letters, without spaces (e.g. `"navy"`).
  `label` is the color name in each language: `{ ar: 'أزرق', fr: 'Bleu', en: 'Blue' }`.
  To remove a size, delete it from that color's `sizes` array.

### `src/config/translations/ar.ts`, `fr.ts`, `en.ts` — the texts

One file per language, with exactly the same structure: product name, headline, benefits, FAQ,
size tip, SEO title/description, buttons, form labels, error messages, thank-you page, cities.

- Keep the words in curly braces like `{product}`, `{n}`, `{old}` — they are replaced automatically.
- If you add a key in `ar.ts`, add it in `fr.ts` and `en.ts` too (`npm run check` tells you if one is missing).
- Currency label: `درهم` (Arabic), `DH` (French), `MAD` (English) — change it in each file.

Also set your real domain in `astro.config.mjs` (`site: 'https://your-domain.com'`).
It is used for the canonical URL, the share image and the language links for Google.

## 3. Product photos

The original photos (one per color) are in **`src/assets/products/originals/`**
(`black.png`, `beige.png`, `brown.png`). From each one, this command builds the 3 site images
(`{color}-1.webp` full product, `-2` buckle close-up, `-3` front close-up):

```bash
npm run images
```

To change a photo: replace the file in `originals/` (same name, same framing), then run `npm run images`.
Then run `npm run logo` too, so the social share image (`public/og-image.jpg`) uses the new photo.

You can also put your own extra photos directly in `src/assets/products/` and list them in the
`images` of the color in `product.ts`. The **first** image of each color is shown in the hero.

- Format: **JPG, PNG or WebP**, **square (1:1)**, at least **1200 × 1200 px**.
- Astro automatically creates small AVIF/WebP versions for each screen size, so don't worry about weight.
- Use your own photos only (no photos from other brands).

### Logo

The logo comes from **`src/assets/brand/logo-source.jpeg`** (dark logo on a light, plain background).
To change it, replace that file (same name) and run:

```bash
npm run logo
```

This rebuilds the transparent logo files used in the header and footer (dark + light versions),
the favicon, the iPhone home-screen icon and the share image `public/og-image.jpg`.
For the cleanest result, use a high-resolution PNG/JPG with the logo centered like the current one.

## 4. Google Sheet + Apps Script (receiving orders)

1. Create a new Google Sheet (e.g. "STRADA – Commandes").
2. Menu **Extensions → Apps Script**. Delete the code you see, paste the whole content of
   `google-apps-script.gs`, and click **Save** 💾.
3. In the function menu next to ▷ **Run**, choose **`setup`**, then click ▷ **Run** (once).
   Authorize access with your Google account
   (if you see "Google hasn't verified this app": **Advanced → Go to … (unsafe)**; it's your own script).
   This creates and formats the **Commandes** tab.
4. Click **Deploy → New deployment** → the ⚙️ icon → **Web app**.
   - **Execute as: Me**
   - **Who has access: Anyone** (customers don't sign in; the link can only *add* rows, not read them)
5. Click **Deploy**, copy the **Web app URL** (it ends with `/exec`) and paste it into `site.scriptUrl` in `product.ts`.
6. Test: open that URL in your browser. You should see `{"result":"ok",...}`.

The **Commandes** tab (in French, whatever language the customer used):
`N° | Date | Nom | Téléphone | Ville | Adresse | Articles | Qté | Total (DH) | Note | Langue | Statut`

- **N°**: `CMD-0001`, `CMD-0002`… (never reused).
- **Téléphone**: click it to open a WhatsApp chat with the customer (to confirm the order).
- **Ville / Articles**: always in French (`site.sheetLang` in `product.ts`), one pair per line (`Noir – 42`).
  The address is kept as the customer typed it.
- **Langue**: the version of the page the customer used (call them back in that language).
- **Statut**: drop-down menu with colors: Nouveau → Injoignable / Reporté → Confirmé → Expédié → Livré → Payé (finished).
  Other outcomes: Échange (size exchange), Retourné (refused / sent back), Annulé (cancelled before shipping).
- Filters on the titles: sort or filter by status, city, date…

⚠️ If you change the script later: **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.
Otherwise the old version keeps running. The URL stays the same.

**Ads tip:** link each ad to the right language: `https://your-domain.com/` (Arabic),
`https://your-domain.com/fr/` (French) or `https://your-domain.com/en/` (English).

## 5. Google Analytics 4, Meta and TikTok Pixels

### Google Analytics 4
1. https://analytics.google.com → **Admin** (⚙️) → **Create → Property** (time zone: Morocco, currency: MAD).
2. **Data streams → Add stream → Web**: your site address, then **Create stream**.
3. Copy the **Measurement ID** (`G-XXXXXXXXXX`) into `site.ga4Id` in `product.ts`.
4. In **Admin → Events**, mark `generate_lead` (and `purchase`) as **Key events** (conversions).

GA4 loads after the page has finished loading, so it doesn't slow down the site. Events sent:

| When | GA4 event | Meta / TikTok |
|---|---|---|
| Gallery or offer seen | `view_item` | ViewContent |
| Customer starts filling in the form | `begin_checkout` | InitiateCheckout |
| Order sent | `generate_lead` + `purchase` (amount, colors, quantities) | Lead / SubmitForm |
| WhatsApp link clicked | `contact` (`location`: floating_button, footer, order_form, page) | Contact |

`purchase` = order **placed** (cash on delivery), not money received: compare with the **Payé** status in the sheet.

### Meta and TikTok Pixels

- Meta: Events Manager → Data sources → your Pixel → copy the **Pixel ID** (numbers only).
- TikTok: Ads Manager → Tools → Events → Web events → your Pixel → copy the **Pixel ID**.

Paste them into `site.metaPixelId` / `site.tiktokPixelId`. While a value still starts with `[`, that pixel is not loaded.

Events sent:

| When | Meta | TikTok |
| --- | --- | --- |
| Page loads | PageView | Page view |
| Gallery or offer becomes visible | ViewContent | ViewContent |
| First interaction with the form | InitiateCheckout | InitiateCheckout |
| Order sent successfully | Lead (value + MAD) | SubmitForm (value + MAD) |

Check them with the **Meta Pixel Helper** and **TikTok Pixel Helper** Chrome extensions.

## 6. Put it online (GitHub + Netlify or Vercel)

1. Create a GitHub repository, then in this folder:
   ```bash
   git init
   git add .
   git commit -m "Landing page"
   git branch -M main
   git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
   git push -u origin main
   ```
2. **Netlify**: Add new site → Import from GitHub → pick the repo. Settings are read from `netlify.toml`
   (build `npm run build`, publish `dist`). Click Deploy.
   **or Vercel**: Add New → Project → import the repo. It detects Astro automatically. Click Deploy.
3. Add your domain in the Netlify/Vercel settings, then put it in `astro.config.mjs` (`site`) and push again.

Every `git push` redeploys the site automatically.

## 7. Test a full order before running ads

1. Open the live site on your phone (also test inside the Instagram/TikTok app browser).
2. Change the color: the hero image and the gallery must change.
3. In the form, add 2 pairs: the total must show the bundle price. Remove one: back to the normal price.
4. Click "submit" with empty fields: red messages must appear under each field.
5. Fill everything with your own phone number and submit. You should land on the thank-you page with the summary.
6. Check that a new row appears in the Google Sheet with the date, the phone starting with `0`, and status `جديد`.
7. Check that the Pixel helpers show the `Lead` / `SubmitForm` event.
8. Delete the test row from the sheet.

If the order fails: check `scriptUrl` (must end with `/exec`), that access is **Anyone**,
and that you deployed a **new version** after editing the script.

## Before going live: checklist

- [ ] All `[placeholders]` replaced in `product.ts` **and** in the 3 translation files (product name, headline, benefits, FAQ…)
- [ ] Real photos in `src/assets/products/` + `public/og-image.jpg`
- [ ] Reviews: add **real** customer reviews to `reviews` in `product.ts` (the section stays hidden until you do)
- [ ] `scriptUrl`, WhatsApp number, GA4 ID, Pixel IDs, domain in `astro.config.mjs`
- [ ] Full test order done (step 7)
