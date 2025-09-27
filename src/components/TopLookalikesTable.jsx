import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { utils, writeFileXLSX } from 'xlsx'; // ✅ make sure writeFileXLSX is used here!

export default function TopLookalikesTable() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [runComplete, setRunComplete] = useState(false);

  async function runLookalikeMatch() {
    setLoading(true);
    setRunComplete(false);

    const { data, error } = await supabase
      .from('internal_lookalike_matches')
      .select(`
        donor_id,
        similarity_score,
        donors (
          first_name,
          last_name
        )
      `)
      .order('similarity_score', { ascending: false })
      .limit(10);

    if (error) {
      console.error("❌ Error fetching lookalikes:", error);
    }

    setMatches(data || []);
    setRunComplete(true);
    setLoading(false);
  }

  function exportToCSV(matches) {
    if (!matches || matches.length === 0) return;

    const rows = matches.map(match => ({
      Name: `${match.donors?.first_name ?? ''} ${match.donors?.last_name ?? ''}`,
      Similarity: (match.similarity_score * 100).toFixed(2),
      Donor_ID: match.donor_id,
    }));

    const worksheet = utils.json_to_sheet(rows);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Lookalikes");

    writeFileXLSX(workbook, "lookalike_matches.xlsx");
  }

  return (
    <div className="dashboard-tile dark-blue" style={{ marginTop: '1rem' }}>
      
      <h3>🎯 Internal Donor Lookalikes</h3>

      {!runComplete && !loading && (
        <button onClick={runLookalikeMatch} className="run-btn">
          🧠 Run Lookalike Match
        </button>
      )}

      {loading && <p>Running analysis...</p>}

      {!loading && matches.length > 0 && (
        <>
          <h4>🧬 Internal Lookalike Donors</h4>
          <ul style={{ paddingLeft: '16px', fontSize: '0.9rem' }}>
            {matches.map((match) => {
              const name = `${match.donors?.first_name ?? ''} ${match.donors?.last_name ?? ''}`;
              return (
                <li key={match.donor_id}>
                  {name} – {(match.similarity_score * 100).toFixed(2)}%
                </li>
              );
            })}
          </ul>

          {/* ✅ Export Button */}
          <button onClick={() => exportToCSV(matches)} className="export-btn">
            ⬇ Export as CSV
          </button>
        </>
      )}

      {!loading && runComplete && matches.length === 0 && (
        <p>No lookalike matches found.</p>
      )}
      
    </div>
  );
}