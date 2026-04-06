import { useEffect } from 'react';
import { X, Eye, Heart, Share2, Maximize2 } from 'lucide-react';
import type { Stream } from '../data/streams';
import { formatViewers } from '../data/streams';
import styles from './StreamModal.module.css';

interface StreamModalProps {
  stream: Stream;
  onClose: () => void;
}

export default function StreamModal({ stream, onClose }: StreamModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.player}>
          <img src={stream.thumbnail} alt={stream.title} className={styles.playerImg} />
          <div className={styles.playerOverlay}>
            <div className={styles.liveTag}>
              <span className={styles.dot} />
              LIVE
            </div>
            <div className={styles.playerActions}>
              <button className={styles.playerBtn} title="Fullscreen">
                <Maximize2 size={18} />
              </button>
              <button className={styles.closeBtn} onClick={onClose} title="Close">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <img src={stream.avatar} alt={stream.streamer} className={styles.avatar} />
            <div className={styles.meta}>
              <h2 className={styles.title}>{stream.title}</h2>
              <p className={styles.streamer}>{stream.streamer}</p>
              <p className={styles.game}>{stream.game}</p>
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <Eye size={16} />
              <span>{formatViewers(stream.viewers)} watching</span>
            </div>
            <div className={styles.actions}>
              <button className={styles.followBtn}>
                <Heart size={16} />
                Follow
              </button>
              <button className={styles.subBtn}>Subscribe</button>
              <button className={styles.shareBtn}>
                <Share2 size={16} />
              </button>
            </div>
          </div>

          <div className={styles.tags}>
            {stream.tags.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
