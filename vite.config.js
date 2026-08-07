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
      if (!id.replaceAll('\\', '/').endsWith('/frontend/styles/index.css')) return null

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
  }
}

// https://vite.dev/config/
export default defineConfig({
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
