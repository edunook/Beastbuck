import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compile } from 'tailwindcss'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const tailwindInput = String.raw`
@import "tailwindcss";
@theme {
  --color-background: #050507;
  --color-surface: rgba(15, 15, 20, 0.78);
  --color-border: rgba(255, 255, 255, 0.08);
  --color-text: #ffffff;
  --color-text-muted: #a8a8b8;
  --color-text-soft: #c8c9d6;
  --color-accent: #00f0ff;
  --color-accent-alt: #b026ff;
  --color-status-success: #00ff88;
  --color-status-warning: #ffaa00;
  --color-status-danger: #ff2a2a;
  --font-sans: Inter, sans-serif;
  --font-heading: Orbitron, sans-serif;
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

  /* Auth page animations */
  @keyframes auth-orb-1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.05); }
    66% { transform: translate(-20px, 15px) scale(0.95); }
  }
  @keyframes auth-orb-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-40px, 30px) scale(1.08); }
  }
  @keyframes auth-orb-3 {
    0%, 100% { transform: translate(0, 0); opacity: 0.5; }
    50% { transform: translate(25px, -25px); opacity: 0.8; }
  }
  @keyframes auth-glow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
  }
  @keyframes auth-shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }

  .animate-auth-orb-1 { animation: auth-orb-1 12s ease-in-out infinite; }
  .animate-auth-orb-2 { animation: auth-orb-2 16s ease-in-out infinite; }
  .animate-auth-orb-3 { animation: auth-orb-3 10s ease-in-out infinite; }
  .animate-auth-glow { animation: auth-glow 3s ease-in-out infinite; }
  .animate-auth-shake { animation: auth-shake 0.5s ease-in-out; }

  @media (prefers-reduced-motion: reduce) {
    .animate-auth-orb-1,
    .animate-auth-orb-2,
    .animate-auth-orb-3,
    .animate-auth-glow,
    .animate-auth-shake {
      animation: none;
    }
  }

  /* Creativity page */
  @keyframes creativity-float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(2deg); }
  }
  @keyframes creativity-shimmer {
    0% { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
  @keyframes creativity-gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes creativity-fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes creativity-pulse-ring {
    0% { transform: scale(0.95); opacity: 0.6; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.6; }
  }

  .animate-creativity-float { animation: creativity-float 5s ease-in-out infinite; }
  .animate-creativity-fade-up { animation: creativity-fade-up 0.55s ease-out forwards; }
  .animate-creativity-gradient {
    background-size: 200% 200%;
    animation: creativity-gradient-shift 6s ease infinite;
  }
  .creativity-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    background-size: 200% 100%;
    animation: creativity-shimmer 3s linear infinite;
  }
  .text-creativity-gradient {
    background-image: linear-gradient(120deg, #00f0ff, #b026ff, #ff2d95, #ffaa00);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: creativity-gradient-shift 5s ease infinite;
  }
  .creativity-mesh {
    background-image:
      radial-gradient(at 20% 30%, rgba(0, 240, 255, 0.18) 0, transparent 50%),
      radial-gradient(at 80% 20%, rgba(176, 38, 255, 0.2) 0, transparent 45%),
      radial-gradient(at 60% 80%, rgba(255, 45, 149, 0.14) 0, transparent 50%),
      radial-gradient(at 10% 90%, rgba(255, 170, 0, 0.1) 0, transparent 40%);
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-creativity-float,
    .animate-creativity-fade-up,
    .animate-creativity-gradient,
    .creativity-shimmer,
    .text-creativity-gradient {
      animation: none;
    }
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
  publicDir: 'public',
  resolve: {
    alias: {
      '@frontend': path.resolve(process.cwd(), 'frontend'),
      '@services': path.resolve(process.cwd(), 'frontend/services'),
      '@shared': path.resolve(process.cwd(), 'shared'),
      '@backend': path.resolve(process.cwd(), 'backend'),
    }
  },
  build: {
    outDir: 'dist',
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
