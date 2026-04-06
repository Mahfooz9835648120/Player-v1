/**
 * Smooth transitions and UI animation helpers.
 */

/** Fade in an element */
export function fadeIn(el, duration = 300) {
  el.style.opacity = '0';
  el.style.display = '';
  el.style.transition = `opacity ${duration}ms ease`;
  requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = '1'; }));
}

/** Fade out and hide an element */
export function fadeOut(el, duration = 250) {
  el.style.opacity = '1';
  el.style.transition = `opacity ${duration}ms ease`;
  requestAnimationFrame(() => { el.style.opacity = '0'; });
  setTimeout(() => { el.style.display = 'none'; }, duration);
}

/** Pulse animation — used for play/pause feedback */
export function pulse(el) {
  el.style.transform = 'scale(0.92)';
  el.style.transition = 'transform 100ms ease';
  setTimeout(() => {
    el.style.transform = 'scale(1)';
  }, 100);
}

/** Ripple effect on a container */
export function ripple(container, x, y, color = 'rgba(255,255,255,0.15)') {
  const el = document.createElement('span');
  el.style.cssText = `
    position: absolute;
    border-radius: 50%;
    width: 60px; height: 60px;
    top: ${y - 30}px; left: ${x - 30}px;
    background: ${color};
    transform: scale(0);
    animation: rippleAnim 0.5s ease-out forwards;
    pointer-events: none;
    z-index: 10;
  `;
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = '@keyframes rippleAnim { to { transform: scale(4); opacity: 0; } }';
    document.head.appendChild(style);
  }
  container.style.position = 'relative';
  container.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

/** Show a brief icon flash in the center of the video */
export function flashIcon(container, emoji) {
  const el = document.createElement('div');
  el.style.cssText = `
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) scale(0.5);
    font-size: 48px;
    pointer-events: none;
    z-index: 20;
    animation: flashIconAnim 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
  `;
  el.textContent = emoji;
  if (!document.getElementById('flash-style')) {
    const style = document.createElement('style');
    style.id = 'flash-style';
    style.textContent = '@keyframes flashIconAnim { 50% { transform: translate(-50%,-50%) scale(1.2); opacity:1; } to { transform: translate(-50%,-50%) scale(0.8); opacity:0; } }';
    document.head.appendChild(style);
  }
  container.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}
