# RestaurantFoods SEO implementation — 19 October 2026

## Architecture and preserved functionality

The existing application uses a Vinext Worker with D1 data, a static JavaScript client and hash routes. Public pages now use request-time server-rendered HTML. Existing authentication, reservations, orders, cart, restaurant management, payment behavior and hash routes remain available through the app. The root page includes a server-rendered Russian landing page and the existing application shell. Localized public pages have no React hydration or authentication requests.

## Public URLs and discovery

- `/ru`, `/uz`, `/en`: localized landing pages.
- `/{lang}/restaurants`: approved, non-demo restaurant directory.
- `/{lang}/restaurants/{id}`: stable, individually addressable restaurant pages.
- `/{lang}/blog` and `/{lang}/blog/{slug}`: article index and articles.
- `/{lang}/faq`: six useful answers about the actual service.
- `/sitemap.xml`: generated directly from active non-demo restaurants and published articles on each request. Draft/unpublished/deleted articles disappear automatically. Article lastmod reflects saved updates, not crawl time.
- `/robots.txt`: links the sitemap and excludes API/auth/admin paths from crawling. Robots directives are not access control.

Localized pages have their own titles, descriptions, H1, canonical URLs, language attributes, reciprocal hreflang and x-default, Open Graph and Twitter metadata. Root canonical is `/ru`. Only available published article translations receive alternate links. Private application hash views set noindex and remain outside the sitemap. They continue to require JavaScript; the public informational pages do not.

## Restaurant data and structured data

Public HTML includes restaurant name, address, cuisine, owner-provided opening hours, services, delivery fee/time when supplied, menu prices, availability, ingredients and allergens. Restaurant and BreadcrumbList JSON-LD use current database records. Opening-hours text is displayed without inventing a machine-readable weekly schedule. Ratings include only non-demo reviews tied to completed reservations/orders and active real accounts. The visible score and JSON-LD use the same eligible reviews (up to the displayed 100 most recent reviews).

Demo IDs/names are excluded from public directories and sitemap. A direct demo page returns noindex in HTML and HTTP headers, has a prominent demo notice, and does not emit Restaurant or rating structured data. Existing in-app demo testing is retained.

## Blog administration

A new Blog management link in the existing admin panel provides creation, editing, draft/published status, viewing and deletion. Three practical guides are initially published in Russian, Uzbek and English (nine localized records): table booking, reading menus and choosing a restaurant. FAQ and article content state current payment/delivery limits honestly.

Use the same slug for translations. Plain text and `##` headings are supported; HTML is escaped. The backend reuses the existing authenticated administrator check, same-origin JSON protection, request-size limit and rate limiting. Unique language/slug constraints prevent duplicates. No authentication provider configuration changed.

## Performance and safety

Public pages load the existing stylesheet and a small supplemental stylesheet/script. No new frontend package, map iframe or CAPTCHA is loaded on localized public pages. Images use explicit dimensions, consistent 4:3 layout, lazy loading and async decoding; existing uploaded image formats/storage are preserved. Arbitrary remote images are not re-encoded and no unsupported optimization gain is claimed. No customer email, phone, booking or order details are exposed in public restaurant pages. Existing framing and content-security restrictions remain in place. Database changes are additive.

## Validation

Passed locally: SEO/SSR and metadata across all three languages; sitemap data changes; demo exclusion; invalid-page 404; real-review eligibility; HTML/JSON-LD escaping; admin CRUD and unauthorized/CSRF rejection; draft exclusion; root application compatibility; localization; commerce calculations and filters; authentication; security; table layout/booking and upload ownership; delivery/GPS permissions; demo data integrity; TypeScript.

Production build and deployment are checked in the publication workflow. Live read-only HTTP checks are reported in the chat after deployment. Browser interaction, mobile screenshots, Lighthouse and Google's Rich Results Test have not been run in this environment. Existing reported Lighthouse Performance 94 / SEO 100 are not independently re-measured or guaranteed.

## Search Console and AI search

Submit `https://restaurantfoods.online/sitemap.xml` in the verified Search Console domain property, then inspect `/ru`, `/uz`, `/en` and a real restaurant URL when available. Domain-property verification and submission are not performed by this change. No real approved restaurant currently needs to be fabricated for indexing. Useful crawlable HTML, explicit entities and factual content support search and AI retrieval, but indexing, ranking, AI citations and rich-result display are not guaranteed. No fake AI-search tags or fabricated ratings were added.
