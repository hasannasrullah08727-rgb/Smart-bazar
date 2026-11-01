# MASTER PROMPT — Build "DinStore" (single-file mobile-first e-commerce site, Firestore backend)

Copy everything below this line and paste it into any AI. If the AI cuts off, reply "continue" and ask it to resume from the exact line where it stopped, without repeating earlier code.

---

## 0. ROLE & OUTPUT RULES

You are a senior front-end engineer. Build a complete, production-quality e-commerce storefront called **DinStore** exactly as specified below. Do not simplify, skip, or replace any feature with a placeholder.

**Deliverable: ONE file named `DinStore.html`.**
- All HTML, CSS and JavaScript inside this single file (inline `<style>` and `<script>`). No build step, no npm, no separate files.
- Libraries allowed only via CDN `<script>`/`<link>` tags: React 18 UMD + ReactDOM 18 UMD + Babel standalone (or write plain JS / Vue 3 global build if you prefer), Firebase 10 compat SDK (`firebase-app-compat`, `firebase-firestore-compat`), Font Awesome 6.4.0 (`cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`), Google Fonts (Inter 400-700, Noto Sans Bengali 400-700). Pin exact versions.
- Output the full code in ONE code block. No explanations inside the code block, no "rest of code here" comments.
- UI language is English. `<html lang="bn">`. Font stack: `'Roboto','Noto Sans Bengali',Arial,sans-serif`.
- Mobile-first (looks like a native shopping app), content max-width 900px centered on desktop.

---

## 1. FIREBASE CONFIG (user fills in later)

At the very top of the file, before the main script, put this clearly marked block:

```html
<script id="cfg">
/* ===== Put your Firebase project config here ===== */
window.DINSTORE_FIREBASE = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
</script>
```

Behavior: if the config still contains `YOUR_` placeholders (or Firestore is unreachable for 12 seconds), the app silently falls back to **local mode** (all data in `localStorage`, key prefix `as_`, with in-memory fallback if localStorage throws) and shows toast "Offline mode: database not reachable". Otherwise it uses Firestore with real-time sync.

---

## 2. TECH ARCHITECTURE

- **Routing:** hash router. Routes: `#/` home, `#/list?...`, `#/explore`, `#/product/:id`, `#/cart`, `#/checkout`, `#/account`, `#/orders?f=&s=`, `#/order/:id?new=1`, `#/wishlist`, `#/login?m=reg&next=`. Scroll to top on every navigation. Every page is wrapped in `<div class="page-enter">` re-mounted per navigation (fade/slide-in animation ~250ms).
- **State:** one mutable object `S` + `emit()` listeners (React `useSyncExternalStore` or equivalent). `S = { products:null, users:null, orders:[], cart:[], wish:[], session:null, recent:[], reviews:{}, msgs:[], searches:[], coupon:'', settings:{payNumber:'01XXXXXXXXX', phone:'01XXXXXXXXX', freeShip:1500, nearFee:60, farFee:110} }` and `ui = { ready, toast, showToast, sheet }`.
- `save(key)` writes to localStorage and, in Firestore mode, diff-syncs changed docs (compare sorted-key JSON strings per doc; batch `set` changed docs; delete removed products only).
- While `ui.ready` is false show skeleton loaders (`.sk` shimmer: banner block, row block, 2-col grid of 4 card blocks).
- Layout shell (always present): sticky **Header**, `<main id="app">` (max-width 900, min-height 70vh, padding-bottom 80px), **Footer** (only when ready), fixed **Bottom Nav**, bottom-sheet overlay `#sheet`, `#toast`.

### Firestore collections (each doc = plain JSON object)
`products`, `orders`, `users`, `reviews` (doc id = productId, body `{id, list:[review...]}`), `messages`, `coupons`, `settings` (single doc id `main`).
- On first load if `products` is empty, seed the 24 products (section 6) and `settings/main`.
- Real-time listeners: products (sorted by `added` desc), reviews, settings/main, coupons (active ones replace default coupons if collection non-empty), and `orders` filtered `where('uid','==',currentUserId)` when logged in.
- Strip `undefined` values before writing to Firestore (use `JSON.parse(JSON.stringify(obj))`).

