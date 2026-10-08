import { Database } from './database';

export type DbProfile = Database['public']['Tables']['profiles']['Row'];
export type DbProof = Database['public']['Tables']['proofs']['Row'];
export type DbFollow = Database['public']['Tables']['follows']['Row'];

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  flexScore: number;
  streak: number;
  createdAt: string;
}

export interface ProofRecord {
  id: string;
  userId: string;
  imageUrl: string | null;
  category: string;
  caption: string;
  points: number;
  createdAt: string;
}

export interface ProofWithProfile extends ProofRecord {
  profile: UserProfile;
}

