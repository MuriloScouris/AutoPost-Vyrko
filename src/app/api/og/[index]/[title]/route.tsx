import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, props: { params: Promise<{ index: string, title: string }> }) {
  try {
    const { origin } = new URL(request.url);
    const resolvedParams = await props.params;
    
    const indexStr = resolvedParams.index;
    const isCover = indexStr === '0';
    
    let titleRaw = resolvedParams.title;
    if (titleRaw.endsWith('.png')) {
      titleRaw = titleRaw.slice(0, -4);
    }
    
    // Tentar decodificar de base64url (novo formato seguro).
    let title = 'Vyrko Automations';
    try {
      if (!titleRaw.includes('%') && !titleRaw.includes(' ')) {
        const base64 = titleRaw.replace(/-/g, '+').replace(/_/g, '/');
        title = decodeURIComponent(escape(atob(base64)));
      } else {
        title = decodeURIComponent(titleRaw);
      }
    } catch(e) {
      title = decodeURIComponent(titleRaw) || 'Vyrko Automations';
    }
    
    // Split title for highlight effect (First word is highlighted, rest is white)
    const words = title.split(' ');
    const firstWord = words[0];
    const restOfTitle = words.slice(1).join(' ');

    // Fetch only fonts, Satori will fetch images directly
    const [fontRegularResponse, fontBoldResponse] = await Promise.all([
      fetch(new URL('/fonts/Montserrat-Regular.ttf', origin)),
      fetch(new URL('/fonts/Montserrat-Bold.ttf', origin)),
    ]);
    const [fontRegularBuffer, fontBoldBuffer] = await Promise.all([
      fontRegularResponse.arrayBuffer(),
      fontBoldResponse.arrayBuffer(),
    ]);
    
    const logoBase64 = new URL('/logo.png', origin).toString();
    
    // Create a prompt based on the title for dynamic AI image generation
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').trim().substring(0, 100);
    const imagePrompt = isCover 
      ? `cinematic professional corporate business automation technology futuristic dark theme ${cleanTitle}` 
      : `abstract dark technology background professional corporate theme related to ${cleanTitle}`;
      
    // Use pollinations.ai to generate a unique image related to the slide text
    const bgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1080&height=1350&nologo=true&seed=${indexStr}`;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#050505',
            backgroundImage: 'radial-gradient(circle at top right, rgba(29, 78, 216, 0.4), transparent 50%), radial-gradient(circle at bottom left, rgba(147, 51, 234, 0.3), transparent 50%)',
            padding: isCover ? '0' : '80px',
            fontFamily: '"Montserrat"',
          }}
        >
          {isCover ? (
            // =========================
            // COVER LAYOUT (index === 0)
            // =========================
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background Image filling everything */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={bgUrl} 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                }} 
              />
              <div
                style={{
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: 'rgba(5, 5, 5, 0.65)'
                }}
              />
              
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  padding: '100px',
                }}
              >
                {/* Logo Top Center */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '80px' }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(10,10,10,0.8)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    marginBottom: '20px',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoBase64} width={90} height={90} alt="Vyrko" style={{ objectFit: 'contain' }} />
                  </div>
                  <div style={{ color: 'white', fontSize: '42px', fontWeight: 'bold', letterSpacing: '2px' }}>
                    VYRKO AUTOMATIONS
                  </div>
                </div>

                {/* Huge Centered Title */}
                <div
                  style={{
                    fontSize: '110px',
                    fontWeight: 700,
                    color: 'white',
                    lineHeight: 1.1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    textAlign: 'center',
                    justifyContent: 'center',
                    textShadow: '0 10px 30px rgba(0, 0, 0, 0.9)',
                    letterSpacing: '-2px',
                    marginTop: 'auto',
                    marginBottom: 'auto',
                  }}
                >
                  <span style={{ color: '#3b82f6', marginRight: '24px' }}>{firstWord}</span>
                  <span>{restOfTitle}</span>
                </div>

                {/* Footer Pill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  padding: '20px 40px',
                  borderRadius: '100px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '32px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  marginTop: 'auto'
                }}>
                  Arraste para ler
                  <span style={{ marginLeft: '16px', color: '#3b82f6', fontSize: '38px' }}>→</span>
                </div>
              </div>
            </div>
          ) : (
            // =========================
            // CONTENT SLIDE (index > 0)
            // =========================
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(20, 20, 20, 0.85)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '32px',
                padding: '60px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Header / Logo */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '50px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0a',
                    marginRight: '20px',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoBase64}
                      width={60}
                      height={60}
                      alt="Vyrko"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ color: 'white', fontSize: '36px', fontWeight: 'bold' }}>
                    Vyrko
                  </div>
                </div>
                
                <div style={{
                  color: '#3b82f6',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  padding: '12px 24px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '50px',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6', marginRight: '12px', boxShadow: '0 0 10px #3b82f6' }}></div>
                  CONTEÚDO VYRKO
                </div>
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: '68px',
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.2,
                  display: 'flex',
                  flexWrap: 'wrap',
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
                  letterSpacing: '-1px',
                }}
              >
                <span style={{ color: '#3b82f6', marginRight: '16px' }}>{firstWord}</span>
                <span>{restOfTitle}</span>
              </div>

              {/* Empty space filled with Image */}
              <div
                style={{
                  flex: 1,
                  width: '100%',
                  marginTop: '60px',
                  marginBottom: '50px',
                  display: 'flex',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bgUrl} style={{ width: '100%', height: '100%' }} />
              </div>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '2px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '30px',
                  color: '#9ca3af',
                  fontSize: '28px',
                }}
              >
                <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>vyrko.com.br</span>
                
                {/* Pill Button CTA */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#1f2937',
                  padding: '16px 32px',
                  borderRadius: '50px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '26px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}>
                  Arrasta para o lado 
                  <span style={{ marginLeft: '12px', color: '#3b82f6', fontSize: '30px' }}>→</span>
                </div>
              </div>
            </div>
          )}
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

