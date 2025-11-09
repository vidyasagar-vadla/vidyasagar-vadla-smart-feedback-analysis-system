#!/bin/bash

# =====================================================
# 🧭 Fresh Git Push Script
# Pushes entire project (with frontend visible)
# =====================================================

echo "🔹 Enter your GitHub repo URL (e.g., https://github.com/username/repo.git):"
read REPO_URL

echo "🔹 Starting clean setup..."
rm -rf .git

# Initialize Git
git init

# Create a minimal .gitignore that hides heavy stuff but keeps frontend visible
cat > .gitignore <<EOL
# === Node / Backend ===
node_modules/
npm-debug.log*
.env
.DS_Store

# === Frontend build files ===
frontend/node_modules/
frontend/build/
frontend/dist/

# === Logs ===
logs/
*.log
yarn-debug.log*
yarn-error.log*

# === System files ===
Thumbs.db
*.swp

# === Ignore temporary data ===
.cache/
.tmp/

# === Keep frontend tracked ===
!frontend/
!frontend/src/
!frontend/public/
!frontend/package.json
!frontend/tailwind.config.js
!frontend/postcss.config.js
!frontend/README.md
EOL

echo "✅ .gitignore created successfully"

# Add and commit all files
git add .
git commit -m "Initial commit for Smart Feedback Analysis System (frontend visible)"

# Connect remote repository
git remote add origin "$REPO_URL"
git branch -M main

# Push to GitHub
echo "🚀 Pushing project to GitHub..."
git push -u origin main

echo "✅ Push completed successfully!"
echo "🌐 Now check your repo: $REPO_URL"
echo "👉 The frontend folder and all source files should be visible on GitHub."
