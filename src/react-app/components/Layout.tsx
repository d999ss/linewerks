import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { LogOut, User, Map, Image, Home, Unlink } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

interface UserProfile {
  mocha_user: any;
  strava_connected: boolean;
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {showNav && user && (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
                >
                  Linewerks
                </button>
                <div className="hidden md:flex space-x-6">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <Home size={18} />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => navigate("/rides")}
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <Map size={18} />
                    <span>Rides</span>
                  </button>
                  <button
                    onClick={() => navigate("/posters")}
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <Image size={18} />
                    <span>Posters</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {profile?.strava_connected && (
                  <button
                    onClick={disconnectStrava}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-2 border-red-600"
                  >
                    <Unlink size={18} />
                    <span>DISCONNECT STRAVA</span>
                  </button>
                )}
                <div className="flex items-center space-x-2 text-slate-600">
                  <User size={18} />
                  <span className="hidden sm:inline">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className="relative">
        {children}
      </main>
    </div>
  );
}
