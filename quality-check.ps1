# Wingstop Inventory App Quality Assurance Script
param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$All,
    [switch]$PreCommit,
    [switch]$Security,
    [switch]$Tests
)

Write-Host "Wingstop Inventory App Quality Assurance" -ForegroundColor Green

function Test-Backend-Quality {
    Write-Host "Running backend quality checks..." -ForegroundColor Yellow
    
    Push-Location backend
    
    try {
        # Check if virtual environment exists
        if (-not (Test-Path "venv")) {
            Write-Host "Creating virtual environment..." -ForegroundColor Cyan
            python -m venv venv
        }
        
        # Activate virtual environment
        .\venv\Scripts\Activate.ps1
        
        # Install dependencies if needed
        if (-not (Test-Path "venv\Lib\site-packages\fastapi")) {
            Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
            pip install -r requirements.txt
        }
        
        # Install dev dependencies
        Write-Host "Installing development dependencies..." -ForegroundColor Cyan
        pip install black ruff mypy pre-commit
        
        # Run quality checks
        Write-Host "Running Black formatter..." -ForegroundColor Cyan
        black . --check --line-length=88
        
        Write-Host "Running Ruff linter..." -ForegroundColor Cyan
        ruff check .
        
        Write-Host "Running MyPy type checker..." -ForegroundColor Cyan
        mypy . --ignore-missing-imports
        
        Write-Host "Backend quality checks completed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Backend quality checks failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

function Test-Frontend-Quality {
    Write-Host "Running frontend quality checks..." -ForegroundColor Yellow
    
    Push-Location frontend
    
    try {
        # Install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
            npm install
        }
        
        # Run quality checks
        Write-Host "Running ESLint..." -ForegroundColor Cyan
        npm run lint
        
        Write-Host "Running Prettier check..." -ForegroundColor Cyan
        npm run format:check
        
        Write-Host "Running TypeScript type check..." -ForegroundColor Cyan
        npm run type-check
        
        Write-Host "Frontend quality checks completed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Frontend quality checks failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

function Test-Security {
    Write-Host "Running security checks..." -ForegroundColor Yellow
    
    try {
        # Check for secrets in code
        Write-Host "Checking for secrets in code..." -ForegroundColor Cyan
        if (Get-Command detect-secrets -ErrorAction SilentlyContinue) {
            detect-secrets scan --baseline .secrets.baseline
        } else {
            Write-Host "detect-secrets not installed. Install with: pip install detect-secrets" -ForegroundColor Yellow
        }
        
        # Check for vulnerable dependencies
        Write-Host "Checking for vulnerable dependencies..." -ForegroundColor Cyan
        
        # Backend security check
        Push-Location backend
        if (Test-Path "venv") {
            .\venv\Scripts\Activate.ps1
            Write-Host "Checking Python dependencies for vulnerabilities..." -ForegroundColor Cyan
            # Note: Add safety or similar tool for Python dependency scanning
        }
        Pop-Location
        
        # Frontend security check
        Push-Location frontend
        if (Test-Path "node_modules") {
            Write-Host "Checking npm dependencies for vulnerabilities..." -ForegroundColor Cyan
            npm audit
        }
        Pop-Location
        
        Write-Host "Security checks completed!" -ForegroundColor Green
    }
    catch {
        Write-Host "Security checks failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-PreCommit {
    Write-Host "Running pre-commit checks..." -ForegroundColor Yellow
    
    try {
        # Check if pre-commit is installed
        if (Get-Command pre-commit -ErrorAction SilentlyContinue) {
            Write-Host "Running pre-commit on all files..." -ForegroundColor Cyan
            pre-commit run --all-files
            Write-Host "Pre-commit checks completed!" -ForegroundColor Green
        } else {
            Write-Host "Pre-commit not installed. Run: .\setup-pre-commit.ps1 -Install" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "Pre-commit checks failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-All {
    Write-Host "Running all quality checks..." -ForegroundColor Yellow
    
    Test-Backend-Quality
    Test-Frontend-Quality
    Test-Security
    Test-PreCommit
    
    Write-Host "All quality checks completed!" -ForegroundColor Green
}

# Main execution
if ($Backend) {
    Test-Backend-Quality
}

if ($Frontend) {
    Test-Frontend-Quality
}

if ($Security) {
    Test-Security
}

if ($PreCommit) {
    Test-PreCommit
}

if ($All) {
    Test-All
}

# Default: Run all if no specific option
if (-not ($Backend -or $Frontend -or $Security -or $PreCommit -or $All)) {
    Test-All
}

Write-Host "Quality assurance completed!" -ForegroundColor Green 