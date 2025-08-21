'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Activity, Award } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleLogin = async () => {
    const res = await fetch('/api/auth/google/redirect_url')
    const data = await res.json()
    window.location.href = data.redirectUrl
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (user) {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Transform Your Rides into Art
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Connect your Strava account and create beautiful, personalized posters from your cycling adventures
          </p>

          <button
            onClick={handleLogin}
            className="bg-orange-500 hover:bg-orange-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Get Started with Google
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="text-center">
              <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect Strava</h3>
              <p className="text-gray-400">
                Sync your rides directly from your Strava account
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Customize Design</h3>
              <p className="text-gray-400">
                Choose colors, styles, and layouts that match your style
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Posters</h3>
              <p className="text-gray-400">
                Generate high-quality posters ready for printing or sharing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}