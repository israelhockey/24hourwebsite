# Gold Standard Pool Service: everything we built (Nov 26, 2026)

Prospect: Gold Standard Pool Service, Glendale AZ. Site: goldstandardpoolservice.com (WordPress + Yoast). Phone (602) 695-9095, info@goldstandardpoolservice.com.
Floor key: `goldstdpool`. Status: replied. Follow-up: Mon Nov 30.

## Live (noindex) pages
- Home page preview: https://go.simplyailive.com/demo/gold-standard/   (source: demo/gold-standard/index.html)
- Plan page + explainer: https://go.simplyailive.com/demo/gold-standard/plan/   (source: demo/gold-standard/plan/index.html)
- Explainer video (55 s, 1080x1350, silent, on-screen text): demo/gold-standard/explainer.mp4
- Hero video (Flow, Veo 3.1 Lite, 8 s, muted loop): demo/gold-standard/img/hero.mp4
- Images: demo/gold-standard/img/ (hero.jpg is Flow-enhanced, others are originals color-graded in PIL)

## Email sent Nov 26 07:52 PT
"Re: your site", both links, 10-minute screen share offer. Resend id 01a2188e-4b9c-7b73-9e44-d4c94c82d1e5.
Earlier thread: our Nov 25 audit email, his reply (WordPress analytics claim + screen recording).

## His assets (all from his own site / Google)
Photos (wp-content/uploads/2026/08): IMG_E2712 (water test), IMG_E4421 (filter install), IMG_E2949 (net skim), IMG_2811 (pool float), IMG_3186 (filter rinse), banner (tech in GSPS shirt by pool). Logo: uploads/2026/02/cropped-cropped-logo-2.png (GSPS, yellow/blue, water drop). Brand: yellow #FEC70E, navy #16213E, blue #0031A9/#006BE4, font Montserrat. Tagline "The standard others follow". Monthly Service Price Estimator at /weekly-service-price-estimator/.
Review quotes used (from his screen recording of his Google listing): "Does exactly what they said they would at an okay price. Very very good company." / "Great service!, Great Pricing!" / "Conner's team has been a pleasure to work with."

## Flow (labs.google/fx flow, project efc806a7-fece-4ee4-9eb8-5e788d8618d3)
Uploaded his 6 photos (titles gs-*). NOTE the titles do not match content (e.g. gs-uniform-pool was IMG_31861 but Flow's agent matched by picture). Nano Banana enhanced 4 photos (uniform/hero, net skim, water test, filter rinse). Only the hero came out big enough (1344x756, in flow-enhanced/). The other three are 512px thumbnails, so the page uses the originals instead. Flow garbles small shirt lettering ("Gold Standard Pool Service / Call today..."), so hero is cropped above it and darkened. Hero video made from the enhanced uniform image, downloaded by hand by Tom (Flow auto-download of video fails). Flow credits ran out after this.
Trick that worked: Flow uploads without a file dialog by hooking HTMLInputElement.prototype.click and feeding fetched files (images hosted on go.simplyailive.com). Downloads of images work via Flow's download button; files land in ~/Downloads.

## Audit (measured Nov 26, 2026)
His site, PageSpeed mobile: perf 91, a11y 95, best practices 77, SEO 92. 5-page crawl: no meta description on any page (Yoast installed, empty); titles "Home -/Services -/About -/Contact - Gold Standard Pool Service"; home H1 is the slogan, other 4 pages no H1; no tel: links; no analytics code anywhere; schema generic WebPage only; alt text missing (3 of 5 home images, 11 of 13 on Services); no reviews on site; Lighthouse flags insecure http content. Maps: about #8 for pool service Glendale (earlier check), 5.0 stars, 10 reviews.
Demo page: perf 96, a11y 100, best practices 100, SEO 69 only because of noindex.

## Open items / to confirm with him
Service cities (placeholders: Glendale, Peoria, Avondale, Goodyear, Surprise, Litchfield Park); business hours; which photos to feature; his address is an apartment (kept off the page; recommend service-area business on GBP); no prices on the plan page yet; quote form on the demo is not wired.
If he says yes: offer rebuild as new site or apply to his WordPress; set Yoast titles/descriptions, add tel: links, GA4 + Search Console, LocalBusiness schema, GBP cleanup, review-request link.

## Rebuild the explainer
explainer-src/: scenes.py writes scene HTML, render.py <scene> renders each to mp4 (Playwright frames piped to ffmpeg, 1080x1350, 30 fps), concat with ffmpeg and add a silent AAC track. Edit names, numbers and the phone in scenes.py to reuse for another prospect.
