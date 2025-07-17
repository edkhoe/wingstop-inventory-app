# Security Management Script for Wingstop Inventory App
# This script provides utilities for testing and managing security features

param(
    [string]$Action = "help",
    [string]$Username = "",
    [string]$Password = "",
    [string]$Token = "",
    [string]$OutputFile = "security_test_results.json"
)

# Import required modules
$ErrorActionPreference = "Stop"

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Show-Help {
    Write-ColorOutput "=== Wingstop Inventory App - Security Management ===" $Cyan
    Write-ColorOutput ""
    Write-ColorOutput "Usage: .\manage_security.ps1 -Action <action> [options]" $Yellow
    Write-ColorOutput ""
    Write-ColorOutput "Actions:" $Yellow
    Write-ColorOutput "  test-auth     - Test authentication endpoints" $Green
    Write-ColorOutput "  generate-token - Generate a test JWT token" $Green
    Write-ColorOutput "  verify-token  - Verify a JWT token" $Green
    Write-ColorOutput "  test-cors     - Test CORS configuration" $Green
    Write-ColorOutput "  test-headers  - Test security headers" $Green
    Write-ColorOutput "  test-rate-limit - Test rate limiting" $Green
    Write-ColorOutput "  validate-password - Validate password strength" $Green
    Write-ColorOutput "  generate-key  - Generate secure API key" $Green
    Write-ColorOutput "  security-scan - Run comprehensive security scan" $Green
    Write-ColorOutput "  help          - Show this help message" $Green
    Write-ColorOutput ""
    Write-ColorOutput "Examples:" $Yellow
    Write-ColorOutput "  .\manage_security.ps1 -Action test-auth" $Green
    Write-ColorOutput "  .\manage_security.ps1 -Action generate-token -Username testuser" $Green
    Write-ColorOutput "  .\manage_security.ps1 -Action verify-token -Token <jwt_token>" $Green
    Write-ColorOutput "  .\manage_security.ps1 -Action validate-password -Password MyPassword123!" $Green
}

function Test-Authentication {
    Write-ColorOutput "Testing authentication endpoints..." $Cyan
    
    $baseUrl = "http://localhost:8000"
    $results = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        tests = @()
    }
    
    # Test 1: Health endpoint (should work without auth)
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -TimeoutSec 10
        $results.tests += @{
            name = "Health endpoint"
            status = "PASS"
            details = "Health endpoint accessible without authentication"
        }
        Write-ColorOutput "✓ Health endpoint accessible" $Green
    }
    catch {
        $results.tests += @{
            name = "Health endpoint"
            status = "FAIL"
            details = $_.Exception.Message
        }
        Write-ColorOutput "✗ Health endpoint failed: $($_.Exception.Message)" $Red
    }
    
    # Test 2: Protected endpoint without auth (should fail)
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/users" -Method GET -TimeoutSec 10
        $results.tests += @{
            name = "Protected endpoint without auth"
            status = "FAIL"
            details = "Endpoint should require authentication"
        }
        Write-ColorOutput "✗ Protected endpoint accessible without auth (should fail)" $Red
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            $results.tests += @{
                name = "Protected endpoint without auth"
                status = "PASS"
                details = "Correctly requires authentication"
            }
            Write-ColorOutput "✓ Protected endpoint correctly requires authentication" $Green
        }
        else {
            $results.tests += @{
                name = "Protected endpoint without auth"
                status = "FAIL"
                details = "Unexpected error: $($_.Exception.Message)"
            }
            Write-ColorOutput "✗ Unexpected error: $($_.Exception.Message)" $Red
        }
    }
    
    # Test 3: Invalid token
    try {
        $headers = @{
            "Authorization" = "Bearer invalid_token_here"
        }
        $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/users" -Method GET -Headers $headers -TimeoutSec 10
        $results.tests += @{
            name = "Invalid token"
            status = "FAIL"
            details = "Should reject invalid token"
        }
        Write-ColorOutput "✗ Invalid token accepted (should fail)" $Red
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            $results.tests += @{
                name = "Invalid token"
                status = "PASS"
                details = "Correctly rejects invalid token"
            }
            Write-ColorOutput "✓ Invalid token correctly rejected" $Green
        }
        else {
            $results.tests += @{
                name = "Invalid token"
                status = "FAIL"
                details = "Unexpected error: $($_.Exception.Message)"
            }
            Write-ColorOutput "✗ Unexpected error: $($_.Exception.Message)" $Red
        }
    }
    
    return $results
}

