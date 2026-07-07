import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'postId não fornecido' }, { status: 400 });
    }

    // Busca o post no banco de dados
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    if (post.status === 'published') {
      return NextResponse.json({ error: 'Post já publicado' }, { status: 400 });
    }

    const settings = await prisma.settings.findMany({
      where: { key: { in: ['igToken', 'igAccountId'] } }
    });
    const tokenSetting = settings.find(s => s.key === 'igToken')?.value;
    const accountSetting = settings.find(s => s.key === 'igAccountId')?.value;

    const accountId = accountSetting || process.env.INSTAGRAM_ACCOUNT_ID;
    const accessToken = tokenSetting || process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accountId || !accessToken) {
      return NextResponse.json({ error: 'Credenciais do Instagram não configuradas. Vá na página de Configurações.' }, { status: 500 });
    }

    // Parse slides
    let slides: string[] = [];
    if (post.slides) {
      try { slides = JSON.parse(post.slides); } catch (e) {}
    } else if (post.imageUrl) {
      // Fallback for old single-image posts
      slides = [post.title || 'Post'];
    }

    if (slides.length === 0) {
      return NextResponse.json({ error: 'Nenhum slide encontrado neste post' }, { status: 400 });
    }

    // Construir URLs públicas das imagens
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;
    
    // Removido o cacheBuster (?v=3) pois o Facebook Crawler pode rejeitar URLs que não terminam exatamente em .png
    const imageUrls = slides
      .filter(slide => slide && slide.trim().length > 0)
      .map((slide, index) => {
        // Usar base64url garante que caracteres especiais (como barras) não quebrem a rota do Next.js
        const safeTitle = Buffer.from(slide).toString('base64url');
        return `${baseUrl}/api/og/${index}/${safeTitle}.png`;
      });


    // Verificação de ambiente local
    if (baseUrl.includes('localhost')) {
      console.warn(`[WARN] Simulando publicação de carrossel no localhost com ${imageUrls.length} slides.`);
      
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { status: 'published' }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Publicação simulada com sucesso (localhost detectado).',
        post: updatedPost 
      });
    }

    // --- CÓDIGO REAL DE PUBLICAÇÃO NO INSTAGRAM ---

    // 0. Pré-aquecer o cache da Vercel para evitar Timeouts do bot da Meta
    console.log('Pré-carregando imagens para o cache da Vercel...');
    await Promise.allSettled(imageUrls.map(url => fetch(url)));

    // 1. Criar contêineres para TODOS os slides em paralelo (muito mais rápido)
    console.log(`Criando ${imageUrls.length} itens do carrossel em paralelo...`);
    const carouselItemResults = await Promise.all(
      imageUrls.filter(Boolean).map(async (url) => {
        // Adicionamos media_type=IMAGE explicitamente para evitar que o Facebook se confunda com o Content-Type
        const createItemUrl = `https://graph.facebook.com/v18.0/${accountId}/media?image_url=${encodeURIComponent(url)}&is_carousel_item=true&media_type=IMAGE&access_token=${accessToken}`;
        const itemRes = await fetch(createItemUrl, { method: 'POST' });
        const itemData = await itemRes.json();
        return { ok: itemRes.ok, data: itemData, url };
      })
    );

    // Checar erros
    const failedItem = carouselItemResults.find(r => !r.ok || r.data.error);
    if (failedItem) {
      console.error('Erro ao criar slide do carrossel:', failedItem.data);
      return NextResponse.json({ error: `Erro ao criar slide: ${failedItem.data.error?.message}` }, { status: 500 });
    }
    const childrenIds = carouselItemResults.map(r => r.data.id);

    // 2. Criar o Contêiner Pai do Carrossel agrupando as imagens
    const createCarouselUrl = `https://graph.facebook.com/v18.0/${accountId}/media?media_type=CAROUSEL&children=${childrenIds.join(',')}&caption=${encodeURIComponent(post.caption || '')}&access_token=${accessToken}`;
    const carouselRes = await fetch(createCarouselUrl, { method: 'POST' });
    const carouselData = await carouselRes.json();

    if (!carouselRes.ok || carouselData.error) {
      console.error('Erro ao criar contêiner do carrossel:', carouselData);
      return NextResponse.json({ error: `Erro na criação do carrossel: ${carouselData.error?.message}` }, { status: 500 });
    }
    const carouselCreationId = carouselData.id;

    // 3. Publicar o Carrossel Final
    const publishUrl = `https://graph.facebook.com/v18.0/${accountId}/media_publish?creation_id=${carouselCreationId}&access_token=${accessToken}`;
    const publishRes = await fetch(publishUrl, { method: 'POST' });
    const publishData = await publishRes.json();

    if (!publishRes.ok || publishData.error) {
      console.error('Erro ao publicar carrossel:', publishData);
      return NextResponse.json({ error: `Erro na publicação: ${publishData.error?.message}` }, { status: 500 });
    }

    // 4. Atualizar o banco de dados
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { status: 'published' }
    });

    return NextResponse.json({ success: true, post: updatedPost, igId: publishData.id });

  } catch (error) {
    console.error('Erro ao publicar post:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
