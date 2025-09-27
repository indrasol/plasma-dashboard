import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function LoginPage({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
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
      const finalUser = {
        ...dbUser,
        role: dbUser.roles?.name.replace("global_", "") || null 
      };

      // Step 4 - Store in state and localStorage then redirect
      localStorage.setItem('plasmalytics_user', JSON.stringify(finalUser));
      setUser(finalUser);
      
      navigate('/dashboard');

    } catch (err) {
      console.error("⚠️ Unexpected login error:", err.message);
      setErrorMsg("Unexpected error occurred during login.");
    }
  };

  return (
    <div className="login-container">
      <img public="Logo_with_tagline.png" alt="Plasmalytics Logo" className="logo" />

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