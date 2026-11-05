-- ---------------------------------------------------------------------------
-- Migration for a database that already holds data (the server).
--
-- Adds what the staff area needs to manage the site's own content: the three
-- extra event fields, the publications the museum adds itself, and the table
-- of replaced pictures.
--
--   docker compose exec -T db \
--     sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
--     < doc/migrations/2026-11-05-site-content.sql
--
-- Then restart the API: docker compose restart api
--
-- Safe to run twice: every step checks whether it has already been applied.
-- ---------------------------------------------------------------------------

-- 1. richer events -----------------------------------------------------------
-- by_line is the speaker, body_text the description under the title, pdf_url
-- the flyer. All three existed in the museum's own event material.
SET @sql := IF((SELECT COUNT(*) FROM information_schema.columns
                 WHERE table_schema = DATABASE() AND table_name = 'museum_event'
                   AND column_name = 'by_line') = 0,
  "ALTER TABLE museum_event ADD COLUMN by_line VARCHAR(128) NOT NULL DEFAULT '' AFTER place",
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM information_schema.columns
                 WHERE table_schema = DATABASE() AND table_name = 'museum_event'
                   AND column_name = 'body_text') = 0,
  'ALTER TABLE museum_event ADD COLUMN body_text TEXT NULL AFTER by_line',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM information_schema.columns
                 WHERE table_schema = DATABASE() AND table_name = 'museum_event'
                   AND column_name = 'pdf_url') = 0,
  "ALTER TABLE museum_event ADD COLUMN pdf_url VARCHAR(255) NOT NULL DEFAULT '' AFTER body_text",
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. publications added in the staff area ------------------------------------
CREATE TABLE IF NOT EXISTS publication (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  type_key     VARCHAR(32)  NOT NULL,
  title        VARCHAR(255) NOT NULL,
  date_label   VARCHAR(64)  NOT NULL DEFAULT '',
  thumb_url    VARCHAR(255) NOT NULL DEFAULT '',
  pdf_url      VARCHAR(255) NOT NULL DEFAULT '',
  href         VARCHAR(255) NOT NULL DEFAULT '',
  is_published TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order   SMALLINT     NOT NULL DEFAULT 0,
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_publication_type (type_key, sort_order)
) ENGINE=InnoDB;

-- 3. replaced pictures -------------------------------------------------------
CREATE TABLE IF NOT EXISTS image_override (
  asset_path VARCHAR(191) NOT NULL PRIMARY KEY,
  filename   VARCHAR(190) NOT NULL,
  updated_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                            ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;
