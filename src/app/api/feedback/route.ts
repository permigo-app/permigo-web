import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ── In-memory rate limiting ─────────────────────────────────────────────────
// Fonctionne en dev et sur un serveur unique.
// TODO: En production Vercel (multi-instances), remplacer par Redis/Upstash
//       pour un rate limiting fiable entre toutes les instances.
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60 * 1000;

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

function isRepetitive(s: string): boolean {
  if (!s) return true;
  const freq = new Map<string, number>();
  for (const c of s) freq.set(c, (freq.get(c) ?? 0) + 1);
  const maxFreq = Math.max(...freq.values());
  // Reject if >80% same character (ex: "aaaaaaa" or "😂😂😂😂😂")
  return maxFreq / s.length > 0.8;
}

export async function POST(req: NextRequest) {
  // ── Vérification config serveur ───────────────────────────────────────────
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || serviceKey === 'REMPLACE_PAR_TA_CLE_SERVICE_ROLE' || !supabaseUrl) {
    console.error('[feedback/api] SUPABASE_SERVICE_ROLE_KEY manquant ou non configuré');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // ── Rate limiting par IP ──────────────────────────────────────────────────
  const ip = getClientIp(req);
  const lastRequest = rateLimitMap.get(ip) ?? 0;
  const now = Date.now();
  if (now - lastRequest < RATE_LIMIT_MS) {
    return NextResponse.json({ error: 'rate_limit' }, { status: 429 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: { category?: string; message?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { category, message, email } = body;

  // ── Validation catégorie ──────────────────────────────────────────────────
  if (!['bug', 'suggestion', 'other'].includes(category ?? '')) {
    return NextResponse.json({ error: 'invalid_category' }, { status: 400 });
  }

  // ── Validation message ────────────────────────────────────────────────────
  const trimmedMessage = (message ?? '').trim();
  if (trimmedMessage.length < 10) {
    return NextResponse.json({ error: 'message_too_short' }, { status: 400 });
  }
  if (trimmedMessage.length > 2000) {
    return NextResponse.json({ error: 'message_too_long' }, { status: 400 });
  }
  if (isRepetitive(trimmedMessage)) {
    return NextResponse.json({ error: 'message_repetitive' }, { status: 400 });
  }

  // ── Metadata ──────────────────────────────────────────────────────────────
  const pageUrl = req.headers.get('referer') ?? '';
  const userAgent = req.headers.get('user-agent') ?? '';

  // Email utilisateur (optionnel, fourni depuis le formulaire)
  const userEmail = (typeof email === 'string' && email.trim()) ? email.trim() : null;

  // ── Insert Supabase (service role — bypass RLS) ───────────────────────────
  // La clé service_role ne doit JAMAIS être exposée côté client.
  // Elle n'est utilisée qu'ici, côté serveur.
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { error: dbError } = await adminClient.from('feedbacks').insert({
    user_email: userEmail,
    category,
    message: trimmedMessage,
    page_url: pageUrl,
    user_agent: userAgent,
  });

  if (dbError) {
    console.error('[feedback/api] Erreur INSERT Supabase:', dbError.message);
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Enregistrer le timestamp APRÈS l'insert réussi
  rateLimitMap.set(ip, now);

  return NextResponse.json({ success: true });
}
