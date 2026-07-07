import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Basic security check to ensure this is only triggered by Vercel Cron or authorized request
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    request.headers.get('x-vercel-cron') !== '1' &&
    // Permitir se for localhost (para testes fáceis)
    !request.url.includes('localhost')
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Buscar posts agendados para até agora, com status 'approved'
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: 'approved',
        scheduledFor: {
          lte: now
        }
      }
    });

    if (scheduledPosts.length === 0) {
      return NextResponse.json({ message: 'Nenhum post agendado para o momento.', count: 0 });
    }

    const origin = new URL(request.url).origin;
    let publishedCount = 0;
    const errors: string[] = [];

    // Tentar publicar cada post iterativamente
    for (const post of scheduledPosts) {
      try {
        const res = await fetch(`${origin}/api/publish-post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: post.id })
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          errors.push(`Erro ao publicar post ${post.id}: ${errData.error || res.statusText}`);
        } else {
          publishedCount++;
        }
      } catch (err: any) {
        errors.push(`Erro de rede no post ${post.id}: ${err.message}`);
      }
    }

    return NextResponse.json({ 
      message: `Processamento concluído.`,
      attempted: scheduledPosts.length,
      published: publishedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Erro no cron:', error);
    return NextResponse.json({ error: 'Erro interno no cron de agendamento' }, { status: 500 });
  }
}
