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
  const [selectedCampaignName, setSelectedCampaignName] = useState('Campaign1');
  const [selectedChannelType, setSelectedChannelType] = useState('All');
  const [selectedDonorType, setSelectedDonorType] = useState('All');
  const [selectedDonationType, setSelectedDonationType] = useState('All');

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

    if (selectedCampaignName !== 'All')
      filtered = filtered.filter(r => r.campaign_name === selectedCampaignName);

    if (selectedChannelType !== 'All')
      filtered = filtered.filter(r => r.channel === selectedChannelType);

    if (selectedDonorType !== 'All')
      filtered = filtered.filter(r => r.elasticity_segment === selectedDonorType);

    if (selectedDonationType !== 'All')
      filtered = filtered.filter(r => r.donation_type === selectedDonationType);

    setFilteredData(filtered);
    
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

  return (
    <div className="dashboard-tile light-tile" style={{ marginTop: '2rem' }}>
      <h3>📊 Campaign Conversion Dashboard</h3>

      {/* FILTERS */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '30px',
        backgroundColor: '#f4f4f4',
        padding: '12px',
        borderRadius: '6px'
      }}>
        <label>
          <strong>📣 Campaign:</strong><br />
          <select value={selectedCampaignName} onChange={(e) => setSelectedCampaignName(e.target.value)}>
            <option>All</option>
            {[...new Set(data.map(d => d.campaign_name))].map(name =>
              <option key={name || 'unknown'}>{name}</option>)}
          </select>
        </label>

        <label>
          <strong>📡 Channel:</strong><br />
          <select value={selectedChannelType} onChange={(e) => setSelectedChannelType(e.target.value)}>
            <option>All</option>
            {[...new Set(data.map(d => d.channel))].filter(Boolean).map(c =>
              <option key={c}>{c}</option>)}
          </select>
        </label>

        <label>
          <strong>🧠 Donor Type:</strong><br />
          <select value={selectedDonorType} onChange={(e) => setSelectedDonorType(e.target.value)}>
            <option>All</option>
            {['elastic', 'inelastic'].map(type =>
              <option key={type}>{type}</option>)}
          </select>
        </label>

        <label>
          <strong>🩸 Donation Type:</strong><br />
          <select value={selectedDonationType} onChange={(e) => setSelectedDonationType(e.target.value)}>
            <option>All</option>
            {[...new Set(data.map(d => d.donation_type))].filter(Boolean).map(t =>
              <option key={t}>{t}</option>)}
          </select>
        </label>

      </div>

      {/* DONUT CHART */}
      <div style={{ marginBottom: "40px" }}>
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
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* PROGRESSIVE LINE CHART – CUMULATIVE CONVERSIONS */}
      <div style={{ marginBottom: "40px" }}>
        <LineChartProgressive data={finalCumulativeArray} />
      </div>

      {/* EXPORT BUTTON */}
      <button onClick={() => exportToExcel()} style={{
        marginBottom: '20px',
        background: '#008CBA',
        color: '#fff',
        padding: '10px',
        borderRadius: '5px'
      }}>⬇ Export Donors CSV
      </button>

      {/* TABLE */}
      <table className='conversion-table'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Engaged At</th>
            <th>Converted?</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((r, i) => (
            <tr key={`${r.engagement_id}-${i}`}>
              <td>{r.full_name}</td>
              <td>{r.email}</td>
              <td>{(r.engagement_timestamp || '').slice(0, -3)}</td>
              <td>{r.converted ? "✅ Yes" : "— No"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: "16px" }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(current => Math.max(current - 1, 1))}>◀ Prev </button>

          <span style={{ minWidth: "90px", textAlign: 'center' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(current => Math.min(current + 1, totalPages))}>Next ▶ </button>
        </div>
      )}

      {/* STATUS MESSAGES */}
      {!loading && !filteredData.length &&
        <p>No matching records found.</p>}
      {loading && <p>⏳ Loading...</p>}
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </div>
  );
}

