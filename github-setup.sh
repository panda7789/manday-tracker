#!/bin/bash

# Quick GitHub setup script
# Usage: ./github-setup.sh YOUR_GITHUB_USERNAME

if [ -z "$1" ]; then
    echo "Usage: ./github-setup.sh YOUR_GITHUB_USERNAME"
    echo "Example: ./github-setup.sh johnsmith"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="manday-tracker"

echo "Setting up GitHub repository for $GITHUB_USERNAME/$REPO_NAME"
echo ""

# Update package.json with correct GitHub username
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/VASE_GITHUB_USERNAME/$GITHUB_USERNAME/g" package.json
else
    # Linux
    sed -i "s/VASE_GITHUB_USERNAME/$GITHUB_USERNAME/g" package.json
fi

echo "✓ Updated package.json"

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    echo "✓ Initialized git repository"
else
    echo "✓ Git repository already initialized"
fi

# Add all files
git add .
echo "✓ Added all files"

# Create initial commit
git commit -m "Initial commit: Manday tracker CLI utility"
echo "✓ Created initial commit"

# Add remote
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git" 2>/dev/null || \
git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo "✓ Added remote origin"

# Set main branch
git branch -M main
echo "✓ Set main branch"

echo ""
echo "================================================"
echo "Setup complete! Next steps:"
echo "================================================"
echo ""
echo "1. Create repository on GitHub:"
echo "   https://github.com/new"
echo "   Name: $REPO_NAME"
echo "   (Do NOT initialize with README)"
echo ""
echo "2. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "3. View your repository:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
