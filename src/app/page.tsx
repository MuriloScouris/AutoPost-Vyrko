import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import DashboardFilters from '@/components/DashboardFilters';
import prisma from '@/lib/prisma';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const stats = {
    total: posts.length,
    drafts: posts.filter(p => p.status === 'draft').length,
    published: posts.filter(p => p.status === 'published').length,
  };

  return (
    <div className={styles.dashboard}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1>Fila de Posts</h1>
            <p>Aprove, edite ou agende o conteúdo gerado pela IA.</p>
          </div>
          <Link href="/new" className="btn-primary">
            + Gerar Novo Post
          </Link>
        </header>

        {/* Stats Cards */}
        <div className={styles.statsRow}>
          <div className={`glass-panel ${styles.statCard}`}>
            <span className={styles.statNumber}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={`glass-panel ${styles.statCard} ${styles.statDraft}`}>
            <span className={styles.statNumber}>{stats.drafts}</span>
            <span className={styles.statLabel}>Rascunhos</span>
          </div>
          <div className={`glass-panel ${styles.statCard} ${styles.statPublished}`}>
            <span className={styles.statNumber}>{stats.published}</span>
            <span className={styles.statLabel}>Publicados</span>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className={`glass-panel ${styles.emptyState}`}>
            <h2>Nenhum post na fila</h2>
            <p>Sua fila está vazia. Comece gerando um novo post sobre tecnologia, automação ou IA para sua audiência.</p>
            <Link href="/new" className="btn-primary" style={{ marginTop: '1rem' }}>
              Gerar Primeiro Post
            </Link>
          </div>
        ) : (
          <DashboardFilters posts={JSON.parse(JSON.stringify(posts))} />
        )}
      </main>
    </div>
  );
}
