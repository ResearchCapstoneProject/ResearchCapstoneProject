-- ---------------------------------------------------------------------------
-- Botswana National Museum -- schema
--
-- Applied by the MySQL container's entrypoint on FIRST boot only. After any
-- change here you must `docker compose down -v` to drop the volume, or the
-- file is silently ignored.
--
-- utf8mb4 throughout is not optional: the content is full of `·` (U+00B7),
-- `—`, curly quotes and `Ø`. A wrong charset turns them into `?`, and
-- LOC_ROOM on the frontend keys on the exact string "Gallery 2 · People &
-- Crafts", so one mangled byte silently breaks the floor plan.
--
-- Money is stored in thebe (minor units) as INT. Never floats for money.
-- ---------------------------------------------------------------------------

-- The MySQL entrypoint runs this through `mysql` without
-- --default-character-set, so the client would otherwise fall back to
-- latin1 and store every `·` double-encoded. Declare it here.
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS bnm
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE bnm;

-- ---------------------------------------------------------- reference ------

CREATE TABLE department (
  code        CHAR(3)      NOT NULL PRIMARY KEY,   -- ARC, ETH, NAT, HIS, ART
  name        VARCHAR(64)  NOT NULL UNIQUE,        -- 'Archaeology'
  sort_order  SMALLINT     NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE room (
  id          VARCHAR(16)  NOT NULL PRIMARY KEY,   -- g1a, spec, court
  name        VARCHAR(128) NOT NULL,
  sub         VARCHAR(128) NULL,
  kind        ENUM('gallery','service','outdoor') NOT NULL DEFAULT 'gallery',
  x           SMALLINT     NOT NULL,               -- floor-plan SVG geometry,
  y           SMALLINT     NOT NULL,               -- viewBox 0 0 700 440
  w           SMALLINT     NOT NULL,
  h           SMALLINT     NOT NULL,
  sort_order  SMALLINT     NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE location (
  id          SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  label       VARCHAR(128) NOT NULL UNIQUE,        -- 'Gallery 2 · People & Crafts'
  room_id     VARCHAR(16)  NULL,
  -- Replaces the prototype's label.startsWith('Store') test, which breaks the
  -- moment a curator types "Storeroom B" or lowercases it.
  is_store    TINYINT(1)   NOT NULL DEFAULT 0,
  sort_order  SMALLINT     NOT NULL DEFAULT 0,
  CONSTRAINT fk_location_room FOREIGN KEY (room_id)
    REFERENCES room(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE opening_hours (
  weekday     TINYINT      NOT NULL PRIMARY KEY,   -- 0=Sunday .. 6=Saturday (JS convention)
  open_hour   TINYINT      NULL,                   -- both NULL = closed (Monday)
  close_hour  TINYINT      NULL,
  CONSTRAINT ck_weekday CHECK (weekday BETWEEN 0 AND 6),
  CONSTRAINT ck_hours   CHECK ((open_hour IS NULL AND close_hour IS NULL)
                            OR (open_hour < close_hour))
) ENGINE=InnoDB;

CREATE TABLE holiday (
  md          CHAR(5)      NOT NULL PRIMARY KEY,   -- 'MM-DD', recurs yearly
  label       VARCHAR(128) NOT NULL,
  closed      TINYINT(1)   NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE ticket_type (
  ticket_key   VARCHAR(16)  NOT NULL PRIMARY KEY,  -- res, child, intl, tour
  name         VARCHAR(128) NOT NULL,
  description  VARCHAR(255) NOT NULL DEFAULT '',
  price_thebe  INT UNSIGNED NOT NULL,              -- 100 thebe = 1 pula
  is_addon     TINYINT(1)   NOT NULL DEFAULT 0,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order   SMALLINT     NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE setting (
  setting_key VARCHAR(64)  NOT NULL PRIMARY KEY,
  value       VARCHAR(255) NOT NULL,
  updated_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                            ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

-- --------------------------------------------------------------- auth ------

CREATE TABLE staff_user (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(64)  NOT NULL UNIQUE,
  email         VARCHAR(190) NULL UNIQUE,
  display_name  VARCHAR(128) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,             -- argon2id
  role          ENUM('curator','frontdesk','admin') NOT NULL DEFAULT 'curator',
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_login_at DATETIME(3)  NULL
) ENGINE=InnoDB;

CREATE TABLE staff_session (
  -- sha256 of the opaque cookie token, never the token itself, so a database
  -- dump does not hand over live sessions.
  id           CHAR(64)     NOT NULL PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_seen_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  expires_at   DATETIME(3)  NOT NULL,
  user_agent   VARCHAR(255) NULL,
  KEY idx_session_user (user_id),
  KEY idx_session_expiry (expires_at),
  CONSTRAINT fk_session_user FOREIGN KEY (user_id)
    REFERENCES staff_user(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE audit_log (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NULL,
  action     VARCHAR(32)  NOT NULL,                -- create|update|delete|checkin|login
  entity     VARCHAR(32)  NOT NULL,
  entity_id  VARCHAR(32)  NULL,
  at         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  detail     JSON         NULL,
  KEY idx_audit_at (at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
    REFERENCES staff_user(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------- collection ------

-- Inventory numbers are allocated from here, never as MAX(seq)+1. See
-- services/inventory.py: the UPDATE ... LAST_INSERT_ID(next_seq + 1) trick is
-- atomic under InnoDB's row lock and never recycles a deleted object's number.
CREATE TABLE inventory_counter (
  dept_code  CHAR(3)      NOT NULL PRIMARY KEY,
  next_seq   INT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT fk_counter_dept FOREIGN KEY (dept_code)
    REFERENCES department(code) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE museum_object (
  id           VARCHAR(20)  NOT NULL PRIMARY KEY,  -- 'BNM-ETH-0142'
  dept_code    CHAR(3)      NOT NULL,
  seq          INT UNSIGNED NOT NULL,              -- 142
  art_key      VARCHAR(32)  NOT NULL DEFAULT 'generic',
  title        VARCHAR(255) NOT NULL,
  origin       VARCHAR(255) NOT NULL DEFAULT '',
  object_date  VARCHAR(64)  NOT NULL DEFAULT '',   -- free text: 'c. 1985'
  material     VARCHAR(255) NOT NULL DEFAULT '',
  dims         VARCHAR(128) NOT NULL DEFAULT '',
  location_id  SMALLINT UNSIGNED NULL,
  body         TEXT         NOT NULL,
  status       ENUM('published','draft') NOT NULL DEFAULT 'draft',
  is_seed      TINYINT(1)   NOT NULL DEFAULT 0,
  added_at     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                             ON UPDATE CURRENT_TIMESTAMP(3),
  created_by   INT UNSIGNED NULL,
  UNIQUE KEY uq_object_dept_seq (dept_code, seq),
  KEY idx_object_status_added (status, added_at),
  KEY idx_object_location (location_id),
  -- Created now so switching SEARCH_MODE later needs no migration. The
  -- service ships with LIKE, which reproduces the prototype's search exactly.
  FULLTEXT KEY ft_object (title, origin, material, object_date, body),
  CONSTRAINT fk_object_dept     FOREIGN KEY (dept_code)   REFERENCES department(code),
  CONSTRAINT fk_object_location FOREIGN KEY (location_id) REFERENCES location(id)
                                  ON DELETE SET NULL,
  CONSTRAINT fk_object_author   FOREIGN KEY (created_by)  REFERENCES staff_user(id)
                                  ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE object_image (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  object_id  VARCHAR(20)  NOT NULL,
  position   SMALLINT     NOT NULL DEFAULT 0,      -- 0 = main image
  -- Server-generated (uuid + extension from a sniffed MIME allow-list); the
  -- client's filename is never trusted, because this flows into an <img src>.
  filename   VARCHAR(255) NOT NULL,
  mime       VARCHAR(64)  NOT NULL,
  width      SMALLINT UNSIGNED NOT NULL,
  height     SMALLINT UNSIGNED NOT NULL,
  bytes      INT UNSIGNED NOT NULL,
  alt        VARCHAR(255) NOT NULL DEFAULT '',
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_image_pos (object_id, position),
  CONSTRAINT fk_image_object FOREIGN KEY (object_id)
    REFERENCES museum_object(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------- programme ------

CREATE TABLE exhibition (
  exhibition_key VARCHAR(32)  NOT NULL PRIMARY KEY,  -- at60, tsodilo, art, kalahari
  art_key        VARCHAR(32)  NOT NULL,              -- resolved via EX_ART on the client
  kind           VARCHAR(64)  NOT NULL,
  dates_label    VARCHAR(128) NOT NULL,              -- free text: '30 Sep 2026 – 28 Mar 2027'
  title          VARCHAR(255) NOT NULL,
  body           TEXT         NOT NULL,
  is_published   TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order     SMALLINT     NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE museum_event (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  event_date   DATE         NOT NULL,
  time_label   VARCHAR(64)  NOT NULL,                -- '10:00–12:00' or '14:00'
  kind         VARCHAR(64)  NOT NULL,
  title        VARCHAR(255) NOT NULL,
  place        VARCHAR(128) NOT NULL,
  is_published TINYINT(1)   NOT NULL DEFAULT 1,
  KEY idx_event_date (event_date)
) ENGINE=InnoDB;

CREATE TABLE tour (
  id           VARCHAR(32)  NOT NULL PRIMARY KEY,    -- highlights, bot60, family
  title        VARCHAR(255) NOT NULL,
  minutes      SMALLINT UNSIGNED NOT NULL,
  start_label  VARCHAR(128) NOT NULL,
  audience     VARCHAR(128) NOT NULL,
  subtitle     VARCHAR(255) NOT NULL DEFAULT '',
  intro        TEXT         NOT NULL,
  is_published TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order   SMALLINT     NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE tour_stop (
  tour_id    VARCHAR(32)  NOT NULL,
  position   SMALLINT     NOT NULL,
  object_id  VARCHAR(20)  NOT NULL,
  PRIMARY KEY (tour_id, position),
  UNIQUE KEY uq_tour_object (tour_id, object_id),
  CONSTRAINT fk_stop_tour   FOREIGN KEY (tour_id)   REFERENCES tour(id) ON DELETE CASCADE,
  CONSTRAINT fk_stop_object FOREIGN KEY (object_id) REFERENCES museum_object(id)
                              ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------- visits ------

CREATE TABLE booking (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  -- 'BNM-K7M2P'. UNIQUE, so the generator can insert and retry on collision
  -- rather than SELECT-then-INSERT, which is a TOCTOU race.
  code          CHAR(9)      NOT NULL,
  visit_date    DATE         NOT NULL,
  visit_hour    TINYINT      NOT NULL,
  visitors      SMALLINT UNSIGNED NOT NULL,
  total_thebe   INT UNSIGNED NOT NULL,
  visitor_name  VARCHAR(128) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  phone         VARCHAR(32)  NOT NULL DEFAULT '',
  country       VARCHAR(64)  NOT NULL DEFAULT '',
  source        ENUM('online','desk','demo') NOT NULL DEFAULT 'online',
  status        ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  checked_in_at DATETIME(3)  NULL,
  UNIQUE KEY uq_booking_code (code),
  KEY idx_booking_slot (visit_date, visit_hour, status),
  KEY idx_booking_email (email),
  CONSTRAINT ck_visit_hour CHECK (visit_hour BETWEEN 0 AND 23)
) ENGINE=InnoDB;

CREATE TABLE booking_line (
  booking_id       INT UNSIGNED NOT NULL,
  ticket_key       VARCHAR(16)  NOT NULL,
  qty              SMALLINT UNSIGNED NOT NULL,
  unit_price_thebe INT UNSIGNED NOT NULL,           -- price at time of purchase
  PRIMARY KEY (booking_id, ticket_key),
  CONSTRAINT fk_line_booking FOREIGN KEY (booking_id)
    REFERENCES booking(id) ON DELETE CASCADE,
  CONSTRAINT fk_line_ticket  FOREIGN KEY (ticket_key)
    REFERENCES ticket_type(ticket_key)
) ENGINE=InnoDB;

-- ---------------------------------------------------------- analytics ------

CREATE TABLE scan_event (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  object_id  VARCHAR(20)  NOT NULL,
  scanned_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  -- 'qr'         a real visitor scanning a gallery label
  -- 'staff_demo' the staff "Simulate visitor scan" button
  -- 'seed'       generated demo history, so charts are not empty
  source     ENUM('qr','staff_demo','seed') NOT NULL DEFAULT 'qr',
  ip_hash    CHAR(64)     NULL,                     -- sha256(ip + daily salt); no raw IPs
  ua_hash    CHAR(64)     NULL,
  KEY idx_scan_object_time (object_id, scanned_at),
  KEY idx_scan_time (scanned_at),
  CONSTRAINT fk_scan_object FOREIGN KEY (object_id)
    REFERENCES museum_object(id) ON DELETE CASCADE
) ENGINE=InnoDB;
