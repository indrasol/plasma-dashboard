import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import ClusterSummaryPanel from './ClusterSummaryPanel'; // ⬅️ Import your fixed component

const LOOKALIKE_API_URL = '/lookalike';

export default function LookalikeDashboard() {
  const [donors, setDonors] = useState([]);
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [similarityMetric, setSimilarityMetric] = useState('cosine');
  const [filterByClusterOnly, setFilterByClusterOnly] = useState(false);
  const [lookalikes, setLookalikes] = useState([]);
  const [loadingLookalikes, setLoadingLookalikes] = useState(false);
  const [topN, setTopN] = useState(10);

  // Filters
  const [totalDonationRange, setTotalDonationRange] = useState('');
  const [avgDonationSize, setAvgDonationSize] = useState('');
  const [selectedCluster, setSelectedCluster] = useState(0); // Default: Cluster #0

  // PCA Plot Data
  const [clusteredData, setClusteredData] = useState([]);
  const [availableClusters, setAvailableClusters] = useState([]);

  // Load donors
  useEffect(() => {
    async function fetchDonors() {
      try {
        let { data: donorsData, error } = await supabase
          .from('donor_vectors')
          .select(`
            donor_id,
            name,
            first_name,
            last_name,
            total_donated,
            avg_donation_size,
            donation_count,
            campaign_count,
            health_screening_count
          `);

        if (error) throw error;

        console.log("✅ Donors loaded:", donorsData.length);
        setDonors(donorsData || []);
        if (!selectedDonorId && donorsData?.length > 0) {
          setSelectedDonorId(donorsData[0].donor_id);
        }
      } catch (err) {
        console.error("❌ Error loading donors:", err.message || err.toString());
      }
    }

    fetchDonors();
  }, []);

  // Load cluster plot data (PCA)
  useEffect(() => {
    fetch('/assets/donor_clusters_reduced.json')
      .then((res) => res.json())
      .then((data) => {
        console.log("📈 Loaded PCA plot data", data.length);
        setClusteredData(data);

        const uniqueClusters =
          [...new Set(data.map(d => d.cluster))].sort((a,b)=>a-b);
        console.log("📊 Available Clusters:", uniqueClusters);

        setAvailableClusters(uniqueClusters);
      })
      .catch(err =>
         console.error("❌ Failed loading /assets/donor_clusters_reduced.json", err)
       );
   }, []);

   // Fetch lookalikes when filters change
   useEffect(() => {
     if (!selectedDonorId) return;

     async function fetchLookalikes() {
       try {
         setLoadingLookalikes(true);

         const url =
           `${LOOKALIKE_API_URL}?donor_id=${selectedDonorId}` +
           `&metric=${similarityMetric}&top_n=${topN}` +
           (filterByClusterOnly ? '&cluster_only=true' : '');

         console.log("🔍 Fetching lookalikes →", url);

         const res = await fetch(url);
         if (!res.ok) throw new Error(`HTTP ${res.status}`);

         let jsonResp = await res.json();
         if (!Array.isArray(jsonResp)) jsonResp = [];

         console.log("🎯 Raw response:", jsonResp);
         setLookalikes(jsonResp || []);
       } catch (err) {
         console.error("❌ Failed to load lookalikes:", err.message || err.toString());
       } finally {
         setLoadingLookalikes(false);
       }
     }

     fetchLookalikes();
   }, [
     selectedDonorId,
     similarityMetric,
     topN,
     filterByClusterOnly
   ]);

   /// Filter logic applied AFTER fetching top-N results:
   const filteredResults = lookalikes.filter((d) => {

     let passTotal =
       !totalDonationRange ||
       (totalDonationRange === 'lt_1000' && d.total_donated <1000) ||
       (totalDonationRange === 'btw_1001_5000' && d.total_donated >=1001 && d.total_donated <=5000) ||
       (totalDonationRange === 'btw_5001_10000' && d.total_donated >=5001 && d.total_donated <=10000) ||
       (totalDonationRange === 'gt_10000' && d.total_donated >10000);

     let passAvg =
       !avgDonationSize || Number(d.avg_donation_size ?? '') >= Number(avgDonationSize);

     let passCluster =
       !selectedCluster || d.cluster_label == null ||
       String(d.cluster_label) === String(selectedCluster);

     return passTotal && passAvg && passCluster;
   });

return (
<div className="section">

<h2>🔍 Lookalike Donor Analytics</h2>

{/* Top-Level Filter Bar */}
<div style={{ marginBottom:'20px', display:'flex', flexWrap:'wrap', gap:'25px', alignItems:'center' }}>
    
    <label>Select Donor:&nbsp;
      <select value={selectedDonorId || ''} onChange={(e)=>setSelectedDonorId(e.target.value)}>
        {donors.map(d=>(
          <option key={d.donor_id} value={d.donor_id}>
             {d.name ?? `${d.first_name} ${d.last_name}`}
          </option>
        ))}
      </select>
    </label>

    <label>Similarity Metric:&nbsp;
      <select value={similarityMetric} onChange={(e)=>setSimilarityMetric(e.target.value)}>
        <option value="cosine">Cosine Similarity</option>
        <option value="euclidean">Euclidean Distance</option>
      </select>
    </label>

    <label>Show Top:&nbsp;
      <select value={topN} onChange={(e)=>setTopN(Number(e.target.value))}>
	      {[5,10,20].map(n=><option key={n}>{n}</option>)}
	    </select>
	  </label>

	  <label title="Restrict to same cluster only">
	  	<input 
	  		type="checkbox"
	  		checked={filterByClusterOnly}
	  		onChange={(e)=>setFilterByClusterOnly(e.target.checked)}
	  	/>&nbsp;Same cluster only?
	  </label>
</div>

{/* Secondary Filters */}
<div style={{ marginBottom:'15px', display:'flex', flexWrap:'wrap', gap:'25px' }}>
   
<label>Total Donations:&nbsp;
<select value={totalDonationRange}
	onChange={(e)=>setTotalDonationRange(e.target.value)}>
	<option value="">All</option>
	<option value="lt_1000">Less than $1K</option>
	<option value="btw_1001_5000">$1K–$5K</option>
	<option value="btw_5001_10000">$5K–$10K</option>
	<option value="gt_10000">Over $10K</option></select></label>

<label>Avg Donation Size:&nbsp;
{[200,300,400].map(size=>(
<span key={`avg-${size}`}>
&nbsp;<input type="radio" name="avgSize" checked={avgDonationSize==size}
	onChange={()=>setAvgDonationSize(size)} /> ${size}</span>))}
</label>


<label>Cluster:{' '}
{availableClusters.map(clusterID=>(
<span key={`c-${clusterID}`}>
&nbsp;<input type="radio" name="clusterID"
	value={clusterID}
	checked={String(selectedCluster)==String(clusterID)}
	onChange={()=>setSelectedCluster(clusterID)} />
#{clusterID}</span>))}
</label>

</div>


{/* Results Table */}
<h3>Top Lookalike Donors</h3>

{loadingLookalikes ? (<p>⏳ Loading...</p>)
 : filteredResults.length===0 ? (<p>No Lookalike results found.</p>)
 : (
<table className='segment-table'>
<thead><tr><th>Name</th><th>Total Donated ($)</th><th># Donations</th><th>Campaigns</th><th>Screens</th><th>{similarityMetric==="cosine"?"Similarity":"Neg. Distance"}</th></tr></thead>
<tbody>{filteredResults.map(l=>(
<tr key={l.donor_id}>
<td>{l.name}</td>
<td>{l.total_donated?.toLocaleString()}</td>
<td>{l.donation_count ?? '-'}</td>
<td>{l.campaign_count ?? '-'}</td>
<td>{l.health_screening_count ?? '-'}</td>
<td>{
typeof l.similarity==='number'
? similarityMetric==='cosine'
? l.similarity.toFixed(4)
: (-l.similarity).toFixed(4)
: '-'}</td></tr>))}
</tbody></table>)}


{/* PCA Chart */}
{clusteredData.length >0 &&
(<div style={{marginTop:"40px"}}>
<h3>📉 Cluster Visualization (PCA)</h3>

<ScatterChart width={600} height={400}>
<CartesianGrid/>
<XAxis dataKey="x"/>
<YAxis dataKey="y"/>
<Tooltip/>
<Legend/>

{availableClusters.map(c=>(
<Scatter key={`scatter-${c}`}
	data={
	  clusteredData.filter(d=>d.cluster===c)
	}
	name={`Cluster ${c}`}
	fill={
	  ['#8884d8','#82ca9d','#ffc658','#ff8042','#ff6f91'][c%6]
	}
/>))}

</ScatterChart></div>)}

<br/><br/>

{/* 🧠 Smart Summary Component! */}
<hr/>
<ClusterSummaryPanel selectedCluster={parseInt(selectedCluster)} />

<p style={{ fontStyle:"italic", color:"#777"}}>Note: Backend must populate cluster_label field in Supabase for full functionality.</p>

<br/>
<hr/>

</div>);
};