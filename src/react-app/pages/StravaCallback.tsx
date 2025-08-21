import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function StravaCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage('Strava authorization was cancelled or failed.');
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received from Strava.');
        return;
      }

      try {
        const response = await fetch('/api/strava/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Successfully connected to Strava!');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          const error = await response.json();
          setStatus('error');
          setMessage(error.error || 'Failed to connect to Strava.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred.');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Connecting to Strava...';
      case 'success':
        return 'Connection Successful!';
      case 'error':
        return 'Connection Failed';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6 flex justify-center">
          {getIcon()}
        </div>
        
        <h2 className="text-2xl font-semibold text-white mb-4">
          {getTitle()}
        </h2>
        
        <p className="text-slate-300 mb-6">
          {message}
        </p>

        {status === 'error' && (
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
          >
            Return to Dashboard
          </button>
        )}

        {status === 'success' && (
          <p className="text-sm text-slate-400">
            Redirecting to dashboard...
          </p>
        )}
      </div>
    </div>
  );
}
