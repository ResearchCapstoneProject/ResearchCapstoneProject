-- ---------------------------------------------------------------------------
-- Migration for a database that already holds data (the server).
--
-- The scripts in src/backend/sql/ run only when the MySQL volume is empty, so
-- a deployed instance never sees them. Apply this once per running database
-- after deploying the "configurable time slots" change:
--
--   docker compose exec -T db \
--     sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
--     < doc/migrations/2026-11-05-slot-minutes.sql
--
-- The variables are expanded inside the db container, where Compose has
-- already set them from .env -- not by the shell you type this into.
--
-- Safe to run twice: every step checks whether it has already been applied.
-- ---------------------------------------------------------------------------

-- 1. booking.visit_minute -----------------------------------------------------
SET @has_col := (SELECT COUNT(*) FROM information_schema.columns
                  WHERE table_schema = DATABASE()
                    AND table_name = 'booking'
                    AND column_name = 'visit_minute');
SET @sql := IF(@has_col = 0,
  'ALTER TABLE booking
     ADD COLUMN visit_minute TINYINT NOT NULL DEFAULT 0 AFTER visit_hour,
     ADD CONSTRAINT ck_visit_minute CHECK (visit_minute BETWEEN 0 AND 59)',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. the capacity lock reads (date, hour, minute, status) ---------------------
SET @has_idx := (SELECT COUNT(*) FROM information_schema.statistics
                  WHERE table_schema = DATABASE()
                    AND table_name = 'booking'
                    AND index_name = 'idx_booking_slot'
                    AND column_name = 'visit_minute');
SET @sql := IF(@has_idx = 0,
  'ALTER TABLE booking
     DROP INDEX idx_booking_slot,
     ADD INDEX idx_booking_slot (visit_date, visit_hour, visit_minute, status)',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. the slot length, with the previous behaviour as the default --------------
INSERT INTO setting (setting_key, value) VALUES ('slot_minutes', '60')
  ON DUPLICATE KEY UPDATE value = value;

-- 4. free admission, one group ------------------------------------------------
-- Existing bookings keep their ticket_key and the price they were sold at;
-- the old categories are only taken out of the booking form.
INSERT INTO ticket_type
  (ticket_key, name, description, price_thebe, is_addon, is_active, sort_order)
VALUES
  ('gen', 'Admission', 'Free entry for all visitors', 0, 0, 1, 0)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description),
  price_thebe = VALUES(price_thebe), is_active = 1;

UPDATE ticket_type SET is_active = 0
 WHERE ticket_key IN ('res', 'child', 'intl', 'tour');
