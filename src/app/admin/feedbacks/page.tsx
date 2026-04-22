'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

type FeedbackStatus = 'new' | 'read' | 'in_progress' | 'resolved' | 'closed';
type FeedbackCategory = 'bug' | 'suggestion' | 'other';

interface Feedback {
  id: string;
  user_email: string | null;
  category: FeedbackCategory;
  message: string;
  page_url: string | null;
  user_agent: string | null;
  status: FeedbackStatus;
  created_at: string;
  resolved_at: string | null;
}

const CATEGORY_META: Record<FeedbackCategory, { emoji: string; label: string; color: string }> = {
  bug:        { emoji: '🐛', label: 'Bug',        color: '#FF6B6B' },
  suggestion: { emoji: '💡', label: 'Suggestion', color: '#FDCB6E' },
  other:      { emoji: '💬', label: 'Autre',      color: '#74B9FF' },
};

const STATUS_META: Record<FeedbackStatus, { label: string; color: string }> = {
  new:         { label: 'Nouveau',     color: '#00B894' },
  read:        { label: 'Lu',          color: '#74B9FF' },
  in_progress: { label: 'En cours',   color: '#FDCB6E' },
  resolved:    { label: 'Résolu',     color: '#A29BFE' },
  closed:      { label: 'Fermé',      color: '#5A6B8A' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-BE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Composant principal ───────────────────────────────────────────────────────
function AdminFeedbacksContent() {
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret') ?? '';

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== 'all') params.set('status', filterStatus);
    if (filterCategory !== 'all') params.set('category', filterCategory);

    const res = await fetch(`/api/admin/feedbacks?${params.toString()}`, {
      headers: { 'x-admin-secret': secret },
    });

    if (res.status === 401) { setAuthError(true); setLoading(false); return; }

    const data = await res.json();
    setFeedbacks(data.feedbacks ?? []);
    setLoading(false);
  }, [secret, filterStatus, filterCategory]);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  const updateStatus = async (id: string, status: FeedbackStatus) => {
    setUpdatingId(id);
    await fetch('/api/admin/feedbacks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ id, status }),
    });
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    setUpdatingId(null);
  };

  // ── Compteurs par catégorie (sur l'ensemble non filtré) ──────────────────
  const countByCategory = feedbacks.reduce<Record<string, number>>((acc, f) => {
    acc[f.category] = (acc[f.category] ?? 0) + 1;
    return acc;
  }, {});
  const countByStatus = feedbacks.reduce<Record<string, number>>((acc, f) => {
    acc[f.status] = (acc[f.status] ?? 0) + 1;
    return acc;
  }, {});

  // ── Accès refusé ─────────────────────────────────────────────────────────
  if (authError) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#FF6B6B' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <p style={{ fontSize: 18, fontWeight: 800 }}>Accès refusé</p>
          <p style={{ color: '#5A6B8A', fontSize: 14, marginTop: 8 }}>Secret invalide ou manquant dans l&apos;URL</p>
          <code style={{ display: 'block', marginTop: 12, color: '#8B9DC3', fontSize: 12 }}>
            /admin/feedbacks?secret=TON_ADMIN_SECRET
          </code>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e2a', padding: '24px 16px', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF', marginBottom: 4 }}>
            💬 Feedbacks utilisateurs
          </h1>
          <p style={{ color: '#5A6B8A', fontSize: 13 }}>
            {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} affichés
          </p>
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>

          {/* Filtre statut */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ color: '#5A6B8A', fontSize: 12, fontWeight: 700, alignSelf: 'center' }}>Statut :</span>
            {(['all', 'new', 'read', 'in_progress', 'resolved', 'closed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: `1.5px solid ${filterStatus === s ? '#00B894' : 'rgba(255,255,255,0.1)'}`,
                  background: filterStatus === s ? 'rgba(0,184,148,0.15)' : 'transparent',
                  color: filterStatus === s ? '#00B894' : '#8B9DC3',
                  cursor: 'pointer',
                }}
              >
                {s === 'all' ? `Tous (${feedbacks.length})` : `${STATUS_META[s as FeedbackStatus]?.label} (${countByStatus[s] ?? 0})`}
              </button>
            ))}
          </div>

          {/* Filtre catégorie */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ color: '#5A6B8A', fontSize: 12, fontWeight: 700, alignSelf: 'center' }}>Catégorie :</span>
            {(['all', 'bug', 'suggestion', 'other'] as const).map(c => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: `1.5px solid ${filterCategory === c ? '#74B9FF' : 'rgba(255,255,255,0.1)'}`,
                  background: filterCategory === c ? 'rgba(116,185,255,0.12)' : 'transparent',
                  color: filterCategory === c ? '#74B9FF' : '#8B9DC3',
                  cursor: 'pointer',
                }}
              >
                {c === 'all'
                  ? `Tous (${feedbacks.length})`
                  : `${CATEGORY_META[c as FeedbackCategory].emoji} ${CATEGORY_META[c as FeedbackCategory].label} (${countByCategory[c] ?? 0})`}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#5A6B8A', padding: 48 }}>Chargement...</div>
        ) : feedbacks.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#5A6B8A', padding: 48 }}>Aucun feedback trouvé.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {feedbacks.map(fb => {
              const catMeta = CATEGORY_META[fb.category];
              const statusMeta = STATUS_META[fb.status];
              const isExpanded = expandedId === fb.id;

              return (
                <div
                  key={fb.id}
                  style={{
                    background: '#0F1923',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 14,
                    padding: '14px 16px',
                    borderLeft: `3px solid ${catMeta.color}`,
                  }}
                >
                  {/* Ligne principale */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                    {/* Catégorie */}
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                      background: `${catMeta.color}18`, color: catMeta.color, flexShrink: 0,
                    }}>
                      {catMeta.emoji} {catMeta.label}
                    </span>

                    {/* Message tronqué / complet */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: '#FFFFFF',
                          fontSize: 13,
                          lineHeight: 1.5,
                          cursor: 'pointer',
                          display: isExpanded ? 'block' : '-webkit-box',
                          WebkitLineClamp: isExpanded ? undefined : 2,
                          WebkitBoxOrient: 'vertical' as const,
                          overflow: isExpanded ? 'visible' : 'hidden',
                        }}
                        onClick={() => setExpandedId(isExpanded ? null : fb.id)}
                      >
                        {fb.message}
                      </p>
                      {!isExpanded && fb.message.length > 120 && (
                        <button
                          onClick={() => setExpandedId(fb.id)}
                          style={{ color: '#74B9FF', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}
                        >
                          Voir plus ↓
                        </button>
                      )}
                      {isExpanded && (
                        <button
                          onClick={() => setExpandedId(null)}
                          style={{ color: '#74B9FF', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}
                        >
                          Réduire ↑
                        </button>
                      )}
                    </div>

                    {/* Statut dropdown */}
                    <select
                      value={fb.status}
                      onChange={e => updateStatus(fb.id, e.target.value as FeedbackStatus)}
                      disabled={updatingId === fb.id}
                      style={{
                        background: `${statusMeta.color}18`,
                        border: `1px solid ${statusMeta.color}`,
                        color: statusMeta.color,
                        borderRadius: 8,
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <option value="new">Nouveau</option>
                      <option value="read">Lu</option>
                      <option value="in_progress">En cours</option>
                      <option value="resolved">Résolu</option>
                      <option value="closed">Fermé</option>
                    </select>
                  </div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                    <span style={{ color: '#5A6B8A', fontSize: 11 }}>🕐 {formatDate(fb.created_at)}</span>
                    {fb.user_email && (
                      <span style={{ color: '#5A6B8A', fontSize: 11 }}>✉️ {fb.user_email}</span>
                    )}
                    {fb.page_url && (
                      <span style={{ color: '#5A6B8A', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                        🔗 {fb.page_url.replace(/^https?:\/\/[^/]+/, '')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminFeedbacksPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0e2a' }} />}>
      <AdminFeedbacksContent />
    </Suspense>
  );
}
