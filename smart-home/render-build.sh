#!/bin/bash
set -e

echo "🚀 Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Generate Prisma client first
echo "🔧 Generating Prisma client..."
npx prisma generate

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist tsconfig.tsbuildinfo

# Create dist directory
mkdir -p dist

# Build TypeScript with verbose output
echo "🔨 Building TypeScript..."
npx tsc --verbose

# Check if server.js was created
if [ -f "dist/server.js" ]; then
    echo "✅ dist/server.js created successfully!"
else
    echo "❌ dist/server.js not found, checking TypeScript compilation..."
    ls -la dist/ || echo "dist directory is empty"
    exit 1
fi

echo "✅ Build completed successfully!"