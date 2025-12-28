import React, { useState } from 'react';
import './CSVIntegration.css';

interface FileUpload {
  id: string;
  name: string;
  size: string;
  status: 'pending' | 'mapping' | 'syncing' | 'completed';
  type: string;
  progress: number;
}

interface MappingField {
  source: string;
  target: string;
  confidence: number;
  sample: string;
  approved: boolean;
}

interface DataRequirement {
  id: string;
  label: string;
  description: string;
  isOptional: boolean;
  status: 'empty' | 'partial' | 'complete';
}

const DATA_BLUEPRINT: DataRequirement[] = [
  { id: 'donors', label: 'Donor Profiles', description: 'Names, IDs, and contact info', isOptional: false, status: 'partial' },
  { id: 'donations', label: 'Donation History', description: 'Transaction dates and amounts', isOptional: false, status: 'empty' },
  { id: 'campaigns', label: 'Campaign Data', description: 'Outreach and engagement history', isOptional: true, status: 'empty' },
  { id: 'health', label: 'Health Screenings', description: 'Clinical screening results', isOptional: true, status: 'empty' },
];

const CATEGORY_SCHEMAS: Record<string, { key: string; label: string }[]> = {
  donors: [
    { key: 'donor_id', label: 'Donor ID' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'total_donated', label: 'Total Donated' },
    { key: 'frequency', label: 'Donation Frequency' },
    { key: 'last_active', label: 'Last Active Date' }
  ],
  donations: [
    { key: 'donation_id', label: 'Donation ID' },
    { key: 'donor_id', label: 'Donor ID' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Transaction Date' },
    { key: 'campaign_id', label: 'Campaign ID' },
    { key: 'payment_method', label: 'Payment Method' }
  ],
  campaigns: [
    { key: 'campaign_id', label: 'Campaign ID' },
    { key: 'campaign_name', label: 'Campaign Name' },
    { key: 'channel', label: 'Channel' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'conversion_rate', label: 'Conversion Rate' }
  ],
  health: [
    { key: 'screening_id', label: 'Screening ID' },
    { key: 'donor_id', label: 'Donor ID' },
    { key: 'screening_date', label: 'Date' },
    { key: 'blood_type', label: 'Blood Type' },
    { key: 'hemoglobin', label: 'Hemoglobin Level' }
  ]
};

const DUMMY_FILES: FileUpload[] = [
  {
    id: 'f-1',
    name: 'donor_export_dec_2023.csv',
    size: '1.2 MB',
    status: 'mapping',
    type: 'Donor Profiles',
    progress: 45
  },
  {
    id: 'f-2',
    name: 'campaign_leads_q4.xlsx',
    size: '850 KB',
    status: 'completed',
    type: 'Campaign Data',
    progress: 100
  }
];

const DUMMY_MAPPINGS: Record<string, MappingField[]> = {
  'f-1': [
    { source: 'UID', target: 'donor_id', confidence: 0.99, sample: 'USR-88210', approved: true },
    { source: 'F_NAME', target: 'first_name', confidence: 0.98, sample: 'John', approved: true },
    { source: 'L_NAME', target: 'last_name', confidence: 0.98, sample: 'Doe', approved: true },
    { source: 'EMAIL_PRIMARY', target: 'email', confidence: 0.95, sample: 'john.doe@gmail.com', approved: true },
    { source: 'TOTAL_GIVING', target: 'total_donated', confidence: 0.92, sample: '$12,450.00', approved: false },
    { source: 'STATUS_LEVEL', target: 'frequency', confidence: 0.75, sample: 'Monthly Platium', approved: false },
  ]
};

// Modern SVG Icons
const Icons = {
  Gear: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1-1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Info: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Database: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Circle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  ChevronUp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Upload: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )
};

const MOCK_CSV_HEADERS = ['UID', 'F_NAME', 'L_NAME', 'EMAIL_PRIMARY', 'TOTAL_GIVING', 'STATUS_LEVEL', 'DATE_JOINED', 'TXN_ID', 'AMT', 'METHOD', 'CAMPAIGN_REF'];

