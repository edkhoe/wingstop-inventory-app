# Database Management Script for Wingstop Inventory App
# This script provides common Alembic operations

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("init", "migrate", "upgrade", "downgrade", "revision", "current", "history", "stamp", "show")]
    [string]$Action = "help",
    
    [Parameter(Mandatory=$false)]
    [string]$Message = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Revision = "head"
)

# Activate virtual environment if it exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "venv\Scripts\Activate.ps1"
}

function Show-Help {
    Write-Host "Database Management Script" -ForegroundColor Green
    Write-Host "Usage: .\manage_db.ps1 -Action <action> [-Message <message>] [-Revision <revision>]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Yellow
    Write-Host "  init      - Initialize database and create initial migration"
    Write-Host "  migrate   - Create a new migration with autogenerate"
    Write-Host "  upgrade   - Apply all pending migrations"
    Write-Host "  downgrade - Downgrade to a specific revision"
    Write-Host "  revision  - Create a new empty migration"
    Write-Host "  current   - Show current database revision"
    Write-Host "  history   - Show migration history"
    Write-Host "  stamp     - Mark database as being at a specific revision"
    Write-Host "  show      - Show a specific revision"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\manage_db.ps1 -Action init"
    Write-Host "  .\manage_db.ps1 -Action migrate -Message 'Add user table'"
    Write-Host "  .\manage_db.ps1 -Action upgrade"
    Write-Host "  .\manage_db.ps1 -Action current"
}

function Initialize-Database {
    Write-Host "Initializing database..." -ForegroundColor Green
    
    # Create initial migration
    Write-Host "Creating initial migration..." -ForegroundColor Yellow
    alembic revision --autogenerate -m "Initial migration - create all tables"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Applying initial migration..." -ForegroundColor Yellow
        alembic upgrade head
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database initialized successfully!" -ForegroundColor Green
        } else {
            Write-Host "Failed to apply migration." -ForegroundColor Red
        }
    } else {
        Write-Host "Failed to create initial migration." -ForegroundColor Red
    }
}

function Create-Migration {
    param([string]$Message)
    
    if ([string]::IsNullOrEmpty($Message)) {
        $Message = Read-Host "Enter migration message"
    }
    
    Write-Host "Creating migration: $Message" -ForegroundColor Yellow
    alembic revision --autogenerate -m $Message
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration created successfully!" -ForegroundColor Green
        Write-Host "To apply the migration, run: .\manage_db.ps1 -Action upgrade" -ForegroundColor Cyan
    } else {
        Write-Host "Failed to create migration." -ForegroundColor Red
    }
}

function Upgrade-Database {
    Write-Host "Upgrading database to latest revision..." -ForegroundColor Yellow
    alembic upgrade head
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database upgraded successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to upgrade database." -ForegroundColor Red
    }
}

function Downgrade-Database {
    param([string]$Revision)
    
    Write-Host "Downgrading database to revision: $Revision" -ForegroundColor Yellow
    alembic downgrade $Revision
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database downgraded successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to downgrade database." -ForegroundColor Red
    }
}

function Show-CurrentRevision {
    Write-Host "Current database revision:" -ForegroundColor Yellow
    alembic current
}

function Show-History {
    Write-Host "Migration history:" -ForegroundColor Yellow
    alembic history
}

function Show-Revision {
    param([string]$Revision)
    
    Write-Host "Showing revision: $Revision" -ForegroundColor Yellow
    alembic show $Revision
}

# Main execution
switch ($Action) {
    "help" { Show-Help }
    "init" { Initialize-Database }
    "migrate" { Create-Migration -Message $Message }
    "upgrade" { Upgrade-Database }
    "downgrade" { Downgrade-Database -Revision $Revision }
    "revision" { 
        if ([string]::IsNullOrEmpty($Message)) {
            $Message = Read-Host "Enter migration message"
        }
        alembic revision -m $Message
    }
    "current" { Show-CurrentRevision }
    "history" { Show-History }
    "stamp" { alembic stamp $Revision }
    "show" { Show-Revision -Revision $Revision }
    default { Show-Help }
} 