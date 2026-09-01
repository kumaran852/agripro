# SOFTWARE SPECIFICATION DOCUMENT
## Farm Direct AI — Full Stack Agricultural Marketplace Platform

**Version:** 1.0 (MVP — Hackathon Build)
**Date:** 2026-09-01
**Status:** DRAFT FOR INTERNAL HACKATHON

---

## 1. PROJECT OVERVIEW

### 1.1 Vision
Farm Direct AI is a full-stack digital marketplace platform that connects farmers / Farmer Producer Organizations (FPOs) directly with institutional and retail buyers. The platform differentiates itself from generic marketplaces with three AI-powered capabilities:
1. **Fair Price Recommendation Engine** — Predicts market conditions and recommends optimal selling prices
2. **Demand Forecasting** — Projects crop demand vs. current supply to flag shortages / surpluses
3. **Logistics Route Optimization** — Computes multi-stop delivery routes minimizing distance and time

### 1.2 Goals (Hackathon MVP)
| # | Goal | Success Metric |
|---|------|---------------|
| G1 | End-to-end demo flow works for judges | All 6 demo steps complete without errors |
| G2 | AI features visibly differentiate the product | Price recommendation + demand forecast rendered in UI |
| G3 | Logistics module demonstrates tangible value | Route optimization shows reduced distance/time vs. baseline |
| G4 | 7 core pages functional & navigable | Each page renders with realistic mock data |
| G5 | API contracts stable between frontend ↔ backend | All REST endpoints return 2xx with schema-valid payloads |

### 1.3 What is *Out of Scope* (Future Work)
- Real payment gateway integration
- Real-time GPS hardware tracking
- Blockchain / ledger systems
- Advanced deep learning models (LLMs, CNNs for crop disease, etc.)
- 50+ crop catalog (MVP scopes to 3–5 crops only)
- Government / mandi price API integrations
- Production-scale database sharding / backups
- Actual 3rd-party delivery company API integrations
- Native mobile apps (MVP is web-only; existing Expo RN project is separate)

---

## 2. USER PERSONAS & ROLES

### 2.1 Farmer / FPO Admin
- **Who:** Individual farmer or administrator of a Farmer Producer Organization
- **Needs:** List produce, view orders, track revenue, receive AI-driven selling recommendations
- **Auth scope:** Write access to `/products`, read/write `/orders` (accept/reject), read `/forecast` for own crops

### 2.2 Buyer
- **Who:** Restaurant owner, retail kirana store, wholesale distributor, institutional kitchen
- **Needs:** Browse marketplace, place orders, track delivery status
- **Auth scope:** Read `/products`, write `/orders`, read `/orders/:id`, read `/route` for assigned deliveries

### 2.3 Platform Admin / Demo Viewer
- **Who:** Hackathon judges, internal reviewers
- **Needs:** View AI dashboard, logistics dashboard, cross-cutting analytics
- **Auth scope:** Full read access, ability to seed demo data

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Page-by-Page Requirements

#### Page 1 — Landing Page (`/`)
**Requirement ID:** FR-LP-001 to FR-LP-004

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-LP-001 | Display hero tagline: "🌾 FARM DIRECT AI — Sell Direct. Buy Fresh. Deliver Smart." | P0 |
| FR-LP-002 | Render two primary CTAs: `[I'm a Farmer]` and `[I'm a Buyer]` | P0 |
| FR-LP-003 | `[I'm a Farmer]` navigates to `/farmer/dashboard` (with demo auto-login if no session) | P0 |
| FR-LP-004 | `[I'm a Buyer]` navigates to `/marketplace` (with demo auto-login if no session) | P0 |

#### Page 2 — Farmer Dashboard (`/farmer/dashboard`)
**Requirement ID:** FR-FD-001 to FR-FD-006

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-FD-001 | Render stat cards: Products listed, Orders received, Total Revenue (₹) | P0 |
| FR-FD-002 | AI Recommendation widget: Shows top crop with demand % change (e.g., "Tomato demand ↑ 18%") | P0 |
| FR-FD-003 | `[Add Product]` button opens modal / navigates to product-create flow | P0 |
| FR-FD-004 | Recent orders list shows latest 5 orders with status badges (PENDING / ACCEPTED / IN_TRANSIT / DELIVERED) | P1 |
| FR-FD-005 | Farmer can tap a pending order to Accept / Reject | P1 |
| FR-FD-006 | Revenue card shows formatted ₹ currency, no decimals | P1 |

