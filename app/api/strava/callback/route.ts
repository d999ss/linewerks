import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getOrCreateUser } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.redirect(new URL('/dashboard?error=no_code', request.url))
    }
    
    const user = await getOrCreateUser(session.user)
    
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    
    await sql`
      UPDATE users 
      SET strava_user_id = ${tokenData.athlete.id.toString()},
          strava_access_token = ${tokenData.access_token},
          strava_refresh_token = ${tokenData.refresh_token},
          strava_expires_at = ${tokenData.expires_at},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `
    
    return NextResponse.redirect(new URL('/dashboard?strava=connected', request.url))
  } catch (error) {
    console.error('Strava callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=strava_failed', request.url))
  }
}