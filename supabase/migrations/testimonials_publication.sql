-- Corrige le verrou de publication des témoignages.
--
-- Le déclencheur d'origine remettait `publie` à son ancienne valeur à CHAQUE
-- update, sans exception de rôle. Résultat : personne ne pouvait publier un
-- témoignage — ni l'API, ni la clé de service, ni la console SQL. La colonne
-- était gelée pour de bon.
--
-- L'intention était bonne : un élève ne doit pas pouvoir publier son propre
-- avis. On garde ça, mais on laisse passer l'administration.
--
-- `current_user` vaut 'anon' ou 'authenticated' quand la requête vient du
-- site (PostgREST pose le rôle du jeton), et 'service_role' ou 'postgres'
-- quand elle vient de la clé de service ou de l'éditeur SQL.

create or replace function public.testimonials_lock_publie()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Administration : on ne touche à rien, c'est elle qui décide de publier.
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  -- Visiteur ou élève connecté : la colonne reste hors de sa portée.
  if tg_op = 'INSERT' then
    new.publie := false;
  elsif tg_op = 'UPDATE' then
    new.publie := old.publie;
  end if;
  return new;
end;
$$;
