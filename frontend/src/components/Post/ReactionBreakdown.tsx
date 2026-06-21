import React from "react";
import { ReactionSummaryResponse } from "../../types/reaction.types";
import {
  formatCount,
  getReactionOption,
} from "../../utils/post.utils";
import {
  fallbackAvatar,
  reactionOptions,
} from "../../constants/post.constants";

interface ReactionBreakdownProps {
  summary?: ReactionSummaryResponse;
  currentUserAvatarUrl?: string | null;
}

export function ReactionBreakdown({
  summary,
  currentUserAvatarUrl,
}: ReactionBreakdownProps) {
  const total = summary?.totalCount ?? 0;
  const currentReaction = getReactionOption(summary?.currentUserReaction);
  const knownCurrentUser = currentReaction ? 1 : 0;
  const remaining = Math.max(0, total - knownCurrentUser);

  return (
    <div className="w-64 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-lg">
      <p className="mb-2 text-xs font-bold text-on-surface">Reactions</p>
      {total === 0 ? (
        <p className="text-xs font-bold text-on-surface-variant">
          No reactions yet.
        </p>
      ) : (
        <div className="space-y-2">
          {currentReaction && (
            <div className="flex items-center gap-2">
              <img
                alt="You"
                src={currentUserAvatarUrl || fallbackAvatar}
                className="h-7 w-7 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-on-surface">
                  You
                </p>
                <p className="text-[11px] font-bold text-on-surface-variant">
                  {currentReaction.icon} {currentReaction.label}
                </p>
              </div>
            </div>
          )}
          {remaining > 0 && (
            <p className="text-xs font-bold text-on-surface-variant">
              {formatCount(remaining, "other person", "other people")} reacted.
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {reactionOptions
              .filter((option) => (summary?.breakdown?.[option.type] ?? 0) > 0)
              .map((option) => (
                <span
                  key={option.type}
                  className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2 py-1 text-[11px] font-bold text-on-surface-variant"
                >
                  <span>{option.icon}</span>
                  {summary?.breakdown?.[option.type]}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
