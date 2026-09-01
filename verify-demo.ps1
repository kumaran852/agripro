<#
Farm Direct AI — Demo Health Verifier (PowerShell)
Runs the full 6-step judge demo flow against a running stack and reports pass/fail.
#>
$ErrorActionPreference = "Continue"
Write-Host "`n🌾 Farm Direct AI — Demo Health Verifier`n" -ForegroundColor Cyan

function Test-Endpoint($name, $url, $method="GET", $body=$null, $token=$null, $minHttp=200, $maxHttp=299) {
  Write-Host "  → $name" -NoNewline
  $headers = @{ "Content-Type" = "application/json" }
  if ($token) { $headers["Authorization"] = "Bearer $token" }
  try {
    if ($body) {
      $r = Invoke-RestMethod -Uri $url -Method $method -Headers $headers -Body ($body | ConvertTo-Json -Depth 6)
    } else {
      $r = Invoke-RestMethod -Uri $url -Method $method -Headers $headers
    }
    Write-Host "  OK" -ForegroundColor Green
    return $r
  } catch {
    $status = 0
    try { $status = $_.Exception.Response.StatusCode.value__ } catch {}
    Write-Host "  FAIL (HTTP $status) $($_.Exception.Message)" -ForegroundColor Red
    return $null
  }
}

# 1. Core health
Write-Host "[1/6] Core service health" -ForegroundColor Yellow
$ai  = Test-Endpoint "Python AI  /internal/ai/health"  "http://localhost:5000/internal/ai/health"
$api = Test-Endpoint "Node API   /v1/health"           "http://localhost:4000/v1/health"
if (-not $ai -or -not $api) {
  Write-Host "`n❌ Core services down. Run start-demo.bat first.`n" -ForegroundColor Red
  exit 1
}

# 2. AI endpoints
Write-Host "`n[2/6] AI endpoints (fair price + forecast)" -ForegroundColor Yellow
$f = Test-Endpoint "Price forecast tomato /price" "http://localhost:5000/internal/ai/price?crop=tomato&supply_kg=500"
if ($f) {
  $ok = ($f.recommendedPrice -ge 20 -and $f.recommendedPrice -le 40 -and $f.demandLevel)
  Write-Host "    price=₹$($f.recommendedPrice)  demand=$($f.demandLevel)  verdict=$($f.sellVerdict)" -ForegroundColor DarkGray
  Write-Host ("    Valid: " + ($ok ? "YES" : "NO")) -ForegroundColor ($ok ? "Green" : "Red")
}

$routeBody = @{
  depot = @{ lat = 11.1085; lng = 77.3411 }
  stops = @(
    @{ id="1"; name="Priya"; lat=11.12;   lng=77.35;   qtyKg=50  },
    @{ id="2"; name="Namdev"; lat=11.085;  lng=77.372;  qtyKg=80  },
    @{ id="3"; name="Anna";   lat=10.9955; lng=76.9672; qtyKg=100 },
    @{ id="4"; name="Sri";    lat=11.1;    lng=77.36;   qtyKg=40  },
    @{ id="5"; name="Green";  lat=11.005;  lng=76.94;   qtyKg=150 }
  )
}
$rt = Test-Endpoint "Route optimizer /route (5 stops)" "http://localhost:5000/internal/ai/route" "POST" $routeBody
if ($rt) {
  $distSaved = $rt.distanceSavedPct
  Write-Host ("    distanceSavedPct=" + $distSaved + "%  timeSavedPct=" + $rt.timeSavedPct + "%") -ForegroundColor DarkGray
  Write-Host ("    Non-trivial savings: " + ($distSaved -gt 0 ? "YES" : "NO")) -ForegroundColor ($distSaved -gt 0 ? "Green" : "Red")
}

# 3. Login & get JWT
Write-Host "`n[3/6] Auth (JWT login)" -ForegroundColor Yellow
$farmerToken = $null
$buyerToken  = $null
$lr = Test-Endpoint "Farmer login (ramesh)" "http://localhost:4000/v1/auth/login" "POST" @{ email="ramesh@farmdirect.ai"; password="farm1234" }
if ($lr -and $lr.success) { $farmerToken = $lr.data.token }
$lr2 = Test-Endpoint "Buyer  login (priya)"  "http://localhost:4000/v1/auth/login" "POST" @{ email="priya@farmdirect.ai";  password="buy1234"  }
if ($lr2 -and $lr2.success) { $buyerToken = $lr2.data.token }

# 4. Marketplace + product detail
Write-Host "`n[4/6] Marketplace / product" -ForegroundColor Yellow
$pl = Test-Endpoint "List products /v1/products" "http://localhost:4000/v1/products"
$aProductId = $null
if ($pl -and $pl.success -and $pl.data.items.Count -gt 0) {
  $tomatoes = $pl.data.items | Where-Object { $_.crop -eq "tomato" }
  $aProduct = if ($tomatoes) { $tomatoes[0] } else { $pl.data.items[0] }
  $aProductId = $aProduct._id
  Write-Host ("    found " + $pl.data.items.Count + " products, using tomato=" + $aProduct.name) -ForegroundColor DarkGray
}
if ($aProductId) {
  $null = Test-Endpoint "Product detail /v1/products/$aProductId" "http://localhost:4000/v1/products/$aProductId"
}

# 5. Place order
Write-Host "`n[5/6] Buyer → Place 100 kg order" -ForegroundColor Yellow
$orderResp = $null
if ($aProductId -and $buyerToken) {
  $orderResp = Test-Endpoint "POST /v1/orders (100 kg tomato)" "http://localhost:4000/v1/orders" "POST" @{ productId=$aProductId; quantityKg=100 } $buyerToken
}
if ($orderResp -and $orderResp.success) {
  $orderId = $orderResp.data._id
  Write-Host ("    orderId=" + $orderResp.data.shortId + "  status=" + $orderResp.data.status + "  total=₹" + $orderResp.data.totalAmount) -ForegroundColor DarkGray
  Write-Host "    → Accepting as farmer..." -NoNewline
  try {
    $h = @{ "Content-Type" = "application/json"; "Authorization" = "Bearer $farmerToken" }
    $patch = Invoke-RestMethod -Uri "http://localhost:4000/v1/orders/$orderId/status" -Method PATCH -Headers $h -Body (@{ status = "ACCEPTED" } | ConvertTo-Json)
    Write-Host (" status=" + $patch.data.status + " ✅") -ForegroundColor Green
  } catch { Write-Host " FAIL $($_.Exception.Message)" -ForegroundColor Red }
}

# 6. Forecast + logistics via Node
Write-Host "`n[6/6] Forecast & logistics dashboard endpoints" -ForegroundColor Yellow
$null = Test-Endpoint "/v1/forecast?crop=tomato"  "http://localhost:4000/v1/forecast?crop=tomato"
$null = Test-Endpoint "/v1/forecast/batch (5 crops)" "http://localhost:4000/v1/forecast/batch?crops=tomato,potato,onion,brinjal,ladiesfinger"

Write-Host "`n🎉 End of verification. Green checks → demo ready for judges.`n" -ForegroundColor Green
