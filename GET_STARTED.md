# 🚀 Farm Direct AI — Get Started & Deploy

Everything needed to run locally on **Windows (or any OS)**, deploy live to the internet, and validate the 6-step judge demo flow.

- Your existing machine already has: **MongoDB 8.2 (service = Running)**, **Node 24.13**, **Python 3.11 + 3.13**, **pip 26.0**, **npm 11.6**.

---

## ⚡ Option A — ONE CLICK START (Windows)

> From the root of `e:\SIH26\my-app\`, **double-click** `start-demo.bat`.
>
> Or from a CMD / PowerShell window:
> ```
> e:
> cd \SIH26\my-app
> .\start-demo.bat
> ```

That script does **everything below automatically**:

1. Checks MongoDB service is up → if not, starts `mongod.exe` with a data dir at `e:\SIH26\my-app\.mongodb-data`
2. Creates a **Python virtualenv** (`farmdirect-ai/.venv`) + installs deps (first run only ≈ 1 min)
3. Starts **Python AI** on :5000
4. Installs Node deps (first run only) → runs **seed script** → starts **Node API** on :4000
5. Installs React deps (first run only) → starts **React Vite** on :5173
6. Pauses 8 seconds → **auto-opens your browser** to `http://localhost:5173`
7. Prints demo credentials on screen.

Then run the verification to confirm all 6 judge steps work:
```powershell
powershell -ExecutionPolicy Bypass -File .\verify-demo.ps1
```

---

## 🧱 Option B — Manual start (for debugging / any OS)

### 0. Prerequisites (all already installed on your PC)
| Tool | Min version | Install guide link |
|------|-------------|-------------------|
| Node.js | 20+ | https://nodejs.org |
| Python | 3.10+ | https://python.org |
| MongoDB Community | 6+ | https://www.mongodb.com/try/download/community |

### 1. MongoDB

**Option 1 — MongoDB as a Windows Service (your PC already = ✅ Running)**
- Open `services.msc` → find **MongoDB Server (MongoDB)** → status = Running.
- Default URI = `mongodb://127.0.0.1:27017/farmdirect_mvp` — already set in `farmdirect-api/.env`.

**Option 2 — Run `mongod.exe` by hand (no service)**
```bash
# Create a data dir somewhere
mkdir E:\mongodb-data
mongod --dbpath E:\mongodb-data --port 27017
```

**Option 3 — No install at all (best for judges!) → MongoDB Atlas (FREE)**
1. Go to https://www.mongodb.com/atlas/database → Build a Database → **Free tier M0** (Singapore region).
2. Create a **DB User** (e.g. `farmadmin` / `farmadmin123`).
3. Under **Network Access** → Add IP Address → `0.0.0.0/0` (allow everywhere, OK for MVP).
4. **Connect** → **Connect your application** → copy URI, replace `<password>`:
   ```
   mongodb+srv://farmadmin:farmadmin123@cluster0.XXXXX.mongodb.net/farmdirect_mvp?retryWrites=true&w=majority
   ```
5. Paste it into `farmdirect-api/.env` as `MONGO_URI=...`. That's it. Works locally AND in production.

### 2. Python AI service (http://localhost:5000)
```bash
cd e:\SIH26\my-app\farmdirect-ai

# Virtual env (RECOMMENDED — avoids polluting global pip):
python -m venv .venv
.\.venv\Scripts\activate         # Windows CMD
# source .venv/bin/activate     # macOS/Linux bash

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 5000
```
Test it's up: `http://localhost:5000/internal/ai/health` → `{"status":"ok"}`

### 3. Node API (http://localhost:4000)
```bash
cd e:\SIH26\my-app\farmdirect-api
npm install
copy .env.example .env        # already done by start-demo.bat
# Edit .env to set MONGO_URI (or leave it for local MongoDB service)
npm run seed                  # ⚠️ DELETES everything and inserts demo data
npm run dev
```
Test it's up: `http://localhost:4000/v1/health` → `{"success":true,"data":{"service":"farmdirect-api"...}}`

