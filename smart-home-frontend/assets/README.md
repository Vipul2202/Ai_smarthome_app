# Assets Directory

This directory contains all the static assets for the Smart Home app.

## Required Assets

You need to add the following assets to this directory:

### App Icons
- `icon.png` - 1024x1024px app icon
- `adaptive-icon.png` - 1024x1024px adaptive icon (Android)
- `favicon.png` - 32x32px favicon for web

### Splash Screen
- `splash.png` - 1284x2778px splash screen image

### Notifications
- `notification-icon.png` - 96x96px notification icon

## Asset Guidelines

### App Icon (`icon.png`)
- Size: 1024x1024px
- Format: PNG with transparency
- Design: Should work well on both light and dark backgrounds
- Content: Use the 🏠 emoji or create a custom home icon
- Colors: Primary blue (#3B82F6) with white background

### Adaptive Icon (`adaptive-icon.png`)
- Size: 1024x1024px
- Format: PNG with transparency
- Design: Icon should fit within the safe area (center 768x768px)
- Background: Will be masked with various shapes on Android

### Splash Screen (`splash.png`)
- Size: 1284x2778px (iPhone 12 Pro Max resolution)
- Format: PNG
- Background: Gradient from #3B82F6 to #1E40AF
- Content: App logo/icon centered
- Text: "Smart Home" title below the icon

### Notification Icon (`notification-icon.png`)
- Size: 96x96px
- Format: PNG with transparency
- Design: Simple, monochrome version of the app icon
- Colors: White icon on transparent background

## Creating Assets

You can create these assets using:
- Design tools: Figma, Sketch, Adobe Illustrator
- Online generators: App icon generators, splash screen generators
- AI tools: Generate icons and graphics
- Icon libraries: Use existing home/house icons as base

## Temporary Solution

For development, you can use placeholder assets or emoji-based icons until proper assets are created.

Example icon using emoji:
- Create a 1024x1024px image with 🏠 emoji centered
- Use blue background (#3B82F6) with white emoji
- Export as PNG for all required sizes