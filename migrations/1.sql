
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mocha_user_id TEXT NOT NULL,
  strava_user_id TEXT,
  strava_access_token TEXT,
  strava_refresh_token TEXT,
  strava_expires_at INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  strava_activity_id TEXT NOT NULL,
  name TEXT NOT NULL,
  distance REAL,
  moving_time INTEGER,
  total_elevation_gain REAL,
  start_date_local TEXT,
  polyline TEXT,
  summary_polyline TEXT,
  sport_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  ride_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  map_style TEXT DEFAULT 'standard',
  primary_color TEXT DEFAULT '#ff6b35',
  secondary_color TEXT DEFAULT '#2c3e50',
  layout TEXT DEFAULT 'portrait',
  size TEXT DEFAULT 'medium',
  show_stats BOOLEAN DEFAULT true,
  show_elevation BOOLEAN DEFAULT true,
  custom_title TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
