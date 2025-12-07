import Link from "next/link";
import styles from "./Logo.module.scss";

export function Logo() {
  return (
    <Link href="/" className={styles.logo}>
      <div className={styles.logoIcon}>
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#1a1a1a" />
          <path
            d="M16 8C11.6 8 8 11.6 8 16s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"
            fill="white"
          />
          <path
            d="M16 12c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
            fill="white"
          />
        </svg>
      </div>
      <span className={styles.logoText}>Graphe</span>
    </Link>
  );
}
