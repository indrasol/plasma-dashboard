import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { exportToCSV } from '../utils/exportToCSV';

interface ElasticityData {
  classification: string;
  [key: string]: unknown;
}

export default function DonorElasticityDashboard() {
  const [data, setData] = useState<ElasticityData[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: elasticityData, error } = await supabase
        .from('donor_elasticity')
        .select('*');

      if (error) console.error(error);
      else setData((elasticityData as ElasticityData[]) || []);
    }

    fetchData();
  }, []);

  const elasticOnly = data.filter(d => d.classification === 'elastic');
  const inelasticOnly = data.filter(d => d.classification === 'inelastic');

  return (
    <div className="modern-influencer-widget" style={{ marginBottom: '32px' }}>
      <div className="widget-header">
        <h3 className="widget-title">
          <span className="title-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </span>
          Donor Elasticity Summary
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        padding: '8px'
      }}>
        {/* Elastic Section */}
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #e6f7ff 0%, #f0faff 100%)',
          borderRadius: '16px',
          border: '2px solid rgba(16, 185, 129, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#10b981', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Elastic Donors
              </div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#1e293b' }}>
                {elasticOnly.length.toLocaleString()}
              </div>
            </div>
          </div>
          
          {elasticOnly.length > 0 && (
            <button 
              className="modern-export-btn"
              style={{ 
                width: '100%',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
              }}
              onClick={() => exportToCSV(elasticOnly, "elastic_donors.csv")}
            >
              <span className="btn-icon">⬇</span>
              Export Elastic (.csv)
            </button>
          )}
        </div>

        {/* Inelastic Section */}
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #ffe6e6 0%, #fff0f0 100%)',
          borderRadius: '16px',
          border: '2px solid rgba(229, 62, 62, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#E53E3E', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Inelastic Donors
              </div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#1e293b' }}>
                {inelasticOnly.length.toLocaleString()}
              </div>
            </div>
          </div>
          
          {inelasticOnly.length > 0 && (
            <button 
              className="modern-export-btn"
              style={{ 
                width: '100%',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #E53E3E 0%, #c53030 100%)',
                boxShadow: '0 4px 12px rgba(229, 62, 62, 0.2)'
              }}
              onClick={() => exportToCSV(inelasticOnly, "inelastic_donors.csv")}
            >
              <span className="btn-icon">⬇</span>
              Export Inelastic (.csv)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

