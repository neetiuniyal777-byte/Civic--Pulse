#!/bin/bash
# ══════════════════════════════════════════════════
#  CIVIC PULSE — One-Click Start Script
#  Run: bash start.sh
# ══════════════════════════════════════════════════

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║     🏙️  CIVIC PULSE — Starting Platform          ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌  Python 3 not found. Install from python.org"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦  Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Install dependencies
echo "📦  Installing dependencies..."
pip install -r requirements.txt -q

# Copy .env.example if .env not exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "⚠️   Created .env file — edit it to add your API keys!"
    else
        echo "⚠️   No .env file found. Create one with your API keys (see README.md)"
    fi
fi

# Load .env
set -a
source .env 2>/dev/null || true
set +a

echo ""
echo "🚀  Starting server..."
echo "🌐  Open: http://localhost:5000"
echo "🛑  Stop: Press CTRL+C"
echo ""
python3 app.py
