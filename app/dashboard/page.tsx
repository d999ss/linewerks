'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, LogOut, Plus } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stravaConnected, setStravaConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/')
          return
        }
        setUser(data.user)
        checkStravaConnection()
      })
      .catch(() => router.push('/'))
  }, [])

  const checkStravaConnection = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      setStravaConnected(data.strava_connected || false)
    } catch (error) {
      console.error('Error checking Strava:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectStrava = async () => {
    const res = await fetch('/api/strava/auth-url')
    const data = await res.json()
    window.location.href = data.authUrl
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Linewerks</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

          {!stravaConnected ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h3 className="text-xl font-semibold mb-4">Connect Your Strava Account</h3>
              <p className="text-gray-400 mb-6">
                Import your rides and start creating beautiful posters
              </p>
              <button
                onClick={connectStrava}
                className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Connect Strava
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/rides"
                className="bg-gray-800 hover:bg-gray-750 rounded-lg p-6 transition-colors"
              >
                <Activity className="w-12 h-12 mb-4 text-orange-500" />
                <h3 className="text-xl font-semibold mb-2">My Rides</h3>
                <p className="text-gray-400">View and manage your imported rides</p>
              </Link>

              <Link
                href="/posters"
                className="bg-gray-800 hover:bg-gray-750 rounded-lg p-6 transition-colors"
              >
                <Plus className="w-12 h-12 mb-4 text-orange-500" />
                <h3 className="text-xl font-semibold mb-2">My Posters</h3>
                <p className="text-gray-400">View and edit your created posters</p>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}