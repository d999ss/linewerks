import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { ArrowRight, Map, Palette, Download, Award } from "lucide-react";

export default function Home() {
  const { user, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Linewerks
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Transform your Strava rides into stunning custom art posters. 
            From QR code to framed trophy on your wall.
          </p>
          
          <button
            onClick={redirectToLogin}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-1"
          >
            <span>Get Started</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Your Journey from Ride to Art
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Map size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Connect Strava</h3>
              <p className="text-slate-300">
                Seamlessly sync your rides and routes from Strava with a single click.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Palette size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Customize Design</h3>
              <p className="text-slate-300">
                Choose colors, layouts, map styles, and add personal touches to your poster.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Download size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Print Ready</h3>
              <p className="text-slate-300">
                Get high-resolution, museum-grade prints delivered to your door.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Display & Gift</h3>
              <p className="text-slate-300">
                Frame your achievements or give them as meaningful gifts to fellow riders.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to turn your rides into art?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of cyclists who've transformed their favorite routes into beautiful wall art.
          </p>
          
          <button
            onClick={redirectToLogin}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-1"
          >
            <span>Start Creating</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
