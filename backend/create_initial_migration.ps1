# Create Initial Alembic Migration Script
# This script generates the initial migration for all database models

Write-Host "Creating initial Alembic migration..." -ForegroundColor Green

# Activate virtual environment if it exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "venv\Scripts\Activate.ps1"
}

# Generate initial migration
Write-Host "Generating initial migration..." -ForegroundColor Yellow
alembic revision --autogenerate -m "Initial migration - create all tables"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Initial migration created successfully!" -ForegroundColor Green
    Write-Host "To apply the migration, run: alembic upgrade head" -ForegroundColor Cyan
} else {
    Write-Host "Failed to create initial migration. Check the error messages above." -ForegroundColor Red
} 