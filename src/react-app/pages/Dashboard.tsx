import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { ExternalLink, Map, Image, Plus, Activity, Unlink } from "lucide-react";
import Layout from "@/react-app/components/Layout";

interface UserProfile {
  mocha_user: any;
  strava_connected: boolean;
}

export default function Dashboard() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      // Don't redirect - show login prompt instead
      setIsLoading(false);
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, isPending, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectStrava = async () => {
    try {
      const response = await fetch('/api/strava/auth-url');
      if (response.ok) {
        const { authUrl } = await response.json();
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Failed to get Strava auth URL:', error);
    }
  };

  const disconnectStrava = async () => {
    try {
      const response = await fetch('/api/strava/disconnect', {
        method: 'POST',
      });
      if (response.ok) {
        // Refresh profile to update UI
        await fetchProfile();
      }
    } catch (error) {
      console.error('Failed to disconnect Strava:', error);
    }
  };

  if (isPending || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-pulse text-slate-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  // Show login prompt if not logged in
  if (!user) {
    return (
      <Layout showNav={false}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">
            Welcome to Linewerks Dashboard
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Please log in to access your dashboard and manage your Strava posters.
          </p>
          
          {/* Preview of disconnect button */}
          <div className="bg-slate-100 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Preview: After login + Strava connection, you'll see this disconnect button:
            </h3>
            <div className="flex justify-center">
              <button
                disabled
                className="flex items-center justify-center space-x-2 bg-red-500 text-white font-semibold px-8 py-3 rounded-lg shadow-lg border-2 border-red-600 opacity-75 cursor-not-allowed"
              >
                <Unlink size={20} />
                <span>DISCONNECT STRAVA</span>
              </button>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              This prominent red button will appear in your navigation bar once connected to Strava
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
          >
            Go to Login
          </button>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user.google_user_data.given_name || user.email}!
          </h1>
          <p className="text-slate-600">
            Ready to transform your activities into beautiful art?
          </p>
        </div>

        {/* Strava Connection Card */}
        {!profile.strava_connected ? (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  Connect Your Strava Account
                </h2>
                <p className="text-slate-600 mb-4">
                  Connect to Strava to import your activities and start creating custom posters.
                </p>
                <button
                  onClick={connectStrava}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                >
                  <ExternalLink size={18} />
                  <span>Connect Strava</span>
                </button>
              </div>
              <div className="hidden sm:block">
                <Activity size={48} className="text-orange-400" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800">Strava Connected</span>
                <span className="text-sm text-green-600">✓ Ready to create posters</span>
              </div>
              
              {/* Disconnect Button - Always visible and prominent */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div>
                    <h3 className="font-medium text-red-800 mb-1">Account Management</h3>
                    <p className="text-sm text-red-600">Disconnect your Strava account if needed</p>
                  </div>
                  <button
                    onClick={disconnectStrava}
                    className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 border-2 border-red-600"
                  >
                    <Unlink size={20} />
                    <span>DISCONNECT STRAVA</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate("/rides")}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-left hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
            disabled={!profile.strava_connected}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Map size={24} className="text-blue-600" />
              </div>
              <div className="text-2xl">🚴</div>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Browse Activities</h3>
            <p className="text-slate-600 text-sm">
              {profile.strava_connected 
                ? "View and select from your Strava activities"
                : "Connect Strava to view your activities"
              }
            </p>
          </button>

          <button
            onClick={() => navigate("/posters")}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-left hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Image size={24} className="text-purple-600" />
              </div>
              <div className="text-2xl">🎨</div>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">My Posters</h3>
            <p className="text-slate-600 text-sm">
              View and manage your created poster designs
            </p>
          </button>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-dashed border-orange-300 p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-orange-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Create New</h3>
            <p className="text-slate-600 text-sm mb-4">
              Start by selecting an activity to turn into art
            </p>
            <button
              onClick={() => navigate("/rides")}
              className="text-orange-600 font-medium hover:text-orange-700 transition-colors"
              disabled={!profile.strava_connected}
            >
              Get Started →
            </button>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="text-center py-12 text-slate-500">
            <Image size={48} className="mx-auto mb-4 opacity-50" />
            <p>Your poster creations will appear here</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
