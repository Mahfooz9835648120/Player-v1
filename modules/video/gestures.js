/**
 * Gesture support for the video player.
 * Swipe left/right → seek ±10s
 * Vertical swipe → volume
 */
import { EventBus, EVENTS } from '../utils/eventBus.js';

export function initGestures(video) {
  const container = document.getElementById('video-container');
  const hint      = document.getElementById('gesture-hint');
  if (!container || !hint) return;

  let startX = 0, startY = 0;
  let startTime = 0;
  let isDragging = false;
  let hintTimer = null;

  function showHint(text, side) {
    hint.textContent = text;
    hint.style.left  = side === 'left'  ? '16px' : 'auto';
    hint.style.right = side === 'right' ? '16px' : 'auto';
    hint.style.opacity = '1';
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => { hint.style.opacity = '0'; }, 900);
  }

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    startX    = e.touches[0].clientX;
    startY    = e.touches[0].clientY;
    startTime = video.currentTime;
    isDragging = false;
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    // Require a minimum movement to prevent accidental swipes
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

    isDragging = true;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe → seek
      const seekDelta = (dx / container.clientWidth) * 60; // max 60s
      const newTime = Math.max(0, Math.min(video.duration || 0, startTime + seekDelta));
      video.currentTime = newTime;

      const arrow = dx > 0 ? '⏩' : '⏪';
      const sec   = Math.abs(seekDelta).toFixed(0);
      showHint(`${arrow} ${sec}s`, dx > 0 ? 'right' : 'left');
    } else {
      // Vertical swipe → volume
      const delta = -(dy / container.clientHeight) * 1.5;
      video.volume = Math.max(0, Math.min(1, video.volume + delta));

      const pct = Math.round(video.volume * 100);
      showHint(`🔊 ${pct}%`, 'left');

      // Sync volume slider
      const slider = document.getElementById('volume-slider');
      if (slider) slider.value = video.volume;
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    if (isDragging) {
      // Emit seek for teleparty
      EventBus.emit(EVENTS.PARTY_SEEK, { time: video.currentTime });
    }
    isDragging = false;
  }, { passive: true });
}
