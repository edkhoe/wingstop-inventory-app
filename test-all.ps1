# Wingstop Inventory App - Comprehensive Test Runner
# This script tests all implemented functionality from different perspectives

param(
    [string]$TestMode = "all",  # all, backend, frontend, api, ui, e2e
    [string]$Environment = "development",  # development, staging, production
    [string]$Coverage = "false",  # true/false
    [string]$Verbose = "false",   # true/false
    [string]$Browser = "chrome"   # chrome, firefox, edge
)

Write-Host "🐔 Wingstop Inventory App - Comprehensive Test Suite" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "Test Mode: $TestMode" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Coverage: $Coverage" -ForegroundColor Cyan
Write-Host "Verbose: $Verbose" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to run a command and handle errors
function Invoke-TestCommand($command, $description) {
    Write-Host "🔄 $description..." -ForegroundColor Yellow
    try {
        Invoke-Expression $command
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $description completed successfully" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $description failed with exit code $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $description failed: $_" -ForegroundColor Red
        return $false
    }
}

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

$prerequisites = @{
    "Python" = Test-Command "python"
    "Node.js" = Test-Command "node"
    "npm" = Test-Command "npm"
    "Git" = Test-Command "git"
}

foreach ($prereq in $prerequisites.GetEnumerator()) {
    if ($prereq.Value) {
        Write-Host "✅ $($prereq.Key) is available" -ForegroundColor Green
    } else {
        Write-Host "❌ $($prereq.Key) is not available" -ForegroundColor Red
    }
}

# Check if we're in the project root
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Set environment variables
$env:ENVIRONMENT = $Environment
$env:VITE_ENVIRONMENT = $Environment

# Test results tracking
$testResults = @{
    "Backend Tests" = $false
    "Frontend Tests" = $false
    "API Tests" = $false
    "UI Tests" = $false
    "E2E Tests" = $false
}

# 1. Backend Testing
if ($TestMode -eq "all" -or $TestMode -eq "backend" -or $TestMode -eq "api") {
    Write-Host ""
    Write-Host "🧪 Running Backend Tests" -ForegroundColor Blue
    Write-Host "=========================" -ForegroundColor Blue
    
    # Check if backend tests exist
    if (Test-Path "backend/tests") {
        $backendTestCommand = "cd backend; .\run_tests.ps1"
        if ($Coverage -eq "true") {
            $backendTestCommand += " -Coverage true"
        }
        if ($Verbose -eq "true") {
            $backendTestCommand += " -Verbose true"
        }
        
        $testResults["Backend Tests"] = Invoke-TestCommand $backendTestCommand "Backend tests"
    } else {
        Write-Host "⚠️ Backend tests directory not found" -ForegroundColor Yellow
    }
    
    # Manual API testing
    Write-Host ""
    Write-Host "🔌 Testing API Endpoints" -ForegroundColor Blue
    Write-Host "=======================" -ForegroundColor Blue
    
    # Start backend server in background
    Write-Host "🚀 Starting backend server..." -ForegroundColor Yellow
    $backendProcess = Start-Process -FilePath "python" -ArgumentList "main.py" -WorkingDirectory "backend" -PassThru -WindowStyle Hidden
    
    # Wait for server to start
    Start-Sleep -Seconds 5
    
    # Test basic endpoints
    $apiTests = @(
        @{Url = "http://localhost:8000/health"; Description = "Health check"}
        @{Url = "http://localhost:8000/"; Description = "Root endpoint"}
        @{Url = "http://localhost:8000/docs"; Description = "API documentation"}
    )
    
    foreach ($test in $apiTests) {
        try {
            $response = Invoke-RestMethod -Uri $test.Url -Method Get -TimeoutSec 10
            Write-Host "✅ $($test.Description): OK" -ForegroundColor Green
        } catch {
            Write-Host "❌ $($test.Description): Failed" -ForegroundColor Red
        }
    }
    
    # Stop backend server
    if ($backendProcess) {
        Stop-Process -Id $backendProcess.Id -Force
    }
}

# 2. Frontend Testing
if ($TestMode -eq "all" -or $TestMode -eq "frontend" -or $TestMode -eq "ui") {
    Write-Host ""
    Write-Host "🎨 Running Frontend Tests" -ForegroundColor Blue
    Write-Host "=========================" -ForegroundColor Blue
    
    # Check if frontend tests exist
    if (Test-Path "frontend/src/tests") {
        $frontendTestCommand = "cd frontend; npm test"
        if ($Coverage -eq "true") {
            $frontendTestCommand = "cd frontend; npm run test:coverage"
        }
        
        $testResults["Frontend Tests"] = Invoke-TestCommand $frontendTestCommand "Frontend tests"
    } else {
        Write-Host "⚠️ Frontend tests directory not found" -ForegroundColor Yellow
    }
    
    # Manual UI testing
    Write-Host ""
    Write-Host "🖥️ Testing UI Components" -ForegroundColor Blue
    Write-Host "=======================" -ForegroundColor Blue
    
    # Start frontend server in background
    Write-Host "🚀 Starting frontend server..." -ForegroundColor Yellow
    $frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "frontend" -PassThru -WindowStyle Hidden
    
    # Wait for server to start
    Start-Sleep -Seconds 10
    
    # Test frontend accessibility
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5173" -Method Get -TimeoutSec 10
        Write-Host "✅ Frontend server: Accessible" -ForegroundColor Green
    } catch {
        Write-Host "❌ Frontend server: Not accessible" -ForegroundColor Red
    }
    
    # Stop frontend server
    if ($frontendProcess) {
        Stop-Process -Id $frontendProcess.Id -Force
    }
}

