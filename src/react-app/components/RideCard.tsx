import { Calendar, MapPin, Clock, Mountain, Activity } from "lucide-react";
import { StravaActivity } from "@/shared/types";

interface RideCardProps {
  ride: StravaActivity;
  selected: boolean;
  onSelect: () => void;
}

export default function RideCard({ ride, selected, onSelect }: RideCardProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasGpsData = ride.map?.summary_polyline || ride.map?.polyline;

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
        selected 
          ? 'border-orange-500 shadow-lg ring-2 ring-orange-200' 
          : 'border-slate-200 hover:border-slate-300'
      } ${!hasGpsData ? 'opacity-50' : ''}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 truncate mb-1">
              {ride.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <Activity size={14} />
              <span>{ride.sport_type}</span>
              <Calendar size={14} className="ml-2" />
              <span>{formatDate(ride.start_date_local)}</span>
            </div>
          </div>
          {selected && (
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <MapPin size={16} className="text-slate-400" />
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {formatDistance(ride.distance)}
            </div>
            <div className="text-xs text-slate-500">Distance</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock size={16} className="text-slate-400" />
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {formatTime(ride.moving_time)}
            </div>
            <div className="text-xs text-slate-500">Time</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Mountain size={16} className="text-slate-400" />
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {formatElevation(ride.total_elevation_gain)}
            </div>
            <div className="text-xs text-slate-500">Elevation</div>
          </div>
        </div>

        {/* GPS Data Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${hasGpsData ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-slate-500">
              {hasGpsData ? 'GPS data available' : 'No GPS data'}
            </span>
          </div>
          
          {selected && (
            <span className="text-xs font-medium text-orange-600">
              Selected
            </span>
          )}
        </div>

        {!hasGpsData && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600">
              This activity doesn't have GPS data and cannot be used for poster creation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
