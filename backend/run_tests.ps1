# Wingstop Inventory App - Backend Test Runner
# This script runs comprehensive tests for all implemented functionality

param(
    [string]$TestType = "all",  # all, unit, integration, api
    [string]$Coverage = "false",  # true/false
    [string]$Verbose = "false"   # true/false
)

Write-Host "🐔 Wingstop Inventory App - Backend Test Runner" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if we're in the backend directory
if (-not (Test-Path "main.py")) {
    Write-Host "❌ Error: Please run this script from the backend directory" -ForegroundColor Red
    exit 1
}

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install dependencies if needed
if (-not (Test-Path "venv\Lib\site-packages\pytest")) {
    Write-Host "📥 Installing test dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Set environment variables for testing
$env:ENVIRONMENT = "test"
$env:DATABASE_URL = "sqlite:///./test.db"
$env:DEBUG = "true"

# Clean up any existing test database
if (Test-Path "test.db") {
    Write-Host "🧹 Cleaning up test database..." -ForegroundColor Yellow
    Remove-Item "test.db" -Force
}

# Create test database and run migrations
Write-Host "🗄️ Setting up test database..." -ForegroundColor Yellow
python -c "
from app.core.database import init_database
from app.models import *
init_database()
print('Test database initialized successfully')
"

# Run tests based on type
$pytestArgs = @()

if ($TestType -eq "all") {
    $pytestArgs += "tests/"
} elseif ($TestType -eq "unit") {
    $pytestArgs += "tests/test_*.py"
} elseif ($TestType -eq "api") {
    $pytestArgs += "tests/test_api_*.py"
} elseif ($TestType -eq "integration") {
    $pytestArgs += "tests/test_integration_*.py"
}

if ($Coverage -eq "true") {
    $pytestArgs += "--cov=app"
    $pytestArgs += "--cov-report=html"
    $pytestArgs += "--cov-report=term-missing"
}

if ($Verbose -eq "true") {
    $pytestArgs += "-v"
}

$pytestArgs += "-s"
$pytestArgs += "--tb=short"

Write-Host "🧪 Running $TestType tests..." -ForegroundColor Yellow
Write-Host "Command: pytest $($pytestArgs -join ' ')" -ForegroundColor Gray

try {
    & python -m pytest @pytestArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ All tests passed!" -ForegroundColor Green
        
        if ($Coverage -eq "true") {
            Write-Host "📊 Coverage report generated in htmlcov/index.html" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ Some tests failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running tests: $_" -ForegroundColor Red
    exit 1
}

# Clean up test database
if (Test-Path "test.db") {
    Write-Host "🧹 Cleaning up test database..." -ForegroundColor Yellow
    Remove-Item "test.db" -Force
}

Write-Host "🎉 Test run completed!" -ForegroundColor Green 