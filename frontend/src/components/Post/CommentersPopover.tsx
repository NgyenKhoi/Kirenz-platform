import React from "react";
import { CommentResponse } from "../../types/comment.types";
import {
  formatCount,
  uniqueCommentAuthors,
} from "../../utils/post.utils";
import { fallbackAvatar } from "../../constants/post.constants";

interface CommentersPopoverProps {
  comments: CommentResponse[];
  isLoading: boolean;
  commentsCount: number;
}

export function CommentersPopover({
  comments,
  isLoading,
  commentsCount,
}: CommentersPopoverProps) {
  const authors = uniqueCommentAuthors(comments);
  const listedCount = authors.reduce(
    (total, author) => total + author.count,
    0,
  );
  const remaining = Math.max(0, commentsCount - listedCount);

  return (
    <div className="w-64 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-lg">
      <p className="mb-2 text-xs font-bold text-on-surface">Comments</p>
      {isLoading ? (
        <p className="text-xs font-bold text-on-surface-variant">
          Loading commenters...
        </p>
      ) : authors.length === 0 ? (
        <p className="text-xs font-bold text-on-surface-variant">
          No comments yet.
        </p>
      ) : (
        <div className="space-y-2">
          {authors.slice(0, 6).map((author) => (
            <div key={author.name} className="flex items-center gap-2">
              <img
                alt={author.name}
                src={author.avatarUrl || fallbackAvatar}
                className="h-7 w-7 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <p className="min-w-0 flex-1 truncate text-xs font-bold text-on-surface">
                {author.name}
              </p>
              {author.count > 1 && (
                <span className="text-[11px] font-bold text-on-surface-variant">
                  x{author.count}
                </span>
              )}
            </div>
          ))}
          {remaining > 0 && (
            <p className="text-xs font-bold text-on-surface-variant">
              {formatCount(remaining, "more comment", "more comments")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
