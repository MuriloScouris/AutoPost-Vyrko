import prisma from '@/lib/prisma';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  // Buscar os posts aprovados com data de agendamento
  const posts = await prisma.post.findMany({
    where: {
      status: 'approved',
      scheduledFor: { not: null }
    },
    orderBy: {
      scheduledFor: 'asc'
    }
  });

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const daysInCurrentMonth = getDaysInMonth(today.getFullYear(), today.getMonth());
  const startDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  
  return (
    <main className={styles.mainContent}>
      <header className={styles.header}>
        <h1>Calendário de Publicações</h1>
        <p style={{ color: '#a1a1aa' }}>Visão geral dos posts agendados</p>
      </header>

      <div className={styles.calendarContainer}>
        <h2 className={styles.calendarTitle}>
          {today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
        </h2>
        
        <div className={styles.calendarGrid}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className={styles.calendarHeaderDay}>{day}</div>
          ))}
          
          {Array.from({ length: startDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          
          {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
            const day = i + 1;
            const postsForDay = posts.filter(p => {
              if (!p.scheduledFor) return false;
              const date = new Date(p.scheduledFor);
              return date.getDate() === day && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
            });

            const isToday = day === today.getDate();
            const hasPosts = postsForDay.length > 0;

            return (
              <div 
                key={day} 
                className={`${styles.calendarDay} ${hasPosts ? styles.calendarDayActive : styles.calendarDayEmpty}`}
              >
                <span 
                  className={styles.calendarDayNumber}
                  style={{ color: isToday ? '#3b82f6' : (hasPosts ? 'white' : '#6b7280') }}
                >
                  {day}
                </span>
                
                {postsForDay.map(p => {
                  const date = new Date(p.scheduledFor!);
                  return (
                    <div key={p.id} className={styles.postItem} title={p.title || p.theme}>
                      {date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} - {p.title || p.theme || 'Post'}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
