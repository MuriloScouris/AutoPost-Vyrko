import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.theme || !data.caption || !data.slides || !Array.isArray(data.slides)) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando (theme, caption, slides)' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        theme: data.theme,
        title: data.slides[0], // O primeiro slide atua como título
        caption: data.caption,
        imageUrl: null, // Não usamos mais imageUrl única para carrosséis
        slides: JSON.stringify(data.slides),
        status: data.scheduledFor ? 'approved' : 'draft',
        ctaType: data.ctaType || 'engagement',
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar post:', error);
    return NextResponse.json({ error: 'Erro ao salvar o post' }, { status: 500 });
  }
}
