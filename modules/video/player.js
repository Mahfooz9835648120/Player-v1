/**
 * Video Player — Orchestrates playback, engine selection (HLS vs Chunk vs Direct).
 * Manages watch history and continue-watching.
 */
import { EventBus, EVENTS } from '../utils/eventBus.js';
import { getState, setState, addToHistory } from '../utils/state.js';
import { HLSEngine } from '../engine/hlsEngine.js';
import { ChunkEngine } from '../engine/chunkEngine.js';
import { formatTime } from '../utils/format.js';
import { initControls } from './controls.js';
import { initGestures } from './gestures.js';

let hlsEngine = null;
let chunkEngine = null;
const video = document.getElementById('main-video');

export function initVideoPlayer() {
  if (!video) return;

  initControls(video);
  initGestures(video);

  // Video native events → EventBus
  video.addEventListener('play',       () => { setState('video.isPlaying', true);  EventBus.emit(EVENTS.VIDEO_PLAY, {}); });
  video.addEventListener('pause',      () => { setState('video.isPlaying', false); EventBus.emit(EVENTS.VIDEO_PAUSE, {}); });
  video.addEventListener('ended',      () => { setState('video.isPlaying', false); EventBus.emit(EVENTS.VIDEO_ENDED, {}); });
  video.addEventListener('timeupdate', onTimeUpdate);
  video.addEventListener('progress',   onProgress);
  video.addEventListener('waiting',    onWaiting);
  video.addEventListener('canplay',    onCanPlay);
  video.addEventListener('error',      onError);

  // Respond to teleparty sync
  EventBus.on(EVENTS.PARTY_PLAY,  () => { if (video.paused) video.play().catch(() => {}); });
  EventBus.on(EVENTS.PARTY_PAUSE, () => { if (!video.paused) video.pause(); });
  EventBus.on(EVENTS.PARTY_SEEK,  ({ time }) => { video.currentTime = time; });

  // Volume control
  document.getElementById('volume-slider')?.addEventListener('input', e => {
    video.volume = parseFloat(e.target.value);
    setState('video.volume', video.volume);
  });
  document.getElementById('mute-btn')?.addEventListener('click', () => {
    video.muted = !video.muted;
    setState('video.muted', video.muted);
  });
}

function onTimeUpdate() {
  const ct = video.currentTime;
  const dur = video.duration || 0;
  setState('video.currentTime', ct);
  setState('video.duration', dur);

  EventBus.emit(EVENTS.VIDEO_TIME, { currentTime: ct, duration: dur });

  // Persist progress to history every 5 seconds
  if (Math.floor(ct) % 5 === 0 && ct > 2) {
    const src = getState('video.src');
    if (src) addToHistory({ src, title: getState('video.title'), currentTime: ct, duration: dur });
  }
}

function onProgress() {
  if (!video.buffered.length) return;
  const buffEnd = video.buffered.end(video.buffered.length - 1);
  const dur = video.duration || 1;
  const pct = Math.min(buffEnd / dur, 1);
  setState('video.buffered', pct);

  const statusEl = document.getElementById('buffer-status');
  if (statusEl) statusEl.textContent = `BUFFER: ${(buffEnd - video.currentTime).toFixed(1)}s`;

  EventBus.emit(EVENTS.VIDEO_BUFFER, { buffered: pct });
}

function onWaiting() {
  // Stall — try to recover
  if (chunkEngine) chunkEngine.bufferManager?.onStall();
}

function onCanPlay() {
  if (!getState('video.isPlaying')) return;
}

function onError() {
  const err = video.error;
  console.error('[VideoPlayer] Error:', err?.code, err?.message);
  EventBus.emit(EVENTS.VIDEO_ERROR, { code: err?.code, msg: err?.message });
  EventBus.emit(EVENTS.TOAST, { msg: '⚠ Video playback error' });
}

/**
 * Load and play a video source.
 * Auto-detects: HLS → ChunkEngine → Direct
 */
export async function loadVideo({ src, title = 'Untitled', thumbnail = null, startTime = 0 }) {
  if (!src) return;

  // Clean up previous engines
  destroy();

  setState('video.src', src);
  setState('video.title', title);
  setState('video.isHLS', false);
  setState('video.isChunked', false);

  // Update UI title
  const titleEl = document.getElementById('video-title-display');
  if (titleEl) titleEl.textContent = title;

  // Update HLS badge
  const hlsBadge = document.getElementById('hls-badge');
  const qualityBadge = document.getElementById('quality-badge');
  if (hlsBadge) hlsBadge.style.display = 'none';
  if (qualityBadge) qualityBadge.textContent = 'AUTO';

  // Add to history immediately
  addToHistory({ src, title, thumbnail, currentTime: 0, duration: 0 });

  if (HLSEngine.isHLS(src)) {
    // ── HLS MODE ──
    hlsEngine = new HLSEngine(video);
    const ok = await hlsEngine.load(src);
    if (ok) {
      setState('video.isHLS', true);
      if (hlsBadge) hlsBadge.style.display = '';
    }
  } else {
    // ── Attempt Chunk Engine (Range requests) ──
    chunkEngine = new ChunkEngine(video, src);
    const ok = await chunkEngine.start();
    if (ok) {
      setState('video.isChunked', true);
      if (qualityBadge) qualityBadge.textContent = 'STREAM';
    }
  }

  // Start from continue-watching position
  if (startTime > 5) {
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = startTime;
    }, { once: true });
  }

  // Auto-play
  video.play().catch(err => {
    if (err.name !== 'AbortError') {
      console.warn('[VideoPlayer] Autoplay blocked:', err.message);
    }
  });
}

/** Destroy active engines */
function destroy() {
  if (hlsEngine) { hlsEngine.destroy(); hlsEngine = null; }
  if (chunkEngine) { chunkEngine.destroy(); chunkEngine = null; }
  if (!HLSEngine.isHLS(video.src || '')) video.src = '';
}

export function getVideoEl() { return video; }
