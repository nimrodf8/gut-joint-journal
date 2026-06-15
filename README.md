-- Gut & Joint Journal — D1 schema
CREATE TABLE IF NOT EXISTS meta (
  k TEXT PRIMARY KEY,
  v TEXT
);

CREATE TABLE IF NOT EXISTS entries (
  date       TEXT NOT NULL,
  section    TEXT NOT NULL,          -- 'child' or 'parent'
  author     TEXT NOT NULL,          -- 'Mother' or 'Father'
  payload    TEXT NOT NULL,          -- JSON
  updated_at TEXT NOT NULL,
  PRIMARY KEY (date, section, author)
);

CREATE TABLE IF NOT EXISTS labs (
  id         TEXT PRIMARY KEY,
  date       TEXT,
  calpro     TEXT,
  text       TEXT,
  author     TEXT,
  created_at TEXT
);
