'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { THEME_ORDER, getThemeDataLocalized, getLessonDataLocalized } from '@/lib/lessonData';
import { useLang } from '@/contexts/LanguageContext';
import { THEME_COLORS, THEME_EMOJIS, CITY_NAMES_UPPER } from '@/lib/constants';
import { GASTON_GREETINGS, getRandomMsg } from '@/locales/messages';
import { isPremium, isThemeFree } from '@/lib/premium';
import { getUnlockedThemes, getAllStars, getAllExams, getXPData, checkAndUpdateStreak, getStreakData, getCompletedParties, getLessonProgress } from '@/lib/progressStorage';
import Image from 'next/image';
import CarSVG from '@/components/CarSVG';

// ── Road constants ──
const ROAD_W = 65;
const NODE_R = 32;       // 64px diameter
const ACTIVE_R = 40;     // 80px diameter for active node
const EXAM_R = 38;
const V_SPACE = 160;     // generous vertical spacing between nodes
const PAD_TOP = 220;     // room for banner + barrier above first node
const PAD_BOTTOM = 200;
const RING_GAP = 4;
const RING_STROKE = 4;
const RING_R = NODE_R + RING_GAP;
const RING_SIZE = (RING_R + RING_STROKE / 2) * 2;
const RING_CIRC = 2 * Math.PI * RING_R;
const ACTIVE_RING_R = ACTIVE_R + RING_GAP;
const ACTIVE_RING_SIZE = (ACTIVE_RING_R + RING_STROKE / 2) * 2;
const ACTIVE_RING_CIRC = 2 * Math.PI * ACTIVE_RING_R;
const EXAM_RING_R = EXAM_R + RING_GAP;
const EXAM_RING_SIZE = (EXAM_RING_R + RING_STROKE / 2) * 2;
const EXAM_RING_CIRC = 2 * Math.PI * EXAM_RING_R;
const CAR_SIZE = 45;
const CAR_AHEAD = 38;
const THEME_EXTRA_GAP = 160;  // room for banner + barrier between themes

// Monument images per theme
interface MonumentDef {
  src: string;
  side: 'left' | 'right';
  w: number;
  h: number;
  yRatio: number;
  xOffset?: number;
  yOffset?: number;
}
const MONUMENTS: Record<string, MonumentDef[]> = {
  A: [
    { src: '/monuments/atomium.png', side: 'left', w: 280, h: 280, yRatio: 0.25, xOffset: -60, yOffset: 20 },
    { src: '/monuments/manneken_pis.png', side: 'left', w: 200, h: 260, yRatio: 0.6, xOffset: -20, yOffset: -40 },
    { src: '/monuments/grandplace.png', side: 'right', w: 200, h: 180, yRatio: 0.85, xOffset: 10, yOffset: -20 },
  ],
  B: [
    { src: '/monuments/interallie.png', side: 'left', w: 140, h: 240, yRatio: 0.35, xOffset: 0, yOffset: -10 },
    { src: '/monuments/gare_guillemins.png', side: 'right', w: 200, h: 130, yRatio: 0.7, xOffset: 10, yOffset: 0 },
  ],
  C: [
    { src: '/monuments/cathedrale_anvers.png', side: 'left', w: 140, h: 220, yRatio: 0.3, xOffset: 10, yOffset: -10 },
    { src: '/monuments/mas_museum.png', side: 'right', w: 180, h: 320, yRatio: 0.7, xOffset: 10, yOffset: 0 },
  ],
  D: [
    { src: '/monuments/panneaux_vitesse.png', side: 'left', w: 70, h: 250, yRatio: 0.35, xOffset: 0, yOffset: 0 },
    { src: '/monuments/circuit_spa.png', side: 'right', w: 160, h: 155, yRatio: 0.65, xOffset: 0, yOffset: 0 },
  ],
  E: [
    { src: '/monuments/beffroi_gand.png', side: 'right', w: 200, h: 500, yRatio: 0.5, xOffset: 0, yOffset: 0 },
  ],
  F: [
    { src: '/monuments/citadelle_namur.png', side: 'right', w: 200, h: 160, yRatio: 0.3, xOffset: 0, yOffset: 0 },
    { src: '/monuments/tortue_namur.png', side: 'left', w: 160, h: 160, yRatio: 0.7, xOffset: 0, yOffset: 0 },
  ],
  G: [
    { src: '/monuments/beffroi_bruges.png', side: 'right', w: 160, h: 380, yRatio: 0.5, xOffset: 0, yOffset: 0 },
  ],
  H: [
    { src: '/monuments/collegiale_mons.png', side: 'right', w: 200, h: 160, yRatio: 0.3, xOffset: 10, yOffset: 0 },
    { src: '/monuments/singe_mons.png', side: 'left', w: 140, h: 175, yRatio: 0.7, xOffset: 0, yOffset: 0 },
  ],
  I: [
    { src: '/monuments/frites.png', side: 'right', w: 160, h: 320, yRatio: 0.25, xOffset: 0, yOffset: 0 },
    { src: '/monuments/gaufre.png', side: 'left', w: 110, h: 110, yRatio: 0.5, xOffset: 0, yOffset: 0 },
    { src: '/monuments/chocolat.png', side: 'right', w: 160, h: 260, yRatio: 0.75, xOffset: 0, yOffset: 0 },
  ],
};

// Theme titles
const THEME_TITLES: Record<string, string> = {
  A: 'La route',
  B: 'Usagers vulnérables',
  C: 'Le véhicule',
  D: 'Vitesse & distances',
  E: 'Manœuvres',
  F: 'Priorités & intersections',
  G: 'Conduite en ville',
  H: 'Stationnement',
  I: 'Documents & responsabilités',
};

interface PathNode {
  type: 'lesson' | 'exam';
  id: string;
  themeCode: string;
  localIndex: number;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;       // theme lock (premium required)
  isOrderLocked: boolean;  // lesson order lock (previous lesson not done)
  isCurrent: boolean;
  stars: number;
}

