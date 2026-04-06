/**
 * Device capability detection — adjusts visual fidelity accordingly.
 */
import { setState } from './state.js';

export function detectCapability() {
  const cores = navigator.hardwareConcurrency || 2;
  const mem = navigator.deviceMemory || 4; // GB (not available everywhere)
  const isLowEnd = cores <= 2 || mem < 2;

  setState('perf.isLowEnd', isLowEnd);
  setState('perf.concurrency', cores);

  if (isLowEnd) {
    document.body.classList.add('low-perf');
  }

  return { cores, mem, isLowEnd };
}

/** Returns max parallel chunk fetch workers based on CPU */
export function getWorkerCount() {
  const cores = navigator.hardwareConcurrency || 2;
  return Math.min(Math.max(1, Math.floor(cores / 2)), 4);
}

/** Returns appropriate blur amount based on device capability */
export function getBlurAmount() {
  const { isLowEnd } = detectCapability();
  return isLowEnd ? 'blur(6px)' : 'blur(20px)';
}
