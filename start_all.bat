@echo off
echo ========================================
echo  Starting Career Intelligence Platform
echo ========================================
echo.

REM Set Maven path
set PATH=C:\maven\apache-maven-3.9.6\bin;%PATH%

echo [1/3] Starting Backend (Spring Boot)...
start "CIP Backend" cmd /k "cd cip-backend-lite && mvn spring-boot:run"
timeout /t 5 /nobreak >nul

echo [2/3] Starting ML Service (Python FastAPI)...
start "CIP ML" cmd /k "cd cip-ml && python main.py"
timeout /t 5 /nobreak >nul

echo [3/3] Starting Frontend (Next.js)...
start "CIP Frontend" cmd /k "cd cip-web && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  All services are starting!
echo ========================================
echo.
echo  Backend:  http://localhost:8080
echo  ML API:   http://localhost:8000
echo  Frontend: http://localhost:3000
echo.
echo  Press any key to close this window...
echo  (Services will continue running)
echo ========================================
pause >nul
