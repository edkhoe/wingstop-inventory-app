# Wingstop Inventory App Environment Setup Script
param(
    [string]$Environment = "development",
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$All
)

Write-Host "Wingstop Inventory App Environment Setup" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan

function Setup-Backend-Environment {
    Write-Host "Setting up backend environment..." -ForegroundColor Yellow
    
    $backendEnvPath = "backend\.env"
    $backendEnvExample = "backend\env.example"
    
    if (Test-Path $backendEnvExample) {
        if (-not (Test-Path $backendEnvPath)) {
            Copy-Item $backendEnvExample $backendEnvPath
            Write-Host "Created backend .env file from template" -ForegroundColor Green
        } else {
            Write-Host "Backend .env file already exists" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Backend env.example not found!" -ForegroundColor Red
    }
    
    # Create logs directory
    $logsDir = "backend\logs"
    if (-not (Test-Path $logsDir)) {
        New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
        Write-Host "Created logs directory" -ForegroundColor Green
    }
    
    # Create uploads directory
    $uploadsDir = "backend\uploads"
    if (-not (Test-Path $uploadsDir)) {
        New-Item -ItemType Directory -Path $uploadsDir -Force | Out-Null
        Write-Host "Created uploads directory" -ForegroundColor Green
    }
}

function Setup-Frontend-Environment {
    Write-Host "Setting up frontend environment..." -ForegroundColor Yellow
    
    $frontendEnvPath = "frontend\.env"
    $frontendEnvExample = "frontend\env.example"
    
    if (Test-Path $frontendEnvExample) {
        if (-not (Test-Path $frontendEnvPath)) {
            Copy-Item $frontendEnvExample $frontendEnvPath
            Write-Host "Created frontend .env file from template" -ForegroundColor Green
        } else {
            Write-Host "Frontend .env file already exists" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Frontend env.example not found!" -ForegroundColor Red
    }
}

function Generate-Secret-Key {
    Write-Host "Generating secret key for backend..." -ForegroundColor Yellow
    
    $secretKey = -join ((33..126) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
    
    $backendEnvPath = "backend\.env"
    if (Test-Path $backendEnvPath) {
        $content = Get-Content $backendEnvPath
        $updatedContent = $content -replace "SECRET_KEY=.*", "SECRET_KEY=$secretKey"
        Set-Content $backendEnvPath $updatedContent
        Write-Host "Updated SECRET_KEY in backend .env" -ForegroundColor Green
    }
}

# Main execution
if ($Backend -or $All) {
    Setup-Backend-Environment
    Generate-Secret-Key
}

if ($Frontend -or $All) {
    Setup-Frontend-Environment
}

# Default: Setup both if no specific option
if (-not ($Backend -or $Frontend -or $All)) {
    Setup-Backend-Environment
    Setup-Frontend-Environment
    Generate-Secret-Key
}

Write-Host "Environment setup completed!" -ForegroundColor Green
Write-Host "Remember to review and customize the .env files for your specific needs." -ForegroundColor Yellow 