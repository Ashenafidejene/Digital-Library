@echo off
echo 🚀 Starting Yeka Sub City Library System...
echo.

echo 📡 Starting Backend Server...
start "Backend Server" cmd /k "node backend.js"

echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo 🌐 Starting Frontend Server...
cd frontend
start "Frontend Server" cmd /k "npm start"
cd ..

echo.
echo ✅ Both servers are starting!
echo.
echo 📱 Demo Accounts:
echo    Admin: admin@yekalibrary.gov.et / admin123
echo    User:  user@example.com / user123
echo.
echo 🌐 Frontend will be available at: http://localhost:3000 (or next available port)
echo 📡 Backend is running at: http://localhost:3333
echo.
echo Press any key to exit this window...
pause > nul
