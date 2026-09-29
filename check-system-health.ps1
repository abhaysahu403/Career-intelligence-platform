# System Health Check Script
# Checks all containers and generates a comprehensive status report

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CIP SYSTEM HEALTH CHECK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Wait for build to complete
Write-Host "[1/6] Waiting for build to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Check container status
Write-Host "`n[2/6] Checking container status..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}},{{.Status}}" | ConvertFrom-Csv -Header "Name","Status"

$expectedContainers = @(
    "cip-postgres",
    "cip-redis", 
    "cip-api-gateway",
    "cip-auth-service",
    "cip-student-service",
    "cip-interview-service",
    "cip-resume-service",
    "cip-certificate-service",
    "cip-job-service",
    "cip-recommendation-service",
    "cip-score-service",
    "cip-analytics-service",
    "cip-ml-service",
    "cip-frontend"
)

Write-Host "`nContainer Status:" -ForegroundColor Green
foreach ($expected in $expectedContainers) {
    $container = $containers | Where-Object { $_.Name -eq $expected }
    if ($container) {
        if ($container.Status -match "Up" -or $container.Status -match "healthy") {
            Write-Host "  ✅ $($container.Name): $($container.Status)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($container.Name): $($container.Status)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠️  $expected: NOT RUNNING" -ForegroundColor Yellow
    }
}

# Check health endpoints
Write-Host "`n[3/6] Checking health endpoints..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

$healthChecks = @{
    "Frontend" = "http://localhost:3000/api/health"
    "API Gateway" = "http://localhost:8080/actuator/health"
    "ML Service" = "http://localhost:8000/health"
}

foreach ($service in $healthChecks.Keys) {
    try {
        $response = Invoke-WebRequest -Uri $healthChecks[$service] -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ $service health check passed" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $service returned status code: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ $service health check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check database connectivity
Write-Host "`n[4/6] Checking database..." -ForegroundColor Yellow
try {
    docker exec cip-postgres pg_isready -U cip_user -d career_intelligence > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ PostgreSQL is ready" -ForegroundColor Green
    } else {
        Write-Host "  ❌ PostgreSQL is not ready" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Cannot check PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
}

# Check Redis connectivity
Write-Host "`n[5/6] Checking Redis..." -ForegroundColor Yellow
try {
    docker exec cip-redis redis-cli -a cip-redis-pass ping > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Redis is ready" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Redis is not ready" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Cannot check Redis: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n[6/6] System Summary" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

$runningContainers = ($containers | Where-Object { $_.Status -match "Up" }).Count
$totalContainers = $expectedContainers.Count

Write-Host "`nContainers Running: $runningContainers / $totalContainers"

if ($runningContainers -eq $totalContainers) {
    Write-Host "`n✅ ALL SYSTEMS OPERATIONAL!" -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Cyan
    Write-Host "  1. Open http://localhost:3000 to access the frontend"
    Write-Host "  2. Test user registration and login"
    Write-Host "  3. Upload a resume and test AI features"
    Write-Host "  4. Run: docker compose logs -f  to monitor logs"
} else {
    Write-Host "`n⚠️  SYSTEM NOT FULLY OPERATIONAL" -ForegroundColor Yellow
    Write-Host "`nTroubleshooting:" -ForegroundColor Cyan
    Write-Host "  1. Check logs: docker compose logs"
    Write-Host "  2. Check specific service: docker logs <container-name>"
    Write-Host "  3. Restart: docker compose restart"
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
