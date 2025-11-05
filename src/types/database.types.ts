// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          center_id: string | null;
          role_id: number;
          created_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      donors: {
        Row: {
          donor_id: string;
          gender: string | null;
          loyalty_tier: string | null;
          donation_frequency_bucket: string | null;
        };
      };
      donor_vectors: {
        Row: {
          donor_id: string;
          name: string | null;
          first_name: string | null;
          last_name: string | null;
          total_donated: number | null;
          avg_donation_size: number | null;
          donation_count: number | null;
          campaign_count: number | null;
          health_screening_count: number | null;
        };
      };
      roles: {
        Row: {
          id: number;
          name: string;
        };
      };
    };
  };
}

// Helper types
export type Donor = Database['public']['Tables']['donors']['Row'];
export type DonorVector = Database['public']['Tables']['donor_vectors']['Row'];
export type Role = Database['public']['Tables']['roles']['Row'];
export type DbUser = Database['public']['Tables']['users']['Row'];

