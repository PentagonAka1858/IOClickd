#!/bin/bash

# Quick start script for Docker Compose
# This script helps you get started with Docker quickly

set -e

echo "🚀 PFG Docker Quick Start"
echo "========================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created with default values"
    echo "   Edit docker/.env if you need to change values"
    echo ""
fi

# Build and start containers
echo "🔨 Building and starting Docker containers..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
echo ""
echo "✅ Docker containers are running!"
echo ""
echo "📍 Access your application:"
echo "   Frontend:  http://localhost"
echo "   Backend:   http://localhost:8000"
echo "   API:       http://localhost:8000/api/"
echo ""
echo "📋 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop the containers:"
echo "   docker-compose down"
echo ""
echo "💾 Database Information:"
echo "   Host:     db (or localhost:3306)"
echo "   Database: pfg_db"
echo "   User:     pfg_user"
echo "   Password: pfg_password"
echo ""
