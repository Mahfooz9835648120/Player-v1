/**
 * Anti-Gravity Orb — Parallax, music-reactive, video-reactive.
 * Disabled on low-performance devices.
 */
import { getState } from '../utils/state.js';
import { EventBus, EVENTS } from '../utils/eventBus.js';

const orb = document.getElementById('orb');
const orbRing = document.getElementById('orb-ring');

let mouseX = 0.5, mouseY = 0.5;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
let raf = null;
let orbScale = 1;
let orbOpacity = 0.9;
let freqData = null;
let isActive = false;

const MAX_DRIFT = 80; // max px drift from center

function init() {
  if (getState('perf.isLowEnd')) return; // Skip on low-end devices

  isActive = true;

  // Mouse parallax
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Touch parallax
  window.addEventListener('touchmove', onTouchMove, { passive: true });

  // React to music frequencies
  EventBus.on(EVENTS.MUSIC_FREQ, onFrequency);

  // React to video playback
  EventBus.on(EVENTS.VIDEO_PLAY, () => {
    orbOpacity = 0.5;
    applyStyle();
  });
  EventBus.on(EVENTS.VIDEO_PAUSE, () => {
    orbOpacity = 0.9;
    applyStyle();
  });

  startLoop();
}

function onMouseMove(e) {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;
}

function onTouchMove(e) {
  if (!e.touches[0]) return;
  mouseX = e.touches[0].clientX / window.innerWidth;
  mouseY = e.touches[0].clientY / window.innerHeight;
}

function onFrequency(data) {
  freqData = data;
  // Compute average of low-mid frequencies to drive scale
  if (data && data.length) {
    const bass = data.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
    orbScale = 1 + (bass / 255) * 0.35;
  }
}

function startLoop() {
  const loop = () => {
    if (!isActive) return;

    // Lerp position toward mouse target
    targetX = (mouseX - 0.5) * MAX_DRIFT * 2;
    targetY = (mouseY - 0.5) * MAX_DRIFT * 2;
    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;

    // Lerp scale back to 1 when no music
    if (!freqData) orbScale += (1 - orbScale) * 0.05;

    applyTransform();
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}

function applyTransform() {
  if (!orb) return;
  orb.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) scale(${orbScale})`;
  orbRing.style.transform = `translate(calc(-50% + ${currentX * 0.5}px), calc(-50% + ${currentY * 0.5}px)) rotate(${Date.now() / 80}deg)`;
}

function applyStyle() {
  if (!orb) return;
  orb.style.opacity = orbOpacity;
}

function destroy() {
  isActive = false;
  if (raf) cancelAnimationFrame(raf);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('touchmove', onTouchMove);
}

export const Orb = { init, destroy };
