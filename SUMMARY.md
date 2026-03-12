# Matrix Calculator Project Summary

This project is a mobile-friendly Matrix and SLE (System of Linear Equations) Calculator built with React, TypeScript, and Vite, featuring PWA support.

## 1. Project Structure
- `src/logic/matrix.ts` - All mathematical logic.
- `src/App.tsx` - Main UI and state management.
- `src/App.css` - Mobile-first styling.
- `src/index.css` - Global resets.
- `vite.config.ts` - PWA and React configuration.
- `public/manifest.json` - PWA manifest.

## 2. Mathematical Logic (`src/logic/matrix.ts`)
Implemented functions:
- `addMatrices(a, b)` / `subtractMatrices(a, b)`
- `multiplyScalar(a, number)`
- `multiplyMatrices(a, b)`
- `transpose(a)`
- `getDeterminant(a)` (recursive with minors)
- `getRank(a)` (using Gaussian elimination)
- `solveByCramer(a, b)`
- `solveByMatrixMethod(a, b)` (using Adjugate matrix)
- `solveByGauss(a, b)` (Forward and Backward substitution)

## 3. PWA Configuration
### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Algebra Calculator',
        short_name: 'AlgemCalc',
        theme_color: '#2563eb',
        icons: [
          { src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      }
    })
  ],
})
```

## 4. UI/UX (Mobile First)
- **Responsive Grid:** Matrix inputs automatically adjust to the selected dimension (up to 10x10).
- **Mode Toggle:** Switch between "Matrix Operations" and "SLE Solving".
- **Visual Feedback:** Large touch-friendly buttons, clear error messages, and formatted results.

## 5. Re-creation Steps
1. `npm create vite@latest hits-algem-calculator -- --template react-ts`
2. `cd hits-algem-calculator`
3. `npm install`
4. `npm install vite-plugin-pwa --save-dev`
5. Copy the code from `src/logic/matrix.ts`, `src/App.tsx`, `src/App.css`, and `vite.config.ts`.
6. Ensure `public/manifest.json` exists and is linked in `index.html`.
