import { Eye } from 'lucide-react';
import type { Stream } from '../data/streams';
import { formatViewers } from '../data/streams';
import styles from './StreamCard.module.css';

interface StreamCardProps {
  stream: Stream;
  onClick: (stream: Stream) => void;
}

export default function StreamCard({ stream, onClick }: StreamCardProps) {
  return (
    <div className={styles.card} onClick={() => onClick(stream)}>
      <div className={styles.thumbnail}>
        <img src={stream.thumbnail} alt={stream.title} loading="lazy" />
        {stream.isLive && <span className={styles.liveBadge}>LIVE</span>}
        <div className={styles.viewerCount}>
          <Eye size={12} />
          <span>{formatViewers(stream.viewers)}</span>
        </div>
      </div>
      <div className={styles.info}>
        <img src={stream.avatar} alt={stream.streamer} className={styles.avatar} />
        <div className={styles.details}>
          <p className={styles.title}>{stream.title}</p>
          <p className={styles.streamer}>{stream.streamer}</p>
          <p className={styles.game}>{stream.game}</p>
          <div className={styles.tags}>
            {stream.tags.slice(0, 2).map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
