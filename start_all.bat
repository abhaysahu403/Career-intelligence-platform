@echo off
echo ===================================================
echo   Starting CIP Platform (Hackathon Demo Mode)
echo ===================================================

echo.
echo [1/3] Starting ML API Server (Python/FastAPI)...
start "ML Service (Port 8000)" cmd /k "cd cip-ml && echo Starting ML Service... && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo.
echo [2/3] Starting Backend API (Java/Spring Boot)...
start "Backend Service (Port 8080)" cmd /k "cd cip-backend-lite && echo Starting Backend... && mvn spring-boot:run"

echo.
echo [3/3] Starting Web Interface (Next.js)...
start "Web Service (Port 3000)" cmd /k "cd cip-web && echo Starting Frontend... && npm run dev"

echo.
echo ===================================================
echo All services have been launched in separate windows!
echo.
echo   - ML Service:  http://localhost:8000
echo   - Backend:     http://localhost:8080
echo   - Web App:     http://localhost:3000
echo ===================================================
echo You can close this window now. The services will keep running in the newly opened windows.
pause
