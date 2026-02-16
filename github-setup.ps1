# Quick GitHub setup script for PowerShell
# Usage: .\github-setup.ps1 YOUR_GITHUB_USERNAME

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername
)

$RepoName = "manday-tracker"

Write-Host "Setting up GitHub repository for $GitHubUsername/$RepoName" -ForegroundColor Cyan
Write-Host ""

# Update package.json with correct GitHub username
$packageJson = Get-Content "package.json" -Raw
$packageJson = $packageJson -replace "VASE_GITHUB_USERNAME", $GitHubUsername
Set-Content "package.json" -Value $packageJson
Write-Host "✓ Updated package.json" -ForegroundColor Green

# Initialize git if not already done
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✓ Initialized git repository" -ForegroundColor Green
} else {
    Write-Host "✓ Git repository already initialized" -ForegroundColor Green
}

# Add all files
git add .
Write-Host "✓ Added all files" -ForegroundColor Green

# Create initial commit
git commit -m "Initial commit: Manday tracker CLI utility"
Write-Host "✓ Created initial commit" -ForegroundColor Green

# Add remote
try {
    git remote add origin "https://github.com/$GitHubUsername/$RepoName.git" 2>$null
} catch {
    git remote set-url origin "https://github.com/$GitHubUsername/$RepoName.git"
}
Write-Host "✓ Added remote origin" -ForegroundColor Green

# Set main branch
git branch -M main
Write-Host "✓ Set main branch" -ForegroundColor Green

Write-Host ""
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "Setup complete! Next steps:" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Create repository on GitHub:"
Write-Host "   https://github.com/new"
Write-Host "   Name: $RepoName"
Write-Host "   (Do NOT initialize with README)"
Write-Host ""
Write-Host "2. Push to GitHub:"
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. View your repository:"
Write-Host "   https://github.com/$GitHubUsername/$RepoName"
Write-Host ""
