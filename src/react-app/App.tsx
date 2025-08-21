import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import StravaCallbackPage from "@/react-app/pages/StravaCallback";
import DashboardPage from "@/react-app/pages/Dashboard";
import RidesPage from "@/react-app/pages/Rides";
import CreatePosterPage from "@/react-app/pages/CreatePoster";
import PostersPage from "@/react-app/pages/Posters";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/strava/callback" element={<StravaCallbackPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rides" element={<RidesPage />} />
          <Route path="/create-poster/:rideId" element={<CreatePosterPage />} />
          <Route path="/posters" element={<PostersPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
