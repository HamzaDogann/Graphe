"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import styles from "./SidebarSearch.module.scss";

interface SidebarSearchProps {
  collapsed: boolean;
}

export function SidebarSearch({ collapsed }: SidebarSearchProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    // TODO: Search logic
  };

  if (collapsed) {
    return (
      <button className={styles.searchIconButton} aria-label="Search">
        <Search size={20} />
      </button>
    );
  }

  return (
    <div className={styles.searchContainer}>
      <Search size={18} className={styles.searchIcon} />
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search chats..."
        value={query}
        onChange={handleSearch}
      />
    </div>
  );
}
