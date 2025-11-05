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
    <div className="dashboard-tile light-tile">
      <h3>🏆 Top Influencers</h3>

      {loading ? (
        <p>⏳ Loading...</p>
      ) : !pageRows.length ? (
        <p>No influencers found.</p>
      ) : (
        <>
          <table className="conversion-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Total Score</th>
                <th># Donors Linked</th>
                <th>Interests</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(row => (
                <tr key={row.influencer_id}>
                  <td>{row.name || row.influencer_id?.slice(0, 8)}</td>
                  <td>{row.total_score}</td>
                  <td>{row.linkedDonors}</td>
                  <td>{(row.interests || []).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {!!allRows.length && (
            <>
              <div style={{ marginTop: '1rem' }}>
                Page {currentPage + 1} of {Math.ceil(allRows.length / PAGE_SIZE)}
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                {/* Prev Button */}
                <button disabled={currentPage === 0}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}>
                  ⬅ Prev
                </button>

                {' '}

                {/* Next Button */}
                <button disabled={(currentPage + 1) * PAGE_SIZE >= allRows.length}
                  onClick={() => setCurrentPage(p => p + 1)}>
                  Next ➡
                </button>

                {' '}<span style={{ marginLeft: '20px' }}>
                  Total Results: {allRows.length}
                </span>
              </div>

              {/* Export Button */}
              {!!allRows.length && (
                <>
                  {' '}
                  |
                  {' '}
                  ⬇{' '}
                  <button className="export-btn" onClick={exportAllScores}>
                    Export All (.xlsx)
                  </button>
                </>
              )}
            </>
          )}
        </>
      )
      }
    </div >
  );
}

