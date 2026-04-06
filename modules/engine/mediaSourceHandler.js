/**
 * MediaSource Handler — Manages MediaSource Extensions API.
 * Creates a MediaSource, attaches it to video, and manages SourceBuffer.
 */
export class MediaSourceHandler {
  constructor(video) {
    this.video = video;
    this.mediaSource = null;
    this.sourceBuffer = null;
    this._queue = [];         // pending buffers waiting to be appended
    this._appending = false;
    this._ready = false;
    this._initPromise = null;
  }

  isReady() { return this._ready && !this.sourceBuffer?.updating; }

  /** Initialize MediaSource and wait for 'sourceopen' */
  init(mimeType) {
    if (!MediaSource.isTypeSupported(mimeType)) {
      throw new Error(`MIME type not supported: ${mimeType}`);
    }

    this._initPromise = new Promise((resolve, reject) => {
      this.mediaSource = new MediaSource();
      this.video.src = URL.createObjectURL(this.mediaSource);

      this.mediaSource.addEventListener('sourceopen', () => {
        try {
          this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeType);
          this.sourceBuffer.mode = 'sequence'; // or 'segments'
          this.sourceBuffer.addEventListener('updateend', () => {
            this._appending = false;
            this._drainQueue();
          });
          this._ready = true;
          resolve();
        } catch (err) {
          reject(err);
        }
      }, { once: true });

      this.mediaSource.addEventListener('sourceended', () => { this._ready = false; });
      this.mediaSource.addEventListener('error', (e) => reject(e));
    });

    return this._initPromise;
  }

  /** Queue a buffer to be appended to the SourceBuffer */
  appendBuffer(arrayBuffer) {
    return new Promise((resolve, reject) => {
      this._queue.push({ buffer: arrayBuffer, resolve, reject });
      this._drainQueue();
    });
  }

  _drainQueue() {
    if (this._appending || !this._ready || !this._queue.length) return;
    if (this.sourceBuffer?.updating) return;

    const { buffer, resolve, reject } = this._queue.shift();
    this._appending = true;

    try {
      this.sourceBuffer.appendBuffer(buffer);
      // resolve when 'updateend' fires
      this.sourceBuffer.addEventListener('updateend', () => {
        resolve();
      }, { once: true });
    } catch (err) {
      this._appending = false;
      reject(err);
    }
  }

  /** Signal end of stream */
  endOfStream() {
    if (this.mediaSource?.readyState === 'open') {
      try { this.mediaSource.endOfStream(); } catch {}
    }
  }

  destroy() {
    this._ready = false;
    this._queue = [];
    if (this.video.src.startsWith('blob:')) {
      URL.revokeObjectURL(this.video.src);
    }
    if (this.mediaSource?.readyState === 'open') {
      try { this.mediaSource.endOfStream(); } catch {}
    }
  }
}
