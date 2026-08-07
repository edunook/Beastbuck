# BeastBuck Architecture

## Structure
- `frontend/` — Portable React application (Vite + React 19)
- `backend/` — Server-side Admin SDK scripts and automation
- `shared/` — Constants, permissions, utils shared across layers
- `functions/` — Firebase Cloud Functions (Node.js 18)

## Path Aliases (Vite)
| Alias | Resolves to |
|---|---|
| `@frontend` | `frontend/` |
| `@services` | `frontend/services/` |
| `@shared` | `shared/` |
| `@backend` | `backend/` |

## Service Layer
`frontend/services/`:
- `firebase/config.js` — Firebase init (auth, db, storage, rtdb)
- `auth/auth.js` — Firebase Auth CRUD
- `firestore/` — All Firestore CRUD repositories
- `storage/` — Firebase Storage + S3, IPFS, Cloudinary, Pinata
- `realtime/` — RTDB, WebRTC, Presence, Collaboration
- `ai/` — AI service layer + provider adapters
- `api/` — HTTP API client

