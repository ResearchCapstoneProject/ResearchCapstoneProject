-- Take the demonstration out of the site, permanently.
--
-- This is what the staff area's "Going live" button used to do at the press
-- of a button, applied once and for all: the records the project invented so
-- the site could be shown before the museum had entered anything are deleted,
-- and the notes that called the site a demonstration are gone from the code.
--
-- Deleted here: the sample bookings (source='demo') with their ticket lines,
-- the generated scan history (source='seed') and anything the staff
-- "Simulate visitor scan" button produced before this change
-- (source='staff_demo'), and the prototype's exhibitions and themed tours,
-- which no page has rendered since Explore replaced them.
--
-- Kept, as the button always kept them: the 60 objects of the Art and Crafts
-- of Botswana catalogue, the events, publications, texts, uploaded pictures,
-- visitor groups, staff accounts, every booking a visitor actually made and
-- every source='qr' scan.
--
-- Safe to run twice.

SET NAMES utf8mb4;

-- the invented records -------------------------------------------------------

DELETE bl FROM booking_line bl
  JOIN booking b ON b.id = bl.booking_id
 WHERE b.source = 'demo';
DELETE FROM booking    WHERE source = 'demo';
DELETE FROM scan_event WHERE source IN ('seed', 'staff_demo');

DROP TABLE IF EXISTS tour_stop;
DROP TABLE IF EXISTS tour;
DROP TABLE IF EXISTS exhibition;

-- the enum values nothing writes any more -------------------------------------

ALTER TABLE booking    MODIFY source ENUM('online','desk') NOT NULL DEFAULT 'online';
ALTER TABLE scan_event MODIFY source ENUM('qr','staff_demo') NOT NULL DEFAULT 'qr';

-- the notes that said "this is a demonstration" -------------------------------

-- demo_mode switched them all on; there is no such setting any more.
DELETE FROM setting WHERE setting_key = 'demo_mode';

-- The footer's second line said the prices and inventory numbers were sample
-- content. A line the museum has rewritten itself is left exactly as it is.
DELETE FROM setting
 WHERE setting_key = 'theme.footer_note_2'
   AND value = 'Prices, bookings and inventory numbers are sample content';
