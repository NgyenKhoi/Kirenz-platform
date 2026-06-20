export type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';

export interface ReactionSummaryResponse {
  totalCount: number;
  currentUserReaction?: ReactionType | null;
  breakdown: Partial<Record<ReactionType, number>>;
}

export interface ReactionRequest {
  type: ReactionType;
}
