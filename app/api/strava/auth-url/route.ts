import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth()
    
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/strava/callback`
    const scope = "read,activity:read_all"
    const state = Math.random().toString(36).substring(7)
    
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}&state=${state}`
    
    return NextResponse.json({ authUrl })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}