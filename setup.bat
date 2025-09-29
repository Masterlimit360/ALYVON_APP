@echo off
echo ========================================
echo ALYVON App Setup Script
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo Dependencies installed successfully!
echo.

echo Checking for .env file...
if not exist ".env" (
    echo Creating .env file from template...
    copy "env.example" ".env"
    echo.
    echo IMPORTANT: Please edit the .env file with your Supabase credentials
    echo You can find these in your Supabase project settings
    echo.
) else (
    echo .env file already exists
)

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your Supabase credentials
echo 2. Set up your Supabase database (see README.md)
echo 3. Run: npx expo start
echo.
pause



