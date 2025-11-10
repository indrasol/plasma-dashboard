import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

interface UserFormProps {
  onSuccess: () => void;
}

interface FormData {
  full_name: string;
  email: string;
  password: string;
  role_id: string | number;
  center_id: string;
}

interface Role {
  id: number;
  name: string;
}

interface Center {
  id: string;
  name: string;
}

// Initialize Supabase client (public keys only)
const supabase = createClient(
  env.SUPABASE_URL as string,
  env.SUPABASE_ANON_KEY as string
);

export default function UserForm({ onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    role_id: '',
    center_id: '',
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);

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

      const typedRoles = (roleData as Role[]) || [];
      const typedCenters = (centerData as Center[]) || [];

      setRoles(typedRoles);
      setCenters(typedCenters);

      // Set defaults if available
      if (typedRoles.length > 0 || typedCenters.length > 0) {
        setFormData(prev => ({
          ...prev,
          role_id: typedRoles[0]?.id || '',
          center_id: typedCenters[0]?.id || ''
        }));
      }

    } catch (err) {
      console.error("❌ Failed to fetch roles or centers:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("📤 Submitting Form Data:", formData);
      
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log("🔁 Response status:", response.status);

      const result = await response.json();
      console.log("📝 Result JSON:", result);

      if (!response.ok || result?.error)
        throw new Error(result?.error?.message || "Unknown error");

      alert("✅ New user created.");
      onSuccess();
    } catch (err) {
      console.error("❌ Error saving user:", err);
      alert("An error occurred while saving the user.");
    }
  };

  return (
    <form className="modern-form" onSubmit={handleSubmit}>
      
      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          Full Name
        </label>
        <input 
          className="modern-input"
          name="full_name" 
          value={formData.full_name} 
          onChange={handleChange} 
          placeholder="Enter full name"
          required 
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </span>
          Email Address
        </label>
        <input 
          className="modern-input"
          name="email" 
          type="email" 
          value={formData.email} 
          onChange={handleChange} 
          placeholder="user@example.com"
          required 
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          Password
        </label>
        <input 
          className="modern-input"
          name="password" 
          type="password" 
          value={formData.password} 
          onChange={handleChange} 
          placeholder="Enter secure password"
          required 
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </span>
          Role
        </label>
        <select className="modern-select" name="role_id" value={formData.role_id} onChange={handleChange}>
          <option value="">Select a role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
              <path d="M3 21h18"/>
              <path d="M5 21V7l8-4v18"/>
              <path d="M19 21V11l-6-4"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M9 21V11"/>
            </svg>
          </span>
          Center
        </label>
        <select className="modern-select" name="center_id" value={formData.center_id} onChange={handleChange}>
          <option value="">Select a center</option>
          {centers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" className="modern-submit-btn">
          <span className="btn-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </span>
          Create User
        </button>
      </div>
    </form>
  );
}

