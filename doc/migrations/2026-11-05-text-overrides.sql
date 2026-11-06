-- ---------------------------------------------------------------------------
-- Migration for a database that already holds data (the server).
--
-- The table behind "Texts" in the staff area: one row per text the museum
-- rewrote, keyed by the path of that text inside the site's content modules.
--
--   docker compose exec -T db \
--     sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
--     < doc/migrations/2026-11-05-text-overrides.sql
--
-- Then restart the API: docker compose restart api
--
-- Safe to run twice.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS text_override (
  text_key   VARCHAR(191) NOT NULL PRIMARY KEY,
  value      TEXT         NOT NULL,
  updated_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                            ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;
