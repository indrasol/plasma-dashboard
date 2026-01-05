import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { exportToCSV } from '../utils/exportToCSV';
import { API_ENDPOINTS } from '../config/apiEndpoints';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ElasticityData {
  classification: string;
  [key: string]: unknown;
}

export default function DonorElasticityDashboard() {
  const [data, setData] = useState<ElasticityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(API_ENDPOINTS.donorElasticity);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const elasticityData = await res.json();
        setData((elasticityData as ElasticityData[]) || []);
      } catch (err) {
        console.warn("⚠️ API elasticity failed, falling back to Supabase:", err);
        const { data: elasticityData, error } = await supabase
          .from('donor_elasticity')
          .select('*');

        if (error) console.error(error);
        else setData((elasticityData as ElasticityData[]) || []);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const elasticOnly = data.filter(d => d.classification === 'elastic');
  const inelasticOnly = data.filter(d => d.classification === 'inelastic');

  const chartData = [
    { name: 'Elastic', value: elasticOnly.length, color: '#10b981' },
    { name: 'Inelastic', value: inelasticOnly.length, color: '#E53E3E' }
  ].filter(d => d.value > 0);

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
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        padding: '24px',
        alignItems: 'center'
      }}>
        {/* Chart Section */}
        {chartData.length > 0 && (
          <div style={{ 
            height: '320px', 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            padding: '16px'
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '13px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Elastic Section */}
        <div style={{
          padding: '24px',
          height: '320px',
          background: 'linear-gradient(135deg, #e6f7ff 0%, #f0faff 100%)',
          borderRadius: '20px',
          border: '2px solid rgba(16, 185, 129, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease'
        }}>
          <div>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 700, 
              color: '#059669', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Elastic Segment
            </div>
            <div style={{ fontSize: '48px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
              {elasticOnly.length.toLocaleString()}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
              High responsiveness to engagement
            </div>
          </div>
          
          {elasticOnly.length > 0 && (
            <button 
              className="modern-export-btn"
              style={{ 
                width: '100%',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={() => exportToCSV(elasticOnly, "elastic_donors.csv")}
            >
              <span className="btn-icon" style={{ marginRight: '8px' }}>⬇</span>
              Export List (.csv)
            </button>
          )}
        </div>

        {/* Inelastic Section */}
        <div style={{
          padding: '24px',
          height: '320px',
          background: 'linear-gradient(135deg, #ffe6e6 0%, #fff0f0 100%)',
          borderRadius: '20px',
          border: '2px solid rgba(229, 62, 62, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease'
        }}>
          <div>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 700, 
              color: '#dc2626', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Inelastic Segment
            </div>
            <div style={{ fontSize: '48px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
              {inelasticOnly.length.toLocaleString()}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
              Consistent donation patterns
            </div>
          </div>
          
          {inelasticOnly.length > 0 && (
            <button 
              className="modern-export-btn"
              style={{ 
                width: '100%',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #E53E3E 0%, #c53030 100%)',
                boxShadow: '0 4px 12px rgba(229, 62, 62, 0.25)',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={() => exportToCSV(inelasticOnly, "inelastic_donors.csv")}
            >
              <span className="btn-icon" style={{ marginRight: '8px' }}>⬇</span>
              Export List (.csv)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