#### Page 3 — Buyer Marketplace (`/marketplace`)
**Requirement ID:** FR-BM-001 to FR-BM-005

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-BM-001 | Grid/list view of available products with crop emoji, name, price per kg, farmer name, location | P0 |
| FR-BM-002 | Search bar filters products by name (client-side filter for MVP) | P0 |
| FR-BM-003 | Each product card has `[Buy]` CTA navigating to `/products/:id` | P0 |
| FR-BM-004 | Sort dropdown: Price (low→high), Price (high→low), Distance (near→far) | P1 |
| FR-BM-005 | Stock availability badge (<50 kg: "Low stock", 0: "Sold out") | P1 |

#### Page 4 — Product Details (`/products/:productId`)
**Requirement ID:** FR-PD-001 to FR-PD-007

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PD-001 | Show crop name, farmer/FPO name, source location (district), available quantity (kg), price/kg | P0 |
| FR-PD-002 | AI Demand indicator: HIGH / MEDIUM / LOW badge with color coding (🔥 orange / 🟡 yellow / 🟢 green) | P0 |
| FR-PD-003 | Quantity input with kg unit, min = 1 kg, max = available quantity | P0 |
| FR-PD-004 | Live total = quantity × price/kg, formatted ₹ | P0 |
| FR-PD-005 | `[Place Order]` CTA navigates to `/orders/new?productId=…&qty=…` | P0 |
| FR-PD-006 | Fair price comparison row: Market price vs. Farmer's listed price vs. AI recommended price | P1 |
| FR-PD-007 | Static map thumbnail showing farm location (placeholder SVG for MVP) | P2 |

