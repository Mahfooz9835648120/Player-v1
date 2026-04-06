/**
 * Picture-in-Picture mini player — draggable floating video.
 * Clones the main video playback into a draggable overlay.
 */
import { EventBus, EVENTS } from '../utils/eventBus.js';
import { getState, setState } from '../utils/state.js';

const pipContainer = document.getElementById('pip-player');
const pipVideo     = document.getElementById('pip-video');
const mainVideo    = document.getElementById('main-video');
const pipBtn       = document.getElementById('pip-btn');
const pipPlayBtn   = document.getElementById('pip-play-btn');
const pipCloseBtn  = document.getElementById('pip-close-btn');
const pipExpandBtn = document.getElementById('pip-expand-btn');

let isDragging = false, dragOffX = 0, dragOffY = 0;

export function initPiP() {
  pipBtn?.addEventListener('click', togglePiP);
  pipCloseBtn?.addEventListener('click', closePiP);
  pipExpandBtn?.addEventListener('click', () => {
    closePiP();
    document.querySelector('.nav-btn[data-mode="video"]')?.click();
    document.getElementById('video-player-section')?.scrollIntoView({ behavior: 'smooth' });
  });
  pipPlayBtn?.addEventListener('click', () => {
    if (mainVideo?.paused) mainVideo.play().catch(() => {});
    else mainVideo?.pause();
  });

  // Sync PiP play button icon
  EventBus.on(EVENTS.VIDEO_PLAY,  () => { if (pipPlayBtn) pipPlayBtn.textContent = '⏸'; });
  EventBus.on(EVENTS.VIDEO_PAUSE, () => { if (pipPlayBtn) pipPlayBtn.textContent = '▶'; });

  // Drag support (mouse)
  pipContainer?.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);

  // Drag support (touch)
  pipContainer?.addEventListener('touchstart', startTouchDrag, { passive: true });
  document.addEventListener('touchmove', onTouchDrag, { passive: false });
  document.addEventListener('touchend', stopDrag);

  // Native PiP API support (Chrome)
  if (document.pictureInPictureEnabled) {
    pipBtn?.setAttribute('title', 'Picture-in-Picture');
  }
}

function togglePiP() {
  // Try native Picture-in-Picture API first
  if (document.pictureInPictureEnabled && mainVideo) {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else {
      mainVideo.requestPictureInPicture().catch(() => {
        // Fall back to custom PiP
        showCustomPiP();
      });
    }
  } else {
    showCustomPiP();
  }
}

function showCustomPiP() {
  if (!pipContainer || !pipVideo || !mainVideo) return;
  if (getState('pip.active')) { closePiP(); return; }

  // Mirror main video src
  pipVideo.src  = mainVideo.src;
  pipVideo.currentTime = mainVideo.currentTime;
  if (!mainVideo.paused) pipVideo.play().catch(() => {});

  // Sync time from main video
  const syncTime = () => { if (!Math.abs(pipVideo.currentTime - mainVideo.currentTime) < 0.5) pipVideo.currentTime = mainVideo.currentTime; };
  mainVideo.addEventListener('timeupdate', syncTime);

  pipContainer.style.display = '';
  setState('pip.active', true);
  pipBtn?.classList.add('active');

  // Store cleanup ref
  pipContainer._syncCleanup = () => mainVideo.removeEventListener('timeupdate', syncTime);
}

function closePiP() {
  if (!pipContainer || !pipVideo) return;
  pipContainer._syncCleanup?.();
  pipVideo.pause();
  pipVideo.src = '';
  pipContainer.style.display = 'none';
  setState('pip.active', false);
  pipBtn?.classList.remove('active');
}

function startDrag(e) {
  if (e.target.closest('.pip-btn')) return;
  isDragging = true;
  const rect = pipContainer.getBoundingClientRect();
  dragOffX = e.clientX - rect.left;
  dragOffY = e.clientY - rect.top;
  pipContainer.style.cursor = 'grabbing';
}

function onDrag(e) {
  if (!isDragging) return;
  movePiP(e.clientX - dragOffX, e.clientY - dragOffY);
}

function startTouchDrag(e) {
  if (e.target.closest('.pip-btn')) return;
  isDragging = true;
  const touch = e.touches[0];
  const rect = pipContainer.getBoundingClientRect();
  dragOffX = touch.clientX - rect.left;
  dragOffY = touch.clientY - rect.top;
}

function onTouchDrag(e) {
  if (!isDragging) return;
  e.preventDefault();
  const touch = e.touches[0];
  movePiP(touch.clientX - dragOffX, touch.clientY - dragOffY);
}

function stopDrag() {
  isDragging = false;
  if (pipContainer) pipContainer.style.cursor = 'grab';
}

function movePiP(x, y) {
  const maxX = window.innerWidth  - pipContainer.offsetWidth;
  const maxY = window.innerHeight - pipContainer.offsetHeight;
  pipContainer.style.right  = 'auto';
  pipContainer.style.bottom = 'auto';
  pipContainer.style.left   = `${Math.max(0, Math.min(x, maxX))}px`;
  pipContainer.style.top    = `${Math.max(0, Math.min(y, maxY))}px`;
}
