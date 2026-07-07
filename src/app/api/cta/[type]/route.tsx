import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, context: { params: Promise<{ type: string }> }) {
  try {
    const { origin } = new URL(request.url);
    const params = await context.params;
    const typeWithExt = params.type || 'engagement.png';
    const type = typeWithExt.replace('.png', '');

    // Fetch logo and fonts in parallel for speed
    const [logoResponse, fontRegularResponse, fontBoldResponse] = await Promise.all([
      fetch(new URL('/logo.png', origin)),
      fetch(new URL('/fonts/Montserrat-Regular.ttf', origin)),
      fetch(new URL('/fonts/Montserrat-Bold.ttf', origin)),
    ]);
    const [logoBuffer, fontRegularBuffer, fontBoldBuffer] = await Promise.all([
      logoResponse.arrayBuffer(),
      fontRegularResponse.arrayBuffer(),
      fontBoldResponse.arrayBuffer(),
    ]);
    const logoBase64 = `data:image/png;base64,${Buffer.from(logoBuffer).toString('base64')}`;

    let content = null;

    if (type === 'conversion') {
      content = (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              backgroundColor: '#050505',
              backgroundImage: 'radial-gradient(circle at top right, rgba(147, 51, 234, 0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(88, 28, 135, 0.1), transparent 50%)',
              padding: '120px 80px',
              fontFamily: '"Montserrat"',
              position: 'relative',
              overflow: 'hidden',
            }}
          >

            <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '40px' }}>
              
              {/* Title */}
              <div
                style={{
                  fontSize: '80px',
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: 1.2,
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '80px',
                  letterSpacing: '-2px',
                }}
              >
                <div style={{ display: 'flex' }}>
                  <span>Esse </span>
                  <span style={{ color: '#d8b4fe', marginLeft: '24px' }}>conteúdo</span>
                  <span style={{ marginLeft: '24px' }}> foi</span>
                </div>
                <span>útil para você ?</span>
              </div>

              {/* List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '50px', marginBottom: '100px' }}>
                
                {/* Item 1: Save */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '70px', height: '70px', backgroundColor: '#a855f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '30px', flexShrink: 0 }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', color: '#d1d5db', fontSize: '38px', lineHeight: 1.2 }}>
                    <span>Então salve para consultar</span>
                    <span>quando precisar!</span>
                  </div>
                </div>

                {/* Item 2: Like */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '70px', height: '70px', backgroundColor: '#a855f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '30px', flexShrink: 0 }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </div>
                  <div style={{ color: '#d1d5db', fontSize: '38px' }}>
                    Curta se gostou
                  </div>
                </div>

                {/* Item 3: Comment */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '70px', height: '70px', backgroundColor: '#a855f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '30px', flexShrink: 0 }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </div>
                  <div style={{ color: '#d1d5db', fontSize: '38px' }}>
                    Deixe seu comentário!
                  </div>
                </div>

                {/* Item 4: Send */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '70px', height: '70px', backgroundColor: '#a855f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '30px', flexShrink: 0 }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </div>
                  <div style={{ color: '#d1d5db', fontSize: '38px' }}>
                    Envie para um amigo!
                  </div>
                </div>

              </div>

              {/* Bottom text */}
              <div style={{ fontSize: '42px', color: 'white', marginBottom: '80px', marginTop: '20px' }}>
                Siga para mais dicas como essa!
              </div>

              {/* Handle */}
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 'auto' }}>
                <div style={{ fontSize: '48px', color: '#9ca3af', fontWeight: 500 }}>
                  @vyrko.ai
                </div>
              </div>

            </div>
          </div>
      );
    } else {
      content = (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              backgroundColor: '#111',
              padding: '120px 80px',
              fontFamily: '"Montserrat"',
              position: 'relative',
              overflow: 'hidden',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '100px', backgroundColor: '#0a0a0a', padding: '16px 32px', borderRadius: '24px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#171717',
                marginRight: '24px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoBase64}
                  width={40}
                  height={40}
                  alt="Vyrko"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div style={{ color: 'white', fontSize: '36px', fontWeight: 'bold' }}>
                Vyrko
              </div>
            </div>

            <div
              style={{
                fontSize: '80px',
                fontWeight: 'bold',
                color: '#3b82f6',
                textShadow: '0 0 40px rgba(59, 130, 246, 0.4)',
                textAlign: 'center',
                marginBottom: '60px',
                lineHeight: 1.2,
                display: 'flex'
              }}
            >
              Curtiu o conteúdo?
            </div>

            <div style={{
              fontSize: '40px',
              color: '#d1d5db',
              textAlign: 'center',
              lineHeight: 1.5,
              maxWidth: '85%',
              marginBottom: 'auto'
            }}>
              Siga a nossa página para não perder dicas e novidades sobre automação e inteligência artificial!
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', marginTop: '100px', marginBottom: '100px' }}>
              {/* Like */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                <div style={{ color: '#ef4444', display: 'flex' }}>
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
                <span style={{ color: 'white', fontSize: '28px' }}>Curta</span>
              </div>

              {/* Comment */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                <div style={{ color: '#93c5fd', display: 'flex' }}>
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </div>
                <span style={{ color: 'white', fontSize: '28px' }}>Comente</span>
              </div>

              {/* Share */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                <div style={{ display: 'flex' }}>
                  <svg width="100" height="100" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M54.5457 9.45424L37.9542 56.4024L29.6202 34.3797L7.59765 26.0457L54.5457 9.45424Z" fill="#3b82f6"/>
                    <path d="M29.62 34.3802L18.7758 45.2244C16.8232 47.177 16.8232 50.3429 18.7758 52.2954C20.7285 54.2481 23.8943 54.2481 25.8469 52.2954L36.6911 41.4513" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M54.5457 9.45424L29.6202 34.3797" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 42L25 45" stroke="#ef4444" strokeWidth="6" strokeLinecap="round"/>
                  </svg>
                </div>
                <span style={{ color: 'white', fontSize: '28px' }}>Compartilhe</span>
              </div>
            </div>

          </div>
      );
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
          }}
        >
          {content}
        </div>
      ),
      {
        width: 1080,
        height: 1350,
        headers: {
          'Cache-Control': 'public, max-age=86400',
        },
        fonts: [
          {
            name: 'Montserrat',
            data: fontRegularBuffer,
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Montserrat',
            data: fontBoldBuffer,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
