# Wingstop Inventory App Linting and Formatting Script
param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$All,
    [switch]$Fix,
    [switch]$Check
)

Write-Host "Wingstop Inventory App Linting and Formatting" -ForegroundColor Green

function Format-Backend {
    Write-Host "Formatting backend code..." -ForegroundColor Yellow
    
    # Check if we're in the right directory
    if (-not (Test-Path "backend")) {
        Write-Host "Backend directory not found!" -ForegroundColor Red
        return
    }
    
    Push-Location backend
    
    try {
        # Install dev dependencies if needed
        if ($Fix) {
            Write-Host "Running Black formatter..." -ForegroundColor Cyan
            uv run black . --line-length=88
            
            Write-Host "Running Ruff formatter..." -ForegroundColor Cyan
            uv run ruff format .
            
            Write-Host "Running isort..." -ForegroundColor Cyan
            uv run isort . --profile=black --line-length=88
        }
        
        if ($Check) {
            Write-Host "Running Black check..." -ForegroundColor Cyan
            uv run black . --check --line-length=88
            
            Write-Host "Running Ruff linter..." -ForegroundColor Cyan
            uv run ruff check .
            
            Write-Host "Running MyPy type checker..." -ForegroundColor Cyan
            uv run mypy .
        }
        
        Write-Host "Backend formatting completed!" -ForegroundColor Green
    }
    catch {
        Write-Host "Backend formatting failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

function Format-Frontend {
    Write-Host "Formatting frontend code..." -ForegroundColor Yellow
    
    # Check if we're in the right directory
    if (-not (Test-Path "frontend")) {
        Write-Host "Frontend directory not found!" -ForegroundColor Red
        return
    }
    
    Push-Location frontend
    
    try {
        # Install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
            npm install
        }
        
        if ($Fix) {
            Write-Host "Running Prettier formatter..." -ForegroundColor Cyan
            npm run format
            
            Write-Host "Running ESLint fix..." -ForegroundColor Cyan
            npm run lint:fix
        }
        
        if ($Check) {
            Write-Host "Running Prettier check..." -ForegroundColor Cyan
            npm run format:check
            
            Write-Host "Running ESLint..." -ForegroundColor Cyan
            npm run lint
            
            Write-Host "Running TypeScript type check..." -ForegroundColor Cyan
            npm run type-check
        }
        
        Write-Host "Frontend formatting completed!" -ForegroundColor Green
    }
    catch {
        Write-Host "Frontend formatting failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

function Setup-PreCommit {
    Write-Host "Setting up pre-commit hooks..." -ForegroundColor Yellow
    
    Push-Location backend
    
    try {
        # Install pre-commit
        uv run pip install pre-commit
        
        # Install pre-commit hooks
        uv run pre-commit install
        
        Write-Host "Pre-commit hooks installed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Pre-commit setup failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

# Main execution
if ($Backend -or $All) {
    Format-Backend
}

if ($Frontend -or $All) {
    Format-Frontend
}

# Default: Run both if no specific option
if (-not ($Backend -or $Frontend -or $All)) {
    Format-Backend
    Format-Frontend
}

# Setup pre-commit if requested
if ($All) {
    Setup-PreCommit
}

Write-Host "Linting and formatting completed!" -ForegroundColor Green

if (-not ($Fix -or $Check)) {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\lint-and-format.ps1 -Backend -Fix     # Format backend code" -ForegroundColor White
    Write-Host "  .\lint-and-format.ps1 -Frontend -Check  # Check frontend code" -ForegroundColor White
    Write-Host "  .\lint-and-format.ps1 -All -Fix         # Format all code" -ForegroundColor White
    Write-Host "  .\lint-and-format.ps1 -All -Check       # Check all code" -ForegroundColor White
} 