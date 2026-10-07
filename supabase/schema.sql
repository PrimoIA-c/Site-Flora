-- ════════════════════════════════════════════════════════════════
--  Schéma Supabase — Location saisonnière Saint-Malo
--  À exécuter dans Supabase → SQL Editor (une seule fois).
--  Puis exécuter seed.sql pour les données de démo (facultatif).
-- ════════════════════════════════════════════════════════════════

create extension if not exists btree_gist;   -- pour la contrainte anti-chevauchement
create extension if not exists pgcrypto;     -- gen_random_uuid()

-- ─── Réservations ───────────────────────────────────────────────
-- check_in inclus, check_out exclu : une nuit = [date, date+1)
create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  check_in            date not null,
  check_out           date not null,
  adults              smallint not null check (adults between 1 and 2),
  children            smallint not null default 0 check (children between 0 and 2),
  guest_name          text not null,
  guest_email         text not null,
  guest_phone         text,
  message             text,
  nights              smallint not null,
  accommodation_total numeric(10,2) not null,
  cleaning_fee        numeric(10,2) not null default 0,
  tourist_tax         numeric(10,2) not null default 0,
  total               numeric(10,2) not null,
  status              text not null default 'pending'
                      check (status in ('pending', 'paid', 'cancelled')),
  expires_at          timestamptz,                 -- expiration d'une réservation en attente
  stripe_session_id   text unique,
  stripe_payment_intent text,
  paid_at             timestamptz,
  cancelled_at        timestamptz,
  cancel_reason       text,
  source              text not null default 'site', -- 'site' | 'manuel'
  constraint bookings_dates_ok check (check_out > check_in),

  -- ⚓ Garde-fou ultime contre la double réservation :
  -- deux réservations non annulées ne peuvent pas se chevaucher, au niveau base de données.
  constraint bookings_no_overlap exclude using gist (
    daterange(check_in, check_out, '[)') with &&
  ) where (status <> 'cancelled')
);

create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_dates_idx on public.bookings (check_in, check_out);

-- ─── Nuits bloquées (manuellement ou via import iCal) ──────────
create table if not exists public.blocked_dates (
  id           uuid primary key default gen_random_uuid(),
  date         date not null,          -- la NUIT du `date` au `date + 1`
  reason       text,
  source       text not null default 'manual',  -- 'manual' | 'ical'
  feed_url     text,                   -- flux iCal d'origine
  created_at   timestamptz not null default now()
);
create unique index if not exists blocked_dates_manual_uniq
  on public.blocked_dates (date) where source = 'manual';
create index if not exists blocked_dates_date_idx on public.blocked_dates (date);

-- ─── Tarifs par période (haute saison, vacances…) ──────────────
-- Le prix de base, les frais de ménage et la durée minimale sont dans `settings`.
create table if not exists public.pricing (
  id              uuid primary key default gen_random_uuid(),
  label           text not null,
  start_date      date not null,
  end_date        date not null,      -- inclus
  price_per_night numeric(10,2) not null check (price_per_night >= 0),
  min_nights      smallint,           -- facultatif : durée minimale propre à la période
  created_at      timestamptz not null default now(),
  constraint pricing_dates_ok check (end_date >= start_date)
);

-- ─── Photos (fichiers dans le bucket Storage « photos ») ───────
create table if not exists public.photos (
  id          uuid primary key default gen_random_uuid(),
  storage_path text not null,
  url         text not null,
  label       text not null default '',
  position    integer not null default 0,
  is_cover    boolean not null default false,
  created_at  timestamptz not null default now()
);
create unique index if not exists photos_one_cover on public.photos (is_cover) where is_cover;

-- ─── Paramètres (une seule ligne, id = 1) ──────────────────────
create table if not exists public.settings (
  id                         smallint primary key default 1 check (id = 1),
  base_price                 numeric(10,2) not null default 90,
  cleaning_fee               numeric(10,2) not null default 50,
  min_nights                 smallint not null default 2,
  tourist_tax_per_adult_night numeric(10,2) not null default 2.00,
  alert_email                text,
  hero_title                 text,
  hero_subtitle              text,
  description                text,
  rooms                      jsonb not null default '[]'::jsonb,       -- [{name, text}]
  equipment                  jsonb not null default '[]'::jsonb,       -- [{label, enabled}]
  house_rules                jsonb not null default '[]'::jsonb,       -- ["..."]
  ical_import_urls           jsonb not null default '[]'::jsonb,       -- ["https://..."]
  ical_last_sync             timestamptz,
  updated_at                 timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════
--  Sécurité (Row Level Security)
--  Le site passe par la clé service_role côté serveur uniquement :
--  aucune donnée n'est lisible avec la clé publique (anon), sauf les photos.
-- ════════════════════════════════════════════════════════════════
alter table public.bookings      enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.pricing       enable row level security;
alter table public.photos        enable row level security;
alter table public.settings      enable row level security;

drop policy if exists "photos lisibles publiquement" on public.photos;
create policy "photos lisibles publiquement" on public.photos for select using (true);

-- Quand vous ajouterez l'authentification Supabase pour l'admin, ajoutez ici des
-- politiques « to authenticated » (voir README → Sécuriser l'admin).

-- ─── Bucket Storage public pour les photos ─────────────────────
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;
