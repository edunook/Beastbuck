import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compile } from 'tailwindcss'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const tailwindInput = String.raw`
@import "tailwindcss";
@theme {
  /* ============================================
     COLORS
     Every component in components/ui/* references a numbered
     scale (e.g. bg-surface-100, text-text-300, border-border-100).
     Only the DEFAULT shade used to be defined, so any class using a
     numbered shade silently produced no CSS at all. This defines the
     full scale for every color family that's actually referenced in
     the codebase, built from the original DEFAULT values.
     ============================================ */
  --color-background: #050507;
  --color-background-0: #000000;
  --color-background-50: #050507;
  --color-background-100: #0b0b10;
  --color-background-200: #12121a;
  --color-background-300: #1a1a24;
  --color-background-400: #23232f;
  --color-background-500: #2c2c3a;

  --color-surface: rgba(15, 15, 20, 0.78);
  --color-surface-0: rgba(10, 10, 14, 0.9);
  --color-surface-50: rgba(15, 15, 20, 0.78);
  --color-surface-100: rgba(22, 22, 30, 0.85);
  --color-surface-200: rgba(30, 30, 40, 0.9);
  --color-surface-300: rgba(40, 40, 52, 0.95);

  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-0: rgba(255, 255, 255, 0.04);
  --color-border-50: rgba(255, 255, 255, 0.08);
  --color-border-100: rgba(255, 255, 255, 0.14);
  --color-border-200: rgba(255, 255, 255, 0.2);
  --color-border-300: rgba(255, 255, 255, 0.28);

  --color-text: #ffffff;
  --color-text-0: #ffffff;
  --color-text-50: #f1f1f6;
  --color-text-100: #e4e4ee;
  --color-text-200: #c8c9d6;
  --color-text-300: #a8a8b8;
  --color-text-400: #86869a;
  --color-text-500: #63637a;
  --color-text-muted: #a8a8b8;
  --color-text-soft: #c8c9d6;

  --color-accent: #00f0ff;
  --color-accent-0: #00f0ff;
  --color-accent-50: #33f3ff;
  --color-accent-100: #66f6ff;
  --color-accent-200: #99faff;
  --color-accent-300: #ccfdff;

  --color-accent-alt: #b026ff;
  --color-accent-alt-0: #b026ff;
  --color-accent-alt-50: #c04dff;
  --color-accent-alt-100: #cf75ff;
  --color-accent-alt-200: #df9cff;
  --color-accent-alt-300: #efc3ff;

  --color-status-success: #00ff88;
  --color-status-success-0: #00ff88;
  --color-status-success-100: #4dffa8;
  --color-status-success-200: #99ffc9;

  --color-status-warning: #ffaa00;
  --color-status-warning-0: #ffaa00;
  --color-status-warning-100: #ffc247;
  --color-status-warning-200: #ffda8f;

  --color-status-danger: #ff2a2a;
  --color-status-danger-0: #ff2a2a;
  --color-status-danger-100: #ff6b6b;
  --color-status-danger-200: #ffa3a3;

  /* ============================================
     TYPOGRAPHY
     ============================================ */
  --font-sans: Inter, sans-serif;
  --font-heading: Orbitron, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --text-hero: 3rem;
  --text-hero--line-height: 1.05;
  --text-hero--letter-spacing: -0.02em;
  --text-hero--font-weight: 800;

  --text-page-title: 2.25rem;
  --text-page-title--line-height: 1.2;
  --text-page-title--letter-spacing: -0.01em;
  --text-page-title--font-weight: 700;

  --text-section-title: 1.5rem;
  --text-section-title--line-height: 1.35;
  --text-section-title--font-weight: 600;

  --text-card-title: 1.125rem;
  --text-card-title--line-height: 1.35;
  --text-card-title--font-weight: 600;

  --text-description: 1rem;
  --text-description--line-height: 1.6;
  --text-description--font-weight: 400;

  --text-caption: 0.875rem;
  --text-caption--line-height: 1.5;
  --text-caption--font-weight: 400;

  --text-badge: 0.75rem;
  --text-badge--line-height: 1.35;
  --text-badge--letter-spacing: 0.02em;
  --text-badge--font-weight: 500;

  --text-metric: 1.875rem;
  --text-metric--line-height: 1.15;
  --text-metric--letter-spacing: -0.01em;
  --text-metric--font-weight: 700;

  /* ============================================
     SHADOWS (elevation + glow system)
     ============================================ */
  --shadow-depth-1: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-depth-2: 0 4px 12px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.25);
  --shadow-depth-3: 0 10px 24px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3);
  --shadow-depth-4: 0 20px 48px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.35);
  --shadow-glow-sm: 0 0 12px rgba(0, 240, 255, 0.25);
  --shadow-glow-md: 0 0 24px rgba(0, 240, 255, 0.35);
  --shadow-glow-lg: 0 0 40px rgba(0, 240, 255, 0.4);
  --shadow-glow-1: var(--shadow-glow-sm);
  --shadow-glow-purple: 0 0 24px rgba(176, 38, 255, 0.4);
  --shadow-glow-success: 0 0 24px rgba(0, 255, 136, 0.35);
  --shadow-glow-warning: 0 0 24px rgba(255, 170, 0, 0.35);
  --shadow-glow-danger: 0 0 24px rgba(255, 42, 42, 0.35);
  --shadow-inner-glow: inset 0 1px 0 rgba(255, 255, 255, 0.08);

  /* ============================================
     Z-INDEX SCALE
     ============================================ */
  --z-index-dropdown: 1000;
  --z-index-sticky: 1100;
  --z-index-fixed: 1200;
  --z-index-modal-backdrop: 1300;
  --z-index-modal: 1400;
  --z-index-popover: 1500;
  --z-index-tooltip: 1600;
  --z-index-notification: 1700;

  /* ============================================
     BACKDROP / BLUR SCALE
     ============================================ */
  --blur-glass-sm: 8px;
  --blur-glass-md: 16px;
  --blur-glass-lg: 24px;
  --blur-glass-xl: 32px;

  /* ============================================
     GRADIENTS
     ============================================ */
  --background-image-gradient-premium-1: linear-gradient(135deg, #00f0ff, #b026ff);
  --background-image-gradient-premium-2: linear-gradient(135deg, #b026ff, #ff2a90);
  --background-image-gradient-premium-3: linear-gradient(135deg, #00ff88, #00f0ff);
  --background-image-gradient-premium-4: linear-gradient(135deg, #ffaa00, #ff2a2a);
  --background-image-gradient-premium-5: linear-gradient(135deg, #00f0ff, #3a86ff);
  --background-image-gradient-subtle-1: linear-gradient(135deg, rgba(0, 240, 255, 0.08), rgba(176, 38, 255, 0.08));
  --background-image-gradient-subtle-2: linear-gradient(135deg, rgba(255, 170, 0, 0.08), rgba(255, 42, 42, 0.08));
  --background-image-gradient-mesh-1: radial-gradient(at 0% 0%, rgba(0, 240, 255, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(176, 38, 255, 0.15) 0px, transparent 50%);

  /* ============================================
     TRANSITIONS
     ============================================ */
  --transition-duration-instant: 75ms;
  --transition-duration-fast: 120ms;
  --transition-duration-base: 200ms;
  --transition-duration-slow: 320ms;
  --transition-duration-slower: 480ms;
  --transition-duration-slowest: 640ms;
  --ease-fast: cubic-bezier(0.4, 0, 1, 1);
  --ease-base: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-slow: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-slower: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
`

