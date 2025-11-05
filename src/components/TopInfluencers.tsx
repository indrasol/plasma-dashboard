import { useEffect, useState } from 'react';
import TopInfluencersTable from './TopInfluencersTable';
import InteractiveGraphViewer from './InteractiveGraphViewer';
import { supabase } from '../supabaseClient';

interface DonorInterest {
  interest_category: string | null;
  interest_name: string | null;
}

export default function TopInfluencers() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedInterestName, setSelectedInterestName] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(true);

  // Load categories and interest names on mount
  useEffect(() => {
    async function loadInterests() {
      try {
        const { data, error } = await supabase
          .from('donor_interests')
          .select('interest_category, interest_name');

        if (error) throw error;

        const typedData = data as DonorInterest[] | null;

        // Unique + cleaned lists
        const categories = [...new Set(
          (typedData || []).map(row => row.interest_category?.trim()).filter((val): val is string => Boolean(val))
        )].sort();

        const names = [...new Set(
          (typedData || []).map(row => row.interest_name?.trim()).filter((val): val is string => Boolean(val))
        )].sort();

        console.log("✅ Loaded interest categories:", categories);
        console.log("✅ Loaded interest names:", names);

        setAvailableCategories(categories);
        setAvailableNames(names);
      } catch (err) {
        console.error("❌ Failed to load interests:", err);
      } finally {
        setLoadingInterests(false);
      }
    }

    loadInterests();
  }, []);

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Dropdown Filters */}
      {!loadingInterests && (
        <div className="tile-controls" style={{ marginBottom: '1rem' }}>
          
          {/* Category Dropdown */}
          <label>
            Filter by Interest Category:&nbsp;
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All</option>
              {availableCategories.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </label>

          {/* Name Dropdown */}
          <label style={{ marginLeft: "2rem" }}>
            Filter by Interest Name:&nbsp;
            <select value={selectedInterestName} onChange={(e) => setSelectedInterestName(e.target.value)}>
              <option value="">All</option>
              {availableNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>

          {(!!selectedCategory || !!selectedInterestName) && (
            <span style={{ marginLeft: "12px", fontStyle: "italic" }}>
              Showing results for{" "}
              {selectedCategory && <>category "<strong>{selectedCategory}</strong>"</>}
              {selectedCategory && selectedInterestName && <> and </>}
              {selectedInterestName && <>name "<strong>{selectedInterestName}</strong>"</>}
            </span>
          )}
          
        </div>
      )}

      {/* Paginated Influencer Table */}
      <TopInfluencersTable 
        selectedCategory={selectedCategory}
        selectedInterestName={selectedInterestName}
      />

      {!!(selectedCategory || selectedInterestName) && (
        <>
          <hr />
          <h4>🌐 Influence Network Visualization</h4>

          <InteractiveGraphViewer 
            filterByCategory={selectedCategory}
            filterByInterestName={selectedInterestName}
          />
        </>
      )}
    </div>
  );
}

