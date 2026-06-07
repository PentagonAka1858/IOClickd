@echo off
REM Quick start script for Docker Compose (Windows)

echo.
echo 🚀 PFG Docker Quick Start
echo =========================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

echo ✅ Docker is installed
echo.

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from .env.example...
    copy .env.example .env
    echo ✅ .env file created with default values
    echo    Edit docker\.env if you need to change values
    echo.
)

REM Build and start containers
echo 🔨 Building and starting Docker containers...
docker-compose up -d --build

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 5 /nobreak

REM Check if services are running
echo.
echo ✅ Docker containers are running!
echo.
echo 📍 Access your application:
echo    Frontend:  http://localhost
echo    Backend:   http://localhost:8000
echo    API:       http://localhost:8000/api/
echo.
echo 📋 View logs:
echo    docker-compose logs -f
echo.
echo 🛑 To stop the containers:
echo    docker-compose down
echo.
echo 💾 Database Information:
echo    Host:     db (or localhost:3306)
echo    Database: pfg_db
echo    User:     pfg_user
echo    Password: pfg_password
echo.