const customCss = String.raw`

@layer base {
  body {
    min-height: 100vh;
    margin: 0;
    background: #050507;
    color: #ffffff;
    font-family: Inter, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
  }
}

@layer utilities {
  .text-gradient {
    background-image: linear-gradient(90deg, #00f0ff, #b026ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .glass-panel {
    background: rgba(15, 15, 20, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(12px);
  }

  /* Premium gradient hairline border used by <Card premium />. */
  .premium-border {
    position: relative;
  }
  .premium-border::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: var(--background-image-gradient-premium-1);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
}

/* ============================================
   ENTRANCE ANIMATION SYSTEM
   Named keyframe utilities (animate-fade-in, animate-fade-in-up,
   animate-slide-in) used ~150x across the app, plus a small
   tailwindcss-animate-style "animate-in" system (fade-in / zoom-in /
   slide-in-from-*) used by modals, drawers, and toasts. Neither was
   defined anywhere previously, so none of these animations ever ran.
   ============================================ */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes floatAnim {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-12px) rotate(2deg); }
  66% { transform: translateY(-6px) rotate(-2deg); }
}
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-fade-in {
  animation: fadeIn var(--transition-duration-slow) var(--ease-base) both;
}
.animate-fade-in-up {
  animation: fadeInUp var(--transition-duration-slow) var(--ease-base) both;
}
.animate-slide-in {
  animation: slideIn var(--transition-duration-slow) var(--ease-base) both;
}
.animate-float {
  animation: floatAnim 4s ease-in-out infinite;
}
.animate-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  background-size: 1000px 100%;
  animation: shimmer 2.5s infinite;
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}

/* Dark-themed scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--color-background);
}
::-webkit-scrollbar-thumb {
  background: var(--color-surface-100);
  border-radius: 9999px;
  border: 2px solid var(--color-background);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent-0);
}
* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-surface-100) var(--color-background);
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.custom-scrollbar::-webkit-scrollbar {
  height: 5px;
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.03);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-accent-0);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent-1);
}
::selection {
  background: var(--color-accent-0);
  color: var(--color-background);
}

@keyframes enter {
  from {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0)
      scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1))
      rotate(var(--tw-enter-rotate, 0));
  }
}
.animate-in {
  animation-name: enter;
  animation-duration: 150ms;
  animation-timing-function: var(--ease-base);
  animation-fill-mode: both;
  --tw-enter-opacity: initial;
  --tw-enter-scale: initial;
  --tw-enter-rotate: initial;
  --tw-enter-translate-x: initial;
  --tw-enter-translate-y: initial;
}
.fade-in,
.fade-in-0 { --tw-enter-opacity: 0; }
.zoom-in { --tw-enter-scale: 0; }
.zoom-in-95 { --tw-enter-scale: .95; }
.slide-in-from-top-2 { --tw-enter-translate-y: -0.5rem; }
.slide-in-from-left { --tw-enter-translate-x: -100%; }
.slide-in-from-bottom-4 { --tw-enter-translate-y: 1rem; }
.slide-in-from-bottom-8 { --tw-enter-translate-y: 2rem; }
.slide-in-from-bottom-10 { --tw-enter-translate-y: 2.5rem; }

/* These duration-* utilities normally only control transition-duration;
   .animate-in elements need the same value applied to animation-duration. */
.duration-150 { animation-duration: 150ms; }
.duration-300 { animation-duration: 300ms; }
.duration-base { animation-duration: var(--transition-duration-base); }
.duration-slow { animation-duration: var(--transition-duration-slow); }

/* Respect the OS-level "reduce motion" accessibility preference across
   every animation and transition in the app. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`