### 4. React Web UI (http://localhost:5173)
```bash
cd e:\SIH26\my-app\farmdirect-web
npm install
npm run dev
```
Open `http://localhost:5173` in browser.

**Important:** The Vite dev server already proxies `/v1/*` → `http://localhost:4000` (see `farmdirect-web/vite.config.ts` → `server.proxy`). You don't need any CORS configuration on the frontend for local dev.

---

## 🔑 Demo Credentials

Inserted automatically by `npm run seed`:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Farmer | `ramesh@farmdirect.ai` | `farm1234` | Adds produce, accepts orders, accesses farmer dashboard |
| Farmer (2) | `lakshmi@farmdirect.ai` | `farm1234` | Second farmer (Coimbatore) for variety |
| Buyer | `priya@farmdirect.ai` | `buy1234` | Restaurant buyer, orders tomatoes/onions |
| Buyer (institution) | `annauni@farmdirect.ai` | `buy1234` | Large institution buyer (for logistics multi-stop) |
| Buyer (retail) | `namdev@farmdirect.ai` | `buy1234` | Kirana store |
| Admin | `admin@farmdirect.ai` | `admin1234` | Force status transitions, refresh forecast batch |

**Shortcut:** On the **Landing Page**, just click **[I'm a Farmer]** or **[I'm a Buyer]** — it tries the real JWT login first, and if your API is down, it falls back to a **passwordless demo mode user** so you can still click through the UI.

---

## 🎬 Rehearsal — 6 Judge Demo Steps (5 min)

```
Landing Page
  ├─ Click [I'm a Farmer] → Farmer Dashboard (Step 1)
  │    └─ [Add Product] → Tomato, 500 kg, ₹25/kg → Submit
  │
  ├─ Nav → Marketplace (buyer view works too in demo mode; or click [I'm a Buyer] from Landing)  (Step 2)
  │    └─ Search "tomato" → click Hybrid Tomato → qty = 100 kg → [Place Order] → [Confirm Order]
  │
  ├─ Nav → Farmer Dashboard again (Step 3)
  │    └─ On new PENDING order card → click ✓ Accept (top-right)
  │
  ├─ Nav → AI Insights (Step 4 + 5)
  │    ├─ Tomato selected → Supply 500 kg, Demand 720 kg
  │    ├─ ⚠️ Shortage: +220 kg 🔥
  │    └─ Price Comparator shows ₹22 market → ₹25 recommended + 🟢 Good time to sell
  │
  └─ Nav → Logistics (Step 6)
       ├─ Total Optimized Distance: ~42 km, ~1h 25m
       ├─ Baseline vs After AI shows 28% saved
       ├─ Scroll down for Route Order (timeline) + SVG Route Map
       └─ Hit [Cycle Demo Route] to show re-optimization
```

For judges who like "proof", run this PowerShell script at any time:
```
powershell -ExecutionPolicy Bypass -File e:\SIH26\my-app\verify-demo.ps1
```
It runs the full 6-step API flow (login, forecast, route, product, order, accept) via HTTP and prints pass/fail.

---

## 🌐 Deploy to the Internet (3 services live)

You have 3 great options. All 3 services + DB are deployable for **FREE tier** with the files we added.

### Option 1 — Vercel (Frontend) + Render (Backend) — EASIEST

#### 1. Deploy React → Vercel (Static Site, FREE forever)
1. Push the repo to GitHub.
2. Go to https://vercel.com/new → import repo.
3. **Framework Preset** = **Vite** (auto-detects).
4. **Root Directory** → click **Edit** and set it to `farmdirect-web`.
5. **Build command** = `npm run build`. **Output** = `dist`.
6. **Environment Variable** (optional, if you want to deploy API first):
   - `VITE_API_BASE` = `https://your-api.onrender.com`
