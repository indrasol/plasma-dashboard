import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/apiEndpoints';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { utils, writeFileXLSX } from 'xlsx';
import ModernDropdown from './ModernDropdown';
import LookalikeDashboard from './LookalikeDashboard';
import DonorElasticityDashboard from './DonorElasticityDashboard';
import type { Donor } from '../types/database.types';

interface LoyaltyCount {
  tier: string;
  count: number;
}

type SortField = 'donor_id' | 'gender' | 'loyalty_tier' | 'donation_frequency_bucket';
type SortDirection = 'asc' | 'desc';

export default function DonorPanel() {
  const location = useLocation();
  const currentPath = location.pathname;

  const [donorsData, setDonorsData] = useState<Donor[]>([]);
  const [filteredData, setFilteredData] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loyaltyCounts, setLoyaltyCounts] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>('donor_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [loyaltyFilter, setLoyaltyFilter] = useState<string>('');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('');

  const donorsPerPage = 10;
  const indexOfLastDonor = (currentPage + 1) * donorsPerPage;
  const indexOfFirstDonor = indexOfLastDonor - donorsPerPage;
  const currentDonors = filteredData.slice(indexOfFirstDonor, indexOfLastDonor);
  const totalPages = Math.ceil(filteredData.length / donorsPerPage);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔍 Fetching donor list from:", API_ENDPOINTS.donorList);
        const response = await fetch(API_ENDPOINTS.donorList);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const typedDonors = await response.json() as Donor[];
        
        setDonorsData(typedDonors || []);

        // Count by Loyalty Tier for Chart
        const counts: Record<string, number> = {};
        (typedDonors || []).forEach(d => {
          // Normalize tier name - handle both 'Gold' and 'gold' etc.
          let tier = d.loyalty_tier || "Unknown";
          if (typeof tier === 'string') {
            tier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
          }
          counts[tier] = (counts[tier] || 0) + 1;
        });

        setLoyaltyCounts(counts);
      } catch (err) {
        console.error("❌ Error loading donor segments:", err);
        // Fallback to static data if API fails
        fetch('/data/donors_rows.csv')
          .then(res => res.text())
          .then(csvText => {
            // Very simple CSV parser for fallback
            const lines = csvText.split('\n');
            const headers = lines[0].split(',');
            const rows = lines.slice(1).map(line => {
              const values = line.split(',');
              const obj: any = {};
              headers.forEach((h, i) => obj[h.trim()] = values[i]);
              return obj;
            }).filter(r => r.donor_id);
            setDonorsData(rows);
            
            const counts: Record<string, number> = {};
            rows.forEach(d => {
              let tier = d.loyalty_tier || "Unknown";
              if (typeof tier === 'string') {
                tier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
              }
              counts[tier] = (counts[tier] || 0) + 1;
            });
            setLoyaltyCounts(counts);
          })
          .catch(e => console.error("❌ Fallback also failed:", e));
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  // Apply filtering and sorting whenever filters, sorting, or data changes
  useEffect(() => {
    let result = [...donorsData];

    // Apply filters
    if (genderFilter) {
      result = result.filter(d => d.gender === genderFilter);
    }
    if (loyaltyFilter) {
      result = result.filter(d => d.loyalty_tier === loyaltyFilter);
    }
    if (frequencyFilter) {
      result = result.filter(d => d.donation_frequency_bucket === frequencyFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredData(result);
    setCurrentPage(0); // Reset to first page when filters change
  }, [donorsData, genderFilter, loyaltyFilter, frequencyFilter, sortField, sortDirection]);

  // Convert loyalty counts to array format for Recharts
  const loyaltyChartData: LoyaltyCount[] =
    Object.entries(loyaltyCounts).map(([tier, count]) => ({ tier, count }));

  // Colors for bar chart - alternating theme colors
  const BAR_COLORS = ['#314ca0', '#E53E3E', '#2a4085', '#c53030'];

  // Get unique values for filters
  const uniqueGenders = Array.from(new Set(donorsData.map(d => d.gender).filter(Boolean)));
  const uniqueLoyaltyTiers = Array.from(new Set(donorsData.map(d => d.loyalty_tier).filter(Boolean)));
  const uniqueFrequencies = Array.from(new Set(donorsData.map(d => d.donation_frequency_bucket).filter(Boolean)));

  // Export function
  function exportDonorsData() {
    if (!filteredData.length) return;

    const formatted = filteredData.map(donor => ({
      DonorID: donor.donor_id,
      Gender: donor.gender || 'N/A',
      LoyaltyTier: donor.loyalty_tier || 'N/A',
      FrequencyBucket: donor.donation_frequency_bucket || 'N/A'
    }));

    const sheet = utils.json_to_sheet(formatted);
    const book = utils.book_new();
    utils.book_append_sheet(book, sheet, "Donor Segments");
    writeFileXLSX(book, "donor_segments.xlsx");
  }

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort indicator
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Determine what to show
  const showSegments = currentPath === '/donors/segments' || currentPath === '/donors';
  const showLookalike = currentPath === '/donors/lookalike' || currentPath === '/donors';
  const showElasticity = currentPath === '/donors/elasticity' || currentPath === '/donors';

  return (
    <div className="section">
      <h1 className="dashboard-title">
        {showSegments && !showLookalike && !showElasticity ? "Donor Segments" : 
         showLookalike && !showSegments && !showElasticity ? "Lookalike Donor Analytics" :
         showElasticity && !showSegments && !showLookalike ? "Donor Elasticity" :
         "Donor Overview"}
      </h1>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Loading donor data...</p>
        </div>
      ) : (
        <>
          {showSegments && (
            <>
              {/* Modern Bar Chart Widget */}
              <div className="modern-influencer-widget" style={{ marginBottom: '32px' }}>
                <div className="widget-header">
                  <h3 className="widget-title">
                    <span className="title-icon">🏆</span>
                    Loyalty Tier Distribution
                  </h3>
                </div>

              {loyaltyChartData.length > 0 ? (
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={loyaltyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(49, 76, 160, 0.1)" />
                        <XAxis 
                          dataKey="tier" 
                          tick={{ fill: '#1e293b', fontWeight: 600 }}
                          axisLine={{ stroke: '#314ca0' }}
                        />
                        <YAxis 
                          tick={{ fill: '#1e293b', fontWeight: 600 }}
                          axisLine={{ stroke: '#314ca0' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            background: 'white',
                            border: '2px solid #314ca0',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(49, 76, 160, 0.2)'
                          }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {loyaltyChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                          ))}
                        </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📈</div>
                <p>No loyalty segmentation data found.</p>
                  </div>
              )}
              </div>

              {/* Modern Donor Table Widget */}
              <div className="modern-influencer-widget" style={{ marginBottom: '32px' }}>
                <div className="widget-header">
                  <h3 className="widget-title">
                    <span className="title-icon">🩸</span>
                    Donor Records
                  </h3>
                  {!!filteredData.length && (
                    <button className="modern-export-btn" onClick={exportDonorsData}>
                      <span className="btn-icon">⬇</span>
                      Export (.xlsx)
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="modern-filters-container" style={{ marginBottom: '24px' }}>
                  <div className="modern-filters-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {/* Gender Dropdown */}
                    <ModernDropdown
                      label="Gender"
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                          <circle cx="12" cy="8" r="7"/>
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                        </svg>
                      }
                      value={genderFilter}
                      options={uniqueGenders}
                      placeholder="All Genders"
                      onChange={setGenderFilter}
                    />

                    {/* Loyalty Tier Dropdown */}
                    <ModernDropdown
                      label="Loyalty Tier"
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      }
                      value={loyaltyFilter}
                      options={uniqueLoyaltyTiers}
                      placeholder="All Tiers"
                      onChange={setLoyaltyFilter}
                    />

                    {/* Frequency Dropdown */}
                    <ModernDropdown
                      label="Frequency"
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                      }
                      value={frequencyFilter}
                      options={uniqueFrequencies}
                      placeholder="All Frequencies"
                      onChange={setFrequencyFilter}
                    />
                  </div>

                  {/* Active Filter Status */}
                  {(genderFilter || loyaltyFilter || frequencyFilter) && (
                    <div className="filter-status">
                      <span className="status-icon">🔍</span>
                      <span className="status-text">Active Filters:</span>
                      {genderFilter && <span className="filter-tag">{genderFilter}</span>}
                      {loyaltyFilter && <span className="filter-tag">{loyaltyFilter}</span>}
                      {frequencyFilter && <span className="filter-tag">{frequencyFilter}</span>}
                      <button
                        onClick={() => {
                          setGenderFilter('');
                          setLoyaltyFilter('');
                          setFrequencyFilter('');
                        }}
                        style={{
                          marginLeft: 'auto',
                          padding: '6px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#E53E3E',
                          color: 'white',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                {/* Table */}
              {currentDonors.length > 0 ? (
                <>
                    <div className="modern-table-container">
                      <table className="modern-influencer-table">
                    <thead>
                      <tr>
                            <th onClick={() => handleSort('donor_id')} style={{ cursor: 'pointer' }}>
                              <span className="th-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                  <circle cx="8.5" cy="7" r="4"/>
                                  <line x1="20" y1="8" x2="20" y2="14"/>
                                  <polyline points="23 11 20 14 17 11"/>
                                </svg>
                              </span>
                              Donor ID {getSortIndicator('donor_id')}
                            </th>
                            <th onClick={() => handleSort('gender')} style={{ cursor: 'pointer' }}>
                              <span className="th-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                  <circle cx="12" cy="8" r="7"/>
                                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                                </svg>
                              </span>
                              Gender {getSortIndicator('gender')}
                            </th>
                            <th onClick={() => handleSort('loyalty_tier')} style={{ cursor: 'pointer' }}>
                              <span className="th-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              </span>
                              Loyalty Tier {getSortIndicator('loyalty_tier')}
                            </th>
                            <th onClick={() => handleSort('donation_frequency_bucket')} style={{ cursor: 'pointer' }}>
                              <span className="th-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                  <line x1="12" y1="1" x2="12" y2="23"/>
                                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                </svg>
                              </span>
                              Frequency {getSortIndicator('donation_frequency_bucket')}
                            </th>
                      </tr>
                    </thead>
                    <tbody>
                          {currentDonors.map((d, index) => (
                            <tr key={d.donor_id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                              <td>
                                <div className="name-cell">
                                  <div className="influencer-avatar">
                                    {d.donor_id.slice(0, 1).toUpperCase()}
                                  </div>
                                  <span className="influencer-name" style={{ fontSize: '14px' }}>
                                    {d.donor_id.slice(0, 12)}...
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span style={{ 
                                  color: '#1e293b', 
                                  fontWeight: 600,
                                  fontSize: '14px'
                                }}>
                                  {d.gender || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <span className="score-badge" style={{
                                  background: d.loyalty_tier === 'Gold' 
                                    ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                                    : d.loyalty_tier === 'Silver'
                                    ? 'linear-gradient(135deg, #C0C0C0, #808080)'
                                    : 'linear-gradient(135deg, #314ca0, #2a4085)',
                                  fontSize: '13px'
                                }}>
                                  {d.loyalty_tier || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <span className="donors-count" style={{ fontSize: '13px' }}>
                                  {d.donation_frequency_bucket || 'N/A'}
                                </span>
                              </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    </div>

                    {/* Modern Pagination */}
                  {totalPages > 1 && (
                      <div className="modern-pagination">
                        <div className="pagination-info">
                          <span className="page-indicator">
                            Page {currentPage + 1} of {totalPages}
                          </span>
                          <span className="total-results">
                            Total: {filteredData.length} donors
                          </span>
                        </div>

                        <div className="pagination-controls">
                      <button 
                            className="pagination-btn prev-btn"
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
                          >
                            <span className="btn-icon">⬅</span>
                            Previous
                      </button>

                      <button 
                            className="pagination-btn next-btn"
                            disabled={(currentPage + 1) >= totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                          >
                            Next
                            <span className="btn-icon">➡</span>
                      </button>
                        </div>
                    </div>
                  )}
                </>
              ) : (
                  <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <p>No donor records found with current filters.</p>
                  </div>
              )}
              </div>
            </>
          )}

          {/* Embedded Dashboards */}
          {showLookalike && !loading && (<LookalikeDashboard />)}
          {showElasticity && !loading && (<DonorElasticityDashboard />)}
        </>
      )}
    </div>
  );
}