function Test-CORS {
    Write-ColorOutput "Testing CORS configuration..." $Cyan
    
    $baseUrl = "http://localhost:8000"
    $results = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        tests = @()
    }
    
    # Test CORS preflight request
    try {
        $headers = @{
            "Origin" = "http://localhost:3000"
            "Access-Control-Request-Method" = "GET"
            "Access-Control-Request-Headers" = "Content-Type,Authorization"
        }
        
        $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method OPTIONS -Headers $headers -TimeoutSec 10
        
        $corsHeaders = @{
            "Access-Control-Allow-Origin" = $response.Headers["Access-Control-Allow-Origin"]
            "Access-Control-Allow-Methods" = $response.Headers["Access-Control-Allow-Methods"]
            "Access-Control-Allow-Headers" = $response.Headers["Access-Control-Allow-Headers"]
        }
        
        $results.tests += @{
            name = "CORS preflight"
            status = "PASS"
            details = $corsHeaders
        }
        Write-ColorOutput "✓ CORS preflight request successful" $Green
        Write-ColorOutput "  Headers: $($corsHeaders | ConvertTo-Json)" $Yellow
    }
    catch {
        $results.tests += @{
            name = "CORS preflight"
            status = "FAIL"
            details = $_.Exception.Message
        }
        Write-ColorOutput "✗ CORS preflight failed: $($_.Exception.Message)" $Red
    }
    
    return $results
}

function Test-SecurityHeaders {
    Write-ColorOutput "Testing security headers..." $Cyan
    
    $baseUrl = "http://localhost:8000"
    $results = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        tests = @()
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -TimeoutSec 10
        
        $expectedHeaders = @(
            "X-Content-Type-Options",
            "X-Frame-Options", 
            "X-XSS-Protection",
            "Referrer-Policy",
            "Content-Security-Policy"
        )
        
        $foundHeaders = @{}
        foreach ($header in $expectedHeaders) {
            if ($response.Headers.ContainsKey($header)) {
                $foundHeaders[$header] = $response.Headers[$header]
            }
        }
        
        if ($foundHeaders.Count -eq $expectedHeaders.Count) {
            $results.tests += @{
                name = "Security headers"
                status = "PASS"
                details = $foundHeaders
            }
            Write-ColorOutput "✓ All security headers present" $Green
            Write-ColorOutput "  Headers: $($foundHeaders | ConvertTo-Json)" $Yellow
        }
        else {
            $results.tests += @{
                name = "Security headers"
                status = "FAIL"
                details = "Missing headers: $($expectedHeaders | Where-Object { $foundHeaders.Keys -notcontains $_ })"
            }
            Write-ColorOutput "✗ Missing security headers" $Red
        }
    }
    catch {
        $results.tests += @{
            name = "Security headers"
            status = "FAIL"
            details = $_.Exception.Message
        }
        Write-ColorOutput "✗ Security headers test failed: $($_.Exception.Message)" $Red
    }
    
    return $results
}

function Test-RateLimit {
    Write-ColorOutput "Testing rate limiting..." $Cyan
    
    $baseUrl = "http://localhost:8000"
    $results = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        tests = @()
    }
    
    # Make multiple rapid requests
    $successCount = 0
    $rateLimitCount = 0
    
    for ($i = 1; $i -le 20; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -TimeoutSec 5
            $successCount++
            Start-Sleep -Milliseconds 100
        }
        catch {
            if ($_.Exception.Response.StatusCode -eq 429) {
                $rateLimitCount++
                Write-ColorOutput "Rate limit hit after $i requests" $Yellow
                break
            }
            else {
                Write-ColorOutput "Request $i failed: $($_.Exception.Message)" $Red
            }
        }
    }
    
    if ($rateLimitCount -gt 0) {
        $results.tests += @{
            name = "Rate limiting"
            status = "PASS"
            details = "Rate limit triggered after $successCount requests"
        }
        Write-ColorOutput "✓ Rate limiting working correctly" $Green
    }
    else {
        $results.tests += @{
            name = "Rate limiting"
            status = "WARN"
            details = "No rate limit hit after $successCount requests"
        }
        Write-ColorOutput "⚠ Rate limiting may not be configured" $Yellow
    }
    
    return $results
}

