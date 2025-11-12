import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './App.css';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

// App pages/components by route:
import DashboardTiles from './components/DashboardTiles';
import CampaignDashboard from './components/CampaignConversionDashboard';
import TopInfluencers from './components/TopInfluencers'; 
import DonorPanel from './components/DonorPanel';
import SettingsDashboard from './pages/settingsDashboard';
import ManageUsers from './pages/ManageUsers';
import CenterManagement from './pages/CenterManagement';

import type { User } from './types/user.types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('plasmalytics_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('plasmalytics_user');
      }
    }
  }, []);

  return (
    <Router>
      {!user ? (
        <Routes>
          {/* Redirect homepage to login */}
          <Route path="/" element={<Navigate to="/login" />} />
          {/* Public login route */}
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          {/* Catch-all redirects to homepage */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        // Authenticated routes wrapped in layout with sidebar/nav logic
        <MainLayout user={user} setUser={setUser}>
          <Routes>

            {["admin", "marketing", "super_admin"].includes(user?.role) && (
              <>
                <Route path="/dashboard" element={<DashboardTiles />} />
                <Route path="/campaigns" element={<CampaignDashboard />} />
              </>
            )}

            {/* Admin Only Pages */}
            {["admin", "super_admin"].includes(user?.role) && (
              <>
                <Route path="/donors" element={<DonorPanel />} />
                <Route path="/influencers" element={<TopInfluencers />} />
                <Route 
                  path="/users"
                  element={
                    <>
                      <h3>👤 User Management</h3>
                      This page is under construction.
                    </>
                  }
                />
              </>
            )}

            {["admin", "super_admin"].includes(user?.role) && (
              <Route 
                path="/settings"
                element={<SettingsDashboard user={user} />}
              />
            )}

            {/* Super Admin Only Pages */}
            {user?.role === "super_admin" && (
              <>
                <Route 
                  path="/manage-users"
                  element={<ManageUsers user={user} />}
                />
                <Route 
                  path="/center-management"
                  element={<CenterManagement user={user} />}
                />
              </>
            )}

            {/* Default redirect on login based on role */}
            <Route 
              path="/" 
              element={
                user?.role === 'super_admin'
                  ? <Navigate to="/settings"/>
                  : <Navigate to="/dashboard"/>
              }
            />

            {/* Catch-all for unknown or unauthorized routes */}
            <Route 
              path="*"
              element={
                <>
                  🚫 Page not found or unauthorized.
                </>
              }
            />

          </Routes>
        </MainLayout>
      )}
    </Router>
  );
}

export default App;

