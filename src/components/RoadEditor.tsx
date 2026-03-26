'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ElementAdjustment {
  dx: number;
  dy: number;
  scale: number;
}

const STORAGE_KEY = 'road_editor_adjustments';

function loadAdjustments(): Record<string, ElementAdjustment> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveAdjustments(adj: Record<string, ElementAdjustment>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(adj));
}

export function getAdjustment(id: string): ElementAdjustment {
  const adj = loadAdjustments();
  return adj[id] || { dx: 0, dy: 0, scale: 1 };
}

export function useEditorMode() {
  const [editing, setEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<Record<string, ElementAdjustment>>({});

  useEffect(() => {
    setAdjustments(loadAdjustments());
  }, []);

  const getAdj = useCallback((id: string): ElementAdjustment => {
    return adjustments[id] || { dx: 0, dy: 0, scale: 1 };
  }, [adjustments]);

  const updateAdj = useCallback((id: string, patch: Partial<ElementAdjustment>) => {
    setAdjustments(prev => {
      const current = prev[id] || { dx: 0, dy: 0, scale: 1 };
      const updated = { ...prev, [id]: { ...current, ...patch } };
      saveAdjustments(updated);
      return updated;
    });
  }, []);

  const resetAdj = useCallback((id: string) => {
    setAdjustments(prev => {
      const updated = { ...prev };
      delete updated[id];
      saveAdjustments(updated);
      return updated;
    });
  }, []);

  const resetAll = useCallback(() => {
    setAdjustments({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportAdj = useCallback(() => {
    return JSON.stringify(adjustments, null, 2);
  }, [adjustments]);

  return { editing, setEditing, selectedId, setSelectedId, getAdj, updateAdj, resetAdj, resetAll, exportAdj };
}

// Floating editor panel
export function EditorPanel({
  editing, setEditing, selectedId, setSelectedId, getAdj, updateAdj, resetAdj, resetAll, exportAdj
}: ReturnType<typeof useEditorMode>) {
  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="fixed bottom-4 left-4 z-[100] px-3 py-2 rounded-xl text-xs font-bold press-scale"
        style={{ background: '#16213E', border: '1px solid #2A3550', color: '#8B9DC3' }}
      >
        🛠️ Éditeur
      </button>
    );
  }

  const adj = selectedId ? getAdj(selectedId) : null;
  const STEP = 5;
  const SCALE_STEP = 0.05;

  const move = (axis: 'dx' | 'dy', delta: number) => {
    if (!selectedId || !adj) return;
    updateAdj(selectedId, { [axis]: adj[axis] + delta });
  };

  const scale = (delta: number) => {
    if (!selectedId || !adj) return;
    updateAdj(selectedId, { scale: Math.max(0.1, adj.scale + delta) });
  };

  const handleExport = () => {
    const json = exportAdj();
    navigator.clipboard.writeText(json);
    alert('Ajustements copiés dans le presse-papier !\n\nColle-les dans le code source.');
  };

  return (
    <div className="fixed bottom-4 left-4 z-[100] rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#0F1923', border: '1px solid #2A3550', width: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-black" style={{ color: '#00B894' }}>🛠️ Mode Éditeur</span>
        <button onClick={() => { setEditing(false); setSelectedId(null); }} className="text-xs font-bold px-2 py-1 rounded-lg press-scale" style={{ background: '#FF6B6B20', color: '#FF6B6B' }}>
          ✕ Fermer
        </button>
      </div>

      <p className="text-[11px]" style={{ color: '#5A6B8A' }}>
        Clique sur un élément bordé de vert pour le sélectionner
      </p>

      {selectedId && adj && (
        <>
          <div className="text-xs font-bold truncate" style={{ color: '#74B9FF' }}>
            📍 {selectedId}
          </div>

          {/* Position controls */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase" style={{ color: '#8B9DC3' }}>Position</span>
            <div className="flex items-center gap-1">
              <button onClick={() => move('dx', -STEP)} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold press-scale" style={{ background: '#16213E', color: '#fff' }}>←</button>
              <div className="flex flex-col gap-1">
                <button onClick={() => move('dy', -STEP)} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold press-scale" style={{ background: '#16213E', color: '#fff' }}>↑</button>
                <button onClick={() => move('dy', STEP)} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold press-scale" style={{ background: '#16213E', color: '#fff' }}>↓</button>
              </div>
              <button onClick={() => move('dx', STEP)} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold press-scale" style={{ background: '#16213E', color: '#fff' }}>→</button>
            </div>
            <span className="text-[10px]" style={{ color: '#5A6B8A' }}>x: {adj.dx}, y: {adj.dy}</span>
          </div>

          {/* Scale controls */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-[10px] font-bold uppercase" style={{ color: '#8B9DC3' }}>Taille</span>
            <button onClick={() => scale(-SCALE_STEP)} className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold press-scale" style={{ background: '#16213E', color: '#FF6B6B' }}>−</button>
            <span className="text-xs font-bold" style={{ color: '#fff' }}>{Math.round(adj.scale * 100)}%</span>
            <button onClick={() => scale(SCALE_STEP)} className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold press-scale" style={{ background: '#16213E', color: '#00B894' }}>+</button>
          </div>

          {/* Fine controls */}
          <div className="flex gap-1">
            <button onClick={() => move('dx', -1)} className="flex-1 h-7 rounded-lg text-[10px] font-bold press-scale" style={{ background: '#16213E', color: '#8B9DC3' }}>←1px</button>
            <button onClick={() => move('dy', -1)} className="flex-1 h-7 rounded-lg text-[10px] font-bold press-scale" style={{ background: '#16213E', color: '#8B9DC3' }}>↑1px</button>
            <button onClick={() => move('dy', 1)} className="flex-1 h-7 rounded-lg text-[10px] font-bold press-scale" style={{ background: '#16213E', color: '#8B9DC3' }}>↓1px</button>
            <button onClick={() => move('dx', 1)} className="flex-1 h-7 rounded-lg text-[10px] font-bold press-scale" style={{ background: '#16213E', color: '#8B9DC3' }}>→1px</button>
          </div>

          {/* Reset this element */}
          <button onClick={() => resetAdj(selectedId)} className="h-8 rounded-lg text-xs font-bold press-scale" style={{ background: '#FF6B6B15', color: '#FF6B6B', border: '1px solid #FF6B6B30' }}>
            🗑️ Reset cet élément
          </button>
        </>
      )}

      {/* Global actions */}
      <div className="flex gap-2 pt-1" style={{ borderTop: '1px solid #2A3550' }}>
        <button onClick={handleExport} className="flex-1 h-8 rounded-lg text-[11px] font-bold press-scale" style={{ background: '#00B89420', color: '#00B894' }}>
          📋 Exporter
        </button>
        <button onClick={resetAll} className="flex-1 h-8 rounded-lg text-[11px] font-bold press-scale" style={{ background: '#FF6B6B15', color: '#FF6B6B' }}>
          🗑️ Tout reset
        </button>
      </div>
    </div>
  );
}

// Wrapper that makes an element selectable/editable
export function Editable({
  id, editing, selectedId, setSelectedId, getAdj, children, style, className,
}: {
  id: string;
  editing: boolean;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  getAdj: (id: string) => ElementAdjustment;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  const adj = getAdj(id);
  const isSelected = selectedId === id;

  const baseStyle: React.CSSProperties = {
    ...style,
    transform: `translate(${adj.dx}px, ${adj.dy}px) scale(${adj.scale})`,
    transformOrigin: 'center center',
  };

  if (editing) {
    baseStyle.cursor = 'pointer';
    baseStyle.outline = isSelected ? '2px solid #00B894' : '2px dashed rgba(0,184,148,0.4)';
    baseStyle.outlineOffset = '2px';
    baseStyle.zIndex = isSelected ? 99 : (style?.zIndex || 'auto');
  }

  return (
    <div
      className={className}
      style={baseStyle}
      onClick={editing ? (e) => { e.stopPropagation(); e.preventDefault(); setSelectedId(isSelected ? null : id); } : undefined}
    >
      {children}
    </div>
  );
}
