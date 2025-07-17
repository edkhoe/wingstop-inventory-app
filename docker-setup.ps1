# Wingstop Inventory App Docker Setup Script
param(
    [string]$Environment = "development",
    [switch]$Build,
    [switch]$Start,
    [switch]$Stop,
    [switch]$Clean
)

Write-Host "Wingstop Inventory App Docker Setup" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan

function Build-Containers {
    Write-Host "Building Docker containers..." -ForegroundColor Yellow
    docker-compose build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Build failed!" -ForegroundColor Red
        exit 1
    }
}

function Start-Containers {
    Write-Host "Starting Docker containers..." -ForegroundColor Yellow
    if ($Environment -eq "production") {
        docker-compose --profile production up -d
    } else {
        docker-compose up -d
    }
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Containers started successfully!" -ForegroundColor Green
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
        Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
    } else {
        Write-Host "Failed to start containers!" -ForegroundColor Red
        exit 1
    }
}

function Stop-Containers {
    Write-Host "Stopping Docker containers..." -ForegroundColor Yellow
    docker-compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Containers stopped successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to stop containers!" -ForegroundColor Red
    }
}

function Clean-Containers {
    Write-Host "Cleaning Docker containers and volumes..." -ForegroundColor Yellow
    docker-compose down -v --rmi all
    docker system prune -f
    Write-Host "Cleanup completed!" -ForegroundColor Green
}

# Main execution
if ($Build) {
    Build-Containers
}

if ($Start) {
    Start-Containers
}

if ($Stop) {
    Stop-Containers
}

if ($Clean) {
    Clean-Containers
}

# Default: Show help if no parameters
if (-not ($Build -or $Start -or $Stop -or $Clean)) {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\docker-setup.ps1 -Build                    # Build containers" -ForegroundColor White
    Write-Host "  .\docker-setup.ps1 -Start                    # Start containers" -ForegroundColor White
    Write-Host "  .\docker-setup.ps1 -Build -Start             # Build and start" -ForegroundColor White
    Write-Host "  .\docker-setup.ps1 -Stop                     # Stop containers" -ForegroundColor White
    Write-Host "  .\docker-setup.ps1 -Clean                    # Clean everything" -ForegroundColor White
    Write-Host "  .\docker-setup.ps1 -Environment production  # Use production profile" -ForegroundColor White
} 