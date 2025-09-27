import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import './App.css';

import MainLayout from '/src/components/MainLayout';
import LoginPage from '/src/pages/LoginPage';

// App pages/components by route:
import DashboardTiles from '/src/components/DashboardTiles';
import LookalikeDashboard from '/src/components/LookalikeDashboard';
import CampaignDashboard from '/src/components/CampaignConversionDashboard';
// ✅ Use full influencer dashboard instead of table-only view
import TopInfluencers from '/src/components/TopInfluencers'; 
import DonorPanel from './components/DonorPanel';
import SettingsDashboard from '/src/pages/settingsDashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('vitalink_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <Router>
      {!user ? (
        <Routes>
          {/* Public login route */}
          <Route path="/" element={<LoginPage setUser={setUser} />} />
          {/* Catch-all redirects to login */}
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

                {/* 👇 REPLACED TABLE WITH FULL INFLUENCER VIEW */}
                <Route path="/influencers" element={<TopInfluencers />} />

                {/* Placeholder or future user panel */}
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