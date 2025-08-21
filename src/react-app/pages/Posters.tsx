import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Plus, Download, Edit, Trash2, Calendar } from "lucide-react";
import Layout from "@/react-app/components/Layout";

interface PosterWithRide {
  id: number;
  user_id: number;
  ride_id: number;
  name: string;
  map_style: string;
  primary_color: string;
  secondary_color: string;
  layout: string;
  size: string;
  show_stats: boolean;
  show_elevation: boolean;
  custom_title: string | null;
  created_at: string;
  updated_at: string;
  ride_name: string;
  distance: number;
  start_date_local: string;
}

export default function Posters() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [posters, setPosters] = useState<PosterWithRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
      return;
    }

    if (user) {
      fetchPosters();
    }
  }, [user, isPending, navigate]);

  const fetchPosters = async () => {
    try {
      const response = await fetch('/api/posters');
      if (response.ok) {
        const data = await response.json();
        setPosters(data);
      }
    } catch (error) {
      console.error('Failed to fetch posters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return '8×10"';
      case 'medium': return '11×14"';
      case 'large': return '16×20"';
      default: return size;
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

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Posters</h1>
            <p className="text-slate-600">
              Manage your custom ride posters
            </p>
          </div>
          
          <button
            onClick={() => navigate("/rides")}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 mt-4 sm:mt-0"
          >
            <Plus size={18} />
            <span>Create New Poster</span>
          </button>
        </div>

        {/* Posters Grid */}
        {posters.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={32} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No posters yet</h3>
            <p className="text-slate-600 mb-6">
              Create your first custom ride poster to get started.
            </p>
            <button
              onClick={() => navigate("/rides")}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              Create Your First Poster
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posters.map((poster) => (
              <div
                key={poster.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Poster Preview */}
                <div 
                  className={`relative ${
                    poster.layout === 'portrait' ? 'aspect-[3/4]' : 
                    poster.layout === 'landscape' ? 'aspect-[4/3]' : 
                    'aspect-square'
                  }`}
                  style={{ 
                    background: `linear-gradient(135deg, ${poster.primary_color}20, ${poster.secondary_color}20)` 
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="text-center">
                      <div 
                        className="text-sm font-bold mb-2"
                        style={{ color: poster.primary_color }}
                      >
                        {poster.custom_title || poster.ride_name}
                      </div>
                      <div className="w-full h-16 bg-white/50 rounded mb-2 flex items-center justify-center">
                        <span className="text-xs text-slate-500">Route</span>
                      </div>
                      {poster.show_stats && (
                        <div 
                          className="text-xs"
                          style={{ color: poster.secondary_color }}
                        >
                          {formatDistance(poster.distance)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Poster Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">
                        {poster.name}
                      </h3>
                      <p className="text-sm text-slate-600 truncate">
                        {poster.ride_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{formatDate(poster.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-slate-100 px-2 py-1 rounded">
                        {poster.layout}
                      </span>
                      <span className="bg-slate-100 px-2 py-1 rounded">
                        {getSizeLabel(poster.size)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 flex items-center justify-center space-x-1 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                      <Download size={14} />
                      <span>Download</span>
                    </button>
                    <button className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="flex items-center justify-center w-10 h-10 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
