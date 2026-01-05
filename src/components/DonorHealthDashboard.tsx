import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
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
      <h1 className="dashboard-title">Donor Health & Clinical Analytics</h1>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Analyzing clinical data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="dashboard-tiles" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '32px' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>📈</div>
              <div className="stat-content">
                <div className="stat-label">Avg Hemoglobin</div>
                <div className="stat-value">{stats?.avg_hemoglobin} g/dL</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(49, 76, 160, 0.1)', color: '#314ca0' }}>💓</div>
              <div className="stat-content">
                <div className="stat-label">Avg Blood Pressure</div>
                <div className="stat-value">{stats?.avg_systolic}/{stats?.avg_diastolic}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#E53E3E' }}>✅</div>
              <div className="stat-content">
                <div className="stat-label">Pass Rate</div>
                <div className="stat-value">{stats?.pass_rate}%</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>📋</div>
              <div className="stat-content">
                <div className="stat-label">Total Screenings</div>
                <div className="stat-value">{stats?.total_screenings.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px', marginBottom: '32px' }}>
            {/* Disqualification Reasons */}
            <div className="modern-influencer-widget">
              <div className="widget-header">
                <h3 className="widget-title">Disqualification Reasons</h3>
              </div>
              <div style={{ height: '300px', width: '100%', padding: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={disqualifyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="reason" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
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
                <h3 className="widget-title">Hemoglobin Levels (Recent Samples)</h3>
              </div>
              <div style={{ height: '300px', width: '100%', padding: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={screenings.slice(0, 20).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="screening_date" tick={false} />
                    <YAxis domain={[10, 20]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="hemoglobin_level" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Screening Log */}
          <div className="modern-influencer-widget">
            <div className="widget-header">
              <h3 className="widget-title">Clinical Screening Log</h3>
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
                          fontSize: '11px'
                        }}>
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

