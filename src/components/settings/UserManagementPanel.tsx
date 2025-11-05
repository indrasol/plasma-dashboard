import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

interface Role {
  id: number;
  name: string;
}

interface Center {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role_id: number;
  center_id: string | null;
}

interface FormData {
  email: string;
  full_name: string;
  role_id: string;
  center_id: string;
}

export default function UserManagementPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    full_name: '',
    role_id: '',
    center_id: ''
  });

  const [loading, setLoading] = useState(false);

  // Load existing users + roles + centers
  useEffect(() => {
    async function fetchAll() {
      const { data: roles } = await supabase.from('roles').select('*');
      const { data: centers } = await supabase.from('centers').select('*');
      const { data: users } = await supabase
        .from('users')
        .select('id, email, full_name, role_id, center_id');

      setRoles((roles as Role[]) || []);
      setCenters((centers as Center[]) || []);
      setUsers((users as User[]) || []);
    }

    fetchAll();
  }, []);

  // Handle form field change
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // Handle user creation (Auth + DB)
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.email || !formData.full_name || !formData.role_id) return;

    try {
      setLoading(true);

      // Step 1 - create auth user with random password (they'll reset it later)
      const { data: authUserRes, error: authError } =
        await supabase.auth.admin.createUser({
          email: formData.email,
          password: crypto.randomUUID().slice(0, 12),
          email_confirm: true,
        });

      if (authError) throw authError;

      const authUserId = authUserRes?.user?.id;

      // Step 2 - insert into public.users table
      await supabase.from('users').insert({
        id: authUserId,
        email: formData.email,
        full_name: formData.full_name,
        role_id: parseInt(formData.role_id),
        center_id: formData.center_id || null
      } as any);

      alert("✅ New user created!");

      // Refresh view after add:
      const { data: updatedUsers } = await supabase.from('users').select('*');
      setUsers((updatedUsers as User[]) || []);

    } catch (err) {
      console.error("❌ Error creating user:", err);
      alert("Failed to create user.");

    } finally {
      setLoading(false);
      setFormData({ email: '', full_name: '', role_id: '', center_id: '' });
    }
  }

  return (
    <div className="dashboard-tile light-tile" style={{ marginTop: '2rem' }}>
      <h3>👥 Manage Users</h3>

      {/* Form */}
      <form onSubmit={handleCreateUser} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Full Name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Role dropdown */}
        <select name="role_id" value={formData.role_id} onChange={handleChange} required>
          <option value="">Select Role</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>

        {/* Center dropdown */}
        <select name="center_id" value={formData.center_id} onChange={handleChange}>
          <option value="">Global / Not Applicable</option>
          {centers.map(center => (
            <option key={center.id} value={center.id}>{center.name}</option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          ➕ Create User
        </button>
      </form>

      {/* Table of Users */}
      {!users.length ? (
        <p>⏳ Loading users...</p>
      ) : (
        <>
          <table className='conversion-table'>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Center ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>{roles.find(r => r.id === user.role_id)?.name ?? '—'}</td>
                  <td>{user.center_id ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

