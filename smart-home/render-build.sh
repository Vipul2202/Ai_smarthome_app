#!/bin/bash
set -e

echo "🚀 Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist tsconfig.tsbuildinfo

# Build TypeScript
echo "🔨 Building TypeScript..."
npx tsc

echo "✅ Build completed successfully!"