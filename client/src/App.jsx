import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";

import MainLayout from "./layouts/MainLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import OnboardingPage from "./pages/OnboardingPage";
import InvitePage from "./pages/InvitePage";
import ManageEnvironment from "./pages/ManageEnvironment";
import AnalysisPage from "./pages/AnalysisPage";
import GoalsPage from "./pages/GoalsPage";

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-dark-bg-primary">
        <div className="loader"></div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/auth" />;
}

function OnboardingRoute({ children }) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-dark-bg-primary">
        <div className="loader"></div>
      </div>
    );
  }
  return userProfile && userProfile.ambienteId ? children : <Navigate to="/onboarding" />;
}


function AppContent() {
  const { currentUser, loading, userProfile } = useAuth();

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-dark-bg-primary">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={currentUser ? <Navigate to="/" /> : <Auth />} />
      <Route path="/invite" element={<PrivateRoute><InvitePage /></PrivateRoute>} />
      
      <Route path="/onboarding" element={
          <PrivateRoute>
            {userProfile?.ambienteId ? <Navigate to="/" /> : <OnboardingPage />}
          </PrivateRoute>
      } />

      <Route path="/" element={
          <PrivateRoute>
            <OnboardingRoute>
              <MainLayout />
            </OnboardingRoute>
          </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="analysis" element={<AnalysisPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="manage-environment" element={<ManageEnvironment />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;