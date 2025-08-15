@echo off
echo 🚀 Forcing Vercel deployment...

REM Get current commit info (first 8 characters)
for /f "tokens=*" %%i in ('git rev-parse HEAD') do set CURRENT_COMMIT=%%i
set CURRENT_COMMIT_SHORT=%CURRENT_COMMIT:~0,8%

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i

echo 📋 Current Info:
echo    Commit: %CURRENT_COMMIT_SHORT%
echo    Branch: %CURRENT_BRANCH%
echo    Date: %date% %time%

REM Stage the deployment trigger file
echo 📁 Staging .vercel-deploy file...
git add .vercel-deploy

REM Check git status
echo 📊 Git status:
git status --short

REM Create commit
echo 💾 Creating force deployment commit...
git commit -m "deploy: force Vercel to pull latest changes with Playwright fix

🔧 Trigger deployment for commit: %CURRENT_COMMIT_SHORT%
📅 Deployment requested: %date% %time%
🎯 Purpose: Sync Vercel with latest GitHub commit containing:
  ✅ Playwright dependency fix for Vercel serverless
  ✅ Conditional postinstall script
  ✅ Vercel.json configuration
  ✅ Environment variable setup

This commit forces Vercel to recognize and deploy the latest changes."

REM Push changes
echo 🚀 Pushing to trigger Vercel deployment...
git push origin %CURRENT_BRANCH%

echo.
echo ✅ Force deployment completed!
echo 🔗 Check Vercel dashboard for deployment progress
echo 📊 Expected deployment time: 2-5 minutes
echo.
echo 🎯 NEXT STEPS:
echo 1. Check Vercel dashboard for new deployment
echo 2. Verify it's using the latest commit hash
echo 3. Monitor build logs for successful Playwright fix
echo 4. Test deployed application functionality

pause
