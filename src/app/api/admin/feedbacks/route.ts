import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || serviceKey === 'REMPLACE_PAR_TA_CLE_SERVICE_ROLE' || !supabaseUrl) {
    return null;
  }
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

function isAuthorized(req: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;
  const header = req.headers.get('x-admin-secret');
  return header === adminSecret;
}

// ── GET /api/admin/feedbacks ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getAdminClient();
  if (!client) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const category = url.searchParams.get('category');

  let query = client
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[admin/feedbacks] GET error:', error.message);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ feedbacks: data });
}

// ── PATCH /api/admin/feedbacks ────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getAdminClient();
  if (!client) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  let body: { id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const validStatuses = ['new', 'read', 'in_progress', 'resolved', 'closed'];
  if (!body.id || !validStatuses.includes(body.status ?? '')) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }

  const updateData: Record<string, string | null> = { status: body.status! };
  if (body.status === 'resolved' || body.status === 'closed') {
    updateData.resolved_at = new Date().toISOString();
  } else {
    updateData.resolved_at = null;
  }

  const { error } = await client
    .from('feedbacks')
    .update(updateData)
    .eq('id', body.id);

  if (error) {
    console.error('[admin/feedbacks] PATCH error:', error.message);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
