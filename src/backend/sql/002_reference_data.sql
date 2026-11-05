-- ---------------------------------------------------------------------------
-- Botswana National Museum -- reference data
--
-- Generated from src/frontend/js/data/constants.js so the two cannot drift.
-- Written as INSERT .. ON DUPLICATE KEY UPDATE, so re-running is harmless.
--
-- This file MUST stay UTF-8 without a BOM. The location labels contain
-- U+00B7 MIDDLE DOT and the frontend keys on the exact string.
--
-- Prices, hours and capacity are placeholders until the museum confirms
-- them -- see doc/TODO.md questions 6 and 7.
-- ---------------------------------------------------------------------------
-- The MySQL entrypoint runs this through `mysql` without
-- --default-character-set, so the client would otherwise fall back to
-- latin1 and store every `·` double-encoded. Declare it here.
SET NAMES utf8mb4;

USE bnm;

-- departments ---------------------------------------------------------------
INSERT INTO department (code, name, sort_order) VALUES
  ('ARC', 'Archaeology', 0),
  ('ETH', 'Ethnography', 1),
  ('NAT', 'Natural History', 2),
  ('HIS', 'History', 3),
  ('ART', 'Art', 4)
ON DUPLICATE KEY UPDATE name=VALUES(name), sort_order=VALUES(sort_order);

-- rooms (floor-plan geometry, viewBox 0 0 700 440) ---------------------------
INSERT INTO room (id, name, sub, kind, x, y, w, h, sort_order) VALUES
  ('g1a', 'Gallery 1 · Tsodilo', NULL, 'gallery', 44, 44, 160, 118, 0),
  ('spec', 'Special exhibition', 'Botswana at 60', 'gallery', 214, 44, 186, 118, 1),
  ('g3', 'Gallery 3 · Music & Sound', NULL, 'gallery', 410, 44, 150, 118, 2),
  ('g1b', 'Gallery 1 · Deep Time', NULL, 'gallery', 44, 172, 160, 118, 3),
  ('g2', 'Gallery 2 · People & Crafts', NULL, 'gallery', 214, 172, 186, 118, 4),
  ('g4', 'Gallery 4 · Kalahari Life', NULL, 'gallery', 410, 172, 150, 118, 5),
  ('art', 'Art Gallery · Rooms A & B', NULL, 'gallery', 44, 300, 160, 96, 6),
  ('foyer', 'Entrance & tickets', NULL, 'service', 214, 300, 186, 96, 7),
  ('edu', 'Education room', NULL, 'service', 410, 300, 150, 96, 8),
  ('court', 'Courtyard · locomotive', NULL, 'outdoor', 596, 44, 80, 352, 9)
ON DUPLICATE KEY UPDATE name=VALUES(name), sub=VALUES(sub), kind=VALUES(kind),
  x=VALUES(x), y=VALUES(y), w=VALUES(w), h=VALUES(h), sort_order=VALUES(sort_order);

-- locations ------------------------------------------------------------------
INSERT INTO location (label, room_id, is_store, sort_order) VALUES
  ('Gallery 1 · Tsodilo', 'g1a', 0, 0),
  ('Gallery 1 · Deep Time', 'g1b', 0, 1),
  ('Gallery 2 · People & Crafts', 'g2', 0, 2),
  ('Gallery 3 · Music & Sound', 'g3', 0, 3),
  ('Gallery 4 · Kalahari Life', 'g4', 0, 4),
  ('Art Gallery · Room A', 'art', 0, 5),
  ('Art Gallery · Room B', 'art', 0, 6),
  ('Museum courtyard', 'court', 0, 7),
  ('Special exhibition · Botswana at 60', 'spec', 0, 8),
  ('Store · on request', NULL, 1, 9)
ON DUPLICATE KEY UPDATE room_id=VALUES(room_id), is_store=VALUES(is_store), sort_order=VALUES(sort_order);

-- opening hours (0=Sunday .. 6=Saturday; NULL,NULL = closed) -----------------
INSERT INTO opening_hours (weekday, open_hour, close_hour) VALUES
  (0, 9, 17),
  (1, NULL, NULL),
  (2, 9, 18),
  (3, 9, 18),
  (4, 9, 18),
  (5, 9, 18),
  (6, 9, 17)
ON DUPLICATE KEY UPDATE open_hour=VALUES(open_hour), close_hour=VALUES(close_hour);

-- holidays -------------------------------------------------------------------
INSERT INTO holiday (md, label, closed) VALUES
  ('09-30', 'Botswana Day', 1),
  ('10-01', 'Public holiday', 1),
  ('12-25', 'Christmas', 1)
ON DUPLICATE KEY UPDATE label=VALUES(label), closed=VALUES(closed);

-- ticket types (prices in thebe: 100 thebe = 1 pula) -------------------------
INSERT INTO ticket_type (ticket_key, name, description, price_thebe, is_addon, is_active, sort_order) VALUES
  ('res', 'Citizens & residents', 'Show your Omang or residence permit at the entrance', 0, 0, 1, 0),
  ('child', 'Children under 16 & students', 'Student card required for students', 0, 0, 1, 1),
  ('intl', 'International visitors', 'Adults visiting from abroad', 5000, 0, 1, 2),
  ('tour', 'Guided tour add-on (45 min)', 'Only at 10:00 and 14:00 · one per visitor', 3000, 1, 1, 3)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description),
  price_thebe=VALUES(price_thebe), is_addon=VALUES(is_addon), sort_order=VALUES(sort_order);

-- settings --------------------------------------------------------------------
INSERT INTO setting (setting_key, value) VALUES
  ('capacity_per_hour', '40'),
  ('tour_times', '10,14'),
  ('currency', 'BWP'),
  ('timezone', 'Africa/Gaborone'),
  ('booking_window_days', '14')
ON DUPLICATE KEY UPDATE value=VALUES(value);

-- inventory counters ----------------------------------------------------------
-- Bumped past the seeded objects by the seeder; never reset, not even by the
-- demo reset, because an inventory number must never be reused.
INSERT INTO inventory_counter (dept_code, next_seq) VALUES
  ('ARC', 1),
  ('ETH', 1),
  ('NAT', 1),
  ('HIS', 1),
  ('ART', 1)
ON DUPLICATE KEY UPDATE next_seq=next_seq;
