CREATE TABLE IF NOT EXISTS figures(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  photo TEXT
);
CREATE TABLE IF NOT EXISTS pins(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  city TEXT NOT NULL,
  figure_id INTEGER NOT NULL,
  vote INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO figures(name,photo) SELECT 'Edi Rama','img/rama.jpg' WHERE NOT EXISTS(SELECT 1 FROM figures WHERE name='Edi Rama');
INSERT INTO figures(name,photo) SELECT 'Sali Berisha','img/berisha.jpg' WHERE NOT EXISTS(SELECT 1 FROM figures WHERE name='Sali Berisha');