export default function CSVIntegration() {
  const [files, setFiles] = useState<FileUpload[]>(DUMMY_FILES);
  const [activeFileId, setActiveFileId] = useState<string | null>('f-1');
  const [mappings, setMappings] = useState<Record<string, MappingField[]>>(DUMMY_MAPPINGS);
  const [showBlueprint, setShowBlueprint] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('donors');
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);

  const analyticsReadiness = 35; 

  const currentSchema = CATEGORY_SCHEMAS[selectedCategoryId] || CATEGORY_SCHEMAS.donors;

  // For the demo, use a fixed set of headers
  const availableCsvColumns = MOCK_CSV_HEADERS;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      status: 'pending' as const,
      type: 'Uncategorized',
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const startMapping = (fileId: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'mapping' } : f));
    setActiveFileId(fileId);
    if (!mappings[fileId]) {
      const mockMapping: MappingField[] = [
        { source: 'ID', target: 'donor_id', confidence: 0.98, sample: 'D-123', approved: true },
        { source: 'USER_EMAIL', target: 'email', confidence: 0.99, sample: 'user@test.com', approved: true },
        { source: 'AMT', target: 'total_donated', confidence: 0.94, sample: '$500', approved: false },
      ];
      setMappings(prev => ({ ...prev, [fileId]: mockMapping }));
    }
  };

  const toggleApproval = (fileId: string, targetKey: string) => {
    setMappings(prev => {
      const fileMappings = prev[fileId] || [];
      const exists = fileMappings.some(m => m.target === targetKey);
      
      if (!exists) {
        // Create new mapping if it doesn't exist
        return {
          ...prev,
          [fileId]: [...fileMappings, { 
            source: 'Select Column', 
            target: targetKey, 
            confidence: 0, 
            sample: '-', 
            approved: true 
          }]
        };
      }

      return {
        ...prev,
        [fileId]: fileMappings.map(m => 
          m.target === targetKey ? { ...m, approved: !m.approved } : m
        )
      };
    });
  };

  const updateMappingSource = (fileId: string, targetKey: string, newSource: string) => {
    setMappings(prev => {
      const fileMappings = prev[fileId] || [];
      const exists = fileMappings.some(m => m.target === targetKey);

      if (!exists) {
        return {
          ...prev,
          [fileId]: [...fileMappings, { 
            source: newSource, 
            target: targetKey, 
            confidence: 0, 
            sample: '-', 
            approved: false 
          }]
        };
      }

      return {
        ...prev,
        [fileId]: fileMappings.map(m => 
          m.target === targetKey ? { ...m, source: newSource } : m
        )
      };
    });
  };

  return (
    <div className="csv-integration-container fade-in">
      <div className="integration-header">
        <div className="title-area">
          <h1 className="integration-title">CSV Intelligence Onboarding</h1>
          <p className="integration-subtitle">Feed the CentroidAI engine by uploading your core donor datasets.</p>
        </div>
        
        {/* Analytics Readiness Widget */}
        <div className="readiness-widget">
          <div className="readiness-info">
            <span className="readiness-label">Analytics Readiness</span>
            <span className="readiness-value">{analyticsReadiness}%</span>
          </div>
          <div className="readiness-bar-container">
            <div className="readiness-bar-fill" style={{ width: `${analyticsReadiness}%` }}></div>
          </div>
          <p className="readiness-hint">Upload <strong>Donation History</strong> to reach 60%</p>
        </div>
      </div>

      {/* Data Blueprint / Requirements Section */}
      <div className={`blueprint-section ${showBlueprint ? 'expanded' : 'collapsed'}`}>
        <div className="blueprint-header" onClick={() => setShowBlueprint(!showBlueprint)}>
          <div className="blueprint-title">
            <Icons.Database />
            <span>Intelligence Data Blueprint</span>
            <span className="blueprint-count">2/4 Categories Filled</span>
          </div>
          <button className="toggle-blueprint-btn">
            <span>{showBlueprint ? 'Hide Requirements' : 'Show Requirements'}</span>
            {showBlueprint ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
          </button>
        </div>
        
        {showBlueprint && (
          <div className="blueprint-grid fade-in">
            {DATA_BLUEPRINT.map(req => (
              <div 
                key={req.id} 
                className={`blueprint-card ${req.status} ${selectedCategoryId === req.id ? 'selected' : ''}`}
                onClick={() => setSelectedCategoryId(req.id)}
              >
                <div className="card-status-indicator"></div>
                <div className="card-content">
                  <div className="card-top">
                    <h4>{req.label}</h4>
                  </div>
                  <p>{req.description}</p>
                  <div className="card-footer">
                    <span className="status-text">
                      {req.status === 'complete' ? 'Data Integrated' : req.status === 'partial' ? 'Mapping in Progress' : 'Awaiting Data'}
                    </span>
                    <Icons.Info />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="csv-single-view">
        {/* Mapping View */}
        <div className="mapping-view">
          {!activeFileId || !mappings[activeFileId] ? (
            <div className="empty-mapping">
              <div className="empty-graphic">
                <Icons.Database />
              </div>
              <p>Select a blueprint category and upload a CSV to begin mapping</p>
              <label className="primary-upload-btn">
                <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                <Icons.Upload />
                <span>Upload CSV Source</span>
              </label>
            </div>
          ) : (
            <div className="active-mapping fade-in">
              <div className="mapping-header">
                <div className="mapping-title-block">
                  <div className="mapping-badge-row">
                    <span className="mapping-file-tag">CSV Data Source</span>
                    <label className="inline-upload-btn">
                      <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                      <Icons.Upload />
                      <span>Upload New</span>
                    </label>
                  </div>
                  <h3>{files.find(f => f.id === activeFileId)?.name}</h3>
                </div>
                <div className="mapping-stats">
                  <div className="approval-progress">
                    <span className="approval-count">
                      {mappings[activeFileId]?.filter(m => m.approved).length} / {currentSchema.length}
                    </span>
                    <span className="approval-label">Fields Approved</span>
                  </div>
                </div>
              </div>

              <div className="mapping-table-wrapper">
                <table className="modern-mapping-table">
                  <thead>
                    <tr>
                      <th>Engine Required Field</th>
                      <th>Uploaded CSV Data</th>
                      <th>AI Confidence</th>
                      <th>Live Preview</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSchema.map((targetField, idx) => {
                      const m = mappings[activeFileId]?.find(map => map.target === targetField.key) || {
                        source: 'Select Column',
                        target: targetField.key,
                        confidence: 0,
                        sample: '-',
                        approved: false
                      };

                      return (
                        <tr 
                          key={targetField.key} 
                          className={`${m.approved ? 'is-approved' : 'needs-action'} ${openDropdownIdx === idx ? 'has-open-dropdown' : ''}`}
                        >
                          <td>
                            <div className="fixed-field-display">
                              <span className="field-dot"></span>
                              <span className="field-label">{targetField.label}</span>
                            </div>
                          </td>
                          <td>
                            <div className="target-select-wrapper">
                              <div 
                                className={`custom-table-dropdown ${openDropdownIdx === idx ? 'is-open' : ''} ${idx >= currentSchema.length - 2 ? 'opens-up' : ''}`}
                                onClick={() => setOpenDropdownIdx(openDropdownIdx === idx ? null : idx)}
                              >
                                <div className="dropdown-trigger">
                                  <span>{m.source}</span>
                                  <Icons.ChevronDown />
                                </div>
                                {openDropdownIdx === idx && (
                                  <>
                                    <div className="dropdown-overlay" onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdownIdx(null);
                                    }}></div>
                                    <div className="dropdown-menu">
                                      {availableCsvColumns.map(col => (
                                        <div 
                                          key={col} 
                                          className={`dropdown-item ${m.source === col ? 'active' : ''}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateMappingSource(activeFileId, targetField.key, col);
                                            setOpenDropdownIdx(null);
                                          }}
                                        >
                                          {col}
                                          {m.source === col && <Icons.Check />}
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="confidence-pill">
                              <div className="confidence-track">
                                <div className="confidence-fill" style={{ width: `${m.confidence * 100}%` }}></div>
                              </div>
                              <span>{Math.round(m.confidence * 100)}%</span>
                            </div>
                          </td>
                          <td><span className="sample-val">{m.sample}</span></td>
                          <td>
                            <button 
                              className={`modern-tick-btn ${m.approved ? 'approved' : ''}`}
                              onClick={() => toggleApproval(activeFileId, targetField.key)}
                              title={m.approved ? "Approved" : "Click to Approve"}
                            >
                              {m.approved ? <Icons.CheckCircle /> : <Icons.Circle />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mapping-footer">
                <div className="engine-status">
                  <span className="status-dot pulse"></span>
                  <span className="status-text">AI Intelligence Engine standby</span>
                </div>
                <button className="primary-sync-btn">
                  <span>Commit Mappings & Sync</span>
                  <Icons.Check />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
