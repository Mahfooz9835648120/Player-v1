/**
 * Streamer Pro — Express + WebSocket backend server.
 * Handles teleparty rooms, sync events, and chat relay.
 */
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initSocket } from './socket.js';

const app  = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: '*' }));
app.use(express.json());

/* ——— Audio proxy — adds CORS headers for cross-origin audio files ——— */
app.get('/api/audio/:id', async (req, res) => {
  const sources = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  ];
  const idx = parseInt(req.params.id, 10) - 1;
  const url = sources[idx] || sources[0];

  try {
    const upstream = await fetch(url, {
      headers: { Range: req.headers.range || '' },
    });
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Accept-Ranges', 'bytes');
    if (upstream.headers.get('content-length'))
      res.setHeader('Content-Length', upstream.headers.get('content-length'));
    if (upstream.headers.get('content-range'))
      res.setHeader('Content-Range', upstream.headers.get('content-range'));

    res.status(upstream.status);
    const reader = upstream.body.getReader();
    const pump = () => reader.read().then(({ done, value }) => {
      if (done) { res.end(); return; }
      res.write(Buffer.from(value));
      pump();
    }).catch(() => res.end());
    pump();
  } catch (err) {
    res.status(502).json({ error: 'Audio proxy error', detail: err.message });
  }
});

/* ——— Health check ——— */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

/* ——— Mock content API ——— */
app.get('/api/content', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const videos = DEMO_VIDEOS.filter(v =>
    !q || v.title.toLowerCase().includes(q) || v.tags?.some(t => t.includes(q))
  );
  res.json({ videos });
});

app.get('/api/content/:id', (req, res) => {
  const video = DEMO_VIDEOS.find(v => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: 'Not found' });
  res.json(video);
});

/* ——— Create HTTP server and attach WebSocket ——— */
const server = createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`[StreamerPro] Server listening on http://localhost:${PORT}`);
});

/* ——— Demo content (mock data) ——— */
const DEMO_VIDEOS = [
  {
    id: 'v1',
    title: 'Big Buck Bunny',
    description: 'A classic animated short film. Perfect for testing video streaming.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: null,
    duration: '9:56',
    format: 'MP4',
    tags: ['animation', 'short film'],
  },
  {
    id: 'v2',
    title: 'Elephant Dream',
    description: 'The first open movie from the Blender Institute.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: null,
    duration: '10:54',
    format: 'MP4',
    tags: ['animation', 'sci-fi'],
  },
  {
    id: 'v3',
    title: 'For Bigger Blazes',
    description: 'An HD nature documentary clip.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: null,
    duration: '0:15',
    format: 'MP4',
    tags: ['documentary', 'nature'],
  },
  {
    id: 'v4',
    title: 'For Bigger Escapes',
    description: 'A short adventure clip.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: null,
    duration: '0:15',
    format: 'MP4',
    tags: ['adventure', 'action'],
  },
  {
    id: 'v5',
    title: 'Subaru Outback',
    description: 'Sample HD commercial video.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnail: null,
    duration: '0:57',
    format: 'MP4',
    tags: ['commercial', 'cars'],
  },
  {
    id: 'v6',
    title: 'HLS Demo Stream',
    description: 'Live HLS adaptive streaming demo (requires HLS support).',
    src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    thumbnail: null,
    duration: 'Live',
    format: 'HLS',
    tags: ['live', 'adaptive'],
  },
];

export { DEMO_VIDEOS };
