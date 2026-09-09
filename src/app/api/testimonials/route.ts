import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function anonClient(token?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : undefined,
  );
}

/**
 * GET — les témoignages affichables publiquement.
 *
 * Ne renvoie que ceux marqués `publie = true` dans Supabase : rien n'apparaît
 * sur le site sans une validation manuelle. Si la table n'existe pas encore
 * (migration pas jouée), on renvoie une liste vide plutôt qu'une erreur — la
 * section disparaît simplement de la page d'accueil.
 */
export async function GET() {
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('testimonials')
      .select('display_name, rating, comment, created_at')
      .eq('publie', true)
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) return NextResponse.json({ testimonials: [] });
    return NextResponse.json({ testimonials: data ?? [] });
  } catch {
    return NextResponse.json({ testimonials: [] });
  }
}

/** GET du sien : sert à pré-remplir le formulaire du profil. */
export async function PATCH(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = anonClient(token);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('testimonials')
    .select('display_name, rating, comment, publie')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ mine: null });
  return NextResponse.json({ mine: data ?? null });
}

/**
 * POST — dépose ou met à jour SON témoignage.
 *
 * Il n'est jamais publié automatiquement : un déclencheur SQL force
 * `publie = false`, et seule la console Supabase peut le basculer.
 */
export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = anonClient(token);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { rating?: unknown; comment?: unknown; displayName?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const rating = Number(body.rating);
  const comment = String(body.comment ?? '').trim();
  const displayName = String(body.displayName ?? '').trim().slice(0, 40);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating_invalide' }, { status: 400 });
  }
  if (comment.length < 10 || comment.length > 500) {
    return NextResponse.json({ error: 'commentaire_longueur' }, { status: 400 });
  }
  if (!displayName) {
    return NextResponse.json({ error: 'prenom_requis' }, { status: 400 });
  }

  const { error } = await supabase
    .from('testimonials')
    .upsert(
      { user_id: user.id, display_name: displayName, rating, comment },
      { onConflict: 'user_id' },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