function Test-PasswordStrength {
    param([string]$Password)
    
    Write-ColorOutput "Testing password strength..." $Cyan
    
    $results = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        password = $Password
        tests = @()
    }
    
    $errors = @()
    $score = 0
    
    # Length check
    if ($Password.Length -lt 8) {
        $errors += "Password must be at least 8 characters long"
    }
    else {
        $score++
    }
    
    # Uppercase check
    if ($Password -notmatch '[A-Z]') {
        $errors += "Password must contain at least one uppercase letter"
    }
    else {
        $score++
    }
    
    # Lowercase check
    if ($Password -notmatch '[a-z]') {
        $errors += "Password must contain at least one lowercase letter"
    }
    else {
        $score++
    }
    
    # Number check
    if ($Password -notmatch '\d') {
        $errors += "Password must contain at least one number"
    }
    else {
        $score++
    }
    
    # Special character check
    if ($Password -notmatch '[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]') {
        $errors += "Password must contain at least one special character"
    }
    else {
        $score++
    }
    
    $isValid = $errors.Count -eq 0
    
    $results.tests += @{
        name = "Password strength"
        status = if ($isValid) { "PASS" } else { "FAIL" }
        details = @{
            is_valid = $isValid
            errors = $errors
            strength_score = $score
            max_score = 5
        }
    }
    
    if ($isValid) {
        Write-ColorOutput "✓ Password meets strength requirements" $Green
    }
    else {
        Write-ColorOutput "✗ Password does not meet requirements:" $Red
        foreach ($err in $errors) {
            Write-ColorOutput "  - $err" $Red
        }
    }
    
    Write-ColorOutput "  Strength score: $score/5" $Yellow
    
    return $results
}

function Generate-SecureKey {
    Write-ColorOutput "Generating secure API key..." $Cyan
    
    $results = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        key_type = "API Key"
        tests = @()
    }
    
    # Generate a secure random key
    $bytes = New-Object Byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $apiKey = [Convert]::ToBase64String($bytes)
    
    $results.tests += @{
        name = "API Key generation"
        status = "PASS"
        details = @{
            key = $apiKey
            length = $apiKey.Length
            entropy = "High"
        }
    }
    
    Write-ColorOutput "✓ Secure API key generated" $Green
    Write-ColorOutput "  Key: $apiKey" $Yellow
    Write-ColorOutput "  Length: $($apiKey.Length) characters" $Yellow
    
    return $results
}

function Start-SecurityScan {
    Write-ColorOutput "Starting comprehensive security scan..." $Cyan
    
    $allResults = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        scan_type = "Comprehensive Security Scan"
        results = @()
    }
    
    # Run all security tests
    $allResults.results += Test-Authentication
    $allResults.results += Test-CORS
    $allResults.results += Test-SecurityHeaders
    $allResults.results += Test-RateLimit
    
    # Generate summary
    $totalTests = 0
    $passedTests = 0
    $failedTests = 0
    
    foreach ($result in $allResults.results) {
        foreach ($test in $result.tests) {
            $totalTests++
            if ($test.status -eq "PASS") {
                $passedTests++
            }
            elseif ($test.status -eq "FAIL") {
                $failedTests++
            }
        }
    }
    
    $allResults.summary = @{
        total_tests = $totalTests
        passed_tests = $passedTests
        failed_tests = $failedTests
        success_rate = [math]::Round(($passedTests / $totalTests) * 100, 2)
    }
    
    Write-ColorOutput ""
    Write-ColorOutput "=== Security Scan Summary ===" $Cyan
    Write-ColorOutput "Total Tests: $totalTests" $Yellow
    Write-ColorOutput "Passed: $passedTests" $Green
    Write-ColorOutput "Failed: $failedTests" $Red
    Write-ColorOutput "Success Rate: $($allResults.summary.success_rate)%" $Yellow
    
    return $allResults
}

# Main execution
try {
    # Check if server is running
    $serverRunning = $false
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 5
        $serverRunning = $true
    }
    catch {
        Write-ColorOutput "Warning: Backend server not running on localhost:8000" $Yellow
        Write-ColorOutput "Some tests may fail. Start the server with: uvicorn main:app --reload" $Yellow
    }
    
    $results = $null
    
    switch ($Action.ToLower()) {
        "test-auth" {
            $results = Test-Authentication
        }
        "test-cors" {
            $results = Test-CORS
        }
        "test-headers" {
            $results = Test-SecurityHeaders
        }
        "test-rate-limit" {
            $results = Test-RateLimit
        }
        "validate-password" {
            if (-not $Password) {
                Write-ColorOutput "Error: Password parameter required for validate-password action" $Red
                exit 1
            }
            $results = Test-PasswordStrength -Password $Password
        }
        "generate-key" {
            $results = Generate-SecureKey
        }
        "security-scan" {
            $results = Start-SecurityScan
        }
        "help" {
            Show-Help
            exit 0
        }
        default {
            Write-ColorOutput "Error: Unknown action '$Action'" $Red
            Show-Help
            exit 1
        }
    }
    
    # Save results to file
    if ($results) {
        $results | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding UTF8
        Write-ColorOutput "Results saved to: $OutputFile" $Green
    }
}
catch {
    Write-ColorOutput "Error: $($_.Exception.Message)" $Red
    exit 1
} 