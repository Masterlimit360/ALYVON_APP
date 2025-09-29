@echo off
echo ========================================
echo ALYVON Error Fix Script
echo ========================================
echo.

echo Checking for common issues...

REM Check if .env file exists and has proper content
if not exist ".env" (
    echo Creating .env file from template...
    copy "env.example" ".env"
    echo.
    echo IMPORTANT: Please edit .env file with your Supabase credentials
    echo See env.example for instructions
    echo.
) else (
    echo .env file exists
)

REM Clear Metro cache
echo Clearing Metro cache...
npx expo start --clear

echo.
echo ========================================
echo Error fixes applied!
echo ========================================
echo.
echo What was fixed:
echo 1. Renamed logo file to remove spaces
echo 2. Added error handling for Supabase connection
echo 3. Added proper environment variable checking
echo.
echo Next steps:
echo 1. Edit .env file with your Supabase credentials
echo 2. Run: npx expo start
echo.
pause



