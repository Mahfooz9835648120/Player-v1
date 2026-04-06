/**
 * Music Player — Audio playback, playlist management, AudioContext setup.
 */
import { EventBus, EVENTS } from '../utils/eventBus.js';
import { getState, setState } from '../utils/state.js';
import { formatTime } from '../utils/format.js';
import { initVisualizer } from './visualizer.js';
import { playlist } from './playlist.js';

const audio = document.getElementById('main-audio');
let audioCtx = null;
let analyser = null;
let sourceNode = null;
let freqTimer = null;

export function initMusicPlayer() {
  if (!audio) return;

  // Audio events → EventBus
  audio.addEventListener('play',       () => { setState('music.isPlaying', true);  EventBus.emit(EVENTS.MUSIC_PLAY, {}); updatePlayUI(true); });
  audio.addEventListener('pause',      () => { setState('music.isPlaying', false); EventBus.emit(EVENTS.MUSIC_PAUSE, {}); updatePlayUI(false); });
  audio.addEventListener('ended',      onTrackEnded);
  audio.addEventListener('timeupdate', onTimeUpdate);
  audio.addEventListener('loadedmetadata', () => {
    setState('music.duration', audio.duration);
    document.getElementById('music-duration').textContent = formatTime(audio.duration);
    updateAlbumRing(true);
  });

  // Control buttons
  document.getElementById('music-play-btn')?.addEventListener('click', togglePlay);
  document.getElementById('music-prev-btn')?.addEventListener('click', prevTrack);
  document.getElementById('music-next-btn')?.addEventListener('click', nextTrack);
  document.getElementById('shuffle-btn')?.addEventListener('click', toggleShuffle);
  document.getElementById('repeat-btn')?.addEventListener('click',  toggleRepeat);

  // Music seek bar
  const seekBar = document.getElementById('music-seek-bar');
  let isSeeking = false;
  seekBar?.addEventListener('mousedown', (e) => {
    isSeeking = true; seekTo(e);
    const onMove = (ev) => { if (isSeeking) seekTo(ev); };
    const onUp   = () => { isSeeking = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });
  seekBar?.addEventListener('touchstart', (e) => { isSeeking = true; seekTo(e); }, { passive: true });
  seekBar?.addEventListener('touchmove',  (e) => { if (isSeeking) seekTo(e); }, { passive: true });
  seekBar?.addEventListener('touchend',   () => { isSeeking = false; });

  function seekTo(e) {
    const rect = seekBar.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.currentTime = pct * (audio.duration || 0);
  }

  // Render the playlist
  renderPlaylist();

  // Load first track
  if (playlist.length) loadTrack(0);
}

function onTimeUpdate() {
  const ct  = audio.currentTime;
  const dur = audio.duration || 0;
  setState('music.currentTime', ct);

  const prog = dur > 0 ? ct / dur : 0;
  const progEl = document.getElementById('music-seek-progress');
  const thumbEl = document.getElementById('music-seek-thumb');
  const ctEl   = document.getElementById('music-current-time');
  if (progEl)  progEl.style.width = `${prog * 100}%`;
  if (thumbEl) thumbEl.style.left = `${prog * 100}%`;
  if (ctEl)    ctEl.textContent   = formatTime(ct);
}

function onTrackEnded() {
  const state = getState('music');
  if (state.repeat === 'one') {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } else {
    nextTrack();
  }
}

export function loadTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  setState('music.currentIndex', index);

  const track = playlist[index];
  audio.src = track.src;

  // Update now-playing UI
  document.getElementById('track-title').textContent  = track.title;
  document.getElementById('track-artist').textContent = track.artist;

  // Update album art
  const artEl = document.getElementById('album-art');
  artEl.innerHTML = track.cover
    ? `<img src="${track.cover}" alt="${track.title}" />`
    : `<div class="album-placeholder">♪</div>`;

  // Reset seek
  document.getElementById('music-seek-progress').style.width = '0%';
  document.getElementById('music-seek-thumb').style.left     = '0%';
  document.getElementById('music-current-time').textContent  = '0:00';
  document.getElementById('music-duration').textContent      = '--:--';

  EventBus.emit(EVENTS.MUSIC_TRACK, track);
  renderPlaylist();

  // Init audio context for visualizer (must be after user gesture)
  if (!audioCtx) initAudioContext();

  if (getState('music.isPlaying')) {
    audio.play().catch(() => {});
  }
}

