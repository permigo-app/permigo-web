'use client';

import { useEffect, useState } from 'react';
import { supabase, hasSupabase } from '@/lib/supabase';

interface RequestEntry {
  id: string;
  question_id: string;
  theme: string;
  type: 'carte' | 'question';
  votes: number;
}

function parseId(id: string): { theme: string; type: 'carte' | 'question' } {
  if (id.startsWith('exam_')) {
    const parts = id.split('_');
    return { theme: parts[1] ?? '?', type: 'question' };
  }
  const lessonMatch = id.match(/^([A-I]\d+)_([cq])\d+$/);
  if (lessonMatch) {
    return {
      theme: lessonMatch[1].charAt(0),
      type: lessonMatch[2] === 'c' ? 'carte' : 'question',
    };
  }
  return { theme: '?', type: 'carte' };
}

async function loadFromSupabase(): Promise<RequestEntry[] | null> {
  if (!hasSupabase || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('image_requests')
      .select('id, theme, votes')
      .order('votes', { ascending: false });
    if (error) {
      console.warn('[Admin] Supabase load error:', error.message);
      return null;
    }
    return (data ?? []).map(row => {
      const parsed = parseId(row.id);
      return {
        id: row.id,
        question_id: row.id,
        votes: row.votes,
        theme: row.theme ?? parsed.theme,
        type: parsed.type,
      };
    });
  } catch {
    return null;
  }
}

function loadFromLocalStorage(): RequestEntry[] {
  try {
    const raw = localStorage.getItem('image_requests');
    const data: Record<string, number> = raw ? JSON.parse(raw) : {};
    return Object.entries(data)
      .map(([id, votes]) => ({ id, question_id: id, votes, ...parseId(id) }))
      .sort((a, b) => b.votes - a.votes);
  } catch {
    return [];
  }
}

export default function AdminImageRequests() {
  const [entries, setEntries] = useState<RequestEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [source, setSource] = useState<'supabase' | 'localStorage'>('supabase');

  useEffect(() => {
    (async () => {
      const fromSupabase = await loadFromSupabase();
      if (fromSupabase !== null) {
        setEntries(fromSupabase);
        setSource('supabase');
      } else {
        setEntries(loadFromLocalStorage());
        setSource('localStorage');
      }
      setLoaded(true);
    })();
  }, []);

  const resetAll = async () => {
    if (!confirm('Remettre tous les votes à zéro ?')) return;
    if (hasSupabase && supabase) {
      await supabase.from('image_requests').delete().neq('id', '');
    }
    localStorage.removeItem('image_requests');
    setEntries([]);
  };

  const exportCSV = () => {
    const header = 'ID,Thème,Type,Votes';
    const rows = entries.map(e => `${e.id},${e.theme},${e.type},${e.votes}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image_requests_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalVotes = entries.reduce((s, e) => s + e.votes, 0);

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <p style={{ color: '#8B9DC3' }}>Chargement…</p>
    </div>
  );

  return (
    <div className="py-8 px-6" style={{ minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">🖼️ Demandes d&apos;images</h1>
            <p className="text-sm" style={{ color: '#8B9DC3' }}>
              {entries.length} éléments · {totalVotes} votes au total
            </p>
            <p className="text-xs mt-1" style={{ color: source === 'supabase' ? '#2ecc71' : '#e67e22' }}>
              {source === 'supabase' ? '🟢 Données Supabase (tous les utilisateurs)' : '🟡 Fallback localStorage (données locales uniquement)'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-xl font-bold text-sm press-scale"
              style={{ background: '#4ecdc4', color: '#0a0e2a' }}
            >
              Exporter CSV
            </button>
            <button
              onClick={resetAll}
              className="px-4 py-2 rounded-xl font-bold text-sm press-scale"
              style={{ background: 'rgba(231,76,60,0.15)', border: '1px solid #e74c3c', color: '#e74c3c' }}
            >
              Remettre à zéro
            </button>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
            <p className="text-5xl mb-3">🖼️</p>
            <p className="font-bold text-white mb-1">Aucune demande pour l&apos;instant</p>
            <p className="text-sm" style={{ color: '#5A6B8A' }}>Les votes des utilisateurs apparaîtront ici.</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #2A3550' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: '#16213E', borderBottom: '1px solid #2A3550' }}>
                  {['ID', 'Thème', 'Type', 'Votes'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest" style={{ color: '#4ecdc4' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr
                    key={e.id}
                    style={{ background: i % 2 === 0 ? '#0F1923' : '#111827', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td className="px-4 py-3 text-sm font-mono" style={{ color: '#d1d5db' }}>{e.id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: 'rgba(78,205,196,0.15)', color: '#4ecdc4' }}>
                        {e.theme}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{
                        background: e.type === 'carte' ? 'rgba(116,185,255,0.15)' : 'rgba(253,203,110,0.15)',
                        color: e.type === 'carte' ? '#74B9FF' : '#FDCB6E',
                      }}>
                        {e.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-black text-base" style={{ color: e.votes >= 5 ? '#e74c3c' : e.votes >= 3 ? '#e67e22' : '#2ecc71' }}>
                        {e.votes}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
