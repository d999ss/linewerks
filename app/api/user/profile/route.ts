import { NextResponse } from 'next/server'
import { requireAuth, getOrCreateUser } from '@/lib/auth'

export async function GET() {
  try {
    const session = await requireAuth()
    const user = await getOrCreateUser(session.user)
    
    return NextResponse.json({
      user: session.user,
      strava_connected: !!user.strava_access_token
    })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}