@echo off
echo.
echo ╔══════════════════════════════════════════════════╗
echo ║     🏙️  CIVIC PULSE — Starting Platform          ║
echo ╚══════════════════════════════════════════════════╝
echo.

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌  Python not found. Install from python.org
    pause
    exit /b
)

if not exist "venv" (
    echo 📦  Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo 📦  Installing dependencies...
pip install -r requirements.txt -q

if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo ⚠️  Created .env — edit it to add your API keys!
    ) else (
        echo ⚠️  No .env file found. Create one with your API keys (see README.md^)
    )
)

echo.
echo 🚀  Starting server...
echo 🌐  Open: http://localhost:5000
echo 🛑  Stop: CTRL+C
echo.
python app.py
pause