7. Click **Deploy**. After deploy, rewrite rules kick in (SPA fallback) automatically via `farmdirect-web/vercel.json`.

#### 2. Deploy Python AI → Render (Web Service, FREE)
1. Same GitHub repo → Render dashboard: **New +** → **Web Service**.
2. Connect repo. Settings:
   - **Name**: `farmdirect-ai`
   - **Root Directory**: `farmdirect-ai`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free
3. Deploy. Copy the public URL (`https://farmdirect-ai.onrender.com`).

#### 3. Deploy Node API → Render (Web Service, FREE)
1. Same GitHub → **New +** → **Web Service**.
2. **Name**: `farmdirect-api`. **Root Directory**: `farmdirect-api`. **Environment**: **Node**.
3. **Build Command**:
   ```bash
   npm install && npm run seed || true
   ```
   > `|| true` because the seed fails if the connection string is wrong on first boot — it's fine.
4. **Start Command**: `node server.js`.
5. **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `PYTHON_AI_BASE_URL` | `https://farmdirect-ai.onrender.com/internal/ai` ← paste your URL from step 2 |
   | `JWT_SECRET` | click **Generate** |
   | `MONGO_URI` | MongoDB Atlas connection string (see Option 3 above under §1 MongoDB). **Do not use local MongoDB on Render!** |
6. Deploy. Copy the URL: `https://farmdirect-api.onrender.com`.

#### 4. Wire up Vercel frontend to live API
On Vercel → your site → **Settings → Environment Variables**:
```
VITE_API_BASE = https://farmdirect-api.onrender.com
```
Then click **Redeploy**. Done!

**Note:** When using a non-local API, modify `farmdirect-web/src/lib/api-client.ts`'s `apiFetch` function to prepend `import.meta.env.VITE_API_BASE` to paths before `fetch`. A default-relative version is already fine for the Vite proxy in dev; adding the env override is a 2-line change for production:
```ts
const base = (import.meta.env.VITE_API_BASE as string) || "";
const res = await fetch(base + basePath, { ...init, headers });
```

---

### Option 2 — Docker Compose (On-prem judges' laptop OR EC2/VPS)

