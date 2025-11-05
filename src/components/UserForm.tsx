import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
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

