import { Eye } from 'lucide-react';
import type { Stream } from '../data/streams';
import { streams, formatViewers } from '../data/streams';
import styles from './Sidebar.module.css';

interface SidebarProps {
  onStreamClick: (stream: Stream) => void;
}

export default function Sidebar({ onStreamClick }: SidebarProps) {
  const recommended = streams.slice(0, 6);

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.heading}>Recommended Channels</h3>
      <ul className={styles.list}>
        {recommended.map(stream => (
          <li key={stream.id} className={styles.item} onClick={() => onStreamClick(stream)}>
            <img src={stream.avatar} alt={stream.streamer} className={styles.avatar} />
            <div className={styles.info}>
              <p className={styles.name}>{stream.streamer}</p>
              <p className={styles.game}>{stream.game}</p>
            </div>
            <div className={styles.viewers}>
              <Eye size={11} />
              <span>{formatViewers(stream.viewers)}</span>
            </div>
            {stream.isLive && <span className={styles.liveDot} />}
          </li>
        ))}
      </ul>
    </aside>
  );
}
