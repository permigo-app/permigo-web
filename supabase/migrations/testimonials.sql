-- Témoignages des élèves.
--
-- À exécuter dans Supabase (SQL Editor) AVANT que le déploiement Vercel ne
-- parte, sinon la page publique ne trouvera pas la table. Le code est écrit
-- pour ne pas planter dans ce cas : il affiche simplement zéro témoignage.

create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  -- Prénom affiché publiquement. Jamais l'e-mail, jamais le nom complet.
  display_name text not null,
  rating      smallint not null check (rating between 1 and 5),
  comment     text not null check (char_length(comment) between 10 and 500),
  -- Un témoignage n'apparaît en public que si publie = true. C'est TOI qui
  -- décides, depuis Supabase : rien ne se publie tout seul.
  publie      boolean not null default false,
  created_at  timestamptz not null default now(),
  -- Un seul témoignage par personne : on met à jour le sien plutôt que
  -- d'en empiler dix.
  unique (user_id)
);

create index if not exists testimonials_public_idx
  on public.testimonials (publie, created_at desc);

alter table public.testimonials enable row level security;

-- Lecture publique : uniquement ce qui est publié. Un visiteur non connecté
-- peut donc lire les témoignages de la page d'accueil.
drop policy if exists "temoignages publies lisibles par tous" on public.testimonials;
create policy "temoignages publies lisibles par tous"
  on public.testimonials for select
  using (publie = true);

-- Chacun peut lire, écrire et modifier LE SIEN, publié ou non.
drop policy if exists "chacun lit le sien" on public.testimonials;
create policy "chacun lit le sien"
  on public.testimonials for select
  using (auth.uid() = user_id);

drop policy if exists "chacun ecrit le sien" on public.testimonials;
create policy "chacun ecrit le sien"
  on public.testimonials for insert
  with check (auth.uid() = user_id);

drop policy if exists "chacun modifie le sien" on public.testimonials;
create policy "chacun modifie le sien"
  on public.testimonials for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Personne ne peut passer son propre témoignage en publié : la colonne est
-- protégée par ce trigger, seule la console Supabase (service role) y touche.
create or replace function public.testimonials_lock_publie()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    new.publie := false;
  elsif tg_op = 'UPDATE' then
    new.publie := old.publie;
  end if;
  return new;
end;
$$;

drop trigger if exists testimonials_lock_publie_trg on public.testimonials;
create trigger testimonials_lock_publie_trg
  before insert or update on public.testimonials
  for each row execute function public.testimonials_lock_publie();
