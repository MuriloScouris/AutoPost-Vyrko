'use client';

import { useState } from 'react';
import PostCard from './PostCard';
import styles from './DashboardFilters.module.css';

interface Post {
  id: string;
  theme: string;
  title: string | null;
  caption: string | null;
  imageUrl: string | null;
  slides?: string | null;
  status: string;
}

type FilterType = 'all' | 'draft' | 'published';

export default function DashboardFilters({ posts }: { posts: Post[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true;
    return post.status === activeFilter;
  });

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: posts.length },
    { key: 'draft', label: 'Rascunhos', count: posts.filter(p => p.status === 'draft').length },
    { key: 'published', label: 'Publicados', count: posts.filter(p => p.status === 'published').length },
  ];

  return (
    <>
      <div className={styles.filterTabs}>
        {filters.map(f => (
          <button
            key={f.key}
            className={`${styles.filterTab} ${activeFilter === f.key ? styles.active : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
            <span className={styles.filterCount}>{f.count}</span>
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <div className={`glass-panel ${styles.emptyFilter}`}>
          <p>Nenhum post encontrado com o filtro "{filters.find(f => f.key === activeFilter)?.label}".</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
