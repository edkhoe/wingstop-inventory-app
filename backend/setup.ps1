# Wingstop Inventory Backend Setup Script
Write-Host "Setting up Wingstop Inventory Backend..." -ForegroundColor Green

# Check if UV is installed
try {
    $uvVersion = uv --version
    Write-Host "UV is installed: $uvVersion" -ForegroundColor Green
} catch {
    Write-Host "UV not found. Installing UV..." -ForegroundColor Yellow
    Write-Host "Please run the following command as Administrator:" -ForegroundColor Cyan
    Write-Host "powershell -c `"irm https://astral.sh/uv/install.ps1 | iex`"" -ForegroundColor White
    Write-Host "After installing UV, run this script again." -ForegroundColor Yellow
    exit 1
}

# Create virtual environment and install dependencies
Write-Host "Creating virtual environment and installing dependencies..." -ForegroundColor Green
uv sync

# Initialize Alembic
Write-Host "Initializing Alembic for database migrations..." -ForegroundColor Green
uv run alembic init alembic

Write-Host "Setup complete! You can now run the backend with:" -ForegroundColor Green
Write-Host "uv run python main.py" -ForegroundColor Cyan 