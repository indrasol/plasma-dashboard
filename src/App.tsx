import { useState, useEffect, useRef } from 'react';
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
import DonorHealthDashboard from './components/DonorHealthDashboard';
import SettingsDashboard from './pages/settingsDashboard';
import ManageUsers from './pages/ManageUsers';
import CenterManagement from './pages/CenterManagement';
import AIAssistant from './components/AIAssistant';
import LiveSignalsPage from './pages/LiveSignalsPage';
import CSVIntegration from './pages/integrations/CSVIntegration';
import DBIntegration from './pages/integrations/DBIntegration';
// import CRMIntegration from './pages/integrations/CRMIntegration';

import type { User } from './types/user.types';

import { supabase } from './supabaseClient';

function App() {
  const [user, setUser] = useState<User | null>(null);
  // Default landing page after login - redirects to CSV Integration
  const defaultAuthedPath = '/integrations/csv';
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' } | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = (message: string, type: 'info' | 'error' = 'info') => {
    setToast({ message, type });
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    // 1. Check local storage for initial user state
    const storedUser = localStorage.getItem('plasmalytics_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('plasmalytics_user');
      }
    }

    // 2. Listen for Supabase auth changes (e.g., token expiration, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
        // Clear user state and local storage if signed out or session invalid
        setUser(null);
        localStorage.removeItem('plasmalytics_user');
        showToast('Session expired. Please sign in again.', 'error');
      }
    });

    return () => {
      subscription.unsubscribe();
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  return (
    <Router>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            padding: '12px 16px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            backgroundColor: toast.type === 'error' ? '#fee2e2' : '#e0f2fe',
            color: '#0f172a',
            border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bae6fd'}`,
            zIndex: 9999,
            minWidth: '260px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '18px' }}>
            {toast.type === 'error' ? '⚠️' : 'ℹ️'}
          </span>
          <div style={{ flex: 1, fontWeight: 600, fontSize: '14px' }}>
            {toast.message}
          </div>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '16px',
              lineHeight: 1
            }}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}
      {!user ? (
        <Routes>
          {/* Redirect homepage to login */}
          {/* <Route path="/" element={<HomePage />} /> */}
          <Route path="/" element={<Navigate to="/login" />} />
          {/* Public login route */}
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          {/* Catch-all redirects to homepage */}
          {/* <Route path="*" element={<Navigate to="/" />} /> */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        // Authenticated routes wrapped in layout with sidebar/nav logic
        <MainLayout user={user} setUser={setUser}>
          <Routes>

            {["admin", "marketing", "super_admin"].includes(user?.role) && (
              <>
                <Route path="/integrations/csv" element={<CSVIntegration />} />
                <Route path="/integrations/db" element={<DBIntegration />} />
                {/* <Route path="/integrations/crm" element={<CRMIntegration />} /> */}
                <Route path="/dashboard" element={<DashboardTiles />} />
                <Route path="/campaigns/dashboard" element={<CampaignDashboard />} />
                <Route path="/campaigns/conversion" element={<CampaignDashboard />} />
              </>
            )}

            {/* Admin Only Pages */}
            {["admin", "super_admin"].includes(user?.role) && (
              <>
                <Route path="/donors/segments" element={<DonorPanel />} />
                <Route path="/donors/lookalike" element={<DonorPanel />} />
                <Route path="/donors/elasticity" element={<DonorPanel />} />
                <Route path="/donors/health" element={<DonorHealthDashboard />} />
                <Route path="/influencers/list" element={<TopInfluencers />} />
                <Route path="/influencers/network" element={<TopInfluencers />} />
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

            {/* AI Assistant - Available to all roles */}
            <Route 
              path="/ask-ai"
              element={<AIAssistant />}
            />

            <Route 
              path="/live-signals"
              element={<LiveSignalsPage />}
            />

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
                <Navigate to={defaultAuthedPath}/>
              }
            />

            {/* Catch-all for unknown or unauthorized routes */}
            <Route 
              path="*"
              element={
                <Navigate to={defaultAuthedPath} replace />
              }
            />

          </Routes>
        </MainLayout>
      )}
    </Router>
  );
}

export default App;

