@echo off
REM Stop Docker containers (Windows)

docker-compose down

echo.
echo ✅ Docker containers stopped
echo.
echo To remove all data (including database):
echo    docker-compose down -v
echo.
