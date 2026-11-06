-- ---------------------------------------------------------------------------
-- Migration for a database that already holds data (the server).
--
-- A booking can now name the event it was made from, so the front desk sees
-- "for the Tsodilo talk" next to the code.
--
--   docker compose exec -T db \
--     sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
--     < doc/migrations/2026-11-05-booking-event.sql
--
-- Then restart the API: docker compose restart api
--
-- Safe to run twice. Apply it after 2026-11-05-site-content.sql, which is
-- where museum_event gained its other columns.
-- ---------------------------------------------------------------------------

SET @sql := IF((SELECT COUNT(*) FROM information_schema.columns
                 WHERE table_schema = DATABASE() AND table_name = 'booking'
                   AND column_name = 'event_id') = 0,
  'ALTER TABLE booking ADD COLUMN event_id INT UNSIGNED NULL AFTER status',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM information_schema.statistics
                 WHERE table_schema = DATABASE() AND table_name = 'booking'
                   AND index_name = 'idx_booking_event') = 0,
  'ALTER TABLE booking ADD INDEX idx_booking_event (event_id)',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ON DELETE SET NULL: taking an event off the programme must not delete the
-- bookings made for it -- those people are still coming.
SET @sql := IF((SELECT COUNT(*) FROM information_schema.table_constraints
                 WHERE table_schema = DATABASE() AND table_name = 'booking'
                   AND constraint_name = 'fk_booking_event') = 0,
  'ALTER TABLE booking ADD CONSTRAINT fk_booking_event
     FOREIGN KEY (event_id) REFERENCES museum_event(id) ON DELETE SET NULL',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
