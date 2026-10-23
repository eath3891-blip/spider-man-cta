# Spider-Man "Let's Connect" Interactive CTA Button

An ultra-polished, production-ready interactive CTA component featuring **Spider-Man suit styling**, **hyper-realistic biological spider-web physics**, **sound synthesis (Web Audio API)**, and **magnetic reel-in cursor pulling dynamics**.

---

## Features

- **Iconic Spider-Man Suit Button**:
  - High-density hexagonal suit micro-mesh fabric texture.
  - Raised 3D black urethane web lines with realistic bevel drop-shadows.
  - High-contrast **White Spider-Man Emblem** (modeled after *Marvel's Spider-Man PS4/PS5 Advanced Suit*).
  - 3D perspective tilt and dynamic recoil that reacts to web tension.
- **Hyper-Realistic Biological Silk Simulation**:
  - Multi-fibril braided dragline silk (core structural cable + interwoven helical micro-fibers).
  - Viscid adhesive glue pearls (wet droplets with glistening specular glints).
  - Gossamer wisps fluttering with aerodynamic turbulence.
  - Authentic arborized spiderweb netting with transverse web arcs surrounding the cursor.
- **Elastic Reel-In Pull Physics**:
  - Tangential aerodynamic drag causing the web to bow naturally when revolving.
  - Hookean spring forces that actively pull and reel the cursor toward the button center.
- **Native Web Audio API Synthesizer**:
  - Synthesizes authentic "THWIP!" web-shooting sounds, elastic twangs, and latch pops without external audio files.
- **Production-Ready & Accessible**:
  - Unified Pointer Events supporting Mouse, Trackpad, Touchscreen, and Stylus.
  - Full keyboard accessibility (`Enter`/`Space` to fire, `Escape` to close modal).
  - Focus trapping and restoration for dialogs.
  - Responsive design adapting gracefully from mobile phones to 4K displays.
  - Supports `@media (prefers-reduced-motion: reduce)`.

---

## File Structure

```
spiderman-cta/
├── index.html            # Semantic HTML5 markup and dialog modal
├── style.css             # Production-ready CSS3 with 3D transforms & textures
├── web-physics.js        # 60/120fps biological silk rope physics engine
├── audio.js              # Pure Web Audio API sound synthesizer
├── main.js               # Unified pointer & interaction controller
├── spiderman-logo.png    # High-resolution Spider-Man chest emblem
└── README.md             # Documentation & embedding instructions
```

---

## How to Run Locally

You can run this project using any static file server:

```bash
# Python
python -m http.server 8765

# Node.js
npx serve .
```

Then navigate to `http://localhost:8765` in your browser.

---

## Embedding in React / Next.js / Vue

To embed into a React or Next.js app:
1. Place `spiderman-logo.png` in your `public/` directory.
2. Port `style.css` into a CSS module or global stylesheet.
3. Import `SpideyWebEngine` from `web-physics.js` inside a `useEffect` hook referencing your `<canvas>` and button refs.
