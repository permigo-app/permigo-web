'use client';

import { supabase } from './supabase';

export interface SupabaseProfile {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  invite_code: string | null;
  car_type: string | null;
  car_color: string | null;
  car_accessory: string | null;
  car_name: string | null;
  objective: string | null;
  preferred_language: string;
  friends: string[];
  stars: Record<string, number>;
  unlocked_themes: string[];
  exams: Record<string, boolean>;
  survival_best: number;
  quiz_history: { totalCorrect: number; totalAnswers: number };
  streak_data: { currentStreak: number; lastActiveDate: string; bestStreak: number };
  xp_data: { totalXP: number; level: number };
  created_at: string | null;
  updated_at: string | null;
}

export interface AppUser {
  id: string;
  email: string;
  username: string;
  xp: number;
  level: number;
  streak_days: number;
  last_activity_date: string | null;
  invite_code: string | null;
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function mergeProfile(
  uid: string,
  email: string,
  tableRow: Record<string, any> | null,
  meta: Record<string, any>,
): SupabaseProfile {
  const row = tableRow ?? {};
  return {
    id: uid,
    username: row.username ?? meta.full_name ?? '',
    email,
    display_name: row.username ?? meta.full_name ?? null,
    avatar_url: row.avatar_url ?? null,
    invite_code: row.invite_code ?? meta.invite_code ?? null,
    car_type: row.car_type ?? meta.car_type ?? null,
    car_color: row.car_color ?? meta.car_color ?? null,
    car_accessory: row.car_accessory ?? meta.car_accessory ?? null,
    car_name: row.car_name ?? meta.car_name ?? null,
    objective: row.objective ?? meta.objective ?? null,
    preferred_language: row.preferred_language ?? meta.preferred_language ?? 'fr',
    friends: row.friends ?? meta.friends ?? [],
    stars: row.stars ?? meta.stars ?? {},
    unlocked_themes: row.unlocked_themes ?? meta.unlocked_themes ?? ['A'],
    exams: row.exams ?? meta.exams ?? {},
    survival_best: row.survival_best ?? meta.survival_best ?? 0,
    quiz_history: row.quiz_history ?? meta.quiz_history ?? { totalCorrect: 0, totalAnswers: 0 },
    streak_data: row.streak_data ?? meta.streak_data ?? { currentStreak: 0, lastActiveDate: '', bestStreak: 0 },
    xp_data: row.xp_data ?? meta.xp_data ?? { totalXP: 0, level: 1 },
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

export async function createUserProfile(params: {
  uid: string;
  name: string;
  email: string;
}): Promise<SupabaseProfile | null> {
  if (!supabase) return null;
  try {
    const inviteCode = generateInviteCode();

    await supabase.from('profiles').upsert({
      id: params.uid,
      username: params.name,
      updated_at: new Date().toISOString(),
    });

    await supabase.auth.updateUser({
      data: {
        full_name: params.name,
        car_type: 'citadine',
        car_color: '#3742FA',
        objective: 'relax',
        invite_code: inviteCode,
        friends: [],
        stars: {},
        unlocked_themes: ['A'],
        exams: {},
        survival_best: 0,
        quiz_history: { totalCorrect: 0, totalAnswers: 0 },
        streak_data: { currentStreak: 0, lastActiveDate: '', bestStreak: 0 },
        xp_data: { totalXP: 0, level: 1 },
      },
    });

    return mergeProfile(params.uid, params.email, null, {
      full_name: params.name,
      invite_code: inviteCode,
    });
  } catch {
    return null;
  }
}

export async function getUserProfile(uid: string): Promise<SupabaseProfile | null> {
  if (!supabase) return null;
  try {
    const [{ data: tableRow }, { data: { user } }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
      supabase.auth.getUser(),
    ]);
    if (!user) return null;
    const meta = user.user_metadata ?? {};
    return mergeProfile(uid, user.email ?? '', tableRow, meta);
  } catch {
    return null;
  }
}

export function mapProfileToUser(p: SupabaseProfile): AppUser {
  const xp = p.xp_data?.totalXP ?? 0;
  const level = p.xp_data?.level ?? Math.floor(xp / 100) + 1;
  return {
    id: p.id,
    email: p.email ?? '',
    username: p.username ?? '',
    xp,
    level,
    streak_days: p.streak_data?.currentStreak ?? 0,
    last_activity_date: p.streak_data?.lastActiveDate || null,
    invite_code: p.invite_code ?? null,
  };
}

export async function syncProgressToSupabase(uid: string, progress: {
  stars: Record<string, number>;
  themes: string[];
  exams: Record<string, boolean>;
  survivalBest: number;
  quizHistory: { totalCorrect: number; totalAnswers: number };
  streakData: { currentStreak: number; lastActiveDate: string; bestStreak: number };
  xpData: { totalXP: number; level: number };
}): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('profiles').update({
      stars: progress.stars,
      unlocked_themes: progress.themes,
      exams: progress.exams,
      survival_best: progress.survivalBest,
      quiz_history: progress.quizHistory,
      streak_data: progress.streakData,
      xp_data: progress.xpData,
      updated_at: new Date().toISOString(),
    }).eq('id', uid);

    await supabase.auth.updateUser({
      data: {
        stars: progress.stars,
        unlocked_themes: progress.themes,
        exams: progress.exams,
        survival_best: progress.survivalBest,
        quiz_history: progress.quizHistory,
        streak_data: progress.streakData,
        xp_data: progress.xpData,
      },
    });
  } catch {
    // silently ignored
  }
}