export default function HomePage() {
  const router = useRouter();
  const { lang, t } = useLang();
  const [stars, setStarsState] = useState<Record<string, number>>({});
  const [exams, setExams] = useState<Record<string, boolean>>({});
  const [xp, setXp] = useState({ totalXP: 0, level: 1 });
  const [streak, setStreak] = useState({ currentStreak: 0, lastActiveDate: '', bestStreak: 0 });
  const greeting = useMemo(() => getRandomMsg(GASTON_GREETINGS[lang]), [lang]);
  const [mounted, setMounted] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [visibleTheme, setVisibleTheme] = useState<string>('A');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layoutRef = useRef<any>(null);
  const [userCar, setUserCar] = useState<{ carType: string; carColor: string; carImage?: string }>({ carType: 'berline', carColor: '#1E88E5' });

  const DEFAULT_ADJ: Record<string, { dx: number; dy: number; scale: number; rot: number }> = {
    "mon-A-0": { dx: -140, dy: -140, scale: 1.3, rot: 0 },
    "mon-A-1": { dx: 235, dy: 97, scale: 1.2, rot: 0 },
    "mon-A-2": { dx: -535, dy: 85, scale: 1.6, rot: 0 },
    "mon-B-0": { dx: -185, dy: 20, scale: 1.4, rot: 0 },
    "mon-B-1": { dx: -115, dy: -135, scale: 2.0, rot: 0 },
    "mon-C-0": { dx: -230, dy: -175, scale: 2.2, rot: 0 },
    "mon-C-1": { dx: -125, dy: -115, scale: 1.6, rot: 0 },
    "mon-D-0": { dx: 245, dy: -60, scale: 2.05, rot: 0 },
    "mon-D-1": { dx: -630, dy: -105, scale: 1.8, rot: 0 },
    "mon-E-0": { dx: -125, dy: -385, scale: 1.9, rot: 0 },
    "mon-F-0": { dx: -110, dy: -195, scale: 1.55, rot: 0 },
    "mon-F-1": { dx: -210, dy: -85, scale: 1.7, rot: 0 },
    "mon-G-0": { dx: -640, dy: -225, scale: 2.8, rot: 0 },
    "mon-H-0": { dx: -145, dy: -45, scale: 1.5, rot: 0 },
    "mon-H-1": { dx: -270, dy: 10, scale: 1.8, rot: 0 },
    "mon-I-0": { dx: -90, dy: -60, scale: 1.4, rot: 0 },
    "mon-I-1": { dx: -130, dy: -10, scale: 1.55, rot: 0 },
    "mon-I-2": { dx: -125, dy: 0, scale: 1.45, rot: 0 },
    "banner-B": { dx: -15, dy: 0, scale: 1, rot: 0 },
    "banner-E": { dx: 0, dy: 0, scale: 0.9, rot: 0 },
    "banner-H": { dx: -25, dy: 0, scale: 1, rot: 0 },
  };
  const [elemAdj, setElemAdj] = useState<Record<string, { dx: number; dy: number; scale: number; rot: number }>>(DEFAULT_ADJ);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('monument_adjustments');
      if (raw) {
        const local = JSON.parse(raw);
        setElemAdj({ ...DEFAULT_ADJ, ...local });
      }
    } catch {}
  }, []);

  const getElemAdj = useCallback((id: string) => {
    return elemAdj[id] || { dx: 0, dy: 0, scale: 1, rot: 0 };
  }, [elemAdj]);


  // ── Lesson modal state ──
  const [modalNode, setModalNode] = useState<PathNode | null>(null);
  const [selectedPartieIdx, setSelectedPartieIdx] = useState<number | null>(null);
  const [completedParties, setCompletedParties] = useState<number[]>([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showOrderLockedModal, setShowOrderLockedModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsVip(localStorage.getItem('permigo_vip') === 'true');
    setStarsState(getAllStars());
    setExams(getAllExams());
    setXp(getXPData());
    setStreak(checkAndUpdateStreak());
    try {
      // Try new userCar key first (PNG cars from onboarding v2)
      const rawCar = localStorage.getItem('userCar');
      if (rawCar) {
        const c = JSON.parse(rawCar);
        setUserCar({ carType: c.id, carColor: c.color || '#1E88E5', carImage: c.image });
      } else {
        const raw = localStorage.getItem('userProfile');
        if (raw) {
          const p = JSON.parse(raw);
          if (p.carType) setUserCar({ carType: p.carType, carColor: p.carColor || '#1E88E5' });
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    setSelectedPartieIdx(null);
    if (modalNode && modalNode.type === 'lesson') {
      setCompletedParties(getCompletedParties(modalNode.id));
    } else {
      setCompletedParties([]);
    }
  }, [modalNode?.id]);

  // Scroll reveal for monuments
  const roadContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mounted) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.15 });
    const els = document.querySelectorAll('.monument-reveal');
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted]);

  // Mobile only: update visible theme based on scroll position
  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || window.innerWidth >= 1024) return;
    const handleScroll = () => {
      const current = layoutRef.current;
      if (!current) return;
      const { pts: lPts, nodes: lNodes } = current;
      const scale = 1; // native sizing, no scale transform on mobile
      const midY = window.scrollY + window.innerHeight / 2;
      const container = roadContainerRef.current;
      if (!container) return;
      const containerTop = container.getBoundingClientRect().top + window.scrollY;
      let closest = 0;
      let minDist = Infinity;
      lPts.forEach((pt: { x: number; y: number }, i: number) => {
        const scaledY = containerTop + pt.y * scale;
        const dist = Math.abs(scaledY - midY);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      const theme = lNodes[closest]?.themeCode;
      if (theme) setVisibleTheme(theme);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  const openLessonModal = useCallback((node: PathNode) => {
    setModalNode(node);
  }, []);

  const closeModal = useCallback(() => {
    setModalNode(null);
    setSelectedPartieIdx(null);
  }, []);

  const startPartie = useCallback((partieIdx: number) => {
    if (!modalNode) return;
    closeModal();
    router.push(`/lecon/${modalNode.id}?partie=${partieIdx}`);
  }, [modalNode, closeModal, router]);

  const startFullLesson = useCallback(() => {
    if (!modalNode) return;
    closeModal();
    router.push(`/lecon/${modalNode.id}`);
  }, [modalNode, closeModal, router]);

  // ── Compute stats ──
  const totalCompleted = useMemo(() => Object.values(stars).filter(s => s > 0).length, [stars]);
  const totalExamsPassed = useMemo(() => Object.values(exams).filter(Boolean).length, [exams]);

  // ── Build path items ──
  const layout = useMemo(() => {
    if (!mounted) return null;

    const nodes: PathNode[] = [];
    const themeAt = new Map<number, string>();

    for (const themeCode of THEME_ORDER) {
      const theme = getThemeDataLocalized(themeCode, lang);
      if (!theme) continue;

      const themeIndex = THEME_ORDER.indexOf(themeCode);
      const prevThemeCode = themeIndex > 0 ? THEME_ORDER[themeIndex - 1] : null;

      let prevExamPassed = true;
      if (prevThemeCode) {
        const prevTheme = getThemeDataLocalized(prevThemeCode, lang);
        if (prevTheme) {
          const allPrevDone = prevTheme.lessons.every((_, idx) => {
            const lid = prevThemeCode + (idx + 1);
            return (stars[lid] ?? 0) > 0;
          });
          prevExamPassed = exams[prevThemeCode] === true || allPrevDone;
        }
      }

      themeAt.set(nodes.length, themeCode);

      let foundCurrent = false;
      theme.lessons.forEach((lesson, lessonIdx) => {
        const lid = lesson.id || (themeCode + (lessonIdx + 1));
        const lessonStars = stars[lid] ?? 0;
        const done = lessonStars > 0;

        // Lock non-free themes for non-premium users
        const themeLocked = !isThemeFree(themeCode) && !isPremium();

        // Lock lesson N+1 if lesson N not completed (within unlocked theme)
        const prevLid = lessonIdx > 0 ? (theme.lessons[lessonIdx - 1]?.id || (themeCode + lessonIdx)) : null;
        const orderLocked = !isVip && !themeLocked && lessonIdx > 0 && prevLid !== null && (stars[prevLid] ?? 0) === 0;

        const locked = themeLocked;

        const isCurrent = !done && !locked && !orderLocked && !foundCurrent;
        if (isCurrent) foundCurrent = true;

        nodes.push({
          type: 'lesson',
          id: lid,
          themeCode,
          localIndex: lessonIdx + 1,
          title: lesson.title,
          isCompleted: done,
          isLocked: locked,
          isOrderLocked: orderLocked,
          isCurrent,
          stars: lessonStars,
        });
      });

      // Exam node
      const examDone = exams[themeCode] === true;
      const examIsCurrent = !examDone && !foundCurrent;

      nodes.push({
        type: 'exam',
        id: `exam-${themeCode}`,
        themeCode,
        localIndex: 0,
        title: `Examen ${themeCode}`,
        isCompleted: examDone,
        isLocked: false,
        isOrderLocked: false,
        isCurrent: examIsCurrent,
        stars: 0,
      });
    }

    // ── Width calculation ──
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const isMobileW = vw < 1024;
    const isXlW = vw >= 1280;
    const leftW = isMobileW ? 0 : 250;
    const rightW = isXlW ? 500 : 0;
    const availableW = vw - leftW - rightW - 32;
    const oversize = Math.max(0, vw - 1920);
    const svgMaxW = Math.min(1000, 600 + Math.round(oversize * 0.3));
    const roadZoneMaxW = Math.min(1100, 640 + Math.round(oversize * 0.3));
    // Mobile: exact screen width minus 32px padding
    const SVG_W = isMobileW ? Math.max(300, vw - 32) : Math.min(svgMaxW, Math.max(300, availableW));
    const CX = isMobileW ? SVG_W * 0.5 : SVG_W * 0.14;
    // Mobile: gentler 2-3 wave Duolingo style, desktop: full amplitude
    const AMP = isMobileW ? Math.min((SVG_W - 80) / 2, 70) : Math.min((SVG_W - 100) / 2, 110);

    // ── Mobile-specific geometry (native sizing, no scale transform) ──
    const mVSpace = isMobileW ? 110 : V_SPACE;
    const mPadTop = isMobileW ? 180 : PAD_TOP;
    const mPadBot = isMobileW ? 100 : PAD_BOTTOM;
    const mThemeGap = isMobileW ? 70 : THEME_EXTRA_GAP;

    // ── Positions with extra gap at theme boundaries ──
    const themeStartSet = new Set(themeAt.keys());
    let yExtra = 0;
    const pts = nodes.map((node, i) => {
      if (i > 0 && themeStartSet.has(i)) {
        yExtra += mThemeGap;
      }
      const isExam = node.type === 'exam';
      const isThemeStart = themeStartSet.has(i);
      // Alternating left-right serpentine like Duolingo
      const side = i % 2 === 0 ? -1 : 1;
      // Give exam/theme-start a slight offset so the road curves through them
      const x = (isExam || isThemeStart) ? CX + AMP * side * 0.3 : CX + AMP * side;
      return { x, y: mPadTop + i * mVSpace + yExtra };
    });

    // Build smooth bezier path with proper S-curves
    const startPt = pts.length > 0 ? { x: pts[0].x, y: pts[0].y - mPadTop } : { x: CX, y: 0 };
    const finishY = (pts.length > 0 ? pts[pts.length - 1].y : mPadTop) + (isMobileW ? 150 : 250);
    const allPts = [startPt, ...pts, { x: CX, y: finishY }];

    let d = `M ${allPts[0].x} ${allPts[0].y}`;
    for (let i = 1; i < allPts.length; i++) {
      const p = allPts[i - 1];
      const c = allPts[i];
      const dy = c.y - p.y;
      // Control points stay at the X of their own point, pushed vertically toward the middle
      // This creates round U-turns instead of sharp S-curves
      d += ` C ${p.x} ${p.y + dy * 0.7}, ${c.x} ${c.y - dy * 0.7}, ${c.x} ${c.y}`;
    }

    const totalH = finishY + mPadBot;
    const curIdx = nodes.findIndex(n => n.isCurrent);

    let carTilt = 0;
    if (curIdx >= 0 && pts.length >= 2) {
      const dx = curIdx < pts.length - 1
        ? pts[curIdx + 1].x - pts[curIdx].x
        : pts[curIdx].x - pts[curIdx - 1].x;
      carTilt = (dx / (AMP * 2)) * 20;
    }

    return { nodes, themeAt, pts, totalH, pathD: d, curIdx, SVG_W, CX, AMP, carTilt, finishY, roadZoneMaxW };
  }, [mounted, stars, exams, lang, isVip]);

  // Keep layoutRef in sync for the scroll effect
  layoutRef.current = layout;

  if (!mounted || !layout) return <div className="min-h-screen" />;

  const { nodes, themeAt, pts, totalH, pathD, curIdx, SVG_W, CX, AMP, carTilt, finishY, roadZoneMaxW } = layout;

  // ── No scale on mobile — geometry is natively sized ──
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 1024;
  const mobileScale = 1; // native sizing, no transform

  // ── Car position ──
  let carX = 0, carY = 0;
  if (curIdx >= 0 && pts.length > 0) {
    const p = pts[curIdx];
    let fwdX = 0, fwdY = CAR_AHEAD;
    if (curIdx < pts.length - 1) {
      const n = pts[curIdx + 1];
      const dx = n.x - p.x;
      const dy = n.y - p.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      fwdX = (dx / len) * CAR_AHEAD;
      fwdY = (dy / len) * CAR_AHEAD;
    }
    carX = p.x + fwdX;
    carY = p.y + fwdY;
  }

  // ── Mobile node size overrides (smaller = native feel at scale 1) ──
  const mNODE_R = isMobileView ? 22 : NODE_R;
  const mACTIVE_R = isMobileView ? 28 : ACTIVE_R;
  const mEXAM_R = isMobileView ? 24 : EXAM_R;
  const mRING_GAP = RING_GAP;
  const mRING_STROKE = RING_STROKE;

  // ── Finish line ──
  const SQ = Math.floor(ROAD_W / 5);

  // ── Total lessons for progression ──
  const totalLessons = nodes.filter(n => n.type === 'lesson').length;

  return (
    <div className="flex gap-0 w-full overflow-x-hidden">
      {/* ═══════════════════════════════════════ */}
      {/* MAIN ROAD AREA */}
      {/* ═══════════════════════════════════════ */}
      <div className="flex-1 min-w-0 px-2 pt-[52px] pb-20 lg:pt-6 lg:pb-6 lg:mx-auto" style={{ overflow: 'visible', maxWidth: roadZoneMaxW }}>

        {/* ── Mobile active theme banner (scroll-driven, sticky) ── */}
        {(() => {
          const tc = THEME_COLORS[visibleTheme] || '#74B9FF';
          const em = THEME_EMOJIS[visibleTheme] || '📚';
          const themeData = getThemeDataLocalized(visibleTheme, lang);
          const themeDone = nodes.filter(n => n.themeCode === visibleTheme && n.type === 'lesson' && n.isCompleted).length;
          const themeTotal = nodes.filter(n => n.themeCode === visibleTheme && n.type === 'lesson').length;
          const pct = themeTotal > 0 ? Math.round((themeDone / themeTotal) * 100) : 0;
          return (
            <div className="lg:hidden sticky z-40 mb-3" style={{ top: 44, background: '#0d1821', borderBottom: `2px solid ${tc}50` }}>
              <div className="flex items-center gap-2.5 px-4 py-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${tc}25`, border: `1.5px solid ${tc}60` }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{em}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span style={{ fontSize: 10, fontWeight: 900, color: tc, letterSpacing: 1.5, textTransform: 'uppercase' }}>Thème {visibleTheme}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }} className="truncate">— {themeData?.title || ''}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${tc}, ${tc}bb)`, width: `${pct}%`, transition: 'width 0.5s ease', minWidth: pct > 0 ? 8 : 0 }} />
                  </div>
                </div>
                <div className="flex-shrink-0 text-right" style={{ minWidth: 36 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: tc }}>{pct}%</span>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{themeDone}/{themeTotal}</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Mobile Gaston — desktop only ── */}
        <div className="hidden lg:flex mb-5 px-3 items-end gap-3">
          <Image src="/images/gaston.png" width={64} height={64} alt="Prof. Gaston" className="gaston-float" style={{ flexShrink: 0, objectFit: 'contain' }} />
          <div style={{
            background: '#FFF8E7',
            border: '1.5px solid #1B3A6B',
            borderRadius: '16px 16px 16px 0',
            padding: '10px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: '#1A1A2E',
            lineHeight: 1.4,
            boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
          }}>
            {greeting}
          </div>
        </div>

        {/* SVG Road */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', overflowX: 'hidden', height: totalH }}>
        <div ref={roadContainerRef} style={{ position: 'relative', width: SVG_W, height: totalH, flexShrink: 0 }}>

          {/* ── Mobile: background color bands per theme ── */}
          {isMobileView && (() => {
            const themeEntries = Array.from(themeAt.entries()).sort((a, b) => a[0] - b[0]);
            return themeEntries.map(([startIdx, themeCode], sIdx) => {
              const nextEntry = themeEntries[sIdx + 1];
              const startY = startIdx > 0 && pts[startIdx - 1] ? pts[startIdx - 1].y + 30 : 0;
              const endY = nextEntry && pts[nextEntry[0] - 1] ? pts[nextEntry[0] - 1].y + 30 : totalH;
              const tc = THEME_COLORS[themeCode] || '#74B9FF';
              return (
                <div key={`bg-${themeCode}`} style={{
                  position: 'absolute', left: 0, width: '100%',
                  top: startY, height: endY - startY,
                  background: `linear-gradient(180deg, ${tc}09 0%, ${tc}05 50%, ${tc}09 100%)`,
                  pointerEvents: 'none',
                  zIndex: 0,
                }} />
              );
            });
          })()}
          <svg width={SVG_W} height={totalH} className="absolute left-0 top-0" style={{ overflow: 'visible' }}>
            {/* Road subtle glow */}
            <path d={pathD} stroke="rgba(45,45,61,0.5)" strokeWidth={ROAD_W + 16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Road border/curb */}
            <path d={pathD} stroke="#3A3A5C" strokeWidth={ROAD_W + 6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Road surface */}
            <path d={pathD} stroke="#2D2D3D" strokeWidth={ROAD_W} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Road edge lines */}
            <path d={pathD} stroke="rgba(255,255,255,0.07)" strokeWidth={ROAD_W + 1} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d={pathD} stroke="#2D2D3D" strokeWidth={ROAD_W - 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Center dashes — white for contrast */}
            <path d={pathD} stroke="#FFFFFF" strokeWidth={2.5} strokeDasharray="12,10" strokeLinecap="round" fill="none" opacity={0.6} />

          </svg>

          {/* ── Toll barriers — desktop only (replaced by section cards on mobile) ── */}
          {Array.from(themeAt.entries()).map(([idx, themeCode], i) => {
            if (isMobileView) return null;
            if (idx >= pts.length) return null;
            const cityName = t(`city_${themeCode}`) || themeCode;
            const tc = THEME_COLORS[themeCode] || '#74B9FF';
            const isLocked = nodes[idx]?.isLocked;

            const POST_W = 18;
            const POST_H = 35;
            const PANEL_H = 28;
            const TOTAL_H = PANEL_H + POST_H;
            const halfRoad = ROAD_W / 2;

            let barrierCenterY: number;
            let roadCenterX: number;

            let roadAngleDeg = 0;
            if (i === 0) {
              barrierCenterY = pts[idx].y - 80;
              roadCenterX = pts[idx].x;
              // First theme — road is straight at the top
              roadAngleDeg = 0;
            } else {
              const examY = pts[idx - 1].y;
              const firstLessonY = pts[idx].y;
              barrierCenterY = examY + (firstLessonY - examY) / 2;
              if (barrierCenterY < examY + 55) barrierCenterY = examY + 55;
              if (barrierCenterY > firstLessonY - 45) barrierCenterY = firstLessonY - 45;
              const t = (barrierCenterY - examY) / (firstLessonY - examY);
              roadCenterX = pts[idx - 1].x + t * (pts[idx].x - pts[idx - 1].x);
              // Compute road tangent using bezier derivative at barrier position
              // The bezier segment goes from pts[idx-1] to pts[idx]
              // C p.x, p.y+dy*0.7, c.x, c.y-dy*0.7, c.x, c.y
              const p0 = pts[idx - 1];
              const p3 = pts[idx];
              const segDy = p3.y - p0.y;
              const cp1 = { x: p0.x, y: p0.y + segDy * 0.7 };
              const cp2 = { x: p3.x, y: p3.y - segDy * 0.7 };
              const t2 = (barrierCenterY - p0.y) / (p3.y - p0.y);
              const tClamped = Math.max(0, Math.min(1, t2));
              // Bezier derivative: 3(1-t)²(cp1-p0) + 6(1-t)t(cp2-cp1) + 3t²(p3-cp2)
              const mt = 1 - tClamped;
              const tangentX = 3 * mt * mt * (cp1.x - p0.x) + 6 * mt * tClamped * (cp2.x - cp1.x) + 3 * tClamped * tClamped * (p3.x - cp2.x);
              const tangentY = 3 * mt * mt * (cp1.y - p0.y) + 6 * mt * tClamped * (cp2.y - cp1.y) + 3 * tClamped * tClamped * (p3.y - cp2.y);
              roadAngleDeg = -Math.atan2(tangentX, tangentY) * (180 / Math.PI);
            }

            const barrierTop = barrierCenterY - TOTAL_H / 2;
            // Use outermost visible road width (glow = ROAD_W + 16)
            const visualHalf = (ROAD_W + 16) / 2;
            const roadLeft = roadCenterX - visualHalf;
            const roadRight = roadCenterX + visualHalf;

            // Posts outside road — outer edge flush with visible road border
            const lpLeftAbs = roadLeft - POST_W;   // left post right edge = road left visible edge
            const rpLeftAbs = roadRight;             // right post left edge = road right visible edge

            // Panel to the left of the road (right edge = left post left edge - 2px gap)
            const PANEL_W = 80;
            const actualPanelW = PANEL_W;
            const panelLeftAbs = lpLeftAbs - PANEL_W - 2;

            // SVG container encompasses everything
            const svgLeft = Math.min(lpLeftAbs, panelLeftAbs) - 2;
            const svgRight = Math.max(rpLeftAbs + POST_W, panelLeftAbs + PANEL_W) + 2;
            const svgW = svgRight - svgLeft;
            const pnlX = panelLeftAbs - svgLeft;
            const lpX = lpLeftAbs - svgLeft;
            const rpX = rpLeftAbs - svgLeft;

            // Fences from reasonable extent to posts
            const FENCE_H = 30;
            const PLANK_W = 8;
            const PLANK_GAP = 3;
            const PLANK_STRIDE = PLANK_W + PLANK_GAP;
            const CROSSBAR_H = 4;
            const fenceTop = barrierTop + PANEL_H + POST_H / 2 - FENCE_H / 2;
            // Fences extend very far — sidebars (z-50) naturally cover them
            const FENCE_EXTEND = 2000;
            const leftFenceEnd = lpLeftAbs;
            const leftFenceStart = leftFenceEnd - FENCE_EXTEND;
            const leftFenceW = FENCE_EXTEND;
            const rightFenceStart = rpLeftAbs + POST_W;
            const rightFenceW = FENCE_EXTEND;
            const leftPlankCount = Math.ceil(leftFenceW / PLANK_STRIDE);
            const rightPlankCount = Math.ceil(rightFenceW / PLANK_STRIDE);

            return (
              <div key={`toll-${i}`} style={{
                transformOrigin: `${roadCenterX}px ${barrierCenterY}px`,
                transform: roadAngleDeg !== 0 ? `rotate(${roadAngleDeg}deg)` : undefined,
              }}>
                {/* Left fence (to left post) */}
                {leftFenceW > 0 && (
                  <svg className="absolute" style={{ left: leftFenceStart, top: fenceTop, pointerEvents: 'none', zIndex: 4 }} width={leftFenceW} height={FENCE_H}>
                    <defs>
                      <linearGradient id={`fwl${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor={tc} stopOpacity={0.6} />
                        <stop offset="0.5" stopColor={tc} />
                        <stop offset="1" stopColor={tc} stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    {Array.from({ length: leftPlankCount }, (_, p) => {
                      const px = leftFenceW - (p + 1) * PLANK_STRIDE;
                      const ph = p % 2 === 0 ? FENCE_H : FENCE_H - 4;
                      const py = (FENCE_H - ph) / 2;
                      return <rect key={p} x={px} y={py} width={PLANK_W} height={ph} fill={`url(#fwl${i})`} stroke={tc} strokeOpacity={0.4} strokeWidth={1} />;
                    })}
                    <rect x={0} y={FENCE_H / 2 - CROSSBAR_H / 2} width={leftFenceW} height={CROSSBAR_H} fill={tc} opacity={0.7} />
                  </svg>
                )}

                {/* Right fence (right post outward) */}
                {rightFenceW > 0 && (
                  <svg className="absolute" style={{ left: rightFenceStart, top: fenceTop, pointerEvents: 'none', zIndex: 4 }} width={rightFenceW} height={FENCE_H}>
                    <defs>
                      <linearGradient id={`fwr${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor={tc} stopOpacity={0.6} />
                        <stop offset="0.5" stopColor={tc} />
                        <stop offset="1" stopColor={tc} stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    {Array.from({ length: rightPlankCount }, (_, p) => {
                      const px = p * PLANK_STRIDE;
                      const ph = p % 2 === 0 ? FENCE_H : FENCE_H - 4;
                      const py = (FENCE_H - ph) / 2;
                      return <rect key={p} x={px} y={py} width={PLANK_W} height={ph} fill={`url(#fwr${i})`} stroke={tc} strokeOpacity={0.4} strokeWidth={1} />;
                    })}
                    <rect x={0} y={FENCE_H / 2 - CROSSBAR_H / 2} width={rightFenceW} height={CROSSBAR_H} fill={tc} opacity={0.7} />
                  </svg>
                )}

                {/* Posts + panel + arm */}
                <svg className="absolute" style={{ left: svgLeft, top: barrierTop, pointerEvents: 'none', zIndex: 12 }} width={svgW} height={TOTAL_H + 20}>
                  <defs>
                    <linearGradient id={`twp${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={tc} stopOpacity={0.5} />
                      <stop offset="0.3" stopColor={tc} />
                      <stop offset="0.7" stopColor={tc} stopOpacity={0.8} />
                      <stop offset="1" stopColor={tc} stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id={`twpnl${i}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor={tc} />
                      <stop offset="1" stopColor={tc} stopOpacity={0.7} />
                    </linearGradient>
                  </defs>

                  {/* Left post */}
                  <rect x={lpX} y={PANEL_H} width={POST_W} height={POST_H} fill={`url(#twp${i})`} stroke={tc} strokeOpacity={0.3} strokeWidth={2} />
                  <line x1={lpX + 3} y1={PANEL_H + 7} x2={lpX + POST_W - 3} y2={PANEL_H + 7} stroke="#FFF" strokeWidth={0.6} opacity={0.15} />
                  <line x1={lpX + 3} y1={PANEL_H + 14} x2={lpX + POST_W - 3} y2={PANEL_H + 14} stroke="#FFF" strokeWidth={0.6} opacity={0.15} />
                  <line x1={lpX + 3} y1={PANEL_H + 21} x2={lpX + POST_W - 3} y2={PANEL_H + 21} stroke="#FFF" strokeWidth={0.6} opacity={0.15} />
                  <line x1={lpX + 3} y1={PANEL_H + 28} x2={lpX + POST_W - 3} y2={PANEL_H + 28} stroke="#FFF" strokeWidth={0.6} opacity={0.15} />

                  {/* Right post */}
                  <rect x={rpX} y={PANEL_H} width={POST_W} height={POST_H} fill={`url(#twp${i})`} stroke={tc} strokeOpacity={0.3} strokeWidth={2} />
                  <line x1={rpX + 3} y1={PANEL_H + 8} x2={rpX + POST_W - 3} y2={PANEL_H + 8} stroke="#FFF" strokeWidth={0.6} opacity={0.15} />
                  <line x1={rpX + 3} y1={PANEL_H + 16} x2={rpX + POST_W - 3} y2={PANEL_H + 16} stroke="#FFF" strokeWidth={0.6} opacity={0.15} />
                  <line x1={rpX + 3} y1={PANEL_H + 23} x2={rpX + POST_W - 3} y2={PANEL_H + 23} stroke="#FFF" strokeWidth={0.6} opacity={0.15} />
                  <line x1={rpX + 3} y1={PANEL_H + 30} x2={rpX + POST_W - 3} y2={PANEL_H + 30} stroke="#FFF" strokeWidth={0.6} opacity={0.15} />
                  {/* Traffic light on right post */}
                  <circle cx={rpX + POST_W / 2} cy={PANEL_H - 8} r={6} fill={isLocked ? '#E74C3C' : '#4CAF50'} />
                  <circle cx={rpX + POST_W / 2 - 1.5} cy={PANEL_H - 10} r={2} fill="#FFF" opacity={0.3} />

                  {/* Name panel */}
                  <rect x={pnlX} y={0} width={actualPanelW} height={PANEL_H} rx={4} fill={`url(#twpnl${i})`} stroke={tc} strokeOpacity={0.4} strokeWidth={2.5} />
                  <circle cx={pnlX + 6} cy={6} r={3} fill="#FFF" opacity={0.5} />
                  <circle cx={pnlX + actualPanelW - 6} cy={6} r={3} fill="#FFF" opacity={0.5} />
                  <circle cx={pnlX + 6} cy={PANEL_H - 6} r={3} fill="#FFF" opacity={0.5} />
                  <circle cx={pnlX + actualPanelW - 6} cy={PANEL_H - 6} r={3} fill="#FFF" opacity={0.5} />
                  <text x={pnlX + actualPanelW / 2} y={PANEL_H / 2 + 4} fontSize={actualPanelW < 65 ? 9 : 11} fill="#FFF" fontWeight="bold" textAnchor="middle" letterSpacing={actualPanelW < 65 ? 0 : 2}>{cityName}</text>

                </svg>
              </div>
            );
          })}

          {/* ── Mobile section cards (replace toll barriers) ── */}
          {isMobileView && Array.from(themeAt.entries()).map(([idx, themeCode], ti) => {
            if (idx >= pts.length) return null;
            const p = pts[idx];
            const tc = THEME_COLORS[themeCode] || '#74B9FF';
            const em = THEME_EMOJIS[themeCode] || '📚';
            const theme = getThemeDataLocalized(themeCode, lang);
            const isLocked = nodes[idx]?.isLocked;
            const cityName = t(`city_${themeCode}`) || themeCode;
            const themeDone = nodes.filter(n => n.themeCode === themeCode && n.type === 'lesson' && n.isCompleted).length;
            const themeTotal = nodes.filter(n => n.themeCode === themeCode && n.type === 'lesson').length;
            const cardW = SVG_W - 24;
            const cardX = 12;
            const cardY = p.y - 75;
            return (
              <div key={`mcard-${themeCode}`} className="absolute" style={{ left: cardX, top: cardY, width: cardW, zIndex: 10 }}>
                <div style={{
                  background: `linear-gradient(135deg, ${tc}22, ${tc}0c)`,
                  border: `1.5px solid ${tc}50`,
                  borderRadius: 14,
                  padding: '7px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  backdropFilter: 'blur(4px)',
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 17, background: `${tc}30`, border: `2px solid ${tc}80`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 17 }}>{em}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 900, color: tc, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 1 }}>
                      THÈME {themeCode} · {cityName}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {theme?.title || ''}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'center' }}>
                    {isLocked ? (
                      <span style={{ fontSize: 15, opacity: 0.7 }}>🔒</span>
                    ) : (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 900, color: tc }}>{themeDone}/{themeTotal}</div>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>leçons</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── Theme banners — above-right of barrier, never overlapping road ── */}
          {Array.from(themeAt.entries()).map(([idx, themeCode], ti) => {
            if (idx >= pts.length) return null;
            const p = pts[idx];
            const tc = THEME_COLORS[themeCode] || '#74B9FF';
            const em = THEME_EMOJIS[themeCode] || '📚';
            const theme = getThemeDataLocalized(themeCode, lang);
            const isLocked = nodes[idx]?.isLocked;

            // Compute barrier road center (same logic as barrier code)
            let roadCX: number;
            if (ti === 0) {
              roadCX = pts[idx].x;
            } else {
              const examY = pts[idx - 1].y;
              const firstY = pts[idx].y;
              let bCY = firstY - 90;
              if (bCY < examY + 70) bCY = examY + 70;
              const t = (bCY - examY) / (firstY - examY);
              roadCX = pts[idx - 1].x + t * (pts[idx].x - pts[idx - 1].x);
            }

            // Banner sits above the barrier, to the right of the fence
            const barrierTopY = p.y - 90 - 32; // barrier top approx
            const bannerY = barrierTopY - 48;
            // Right of the right fence edge — nudge left for themes where road is far right
            const bannerNudge: Record<string, number> = { E: -35, F: -20 };
            const bannerX = roadCX + ROAD_W / 2 + 55 + (bannerNudge[themeCode] || 0);

            const bAdj = getElemAdj(`banner-${themeCode}`);
            return (
              <div
                key={`theme-${themeCode}`}
                className="absolute hidden lg:block"
                style={{
                  top: bannerY + bAdj.dy,
                  left: bannerX + bAdj.dx,
                  opacity: isLocked ? 0.25 : 1,
                  zIndex: 15,
                  transform: bAdj.scale !== 1 || bAdj.rot !== 0 ? `scale(${bAdj.scale}) rotate(${bAdj.rot}deg)` : undefined,
                  transformOrigin: 'center center',
                }}
              >
                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl" style={{
                  background: tc,
                  boxShadow: `0 4px 16px ${tc}40`,
                  whiteSpace: 'nowrap',
                }}>
                  <span className="text-xl">{em}</span>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Thème {themeCode}
                    </div>
                    <div className="text-[14px] font-extrabold text-white">
                      {theme?.title || t(`theme_title_${themeCode}`) || ''}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── Node circles ── */}
          {nodes.map((node, i) => {
            if (i >= pts.length) return null;
            const p = pts[i];

            if (node.type === 'exam') {
              const tc = THEME_COLORS[node.themeCode] || '#F39C12';
              const lockedOpacity = node.isLocked ? 0.25 : 1;
              // On mobile: same size as lesson nodes for visual consistency
              const eR = isMobileView ? mNODE_R : mEXAM_R;
              const eRingR = eR + mRING_GAP;
              const eRingSize = (eRingR + mRING_STROKE / 2) * 2;

              return (
                <div key={node.id} className="absolute" style={{
                  left: p.x - eRingSize / 2,
                  top: p.y - eRingSize / 2,
                  width: eRingSize,
                  height: eRingSize,
                  zIndex: 14,
                  overflow: 'visible',
                }}>
                  <div style={{ opacity: lockedOpacity }}>
                    <svg width={eRingSize} height={eRingSize} className="absolute inset-0">
                      <circle cx={eRingSize / 2} cy={eRingSize / 2} r={eRingR} stroke="#F39C12" strokeWidth={mRING_STROKE} fill="none" />
                    </svg>
                    {node.isLocked ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full flex items-center justify-center" style={{
                          width: eR * 2,
                          height: eR * 2,
                          background: '#F39C12',
                          border: '4px solid #E67E22',
                          boxShadow: '0 0 14px rgba(243,156,18,0.6)',
                        }}>
                          <span className="text-3xl">📝</span>
                        </div>
                      </div>
                    ) : (
                      <Link href={`/examen?theme=${node.themeCode}`} className="absolute inset-0 flex items-center justify-center node-hover">
                        <div className="rounded-full flex items-center justify-center" style={{
                          width: eR * 2,
                          height: eR * 2,
                          background: node.isCompleted ? '#27AE60' : '#F39C12',
                          border: `4px solid ${node.isCompleted ? '#1E8449' : '#E67E22'}`,
                          boxShadow: node.isCompleted ? '0 0 12px rgba(39,174,96,0.4)' : '0 0 14px rgba(243,156,18,0.6)',
                        }}>
                          <span className="text-3xl">{node.isCompleted ? '👑' : '📝'}</span>
                        </div>
                      </Link>
                    )}

                    <div className="absolute left-1/2 -translate-x-1/2 text-center" style={{
                      top: eRingSize + 4,
                      width: 80,
                    }}>
                      <span className="text-xs font-black tracking-wider" style={{ color: '#F39C12' }}>{t('examen_node')}</span>
                    </div>

                    <div className="absolute" style={{ left: eR + 10, top: -16 }}>
                      <span className="text-base star-twinkle">⭐</span>
                    </div>
                  </div>

                  {/* Bonus card (Flash/Révision) — desktop only */}
                  <div className="absolute hidden lg:block rounded-xl py-1.5 px-2" style={{
                    left: eRingSize + 15,
                    top: i === nodes.length - 1 ? 50 : 20,
                    width: 110,
                    transform: 'scale(0.92)',
                    transformOrigin: 'top left',
                    background: '#16213E',
                    borderRadius: 12,
                    zIndex: 12,
                    opacity: lockedOpacity,
                  }}>
                    {node.isLocked ? (
                      <>
                        <div className="flex items-center gap-2 py-1.5">
                          <span>🃏</span>
                          <span className="text-[13px] font-bold" style={{ color: '#6C5CE7' }}>{t('flash_label')}</span>
                        </div>
                        <div className="h-px" style={{ background: 'rgba(139,157,195,0.15)' }} />
                        <div className="flex items-center gap-2 py-1.5">
                          <span>🔄</span>
                          <span className="text-[13px] font-bold" style={{ color: '#74B9FF' }}>{t('revision_label')}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link href={`/flash?theme=${node.themeCode}`} className="flex items-center gap-2 py-1.5 press-scale">
                          <span>🃏</span>
                          <span className="text-[13px] font-bold" style={{ color: '#6C5CE7' }}>{t('flash_label')}</span>
                        </Link>
                        <div className="h-px" style={{ background: 'rgba(139,157,195,0.15)' }} />
                        <Link href={`/revision?theme=${node.themeCode}`} className="flex items-center gap-2 py-1.5 press-scale">
                          <span>🔄</span>
                          <span className="text-[13px] font-bold" style={{ color: '#74B9FF' }}>{t('revision_label')}</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            }

            // ── Lesson node ──
            const tc = THEME_COLORS[node.themeCode] || '#74B9FF';
            const isActive = node.isCurrent;
            const nodeRadius = isActive ? mACTIVE_R : mNODE_R;
            const ringRadius = nodeRadius + mRING_GAP;
            const ringSize = (ringRadius + mRING_STROKE / 2) * 2;
            const ringCirc = 2 * Math.PI * ringRadius;
            const ringProgress = node.isCompleted ? 1 : 0;

            // Colors
            const bg = node.isCompleted ? tc : isActive ? tc : node.isLocked ? tc : '#141937';
            const borderColor = tc;
            const ringColor = tc;

            // Node icon
            const iconSize = isMobileView ? nodeRadius * 0.9 : nodeRadius;
            let nodeContent: React.ReactNode;
            if (node.isCompleted) {
              nodeContent = <span style={{ color: '#fff', fontSize: iconSize, fontWeight: 900, lineHeight: 1 }}>✓</span>;
            } else if (node.isLocked) {
              nodeContent = <span style={{ fontSize: iconSize * 0.75, lineHeight: 1 }}>🔒</span>;
            } else if (node.isOrderLocked) {
              nodeContent = <span style={{ fontSize: iconSize * 0.75, fontWeight: 900, color: 'rgba(255,255,255,0.45)', lineHeight: 1 }}>{node.localIndex}</span>;
            } else if (isActive) {
              nodeContent = <span style={{ fontSize: iconSize * 0.9, lineHeight: 1 }}>▶</span>;
            } else {
              nodeContent = <span style={{ fontSize: iconSize * 0.75, fontWeight: 900, color: tc, lineHeight: 1 }}>{node.localIndex}</span>;
            }

            return (
              <div key={node.id} className="absolute" style={{
                left: p.x - ringSize / 2,
                top: p.y - ringSize / 2,
                width: ringSize,
                height: ringSize,
                zIndex: isActive ? 16 : 14,
                opacity: node.isLocked ? (isMobileView ? 0.35 : 0.25) : node.isOrderLocked ? 0.5 : 1,
              }}>
                {/* Progress ring */}
                <svg width={ringSize} height={ringSize} className="absolute inset-0">
                  <circle cx={ringSize / 2} cy={ringSize / 2} r={ringRadius} stroke="#2D2D3D" strokeWidth={RING_STROKE} fill="none" />
                  {ringProgress > 0 && (
                    <circle cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                      stroke={ringColor} strokeWidth={RING_STROKE} fill="none"
                      strokeDasharray={`${ringCirc}`}
                      strokeDashoffset={`${ringCirc * (1 - ringProgress)}`}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                    />
                  )}
                </svg>

                {/* Node circle */}
                {node.isLocked ? (
                  <button onClick={() => setShowPremiumModal(true)} title="🔒 Débloque avec Premium" className="absolute inset-0 flex items-center justify-center cursor-pointer">
                    <div className="rounded-full flex items-center justify-center" style={{
                      width: nodeRadius * 2,
                      height: nodeRadius * 2,
                      background: bg,
                      border: `3px solid ${borderColor}`,
                    }}>
                      {nodeContent}
                    </div>
                  </button>
                ) : node.isOrderLocked ? (
                  <button onClick={() => setShowOrderLockedModal(true)} title="🔒 Termine la leçon précédente d'abord" className="absolute inset-0 flex items-center justify-center cursor-pointer">
                    <div className="rounded-full flex items-center justify-center relative" style={{
                      width: nodeRadius * 2,
                      height: nodeRadius * 2,
                      background: '#141937',
                      border: `3px solid ${tc}40`,
                    }}>
                      {nodeContent}
                      <span className="absolute text-[9px]" style={{ top: -3, right: -3 }}>🔒</span>
                    </div>
                  </button>
                ) : (
                  <button onClick={() => openLessonModal(node)} className="absolute inset-0 flex items-center justify-center node-hover cursor-pointer">
                    <div className={`rounded-full flex items-center justify-center ${isActive ? 'node-pulse' : ''}`} style={{
                      width: nodeRadius * 2,
                      height: nodeRadius * 2,
                      background: bg,
                      border: `3px solid ${borderColor}`,
                      boxShadow: isActive ? '0 0 20px rgba(78,205,196,0.6)' : node.isCompleted ? '0 0 10px rgba(39,174,96,0.3)' : 'none',
                      // @ts-ignore -- CSS custom property for pulse color
                      '--pulse-color': 'rgba(78,205,196,0.5)',
                    } as React.CSSProperties}>
                      {nodeContent}
                    </div>
                  </button>
                )}

                {/* ── COMMENCER floating button (active node only) ── */}
                {isActive && !node.isLocked && !node.isOrderLocked && (
                  <button
                    onClick={() => openLessonModal(node)}
                    className="commencer-float commencer-shimmer absolute cursor-pointer press-scale"
                    style={{
                      left: '50%',
                      top: ringSize + 6,
                      transform: 'translateX(-50%)',
                      background: tc,
                      color: '#fff',
                      fontSize: isMobileView ? 13 : 11,
                      fontWeight: 900,
                      padding: isMobileView ? '9px 20px' : '6px 14px',
                      borderRadius: 20,
                      whiteSpace: 'nowrap',
                      boxShadow: `0 6px 20px ${tc}90`,
                      letterSpacing: '0.5px',
                      zIndex: 18,
                      border: `1.5px solid ${tc}`,
                    }}
                  >
                    {t('commencer')} ▶
                  </button>
                )}

                {/* Stars for completed nodes — 3-star display, centred below ring */}
                {node.isCompleted && (
                  <div style={{
                    position: 'absolute',
                    top: ringSize + 2,
                    left: 0,
                    width: ringSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}>
                    {[1, 2, 3].map(s => (
                      <span key={s} style={{ fontSize: isMobileView ? 9 : 11, opacity: node.stars >= s ? 1 : 0.18, lineHeight: 1 }}>⭐</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Monument decorations ── */}
          {Array.from(themeAt.entries()).map(([startIdx, themeCode]) => {
            const monuments = MONUMENTS[themeCode];
            if (!monuments || monuments.length === 0) return null;

            let endIdx = startIdx;
            for (let j = startIdx + 1; j < nodes.length; j++) {
              if (nodes[j].themeCode !== themeCode) { endIdx = j - 1; break; }
              endIdx = j;
            }

            if (endIdx <= startIdx || startIdx >= pts.length || endIdx >= pts.length) return null;
            const startY = pts[startIdx].y;
            const endY = pts[endIdx].y;
            const span = endY - startY;
            if (span < 100) return null;

            return monuments.map((mon, mi) => {
              const monCenterY = startY + span * mon.yRatio + (mon.yOffset || 0);
              const monI = (monCenterY - PAD_TOP) / V_SPACE;
              const roadCXAtY = CX + AMP * Math.cos((monI * Math.PI) / 1.8);
              const roadL = roadCXAtY - ROAD_W / 2;
              const roadR = roadCXAtY + ROAD_W / 2;

              let left: number;
              if (mon.side === 'left') {
                left = roadL / 2 - mon.w / 2 + (mon.xOffset || 0);
              } else {
                left = roadR + (SVG_W - roadR) / 2 - mon.w / 2 + (mon.xOffset || 0);
              }
              const top = Math.max(0, monCenterY - mon.h / 2);

              const monId = `mon-${themeCode}-${mi}`;
              const adj = getElemAdj(monId);
              return (
                <div
                  key={monId}
                  className="absolute pointer-events-none monument-reveal hidden md:block"
                  style={{
                    left: left + adj.dx,
                    top: top + adj.dy,
                    width: mon.w * adj.scale,
                    height: mon.h * adj.scale,
                    zIndex: 6,
                    transform: adj.rot !== 0 ? `rotate(${adj.rot}deg)` : undefined,
                    transformOrigin: 'center center',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mon.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              );
            });
          })}

          {/* ── Car ── */}
          {curIdx >= 0 && (
            <div className="absolute car-bounce" style={{
              left: carX - CAR_SIZE / 2,
              top: carY - CAR_SIZE / 2,
              width: CAR_SIZE + 10,
              height: CAR_SIZE + 10,
              zIndex: 20,
              transform: `rotate(${carTilt}deg)`,
            }}>
              {userCar.carImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userCar.carImage} alt="car" width={CAR_SIZE + 10} height={CAR_SIZE + 10} style={{ objectFit: 'contain', filter: `drop-shadow(0 4px 8px ${userCar.carColor}88)` }} />
              ) : (
                <CarSVG type={userCar.carType} color={userCar.carColor} size={CAR_SIZE + 10} />
              )}
            </div>
          )}

          {/* ── Final Exam Button ── */}
          <div className="absolute flex flex-col items-center" style={{
            left: CX - 50,
            top: finishY - 130,
            width: 100,
            zIndex: 30,
          }}>
            <Link href="/examen?theme=FINAL" className="press-scale">
              <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-4xl"
                style={{
                  background: '#16213E',
                  border: '4px solid #00D2FF',
                  boxShadow: '0 0 20px rgba(0,210,255,0.4)',
                }}>
                🎓
              </div>
            </Link>
            <span className="text-[11px] font-black mt-1.5 uppercase tracking-wider text-center" style={{ color: '#00D2FF' }}>Examen Final</span>
          </div>

          {/* ── Finish line ── */}
          <div className="absolute" style={{
            left: CX - ROAD_W / 2,
            top: finishY - SQ,
            width: ROAD_W,
            zIndex: 12,
          }}>
            {[0, 1].map(row => (
              <div key={row} className="flex">
                {[...Array(5)].map((_, col) => (
                  <div key={col} style={{
                    width: SQ,
                    height: SQ,
                    backgroundColor: (row + col) % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.5)',
                  }} />
                ))}
              </div>
            ))}
          </div>

          {/* ── Cloud overlays for locked themes — desktop only (mobile shows dimmed nodes) ── */}
          {(() => {
            if (isMobileView) return null;
            const themeEntries = Array.from(themeAt.entries()).sort((a, b) => a[0] - b[0]);
            return themeEntries.map(([startIdx, themeCode], sIdx) => {
              const isLocked = nodes[startIdx]?.isLocked;
              if (!isLocked) return null;

              const endIdx = sIdx < themeEntries.length - 1 ? themeEntries[sIdx + 1][0] - 1 : nodes.length - 1;
              if (startIdx >= pts.length || endIdx >= pts.length) return null;
              const startY = pts[startIdx].y;
              const endY = pts[endIdx].y;
              const zoneH = endY - startY + V_SPACE + 170;
              const cloudCount = Math.max(7, Math.floor(zoneH / 120) * 3);

              return (
                <div key={`cloud-${themeCode}`} className="absolute left-0 w-full" style={{
                  top: startY - V_SPACE,
                  height: zoneH,
                  zIndex: 25,
                  pointerEvents: 'none',
                }}>
                  {Array.from({ length: cloudCount }, (_, ci) => (
                    <span key={ci} className="absolute" style={{
                      left: (ci * 97 + 15) % (SVG_W * 0.85),
                      top: ((ci * 0.137 + 0.05) % 0.9) * zoneH,
                      fontSize: 18 + (ci % 5) * 3,
                      opacity: 0.5,
                    }}>
                      ☁️
                    </span>
                  ))}
                </div>
              );
            });
          })()}
        </div>
        </div>{/* end flex wrapper */}

      </div>

      {/* ═══════════════════════════════════════ */}
      {/* RIGHT SIDEBAR — Desktop only (~300px) */}
      {/* ═══════════════════════════════════════ */}
      <aside className="hidden xl:flex flex-col gap-5 fixed right-0 top-0 h-full overflow-y-auto py-6 px-5 z-50" style={{ width: 500, background: '#0F1923', borderLeft: '1px solid #16213E' }}>

        {/* ── Stats du jour ── */}
        <div className="stat-card stat-card-glow">
          <h3 className="text-xs font-black uppercase tracking-wider mb-4" style={{ color: '#8B9DC3' }}>{t('stats_du_jour')}</h3>
          <div className="flex flex-col gap-3">
            {/* Streak badge */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#FF6348' }}>
              <span className="text-xl">🔥</span>
              <span className="text-sm font-black text-white">{streak.currentStreak} {streak.currentStreak !== 1 ? t('jours_plur') : t('jour_sing')}</span>
            </div>
            {/* XP badge */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,215,0,0.08)' }}>
              <span className="text-xl">⚡</span>
              <div className="flex-1">
                <div className="text-sm font-extrabold" style={{ color: '#FFD700' }}>{xp.totalXP}</div>
                <div className="text-[10px] font-semibold" style={{ color: '#5A6B8A' }}>{t('xp_total')}</div>
              </div>
            </div>
            {/* Level badge */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(0,184,148,0.1)' }}>
              <span className="text-xl">🎯</span>
              <div className="flex-1">
                <div className="text-sm font-extrabold" style={{ color: '#00B894' }}>{t('niveau')} {xp.level}</div>
                <div className="text-[10px] font-semibold" style={{ color: '#5A6B8A' }}>{t('progression_label')}</div>
              </div>
            </div>
          </div>
        </div>


        {/* ── Prof. Gaston dit... ── */}
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Image src="/images/gaston.png" width={40} height={40} alt="Prof. Gaston" className="gaston-float" style={{ objectFit: 'contain' }} />
            <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#8B9DC3' }}>{t('prof_gaston_dit')}</span>
          </div>
          <div style={{
            background: '#FFF8E7',
            border: '1.5px solid #1B3A6B',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: '#1A1A2E',
            lineHeight: 1.45,
          }}>
            {greeting}
          </div>
        </div>

        {/* ── Progression ── */}
        <div className="stat-card">
          <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: '#8B9DC3' }}>{t('progression_label')}</h3>

          {/* Leçons progress */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold">{t('lecons')}</span>
              <span className="text-xs font-bold" style={{ color: '#00B894' }}>{totalCompleted}/{totalLessons}</span>
            </div>
            <div className="w-full h-2.5 rounded-full" style={{ background: '#2D2D3D' }}>
              <div className="h-full rounded-full transition-all" style={{
                width: `${totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #00B894, #55EFC4)',
                minWidth: totalCompleted > 0 ? 8 : 0,
              }} />
            </div>
          </div>

          {/* Examens progress */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold">{t('examens_label')}</span>
              <span className="text-xs font-bold" style={{ color: '#F39C12' }}>{totalExamsPassed}/{THEME_ORDER.length}</span>
            </div>
            <div className="w-full h-2.5 rounded-full" style={{ background: '#2D2D3D' }}>
              <div className="h-full rounded-full transition-all" style={{
                width: `${(totalExamsPassed / THEME_ORDER.length) * 100}%`,
                background: 'linear-gradient(90deg, #F39C12, #FDCB6E)',
                minWidth: totalExamsPassed > 0 ? 8 : 0,
              }} />
            </div>
          </div>

          {/* Per-theme mini progress */}
          <div className="mt-4 flex flex-col gap-1.5">
            {THEME_ORDER.map(tc => {
              const theme = getThemeDataLocalized(tc, lang);
              if (!theme) return null;
              const done = theme.lessons.filter((_, idx) => {
                const lid = theme.lessons[idx]?.id || (tc + (idx + 1));
                return (stars[lid] ?? 0) > 0;
              }).length;
              const total = theme.lessons.length;
              const examDone = exams[tc] === true;

              return (
                <div key={tc} className="flex items-center gap-2">
                  <span className="text-xs w-4 text-center font-bold" style={{ color: THEME_COLORS[tc] }}>{tc}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: '#2D2D3D' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${total > 0 ? (done / total) * 100 : 0}%`,
                      background: THEME_COLORS[tc],
                      minWidth: done > 0 ? 4 : 0,
                    }} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: '#5A6B8A' }}>{done}/{total}</span>
                  {examDone && <span className="text-[10px]">👑</span>}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ── Lesson Modal ── */}
      {modalNode && (() => {
        const lesson = getLessonDataLocalized(modalNode.id, lang);
        const tc = THEME_COLORS[modalNode.themeCode] || '#74B9FF';
        const em = THEME_EMOJIS[modalNode.themeCode] || '📚';
        const theories = lesson?.theory ?? [];
        const progress = getLessonProgress(modalNode.id);
        // lessonFullyDone = only when full lesson quiz (non-partie) was completed
        // Do NOT use modalNode.isCompleted (stars > 0) — a partie quiz also grants stars
        // and would incorrectly mark all parties as done
        const lessonFullyDone = progress.quizDone;

        const nextPartieIdx = completedParties.length < theories.length ? completedParties.length : 0;

        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={closeModal}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} />

            <div
              className="relative w-full max-w-lg rounded-t-[28px] px-6 pt-6 pb-10 slide-up"
              style={{ background: '#1C2345', maxHeight: '88vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-[5px] rounded-full mx-auto mb-5" style={{ background: '#5A6B8A' }} />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl" style={{ background: tc + '20' }}>
                  {em}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: tc }}>
                    Thème {modalNode.themeCode} · Leçon {modalNode.localIndex}
                  </p>
                  <p className="text-xl font-extrabold truncate">{modalNode.title}</p>
                </div>
              </div>

              {theories.length > 0 && (
                <div className="mb-4">
                  {theories.map((partie, idx) => {
                    const done = completedParties.includes(idx) || lessonFullyDone;
                    // Partie N+1 locked until partie N completed (except partie 0 always accessible)
                    const unlocked = isVip || idx === 0 || completedParties.includes(idx - 1) || lessonFullyDone;
                    const isSelected = selectedPartieIdx === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => unlocked ? setSelectedPartieIdx(isSelected ? null : idx) : undefined}
                        disabled={!unlocked}
                        className="w-full flex items-center gap-3 py-3 px-3 rounded-xl mb-1.5 transition-all text-left"
                        style={{
                          background: isSelected ? tc + '18' : 'transparent',
                          border: isSelected ? `2px solid ${tc}` : '1px solid rgba(255,255,255,0.08)',
                          opacity: unlocked ? 1 : 0.4,
                        }}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0" style={{
                          background: done ? '#27AE60' : isSelected ? tc : 'rgba(255,255,255,0.12)',
                        }}>
                          {done ? '✓' : unlocked ? idx + 1 : '🔒'}
                        </div>
                        <span className={`flex-1 text-sm font-semibold truncate ${done ? 'line-through opacity-40' : ''}`}>
                          {partie.title}
                        </span>
                        {isSelected && <span className="text-base">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedPartieIdx !== null ? (
                <button
                  onClick={() => startPartie(selectedPartieIdx)}
                  className="w-full py-4 rounded-2xl font-extrabold text-white text-lg press-scale"
                  style={{ background: tc }}
                >
                  {t('commencer_partie')} {selectedPartieIdx + 1} ▶
                </button>
              ) : !lessonFullyDone && theories.length > 0 ? (
                <button
                  onClick={() => startPartie(nextPartieIdx)}
                  className="w-full py-4 rounded-2xl font-extrabold text-white text-lg press-scale"
                  style={{ background: tc }}
                >
                  {completedParties.length > 0
                    ? `Continuer — Partie ${nextPartieIdx + 1} ▶`
                    : 'Commencer la Partie 1 ▶'}
                </button>
              ) : theories.length === 0 ? (
                <button
                  onClick={startFullLesson}
                  className="w-full py-4 rounded-2xl font-extrabold text-white text-lg press-scale"
                  style={{ background: tc }}
                >
                  Commencer la leçon ▶
                </button>
              ) : (
                <button
                  onClick={startFullLesson}
                  className="w-full py-4 rounded-2xl font-extrabold text-white text-lg press-scale"
                  style={{ background: tc }}
                >
                  🔄 Recommencer la leçon
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Order Locked Modal ── */}
      {showOrderLockedModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={() => setShowOrderLockedModal(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} />
          <div
            className="relative w-full max-w-lg rounded-t-[28px] px-6 pt-6 pb-10 slide-up text-center"
            style={{ background: '#1C2345' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-[5px] rounded-full mx-auto mb-5" style={{ background: '#5A6B8A' }} />
            <span className="text-5xl block mb-4">🔒</span>
            <h2 className="text-xl font-black text-white mb-2">Leçon verrouillée</h2>
            <p className="text-sm mb-6" style={{ color: '#8B9DC3' }}>
              Termine la leçon précédente avec au moins 70% pour débloquer celle-ci.
            </p>
            <button
              onClick={() => setShowOrderLockedModal(false)}
              className="w-full py-3.5 rounded-2xl font-extrabold text-white press-scale"
              style={{ background: '#4ecdc4' }}
            >
              Compris
            </button>
          </div>
        </div>
      )}

      {/* ── Premium Modal ── */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={() => setShowPremiumModal(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.75)' }} />
          <div
            className="relative w-full max-w-lg rounded-t-[28px] px-6 pt-6 pb-10 slide-up"
            style={{ background: '#1C2345' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-[5px] rounded-full mx-auto mb-5" style={{ background: '#5A6B8A' }} />

            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-5xl block mb-3">🔒</span>
              <h2 className="text-2xl font-black text-white mb-2">Débloquer tous les thèmes</h2>
              <p className="text-sm" style={{ color: '#8B9DC3' }}>
                Les thèmes B→I sont réservés aux membres Premium.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              {[
                { icon: '📚', label: '8 thèmes supplémentaires débloqués' },
                { icon: '📝', label: 'Examens blancs illimités' },
                { icon: '⚡', label: 'Mode Turbo sans limite quotidienne' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.12)' }}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Price + CTA */}
            <div className="text-center mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block" style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700' }}>
                ✨ Essai gratuit 7 jours
              </span>
              <p className="text-3xl font-black text-white mb-0.5">7€ <span className="text-base font-normal" style={{ color: '#8B9DC3' }}>/mois</span></p>
              <p className="text-xs" style={{ color: '#5A6B8A' }}>Annulable à tout moment</p>
            </div>

            <button
              onClick={() => { setShowPremiumModal(false); router.push('/premium'); }}
              className="w-full py-4 rounded-2xl font-extrabold text-lg press-scale mb-3"
              style={{ background: '#4ecdc4', color: '#0a0e2a', boxShadow: '0 4px 20px rgba(78,205,196,0.4)' }}
            >
              Commencer l&apos;essai gratuit ✨
            </button>

            <button
              onClick={() => setShowPremiumModal(false)}
              className="w-full py-2 text-sm"
              style={{ color: '#5A6B8A' }}
            >
              Rester sur le thème gratuit
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
