# Configuration Validation Script for Wingstop Inventory App
# This script validates the application configuration and provides recommendations

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("check", "fix", "generate", "info")]
    [string]$Action = "check"
)

# Activate virtual environment if it exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "venv\Scripts\Activate.ps1"
}

function Show-Help {
    Write-Host "Configuration Validation Script" -ForegroundColor Green
    Write-Host "Usage: .\validate_config.ps1 -Action <action>" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Yellow
    Write-Host "  check    - Check configuration for issues"
    Write-Host "  fix      - Attempt to fix common configuration issues"
    Write-Host "  generate - Generate a new .env file"
    Write-Host "  info     - Show current configuration information"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\validate_config.ps1 -Action check"
    Write-Host "  .\validate_config.ps1 -Action generate"
}

function Check-Configuration {
    Write-Host "Checking configuration..." -ForegroundColor Green
    
    try {
        $result = python -c "
from app.core.config import config_manager
import json

issues = config_manager.validate_configuration()
config_info = config_manager.get_environment_config()

result = {
    'issues': issues,
    'config': config_info,
    'environment': config_manager.settings.ENVIRONMENT,
    'debug': config_manager.settings.DEBUG
}

print(json.dumps(result))
"
        
        $data = $result | ConvertFrom-Json
        
        Write-Host "Configuration Check Results:" -ForegroundColor Yellow
        Write-Host "  Environment: $($data.environment)" -ForegroundColor Cyan
        Write-Host "  Debug Mode: $($data.debug)" -ForegroundColor Cyan
        
        if ($data.issues.Count -eq 0) {
            Write-Host "  Status: No issues found!" -ForegroundColor Green
        } else {
            Write-Host "  Status: Found $($data.issues.Count) issue(s):" -ForegroundColor Red
            foreach ($issue in $data.issues) {
                Write-Host "    - $issue" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Host "Environment Configuration:" -ForegroundColor Yellow
        foreach ($key in $data.config.Keys) {
            $value = $data.config.$key
            $color = if ($value -eq $true) { "Green" } elseif ($value -eq $false) { "Red" } else { "Cyan" }
            Write-Host "  $key`: $value" -ForegroundColor $color
        }
        
    } catch {
        Write-Host "Error checking configuration: $_" -ForegroundColor Red
    }
}

function Fix-Configuration {
    Write-Host "Attempting to fix configuration issues..." -ForegroundColor Green
    
    try {
        # Check if .env file exists
        if (-not (Test-Path ".env")) {
            Write-Host "Creating .env file..." -ForegroundColor Yellow
            Copy-Item "env.example" ".env" -ErrorAction SilentlyContinue
            if (Test-Path ".env") {
                Write-Host "Created .env file from template" -ForegroundColor Green
            } else {
                Write-Host "Failed to create .env file" -ForegroundColor Red
            }
        }
        
        # Create required directories
        $directories = @("uploads", "logs", "email_templates")
        foreach ($dir in $directories) {
            if (-not (Test-Path $dir)) {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
                Write-Host "Created directory: $dir" -ForegroundColor Green
            }
        }
        
        # Generate secret key if needed
        $envContent = Get-Content ".env" -ErrorAction SilentlyContinue
        if ($envContent -and ($envContent -match "SECRET_KEY=your-super-secret-key-change-this-in-production")) {
            $newSecret = python -c "import secrets; print(secrets.token_urlsafe(32))"
            $envContent = $envContent -replace "SECRET_KEY=your-super-secret-key-change-this-in-production", "SECRET_KEY=$newSecret"
            $envContent | Set-Content ".env"
            Write-Host "Generated new SECRET_KEY" -ForegroundColor Green
        }
        
        Write-Host "Configuration fixes applied!" -ForegroundColor Green
        
    } catch {
        Write-Host "Error fixing configuration: $_" -ForegroundColor Red
    }
}

function Generate-EnvFile {
    Write-Host "Generating new .env file..." -ForegroundColor Green
    
    try {
        $envContent = @"
# Database Configuration
DATABASE_URL=sqlite:///./wingstop_inventory.db

# Security Configuration
SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application Configuration
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO
API_V1_STR=/api/v1
PROJECT_NAME=Wingstop Inventory API
VERSION=1.0.0

# Server Configuration
HOST=0.0.0.0
PORT=8000

# CORS Configuration
ALLOWED_HOSTS=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"]
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"]

# Email Configuration
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@wingstop.com
EMAIL_TEMPLATES_DIR=./email_templates

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
ALLOWED_FILE_TYPES=[".csv", ".xlsx", ".xls", ".pdf", ".jpg", ".png"]

# Redis Configuration
REDIS_URL=
REDIS_PASSWORD=
REDIS_DB=0

# External API Configuration
WINGSTOP_API_URL=
WINGSTOP_API_KEY=

# Monitoring and Logging
SENTRY_DSN=
LOG_FILE=./logs/app.log
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s
LOG_MAX_SIZE=10485760
LOG_BACKUP_COUNT=5

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_BURST=100

# Session Configuration
SESSION_TIMEOUT_MINUTES=30
MAX_SESSIONS_PER_USER=5

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE=0 2 * * *
"@
        
        $envContent | Set-Content ".env"
        Write-Host "Generated new .env file!" -ForegroundColor Green
        Write-Host "Please review and customize the settings as needed." -ForegroundColor Yellow
        
    } catch {
        Write-Host "Error generating .env file: $_" -ForegroundColor Red
    }
}

function Show-ConfigurationInfo {
    Write-Host "Configuration Information:" -ForegroundColor Green
    
    try {
        $info = python -c "
from app.core.config import settings, config_manager
import json

info = {
    'environment': settings.ENVIRONMENT,
    'debug': settings.DEBUG,
    'database_url': settings.DATABASE_URL,
    'project_name': settings.PROJECT_NAME,
    'version': settings.VERSION,
    'api_prefix': settings.API_V1_STR,
    'log_level': settings.LOG_LEVEL,
    'upload_dir': settings.UPLOAD_DIR,
    'log_file': settings.LOG_FILE,
    'cors_origins': settings.ALLOWED_ORIGINS,
    'rate_limiting': settings.RATE_LIMIT_PER_MINUTE,
    'session_timeout': settings.SESSION_TIMEOUT_MINUTES,
    'backup_enabled': settings.BACKUP_ENABLED
}

print(json.dumps(info, indent=2))
"
        
        $configData = $info | ConvertFrom-Json
        
        Write-Host "Application Configuration:" -ForegroundColor Yellow
        Write-Host "  Project: $($configData.project_name)" -ForegroundColor Cyan
        Write-Host "  Version: $($configData.version)" -ForegroundColor Cyan
        Write-Host "  Environment: $($configData.environment)" -ForegroundColor Cyan
        Write-Host "  Debug Mode: $($configData.debug)" -ForegroundColor $(if ($configData.debug) { "Green" } else { "Red" })
        Write-Host "  API Prefix: $($configData.api_prefix)" -ForegroundColor Cyan
        Write-Host "  Log Level: $($configData.log_level)" -ForegroundColor Cyan
        
        Write-Host ""
        Write-Host "Database Configuration:" -ForegroundColor Yellow
        Write-Host "  URL: $($configData.database_url)" -ForegroundColor Cyan
        
        Write-Host ""
        Write-Host "Security Configuration:" -ForegroundColor Yellow
        Write-Host "  Rate Limiting: $($configData.rate_limiting) requests/minute" -ForegroundColor Cyan
        Write-Host "  Session Timeout: $($configData.session_timeout) minutes" -ForegroundColor Cyan
        
        Write-Host ""
        Write-Host "File Configuration:" -ForegroundColor Yellow
        Write-Host "  Upload Directory: $($configData.upload_dir)" -ForegroundColor Cyan
        Write-Host "  Log File: $($configData.log_file)" -ForegroundColor Cyan
        
        Write-Host ""
        Write-Host "Backup Configuration:" -ForegroundColor Yellow
        Write-Host "  Backup Enabled: $($configData.backup_enabled)" -ForegroundColor $(if ($configData.backup_enabled) { "Green" } else { "Red" })
        
    } catch {
        Write-Host "Error getting configuration information: $_" -ForegroundColor Red
    }
}

# Main execution
switch ($Action) {
    "help" { Show-Help }
    "check" { Check-Configuration }
    "fix" { Fix-Configuration }
    "generate" { Generate-EnvFile }
    "info" { Show-ConfigurationInfo }
    default { Show-Help }
} 