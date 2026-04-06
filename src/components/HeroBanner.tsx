import { Play, Eye } from 'lucide-react';
import type { Stream } from '../data/streams';
import { streams, formatViewers } from '../data/streams';
import styles from './HeroBanner.module.css';

interface HeroBannerProps {
  onWatch: (stream: Stream) => void;
}

export default function HeroBanner({ onWatch }: HeroBannerProps) {
  const featured = streams[0];

  return (
    <div className={styles.banner} onClick={() => onWatch(featured)}>
      <img src={featured.thumbnail} alt={featured.title} className={styles.bg} />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.badges}>
          <span className={styles.live}>🔴 LIVE</span>
          <span className={styles.viewers}>
            <Eye size={14} />
            {formatViewers(featured.viewers)} watching
          </span>
        </div>
        <h1 className={styles.title}>{featured.title}</h1>
        <p className={styles.streamer}>{featured.streamer} · {featured.game}</p>
        <div className={styles.tags}>
          {featured.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
        </div>
        <button className={styles.watchBtn}>
          <Play size={18} fill="white" />
          Watch Now
        </button>
      </div>
    </div>
  );
}
