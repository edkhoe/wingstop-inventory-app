# Wingstop Inventory App - Test Data Generator
# This script generates comprehensive test data for all implemented features

param(
    [string]$Environment = "development",  # development, staging, production
    [int]$NumUsers = 10,
    [int]$NumCategories = 8,
    [int]$NumItems = 50,
    [int]$NumCounts = 100,
    [string]$OutputFile = "test_data.json"
)

Write-Host "🐔 Wingstop Inventory App - Test Data Generator" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Users: $NumUsers" -ForegroundColor Cyan
Write-Host "Categories: $NumCategories" -ForegroundColor Cyan
Write-Host "Items: $NumItems" -ForegroundColor Cyan
Write-Host "Counts: $NumCounts" -ForegroundColor Cyan
Write-Host ""

# Test data templates
$testData = @{
    roles = @(
        @{id = 1; name = "Admin"; description = "System Administrator"; permissions = @("read", "write", "delete", "admin")},
        @{id = 2; name = "Manager"; description = "Store Manager"; permissions = @("read", "write", "delete")},
        @{id = 3; name = "Employee"; description = "Store Employee"; permissions = @("read", "write")},
        @{id = 4; name = "Viewer"; description = "Read-only Access"; permissions = @("read")}
    )
    
    locations = @(
        @{id = 1; name = "Downtown Wingstop"; address = "123 Main St"; city = "Austin"; state = "TX"; zip_code = "78701"; phone = "512-555-0101"},
        @{id = 2; name = "North Wingstop"; address = "456 North Ave"; city = "Austin"; state = "TX"; zip_code = "78702"; phone = "512-555-0102"},
        @{id = 3; name = "South Wingstop"; address = "789 South Blvd"; city = "Austin"; state = "TX"; zip_code = "78703"; phone = "512-555-0103"},
        @{id = 4; name = "East Wingstop"; address = "321 East Rd"; city = "Austin"; state = "TX"; zip_code = "78704"; phone = "512-555-0104"},
        @{id = 5; name = "West Wingstop"; address = "654 West St"; city = "Austin"; state = "TX"; zip_code = "78705"; phone = "512-555-0105"}
    )
    
    categories = @(
        @{id = 1; name = "Chicken"; description = "Chicken products and wings"; color = "#FF6B6B"},
        @{id = 2; name = "Sauces"; description = "Wing sauces and condiments"; color = "#4ECDC4"},
        @{id = 3; name = "Sides"; description = "Side dishes and accompaniments"; color = "#45B7D1"},
        @{id = 4; name = "Beverages"; description = "Drinks and beverages"; color = "#96CEB4"},
        @{id = 5; name = "Desserts"; description = "Sweet treats and desserts"; color = "#FFEAA7"},
        @{id = 6; name = "Supplies"; description = "Kitchen and cleaning supplies"; color = "#DDA0DD"},
        @{id = 7; name = "Packaging"; description = "Takeout and delivery packaging"; color = "#98D8C8"},
        @{id = 8; name = "Equipment"; description = "Kitchen equipment and tools"; color = "#F7DC6F"}
    )
    
    vendors = @(
        "Sysco Foods",
        "US Foods",
        "Performance Food Group",
        "Gordon Food Service",
        "Reinhart Foodservice",
        "Ben E. Keith Foods",
        "Martin-Brower",
        "McLane Foodservice"
    )
    
    units = @("lbs", "pieces", "bottles", "boxes", "cases", "gallons", "pounds", "units")
}