async function collectFiles(root, entry) {
  const target = path.join(root, entry)
  const stat = await fs.stat(target)

  if (stat.isFile()) return [target]

  const files = []
  const stack = [target]

  while (stack.length > 0) {
    const current = stack.pop()
    const children = await fs.readdir(current, { withFileTypes: true })

    for (const child of children) {
      const childPath = path.join(current, child.name)
      if (child.isDirectory()) {
        stack.push(childPath)
      } else if (/\.(html|js|jsx|ts|tsx|css)$/.test(child.name)) {
        files.push(childPath)
      }
    }
  }

  return files
}

function extractCandidates(content) {
  return content.match(/[A-Za-z0-9_:/.[\]#%(),-]+/g) ?? []
}

function beastbuckTailwind() {
  let generatedCss

  return {
    name: 'beastbuck-tailwind',
    enforce: 'pre',
    async transform(_code, id) {
      const cleanId = id.replaceAll('\\', '/').split('?')[0].toLowerCase()
      const isIndexCss = cleanId.endsWith('frontend/styles/index.css') || cleanId.includes('styles/index.css')
      if (!isIndexCss) return null

      if (!generatedCss) {
        const root = process.cwd()
        const files = (await Promise.all(['index.html', 'frontend'].map((entry) => collectFiles(root, entry)))).flat()
        const candidates = new Set()

        for (const file of files) {
          const content = await fs.readFile(file, 'utf8')
          for (const candidate of extractCandidates(content)) {
            candidates.add(candidate)
          }
        }

        const compiler = await compile(tailwindInput, {
          base: root,
          async loadStylesheet(sheetId, baseDir) {
            const file =
              sheetId === 'tailwindcss'
                ? path.join(root, 'node_modules/tailwindcss/index.css')
                : path.resolve(baseDir, sheetId)

            return {
              path: file,
              base: path.dirname(file),
              content: await fs.readFile(file, 'utf8'),
            }
          },
        })

        generatedCss = `${compiler.build([...candidates])}${customCss}`
      }

      return {
        code: generatedCss,
        map: null,
      }
    },
    handleHotUpdate({ file }) {
      if (/\.(html|js|jsx|ts|tsx|css)$/.test(file)) {
        generatedCss = null
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [beastbuckTailwind(), react()],
  server: {
    host: true,
    strictPort: false,
    hmr: {
      overlay: true
    }
  },
  resolve: {
    alias: {
      '@frontend': path.resolve(process.cwd(), 'frontend'),
      '@services': path.resolve(process.cwd(), 'frontend/services'),
      '@shared': path.resolve(process.cwd(), 'shared'),
      '@backend': path.resolve(process.cwd(), 'backend'),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Firebase
          if (id.includes('node_modules/firebase')) {
            return 'firebase-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/recharts')) {
            return 'ui-vendor';
          }
          // Router
          if (id.includes('node_modules/react-router')) {
            return 'router-vendor';
          }
          // State management
          if (id.includes('node_modules/zustand')) {
            return 'state-vendor';
          }
          // Utilities
          if (id.includes('node_modules/date-fns') || id.includes('node_modules/classnames')) {
            return 'utils-vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1500 // Increased from 800KB to 1500KB for better performance
  }
})
