/**
 * Streamer Pro - Express + WebSocket backend server.
 */

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { initSocket } from "./socket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: "*" }));
app.use(express.json());

// ================= ADMIN VIDEO STORAGE =================
let adminVideos = [];

app.get("/api/admin/videos", (req, res) => {
  res.json({ videos: adminVideos });
});

app.post("/api/admin/videos", (req, res) => {
  const { title, src, thumbnail, description, format, duration } = req.body;
  if (!src) return res.status(400).json({ error: "src is required" });

  const video = {
    id: "admin-" + Date.now(),
    title,
    src,
    thumbnail,
    description,
    format,
    duration
  };

  adminVideos.unshift(video);
  res.status(201).json(video);
});

app.delete("/api/admin/videos/:id", (req, res) => {
  const before = adminVideos.length;
  adminVideos = adminVideos.filter(v => v.id !== req.params.id);
  if (adminVideos.length === before)
    return res.status(404).json({ error: "Not found" });

  res.json({ ok: true });
});

// ================= AUDIO STREAM =================
app.get("/api/audio/:id", async (req, res) => {
  const sources = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  ];

  const idx = parseInt(req.params.id, 10) - 1;
  const url = sources[idx] || sources[0];

  try {
    const upstream = await fetch(url, {
      headers: { Range: req.headers.range || "" }
    });

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Accept-Ranges", "bytes");

    if (upstream.headers.get("content-length")) {
      res.setHeader("Content-Length", upstream.headers.get("content-length"));
    }

    if (upstream.headers.get("content-range")) {
      res.setHeader("Content-Range", upstream.headers.get("content-range"));
    }

    res.status(upstream.status);
    upstream.body.pipeTo(new WritableStream({
      write(chunk) {
        res.write(chunk);
      },
      close() {
        res.end();
      }
    }));

  } catch (err) {
    res.status(502).json({ error: "Audio proxy error" });
  }
});

// ================= CONTENT =================
const DEMO_VIDEOS = [
  { id: "v1", title: "Big Buck Bunny", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
  { id: "v2", title: "Elephant Dream", src: "https://test-streams.mux.dev/pts_shift/master.m3u8" },
  { id: "v3", title: "HLS Demo", src: "https://test-streams.mux.dev/test_001/stream.m3u8" }
];

app.get("/api/content", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  const all = [...adminVideos, ...DEMO_VIDEOS];
  const videos = all.filter(v => !q || v.title.toLowerCase().includes(q));
  res.json({ videos });
});

app.get("/api/content/:id", (req, res) => {
  const all = [...adminVideos, ...DEMO_VIDEOS];
  const video = all.find(v => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: "Not found" });
  res.json(video);
});

// ================= SERVE FRONTEND (FIXED) =================
const distPath = path.join(__dirname, "..", "dist");

app.use(express.static(distPath));

app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(distPath, "index.html"));
  }
});

// ================= SERVER =================
const server = createServer(app);
initSocket(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
