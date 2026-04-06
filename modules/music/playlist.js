/**
 * Playlist data — tracks served via the backend audio proxy (/api/audio/:id).
 * The proxy adds CORS headers so Web Audio API can analyze frequencies.
 */
export const playlist = [
  {
    title:    'Midnight Frequencies',
    artist:   'LoFi Collective',
    src:      '/api/audio/1',
    cover:    null,
    duration: '3:22',
  },
  {
    title:    'Glass Horizon',
    artist:   'Neon Static',
    src:      '/api/audio/2',
    cover:    null,
    duration: '4:06',
  },
  {
    title:    'Zero Gravity',
    artist:   'Void Signal',
    src:      '/api/audio/3',
    cover:    null,
    duration: '2:54',
  },
  {
    title:    'Digital Rainfall',
    artist:   'Ambient Circuits',
    src:      '/api/audio/4',
    cover:    null,
    duration: '3:41',
  },
  {
    title:    'Monochrome Pulse',
    artist:   'Static Wave',
    src:      '/api/audio/5',
    cover:    null,
    duration: '4:15',
  },
  {
    title:    'Orbit Decay',
    artist:   'Deep Signal',
    src:      '/api/audio/6',
    cover:    null,
    duration: '3:58',
  },
];
