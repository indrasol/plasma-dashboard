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
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      return setErrorMsg("Please enter both email and password.");
    }

    try {
      // Step 1 - Authenticate with Supabase Auth (email + password)
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
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
      <img src="/Logo-with-tagline.png" alt="Plasmalytics Logo" className="logo" />

      <h1>
        Welcome to <span className="highlight">Plasmalytics</span>
      </h1>

      <p>Your AI-powered donor intelligence platform</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <input 
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input 
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit">Log In</button>

        {errorMsg && (
          <div className="error">{errorMsg}</div>
        )}
      </form>
    </div>
  );
}

