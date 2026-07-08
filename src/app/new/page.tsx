'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

// Safely encode string to base64url for URLs (browser compatible)
const toBase64Url = (str: string) => {
  try {
    const base64 = btoa(unescape(encodeURIComponent(str)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    return encodeURIComponent(str);
  }
};

export default function NewPost() {
  const router = useRouter();
  const [theme, setTheme] = useState('');
  const [tone, setTone] = useState('default');
  const [format, setFormat] = useState('');
  const [audience, setAudience] = useState('');
  const [socialProof, setSocialProof] = useState('');
  const [ctaType, setCtaType] = useState('engagement');
  const [cta, setCta] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [generatedPost, setGeneratedPost] = useState<{
    slides: string[];
    caption: string;
    ctaType?: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!theme) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, tone, format, audience, socialProof, ctaType, cta })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro desconhecido ao gerar post. Verifique se a GEMINI_API_KEY está configurada no .env.');
        return;
      }
      if (data.slides && data.caption) {
        setGeneratedPost({ ...data, ctaType });
      } else {
        setError('A IA não retornou slides ou legenda válidos. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro de rede ao tentar gerar o post. Verifique se o servidor está rodando.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPost) return;
    setIsSaving(true);
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, scheduledFor: scheduledFor || null, ...generatedPost })
      });
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar post');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1>Novo Post Assistido por IA</h1>
            <p>Deixe o Gemini criar conteúdo de alta conversão para a Vyrko.</p>
          </div>
        </header>

        <div className={styles.formContainer}>
          <div className={`glass-panel ${styles.formGroup}`}>
            
            <div className={styles.sectionTitle}>
              <h2>1. O que vamos criar?</h2>
              <p>Forneça os detalhes e a IA cuidará do resto.</p>
            </div>

            <div className={styles.inputGroup}>
              <label>Tema Principal <span className={styles.required}>*</span></label>
              <textarea 
                rows={3} 
                placeholder="Ex: Como a automação de processos pode reduzir 30% dos custos operacionais de uma empresa."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>

            <div className={styles.rowInputs}>
              <div className={styles.inputGroup}>
                <label>Formato Editorial</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option value="">Automático (a IA decide)</option>
                  <option value="case">📋 Case de Projeto (Antes/Depois)</option>
                  <option value="dica">💡 Dica Técnica / Educativa</option>
                  <option value="bastidores">🔧 Bastidores de Desenvolvimento</option>
                  <option value="opiniao">🗣️ Opinião / Tendência</option>
                  <option value="comparativo">⚖️ Comparativo (A vs. B)</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Nível do Público</label>
                <select value={audience} onChange={(e) => setAudience(e.target.value)}>
                  <option value="">Automático</option>
                  <option value="leigo">🏢 Leigo (Dono de Negócio / Empreendedor)</option>
                  <option value="tecnico">💻 Técnico (Dev / CTO / Engenheiro)</option>
                </select>
              </div>
            </div>

            <div className={styles.rowInputs}>
              <div className={styles.inputGroup}>
                <label>Tom de Voz</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option value="default">Padrão Vyrko (Profissional)</option>
                  <option value="casual">Descontraído / Casual</option>
                  <option value="agressivo">Agressivo em Vendas</option>
                  <option value="educativo">Educativo / Didático</option>
                  <option value="inspirador">Inspirador / Motivacional</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Prova Social / Contexto <small>(opcional)</small></label>
                <textarea
                  rows={2}
                  placeholder="Ex: Reduziu 40% do tempo de atendimento. Tecnologias: Python, n8n, LangChain. Cliente: clínica de estética."
                  value={socialProof}
                  onChange={(e) => setSocialProof(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>CTA — Chamada para Ação</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className={styles.radioOption} style={{ border: ctaType === 'diagnostico' ? '1px solid var(--primary)' : '1px solid transparent' }}>
                  <input type="radio" name="ctaType" value="diagnostico" checked={ctaType === 'diagnostico'} onChange={() => setCtaType('diagnostico')} />
                  <span><strong>🩺 Diagnóstico Gratuito:</strong> Agendar uma consultoria gratuita.</span>
                </label>
                <label className={styles.radioOption} style={{ border: ctaType === 'dm' ? '1px solid var(--primary)' : '1px solid transparent' }}>
                  <input type="radio" name="ctaType" value="dm" checked={ctaType === 'dm'} onChange={() => setCtaType('dm')} />
                  <span><strong>📩 DM:</strong> Direcionar para mensagem direta.</span>
                </label>
                <label className={styles.radioOption} style={{ border: ctaType === 'link_bio' ? '1px solid var(--primary)' : '1px solid transparent' }}>
                  <input type="radio" name="ctaType" value="link_bio" checked={ctaType === 'link_bio'} onChange={() => setCtaType('link_bio')} />
                  <span><strong>🔗 Link na Bio:</strong> Portfólio / Formulário de contato.</span>
                </label>
                <label className={styles.radioOption} style={{ border: ctaType === 'engagement' ? '1px solid var(--primary)' : '1px solid transparent' }}>
                  <input type="radio" name="ctaType" value="engagement" checked={ctaType === 'engagement'} onChange={() => setCtaType('engagement')} />
                  <span><strong>👍 Engajamento:</strong> Curtir, Comentar e Compartilhar.</span>
                </label>
                <label className={styles.radioOption} style={{ border: ctaType === 'conversion' ? '1px solid var(--primary)' : '1px solid transparent' }}>
                  <input type="radio" name="ctaType" value="conversion" checked={ctaType === 'conversion'} onChange={() => setCtaType('conversion')} />
                  <span><strong>🟣 Conversão:</strong> Checklist roxo (Salvar, Comentar, Enviar).</span>
                </label>
                <label className={styles.radioOption} style={{ border: ctaType === 'none' ? '1px solid var(--primary)' : '1px solid transparent' }}>
                  <input type="radio" name="ctaType" value="none" checked={ctaType === 'none'} onChange={() => setCtaType('none')} />
                  <span><strong>🚫 Sem CTA:</strong> Apenas os slides do conteúdo.</span>
                </label>
                <label className={styles.radioOption} style={{ border: ctaType === 'custom' ? '1px solid var(--primary)' : '1px solid transparent' }}>
                  <input type="radio" name="ctaType" value="custom" checked={ctaType === 'custom'} onChange={() => setCtaType('custom')} />
                  <span><strong>✏️ Personalizado:</strong> Digite seu próprio CTA.</span>
                </label>
              </div>
            </div>

            {ctaType === 'custom' && (
              <div className={styles.inputGroup}>
                <input 
                  type="text"
                  placeholder="Ex: Comente 'EU QUERO' para receber o link..."
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                />
              </div>
            )}
            <button 
              className="btn-primary" 
              onClick={handleGenerate}
              disabled={isLoading || !theme}
            >
              {isLoading ? 'Gerando com Gemini...' : 'Gerar Post com IA'}
            </button>

            {error && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius)',
                color: '#fca5a5',
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          <div className={`glass-panel ${styles.previewContainer}`}>
            <h2>2. Preview do Instagram</h2>
            
            {!generatedPost ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                Preencha o tema ao lado e clique em gerar para ver como ficará o seu post.
              </div>
            ) : (
              <>
                <div className={styles.igPreview}>
                  <div className={styles.igHeader}>
                    <div className={styles.igAvatar}>
                      <div className={styles.igAvatarInner}>V</div>
                    </div>
                    <div className={styles.igUsername}>vyrko.ai</div>
                  </div>
                  
                  <div className={styles.igImage} style={{ display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '1rem' }}>
                    {generatedPost.slides ? (
                      <>
                        {generatedPost.slides.map((slide, index) => (
                          <div key={index} style={{ flex: '0 0 auto', width: '300px', height: '300px', position: 'relative' }}>
                            <Image 
                              src={`/api/og?index=${index}&title=${toBase64Url(slide)}`} 
                              alt={`Slide ${index + 1}`} 
                              fill
                              style={{ objectFit: 'cover', borderRadius: '8px' }}
                              unoptimized={true} 
                            />
                          </div>
                        ))}
                        {generatedPost.ctaType !== 'none' && (
                          <div style={{ flex: '0 0 auto', width: '300px', height: '300px', position: 'relative' }}>
                            <Image 
                              src={`/api/cta/${generatedPost.ctaType || 'engagement'}.png?v=3`} 
                              alt="CTA Slide" 
                              fill
                              style={{ objectFit: 'cover', borderRadius: '8px' }}
                              unoptimized={true} 
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <span>Gerando Imagem...</span>
                    )}
                  </div>
                  
                  <div className={styles.igCaptionBox}>
                    <span>vyrko.ai</span> {generatedPost.caption}
                  </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <label htmlFor="schedule" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>🗓️ Agendar publicação (Opcional):</label>
                  <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '1rem' }}>Se preenchido, o post será publicado automaticamente na data escolhida.</p>
                  <input
                    type="datetime-local"
                    id="schedule"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      background: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      fontFamily: 'inherit',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <button 
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '1rem', background: 'var(--success)' }}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Salvando...' : scheduledFor ? 'Salvar e Agendar' : 'Salvar Rascunho na Fila'}
                </button>
              </>
            )}
          </div>
        </div>
    </main>
  );
}