# Generate users
Write-Host "👥 Generating users..." -ForegroundColor Yellow
$users = @()
for ($i = 1; $i -le $NumUsers; $i++) {
    $role = $testData.roles | Get-Random
    $location = $testData.locations | Get-Random
    
    $users += @{
        id = $i
        username = "user$i"
        email = "user$i@wingstop.com"
        first_name = "User"
        last_name = $i
        is_active = $true
        role_id = $role.id
        location_id = $location.id
        created_at = (Get-Date).AddDays(-$i).ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
}

# Generate inventory items
Write-Host "📦 Generating inventory items..." -ForegroundColor Yellow
$inventoryItems = @()
for ($i = 1; $i -le $NumItems; $i++) {
    $category = $testData.categories | Get-Random
    $vendor = $testData.vendors | Get-Random
    $unit = $testData.units | Get-Random
    
    $inventoryItems += @{
        id = $i
        name = "Item $i"
        category_id = $category.id
        unit = $unit
        par_level = (Get-Random -Minimum 10 -Maximum 100)
        reorder_increment = (Get-Random -Minimum 5 -Maximum 50)
        vendor = $vendor
        sku = "SKU-$i"
        created_at = (Get-Date).AddDays(-$i).ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
}

# Generate counts
Write-Host "📊 Generating counts..." -ForegroundColor Yellow
$counts = @()
for ($i = 1; $i -le $NumCounts; $i++) {
    $user = $users | Get-Random
    $item = $inventoryItems | Get-Random
    $countDate = (Get-Date).AddDays(-(Get-Random -Minimum 1 -Maximum 30))
    
    $counts += @{
        id = $i
        user_id = $user.id
        inventory_item_id = $item.id
        quantity = [math]::Round((Get-Random -Minimum 0 -Maximum 200), 2)
        count_date = $countDate.ToString("yyyy-MM-dd")
        notes = "Count entry $i"
        created_at = $countDate.ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
}

# Generate transfers
Write-Host "🚚 Generating transfers..." -ForegroundColor Yellow
$transfers = @()
for ($i = 1; $i -le 20; $i++) {
    $fromLocation = $testData.locations | Get-Random
    $toLocation = $testData.locations | Get-Random
    $item = $inventoryItems | Get-Random
    $transferDate = (Get-Date).AddDays(-(Get-Random -Minimum 1 -Maximum 14))
    
    $transfers += @{
        id = $i
        from_location_id = $fromLocation.id
        to_location_id = $toLocation.id
        inventory_item_id = $item.id
        quantity = [math]::Round((Get-Random -Minimum 1 -Maximum 50), 2)
        transfer_date = $transferDate.ToString("yyyy-MM-dd")
        status = @("pending", "in_transit", "completed", "cancelled") | Get-Random
        notes = "Transfer $i"
        created_at = $transferDate.ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
}

# Generate schedules
Write-Host "📅 Generating schedules..." -ForegroundColor Yellow
$schedules = @()
for ($i = 1; $i -le 15; $i++) {
    $user = $users | Get-Random
    $startTime = (Get-Date).AddDays($i).AddHours(9)
    $endTime = $startTime.AddHours(8)
    
    $schedules += @{
        id = $i
        user_id = $user.id
        title = "Schedule $i"
        description = "Work schedule for user $($user.id)"
        start_time = $startTime.ToString("yyyy-MM-ddTHH:mm:ssZ")
        end_time = $endTime.ToString("yyyy-MM-ddTHH:mm:ssZ")
        is_recurring = $false
        recurrence_pattern = $null
        created_at = (Get-Date).AddDays(-$i).ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
}

# Combine all data
$completeTestData = @{
    metadata = @{
        generated_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        environment = $Environment
        counts = @{
            users = $users.Count
            categories = $testData.categories.Count
            inventory_items = $inventoryItems.Count
            counts = $counts.Count
            transfers = $transfers.Count
            schedules = $schedules.Count
        }
    }
    roles = $testData.roles
    locations = $testData.locations
    categories = $testData.categories
    users = $users
    inventory_items = $inventoryItems
    counts = $counts
    transfers = $transfers
    schedules = $schedules
}

# Save to file
Write-Host "💾 Saving test data to $OutputFile..." -ForegroundColor Yellow
$completeTestData | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Host "✅ Test data generated successfully!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  - Roles: $($testData.roles.Count)" -ForegroundColor White
Write-Host "  - Locations: $($testData.locations.Count)" -ForegroundColor White
Write-Host "  - Categories: $($testData.categories.Count)" -ForegroundColor White
Write-Host "  - Users: $($users.Count)" -ForegroundColor White
Write-Host "  - Inventory Items: $($inventoryItems.Count)" -ForegroundColor White
Write-Host "  - Counts: $($counts.Count)" -ForegroundColor White
Write-Host "  - Transfers: $($transfers.Count)" -ForegroundColor White
Write-Host "  - Schedules: $($schedules.Count)" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Usage Instructions:" -ForegroundColor Cyan
Write-Host "1. Use this data for manual testing" -ForegroundColor White
Write-Host "2. Import into your test database" -ForegroundColor White
Write-Host "3. Use for API testing with tools like Postman" -ForegroundColor White
Write-Host "4. Reference for frontend development" -ForegroundColor White

Write-Host ""
Write-Host "🐔 Test data generation complete!" -ForegroundColor Green 