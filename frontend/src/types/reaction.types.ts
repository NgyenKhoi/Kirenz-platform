export type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';

export interface ReactionSummaryResponse {
  totalCount: number;
  currentUserReaction?: ReactionType | null;
  breakdown: Partial<Record<ReactionType, number>>;
}

export interface ReactionRequest {
  type: ReactionType;
}

export interface ReactionUserResponse {
  userId: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  type: ReactionType;
  reactedAt: string;
}
