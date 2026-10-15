export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          flex_score: number;
          streak: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          flex_score?: number;
          streak?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          flex_score?: number;
          streak?: number;
          created_at?: string;
        };
      };
      proofs: {
        Row: {
          id: string;
          user_id: string;
          image_url: string | null;
          category: string;
          caption: string;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url?: string | null;
          category: string;
          caption: string;
          points?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string | null;
          category?: string;
          caption?: string;
          points?: number;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string | null;
          type: string;
          title: string;
          body: string;
          link: string | null;
          read: boolean;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_id?: string | null;
          type: string;
          title: string;
          body: string;
          link?: string | null;
          read?: boolean;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          actor_id?: string | null;
          type?: string;
          title?: string;
          body?: string;
          link?: string | null;
          read?: boolean;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string;
          category: string;
          duration_days: number;
          target_proof_count: number;
          status: 'active' | 'completed' | 'cancelled';
          is_public: boolean;
          starts_at: string;
          ends_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description: string;
          category: string;
          duration_days: number;
          target_proof_count?: number;
          status?: 'active' | 'completed' | 'cancelled';
          is_public?: boolean;
          starts_at?: string;
          ends_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          title?: string;
          description?: string;
          category?: string;
          duration_days?: number;
          target_proof_count?: number;
          status?: 'active' | 'completed' | 'cancelled';
          is_public?: boolean;
          starts_at?: string;
          ends_at?: string;
          created_at?: string;
        };
      };
      challenge_participants: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string;
          status: 'invited' | 'joined' | 'declined' | 'completed' | 'left';
          proofs_count: number;
          joined_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          user_id: string;
          status?: 'invited' | 'joined' | 'declined' | 'completed' | 'left';
          proofs_count?: number;
          joined_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          user_id?: string;
          status?: 'invited' | 'joined' | 'declined' | 'completed' | 'left';
          proofs_count?: number;
          joined_at?: string;
          completed_at?: string | null;
        };
      };
      challenge_proofs: {
        Row: {
          id: string;
          challenge_id: string;
          proof_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          proof_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          proof_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
