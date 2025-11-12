import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { utils, writeFileXLSX } from 'xlsx';

interface TopInfluencersTableProps {
  selectedCategory: string;
  selectedInterestName: string;
}

interface InfluencerScore {
  influencer_id: string;
  name: string | null;
  total_score: number;
}

interface EnrichedInfluencer extends InfluencerScore {
  linkedDonors: number;
  interests: string[];
}

interface DonorInfluencerLink {
  influencer_id: string;
  donor_id: string;
}

interface DonorInterest {
  donor_id: string;
}

export default function TopInfluencersTable({ selectedCategory, selectedInterestName }: TopInfluencersTableProps) {
  const [allRows, setAllRows] = useState<EnrichedInfluencer[]>([]);
  const [pageRows, setPageRows] = useState<EnrichedInfluencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const PAGE_SIZE = 10;

  // Load data on mount or when filters change
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Step 1: Pull influencer scores
        const { data: scoresRaw } = await supabase
          .from('influencer_scores')
          .select('*')
          .order('total_score', { ascending: false });

        // Step 2: Pull donor-influencer links w/ interest metadata
        const { data: linksRaw } = await supabase
          .from('donor_influencer_links')
          .select('influencer_id, donor_id');

        const typedScores = (scoresRaw as InfluencerScore[]) || [];
        const typedLinks = (linksRaw as DonorInfluencerLink[]) || [];

        if (!typedLinks.length || !typedScores.length) {
          setAllRows([]);
          return;
        }

        // Step 3: Apply interest filters via donor_interests → get matching donor_ids
        let donorInterestQuery = supabase.from("donor_interests").select("donor_id");

        if (selectedCategory) {
          donorInterestQuery = donorInterestQuery.ilike("interest_category", `%${selectedCategory}%`);
        }

        if (selectedInterestName) {
          donorInterestQuery = donorInterestQuery.ilike("interest_name", `%${selectedInterestName}%`);
        }

        const { data: filteredDonors } = await donorInterestQuery;
        const typedDonorInterests = (filteredDonors as DonorInterest[]) || [];
        const validDonorIdsSet = new Set(typedDonorInterests.map(d => d.donor_id));

        // Step 4: Build influencer aggregation maps based on filtered donors
        const countsMap: Record<string, number> = {};
        const interestsMap: Record<string, Set<string>> = {};

        for (const link of typedLinks) {
          if (!validDonorIdsSet.has(link.donor_id)) continue;

          countsMap[link.influencer_id] =
            (countsMap[link.influencer_id] || 0) + 1;

          if (!interestsMap[link.influencer_id]) interestsMap[link.influencer_id] = new Set();
          
          // Optional enrichment later...
          interestsMap[link.influencer_id].add(selectedCategory || selectedInterestName);
        }

        // Step 5: Enrich influencer scores with linkedDonors + interests arrays
        let enrichedRows: EnrichedInfluencer[] =
          typedScores.map((row) => ({
            ...row,
            linkedDonors: countsMap[row.influencer_id] || 0,
            interests: Array.from(interestsMap[row.influencer_id] || []),
          }));

        // Filter out influencers with zero linked donors after applying filters
        enrichedRows = enrichedRows.filter(r => r.linkedDonors > 0);

        setAllRows(enrichedRows);
      } catch (err) {
        console.error("❌ Error loading influencer data:", err);
        setAllRows([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    setCurrentPage(0); // Reset page when filters change
  }, [selectedCategory, selectedInterestName]);

  useEffect(() => {
    const startIdx = currentPage * PAGE_SIZE;
    setPageRows(allRows.slice(startIdx, startIdx + PAGE_SIZE));
  }, [currentPage, allRows]);

  function exportAllScores() {
    if (!allRows.length) return;

    const formatted = allRows.map(row => ({
      Name: row.name || row.influencer_id?.slice(0, 8),
      Score: row.total_score,
      LinkedDonors: row.linkedDonors,
      Interests: (row.interests || []).join(', ')
    }));

    const sheet = utils.json_to_sheet(formatted);
    const book = utils.book_new();
    utils.book_append_sheet(book, sheet, "Top Influencers");
    writeFileXLSX(book, "top_influencers_filtered.xlsx");
  }

  return (
    <div className="modern-influencer-widget">
      <div className="widget-header">
        <h3 className="widget-title">
          <span className="title-icon">🏆</span>
          Top Influencers
        </h3>
        {!!allRows.length && (
          <button className="modern-export-btn" onClick={exportAllScores}>
            <span className="btn-icon">⬇</span>
            Export (.xlsx)
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Loading influencers...</p>
        </div>
      ) : !pageRows.length ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No influencers found with current filters.</p>
        </div>
      ) : (
        <>
          <div className="modern-table-container">
            <table className="modern-influencer-table">
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
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </span>
                    Total Score
                  </th>
                  <th>
                    <span className="th-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                    </span>
                    Donors Linked
                  </th>
                  <th>
                    <span className="th-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                        <line x1="7" y1="7" x2="7.01" y2="7"/>
                      </svg>
                    </span>
                    Interests
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr key={row.influencer_id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                    <td className="name-cell">
                      <div className="influencer-avatar">
                        {(row.name || row.influencer_id?.slice(0, 1) || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="influencer-name">
                        {row.name || `ID: ${row.influencer_id?.slice(0, 8)}`}
                      </span>
                    </td>
                    <td className="score-cell">
                      <span className="score-badge">{row.total_score}</span>
                    </td>
                    <td className="donors-cell">
                      <span className="donors-count">{row.linkedDonors}</span>
                    </td>
                    <td className="interests-cell">
                      <div className="interests-tags">
                        {(row.interests || []).length > 0 ? (
                          (row.interests || []).map((interest, i) => (
                            <span key={i} className="interest-tag">{interest}</span>
                          ))
                        ) : (
                          <span className="no-interests">No specific interests</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modern Pagination Controls */}
          {!!allRows.length && (
            <div className="modern-pagination">
              <div className="pagination-info">
                <span className="page-indicator">
                  Page {currentPage + 1} of {Math.ceil(allRows.length / PAGE_SIZE)}
                </span>
                <span className="total-results">
                  Total: {allRows.length} influencers
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
                  disabled={(currentPage + 1) * PAGE_SIZE >= allRows.length}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                  <span className="btn-icon">➡</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

