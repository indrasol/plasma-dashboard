import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ModalWrapper from '../components/ModalWrapper';
import UserForm from '../components/UserForm';
import type { User } from '../types/user.types';

interface ManageUsersProps {
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

export default function ManageUsers({ user }: ManageUsersProps) {
  const [users, setUsers] = useState<DbUserWithRole[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const isSuperAdmin = user.role === "super_admin";

  useEffect(() => {
    async function fetchUsers() {
      const userQuery = supabase.from('users')
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
    }

    fetchUsers();
  }, [user]);

  function handleEditUser(userId: string) {
    setEditingUserId(userId);
    setShowUserForm(true);
  }

  function handleAddUser() {
    setEditingUserId(null);
    setShowUserForm(true);
  }

  return (
    <div className="section">
      {/* Manage Users Header */}
      <h1 className="dashboard-title">
        Manage Users
      </h1>

      {/* 👥 Manage Users Table */}
      <div className="modern-settings-widget">
        <div className="settings-widget-header">
          <h3 className="widget-title">
            <span className="title-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            User Management
          </h3>
          {isSuperAdmin && (
            <button className="modern-primary-btn" onClick={handleAddUser}>
              <span className="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </span>
              Create User
            </button>
          )}
        </div>

        <div className="modern-table-container">
          <table className="modern-settings-table">
            <thead>
              <tr>
                <th>
                  <span className="th-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  Name
                </th>
                <th>
                  <span className="th-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  Email
                </th>
                <th>
                  <span className="th-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </span>
                  Role
                </th>
                <th>
                  <span className="th-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M3 21h18"/>
                      <path d="M5 21V7l8-4v18"/>
                      <path d="M19 21V11l-6-4"/>
                    </svg>
                  </span>
                  Center ID
                </th>
                {isSuperAdmin && (
                  <th style={{ textAlign: 'center' }}>
                    <span className="th-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="19" cy="12" r="1"/>
                        <circle cx="5" cy="12" r="1"/>
                      </svg>
                    </span>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td className="name-cell">
                    <div className="user-avatar">
                      {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <span className="user-name">{u.full_name || 'No Name'}</span>
                  </td>
                  <td className="email-cell">{u.email}</td>
                  <td className="role-cell">
                    <span className="role-badge">{u.role}</span>
                  </td>
                  <td className="center-cell">{u.center_id || '—'}</td>

                  {isSuperAdmin && (
                    <td className="actions-cell">
                      <button className="modern-action-btn" onClick={() => handleEditUser(u.id)}>
                        <span className="btn-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </span>
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <ModalWrapper 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              {!editingUserId ? "Create User" : "Edit User"}
            </div>
          }
          slideFrom="right"
          onClose={() => setShowUserForm(false)}
        >
          <UserForm 
            onSuccess={() => window.location.reload()}
          />
        </ModalWrapper>
      )}
    </div>
  );
}
