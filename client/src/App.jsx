import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import MainLayout from "./layouts/MainLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import OnboardingPage from "./pages/OnboardingPage";
import InvitePage from "./pages/InvitePage";
import ManageEnvironment from "./pages/ManageEnvironment";
import AnalysisPage from "./pages/AnalysisPage";
import GoalsPage from "./pages/GoalsPage";


function AppContent() {
  const { currentUser, loading, userProfile, pendingInvites } = useAuth();

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-dark-bg-primary">
        <div className="loader"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    );
  }

  if (!userProfile) {
     return (
      <div className="w-screen h-screen flex justify-center items-center bg-dark-bg-primary">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <Routes>
      {userProfile.ambienteId ? (
        <>
          <Route path="/auth" element={<Navigate to="/" />} />
          <Route path="/onboarding" element={<Navigate to="/" />} />
          <Route path="/invite" element={<Navigate to="/" />} />

          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="analysis" element={<AnalysisPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="manage-environment" element={<ManageEnvironment />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </>
      ) : (
        <>
          {pendingInvites && pendingInvites.length > 0 ? (
            <>
              <Route path="/invite" element={<InvitePage />} />
              <Route path="*" element={<Navigate to="/invite" />} />
            </>
          ) : (
            <>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="*" element={<Navigate to="/onboarding" />} />
            </>
          )}
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;