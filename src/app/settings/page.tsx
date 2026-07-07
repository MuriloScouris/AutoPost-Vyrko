'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import styles from './page.module.css';

export default function Settings() {
  const [settings, setSettings] = useState({
    igToken: '',
    igAccountId: '',
    postFrequency: '3',
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
    aiPrompt: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading('Salvando configurações...');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success('Configurações salvas com sucesso!', { id: toastId });
      } else {
        throw new Error('Erro na API');
      }
    } catch (err) {
      toast.error('Erro ao salvar as configurações.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const hasGeminiKey = true; // Still driven by .env since it's secret for API route only
  const hasInstagramToken = !!settings.igToken;

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1>Configurações</h1>
            <p>Gerencie as integrações e preferências da plataforma.</p>
          </div>
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </header>

        <div className={styles.settingsGrid}>
          <div className={`glass-panel ${styles.section}`}>
            <h2>🤖 Integração com IA (Gemini)</h2>
            <div className={styles.inputGroup}>
              <label>Status da API Key</label>
              <span className={`${styles.badge} ${!hasGeminiKey ? styles.badgeWarning : ''}`}>
                {hasGeminiKey ? '✓ Configurada via .env' : '⚠ Não configurada'}
              </span>
              <small>
                Defina a variável <code>GEMINI_API_KEY</code> no arquivo <code>.env</code> na raiz do projeto.
              </small>
            </div>
            
            <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
              <label>Prompt Base (Instruções para o Gemini)</label>
              <textarea 
                name="aiPrompt"
                value={settings.aiPrompt}
                onChange={handleChange}
                placeholder="Ex: Você é um especialista em marketing..."
                rows={10}
                style={{ 
                  width: '100%', 
                  background: 'rgba(0,0,0,0.2)', 
                  color: 'white', 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)' 
                }}
              />
              <small>Instruções gerais que a IA vai seguir sempre que criar um post. Se deixar vazio, usará o prompt padrão do sistema.</small>
            </div>
          </div>

          <div className={`glass-panel ${styles.section}`}>
            <h2>📸 Integração com Instagram</h2>
            <div className={styles.inputGroup}>
              <label>Status do Token</label>
              <span className={`${styles.badge} ${!hasInstagramToken ? styles.badgeWarning : ''}`}>
                {hasInstagramToken ? '✓ Conectado' : '⚠ Não conectado'}
              </span>
              <small>
                Configure os dados do app da Meta para postagem automática.
              </small>
            </div>
            
            <div className={styles.inputGroup}>
              <label>Access Token (Graph API)</label>
              <input 
                type="password" 
                name="igToken"
                value={settings.igToken}
                onChange={handleChange}
                placeholder="EAAMWD..." 
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Account ID do Instagram</label>
              <input 
                type="text" 
                name="igAccountId"
                value={settings.igAccountId}
                onChange={handleChange}
                placeholder="178414..." 
              />
            </div>
          </div>

          <div className={`glass-panel ${styles.section}`}>
            <h2>📅 Frequência de Postagem</h2>
            <div className={styles.inputGroup}>
              <label>Posts por semana</label>
              <select name="postFrequency" value={settings.postFrequency} onChange={handleChange}>
                <option value="1">1x por semana</option>
                <option value="2">2x por semana</option>
                <option value="3">3x por semana</option>
                <option value="5">5x por semana</option>
                <option value="7">Diariamente</option>
              </select>
              <small>Define a frequência de sugestão de novos posts para a fila.</small>
            </div>
          </div>

          <div className={`glass-panel ${styles.section}`}>
            <h2>🎨 Identidade Visual</h2>
            <div className={styles.inputGroup}>
              <label>Cor primária</label>
              <input 
                type="color" 
                name="primaryColor"
                value={settings.primaryColor}
                onChange={handleChange}
                style={{ height: '40px', cursor: 'pointer' }} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Cor de destaque</label>
              <input 
                type="color" 
                name="accentColor"
                value={settings.accentColor}
                onChange={handleChange}
                style={{ height: '40px', cursor: 'pointer' }} 
              />
            </div>
            <small style={{ color: 'var(--text-muted)' }}>As cores serão salvas nas preferências.</small>
          </div>
        </div>
      </main>
    </div>
  );
}
