#!/bin/bash
# Stop Docker containers

docker-compose down

echo "✅ Docker containers stopped"
echo ""
echo "To remove all data (including database):"
echo "   docker-compose down -v"
