import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { FiActivity, FiHeart, FiCheckCircle, FiClipboard, FiTrendingUp, FiArrowUpRight, FiUsers } from 'react-icons/fi';
import { API_ENDPOINTS } from '../config/apiEndpoints';

interface HealthStats {
  avg_hemoglobin: number;
  avg_systolic: number;
  avg_diastolic: number;
  pass_rate: number;
  total_screenings: number;
  disqualified_counts: Record<string, number>;
}

interface Screening {
  screening_id: string;
  donor_id: string;
  name?: string;
  screening_date: string;
  hemoglobin_level: number;
  systolic_bp: number;
  diastolic_bp: number;
  weight_kg: number;
  pulse_bpm: number;
  questionnaire_passed: boolean;
  disqualified_reason_code?: string;
}

export default function DonorHealthDashboard() {
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsRes, listRes] = await Promise.all([
          fetch(API_ENDPOINTS.donorHealthStats),
          fetch(API_ENDPOINTS.donorHealthList + '?limit=100')
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (listRes.ok) setScreenings(await listRes.json());
      } catch (err) {
        console.error("Error fetching health data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const disqualifyData = stats ? Object.entries(stats.disqualified_counts).map(([reason, count]) => ({
    reason: reason || 'Other',
    count
  })) : [];

  const COLORS = ['#314ca0', '#E53E3E', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="section">
      <div style={{ marginBottom: '32px' }}>
        <h1 className="dashboard-title" style={{ margin: 0, marginBottom: '8px' }}>
          Donor Health & Clinical Analytics
        </h1>
        <p className="dashboard-subtitle" style={{ margin: 0, fontSize: '16px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)' }}></span>
          Real-time monitoring of clinical screening metrics and donor health trends
        </p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Analyzing clinical data...</p>
        </div>
      ) : (
        <>
          {/* Modernized Metric Tiles */}
          <div className="metric-grid" style={{ marginBottom: '40px' }}>
            <div className="modern-metric-tile">
              <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '12px' }}>
                <FiActivity size={24} />
              </div>
              <div className="metric-content">
                <h3>Avg Hemoglobin</h3>
                <div className="metric-value">{stats?.avg_hemoglobin} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>g/dL</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '12px', color: '#10b981' }}>
                  <FiArrowUpRight size={14} />
                  <span>Optimal Range</span>
                </div>
              </div>
            </div>

            <div className="modern-metric-tile">
              <div className="metric-icon" style={{ background: 'rgba(49, 76, 160, 0.1)', color: '#314ca0', padding: '12px', borderRadius: '12px' }}>
                <FiHeart size={24} />
              </div>
              <div className="metric-content">
                <h3>Avg Blood Pressure</h3>
                <div className="metric-value">{stats?.avg_systolic}/{stats?.avg_diastolic}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '12px', color: '#314ca0' }}>
                  <FiTrendingUp size={14} />
                  <span>Stable Trend</span>
                </div>
              </div>
            </div>

            <div className="modern-metric-tile">
              <div className="metric-icon" style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#E53E3E', padding: '12px', borderRadius: '12px' }}>
                <FiCheckCircle size={24} />
              </div>
              <div className="metric-content">
                <h3>Pass Rate</h3>
                <div className="metric-value">{stats?.pass_rate}%</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '12px', color: '#E53E3E' }}>
                  <FiActivity size={14} />
                  <span>Health Check</span>
                </div>
              </div>
            </div>

            <div className="modern-metric-tile">
              <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '12px', borderRadius: '12px' }}>
                <FiClipboard size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Screenings</h3>
                <div className="metric-value">{stats?.total_screenings.toLocaleString()}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '12px', color: '#f59e0b' }}>
                  <FiUsers size={14} />
                  <span>Total Donors</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px', marginBottom: '32px' }}>
            {/* Disqualification Reasons */}
            <div className="modern-influencer-widget">
              <div className="widget-header">
                <h3 className="widget-title">
                  <FiTrendingUp style={{ color: '#314ca0' }} />
                  Disqualification Reasons
                </h3>
              </div>
              <div style={{ height: '300px', width: '100%', padding: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={disqualifyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="reason" type="category" width={120} tick={{ fontSize: 12, fontWeight: 500 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                      {disqualifyData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Screenings Trend (Hemoglobin) */}
            <div className="modern-influencer-widget">
              <div className="widget-header">
                <h3 className="widget-title">
                  <FiActivity style={{ color: '#10b981' }} />
                  Hemoglobin Levels (Recent Samples)
                </h3>
              </div>
              <div style={{ height: '300px', width: '100%', padding: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={screenings.slice(0, 20).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="screening_date" tick={false} />
                    <YAxis domain={[10, 20]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line type="monotone" dataKey="hemoglobin_level" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Screening Log */}
          <div className="modern-influencer-widget">
            <div className="widget-header">
              <h3 className="widget-title">
                <FiClipboard style={{ color: '#314ca0' }} />
                Clinical Screening Log
              </h3>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Showing last 15 records
              </div>
            </div>
            <div className="modern-table-container">
              <table className="modern-influencer-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Date</th>
                    <th>Hemoglobin</th>
                    <th>BP (Sys/Dia)</th>
                    <th>Weight</th>
                    <th>Pulse</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {screenings.slice(0, 15).map((s, idx) => (
                    <tr key={s.screening_id} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.name || s.donor_id.slice(0, 8)}</div>
                      </td>
                      <td>{new Date(s.screening_date).toLocaleDateString()}</td>
                      <td>{s.hemoglobin_level} g/dL</td>
                      <td>{s.systolic_bp}/{s.diastolic_bp}</td>
                      <td>{s.weight_kg} kg</td>
                      <td>{s.pulse_bpm} bpm</td>
                      <td>
                        <span className="score-badge" style={{
                          background: s.questionnaire_passed ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #E53E3E, #c53030)',
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {s.questionnaire_passed ? <FiCheckCircle size={12} /> : <FiActivity size={12} />}
                          {s.questionnaire_passed ? 'PASSED' : s.disqualified_reason_code || 'FAILED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

