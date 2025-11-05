import { useEffect, useRef, useState } from "react";
import createForceGraph from "force-graph";
import { supabase } from "../supabaseClient";

interface InteractiveGraphViewerProps {
  filterByCategory: string;
  filterByInterestName: string;
}

interface GraphNode {
  id: string;
  label: string;
  group: string;
}

interface GraphLink {
  source: string;
  target: string;
  relationship_type: string | null;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface DonorInterest {
  donor_id: string;
}

interface DonorInfluencerLink {
  donor_id: string;
  influencer_id: string;
  relationship_type: string | null;
}

interface DonorVector {
  id: string;
  name: string | null;
}

interface InfluencerScore {
  influencer_id: string;
  name: string | null;
}

export default function InteractiveGraphViewer({ filterByCategory, filterByInterestName }: InteractiveGraphViewerProps) {
  const graphRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
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

        const typedDonorInterests = (matchedDonors as DonorInterest[]) || [];
        const matchedDonorIds = [...new Set(typedDonorInterests.map((d) => d.donor_id))];
        
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

        const typedLinks = (linksRaw as DonorInfluencerLink[]) || [];

        if (!typedLinks.length) {
          setGraphData({ nodes: [], links: [] });
          return;
        }

        // Step 3: Extract unique IDs to look up names
        const donorIds = [...new Set(typedLinks.map((l) => l.donor_id))];
        const influencerIds = [...new Set(typedLinks.map((l) => l.influencer_id))];

        // Step 4: Look up names
        const [{ data: donorData }, { data: influencerData }] = await Promise.all([
          supabase.from("donor_vectors").select("id, name").in("id", donorIds),
          supabase.from("influencer_scores").select("influencer_id, name").in("influencer_id", influencerIds)
        ]);

        const typedDonorData = (donorData as DonorVector[]) || [];
        const typedInfluencerData = (influencerData as InfluencerScore[]) || [];

        const donorMap = Object.fromEntries(
          typedDonorData.map((d) => [d.id, d.name])
        );

        const influencerMap = Object.fromEntries(
          typedInfluencerData.map((i) => [i.influencer_id, i.name])
        );

        // Step 5: Build node/link graph structure
        const nodesMap: Record<string, GraphNode> = {};
        const edges: GraphLink[] = [];

        for (const row of typedLinks) {
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
        console.error("❌ Error loading graph:", err);
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

    // @ts-ignore - force-graph library has incorrect type definitions
    const graph = createForceGraph()(graphRef.current);
    graph
      .width(900)
      .height(500)
      .backgroundColor("#ffffff")
      .graphData(graphData)
      .nodeAutoColorBy("group")
      .nodeLabel((node: any) => {
        const n = node as GraphNode;
        return `${n.group === 'influencer' ? 'Influencer' : 'Donor'}\n${n.label}`;
      })
      .linkDirectionalParticles(2)
      .linkDirectionalParticleSpeed(() => 0.005);

  }, [graphData]);

  return (
    <div style={{ marginTop: "1rem" }}>
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