function initAudioContext() {
  try {
    audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    analyser  = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    sourceNode = audioCtx.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);

    // Start frequency polling for orb
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    const poll = () => {
      analyser.getByteFrequencyData(freqData);
      EventBus.emit(EVENTS.MUSIC_FREQ, freqData);
      freqTimer = requestAnimationFrame(poll);
    };
    freqTimer = requestAnimationFrame(poll);

    // Feed to visualizer
    initVisualizer(analyser);
  } catch (err) {
    console.warn('[MusicPlayer] AudioContext init failed:', err.message);
  }
}

function togglePlay() {
  if (audio.paused) {
    // Resume AudioContext if suspended
    audioCtx?.resume();
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
}

export function nextTrack() {
  const state = getState('music');
  let next = state.currentIndex + 1;
  if (state.shuffle) next = Math.floor(Math.random() * playlist.length);
  if (next >= playlist.length) {
    if (state.repeat === 'all') next = 0;
    else return;
  }
  loadTrack(next);
  if (getState('music.isPlaying')) audio.play().catch(() => {});
}

export function prevTrack() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  const state = getState('music');
  let prev = state.currentIndex - 1;
  if (prev < 0) prev = playlist.length - 1;
  loadTrack(prev);
  if (getState('music.isPlaying')) audio.play().catch(() => {});
}

function toggleShuffle() {
  const newVal = !getState('music.shuffle');
  setState('music.shuffle', newVal);
  document.getElementById('shuffle-btn').classList.toggle('active', newVal);
}

function toggleRepeat() {
  const cur = getState('music.repeat');
  const next = cur === false ? 'all' : cur === 'all' ? 'one' : false;
  setState('music.repeat', next);
  const btn = document.getElementById('repeat-btn');
  btn.classList.toggle('active', next !== false);
  btn.title = next === 'one' ? 'Repeat one' : next === 'all' ? 'Repeat all' : 'Repeat off';
}

function updatePlayUI(playing) {
  const playIcon  = document.getElementById('music-play-icon');
  const pauseIcon = document.getElementById('music-pause-icon');
  const artEl     = document.getElementById('album-art');
  const ringEl    = document.getElementById('album-ring');

  if (playIcon)  playIcon.style.display  = playing ? 'none' : '';
  if (pauseIcon) pauseIcon.style.display = playing ? '' : 'none';
  artEl?.classList.toggle('playing', playing);
}

function updateAlbumRing(active) {
  document.getElementById('album-ring')?.classList.toggle('spinning', active);
}

function renderPlaylist() {
  const container = document.getElementById('playlist-container');
  if (!container) return;
  const currentIndex = getState('music.currentIndex');

  container.innerHTML = playlist.map((track, i) => `
    <div class="playlist-item${i === currentIndex ? ' active' : ''}" data-index="${i}">
      <span class="playlist-num">${i === currentIndex ? '▶' : i + 1}</span>
      <div class="playlist-art">${track.cover ? `<img src="${track.cover}" alt="" />` : '♪'}</div>
      <div class="playlist-info">
        <p class="playlist-title">${track.title}</p>
        <p class="playlist-artist">${track.artist}</p>
      </div>
      <span class="playlist-duration">${track.duration || '--:--'}</span>
    </div>
  `).join('');

  container.querySelectorAll('.playlist-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.index);
      loadTrack(idx);
      setState('music.isPlaying', true);
      audioCtx?.resume();
      audio.play().catch(() => {});
    });
  });
}