If you want the whole stack reproducible anywhere, build and run with Docker. First install Docker Desktop (https://docker.com).

```bash
cd e:\SIH26\my-app

# Build each service
docker build -t farmdirect-api ./farmdirect-api
docker build -t farmdirect-ai  ./farmdirect-ai

# Run containers + MongoDB (all in one)
docker run -d --name mongo -p 27017:27017 mongo:8
docker run -d --name farmdirect-ai -p 5000:5000 farmdirect-ai
docker run -d --name farmdirect-api -p 4000:4000 `
  -e MONGO_URI="mongodb://host.docker.internal:27017/farmdirect_mvp" `
  -e PYTHON_AI_BASE_URL="http://host.docker.internal:5000/internal/ai" `
  farmdirect-ai node src/seed/seed.js ; docker start farmdirect-api  # seed then run

# Frontend: build static then serve with nginx (or continue with npm run dev locally)
cd farmdirect-web && npm install && npm run build
# Then deploy the dist/ folder anywhere (Nginx, S3 + CloudFront, etc.)
```

---

### Option 3 — Railway.app (Fastest of all)
1. New Project → **Deploy from GitHub repo**.
2. Railway auto-detects services OR add them manually:
   - Service 1: **Root Dir = farmdirect-ai**, Runtime = Python, start = `uvicorn app.main:app --port $PORT`
   - Service 2: **Root Dir = farmdirect-api**, Runtime = Node, build = `npm install && npm run seed || true`, start = `node server.js`
   - Service 3: **Root Dir = farmdirect-web**, Runtime = Static, build = `npm install && npm run build`, publish = `dist`
3. In farmdirect-api → Variables → set `PYTHON_AI_BASE_URL` to the internal hostname Railway assigns to farmdirect-ai (format `https://<name>.up.railway.app/internal/ai`).
4. In farmdirect-api → **Add Service** → **Database** → MongoDB → choose **Add MongoDB Atlas** (Railway provisions a free M0 automatically and sets `MONGO` connection vars). Set `MONGO_URI=${{MongoDB.MONGO_URL}}/farmdirect_mvp`.
5. Redeploy → all 3 services are live.

---

## 🧪 Post-deploy smoke tests

Once everything is live, test with `curl` or Postman:
```bash
# Python AI
curl https://farmdirect-ai.onrender.com/internal/ai/price?crop=tomato\&supply_kg=500
  → expect { "recommendedPrice": 25, "demandLevel": "HIGH", "sellVerdict": "GOOD", ... }

# Node API
curl -X POST https://farmdirect-api.onrender.com/v1/auth/login \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"ramesh@farmdirect.ai\",\"password\":\"farm1234\"}"
  → expect { "success": true, "data": { "token": "...", "user": {...} } }

# Forecast
curl https://farmdirect-api.onrender.com/v1/forecast?crop=tomato
```

---

## 🗂️ Project file map (key paths to share with judges)

```
e:\SIH26\my-app\
├── GET_STARTED.md              ← THIS FILE
├── SOFTWARE_SPECIFICATION.md   ← Full software spec (16 sections)
├── start-demo.bat              ← One-click launcher (Windows)
├── verify-demo.ps1             ← 6-step API demo verifier
├── render.yaml                 ← Render.com blueprint: deploys all 3 services
│
├── farmdirect-web/             ← React 18 + Vite + Tailwind
│   ├── package.json
│   ├── vite.config.ts          ← dev → /v1/* proxied to :4000
│   ├── vercel.json             ← Vercel deploy config (SPA fallback)
│   ├── netlify.toml            ← Netlify alternative
│   └── src/
│       ├── pages/              ← 8 pages: Landing, Login, FarmerDashboard,
│       │                         Marketplace, ProductDetail, OrderNew+Detail,
│       │                         AiDashboard, Logistics
│       ├── components/
│       ├── context/AuthContext.tsx
│       ├── hooks/useApi.ts
│       └── lib/
│
├── farmdirect-api/             ← Node + Express + Mongoose
│   ├── Dockerfile
│   ├── .env.example
│   ├── server.js               ← entry
│   └── src/
│       ├── app.js              ← routes + CORS + error handler
│       ├── config/db.js env.js
│       ├── models/             ← 6 Mongoose schemas
│       ├── routes/             ← 5 route modules
│       ├── controllers/        ← 5 controllers incl. forecast+logistics
│       ├── services/pythonAiClient.js  ← with fallback math if Python is down
│       ├── middleware/         ← JWT auth + role gating + Zod validation
│       └── seed/seed.js        ← demo dataset + ORD-1020..ORD-1024
│
└── farmdirect-ai/              ← FastAPI + Scikit-learn + Pandas/NumPy
    ├── Dockerfile
    ├── requirements.txt
    └── app/
        ├── main.py             ← /health, /demand, /price, /route
        ├── config.py           ← ₹ baseline prices per crop
        ├── demand.py           ← LinearRegression demand forecast (29 features)
        ├── pricing.py          ← Fair Price elastic clamp (spec §4.2)
        └── route.py            ← Haversine + NN + 2-opt VRP solver
```

---

## 💡 Pro Tips for Judges (Wow them in 30s)

1. On Logistics page click **Cycle Demo Route** — the SVG map re-orders stops live.
2. On AI Dashboard click **Lady's Finger** → **Onion** → **Potato** → watch the trend bars, recommendation, and shortage amounts update instantly.
3. On Farmer Dashboard click **[Add Product]** → choose Potato → 200 kg → `List Product` → Marketplace immediately shows it.
4. On any Order detail page (from Marketplace, buy something first) click **Accept → In Transit → Delivered** — the 5-step progress bar fills up in real time.

Good luck with the hackathon! 🌾✨
