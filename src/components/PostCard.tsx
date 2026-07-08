'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import styles from './PostCard.module.css';

// Safely encode string to base64url for URLs (browser compatible)
const toBase64Url = (str: string) => {
  try {
    const base64 = btoa(unescape(encodeURIComponent(str)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    return encodeURIComponent(str);
  }
};

interface PostCardProps {
  post: {
    id: string;
    theme: string;
    title: string | null;
    caption: string | null;
    imageUrl: string | null;
    slides?: string | null;
    ctaType?: string;
    status: string;
    scheduledFor?: string | Date | null;
  };
  onDelete?: (id: string) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post.caption || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusClass = (status: string) => {
    if (status === 'approved' && post.scheduledFor) return styles.statusApproved;
    switch (status) {
      case 'approved': return styles.statusApproved;
      case 'published': return styles.statusPublished;
      default: return styles.statusDraft;
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'approved' && post.scheduledFor) {
      const date = new Date(post.scheduledFor);
      return `📅 ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    switch (status) {
      case 'approved': return 'Aprovado (Na Fila)';
      case 'published': return 'Publicado ✓';
      case 'rejected': return 'Rejeitado';
      default: return 'Rascunho';
    }
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: editedCaption })
      });
      setIsEditing(false);
      toast.success('Legenda salva com sucesso!');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar edição.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    toast('Publicar este post no Instagram?', {
      description: 'Certifique-se de que está rodando em produção (Vercel) para a Meta acessar as imagens.',
      action: {
        label: 'Publicar',
        onClick: () => doPublish(),
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
      duration: 10000,
    });
  };

  const doPublish = async () => {
    setIsPublishing(true);
    const toastId = toast.loading('Publicando no Instagram...');
    try {
      const res = await fetch('/api/publish-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id })
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(`Erro ao publicar: ${data.error || 'Erro desconhecido'}`, { id: toastId });
      } else {
        toast.success('Post publicado no Instagram com sucesso! 🎉', { id: toastId });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro de rede ao publicar.', { id: toastId });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    toast('Tem certeza que deseja excluir este post?', {
      description: 'Essa ação não pode ser desfeita.',
      action: {
        label: 'Excluir',
        onClick: () => doDelete(),
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
      duration: 10000,
    });
  };

  const doDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Erro ao excluir post.');
      } else {
        toast.success('Post excluído com sucesso.');
        if (onDelete) onDelete(post.id);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro de rede ao excluir.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Try to parse slides JSON
  let parsedSlides: string[] = [];
  if (post.slides) {
    try {
      parsedSlides = JSON.parse(post.slides);
    } catch(e) {}
  }

  return (
    <div className={`glass-panel ${styles.card}`}>
      {/* Carousel Container */}
      <div className={styles.imagePlaceholder} style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' }}>
        {parsedSlides.length > 0 ? (
          <>
            {parsedSlides.map((slide, index) => (
              <div key={index} style={{ flex: '0 0 auto', width: '250px', height: '250px', position: 'relative' }}>
                <Image 
                  src={`/api/og?index=${index}&title=${toBase64Url(slide)}`}
                  alt={`Slide ${index}`}
                  fill 
                  style={{ objectFit: 'cover', borderRadius: '8px' }} 
                  unoptimized={true} 
                />
              </div>
            ))}
            {post.ctaType !== 'none' && (
              <div style={{ flex: '0 0 auto', width: '250px', height: '250px', position: 'relative' }}>
                <Image 
                  src={`/api/cta/${post.ctaType || 'engagement'}.png?v=3`} 
                  alt="CTA Slide"
                  fill 
                  style={{ objectFit: 'cover', borderRadius: '8px' }} 
                  unoptimized={true} 
                />
              </div>
            )}
          </>
        ) : post.imageUrl ? (
          <div style={{ flex: '0 0 auto', width: '250px', height: '250px', position: 'relative' }}>
            <Image src={post.imageUrl} alt={post.title || 'Post image'} fill style={{ objectFit: 'cover', borderRadius: '8px' }} unoptimized={true} />
          </div>
        ) : (
          <span>Sem Imagem</span>
        )}
      </div>
      
      <div className={styles.theme}>{post.theme}</div>
      
      {isEditing ? (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <textarea
            value={editedCaption}
            onChange={(e) => setEditedCaption(e.target.value)}
            rows={5}
            style={{ 
              width: '100%', 
              background: 'rgba(0,0,0,0.3)', 
              color: 'white', 
              padding: '0.5rem', 
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)' 
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn-primary" 
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
            <button 
              className={styles.actionBtn} 
              onClick={() => {
                setEditedCaption(post.caption || '');
                setIsEditing(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className={styles.caption}>{post.caption || 'Sem legenda gerada ainda...'}</p>
      )}
      
      <div className={styles.footer}>
        <span className={`${styles.status} ${getStatusClass(post.status)}`}>
          {getStatusText(post.status)}
        </span>
        <div className={styles.actions}>
          {/* Delete Button */}
          <button 
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={handleDelete}
            disabled={isDeleting}
            title="Excluir post"
          >
            {isDeleting ? '...' : '🗑'}
          </button>

          {!isEditing && post.status === 'draft' && (
            <button className={styles.actionBtn} onClick={() => setIsEditing(true)}>
              Editar
            </button>
          )}
          
          {post.status === 'draft' && (
            <button 
              className={`${styles.actionBtn} btn-primary`}
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? 'Publicando...' : 'Publicar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
