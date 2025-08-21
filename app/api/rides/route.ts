import { NextResponse } from 'next/server'
import { requireAuth, getOrCreateUser } from '@/lib/auth'
import { sql } from '@/lib/db'

async function refreshStravaToken(user: any) {
  const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: user.strava_refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!refreshResponse.ok) {
    throw new Error('Failed to refresh token')
  }

  const refreshData = await refreshResponse.json()
  
  await sql`
    UPDATE users 
    SET strava_access_token = ${refreshData.access_token},
        strava_refresh_token = ${refreshData.refresh_token},
        strava_expires_at = ${refreshData.expires_at},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${user.id}
  `
  
  return refreshData.access_token
}

export async function GET() {
  try {
    const session = await requireAuth()
    const user = await getOrCreateUser(session.user)
    
    if (!user.strava_access_token) {
      return NextResponse.json({ error: 'Strava not connected' }, { status: 400 })
    }

    let accessToken = user.strava_access_token
    
    if (Date.now() / 1000 > user.strava_expires_at) {
      accessToken = await refreshStravaToken(user)
    }

    const activitiesResponse = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=50',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!activitiesResponse.ok) {
      throw new Error('Failed to fetch activities')
    }

    const activities = await activitiesResponse.json()
    
    const validActivities = activities.filter((activity: any) => {
      const hasGpsData = activity.map?.summary_polyline || activity.map?.polyline
      const hasDistance = activity.distance && activity.distance > 0
      return hasGpsData && hasDistance
    })
    
    for (const activity of validActivities) {
      await sql`
        INSERT INTO rides 
        (user_id, strava_activity_id, name, distance, moving_time, total_elevation_gain, 
         start_date_local, polyline, summary_polyline, sport_type)
        VALUES (${user.id}, ${activity.id.toString()}, ${activity.name || 'Untitled Activity'}, 
                ${activity.distance || 0}, ${activity.moving_time || 0}, 
                ${activity.total_elevation_gain || 0}, ${activity.start_date_local || new Date().toISOString()},
                ${activity.map?.polyline || null}, ${activity.map?.summary_polyline || null}, 
                ${activity.sport_type || 'Ride'})
        ON CONFLICT (strava_activity_id) DO UPDATE
        SET name = EXCLUDED.name,
            distance = EXCLUDED.distance,
            moving_time = EXCLUDED.moving_time,
            total_elevation_gain = EXCLUDED.total_elevation_gain,
            updated_at = CURRENT_TIMESTAMP
      `
    }
    
    return NextResponse.json(validActivities)
  } catch (error) {
    console.error('Rides error:', error)
    return NextResponse.json({ error: 'Failed to fetch rides' }, { status: 500 })
  }
}