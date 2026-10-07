-- ════════════════════════════════════════════════════════════════
--  Données de démonstration — à exécuter APRÈS schema.sql (facultatif).
--  Les dates sont relatives à aujourd'hui pour rester réalistes.
--  Pour tout effacer ensuite : voir la section « Nettoyage » en bas.
-- ════════════════════════════════════════════════════════════════

-- Paramètres (adresse d'alerte à remplacer par la vôtre)
update public.settings set
  base_price = 90,
  cleaning_fee = 50,
  min_nights = 2,
  tourist_tax_per_adult_night = 2.00,
  alert_email = 'gerant@exemple.fr'
where id = 1;

-- Réservations
insert into public.bookings
  (check_in, check_out, adults, children, guest_name, guest_email, guest_phone, nights,
   accommodation_total, cleaning_fee, tourist_tax, total, status, paid_at, cancelled_at, cancel_reason, source)
values
  (current_date - 40, current_date - 35, 2, 2, 'Claire Martin',  'claire@example.com', '06 12 34 56 78', 5, 450, 50, 20, 520, 'paid', now() - interval '60 days', null, null, 'demo'),
  (current_date - 12, current_date - 9,  2, 1, 'Yann Le Goff',   'yann@example.com',   '06 98 76 54 32', 3, 270, 50, 12, 332, 'paid', now() - interval '30 days', null, null, 'demo'),
  (current_date + 6,  current_date + 10, 2, 2, 'Sophie Durand',  'sophie@example.com', '07 11 22 33 44', 4, 360, 50, 16, 426, 'paid', now() - interval '10 days', null, null, 'demo'),
  (current_date + 18, current_date + 25, 2, 2, 'Thomas Bernard', 'thomas@example.com', '06 55 44 33 22', 7, 630, 50, 28, 708, 'paid', now() - interval '5 days',  null, null, 'demo'),
  (current_date + 30, current_date + 33, 1, 0, 'Julie Petit',    'julie@example.com',  '06 01 02 03 04', 3, 270, 50, 6,  326, 'cancelled', null, now() - interval '2 days', 'Annulée par le client', 'demo'),
  (current_date + 45, current_date + 50, 2, 0, 'Marc Leroy',     'marc@example.com',   '06 77 88 99 00', 5, 450, 50, 20, 520, 'paid', now() - interval '1 day',   null, null, 'demo');

-- Nuits bloquées manuellement
insert into public.blocked_dates (date, reason, source) values
  (current_date + 11, 'Famille', 'manual'),
  (current_date + 12, 'Famille', 'manual'),
  (current_date + 13, 'Famille', 'manual'),
  (current_date + 26, 'Location hors site', 'manual'),
  (current_date + 27, 'Location hors site', 'manual')
on conflict do nothing;

-- Tarifs par période
insert into public.pricing (label, start_date, end_date, price_per_night, min_nights) values
  ('Haute saison',
   make_date(extract(year from current_date)::int + 1, 7, 1),
   make_date(extract(year from current_date)::int + 1, 8, 31), 140, 7),
  ('Vacances de la Toussaint',
   make_date(extract(year from current_date)::int, 10, 17),
   make_date(extract(year from current_date)::int, 11, 2), 105, 3);

-- ─── Nettoyage (à exécuter pour repartir de zéro avant la mise en ligne) ───
-- delete from public.bookings where source = 'demo';
-- delete from public.blocked_dates where reason in ('Famille', 'Location hors site');
-- delete from public.pricing;
