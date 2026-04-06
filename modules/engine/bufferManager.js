/**
 * Buffer Manager — Tracks loaded chunks, manages buffer health.
 * Prevents stalling by ensuring enough data is loaded ahead.
 */
export class BufferManager {
  constructor() {
    this.records = new Map();  // chunkIndex → { size, time }
    this.totalBuffered = 0;
    this.stallCount = 0;
    this.minBufferSecs = 5;    // minimum seconds to buffer ahead
  }

  /** Record a loaded chunk */
  record(index, size) {
    this.records.set(index, { size, time: Date.now() });
    this.totalBuffered += size;
  }

  /** Check if video element has enough buffered time ahead */
  hasEnoughBuffer(video) {
    if (!video || !video.buffered.length) return false;
    const currentTime = video.currentTime;
    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    return (bufferedEnd - currentTime) >= this.minBufferSecs;
  }

  /** Get buffer status as human-readable string */
  getStatus(video) {
    if (!video || !video.buffered.length) return '0s';
    const currentTime = video.currentTime;
    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    const ahead = Math.max(0, bufferedEnd - currentTime);
    return `${ahead.toFixed(1)}s`;
  }

  /** Track stall events */
  onStall() {
    this.stallCount++;
    // If stalling often, increase prefetch
    return this.stallCount > 3;
  }

  reset() {
    this.records.clear();
    this.totalBuffered = 0;
    this.stallCount = 0;
  }
}