---

## 3. DESIGN SYSTEM (replicate exactly)

CSS variables: `--brand:#f85606; --brand-d:#d94a04; --text:#212121; --grey:#757575; --line:#e0e0e0; --bg:#f5f5f5; --ok:#2e7d32; --err:#d32f2f`. Body bg `--bg`, font-size 14px. Theme-color `#f2530a`. Favicon: orange (#f2530a) rounded square with 🛍️ emoji (inline SVG data URI).

Component specs:
- **Header** (`.top-header`): white, padding 10px 12px, sticky top, z-index 1000, soft shadow. Row: back button (arrow-left, hidden on home) → search box (bg `--bg`, radius 8, 1px `--line` border, search icon, input placeholder "Search in DinStore", microphone icon) → icons: cart (with orange badge showing item count) and comment-dots (opens Help sheet).
  - Search suggestions dropdown under header: when empty input shows "Recent searches" (max 6, with history icon); while typing shows up to 6 matching products (name+brand) and a final "Search "xxx"" row. Enter key or row click navigates to `/list?q=`. Voice search via `SpeechRecognition` (lang en-US) with toasts "Listening..." / "Could not hear you" / "Voice search is not supported in this browser". Click outside closes.
- **Hero banner carousel:** 4 slides, 160px tall, gradient backgrounds, title (22px) + subtitle + white pill "Shop Now" + big emoji (70px) on right; auto-advance every 3.5s with translateX transition .5s; dot indicators bottom center; clicking a slide goes to its link:
  1. `linear-gradient(120deg,#f85606,#ff9a3c)` · "Mega Sale" · "Up to 60% off on top brands" · 🛍️ · `/list?cat=Offers`
  2. `linear-gradient(120deg,#1a535c,#4ecdc4)` · "New Gadgets" · "Smart watches, headphones & more" · ⌚ · `/list?cat=Gadgets`
  3. `linear-gradient(120deg,#7e57c2,#f48fb1)` · "Fashion Week" · "Fresh styles for everyone" · 👗 · `/list?cat=Fashion`
  4. `linear-gradient(120deg,#2e7d32,#a5d6a7)` · "Daily Mart" · "Groceries delivered to your door" · 🛒 · `/list?cat=Mart`
- **Category shortcut row** (white, horizontal scroll, 45px circles, 12px label): Mart (fa-store, #ff6b6b), Fashion (fa-tshirt, #4ecdc4), Beauty (fa-spray-can, #ffe66d with dark icon), Gadgets (fa-gamepad, #1a535c), Home (fa-couch, #7e57c2), Sports (fa-futbol, #42a5f5), Offers (fa-percent, brand orange).
- **Voucher strip:** horizontally scrolling dashed-orange-border tiles (bg `#fff7f2`, min-width 150) showing coupon code (bold orange), note, "Tap to apply". Tap sets the cart coupon and toasts "Coupon CODE applied to your cart".
- **Flash Sale block** (white): header with bolt icon "Flash Sale" (orange), countdown boxes `HH:MM:SS` (orange boxes, white digits) and "Shop More >" outlined link. Countdown ends at the next 8-hour boundary (`Math.ceil(now/8h)*8h`). Horizontal list of 100×100 product thumbnails with orange price and strikethrough old price + "-NN%". Only products with `flash:true` and `stock>0`.
- **Recently Viewed** block (same style, no countdown), up to 8 items.
- **"Just For You"** grid: 2 columns (4 columns ≥700px), gap 8px; "Load more" outlined button adds 8 at a time and hides when all shown.
- **Product card:** white, radius 4, image 170px tall cover; top-left orange discount badge `-NN%` (radius 0 8 8 0); top-right 28px round white heart button (pink `#e91e63` when wished); "Sold Out" translucent overlay when stock ≤ 0; title 2-line clamp (13px, height 36px); price 16px orange; old price 11px grey strikethrough; 5 gold stars (full/half/empty, FA `fa-star`, `fa-star-half-alt`, `far fa-star`) + `(reviewCount)`; "Free Delivery" tiny orange-outlined tag when price ≥ `settings.freeShip`; bottom-right 30px orange circular quick-add (cart-plus) button (hidden if out of stock). Quick-add: if product has options → go to product page + toast "Select an option", else add 1 and toast "Added to cart". Card click opens product page.
- **Buttons:** `.btn` orange bg white bold text radius 4, padding 11px 16px; `.btn.line` white with orange border; `.btn.red`; `.btn.blk` full width; `.btn.sm`; disabled grey `#bdbdbd`. A `.loading` state shows a spinner. Every async/click action button shows a ~350ms spinner before running (LoadBtn pattern, stops propagation).
- **Tags:** pill `.tag` with variants ok (green bg `#e8f5e9`), warn (`#fff3e0`/`#e65100`), bad (`#ffebee`), info (`#e3f2fd`/`#1565c0`).
- **Chips:** pill filters, active = orange border/text + `#fff4ee` bg.
- **Bottom nav** (fixed): Home (fa-home), Explore (fa-compass), Cart (fa-shopping-cart with badge), Account (fa-user); active = orange, 10px labels, 20px icons.
- **Toast:** dark pill near bottom, fades in/out, auto-hides after 2.2s.
- **Bottom sheet:** dimmed full-screen overlay; white box slides up from bottom; click on overlay closes it.
- **Footer:** brand line "🛍️ DinStore" + tagline "Quality products, honest prices and fast delivery across Bangladesh."; columns "Shop" (Home, All categories, Offers) and "Support" (Track order, Help & contact, phone from settings); payment chips (Cash on Delivery, bKash, Nagad, Rocket); "© {year} DinStore. All rights reserved."
- **Effects:** scroll-reveal fade-up for cards/sections using IntersectionObserver + MutationObserver (stagger 0.05s up to 8); Material-style ripple on buttons/chips/options/menu items (disabled when `prefers-reduced-motion`); cart badge pop animation on count change.
- **Print:** order page "Print invoice" uses `window.print()`; elements with class `noprint` are hidden in print CSS, as are header/nav/footer.

---

## 4. PAGES

**Home `/`** — banner, category shortcuts, vouchers, flash sale, recently viewed, Just For You grid.

**Explore `/explore`** — title "Categories"; grid cards (icon circle + name + "N items") for each category plus "All Products". "Offers" count = products with discount ≥ 30%.

**List `/list?cat=&q=&sort=&min=&max=&rating=&stock=&offer=`**
- Chips row: All + 7 categories.
- Bar: "N result(s) for "term"" + sort select (Relevance, Price: Low to High, Price: High to Low, Newest, Top Rated, Biggest Discount) + "Filter" button (opens Filter sheet).
- Filtering: category (`Offers` = discount ≥ 30%, not a real category), search tokens must ALL appear in `name+brand+cat` (lowercase), min/max price, min rating, in-stock only.
- 8 per page with "Load more". Empty state: search icon, "No products found", "Clear filters" button.

**Product `/product/:id`**
- Full-width image (max 420px). Card: price 24px bold orange, old price strikethrough, orange "-NN%" tag, title, stars + `rating.toFixed(1) (N ratings)`, share button (Web Share API → clipboard copy toast "Link copied" → fallback toast URL) and wishlist heart; "Brand: X · Category: Y"; stock tag (>5 green "In stock", 1-5 orange "Only N left", 0 red "Out of stock").
- "Select option" card (only if product has `opts`) with selectable chips. Quantity stepper (1..stock). Delivery card (truck: "Dhaka area ৳60 · Other districts ৳110", gift: "Free delivery over ৳1,500", "Cash on delivery available", "7 days easy return" — numbers from settings). Description card. Reviews card: count, "Write review" button (requires login → toast "Please login to write a review" and redirect to login with `next`), list newest first with stars, name, green "Verified" tag, text, date. "You may also like": up to 4 products of same category.
- Fixed bottom bar: "Add to Cart" (outlined) and "Buy Now" (goes to checkout after adding). Both disabled if out of stock. `trackRecent(id)` on view (keep last 12).
- "Product not found" empty state with "Go Home".

**Cart `/cart`** — lines with image, name, option, price, qty stepper, "move to wishlist" heart and trash icons. Coupon form (uppercase input, Apply; empty clears; invalid → toast "Invalid coupon code"; shows green "CODE applied  remove" or red error). Summary: Subtotal (N items), Discount, Delivery "Calculated at checkout", Total, "Proceed to Checkout" button. Empty state "Your cart is empty" + "Start Shopping".

**Checkout `/checkout`** — requires login (else toast "Please login to checkout" and redirect to `/login?next=/checkout`).
- Delivery info: full name, mobile (placeholder 01XXXXXXXXX), district select, full address (placeholder "House, road, area, thana"), optional note. Prefilled from profile.
- Payment radio cards: Cash on Delivery (money-bill icon), bKash, Nagad, Rocket (mobile icon). For non-COD show a light-orange box "Send ৳TOTAL via METHOD (Send Money) to {settings.payNumber}, then enter your details below." plus fields "Your METHOD number" and "Transaction ID" (uppercase).
- Order summary lines + Subtotal, Discount (CODE), Delivery (or FREE), Total. "Place Order" button + small terms note. Delivery fee recalculates live when district changes.
- On success → `/order/:id?new=1`.

**Order detail `/order/:id`** — login required. Green success card with animated check ring + "Order placed successfully!" + "Thank you for shopping with DinStore" when `new=1`. Cards: header (#id + status badge + date + timeline), items (generated SVG thumb, name link, option, price × qty, line total), delivery address, payment (method, status tag green if "Paid" else orange, TrxID/From), totals, actions (Print invoice, Reorder → adds items and goes to cart, red "Cancel order" with `confirm()` only when status Pending/Confirmed and owner).
- **Timeline:** statuses `Pending, Confirmed, Packed, Shipped, Out for Delivery (label "On the way"), Delivered`; completed steps get a green check circle; cancelled orders show a red card "This order was cancelled."

**Orders `/orders`** — login required (show login form inline). Track-by-order-ID form, chips All/Active/Delivered/Cancelled, order cards (id, status badge, date · N items, up to 4 mini thumbs, method, total).

**Wishlist `/wishlist`** — product grid with count title; empty state "Your wishlist is empty" + "Browse products".

**Account `/account`** — if logged out show login form. Otherwise: orange hero with avatar initial, name, login; stat boxes Orders / Wishlist; menu: My Orders, My Wishlist, Edit Profile & Address (sheet), Change Password (sheet), Help & Support (sheet), red Logout (toast "Logged out", go home).

**Login / Register `/login`** — hero "Welcome to DinStore" + "Login to your account" / "Create a new account". Login: "Mobile number / email / username" + password. Register: full name, "Mobile number or email", password (min 6), confirm password. Links "New here? Register" / "Already a member? Login". After success go to `next` or `/account`.

**Sheets (bottom sheets):**
- *Help & Support:* FAQ `<details>` items (How do I place an order? / Which payment methods are accepted? → "Cash on Delivery, bKash, Nagad and Rocket." / How can I track or cancel my order? / Return policy → "Unused products can be returned within 7 days of delivery."), phone line, contact form (name, phone, message) saving to `messages` and toasting "Message sent. We will contact you soon."
- *Filter:* min price, max price, minimum rating (Any/4★/3★/2★), in-stock checkbox, Clear + Apply (keeps cat/q/sort).
- *Review:* rating select (★ strings) + text; one review per user per product (toast "You have already reviewed this product"); marks `verified` if the user has a Delivered order containing the product; updates product average rating and review count; toast "Thanks for your review!".
- *Edit profile:* name, mobile, district, default address → toast "Profile updated".
- *Change password:* current + new (min 6) → toast "Password changed" or "Current password is wrong".

---

## 5. BUSINESS LOGIC (implement exactly)

- **Money format:** `'৳ ' + Math.round(n).toLocaleString('en-US')`. **Date format:** `toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'})`.
- **Discount %:** `old > price ? round((old-price)/old*100) : 0`.
- **Product image:** `product.image` if set, else a generated SVG data-URI (200×200, linear gradient from `product.color` to white, centered emoji at font-size 90). If an image fails to load, fall back to the SVG. Images fade in when loaded.
- **Cart:** items `{id, qty, opt}`. Add: out of stock → "Out of stock"; product has options and none selected → "Please select an option"; exceeding stock → "Only N in stock". Same id+opt merges. Qty stepper cannot go below 1 or above stock. "Move to wishlist" adds to wishlist, removes from cart, toast "Moved to wishlist". Wishlist toggle toasts "Added to wishlist"/"Removed from wishlist".
- **Totals `calc(district)`:** subtotal; coupon types: `pct` (percentage of subtotal, capped by `max`), `flat` (fixed amount), `ship` (free shipping). Coupon `min` order enforced (error `Minimum order ৳X required`); unknown code → "Invalid coupon". Discount never exceeds subtotal. Shipping (only when cart non-empty AND district chosen): `NEAR` districts → `settings.nearFee`, others → `settings.farFee`; shipping = 0 if (subtotal − discount) ≥ `settings.freeShip` or coupon is free-ship. Total = subtotal − discount + shipping.
- **Default coupons:** `WELCOME10` pct 10, max 200 ("10% off (max ৳200)"); `SAVE100` flat 100, min 1000 ("৳100 off on ৳1000+"); `FREESHIP` ship ("Free delivery").
- **Auth (no Firebase Auth — custom):** login normalised (trim, lowercase; if it looks like a phone number strip spaces/dashes and leading +88). Password stored as SHA-256 hex (`crypto.subtle`, fallback base64). Register validates BD mobile `/^(?:\+?88)?01[3-9]\d{8}$/` or email; passwords must match ("Passwords do not match"); duplicate → "This account already exists". User object: `{id:'u'+Date.now(), name, login, pass, role:'user', phone, address:'', district:'Dhaka', joined}`. Session id stored in localStorage; on load restore session by fetching that user doc. Login errors: "Wrong login or password". Toasts: "Welcome back, NAME", "Account created".
- **Place order validation:** valid BD phone ("Enter a valid Bangladeshi mobile number"); coupon error; for bKash/Nagad/Rocket: sender number valid ("Enter your bKash number") and TrxID ≥ 6 chars, uppercase, not already used ("This transaction ID was already used"); every line within stock ("NAME: only N left").
- **Order object:** `{id:'AS'+base36(Date.now()).toUpperCase().slice(-6)+2 random digits, uid, t, status:'Pending', hist:[{s,t}], items:[{id,name,price,qty,opt,emoji,color}], ship:{name,phone,district,address,note}, pay:{method, trx, sender, status: COD ? 'Unpaid (COD)' : 'Verification pending'}, sub, disc, coupon, ship_fee, total}`.
  After placing: decrement product stock, save user's name/phone/district/address as profile defaults, clear cart and coupon.
- **Cancel order:** only Pending/Confirmed; restores stock; appends to `hist`; toast "Order cancelled". (Moving out of Cancelled again would re-deduct stock.)
- **Reorder:** re-adds every still-existing item; toast "Items added to cart".
- **Searches:** remember last 6 unique (case-insensitive) searches. **Recent:** last 12 viewed product ids.
- **Constants:** `DISTRICTS = Dhaka, Gazipur, Narayanganj, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur, Mymensingh, Cumilla, Other`; `NEAR = Dhaka, Gazipur, Narayanganj`; `CATS = Mart, Fashion, Beauty, Gadgets, Home, Sports, Offers`.

---

## 6. SEED PRODUCTS (24)

Fields: id | name | category | brand | price | old price | stock | rating | review count | emoji | color | flash | options | description. `added = Date.now() - number(id)*1000`. Size options (SIZES) = S, M, L, XL.

1. p1 | Wireless Bluetooth Headphones Over Ear - Black | Gadgets | SoundMax | 850 | 1500 | 25 | 4.5 | 120 | 🎧 | #90caf9 | flash | — | Over-ear wireless headphones with deep bass, 20 hours battery life, foldable design and built-in microphone for calls.
2. p2 | Men's Casual Cotton T-Shirt Full Sleeve | Fashion | UrbanWear | 299 | 600 | 60 | 4.2 | 45 | 👕 | #a5d6a7 | flash | SIZES | Soft 100% cotton full sleeve t-shirt. Breathable, comfortable fit for daily wear.
3. p3 | Smart Watch T500 Plus Pro - Calling Function | Gadgets | TechFit | 950 | 2200 | 18 | 3.8 | 210 | ⌚ | #ce93d8 | flash | Black, Pink, Blue | Bluetooth calling smart watch with heart rate, step counter, sleep monitor and multiple sports modes.
4. p4 | Kitchen Rack Organizer Multi-layer | Home | HomeEase | 1250 | 2500 | 12 | 4.8 | 30 | 🗄️ | #ffcc80 | — | — | Sturdy multi-layer rack to keep your kitchen tidy. Rust-resistant coating, easy assembly.
5. p5 | Mini Portable Electric Fan USB Rechargeable | Gadgets | CoolBreeze | 450 | 800 | 40 | 4.1 | 89 | 🌀 | #80deea | flash | — | Handheld rechargeable fan with 3 speed settings. Perfect for summer.
6. p6 | Sneakers for Men - Stylish White Running Shoes | Fashion | StepUp | 1800 | 3500 | 20 | 4.6 | 15 | 👟 | #b0bec5 | — | 39, 40, 41, 42, 43 | Lightweight running sneakers with cushioned sole and breathable mesh upper.
7. p7 | Premium Basmati Rice 5kg | Mart | FreshField | 720 | 820 | 100 | 4.7 | 310 | 🍚 | #fff59d | — | — | Long grain premium basmati rice, aromatic and fluffy when cooked.
8. p8 | Soybean Oil 5 Litre | Mart | PureDrop | 890 | 950 | 70 | 4.4 | 205 | 🛢️ | #ffe082 | — | — | Refined soybean oil, rich in vitamin A and D. Ideal for everyday cooking.
9. p9 | Red Lentil (Masoor Dal) 2kg | Mart | FreshField | 260 | 300 | 90 | 4.3 | 98 | 🫘 | #ef9a9a | — | — | Clean, quality red lentils. Cooks quickly and tastes great.
10. p10 | Vitamin C Brightening Face Serum 30ml | Beauty | GlowLab | 480 | 950 | 35 | 4.5 | 167 | 🧴 | #ffcc80 | flash | — | Lightweight serum with 10% Vitamin C to brighten skin and reduce dark spots.
11. p11 | Matte Liquid Lipstick Set (6 pcs) | Beauty | RoseBloom | 550 | 1100 | 28 | 4.0 | 64 | 💄 | #f48fb1 | — | — | Long-lasting matte finish in 6 trendy shades. Smudge proof and waterproof.
12. p12 | Herbal Hair Oil 200ml | Beauty | NaturaCare | 220 | 350 | 80 | 4.3 | 142 | 🌿 | #a5d6a7 | — | — | Herbal blend hair oil that strengthens roots and reduces hair fall.
13. p13 | Women Cotton Three-Piece Salwar Kameez | Fashion | Nari | 1450 | 2800 | 22 | 4.4 | 53 | 👗 | #f8bbd0 | — | M, L, XL | Elegant printed three-piece set with soft cotton fabric. Perfect for daily and casual wear.
14. p14 | Panjabi for Men - Eid Collection | Fashion | Deshi | 1250 | 2400 | 30 | 4.6 | 77 | 🥻 | #bcaaa4 | flash | M, L, XL, XXL | Embroidered premium panjabi with comfortable fabric and modern cut.
15. p15 | Non-Stick Fry Pan 28cm | Home | HomeEase | 690 | 1300 | 26 | 4.2 | 41 | 🍳 | #cfd8dc | — | — | Durable non-stick coating, even heat distribution, comfortable handle.
16. p16 | LED Table Lamp Rechargeable | Home | BrightUp | 520 | 990 | 34 | 4.4 | 59 | 💡 | #fff176 | — | — | Touch dimmable LED lamp with USB charging and 3 colour modes.
17. p17 | Cotton Bed Sheet Set (King) | Home | SleepWell | 1150 | 2200 | 15 | 4.5 | 36 | 🛏️ | #b39ddb | — | Blue, Grey, Pink | Double bed king-size sheet with 2 pillow covers. Soft and colour fast.
18. p18 | Cricket Bat - Kashmir Willow | Sports | ProPlay | 1650 | 2800 | 10 | 4.3 | 22 | 🏏 | #ffab91 | — | — | Kashmir willow bat with comfortable grip. Great for practice and tournament use.
19. p19 | Football Size 5 | Sports | ProPlay | 780 | 1300 | 32 | 4.4 | 48 | ⚽ | #c5e1a5 | — | — | Machine stitched size 5 football with durable PU cover.
20. p20 | Yoga Mat 6mm Non-Slip | Sports | FitLife | 480 | 900 | 45 | 4.2 | 70 | 🧘 | #80cbc4 | — | Purple, Green, Blue | Cushioned non-slip yoga mat with carrying strap.
21. p21 | Power Bank 20000mAh Fast Charge | Gadgets | VoltEdge | 1550 | 2600 | 3 | 4.5 | 190 | 🔋 | #ef9a9a | flash | — | 20000mAh power bank with dual USB output and 22.5W fast charging.
22. p22 | Gaming Mouse RGB 7200 DPI | Gadgets | TechFit | 650 | 1200 | 0 | 4.1 | 83 | 🖱️ | #9fa8da | — | — | Wired gaming mouse with RGB lighting and adjustable DPI.
23. p23 | Black Seed Honey 500g | Mart | NaturaCare | 620 | 780 | 50 | 4.8 | 260 | 🍯 | #ffd54f | — | — | Pure honey infused with black seed. Natural energy and wellness booster.
24. p24 | Premium Dates (Ajwa) 500g | Mart | FreshField | 1350 | 1600 | 40 | 4.9 | 330 | 🌴 | #a1887f | — | — | Soft and fresh premium Ajwa dates.

---

## 7. QUALITY CHECKLIST (verify before answering)

1. Opens by double-clicking the file; no console errors; works with the placeholder Firebase config (local mode).
2. Every route above works with back/forward buttons and page refresh (hash routing).
3. Cart, wishlist, coupons, checkout, order placing, cancelling, reorder, reviews, profile edit, password change all work and persist after refresh.
4. Stock decreases on order and is restored on cancel; sold-out items cannot be added.
5. Looks like a Daraz-style mobile shopping app: orange `#f85606` accent, white cards on light-grey background, fixed bottom nav, sticky header.
6. Firestore sync code is complete (listeners, diff-based writes, seed on empty) and activates automatically once real config is pasted in.
7. The whole answer is one complete `DinStore.html` — nothing omitted, no TODOs.

After the code, add ONE short note (max 5 lines) telling the user to paste their Firebase config at the top, create a Firestore database, and tighten Firestore Security Rules for `users` and `orders`.
