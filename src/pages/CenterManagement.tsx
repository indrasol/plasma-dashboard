import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ModalWrapper from '../components/ModalWrapper';
import CenterForm from '../components/CenterForm';
import type { User } from '../types/user.types';

interface CenterManagementProps {
  user: User;
}

interface Center {
  id: string;
  name: string;
  location: string | null;
}

export default function CenterManagement({ user }: CenterManagementProps) {
  const [centers, setCenters] = useState<Center[]>([]);
  const [showCenterForm, setShowCenterForm] = useState(false);

  const isSuperAdmin = user.role === "super_admin";

  useEffect(() => {
    async function fetchCenters() {
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

    fetchCenters();
  }, [isSuperAdmin]);

  function handleAddCenter() {
    setShowCenterForm(true);
  }

  return (
    <div className="section">
      {/* Center Management Header */}
      <h1 className="dashboard-title">
        Center Management
      </h1>

      {/* 🏥 Center Management Table */}
      <div className="modern-settings-widget">
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
            Healthcare Centers
          </h3>
          {isSuperAdmin && (
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
          )}
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
          <CenterForm 
            centerToEdit={null}
            onSuccess={() => window.location.reload()}
          />
        </ModalWrapper>
      )}
    </div>
  );
}
