# Streamer-pro

## Deploy (Render)

This project is configured for Render deployment via `render.yaml`.

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check: `/api/health`

## Optional Deploy (Railway)

`railway.json` is also present if you want to deploy to Railway.

### Notes

- The app listens on `process.env.PORT` (already supported in `server/server.js`).
- Frontend build output is generated into `dist/` by `npm run build` (`scripts/build-static.mjs`).
- In production, server serves `dist/` if available, and falls back to source files if `dist/` is missing.
