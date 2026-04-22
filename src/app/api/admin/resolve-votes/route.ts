import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  // Auth check
  const secret = req.headers.get('x-admin-secret') ?? '';
  if (!secret || secret !== (process.env.ADMIN_SECRET ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse body
  let ids: string[] = [];
  try {
    const body = await req.json();
    ids = Array.isArray(body.ids) ? body.ids : [];
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (ids.length === 0) {
    return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
  }

  // Service role client (bypasses RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { error, count } = await supabase
    .from('image_requests')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .in('id', ids)
    .eq('status', 'pending');

  if (error) {
    console.error('[resolve-votes] Supabase error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, resolved: count ?? 0 });
}
