export interface LookalikeResult {
  donor_id: string;
  name: string;
  total_donated: number;
  donation_count: number | null;
  campaign_count: number | null;
  health_screening_count: number | null;
  avg_donation_size: number | null;
  similarity: number;
  cluster_label: number | null;
}

export interface ClusterData {
  x: number;
  y: number;
  cluster: number;
  donor_id?: string;
}

export type SimilarityMetric = 'cosine' | 'euclidean';

export type DonationRange = '' | 'lt_1000' | 'btw_1001_5000' | 'btw_5001_10000' | 'gt_10000';

