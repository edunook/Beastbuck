# BeastBuck Cloudflare CDN Media Delivery Worker

This directory contains the production Cloudflare Worker that delivers media assets from the private Backblaze B2 bucket (`beastbuck-media`) with global edge caching and HTTP Range request support.

## Architecture

```
Browser ──── GET /media/prod/... ───► Cloudflare Worker (workers.dev or media.beastbuck.com)
                                             │
                                   AWS SigV4 Authenticated Request
                                   (beastbuck-cdn read-only key)
                                             │
                                             ▼
                                     Private Backblaze B2 Origin
                                             │
                                     HTTP 200 / 206 (Range)
                                             │
Browser ◄─── Cached / Streamed Response ─────┘
```

## Security & Access Control

1. **Private B2 Bucket**: The Backblaze B2 bucket remains completely private.
2. **Dedicated Read-Only Key**: The Cloudflare Worker authenticates using the dedicated read-only `beastbuck-cdn` Application Key.
3. **No Secret Leakage**: The key is stored as a Cloudflare Worker Secret and is never sent to the browser.
4. **Path Traversal Defense**: The worker validates all incoming paths, blocks directory traversal (`..`, `%2e`, null bytes), and rejects arbitrary bucket listing (`/` or `/media`).
5. **Private Media Isolation**: Content under `/proof/` or flagged with `visibility=private` receives `Cache-Control: private, no-store, no-cache`, ensuring Cloudflare never caches private files across users.
6. **HTTP Range Requests**: Supports RFC 7233 byte-range requests (`Range: bytes=start-end`), returning `HTTP 206 Partial Content` with `Content-Range` and `Accept-Ranges: bytes` for smooth video scrubbing.

---

## Deployment Instructions

### 1. Set Worker Secrets in Cloudflare

Run the following commands using the Wrangler CLI (or configure them in the Cloudflare Dashboard under **Workers & Pages → beastbuck-media → Settings → Variables and Secrets**):

```bash
# Set the read-only CDN Key ID
npx wrangler secret put B2_APPLICATION_KEY_ID

# Set the read-only CDN Application Key Secret
npx wrangler secret put B2_APPLICATION_KEY
```

### 2. Deploy the Worker

From the `cloudflare/` directory:

```bash
cd cloudflare
npx wrangler deploy
```

Upon deployment, Cloudflare will output your worker URL:
```
https://beastbuck-media.<your-subdomain>.workers.dev
```

### 3. Update Vercel & Client Environment

Set the worker URL in your Vercel Project Environment Variables and `.env`:

```env
VITE_MEDIA_CDN_BASE_URL=https://beastbuck-media.<your-subdomain>.workers.dev
```

### 4. Custom Domain (media.beastbuck.com) — Future Step

When ready to map `media.beastbuck.com`:
1. In Cloudflare Dashboard, go to your domain **beastbuck.com** → **Workers Routes**.
2. Add Route: `media.beastbuck.com/*` → Worker: `beastbuck-media`.
3. In DNS, add a CNAME record: `media` pointing to your Cloudflare Worker.
4. Update the environment variable in Vercel to:
   ```env
   VITE_MEDIA_CDN_BASE_URL=https://media.beastbuck.com
   ```
   **No frontend React components need to be modified.**