#### Page 5 — Order Confirmation (`/orders/new` & `/orders/:orderId`)
**Requirement ID:** FR-OR-001 to FR-OR-008

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-OR-001 | Generate unique order ID (e.g., #1024) on creation | P0 |
| FR-OR-002 | Display line items: crop, quantity, unit price, subtotal | P0 |
| FR-OR-003 | Display seller ↔ buyer identities | P0 |
| FR-OR-004 | `[Confirm Order]` writes order record via `POST /orders` with status = PENDING | P0 |
| FR-OR-005 | After confirm, show success state + link to delivery tracking | P0 |
| FR-OR-006 | Farmer-side order view has `[Accept]` / `[Reject]` actions | P0 |
| FR-OR-007 | On Accept, status → ACCEPTED and a Delivery record is created | P1 |
| FR-OR-008 | Order status history timeline: PENDING → ACCEPTED → IN_TRANSIT → DELIVERED | P1 |

#### Page 6 — AI Insights Dashboard (`/ai`)
**Requirement ID:** FR-AI-001 to FR-AI-009

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AI-001 | Crop selector dropdown (MVP: Tomato, Potato, Onion) | P0 |
| FR-AI-002 | Display for selected crop: Predicted demand (kg), Current supply on platform (kg) | P0 |
| FR-AI-003 | Demand status: HIGH / MEDIUM / LOW with color + icon | P0 |
| FR-AI-004 | Supply gap = max(0, predicted_demand − current_supply). Show with ⚠️ if >0 | P0 |
| FR-AI-005 | "Recommended supply: +N kg" card shown when gap > 0 | P0 |
| FR-AI-006 | Recommended price: ₹XX/kg (from Python AI service) | P0 |
| FR-AI-007 | Comparator: Market baseline price vs. AI recommended price | P1 |
| FR-AI-008 | Sell-today verdict: 🟢 Good time to sell / 🟡 Consider holding / 🔴 Oversupply risk | P1 |
| FR-AI-009 | Bar chart (SVG / lightweight) of last 7 days demand trend | P2 |

#### Page 7 — Logistics Optimization (`/logistics`)
**Requirement ID:** FR-LG-001 to FR-LG-008

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-LG-001 | Summary cards: Pending orders to deliver, Total route distance, Estimated total time | P0 |
| FR-LG-002 | Display optimized route as sequential list: Farm → Buyer 1 → Buyer 3 → Buyer 5 → Buyer 2 | P0 |
| FR-LG-003 | Each route stop shows buyer name, location, order qty, drop order | P0 |
| FR-LG-004 | Show baseline (unoptimized) route vs. optimized route comparison: % distance saved, % time saved | P1 |
| FR-LG-005 | "Total distance: 42 km" / "Estimated time: 1h 25m" formatted readouts | P0 |
| FR-LG-006 | Static route map visualization (SVG nodes + connecting lines, no real tile map required) | P1 |
| FR-LG-007 | `[Regenerate Route]` button re-runs optimization (for demo, cycles 2–3 precomputed routes) | P1 |
| FR-LG-008 | Each buyer node links to `/orders/:id` | P2 |

### 3.2 Cross-Cutting Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-X-001 | Demo auto-login: First CTA click on landing page creates a session (farmerId = "farmer_ramesh_01", buyerId = "buyer_priya_01") without password. Real `/register` + `/login` endpoints exist for API completeness, seeded with demo creds. | P0 |
| FR-X-002 | ₹ currency formatting: All amounts in Indian Rupees, Indian numbering system (lakh display optional for MVP, plain ₹XXXXXX is fine) | P0 |
| FR-X-003 | Responsive layout: Pages usable on ≥ 1024px (hackathon demo screen) | P1 |
| FR-X-004 | Nav bar: Quick jump to Marketplace / Farmer Dashboard / AI / Logistics when logged in | P1 |
| FR-X-005 | Mock data seed script: Running `npm run seed` inserts ~15 products, 5 orders, 2 farmers, 3 buyers into MongoDB for immediate demo | P0 |

---

## 4. AI / ML SUBSYSTEM SPECIFICATION

### 4.1 Demand Forecasting Model
- **Input (per crop):** Historical 7-day sales volume vector (7 ints), day-of-week one-hot (7), season flag (kharif/rabi/summer; 3), current month (12)
- **Features total per sample:** 7 + 7 + 3 + 12 = 29
- **Model:** Scikit-learn `LinearRegression` or `RandomForestRegressor(n_estimators=50)` — whichever gives a more intuitive demo output
- **Output:** Predicted demand in kg for next 3 days (sum = single "720 kg" style number displayed in UI)
- **Mock fallback:** If Python service is unavailable, Node.js backend uses a hardcoded table (see §9 Data Seed)

### 4.2 Fair Price Recommendation
**Algorithm (rule-based wrapper around regression):**
```
base_market_price = lookup(crop)        # seeded table, ₹/kg
demand_ratio = predicted_demand / current_platform_supply
price_elasticity_factor = clamp(0.9 + 0.15 * (demand_ratio - 1), 0.85, 1.20)
recommended_price = round(base_market_price * price_elasticity_factor)
demand_level = if demand_ratio > 1.3 → HIGH
               if demand_ratio < 0.85 → LOW
               else → MEDIUM
sell_verdict = if demand_level == HIGH AND recommended_price > base_market_price → GOOD
               if demand_level == LOW → HOLD
               else → NEUTRAL
```

### 4.3 Route Optimization Engine
- **Problem statement:** Single-depot (farm location) Vehicle Routing Problem with 1 vehicle, capacity unconstrained for MVP
- **Algorithm:** Nearest-Neighbor heuristic (greedy) followed by 2-opt local search swap (O(n²) for n stops, trivial for n ≤ 10)
- **Distance metric:** Haversine on seeded (lat, lng) pairs. For demo, use 5 dummy buyer coordinates clustered around Tiruppur, TN (11.1085° N, 77.3411° E)
- **Output schema:**
```json
{
  "baseline_km": 58.4,
  "optimized_km": 42.1,
  "baseline_min": 115,
  "optimized_min": 85,
  "stops": [
    { "seq": 0, "type": "DEPOT", "name": "Ramesh FPO Farm", "lat": 11.1085, "lng": 77.3411, "orderId": null },
    { "seq": 1, "type": "BUYER", "name": "Priya's Kitchen", "lat": 11.1200, "lng": 77.3500, "orderId": "ord_1024", "qtyKg": 100 },
    { "seq": 2, "…": "…" }
  ]
}
```
- **Average speed assumption for ETA:** 30 km/h (typical rural / semi-urban Indian roads) — thus `time_min = (km / 30) * 60`

---

## 5. NON-FUNCTIONAL REQUIREMENTS

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | Every page <3 s TTI on 4G (Mumbai latency) with seeded data; AI endpoint < 1.5 s p95 |
| NFR-02 | Availability | All 3 services (frontend, node, python) start with single `docker compose up` OR sequential `npm start` commands; no flaky boot steps |
| NFR-03 | Maintainability | Each codebase < 15 files excluding config; clear folder layout for judges to browse |
| NFR-04 | Portability | Works on Windows / macOS / Linux dev machines; no platform-only binaries |
| NFR-05 | Security (MVP-minimal) | Passwords stored as bcrypt hashes in MongoDB; JWT tokens with 24 h expiry; no secrets committed to git |
| NFR-06 | Demo robustness | UI has graceful fallback: If Python AI is unreachable, mock responses return from Node so the UI never blank-states |
| NFR-07 | Accessibility | All CTAs keyboard-focusable; WCAG AA contrast on price + status badges |
| NFR-08 | Deployability | Each service can be `git push`-ed to Render / Railway / Vercel individually (judge-friendly) |

---

## 6. INFORMATION ARCHITECTURE — DATABASE (MongoDB)

### 6.1 Collections & Schemas

#### `users` Collection
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | ✅ | Primary key |
| `role` | Enum `"farmer"` \| `"buyer"` \| `"admin"` | ✅ | |
| `name` | String | ✅ | e.g., "Ramesh FPO" |
| `email` | String (unique) | ✅ | Demo: ramesh@farmdirect.ai |
| `passwordHash` | String | ✅ | bcrypt |
| `phone` | String | | +91 98XXXXXX12 |
| `location.district` | String | ✅ | e.g., "Tiruppur" |
| `location.state` | String | ✅ | e.g., "Tamil Nadu" |
| `location.lat` | Number | ✅ | Float |
| `location.lng` | Number | ✅ | Float |
| `createdAt` | Date | ✅ | ISO |

#### `farmers` Collection (extends user via `userId`)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | ✅ | PK |
| `userId` | ObjectId → users | ✅ | FK, unique |
| `fpoName` | String | | e.g., "Tiruppur Tomato FPO" (null = individual farmer) |
| `farmSizeAcres` | Number | | 4.5 |
| `primaryCrops` | String[] | | ["tomato", "onion"] |
| `rating` | Number | | 0–5, default 4.5 seed |
| `totalRevenue` | Number | | Running sum; updated when order status → DELIVERED |

#### `buyers` Collection (extends user via `userId`)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | ✅ | PK |
| `userId` | ObjectId → users | ✅ | FK, unique |
| `businessType` | Enum `"restaurant"` \| `"retail"` \| `"wholesale"` \| `"institution"` | ✅ | |
| `gstin` | String | | Optional, seed with dummy |
| `totalSpend` | Number | | Running sum ₹ |

#### `products` Collection
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | ✅ | PK |
| `farmerId` | ObjectId → farmers | ✅ | FK, indexed |
| `crop` | Enum `"tomato"` \| `"potato"` \| `"onion"` \| `"brinjal"` \| `"ladiesfinger"` | ✅ | MVP restricts to these 5 |
| `name` | String | ✅ | e.g., "Hybrid Tomato (Desi)" |
| `emoji` | String | ✅ | "🍅" |
| `quantityKg` | Number | ✅ | Current stock; decremented on order ACCEPTED |
| `originalQuantityKg` | Number | ✅ | For demand/supply stats |
| `pricePerKg` | Number | ✅ | Farmer's listed price (₹) |
| `unit` | Enum `"kg"` | ✅ | "kg" only for MVP |
| `harvestDate` | Date | | ISO |
| `imageUrl` | String | | Placeholder emoji grid / URL |
| `aiDemandLevel` | Enum `"HIGH"` \| `"MEDIUM"` \| `"LOW"` | ✅ | Denormalized; refreshed periodically |
| `aiRecommendedPrice` | Number | ✅ | Denormalized; refreshed |
| `isActive` | Boolean | ✅ | Default true; false when qty = 0 |
| `createdAt` | Date | ✅ | ISO |
| `updatedAt` | Date | ✅ | ISO |

#### `orders` Collection
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | ✅ | PK |
| `shortId` | String | ✅ | Human-friendly: `"ORD-1024"`, unique |
| `buyerId` | ObjectId → buyers | ✅ | FK, indexed |
| `farmerId` | ObjectId → farmers | ✅ | FK, indexed |
| `productId` | ObjectId → products | ✅ | FK |
| `quantityKg` | Number | ✅ | Ordered qty |
| `pricePerKgAtOrder` | Number | ✅ | Snapshot |
| `totalAmount` | Number | ✅ | qty × price |
| `status` | Enum `"PENDING"` \| `"ACCEPTED"` \| `"REJECTED"` \| `"IN_TRANSIT"` \| `"DELIVERED"` \| `"CANCELLED"` | ✅ | P0 on create |
| `statusHistory` | {status, at, by}[] | ✅ | Append only |
| `deliveryId` | ObjectId → deliveries | | Filled when ACCEPTED |
| `createdAt` | Date | ✅ | ISO |
| `updatedAt` | Date | ✅ | ISO |

#### `deliveries` Collection
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | ✅ | PK |
| `orderIds` | ObjectId[] → orders | ✅ | 1+ orders batched into a delivery trip |
| `depotFarmerId` | ObjectId → farmers | ✅ | Starting point |
| `routeOptimizedStops` | See §4.3 stops[] | ✅ | Snapshot of route engine output |
| `distanceKm` | Number | ✅ | Optimized |
| `estimatedMinutes` | Number | ✅ | |
| `baselineDistanceKm` | Number | ✅ | For comparison |
| `baselineMinutes` | Number | ✅ | |
| `distanceSavedPct` | Number | ✅ | 100 × (baseline − optimized) / baseline |
| `timeSavedPct` | Number | ✅ | Same formula for time |
| `status` | Enum `"SCHEDULED"` \| `"ENROUTE"` \| `"COMPLETED"` | ✅ | |
| `scheduledAt` | Date | ✅ | ISO |

---

## 7. API CONTRACT (Node.js + Express)

All endpoints under `https://api.farmdirect.ai.local/v1` (dev: `http://localhost:4000/v1`).
Auth: Header `Authorization: Bearer <jwt>` on all endpoints except Auth + public product listing.
Response envelope: `{ "success": true/false, "data": …, "error": { "code": …, "message": … } }`.

### 7.1 Auth Module

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/register` | Registers user. Body: `{role, name, email, password, phone?, location}` | None |
| POST | `/login` | Issues JWT. Body: `{email, password}` → `{token, user}` | None |
| GET | `/me` | Returns current user + role-specific profile | Any |

### 7.2 Products Module

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/products` | List products. Query params: `crop=`, `search=`, `sort=price_asc`, `minPrice`, `maxPrice`, `page=1`, `limit=20` | Public |
| GET | `/products/:id` | Single product detail | Public |
| POST | `/products` | Farmer lists new product. Body: `{crop, name, emoji, quantityKg, pricePerKg, harvestDate?}` | Farmer only |
| PATCH | `/products/:id` | Update qty / price. Farmer must own the product | Farmer only |
| DELETE | `/products/:id` | Soft-deactivate (`isActive: false`). Farmer must own | Farmer only |

### 7.3 Orders Module

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/orders` | Buyer places order. Body: `{productId, quantityKg}` → creates with PENDING | Buyer only |
| GET | `/orders` | List orders. Query: `role=buyer` shows own, `role=farmer` shows received, `status=`. Defaults by role | Any |
| GET | `/orders/:id` | Order detail including line-item snapshot + statusHistory + delivery link | Buyer + owning Farmer |
| PATCH | `/orders/:id/status` | Transition. Body: `{status, note?}`. Valid transitions: Farmer→PENDING→{ACCEPTED,REJECTED}; Farmer/Buyer→ACCEPTED→IN_TRANSIT→DELIVERED; Buyer→PENDING→CANCELLED | Role-gated |

### 7.4 Forecast / AI Module (Node proxies to Python)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/forecast?crop=tomato` | Returns `{predictedDemandKg, currentSupplyKg, demandLevel, supplyGapKg, baselineMarketPrice, recommendedPrice, sellVerdict}` | Any |
| GET | `/forecast/batch?crops=tomato,potato,onion` | Array of above; used by Farmer dashboard widget | Any |
| POST | `/forecast/refresh` | Re-runs forecast & writes denormalized fields to products.aiDemandLevel + aiRecommendedPrice | Admin |

### 7.5 Logistics / Route Module

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/route?farmerId=X&orderIds=A,B,C,D,E` | Returns optimized route schema per §4.3 | Farmer owning depot + Admin |
| POST | `/deliveries` | Batches orders into a delivery (locks in route snapshot) | Farmer + Admin |
| GET | `/deliveries/:id` | Delivery detail + route visualization data | Buyer (if order included) + Farmer + Admin |
| PATCH | `/deliveries/:id/status` | SCHEDULED → ENROUTE → COMPLETED | Farmer + Admin |

---

## 8. PYTHON AI SERVICE SPECIFICATION

### 8.1 Server
- **Framework:** FastAPI (`uvicorn` ASGI) or Flask — FastAPI recommended for auto OpenAPI docs (useful to show judges)
- **Port:** 5000 (dev)
- **Single internal API** (called by Node, never exposed publicly):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/internal/ai/demand?crop=tomato` | Demand forecast |
| GET | `/internal/ai/price?crop=tomato&supply_kg=500` | Fair price recommendation |
| POST | `/internal/ai/route` | Body `{depot:{lat,lng}, stops:[{id,lat,lng,qtyKg}]}` → optimized stops[] |
| GET | `/internal/ai/health` | 200 `"ok"` |

### 8.2 Mocked-Seed Price Baseline Table (₹/kg)
Hardcoded in Python `config.py` — override-able via env:
| Crop | Baseline ₹/kg |
|------|--------------|
| Tomato | 22 |
| Potato | 28 |
| Onion | 26 |
| Brinjal | 30 |
| Ladiesfinger | 35 |

### 8.3 Dependencies (requirements.txt)
```
fastapi==0.115.0
uvicorn==0.30.6
scikit-learn==1.5.2
numpy==2.1.1
pandas==2.2.2
pydantic==2.9.2
```

---

## 9. SEED DATA (for hackathon demo)

### Farmers (2)
1. **Ramesh FPO** — Tiruppur, TN — primary: Tomato, Onion — rating 4.6 — revenue ₹24,500
2. **Lakshmi Individual Farmer** — Coimbatore, TN — primary: Potato, Brinjal — rating 4.3 — revenue ₹12,800

### Buyers (3)
1. **Priya's Kitchen** (restaurant) — ₹3,400 total spend — Tiruppur
2. **Namdev Kirana** (retail) — ₹7,200 total spend — Tiruppur outskirts
3. **Anna University Canteen** (institution) — ₹18,500 total spend — Coimbatore

### Products (≥ 15)
- 🍅 Ramesh Tomato Hybrid — 500 kg — ₹25/kg — HIGH demand, rec ₹25
- 🥔 Lakshmi Potato — 320 kg — ₹30/kg — MEDIUM demand, rec ₹29
- 🧅 Ramesh Onion — 180 kg — ₹28/kg — HIGH demand, rec ₹30
- 🍆 Brinjal Purple — 220 kg — ₹32/kg — LOW supply rec — and so on for 12 more

### Orders (5 demo orders)
- ORD-1020: 80 kg Potato from Lakshmi → Namdev — DELIVERED
- ORD-1021: 50 kg Onion → Priya — IN_TRANSIT
- ORD-1022: 100 kg Tomato → Anna University — ACCEPTED (for route demo)
- ORD-1023: 60 kg Brinjal → Priya — PENDING
- ORD-1024: 100 kg Tomato → Priya — PENDING (Step 2 demo flow)

---

## 10. FRONTEND TECHNICAL SPECIFICATION (React + Tailwind)

### 10.1 Stack Final Selection
| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | React 18 (Vite scaffold) | Fast build; judge-friendly |
| Styling | Tailwind CSS 3.x + postcss | Rapid UI; consistent look |
| UI primitives | shadcn/ui or Radix (Dialog, DropdownMenu) OR simple divs | Use whichever is faster; MVP = simple divs OK |
| Client state | React Context + useState (no Redux) | Keep simple for hackathon |
| Data fetching | Fetch API + custom `useApi()` hook with token injection | Axios also fine; keep consistent |
| Navigation | React Router v6 (`createBrowserRouter`) | 7 routes; simple |
| Charts (optional) | Recharts (lightweight) OR plain SVG bars | Page 6 demand trend |
| Icons | Lucide React + crop emoji | Emoji used for crops |

### 10.2 Route Map
```
/                               → LandingPage
/login                          → LoginPage (fallback)
/farmer/dashboard               → FarmerDashboard (PROTECTED: role=farmer)
/marketplace                    → BuyerMarketplace (PROTECTED: role=buyer; readable by all for demo)
/products/:productId            → ProductDetailPage
/orders/new                     → OrderNewPage (reads query params)
/orders/:orderId                → OrderDetailPage
/ai                             → AiDashboardPage
/logistics                      → LogisticsPage
```

### 10.3 Folder Structure
```
farmdirect-web/
├── src/
│   ├── components/
│   │   ├── layout/Navbar.tsx
│   │   ├── layout/ProtectedRoute.tsx
│   │   ├── cards/StatCard.tsx
│   │   ├── cards/ProductCard.tsx
│   │   ├── cards/OrderCard.tsx
│   │   ├── forms/AddProductModal.tsx
│   │   ├── widgets/AiDemandBadge.tsx
│   │   ├── widgets/PriceComparator.tsx
│   │   └── widgets/RouteVisualizer.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── FarmerDashboardPage.tsx
│   │   ├── MarketplacePage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── OrderNewPage.tsx
│   │   ├── OrderDetailPage.tsx
│   │   ├── AiDashboardPage.tsx
│   │   └── LogisticsPage.tsx
│   ├── hooks/
│   │   ├── useApi.ts
│   │   └── useAuth.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── formatters.ts   (₹, kg, hours-mins)
│   │   └── mock-fallback.ts
│   ├── types/
│   │   └── index.ts         (User, Product, Order, Delivery, Forecast)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

### 10.4 Design Token / Color Palette (Tailwind `extend`)
```js
colors: {
  brand: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    500: '#22c55e',   // primary green (🌾)
    600: '#16a34a',
    700: '#15803d',
  },
  earth: {
    500: '#a16207',
    600: '#854d0e',
  },
  accent: {
    tomato: '#ef4444',
    price:  '#f59e0b',
  },
  demand: {
    high: '#f97316',     // HIGH 🔥
    medium: '#eab308',   // MEDIUM 🟡
    low:    '#22c55e',   // LOW 🟢
  },
}
```

---

## 11. BACKEND TECHNICAL SPECIFICATION (Node + Express + MongoDB)

### 11.1 Dependencies (package.json)
```json
{
  "express": "^4.21.0",
  "mongoose": "^8.6.1",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^16.4.5",
  "zod": "^3.23.8",
  "axios": "^1.7.7"
}
```

### 11.2 Folder Structure
```
farmdirect-api/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   └── jwt.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Farmer.js
│   │   ├── Buyer.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Delivery.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── products.routes.js
│   │   ├── orders.routes.js
│   │   ├── forecast.routes.js
│   │   └── logistics.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── products.controller.js
│   │   ├── orders.controller.js
│   │   ├── forecast.controller.js   (calls Python via axios)
│   │   └── logistics.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── validate.middleware.js  (zod)
│   ├── services/
│   │   ├── pythonAiClient.js       (single point for all calls to :5000)
│   │   └── priceEngine.js          (fallback logic if Python down)
│   ├── seed/
│   │   └── seed.js                 (run via npm run seed)
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── AppError.js
│   └── app.js
├── server.js
├── package.json
└── .env.example
```

### 11.3 Key Environment Variables
```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/farmdirect_mvp
JWT_SECRET=<generated-dev-only-secret>
PYTHON_AI_BASE_URL=http://127.0.0.1:5000/internal/ai
```

---

## 12. DEMO FLOW PLAYBOOK (6 Steps for Judges)

Reference: §11 from product brief, mapped to clickable actions.

| Step | Role | Action | Expected UI Result | Validates |
|------|------|--------|--------------------|-----------|
| 1 | Farmer | Landing → `[I'm a Farmer]` → Dashboard → `[Add Product]` → Enter **Tomato / 500 kg / ₹25/kg** → Submit | Dashboard stats increment; Product appears in marketplace | FR-FD-003, POST /products |
| 2 | Buyer | Landing → `[I'm a Buyer]` → Marketplace → search **Tomato** → click card → enter qty **100 kg** → `[Place Order]` → `[Confirm Order]` | ORD-1025 created, status = PENDING | FR-BM-001→FR-OR-005 |
| 3 | Farmer | Back to Farmer Dashboard → new pending order notification → `[Accept]` | status → ACCEPTED; qty on product decremented to 400; Delivery record inserted | FR-FD-005, FR-OR-006 |
| 4 | All | Navigate to **/ai** → select Tomato → readouts | Demand 720 kg vs Supply 500 kg → ⚠️ Shortage 220 kg; Demand = HIGH 🔥 | FR-AI-001→FR-AI-005 |
| 5 | All | Remain on /ai → scroll → price section | Market ₹22 vs Rec ₹25; 🟢 Good time to sell (matches tomato card) | FR-AI-006→FR-AI-008 |
| 6 | Admin | Navigate to **/logistics** → shows batched 5 orders → view baseline vs optimized | Route order: Farm→Buyer1→Buyer3→Buyer5→Buyer2; distance 42 km; time 1h 25m; % saved chips shown | FR-LG-001→FR-LG-005 |

**Demo Time Budget (recommended):** ≤ 5 minutes to walk all 6 steps with 1 minute AI/logistics narrative.

---

## 13. TESTING PLAN (MVP-minimal)

No formal test framework required for hackathon. Manual checklist below is sufficient.

| Area | Manual Check |
|------|--------------|
| Auth | Register 1 farmer + 1 buyer → login each → verify JWT persists refresh |
| Product CRUD | Add product → update price → list → verify search/sort works |
| Order lifecycle | Place → Accept → mark IN_TRANSIT → DELIVERED; check qty & totals |
| AI fallback | Stop Python → `/forecast` still returns mocked data via Node fallback (NFR-06) |
| Route optimization | Send 5 stops → compare stops order vs naive — verify `distanceSavedPct > 0` |
| Navigation | All 7 pages reachable from Navbar; no 404 except bad id |
| Currency | Every ₹ amount uses Indian comma separators (`₹24,500`) |

---

## 14. DEPLOYMENT & LOCAL RUN (3-Terminal Layout)

**Prerequisites (judge laptop):** Node 20+, Python 3.11+, MongoDB 7+ (or MongoDB Compass / Atlas free tier), npm, pip.

| Terminal | Dir | Command | Starts | URL |
|----------|-----|---------|--------|-----|
| T1 | farmdirect-ai/ | `mongod` (or start MongoDB Compass service) | MongoDB | mongodb://127.0.0.1:27017 |
| T2 | farmdirect-ai/farmdirect-ai-service/ | `python -m uvicorn main:app --reload --port 5000` | Python AI | http://localhost:5000/internal/ai/health |
| T3 | farmdirect-ai/farmdirect-api/ | `npm install && npm run seed && npm run dev` | Node API | http://localhost:4000/v1 |
| T4 (or split) | farmdirect-ai/farmdirect-web/ | `npm install && npm run dev` | React Web | http://localhost:5173 |

Single-click alternative for judges: Create a `start-demo.bat` / `start-demo.sh` that launches all four in background.

---

## 15. SUCCESS CRITERIA & ACCEPTANCE

All of the following must be true to consider the MVP spec complete & demo-ready:

- [ ] **SRS-ACC-01:** Every FR with P0 in §3 is implemented & manually verified per §13
- [ ] **SRS-ACC-02:** `/v1/products`, `/v1/orders`, `/v1/forecast`, `/v1/route` return 2xx with schemas matching §7 / §4.3
- [ ] **SRS-ACC-03:** AI service `/internal/ai/*` endpoints return valid JSON when Python is running; Node fallback returns valid mock when Python is down
- [ ] **SRS-ACC-04:** Demo flow §12 Steps 1–6 complete end-to-end with seeded data without manual DB edits
- [ ] **SRS-ACC-05:** Logistics page shows a `distanceSavedPct > 0` and `timeSavedPct > 0` when 4+ stops
- [ ] **SRS-ACC-06:** AI Dashboard shows `demandLevel == HIGH`, `recommendedPrice > baselineMarketPrice`, and a positive `supplyGapKg` for Tomato on seed

---

## 16. RISKS & MITIGATIONS

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| R1 | Python env fails on judge laptop | AI pages blank | Node fallback engine (`services/priceEngine.js`) returns identical math — judges can't tell difference |
| R2 | MongoDB not installed on judge laptop | API crashes | Seed script also supports MongoDB Atlas; ship a fallback connection string + downloadable Atlas instructions |
| R3 | CORS between 5173 → 4000 | API calls blocked | `cors()` middleware enabled in Express; dev vite proxy configured |
| R4 | Demo step 3 order state gets stuck | Judges lose flow | Admin-only `POST /orders/:id/force-status` endpoint exists |
| R5 | Route optimization returns same order as baseline, showing 0% saved | Step 6 is weak | Seed baseline as **alphabetical order**; Python deliberately returns a non-trivial permutation; guaranteed ≥ 12% distance delta for seeded coordinates |
| R6 | Seed data has 0 Tomato stock → forecast anomaly | AI reads odd | originalQuantityKg fields always ≥ 500 on seed; forecast uses originalQuantityKg, not currentQuantityKg, so supply stable |

---

## APPENDIX A — GLOSSARY

| Term | Definition |
|------|------------|
| FPO | Farmer Producer Organization — collective of small farmers |
| Mandi | Traditional agricultural wholesale market (government-run) |
| ₹ | Indian Rupee (ISO 4217: INR) |
| kg | Kilogram |
| qty | Quantity |
| 2-opt | Local search heuristic for TSP/VRP that improves routes by swapping edges |
| ETA | Estimated Time of Arrival |
| TTI | Time To Interactive |
| JWT | JSON Web Token |
| p95 | 95th percentile latency |

---

## APPENDIX B — RELATIONSHIP DIAGRAM (text form)

```
 users ── 1:1 ──► farmers ── 1:N ──► products ◄────── N:1 ──┐
   │                                                        │
   └── 1:1 ──► buyers  ── 1:N ──► orders ── 1:1 ───────────┘
                                              │
                                              └── N:1 ──► deliveries
                                                              │
                                                              └── contains routeOptimizedStops[]
                                                                  (from /internal/ai/route)
```

---

*End of Specification. Document owner: Hackathon Team. Next action: Break §3–§12 into implementation tickets per service.*
