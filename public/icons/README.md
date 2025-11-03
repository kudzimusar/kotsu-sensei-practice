# Icons Directory

This directory contains all PWA icons required for various platforms and purposes.

## Required Icon Sizes

### Standard Icons (purpose: "any")
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### Maskable Icons (purpose: "maskable")
- icon-maskable-192x192.png
- icon-maskable-512x512.png

Note: Maskable icons should have important content within the safe zone (center 80% of the image).

### Shortcut Icons
- shortcut-quiz.png (96x96)
- shortcut-planner.png (96x96)
- shortcut-signs.png (96x96)
- shortcut-tests.png (96x96)

### Other Icons
- file-handler.png (96x96)

## Design Guidelines

1. **Standard Icons**: Use your app logo with padding
2. **Maskable Icons**: Place logo in center 80% safe zone, fill entire canvas
3. **Shortcut Icons**: Use distinctive icons for each feature
4. **Background**: Use your brand color or transparent background

## Tools for Creating Icons

- [Maskable.app](https://maskable.app/) - Test and create maskable icons
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) - Generate all sizes automatically
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Generate comprehensive icon sets

## Testing

Test your icons using Chrome DevTools:
1. Open DevTools > Application > Manifest
2. Check all icon sizes render correctly
3. Test maskable icons in different shapes
