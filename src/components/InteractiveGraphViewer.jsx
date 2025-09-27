import React, { useEffect, useRef, useState } from "react";
import createForceGraph from "force-graph";
import { supabase } from "../supabaseClient";

export default function InteractiveGraphViewer({ filterByCategory, filterByInterestName }) {
  const graphRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!filterByCategory && !filterByInterestName) return;

      setLoading(true);

      try {
        // Step 1: Get matching donor IDs based on interest filters
        let donorQuery = supabase.from("donor_interests").select("donor_id");

        if (filterByCategory) {
          donorQuery = donorQuery.ilike("interest_category", `%${filterByCategory}%`);
        }
        if (filterByInterestName) {
          donorQuery = donorQuery.ilike("interest_name", `%${filterByInterestName}%`);
        }

        const { data: matchedDonors, error: interestError } = await donorQuery;
        if (interestError) throw interestError;

        const matchedDonorIds = [...new Set(matchedDonors.map((d) => d.donor_id))];
        if (!matchedDonorIds.length) {
          setGraphData({ nodes: [], links: [] });
          return;
        }

        // Step 2: Get all relevant donor-influencer links for those donors
        const { data: linksRaw, error } = await supabase
          .from("donor_influencer_links")
          .select("donor_id, influencer_id, relationship_type")
          .in("donor_id", matchedDonorIds);

        if (error) throw error;

        if (!linksRaw || linksRaw.length === 0) {
          setGraphData({ nodes: [], links: [] });
          return;
        }

        // Step 3: Extract unique IDs to look up names
        const donorIds = [...new Set(linksRaw.map((l) => l.donor_id))];
        const influencerIds = [...new Set(linksRaw.map((l) => l.influencer_id))];

        // Step 4: Look up names
        const [{ data: donorData }, { data: influencerData }] = await Promise.all([
          supabase.from("donor_vectors").select("id, name").in("id", donorIds),
          supabase.from("influencer_scores").select("influencer_id, name").in("influencer_id", influencerIds)
        ]);

        const donorMap = Object.fromEntries(
          (donorData || []).map((d) => [d.id, d.name])
        );

        const influencerMap = Object.fromEntries(
          (influencerData || []).map((i) => [i.influencer_id, i.name])
        );

        // Step 5: Build node/link graph structure
        const nodesMap = {};
        const edges = [];

        for (const row of linksRaw) {
          const { donor_id, influencer_id, relationship_type } = row;

          // Add Influencer Node
          if (!nodesMap[influencer_id]) {
            nodesMap[influencer_id] = {
              id: influencer_id,
              label:
                influencerMap[influencer_id] ||
                `Influencer ${influencer_id.slice(0, 8)}`,
              group: "influencer"
            };
          }

          // Add Donor Node
          if (!nodesMap[donor_id]) {
            nodesMap[donor_id] = {
              id: donor_id,
              label:
                donorMap[donor_id] || `Donor ${donor_id.slice(0, 8)}`,
              group: "donor"
            };
          }

          edges.push({
            source: influencer_id,
            target: donor_id,
            relationship_type
          });
        }

        setGraphData({
          nodes: Object.values(nodesMap),
          links: edges,
        });

      } catch (err) {
         console.error("❌ Error loading graph:", err.message);
         setGraphData({ nodes: [], links: [] }); // fail-safe fallback
      } finally {
         setLoading(false);
      }
    }

    fetchData();
  }, [filterByCategory, filterByInterestName]);

  // Graph renderer when graph updates
  useEffect(() => {
    if (!graphRef.current || !graphData.nodes.length) return;

    graphRef.current.innerHTML = "";

    createForceGraph()(graphRef.current)
      .width(900)
      .height(500)
      .backgroundColor("#ffffff")
      .graphData(graphData)
      .nodeAutoColorBy("group")
      .nodeLabel((node) => `${node.group === 'influencer' ? 'Influencer' : 'Donor'}\n${node.label}`)
      .linkDirectionalParticles(2)
      .linkDirectionalParticleSpeed(() => 0.005);
      
  }, [graphData]);

  return (
    <div style={{ marginTop:"1rem" }}>
      {(filterByCategory || filterByInterestName) && (
       <h4>
         🌐 Influence Network for{" "}
         {filterByCategory && `"${filterByCategory}"`}
         {filterByCategory && filterByInterestName && " + "}
         {filterByInterestName && `"${filterByInterestName}"`}
       </h4>
     )}

     {loading ? (
       <p>⏳ Loading network...</p>
     ) : !graphData.nodes.length ? (
       <p>No connections found.</p>
     ) : (
       <div ref={graphRef}></div>
     )}
   </div>
 );
}