import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { utils, writeFileXLSX } from 'xlsx';

interface LookalikeMatch {
  id: string;
  seed_fname: string | null;
  seed_lname: string | null;
  match_fname: string | null;
  match_lname: string | null;
  similarity_score: number;
}

export default function InfluencerLookalikeTable() {
  const [rows, setRows] = useState<LookalikeMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInfluencer, setSelectedInfluencer] = useState('');
  const [uniqueSeedNames, setUniqueSeedNames] = useState<string[]>([]);

  useEffect(() => {
    async function fetchMatches() {
      const { data, error } = await supabase
        .from('influencer_lookalike_matches')
        .select(`
          *,
          donors!seed_influencer_id ( first_name as seed_fname, last_name as seed_lname ),
          donors!matched_donor_id ( first_name as match_fname, last_name as match_lname )
        `)
        .order('similarity_score', { ascending: false });

      if (error) {
        console.error("❌ Fetch error:", error);
      } else {
        const typedData = (data as LookalikeMatch[]) || [];
        setRows(typedData);

        // Extract unique names for dropdown filter
        const names = [...new Set(typedData.map(row =>
          `${row.seed_fname ?? ''} ${row.seed_lname ?? ''}`.trim()
        ))];
        setUniqueSeedNames(names);
      }

      setLoading(false);
    }

    fetchMatches();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedInfluencer(e.target.value);
  }

  function exportCSV() {
    if (!rows.length) return;

    // Filter rows based on current selection
    const filteredRows = rows.filter(row =>
      !selectedInfluencer ||
      `${row.seed_fname ?? ''} ${row.seed_lname ?? ''}` === selectedInfluencer
    );

    const formatted = filteredRows.map(row => ({
      Influencer: `${row.seed_fname} ${row.seed_lname}`,
      MatchName: `${row.match_fname} ${row.match_lname}`,
      SimilarityScore: `${(row.similarity_score * 100).toFixed(2)}%`
    }));

    const sheet = utils.json_to_sheet(formatted);
    const book = utils.book_new();
    utils.book_append_sheet(book, sheet, "Influencer Matches");
    writeFileXLSX(book, "influencer_lookalikes_filtered.xlsx");
  }

  return (
    <div className="dashboard-tile light-tile full-width-tile" style={{ marginTop: '2rem' }}>
      <h3>🌟 Influencer-Based Donor Lookalikes</h3>

      {/* Filter Dropdown */}
      <label style={{ marginBottom: '10px', display: 'block' }}>
        Filter by Influencer:{' '}
        <select value={selectedInfluencer} onChange={handleChange}>
          <option value="">All</option>
          {uniqueSeedNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </label>

      {/* Table + Export */}
      {loading ? (
        <p>⏳ Loading matches...</p>
      ) : rows.length === 0 ? (
        <p>No lookalikes found.</p>
      ) : (
        <>
          <table className="conversion-table">
            <thead>
              <tr>
                <th>Influencer</th>
                <th>Matched Donor</th>
                <th>Similarity</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .filter(row =>
                  !selectedInfluencer ||
                  `${row.seed_fname ?? ''} ${row.seed_lname ?? ''}` === selectedInfluencer
                )
                .map((row) => (
                  <tr key={`${row.id}`}>
                    <td>{`${row.seed_fname} ${row.seed_lname}`}</td>
                    <td>{`${row.match_fname} ${row.match_lname}`}</td>
                    <td>{(row.similarity_score * 100).toFixed(2)}%</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Export Button */}
          {!!rows.length && (
            <button onClick={exportCSV} className="export-btn" style={{ marginTop: '10px' }}>
              ⬇ Export Results
            </button>
          )}
        </>
      )}
    </div>
  );
}

