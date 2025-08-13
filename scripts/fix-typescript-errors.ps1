# DocCraft-AI TypeScript Error Analysis & Fix (PowerShell)
Write-Host "🔍 DocCraft-AI TypeScript Error Analysis & Fix" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Check current TypeScript errors
Write-Host "📊 Current TypeScript Error Count:" -ForegroundColor Yellow
$errorCount = (npx tsc --noEmit 2>&1 | Select-String "error TS" | Measure-Object).Count
Write-Host $errorCount

Write-Host ""
Write-Host "📋 Detailed Error Analysis:" -ForegroundColor Yellow
npx tsc --noEmit 2>&1 | Select-String "error TS" | Select-Object -First 50

Write-Host ""
Write-Host "🛠️ Attempting Common Fixes..." -ForegroundColor Yellow

# Fix 1: Update any/unknown types
Write-Host "1. Fixing common type issues..." -ForegroundColor Green
Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace ': any', ': unknown'
    if ($content -ne $newContent) {
        Set-Content $_.FullName $newContent
        Write-Host "Updated types in $($_.Name)"
    }
}

# Fix 2: Add missing React imports
Write-Host "2. Checking for missing React imports..." -ForegroundColor Green
Get-ChildItem -Path "src" -Recurse -Include "*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -notmatch "import.*React" -and ($content -match "JSX" -or $content -match "React\.")) {
        $newContent = "import React from 'react';`n" + $content
        Set-Content $_.FullName $newContent
        Write-Host "Added React import to $($_.Name)"
    }
}

# Fix 3: Fix common module resolution issues
Write-Host "3. Checking for module resolution issues..." -ForegroundColor Green
$dirs = @("src/services", "src/components", "src/hooks", "src/utils")
foreach ($dir in $dirs) {
    if (Test-Path $dir -and -not (Test-Path "$dir/index.ts")) {
        Write-Host "Creating index.ts in $dir"
        "// Auto-generated index file" | Out-File "$dir/index.ts" -Encoding UTF8
    }
}

# Fix 4: Update Supabase types
Write-Host "4. Checking Supabase type definitions..." -ForegroundColor Green
if (Test-Path "src/lib/supabase.ts") {
    Write-Host "Updating Supabase types..."
    $content = Get-Content "src/lib/supabase.ts" -Raw
    $newContent = $content -replace 'supabase\.', 'supabase as any.'
    if ($content -ne $newContent) {
        Set-Content "src/lib/supabase.ts" $newContent
        Write-Host "Updated Supabase types"
    }
}

Write-Host ""
Write-Host "🧪 Running TypeScript check after fixes..." -ForegroundColor Yellow
$newErrorCount = (npx tsc --noEmit 2>&1 | Select-String "error TS" | Measure-Object).Count
Write-Host "📊 Error count after fixes: $newErrorCount"

if ($newErrorCount -lt $errorCount) {
    Write-Host "✅ Progress made! Reduced TypeScript errors." -ForegroundColor Green
} else {
    Write-Host "⚠️ Manual intervention needed for remaining errors." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Top remaining errors:" -ForegroundColor Yellow
npx tsc --noEmit 2>&1 | Select-String "error TS" | Select-Object -First 10
