# BeastBuck

BeastBuck is a kid-friendly company operating system, invention lab, learning platform, task manager, experiment hub, product marketplace, social collaboration platform, and AI workspace.

## Local Setup

Copy `.env.example` to `.env.local` and fill in deployment-specific values.

```bash
npm install
npm run dev
```

## Cloudinary Uploads

Frontend uploads use a Cloudinary unsigned upload preset. Never place a Cloudinary API secret in React/Vite code.

Required variables:

```env
VITE_CLOUDINARY_CLOUD_NAME=diwoicyu2
VITE_CLOUDINARY_UPLOAD_PRESET=beastbuck_unsigned_uploads
```

Create the unsigned preset in Cloudinary and restrict it with folder, size, and format rules appropriate for BeastBuck proof uploads.

## Build Checks

```bash
npm run lint
npm run build
```

## React + Vite Notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
