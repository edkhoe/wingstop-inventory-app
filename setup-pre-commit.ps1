# Wingstop Inventory App Pre-commit Setup Script
param(
    [switch]$Install,
    [switch]$Update,
    [switch]$Run,
    [switch]$Clean
)

Write-Host "Wingstop Inventory App Pre-commit Setup" -ForegroundColor Green

function Install-PreCommit {
    Write-Host "Installing pre-commit..." -ForegroundColor Yellow
    
    # Check if Python is available
    try {
        $pythonVersion = python --version
        Write-Host "Python found: $pythonVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "Python not found! Please install Python first." -ForegroundColor Red
        return
    }
    
    # Install pre-commit globally
    try {
        Write-Host "Installing pre-commit globally..." -ForegroundColor Cyan
        pip install pre-commit
        
        # Install pre-commit hooks
        Write-Host "Installing pre-commit hooks..." -ForegroundColor Cyan
        pre-commit install
        
        # Install all hook environments
        Write-Host "Installing all hook environments..." -ForegroundColor Cyan
        pre-commit install --hook-type pre-commit
        pre-commit install --hook-type pre-push
        pre-commit install --hook-type commit-msg
        
        Write-Host "Pre-commit hooks installed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to install pre-commit: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Update-PreCommit {
    Write-Host "Updating pre-commit hooks..." -ForegroundColor Yellow
    
    try {
        # Update pre-commit
        Write-Host "Updating pre-commit..." -ForegroundColor Cyan
        pip install --upgrade pre-commit
        
        # Update all hooks
        Write-Host "Updating all hooks..." -ForegroundColor Cyan
        pre-commit autoupdate
        
        Write-Host "Pre-commit hooks updated successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to update pre-commit: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Run-PreCommit {
    Write-Host "Running pre-commit on all files..." -ForegroundColor Yellow
    
    try {
        # Run pre-commit on all files
        Write-Host "Running pre-commit checks..." -ForegroundColor Cyan
        pre-commit run --all-files
        
        Write-Host "Pre-commit checks completed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Pre-commit checks failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Run 'pre-commit run --all-files' to see detailed errors" -ForegroundColor Yellow
    }
}

function Clean-PreCommit {
    Write-Host "Cleaning pre-commit cache..." -ForegroundColor Yellow
    
    try {
        # Clean pre-commit cache
        Write-Host "Cleaning pre-commit cache..." -ForegroundColor Cyan
        pre-commit clean
        
        # Remove pre-commit hooks
        Write-Host "Removing pre-commit hooks..." -ForegroundColor Cyan
        pre-commit uninstall
        
        Write-Host "Pre-commit cleaned successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to clean pre-commit: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Show-Status {
    Write-Host "Checking pre-commit status..." -ForegroundColor Yellow
    
    try {
        # Check if pre-commit is installed
        $preCommitVersion = pre-commit --version
        Write-Host "Pre-commit version: $preCommitVersion" -ForegroundColor Green
        
        # Show installed hooks
        Write-Host "Installed hooks:" -ForegroundColor Cyan
        pre-commit --version
    }
    catch {
        Write-Host "Pre-commit not installed or not available" -ForegroundColor Red
    }
}

# Main execution
if ($Install) {
    Install-PreCommit
}

if ($Update) {
    Update-PreCommit
}

if ($Run) {
    Run-PreCommit
}

if ($Clean) {
    Clean-PreCommit
}

# Default: Show status if no specific option
if (-not ($Install -or $Update -or $Run -or $Clean)) {
    Show-Status
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\setup-pre-commit.ps1 -Install  # Install pre-commit hooks" -ForegroundColor White
    Write-Host "  .\setup-pre-commit.ps1 -Update   # Update pre-commit hooks" -ForegroundColor White
    Write-Host "  .\setup-pre-commit.ps1 -Run      # Run pre-commit on all files" -ForegroundColor White
    Write-Host "  .\setup-pre-commit.ps1 -Clean    # Clean pre-commit cache" -ForegroundColor White
} 