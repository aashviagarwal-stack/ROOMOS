# ROOM.OS — phone web app

The coded version of the ROOM.OS Figma screens (Mobile page). React + Vite, with real on-device object detection (COCO-SSD MobileNet v2 via TensorFlow.js).

## Run it

```bash
npm install
npm run dev -- --host      # open the printed Network URL on your phone (same Wi-Fi)
npm run build              # single-file build in dist/ (index.html + models/)
```

Live camera scanning needs HTTPS (or localhost). For a phone on the same Wi-Fi, deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages), or use `npx vite --host --https` with a dev certificate. Where the live camera isn't allowed, the Scan button falls back to "Take photo", which opens the phone camera and runs the same detection on the picture.

## Where things are

- `src/screens/` — every screen, grouped like the Figma sections (onboarding, tabs, scan flow, object pages, system screens)
- `src/ui.jsx` — glass components, tab bar, sheets, navigation
- `src/detector.js` — model loading, whole-frame + tiled detection, merging
- `src/store.jsx` — app state, saved to the phone's localStorage
- `src/data.js` — categories, COCO class → category mapping, sample room data
- `public/models/coco-ssd/` — model weights (shards are binary; the .wasm extension is only so static hosts serve them)
