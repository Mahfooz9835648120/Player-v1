/**
 * Chunk Engine — Fetches video in byte-range chunks using HTTP Range requests.
 * Starts playback before full download, enables adaptive buffering.
 */
import { EventBus, EVENTS } from '../utils/eventBus.js';
import { getWorkerCount } from '../utils/deviceCapability.js';
import { BufferManager } from './bufferManager.js';
import { MediaSourceHandler } from './mediaSourceHandler.js';

export class ChunkEngine {
  /**
   * @param {HTMLVideoElement} video
   * @param {string} url - Direct MP4 URL supporting Range requests
   */
  constructor(video, url) {
    this.video = video;
    this.url = url;
    this.chunkSize = 512 * 1024;       // 512KB per chunk
    this.prefetchChunks = 3;           // Load N chunks ahead
    this.totalSize = 0;
    this.loadedBytes = 0;
    this.chunks = new Map();           // chunkIndex → ArrayBuffer
    this.fetchQueue = new Set();       // currently fetching chunk indices
    this.maxParallel = Math.min(getWorkerCount(), 3);
    this.mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

    this.msHandler = new MediaSourceHandler(video);
    this.bufferManager = new BufferManager();
    this._destroyed = false;
  }

  async start() {
    try {
      // Get total content length
      const head = await fetch(this.url, { method: 'HEAD' });
      this.totalSize = parseInt(head.headers.get('content-length') || '0', 10);

      if (!this.totalSize) {
        // Server doesn't support Range — fall back to direct src
        this.video.src = this.url;
        return false;
      }

      // Init MediaSource
      await this.msHandler.init(this.mimeType);

      // Load initial chunks to start playback ASAP
      await this._loadChunks(0, this.prefetchChunks);

      // Listen to video timeupdate to prefetch ahead
      this.video.addEventListener('timeupdate', this._onTimeUpdate.bind(this));

      EventBus.emit(EVENTS.ENGINE_READY, { totalSize: this.totalSize });
      return true;
    } catch (err) {
      console.warn('[ChunkEngine] Falling back to direct src:', err.message);
      this.video.src = this.url;
      return false;
    }
  }

  _onTimeUpdate() {
    if (this._destroyed) return;
    const { currentTime, duration } = this.video;
    const currentChunk = Math.floor((currentTime / duration) * this._totalChunks());
    const ahead = this.prefetchChunks;

    for (let i = currentChunk; i < currentChunk + ahead; i++) {
      if (i < this._totalChunks() && !this.chunks.has(i) && !this.fetchQueue.has(i)) {
        this._fetchChunk(i).catch(() => {});
      }
    }
  }

  _totalChunks() {
    return Math.ceil(this.totalSize / this.chunkSize);
  }

  async _loadChunks(startIndex, count) {
    const promises = [];
    for (let i = startIndex; i < startIndex + count && i < this._totalChunks(); i++) {
      if (!this.chunks.has(i) && !this.fetchQueue.has(i)) {
        promises.push(this._fetchChunk(i));
        if (promises.length >= this.maxParallel) break;
      }
    }
    await Promise.all(promises);
  }

  async _fetchChunk(index) {
    if (this._destroyed || this.fetchQueue.has(index)) return;
    this.fetchQueue.add(index);

    const start = index * this.chunkSize;
    const end = Math.min(start + this.chunkSize - 1, this.totalSize - 1);

    try {
      const res = await fetch(this.url, {
        headers: { Range: `bytes=${start}-${end}` },
      });
      if (!res.ok && res.status !== 206) throw new Error(`HTTP ${res.status}`);

      const buffer = await res.arrayBuffer();
      this.chunks.set(index, buffer);
      this.loadedBytes += buffer.byteLength;

      // Append to MediaSource buffer
      if (this.msHandler.isReady()) {
        await this.msHandler.appendBuffer(buffer);
      }

      this.bufferManager.record(index, buffer.byteLength);
      EventBus.emit(EVENTS.ENGINE_CHUNK, { index, size: buffer.byteLength, total: this.totalSize, loaded: this.loadedBytes });
    } catch (err) {
      console.warn(`[ChunkEngine] Chunk ${index} failed:`, err.message);
    } finally {
      this.fetchQueue.delete(index);
    }
  }

  destroy() {
    this._destroyed = true;
    this.video.removeEventListener('timeupdate', this._onTimeUpdate);
    this.msHandler.destroy();
    this.chunks.clear();
    this.fetchQueue.clear();
  }
}
