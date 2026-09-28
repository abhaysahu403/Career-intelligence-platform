@echo off
echo ========================================
echo  Career Intelligence Platform v2.0
echo  Starting All Services...
echo ========================================
echo.

REM Check prerequisites
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven not found! Please install Maven 3.9+
    pause
    exit /b 1
)

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python not found! Please install Python 3.10+
    pause
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found! Please install Node.js 18+
    pause
    exit /b 1
)

echo [1/3] Starting Backend Microservices (Spring Boot)...
echo        This will start API Gateway on port 8080
start "CIP Backend" cmd /k "cd cip-backend && mvn spring-boot:run"
timeout /t 10 /nobreak >nul

echo [2/3] Starting ML Service (Python FastAPI)...
echo        This will start ML API on port 8000
start "CIP ML Service" cmd /k "cd cip-ml && python main.py"
timeout /t 5 /nobreak >nul

echo [3/3] Starting Frontend (Next.js)...
echo        This will start Web UI on port 3000
start "CIP Frontend" cmd /k "cd cip-web && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  All Services Started Successfully!
echo ========================================
echo.
echo  Access URLs:
echo  - Frontend:   http://localhost:3000
echo  - API Gateway: http://localhost:8080
echo  - ML API:     http://localhost:8000
echo  - API Docs:   http://localhost:8000/docs
echo.
echo  Check the opened terminal windows for logs.
echo  Press any key to close this window...
echo ========================================
pause >nul
