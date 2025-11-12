import { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { User, AuthUser } from '../types/user.types';

interface LoginPageProps {
  setUser: (user: User) => void;
}

export default function LoginPage({ setUser }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Use admin credentials if admin mode is enabled
    const loginEmail = isAdminMode ? 'raj@plasmalytics.com' : email;
    const loginPassword = isAdminMode ? 'welcome1' : password;

    if (!loginEmail || !loginPassword) {
      return setErrorMsg("Please enter both email and password.");
    }

    try {
      // Step 1 - Authenticate with Supabase Auth (email + password)
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });

      console.log("🔐 AUTH:", authData);

      if (authError || !authData?.user) {
        return setErrorMsg("❌ Invalid credentials.");
      }

      // Step 2 - Fetch full user profile from users table + join roles.name
      const { data: dbUser, error: fetchErr } =
        await supabase.from('users')
          .select(`
            id,
            email,
            full_name,
            center_id,
            role_id,
            roles (
              name
            )
          `)
          .eq('id', authData.user.id)
          .single();

      console.log("🧠 DB USER:", dbUser);

      if (fetchErr || !dbUser) {
        return setErrorMsg("❌ User profile not found.");
      }

      // Step 3 - Flatten role into top-level field for routing checks
      const authUser = dbUser as AuthUser;
      const finalUser: User = {
        ...authUser,
        role: (authUser.roles?.name.replace("global_", "") || 'marketing') as User['role']
      };

      // Step 4 - Store in state and localStorage then redirect
      localStorage.setItem('plasmalytics_user', JSON.stringify(finalUser));
      setUser(finalUser);
      
      navigate('/dashboard');

    } catch (err) {
      console.error("⚠️ Unexpected login error:", err);
      setErrorMsg("Unexpected error occurred during login.");
    }
  };

  return (
    <div className="login-container">
      {/* Home Button - Top Right */}
      <button 
        className="home-icon-btn-page" 
        onClick={() => window.location.href = '/'}
        title="Go to Homepage"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="home-icon">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </button>

      {/* Left Side - Decorative */}
      <div className="login-left-side">
        <div className="decorative-background">
          <div className="decorative-lines">
            <div className="line line-1"></div>
            <div className="line line-2"></div>
            <div className="line line-3"></div>
          </div>
          <div className="dot-groups">
            <div className="dot dot-1"></div>
            <div className="dot dot-2"></div>
            <div className="dot dot-3"></div>
            <div className="dot dot-4"></div>
            <div className="dot dot-5"></div>
          </div>
        </div>
        <div className="left-content">
          <h1 className="brand-title">Welcome to CentroidAI</h1>
          <p className="brand-subtitle">Advanced Donor Analytics Platform</p>
          <div className="feature-icons-row">
            <div className="feature-icon-item">
              <div className="feature-icon plasma-icon">🩸</div>
            </div>
            <div className="connection-line"></div>
            <div className="feature-icon-item">
              <div className="feature-icon network-icon">🔗</div>
            </div>
            <div className="connection-line"></div>
            <div className="feature-icon-item">
              <div className="feature-icon donor-icon">👥</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right-side">
        <div className="login-form-container">
          <div className="form-header">
            <div className="form-logo-container">
              <img src="/cen_icon-removebg.png" alt="CentroidAI Icon" className="form-logo-icon" />
              <span className="form-logo-text">CentroidAI</span>
            </div>
            <p className="form-subtitle">Sign in to your account</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input 
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={!isAdminMode}
                className="login-input"
                disabled={isAdminMode}
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Password</label>
              <input 
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isAdminMode}
                className="login-input"
                disabled={isAdminMode}
              />
            </div>
            
            <div className="admin-toggle-container">
              <label className="admin-toggle-label">
                <input 
                  type="checkbox" 
                  checked={isAdminMode}
                  onChange={(e) => setIsAdminMode(e.target.checked)}
                  className="admin-toggle-input"
                />
                <span className="admin-toggle-slider"></span>
                <span className="admin-toggle-text">
                  🔐 Admin Quick Login
                  {isAdminMode && <span className="admin-badge">DEV MODE</span>}
                </span>
              </label>
              {isAdminMode && (
                <div className="admin-hint">
                  Auto-filling: raj@plasmalytics.com
                </div>
              )}
            </div>
            
            <button type="submit" className="login-button">
              {isAdminMode ? '🚀 Sign In as Admin' : 'Sign In'}
            </button>

            {errorMsg && (
              <div className="error-message">{errorMsg}</div>
            )}
            
          </form>
        </div>
      </div>
    </div>
  );
}

