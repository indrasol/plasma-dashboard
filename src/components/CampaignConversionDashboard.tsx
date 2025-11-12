import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import LineChartProgressive from './LineChartProgressive';
import ModernDropdown from './ModernDropdown';

interface CampaignConversionDetail {
  engagement_id?: string;
  full_name: string | null;
  email: string | null;
  campaign_name: string | null;
  channel: string | null;
  elasticity_segment: string | null;
  donation_type: string | null;
  days_since_last_donation: number | null;
  engagement_timestamp: string | null;
  converted: boolean;
}

interface PieChartData {
  name: string;
  count: number;
}

interface DailyConversionRecord {
  date: string;
  campaign_name: string;
  converted_count: number;
}

interface CumulativePoint {
  month: string;
  [campaign: string]: string | number;
}

export default function CampaignConversionDashboard() {
  const [data, setData] = useState<CampaignConversionDetail[]>([]);
  const [filteredData, setFilteredData] = useState<CampaignConversionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filters
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const [selectedCampaignName, setSelectedCampaignName] = useState('');
  const [selectedChannelType, setSelectedChannelType] = useState('');
  const [selectedDonorType, setSelectedDonorType] = useState('');
  const [selectedDonationType, setSelectedDonationType] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: rows, error } =
          await supabase.from('campaign_conversion_details').select('*');

        if (error) throw error;

        setData((rows as CampaignConversionDetail[]) || []);
      } catch (err) {
        console.error("❌ Error loading data:", err);
        setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...data];

    if (selectedCampaignName)
      filtered = filtered.filter(r => r.campaign_name === selectedCampaignName);

    if (selectedChannelType)
      filtered = filtered.filter(r => r.channel === selectedChannelType);

    if (selectedDonorType)
      filtered = filtered.filter(r => r.elasticity_segment === selectedDonorType);

    if (selectedDonationType)
      filtered = filtered.filter(r => r.donation_type === selectedDonationType);

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    data,
    selectedCampaignName,
    selectedChannelType,
    selectedDonorType,
    selectedDonationType
  ]);

  function exportToExcel() {
    if (!filteredData.length) return alert("Nothing to export.");

    const sheetRows = filteredData.map(d => ({
      "Name": d.full_name ?? '',
      "Email": d.email ?? '',
      "Campaign": d.campaign_name ?? '',
      "Channel": d.channel ?? '',
      "Donor Type": d.elasticity_segment ?? '',
      "Donation Type": d.donation_type ?? '',
      "Days Since Last Donation": d.days_since_last_donation ?? '',
      "Engaged At": d.engagement_timestamp ?? '',
      "Converted": !!d.converted ? "✅" : "_"
    }));

    const ws = XLSX.utils.json_to_sheet(sheetRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Conversion Details");

    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, 'conversion_export_' + stamp + '.xlsx');
  }

  // DONUT CHART DATA: Group conversions by channel
  const pieChartDataGroupedByChannel: PieChartData[] =
    Object.values(filteredData.reduce((acc: Record<string, PieChartData>, row) => {
      const key = row.channel || 'Unknown';
      if (!acc[key]) acc[key] = { name: key, count: 0 };
      if (row.converted) acc[key].count++;
      return acc;
    }, {}));

  // LINE CHART DATA — CUMULATIVE CONVERSIONS BY CAMPAIGN OVER TIME
  const groupedByDateAndCampaignMap: Record<string, DailyConversionRecord> = {};

  filteredData.forEach(row => {
    if (!row.converted || !row.engagement_timestamp) return;

    const dateStr = row.engagement_timestamp.slice(0, 10); // YYYY-MM-DD only
    const key = `${dateStr}_${row.campaign_name}`;

    if (!groupedByDateAndCampaignMap[key]) {
      groupedByDateAndCampaignMap[key] =
        { date: dateStr, campaign_name: row.campaign_name || '', converted_count: 0 };
    }
    
    groupedByDateAndCampaignMap[key].converted_count += 1;
  });

  const dailyRecordsSorted =
    Object.values(groupedByDateAndCampaignMap).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const campaignsActive =
    [...new Set(dailyRecordsSorted.map(r => r.campaign_name))];

  // Build cumulative series per campaign:
  const cumulativeSeriesMap: Record<string, Array<{ date: string; [key: string]: string | number }>> = {};

  campaignsActive.forEach(camp => {
    let total = 0;
    const records = dailyRecordsSorted.filter(r => r.campaign_name === camp);

    cumulativeSeriesMap[camp] = records.map(r => {
      total += r.converted_count;
      return { date: r.date, [camp]: total };
    });
  });

  // Merge into single array:
  const mergedTimeline: Record<string, CumulativePoint> = {};
  Object.entries(cumulativeSeriesMap).forEach(([camp, array]) => {
    array.forEach(entry => {
      if (!mergedTimeline[entry.date])
        mergedTimeline[entry.date] = { month: entry.date };

      mergedTimeline[entry.date][camp] = entry[camp] as number;
    });
  });

  const finalCumulativeArray = Object.values(mergedTimeline).sort((a, b) =>
    new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  // Unique options for filters
  const uniqueCampaigns = [...new Set(data.map(d => d.campaign_name || ''))].filter(Boolean);
  const uniqueChannels = [...new Set(data.map(d => d.channel || ''))].filter(Boolean);
  const uniqueDonationTypes = [...new Set(data.map(d => d.donation_type || ''))].filter(Boolean);

  return (
    <div className="section" style={{ marginTop: '48px' }}>
      <h1 className="dashboard-title">
        Campaign Conversion Dashboard
      </h1>

      {/* Modern Filter Widget */}
      <div className="modern-influencer-widget" style={{ marginBottom: '32px' }}>
        <div className="widget-header">
          <h3 className="widget-title">
            <span className="title-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
            </span>
            Filter Options
          </h3>
        </div>

        <div className="modern-filters-container">
          <div className="modern-filters-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {/* Campaign Dropdown */}
            <ModernDropdown
              label="Campaign"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              }
              value={selectedCampaignName}
              options={uniqueCampaigns}
              placeholder="All Campaigns"
              onChange={setSelectedCampaignName}
            />

            {/* Channel Dropdown */}
            <ModernDropdown
              label="Channel"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                  <polyline points="17 2 12 7 7 2"/>
                </svg>
              }
              value={selectedChannelType}
              options={uniqueChannels}
              placeholder="All Channels"
              onChange={setSelectedChannelType}
            />

            {/* Donor Type Dropdown */}
            <ModernDropdown
              label="Donor Type"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              }
              value={selectedDonorType}
              options={['elastic', 'inelastic']}
              placeholder="All Types"
              onChange={setSelectedDonorType}
              formatOption={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
            />

            {/* Donation Type Dropdown */}
            <ModernDropdown
              label="Donation Type"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              }
              value={selectedDonationType}
              options={uniqueDonationTypes}
              placeholder="All Donation Types"
              onChange={setSelectedDonationType}
            />
          </div>
        </div>
      </div>

      {/* Conversions by Channel Widget */}
      <div className="modern-influencer-widget" style={{ marginBottom: '32px' }}>
        <div className="widget-header">
          <h3 className="widget-title">
            <span className="title-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </span>
            Conversions by Channel
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              dataKey="count"
              nameKey="name"
              data={pieChartDataGroupedByChannel}
              cx="50%" cy="50%"
              label={({ name }) => name}
              isAnimationActive
              startAngle={90}
              endAngle={450}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8">
              {pieChartDataGroupedByChannel.map((_entry, index) => (
                <Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                background: 'white',
                border: '2px solid #314ca0',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(49, 76, 160, 0.2)',
                color: '#1e293b',
                fontWeight: 600
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontWeight: 600,
                color: '#1e293b'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative Conversions Widget */}
      <div className="modern-influencer-widget" style={{ marginBottom: '32px' }}>
        <div className="widget-header">
          <h3 className="widget-title">
            <span className="title-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </span>
            Cumulative Conversions Over Time
          </h3>
        </div>
        <LineChartProgressive data={finalCumulativeArray} />
      </div>

      {/* Conversion Details Table Widget */}
      <div className="modern-influencer-widget">
        <div className="widget-header">
          <h3 className="widget-title">
            <span className="title-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </span>
            Conversion Details
          </h3>
          <button 
            onClick={() => exportToExcel()} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#fff',
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export to Excel
      </button>
        </div>

        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 32px',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(49, 76, 160, 0.1)',
              borderTop: '4px solid #314ca0',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              fontWeight: 500,
              margin: 0
            }}>
              Loading conversion data...
            </p>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        ) : errorMsg ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <p style={{ color: '#E53E3E' }}>{errorMsg}</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No conversion records found with current filters.</p>
          </div>
        ) : (
          <>
            <div className="modern-table-container">
              <table className='modern-influencer-table'>
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
                          <rect x="2" y="4" width="20" height="16" rx="2"/>
                          <path d="M6 8l6 4 6-4"/>
                        </svg>
                      </span>
                      Email
                    </th>
                    <th>
                      <span className="th-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                      </span>
                      Engaged At
                    </th>
                    <th>
                      <span className="th-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                      Converted?
                    </th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((r, i) => (
                    <tr key={`${r.engagement_id}-${i}`} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                      <td>
                        <div className="name-cell">
                          <div className="influencer-avatar">
                            {(r.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="influencer-name" style={{ fontSize: '14px' }}>
                            {r.full_name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#1e293b', fontWeight: 500, fontSize: '14px' }}>
                          {r.email || '-'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#64748b', fontWeight: 500, fontSize: '13px' }}>
                          {(r.engagement_timestamp || '').slice(0, -3) || '-'}
                        </span>
                      </td>
                      <td>
                        {r.converted ? (
                          <span className="score-badge" style={{ 
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            fontSize: '13px'
                          }}>
                            ✅ Yes
                          </span>
                        ) : (
                          <span style={{ 
                            color: '#94a3b8',
                            fontWeight: 600,
                            fontSize: '13px'
                          }}>
                            — No
                          </span>
                        )}
                      </td>
            </tr>
          ))}
        </tbody>
      </table>
            </div>

            {/* Pagination */}
      {totalPages > 1 && (
              <div style={{ 
                marginTop: '24px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '16px' 
              }}>
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(current => Math.max(current - 1, 1))}
                  style={{
                    padding: '10px 20px',
                    background: currentPage === 1 ? '#e2e8f0' : 'linear-gradient(135deg, #314ca0, #1e3a8a)',
                    color: currentPage === 1 ? '#94a3b8' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '14px'
                  }}
                >
                  ◀ Previous
                </button>

                <span style={{ 
                  minWidth: '120px', 
                  textAlign: 'center',
                  color: '#1e293b',
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
            Page {currentPage} of {totalPages}
          </span>

                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(current => Math.min(current + 1, totalPages))}
                  style={{
                    padding: '10px 20px',
                    background: currentPage === totalPages ? '#e2e8f0' : 'linear-gradient(135deg, #314ca0, #1e3a8a)',
                    color: currentPage === totalPages ? '#94a3b8' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '14px'
                  }}
                >
                  Next ▶
                </button>
        </div>
      )}
          </>
        )}
      </div>
    </div>
  );
}

