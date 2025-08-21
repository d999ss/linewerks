import { cookies } from 'next/headers'
import { sql } from './db'

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  
  if (!session) {
    return null
  }
  
  try {
    return JSON.parse(session.value)
  } catch {
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  return session
}

export async function getOrCreateUser(googleUser: any) {
  const { rows } = await sql`
    SELECT * FROM users WHERE google_id = ${googleUser.id}
  `
  
  if (rows.length > 0) {
    return rows[0]
  }
  
  const { rows: newUser } = await sql`
    INSERT INTO users (google_id, email, name)
    VALUES (${googleUser.id}, ${googleUser.email}, ${googleUser.name})
    RETURNING *
  `
  
  return newUser[0]
}