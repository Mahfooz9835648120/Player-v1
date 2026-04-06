/**
 * Streamer Pro — Main Application Entry Point
 * Bootstraps all modules and wires together the event system.
 */
import './style.css';
import { detectCapability } from './modules/utils/deviceCapability.js';
import { loadHistory }       from './modules/utils/state.js';
import { initNavigation, initPanels, initToast } from './modules/ui/navigation.js';
import { Orb }               from './modules/ui/orb.js';
import { initVideoPlayer }   from './modules/video/player.js';
import { initLibrary }       from './modules/video/library.js';
import { initPiP }           from './modules/video/pip.js';
import { initMusicPlayer }   from './modules/music/player.js';
import { initTelepartyClient } from './modules/teleparty/client.js';
import { initRoom }          from './modules/teleparty/room.js';
import { initChat }          from './modules/teleparty/chat.js';

async function boot() {
  // ——— 1. Device capability detection (first — affects all subsequent modules) ———
  const { isLowEnd } = detectCapability();
  console.log(`[StreamerPro] Booting. Low-perf mode: ${isLowEnd}`);

  // ——— 2. Load persisted state ———
  loadHistory();

  // ——— 3. Core UI ———
  initNavigation();
  const panels = initPanels();
  initToast();

  // ——— 4. Anti-gravity orb ———
  Orb.init();

  // ——— 5. Video player ———
  initVideoPlayer();
  await initLibrary();
  initPiP();

  // ——— 6. Music player ———
  initMusicPlayer();

  // ——— 7. Teleparty (WebSocket-based sync) ———
  initTelepartyClient();
  initRoom();
  initChat();

  // ——— 8. PWA install prompt ———
  initInstallPrompt();

  console.log('[StreamerPro] App ready ✓');
}

function initInstallPrompt() {
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Could show a custom install button here
  });

  // If launched standalone (already installed), tweak header slightly
  if (window.matchMedia('(display-mode: standalone)').matches) {
    document.documentElement.dataset.standalone = 'true';
  }
}

// Boot on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
