import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Palette } from "lucide-react";
import Layout from "@/react-app/components/Layout";
import RideCard from "@/react-app/components/RideCard";
import { StravaActivity } from "@/shared/types";

export default function Rides() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState<StravaActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRide, setSelectedRide] = useState<StravaActivity | null>(null);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
      return;
    }

    if (user) {
      fetchRides();
    }
  }, [user, isPending, navigate]);

  const fetchRides = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      console.log('Fetching rides from API...');
      const response = await fetch('/api/rides');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received rides data:', data);
        console.log('Number of rides:', data.length);
        
        // Filter for activities that actually have GPS data for the frontend
        const ridesWithGps = data.filter((ride: any) => 
          ride.map?.summary_polyline || ride.map?.polyline
        );
        
        console.log('Rides with GPS data:', ridesWithGps.length);
        setRides(data); // Set all rides for now to debug
      } else {
        const error = await response.json();
        console.error('API error:', error);
        if (error.error === "Strava not connected") {
          navigate("/dashboard");
        } else if (error.error === "Unauthorized") {
          console.log('User not authenticated, redirecting to home');
          navigate("/");
        }
      }
    } catch (error) {
      console.error('Failed to fetch rides:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreatePoster = () => {
    if (selectedRide) {
      navigate(`/create-poster/${selectedRide.id}`);
    }
  };

  if (isPending || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-slate-600">Loading your activities...</p>
          </div>
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Activities</h1>
            <p className="text-slate-600">
              Select any activity to transform into a custom poster
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <button
              onClick={() => fetchRides(true)}
              disabled={isRefreshing}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            
            {selectedRide && (
              <button
                onClick={handleCreatePoster}
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                <Palette size={18} />
                <span>Create Poster</span>
              </button>
            )}
          </div>
        </div>

        {/* Rides Grid */}
        {rides.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No activities found</h3>
            <p className="text-slate-600 mb-6">
              Make sure you have activities with GPS data in your Strava account.
            </p>
            <button
              onClick={() => fetchRides(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              Refresh Activities
            </button>
          </div>
        ) : (
          <>
            {/* Selection Info */}
            {selectedRide && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-800 font-medium">
                      Selected: {selectedRide.name}
                    </p>
                    <p className="text-orange-600 text-sm">
                      Ready to create your poster
                    </p>
                  </div>
                  <button
                    onClick={handleCreatePoster}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Rides Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  selected={selectedRide?.id === ride.id}
                  onSelect={() => {
                    setSelectedRide(selectedRide?.id === ride.id ? null : ride);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
