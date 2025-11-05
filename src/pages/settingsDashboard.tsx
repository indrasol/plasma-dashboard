import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ModalWrapper from '../components/ModalWrapper';
import UserForm from '../components/UserForm';
import CenterForm from '../components/CenterForm';
import type { User } from '../types/user.types';

interface SettingsDashboardProps {
  user: User;
}

interface DbUserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  center_id: string | null;
  role_id: number;
  roles?: {
    name: string;
  };
  role?: string;
}

interface Center {
  id: string;
  name: string;
  location: string | null;
}

export default function SettingsDashboard({ user }: SettingsDashboardProps) {
  const [users, setUsers] = useState<DbUserWithRole[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showCenterForm, setShowCenterForm] = useState(false);

  const isSuperAdmin = user.role === "super_admin";
  const isCenterAdmin = user.role === "admin";

  useEffect(() => {
    async function fetchData() {
      let userQuery = supabase.from('users')
        .select(`
          id,
          email,
          full_name,
          center_id,
          role_id,
          roles (
            name
          )
        `);

      if (isCenterAdmin && user.center_id) {
        userQuery = userQuery.eq('center_id', user.center_id);
      }

      const { data: fetchedUsers, error: usersError } = await userQuery;

      if (usersError) {
        console.error("❌ Error fetching users:", usersError.message);
        return;
      }

      const typedUsers = fetchedUsers as DbUserWithRole[] | null;
      const flattenedUsers = (typedUsers || []).map(u => ({
        ...u,
        role: u.roles?.name || 'unknown'
      }));

      setUsers(flattenedUsers);

      if (isSuperAdmin) {
        const { data: fetchedCenters, error: centerError } =
          await supabase.from('centers').select('*');

        if (centerError) {
          console.error("❌ Error loading centers:", centerError);
        } else {
          setCenters((fetchedCenters as Center[]) || []);
        }
      }
    }

    fetchData();
  }, [user, isCenterAdmin, isSuperAdmin]);

  function handleEditUser(userId: string) {
    setEditingUserId(userId);
    setShowUserForm(true);
  }

  function handleAddUser() {
    setEditingUserId(null);
    setShowUserForm(true);
  }

  function handleAddCenter() {
    setShowCenterForm(true);
  }

  return (
    <div className="section">

      <h2>{isSuperAdmin ? "⚙️ Settings Dashboard" : "🔒 Admin – User Management"}</h2>

      {/* 👥 Manage Users */}
      <section style={{ marginTop: '2rem' }}>
        <h3>👥 Manage Users</h3>

        {(isSuperAdmin || isCenterAdmin) && (
          <button onClick={handleAddUser} style={{ marginBottom: '10px' }}>
            ➕ Create User
          </button>
        )}

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Center ID</th>
              {(isSuperAdmin || isCenterAdmin) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.center_id || '—'}</td>

                {(isSuperAdmin || isCenterAdmin) && (
                  <td><button onClick={() => handleEditUser(u.id)}>✏️ Edit</button></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

      </section>

      {/* 🏥 Center Management - Super Admin Only */}
      {isSuperAdmin && (
        <>
          <hr style={{ marginTop: '3rem', marginBottom: '1rem' }} />
          
          <section style={{ marginTop: '1rem' }}>
            <h3>🏢 Center Management</h3>

            {/* Add Center Button */}
            <button onClick={handleAddCenter} style={{ marginBottom: '10px' }}>
              ➕ Add Center
            </button>

            {centers.length > 0 ? (
              <>
                {/* Centers Table */}
                <table style={{ marginTop: '1rem' }}>
                  <thead><tr><th>Name</th><th>Location</th></tr></thead>
                  <tbody>
                    {centers.map(c => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.location || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </>
            ) : (
              <>No centers found.</>
            )}
            
          </section>
        </>
      )}

      
      {/* 🌟 Modals for Forms */}

      {/* User Form Modal */}
      {showUserForm && (
        <ModalWrapper 
          title={!editingUserId ? "➕ Create User" : "✏️ Edit User"}
          onClose={() => setShowUserForm(false)}
        >
          <UserForm 
            onSuccess={() => window.location.reload()}
          />
        </ModalWrapper>
      )}

      {/* Center Form Modal */}
      {showCenterForm && (
        <ModalWrapper 
          title={"🏥 Add New Center"}
          onClose={() => setShowCenterForm(false)}
        >
          {/* Future edit mode can pass prop here */}
          <CenterForm 
            centerToEdit={null}
            onSuccess={() => window.location.reload()}
          />
        </ModalWrapper>
      )}

    </div>
  );
}

