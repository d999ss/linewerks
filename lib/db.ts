import { sql } from '@vercel/postgres'

export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        strava_user_id VARCHAR(255),
        strava_access_token TEXT,
        strava_refresh_token TEXT,
        strava_expires_at INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS rides (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        strava_activity_id VARCHAR(255) UNIQUE,
        name VARCHAR(255),
        distance FLOAT,
        moving_time INTEGER,
        total_elevation_gain FLOAT,
        start_date_local TIMESTAMP,
        polyline TEXT,
        summary_polyline TEXT,
        sport_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS posters (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ride_id INTEGER REFERENCES rides(id) ON DELETE CASCADE,
        name VARCHAR(255),
        map_style VARCHAR(50),
        primary_color VARCHAR(7),
        secondary_color VARCHAR(7),
        layout VARCHAR(50),
        size VARCHAR(50),
        show_stats BOOLEAN DEFAULT true,
        show_elevation BOOLEAN DEFAULT true,
        custom_title VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}

export { sql }