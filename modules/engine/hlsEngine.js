/**
 * HLS Engine — wraps hls.js for .m3u8 stream playback.
 * Falls back to native HLS (Safari) when hls.js isn't needed.
 */
import { EventBus, EVENTS } from '../utils/eventBus.js';

export class HLSEngine {
  constructor(video) {
    this.video = video;
    this.hls = null;
    this._active = false;
  }

  /** Returns true if the URL is an HLS manifest */
  static isHLS(url) {
    return url.includes('.m3u8') || url.includes('application/x-mpegURL');
  }

  async load(url) {
    // Check if native HLS is supported (Safari)
    if (!window.Hls && this.video.canPlayType('application/vnd.apple.mpegurl')) {
      this.video.src = url;
      this._active = true;
      return true;
    }

    // Dynamically import hls.js
    let Hls;
    try {
      const mod = await import('hls.js');
      Hls = mod.default || mod;
    } catch {
      console.warn('[HLSEngine] hls.js not available, falling back to native');
      this.video.src = url;
      return true;
    }

    if (!Hls.isSupported()) {
      console.warn('[HLSEngine] HLS.js not supported in this environment');
      return false;
    }

    // Destroy any existing instance
    this.destroy();

    this.hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 30,
      maxMaxBufferLength: 60,
    });

    return new Promise((resolve) => {
      this.hls.loadSource(url);
      this.hls.attachMedia(this.video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        console.log(`[HLSEngine] Loaded ${data.levels.length} quality level(s)`);
        this._active = true;
        EventBus.emit(EVENTS.VIDEO_LOADED, { src: url, isHLS: true });
        resolve(true);
      });

      this.hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('[HLSEngine] Fatal error:', data.type, data.details);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              this.hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              this.hls.recoverMediaError();
              break;
            default:
              this.destroy();
              EventBus.emit(EVENTS.VIDEO_ERROR, { msg: 'HLS stream error' });
              resolve(false);
          }
        }
      });

      // Update quality badge
      this.hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const level = this.hls.levels[data.level];
        if (level) {
          const quality = level.height ? `${level.height}p` : 'AUTO';
          document.getElementById('quality-badge').textContent = quality;
        }
      });
    });
  }

  getCurrentLevel() {
    return this.hls?.currentLevel ?? -1;
  }

  setLevel(level) {
    if (this.hls) this.hls.currentLevel = level;
  }

  get isActive() { return this._active; }

  destroy() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    this._active = false;
  }
}
