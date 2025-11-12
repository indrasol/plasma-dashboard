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
      {/* Settings Header */}
      <h1 className="dashboard-title">
        {isSuperAdmin ? "Settings" : "Admin – User Management"}
      </h1>

      {/* 👥 Manage Users */}
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
            Manage Users
          </h3>
          {(isSuperAdmin || isCenterAdmin) && (
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
                {(isSuperAdmin || isCenterAdmin) && (
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

                  {(isSuperAdmin || isCenterAdmin) && (
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

      {/* 🏥 Center Management - Super Admin Only */}
      {isSuperAdmin && (
        <div className="modern-settings-widget" style={{ marginTop: '2rem' }}>
          <div className="settings-widget-header">
            <h3 className="widget-title">
              <span className="title-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="M9 21V11"/>
                </svg>
              </span>
              Center Management
            </h3>
            <button className="modern-secondary-btn" onClick={handleAddCenter}>
              <span className="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                  <circle cx="9" cy="9" r="2" fill="white"/>
                  <path d="M9 21V11"/>
                  <line x1="15" y1="8" x2="15" y2="14" stroke="white" strokeWidth="2"/>
                  <line x1="18" y1="11" x2="12" y2="11" stroke="white" strokeWidth="2"/>
                </svg>
              </span>
              Add Center
            </button>
          </div>

          {centers.length > 0 ? (
            <div className="modern-table-container">
              <table className="modern-settings-table">
                <thead>
                  <tr>
                    <th>
                      <span className="th-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M3 21h18"/>
                          <path d="M5 21V7l8-4v18"/>
                          <path d="M19 21V11l-6-4"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="M9 21V11"/>
                        </svg>
                      </span>
                      Name
                    </th>
                    <th>
                      <span className="th-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </span>
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {centers.map((c, index) => (
                    <tr key={c.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                      <td className="center-name-cell">
                        <div className="center-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                            <path d="M3 21h18"/>
                            <path d="M5 21V7l8-4v18"/>
                            <path d="M19 21V11l-6-4"/>
                            <circle cx="9" cy="9" r="2"/>
                            <path d="M9 21V11"/>
                          </svg>
                        </div>
                        <span className="center-name">{c.name}</span>
                      </td>
                      <td className="location-cell">{c.location || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="M9 21V11"/>
                </svg>
              </div>
              <p>No centers found. Add your first center to get started.</p>
            </div>
          )}
        </div>
      )}

      
      {/* 🌟 Modals for Forms */}

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

      {/* Center Form Modal */}
      {showCenterForm && (
        <ModalWrapper 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="M9 21V11"/>
                <line x1="15" y1="8" x2="15" y2="14"/>
                <line x1="18" y1="11" x2="12" y2="11"/>
              </svg>
              Add New Center
            </div>
          }
          slideFrom="right"
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

