import { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HeroBanner from './components/HeroBanner';
import StreamCard from './components/StreamCard';
import StreamModal from './components/StreamModal';
import type { Stream } from './data/streams';
import { streams, categories } from './data/streams';
import styles from './App.module.css';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = streams.filter(s => {
    const matchesSearch =
      searchQuery === '' ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.streamer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.app}>
      <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />

      <div className={styles.layout}>
        <Sidebar onStreamClick={setSelectedStream} />

        <main className={styles.main}>
          {searchQuery === '' && activeCategory === 'all' && (
            <HeroBanner onWatch={setSelectedStream} />
          )}

          {searchQuery === '' && (
            <section className={styles.categories}>
              <h2 className={styles.sectionTitle}>Browse by Category</h2>
              <div className={styles.categoryRow}>
                <button
                  className={`${styles.categoryBtn} ${activeCategory === 'all' ? styles.active : ''}`}
                  onClick={() => setActiveCategory('all')}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.active : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className={styles.streamSection}>
            <h2 className={styles.sectionTitle}>
              {searchQuery
                ? `Results for "${searchQuery}"`
                : activeCategory === 'all'
                ? 'Live Streams'
                : categories.find(c => c.id === activeCategory)?.name + ' Streams'}
              <span className={styles.count}>{filtered.length}</span>
            </h2>

            {filtered.length > 0 ? (
              <div className={styles.grid}>
                {filtered.map(stream => (
                  <StreamCard
                    key={stream.id}
                    stream={stream}
                    onClick={setSelectedStream}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <p>No streams found matching your search.</p>
                <button onClick={() => setSearchQuery('')}>Clear search</button>
              </div>
            )}
          </section>
        </main>
      </div>

      {selectedStream && (
        <StreamModal stream={selectedStream} onClose={() => setSelectedStream(null)} />
      )}
    </div>
  );
}