# 3. End-to-End Testing
if ($TestMode -eq "all" -or $TestMode -eq "e2e") {
    Write-Host ""
    Write-Host "🔗 Running End-to-End Tests" -ForegroundColor Blue
    Write-Host "===========================" -ForegroundColor Blue
    
    # Manual E2E testing checklist
    Write-Host "📋 E2E Testing Checklist:" -ForegroundColor Yellow
    $e2eTests = @(
        "Start both backend and frontend servers",
        "Navigate to http://localhost:5173",
        "Test responsive design on different screen sizes",
        "Test all navigation links",
        "Test form submissions",
        "Test API integration",
        "Test error handling",
        "Test loading states"
    )
    
    foreach ($test in $e2eTests) {
        Write-Host "  ⬜ $test" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "💡 Manual E2E Testing Instructions:" -ForegroundColor Cyan
    Write-Host "1. Run: cd backend && python main.py" -ForegroundColor White
    Write-Host "2. Run: cd frontend && npm run dev" -ForegroundColor White
    Write-Host "3. Open http://localhost:5173 in your browser" -ForegroundColor White
    Write-Host "4. Test all functionality manually" -ForegroundColor White
    Write-Host "5. Test on different devices/browsers" -ForegroundColor White
}

# 4. Performance Testing
if ($TestMode -eq "all" -or $TestMode -eq "performance") {
    Write-Host ""
    Write-Host "⚡ Running Performance Tests" -ForegroundColor Blue
    Write-Host "===========================" -ForegroundColor Blue
    
    # Test backend performance
    Write-Host "🔧 Backend Performance Tests:" -ForegroundColor Yellow
    
    # Start backend server
    $backendProcess = Start-Process -FilePath "python" -ArgumentList "main.py" -WorkingDirectory "backend" -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 5
    
    # Test API response times
    $endpoints = @(
        "http://localhost:8000/health",
        "http://localhost:8000/api/v1/users/",
        "http://localhost:8000/api/v1/categories/",
        "http://localhost:8000/api/v1/inventory-items/"
    )
    
    foreach ($endpoint in $endpoints) {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        try {
            $response = Invoke-RestMethod -Uri $endpoint -Method Get -TimeoutSec 10
            $stopwatch.Stop()
            $responseTime = $stopwatch.ElapsedMilliseconds
            Write-Host ("  ✅ {0}: {1}ms" -f $endpoint, $responseTime) -ForegroundColor Green
        } catch {
            Write-Host ("  ❌ {0}: Failed" -f $endpoint) -ForegroundColor Red
        }
    }
    
    # Stop backend server
    if ($backendProcess) {
        Stop-Process -Id $backendProcess.Id -Force
    }
}

# 5. Security Testing
if ($TestMode -eq "all" -or $TestMode -eq "security") {
    Write-Host ""
    Write-Host "🔒 Running Security Tests" -ForegroundColor Blue
    Write-Host "=========================" -ForegroundColor Blue
    
    Write-Host "🔍 Security Checklist:" -ForegroundColor Yellow
    $securityTests = @(
        "Check for CORS configuration",
        "Verify input validation",
        "Test SQL injection prevention",
        "Check for XSS vulnerabilities",
        "Verify authentication requirements",
        "Test rate limiting",
        "Check security headers"
    )
    
    foreach ($test in $securityTests) {
        Write-Host "  ⬜ $test" -ForegroundColor Gray
    }
}

# 6. Accessibility Testing
if ($TestMode -eq "all" -or $TestMode -eq "accessibility") {
    Write-Host ""
    Write-Host "♿ Running Accessibility Tests" -ForegroundColor Blue
    Write-Host "=============================" -ForegroundColor Blue
    
    Write-Host "🔍 Accessibility Checklist:" -ForegroundColor Yellow
    $accessibilityTests = @(
        "Check keyboard navigation",
        "Verify screen reader compatibility",
        "Test color contrast ratios",
        "Check alt text for images",
        "Verify focus indicators",
        "Test ARIA labels",
        "Check semantic HTML structure"
    )
    
    foreach ($test in $accessibilityTests) {
        Write-Host "  ⬜ $test" -ForegroundColor Gray
    }
}

# Summary
Write-Host ""
Write-Host "📊 Test Results Summary" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green

$passedTests = 0
$totalTests = $testResults.Count

foreach ($result in $testResults.GetEnumerator()) {
    if ($result.Value) {
        Write-Host "✅ $($result.Key): PASSED" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "❌ $($result.Key): FAILED" -ForegroundColor Red
    }
}

Write-Host ""
            $color = if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" }
            Write-Host "Overall Result: $passedTests/$totalTests tests passed" -ForegroundColor $color

# Recommendations
Write-Host ""
Write-Host "💡 Recommendations:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

if ($passedTests -lt $totalTests) {
    Write-Host "🔧 Fix failing tests before proceeding" -ForegroundColor Yellow
    Write-Host "📝 Review test logs for specific issues" -ForegroundColor Yellow
    Write-Host "🔄 Re-run specific test categories" -ForegroundColor Yellow
} else {
    Write-Host "🎉 All tests passed! Ready for production." -ForegroundColor Green
    Write-Host "📈 Consider adding more test coverage" -ForegroundColor Cyan
    Write-Host "🚀 Ready to implement additional features" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host "1. Implement authentication system" -ForegroundColor White
Write-Host "2. Add offline functionality for counts" -ForegroundColor White
Write-Host "3. Implement scheduling system" -ForegroundColor White
Write-Host "4. Add forecasting and order suggestions" -ForegroundColor White
Write-Host "5. Implement multi-location features" -ForegroundColor White

Write-Host ""
Write-Host "🐔 Wingstop Inventory App - Test Suite Complete!" -ForegroundColor Green 