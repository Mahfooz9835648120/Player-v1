# Streamer Pro

A live streaming platform web application built with React + Vite + TypeScript.

## Architecture

- **Frontend**: React 19 + Vite 8 + TypeScript (CSS Modules for styling)
- **Runtime**: Node.js 20
- **Port**: 5000
- **Deployment**: Static site (built with `npm run build`, served from `dist/`)

## Project Structure

```
src/
  components/
    Navbar.tsx          - Top navigation bar with search
    Sidebar.tsx         - Recommended channels sidebar
    HeroBanner.tsx      - Featured stream hero section
    StreamCard.tsx      - Individual stream card in grid
    StreamModal.tsx     - Stream viewer modal/popup
  data/
    streams.ts          - Mock stream data and types
  App.tsx               - Root application component
  main.tsx              - Entry point
  index.css             - Global styles / CSS variables
```

## Features

- Browse live streams in a grid layout
- Hero banner featuring the top stream
- Category filter (Gaming, Music, IRL, Just Chatting, Art, Sports)
- Search across streams, streamers, and games
- Sidebar with recommended channels
- Stream detail modal with watch/follow/subscribe actions
- Fully responsive design

## Development

```bash
npm run dev     # Start dev server on port 5000
npm run build   # Build for production
```

## Design System

Uses CSS custom properties for theming:
- `--bg-primary`: #0e0f14 (dark background)
- `--accent`: #9147ff (purple, Twitch-inspired)
- `--live-red`: #e91916 (live indicator red)
