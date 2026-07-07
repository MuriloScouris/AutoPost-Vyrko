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
  scheduledFor?: string | Date | null;
}

type FilterType = 'all' | 'draft' | 'published' | 'approved';

export default function DashboardFilters({ posts }: { posts: Post[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true;
    return post.status === activeFilter;
  });

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: posts.length },
    { key: 'draft', label: 'Rascunhos', count: posts.filter(p => p.status === 'draft').length },
    { key: 'approved', label: 'Agendados', count: posts.filter(p => p.status === 'approved').length },
    { key: 'published', label: 'Publicados', count: posts.filter(p => p.status === 'published').length },
  ];

  // Helper for Calendar
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const daysInCurrentMonth = getDaysInMonth(today.getFullYear(), today.getMonth());
  const scheduledPosts = posts.filter(p => p.status === 'approved' && p.scheduledFor);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
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

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '4px' }}>
          <button 
            onClick={() => setViewMode('list')}
            style={{ padding: '6px 12px', borderRadius: '6px', background: viewMode === 'list' ? '#3b82f6' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: viewMode === 'list' ? 'bold' : 'normal' }}
          >
            📋 Grade
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            style={{ padding: '6px 12px', borderRadius: '6px', background: viewMode === 'calendar' ? '#3b82f6' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: viewMode === 'calendar' ? 'bold' : 'normal' }}
          >
            📅 Calendário
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            {today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', color: '#a1a1aa' }}>{day}</div>
            ))}
            {/* Empty slots for start of month padding (simplification: assume month starts on day 1 column for demo, ideally we calculate start day) */}
            {Array.from({ length: new Date(today.getFullYear(), today.getMonth(), 1).getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
            
            {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
              const day = i + 1;
              const postsForDay = scheduledPosts.filter(p => {
                const date = new Date(p.scheduledFor!);
                return date.getDate() === day && date.getMonth() === today.getMonth();
              });

              return (
                <div key={day} style={{ 
                  aspectRatio: '1', 
                  background: postsForDay.length > 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)', 
                  border: postsForDay.length > 0 ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', 
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start'
                }}>
                  <span style={{ fontWeight: 'bold', color: day === today.getDate() ? '#3b82f6' : 'white' }}>{day}</span>
                  {postsForDay.map(p => (
                    <div key={p.id} style={{ marginTop: '4px', background: '#3b82f6', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '4px', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {new Date(p.scheduledFor!).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} - Post
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className={`glass-panel ${styles.emptyFilter}`}>
          <p>Nenhum post encontrado com o filtro "{filters.find(f => f.key === activeFilter)?.label}".</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post as any} />
          ))}
        </div>
      )}
    </>
  );
}
