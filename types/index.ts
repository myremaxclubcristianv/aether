import { Database } from './database';

export type DbProfile = Database['public']['Tables']['profiles']['Row'];
export type DbProof = Database['public']['Tables']['proofs']['Row'];
export type DbFollow = Database['public']['Tables']['follows']['Row'];
export type DbNotification = Database['public']['Tables']['notifications']['Row'];
export type DbChallenge = Database['public']['Tables']['challenges']['Row'];
export type DbChallengeParticipant = Database['public']['Tables']['challenge_participants']['Row'];
export type DbChallengeProof = Database['public']['Tables']['challenge_proofs']['Row'];

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

export type NotificationType =
  | 'new_follower'
  | 'challenge_invite'
  | 'challenge_accepted'
  | 'challenge_declined'
  | 'challenge_started'
  | 'challenge_progress'
  | 'challenge_completed';

export interface NotificationRecord {
  id: string;
  userId: string;
  actorId: string | null;
  actor?: UserProfile;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type ChallengeStatus = 'active' | 'completed' | 'cancelled';
export type ParticipantStatus = 'invited' | 'joined' | 'declined' | 'completed' | 'left';

export interface ChallengeRecord {
  id: string;
  creatorId: string;
  creator?: UserProfile;
  title: string;
  description: string;
  category: string;
  durationDays: number;
  targetProofCount: number;
  status: ChallengeStatus;
  isPublic: boolean;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export interface ChallengeParticipantRecord {
  id: string;
  challengeId: string;
  userId: string;
  user?: UserProfile;
  status: ParticipantStatus;
  proofsCount: number;
  joinedAt: string;
  completedAt: string | null;
}

export interface ChallengeWithDetails extends ChallengeRecord {
  participantsCount: number;
  userParticipation?: ChallengeParticipantRecord;
  participants?: ChallengeParticipantRecord[];
  proofs?: ProofWithProfile[];
}

