# User App Feature Guide

## Features
- QR-based positioning and session management
- Animated route guidance (A* pathfinding, simulated)
- Responsive, accessible, modern UI/UX
- Route session state (active/completed)
- Sidebar navigation, logo color toggle

## Usage
1. **Sign in with Google**
2. **Scan a QR code** (simulated, supports URI or JSON)
3. **Active route** will be shown; follow the animated path
4. **Mark route complete** or **clear** session
5. **Responsive**: works on desktop and mobile

## Development
- Run locally: `npm run dev` in `apps/user-app`
- Build for production: `npm run build`
- Deploy: see project root README for Netlify/Vercel/Firebase steps

## Accessibility
- Keyboard navigation and focus states
- ARIA labels for interactive elements

## Next Steps
- Integrate real map/node data
- Connect to Firestore for live routes
- Add offline/PWA support
- Polish animations with GSAP/Lottie
