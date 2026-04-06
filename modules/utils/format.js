/**
 * Formatting utilities
 */

/** Format seconds to m:ss or h:mm:ss */
export function formatTime(secs) {
  if (!isFinite(secs) || secs < 0) return '0:00';
  const s = Math.floor(secs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/** Format bytes to human readable */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

/** Generate random short ID */
export function genId(len = 6) {
  return Math.random().toString(36).slice(2, 2 + len).toUpperCase();
}

/** Toast shorthand — emits a UI toast event */
export function toast(msg, duration = 2500) {
  import('../utils/eventBus.js').then(({ EventBus, EVENTS }) => {
    EventBus.emit(EVENTS.TOAST, { msg, duration });
  });
}
