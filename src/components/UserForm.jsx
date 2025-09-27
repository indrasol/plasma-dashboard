import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (public keys only)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function UserForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role_id: '',
    center_id: '',
  });

  const [roles, setRoles] = useState([]);
  const [centers, setCenters] = useState([]);

  // 🔁 Fetch roles & centers once on mount
  useEffect(() => {
    fetchRolesAndCenters();
  }, []);

  const fetchRolesAndCenters = async () => {
    try {
      const { data: roleData, error: roleError } = await supabase.from('roles').select('*');
      if (roleError) throw roleError;

      const { data: centerData, error: centerError } = await supabase.from('centers').select('*');
      if (centerError) throw centerError;

      setRoles(roleData);
      setCenters(centerData);

      // Set defaults if available
      if (roleData.length > 0 || centerData.length > 0) {
        setFormData(prev => ({
          ...prev,
          role_id: roleData[0]?.id || '',
          center_id: centerData[0]?.id || ''
        }));
      }

    } catch (err) {
      console.error("❌ Failed to fetch roles or centers:", err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log("📤 Submitting Form Data:", formData);
console.log("🔁 Response status:", response.status);
console.log("📝 Result JSON:", result);

      const result = await response.json();

      if (!response.ok || result?.error)
        throw new Error(result?.error?.message || "Unknown error");

      alert("✅ New user created.");
      onSuccess();
    } catch (err) {
      console.error("❌ Error saving user:", err.message);
      alert("An error occurred while saving the user.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      
      <label>Full Name</label>
      <input name="full_name" value={formData.full_name} onChange={handleChange} required />

      <label>Email</label>
      <input name="email" type="email" value={formData.email} onChange={handleChange} required />

      <label>Password</label>
      <input name="password" type="password" value={formData.password} onChange={handleChange} required />

      
      <label>Role</label>
      <select name="role_id" value={formData.role_id} onChange={handleChange}>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>

      
      <label>Center</label>
       <select name="center_id" value={formData.center_id} onChange={handleChange}>
        {centers.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
       </select>

      
       <button type="submit">➕ Create User</button>
     </form>
   );
}