import { useState } from 'react';
import { Search, Bell, User, Menu, X, Tv2 } from 'lucide-react';
import styles from './Navbar.module.css';

interface NavbarProps {
  onSearch: (q: string) => void;
  searchQuery: string;
}

export default function Navbar({ onSearch, searchQuery }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.mobileMenu} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <a href="#" className={styles.logo}>
          <Tv2 size={26} color="#9147ff" />
          <span>Streamer<strong>Pro</strong></span>
        </a>
        <div className={styles.navLinks}>
          <a href="#" className={styles.navLink}>Browse</a>
          <a href="#" className={styles.navLink}>Following</a>
          <a href="#" className={styles.navLink}>Discover</a>
        </div>
      </div>

      <div className={`${styles.searchBar} ${inputFocused ? styles.focused : ''}`}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search streams, games, channels..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={20} />
        </button>
        <button className={`${styles.iconBtn} ${styles.signIn}`}>
          <User size={16} />
          <span>Sign In</span>
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileDropdown}>
          <a href="#" onClick={() => setMenuOpen(false)}>Browse</a>
          <a href="#" onClick={() => setMenuOpen(false)}>Following</a>
          <a href="#" onClick={() => setMenuOpen(false)}>Discover</a>
        </div>
      )}
    </nav>
  );
}
