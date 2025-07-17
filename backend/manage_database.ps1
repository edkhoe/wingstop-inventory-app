# Database Management Script for Wingstop Inventory App
# This script provides database initialization, health checks, and maintenance

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("init", "health", "reset", "backup", "restore", "info")]
    [string]$Action = "help",
    
    [Parameter(Mandatory=$false)]
    [string]$BackupPath = ""
)

# Activate virtual environment if it exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "venv\Scripts\Activate.ps1"
}

function Show-Help {
    Write-Host "Database Management Script" -ForegroundColor Green
    Write-Host "Usage: .\manage_database.ps1 -Action <action> [-BackupPath <path>]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Yellow
    Write-Host "  init     - Initialize database and create tables"
    Write-Host "  health   - Check database health and connection"
    Write-Host "  reset    - Reset database (drop and recreate tables)"
    Write-Host "  backup   - Create database backup"
    Write-Host "  restore  - Restore database from backup"
    Write-Host "  info     - Show database information"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\manage_database.ps1 -Action init"
    Write-Host "  .\manage_database.ps1 -Action health"
    Write-Host "  .\manage_database.ps1 -Action backup -BackupPath './backup.db'"
}

function Initialize-Database {
    Write-Host "Initializing database..." -ForegroundColor Green
    
    try {
        # Import and run database initialization
        python -c "
from app.core.database import init_database
try:
    init_database()
    print('Database initialized successfully!')
except Exception as e:
    print(f'Database initialization failed: {e}')
    exit(1)
"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database initialized successfully!" -ForegroundColor Green
        } else {
            Write-Host "Database initialization failed!" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error during database initialization: $_" -ForegroundColor Red
    }
}

function Check-DatabaseHealth {
    Write-Host "Checking database health..." -ForegroundColor Green
    
    try {
        $health = python -c "
from app.core.database import check_database_health
import json
health = check_database_health()
print(json.dumps(health))
"
        
        $healthData = $health | ConvertFrom-Json
        
        Write-Host "Database Health Status:" -ForegroundColor Yellow
        $statusColor = if ($healthData.status -eq "healthy") { "Green" } else { "Red" }
        $connectedColor = if ($healthData.connected) { "Green" } else { "Red" }
        Write-Host "  Status: $($healthData.status)" -ForegroundColor $statusColor
        Write-Host "  Connected: $($healthData.connected)" -ForegroundColor $connectedColor
        Write-Host "  Database: $($healthData.database_url)" -ForegroundColor Cyan
        
        if ($healthData.PSObject.Properties.Name -contains "error") {
            Write-Host "  Error: $($healthData.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error checking database health: $_" -ForegroundColor Red
    }
}

function Reset-Database {
    Write-Host "Resetting database (this will drop all tables)..." -ForegroundColor Yellow
    $confirmation = Read-Host "Are you sure you want to reset the database? (y/N)"
    
    if ($confirmation -eq "y" -or $confirmation -eq "Y") {
        try {
            python -c "
from app.core.database import db_manager
try:
    db_manager.drop_tables()
    db_manager.create_tables()
    print('Database reset successfully!')
except Exception as e:
    print(f'Database reset failed: {e}')
    exit(1)
"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Database reset successfully!" -ForegroundColor Green
            } else {
                Write-Host "Database reset failed!" -ForegroundColor Red
            }
        } catch {
            Write-Host "Error during database reset: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "Database reset cancelled." -ForegroundColor Yellow
    }
}

function Backup-Database {
    param([string]$BackupPath)
    
    if ([string]::IsNullOrEmpty($BackupPath)) {
        $BackupPath = "./backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db"
    }
    
    Write-Host "Creating database backup to: $BackupPath" -ForegroundColor Green
    
    try {
        # For SQLite, we can simply copy the database file
        if (Test-Path "./wingstop_inventory.db") {
            Copy-Item "./wingstop_inventory.db" $BackupPath
            Write-Host "Database backup created successfully!" -ForegroundColor Green
        } else {
            Write-Host "Database file not found!" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error creating database backup: $_" -ForegroundColor Red
    }
}

function Restore-Database {
    param([string]$BackupPath)
    
    if ([string]::IsNullOrEmpty($BackupPath)) {
        Write-Host "Please specify a backup path using -BackupPath parameter" -ForegroundColor Red
        return
    }
    
    if (-not (Test-Path $BackupPath)) {
        Write-Host "Backup file not found: $BackupPath" -ForegroundColor Red
        return
    }
    
    Write-Host "Restoring database from: $BackupPath" -ForegroundColor Green
    
    try {
        # Stop any running processes that might be using the database
        Write-Host "Stopping any processes using the database..." -ForegroundColor Yellow
        
        # Copy the backup to the database location
        Copy-Item $BackupPath "./wingstop_inventory.db" -Force
        Write-Host "Database restored successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Error restoring database: $_" -ForegroundColor Red
    }
}

function Show-DatabaseInfo {
    Write-Host "Database Information:" -ForegroundColor Green
    
    try {
        $info = python -c "
from app.core.config import settings
from app.core.database import db_manager
import os

print(f'Database URL: {settings.DATABASE_URL}')
print(f'Database file exists: {os.path.exists(\"./wingstop_inventory.db\")}')
print(f'Connection test: {db_manager.check_connection()}')
print(f'Environment: {settings.ENVIRONMENT}')
print(f'Debug mode: {settings.DEBUG}')
"
        
        Write-Host $info
    } catch {
        Write-Host "Error getting database information: $_" -ForegroundColor Red
    }
}

# Main execution
switch ($Action) {
    "help" { Show-Help }
    "init" { Initialize-Database }
    "health" { Check-DatabaseHealth }
    "reset" { Reset-Database }
    "backup" { Backup-Database -BackupPath $BackupPath }
    "restore" { Restore-Database -BackupPath $BackupPath }
    "info" { Show-DatabaseInfo }
    default { Show-Help }
} 