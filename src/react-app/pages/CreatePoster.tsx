import { useAuth } from "@getmocha/users-service/react";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Layout from "@/react-app/components/Layout";
import { StravaActivity, CreatePosterRequest } from "@/shared/types";

export default function CreatePoster() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const { rideId } = useParams<{ rideId: string }>();
  const [ride, setRide] = useState<StravaActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [posterConfig, setPosterConfig] = useState<CreatePosterRequest>({
    ride_id: 0,
    name: "",
    map_style: "standard",
    primary_color: "#ff6b35",
    secondary_color: "#2c3e50",
    layout: "portrait",
    size: "medium",
    show_stats: true,
    show_elevation: true,
    custom_title: "",
  });

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
      return;
    }

    if (user && rideId) {
      fetchRideAndInitialize();
    }
  }, [user, isPending, navigate, rideId]);

  const fetchRideAndInitialize = async () => {
    try {
      const response = await fetch('/api/rides');
      if (response.ok) {
        const rides = await response.json();
        const selectedRide = rides.find((r: StravaActivity) => r.id.toString() === rideId);
        
        if (selectedRide) {
          setRide(selectedRide);
          setPosterConfig(prev => ({
            ...prev,
            ride_id: selectedRide.id,
            name: `${selectedRide.name} Poster`,
            custom_title: selectedRide.name,
          }));
        } else {
          navigate("/rides");
        }
      }
    } catch (error) {
      console.error('Failed to fetch ride:', error);
      navigate("/rides");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePoster = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/posters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(posterConfig),
      });

      if (response.ok) {
        navigate("/posters");
      } else {
        console.error('Failed to save poster');
      }
    } catch (error) {
      console.error('Failed to save poster:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatElevation = (meters: number) => {
    return `${Math.round(meters)}m`;
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

  if (!user || !ride) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/rides")}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Activities</span>
            </button>
            <div className="w-px h-6 bg-slate-300"></div>
            <h1 className="text-2xl font-bold text-slate-900">Create Poster</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
              <Eye size={18} />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              onClick={handleSavePoster}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <Save size={18} />
              <span>{isSaving ? 'Saving...' : 'Save Poster'}</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Poster Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Poster Name
                  </label>
                  <input
                    type="text"
                    value={posterConfig.name}
                    onChange={(e) => setPosterConfig(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Custom Title (optional)
                  </label>
                  <input
                    type="text"
                    value={posterConfig.custom_title || ''}
                    onChange={(e) => setPosterConfig(prev => ({ ...prev, custom_title: e.target.value }))}
                    placeholder={ride.name}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Style</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Map Style
                  </label>
                  <select
                    value={posterConfig.map_style}
                    onChange={(e) => setPosterConfig(prev => ({ ...prev, map_style: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="standard">Standard</option>
                    <option value="terrain">Terrain</option>
                    <option value="satellite">Satellite</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={posterConfig.primary_color}
                      onChange={(e) => setPosterConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-full h-10 border border-slate-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      value={posterConfig.secondary_color}
                      onChange={(e) => setPosterConfig(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-full h-10 border border-slate-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Layout & Size</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Layout
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['portrait', 'landscape', 'square'].map((layout) => (
                      <button
                        key={layout}
                        onClick={() => setPosterConfig(prev => ({ ...prev, layout: layout as any }))}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${
                          posterConfig.layout === layout
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {layout.charAt(0).toUpperCase() + layout.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Size
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setPosterConfig(prev => ({ ...prev, size: size as any }))}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${
                          posterConfig.size === size
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={posterConfig.show_stats}
                      onChange={(e) => setPosterConfig(prev => ({ ...prev, show_stats: e.target.checked }))}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
                    />
                    <span className="text-sm text-slate-700">Show ride statistics</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={posterConfig.show_elevation}
                      onChange={(e) => setPosterConfig(prev => ({ ...prev, show_elevation: e.target.checked }))}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
                    />
                    <span className="text-sm text-slate-700">Show elevation profile</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Ride Information</h2>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900">{ride.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Distance:</span>
                    <span className="ml-2 font-medium">{formatDistance(ride.distance)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Time:</span>
                    <span className="ml-2 font-medium">{formatTime(ride.moving_time)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Elevation:</span>
                    <span className="ml-2 font-medium">{formatElevation(ride.total_elevation_gain)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Type:</span>
                    <span className="ml-2 font-medium">{ride.sport_type}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Poster Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Preview</h2>
              
              <div 
                className={`bg-slate-50 rounded-lg flex items-center justify-center relative ${
                  posterConfig.layout === 'portrait' ? 'aspect-[3/4]' : 
                  posterConfig.layout === 'landscape' ? 'aspect-[4/3]' : 
                  'aspect-square'
                }`}
                style={{ 
                  background: `linear-gradient(135deg, ${posterConfig.primary_color}20, ${posterConfig.secondary_color}20)` 
                }}
              >
                <div className="text-center p-6">
                  <div 
                    className="text-lg font-bold mb-2"
                    style={{ color: posterConfig.primary_color }}
                  >
                    {posterConfig.custom_title || ride.name}
                  </div>
                  <div className="w-full h-32 bg-slate-200 rounded mb-4 flex items-center justify-center">
                    <span className="text-slate-500 text-sm">Route Map</span>
                  </div>
                  {posterConfig.show_stats && (
                    <div 
                      className="text-sm space-y-1"
                      style={{ color: posterConfig.secondary_color }}
                    >
                      <div>{formatDistance(ride.distance)}</div>
                      <div>{formatTime(ride.moving_time)}</div>
                      <div>{formatElevation(ride.total_elevation_gain)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
