# Force Deploy Script for Vercel
# This script creates a dummy commit to force Vercel to deploy the latest changes

Write-Host "🚀 Forcing Vercel deployment..." -ForegroundColor Green

# Get current commit info
$CURRENT_COMMIT = git rev-parse HEAD | Select-Object -First 1
$CURRENT_DATE = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$CURRENT_BRANCH = git branch --show-current | Select-Object -First 1

Write-Host "📋 Current Info:" -ForegroundColor Yellow
Write-Host "   Commit: $CURRENT_COMMIT" -ForegroundColor Cyan
Write-Host "   Branch: $CURRENT_BRANCH" -ForegroundColor Cyan
Write-Host "   Date: $CURRENT_DATE" -ForegroundColor Cyan

# Stage the deployment trigger file
Write-Host "📁 Staging .vercel-deploy file..." -ForegroundColor Yellow
git add .vercel-deploy

# Check git status
Write-Host "📊 Git status:" -ForegroundColor Yellow
git status --short

# Create commit
Write-Host "💾 Creating force deployment commit..." -ForegroundColor Yellow
$COMMIT_MESSAGE = "deploy: force Vercel to pull latest changes with Playwright fix

🔧 Trigger deployment for commit: $($CURRENT_COMMIT.Substring(0,8))
📅 Deployment requested: $CURRENT_DATE
🎯 Purpose: Sync Vercel with latest GitHub commit containing:
  ✅ Playwright dependency fix for Vercel serverless
  ✅ Conditional postinstall script
  ✅ Vercel.json configuration
  ✅ Environment variable setup

This commit forces Vercel to recognize and deploy the latest changes."

git commit -m $COMMIT_MESSAGE

# Push changes
Write-Host "🚀 Pushing to trigger Vercel deployment..." -ForegroundColor Yellow
git push origin $CURRENT_BRANCH

Write-Host ""
Write-Host "✅ Force deployment completed!" -ForegroundColor Green
Write-Host "🔗 Check Vercel dashboard for deployment progress" -ForegroundColor Cyan
Write-Host "📊 Expected deployment time: 2-5 minutes" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Check Vercel dashboard for new deployment" -ForegroundColor White
Write-Host "2. Verify it's using the latest commit hash" -ForegroundColor White
Write-Host "3. Monitor build logs for successful Playwright fix" -ForegroundColor White
Write-Host "4. Test deployed application functionality" -ForegroundColor White
