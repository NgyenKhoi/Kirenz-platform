import { AxiosError } from "axios";
import { ErrorResponse } from "../types/auth.types";
import { CommentResponse } from "../types/comment.types";
import { ReactionSummaryResponse } from "../types/reaction.types";
import { reactionOptions } from "../constants/post.constants";

export function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ErrorResponse>;
  return (
    axiosError.response?.data?.message ||
    "Something went wrong. Please try again."
  );
}

export function formatPostTime(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (Number.isNaN(date.getTime())) {
    return "";
  }
  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export function getReactionOption(type?: string | null) {
  return reactionOptions.find((option) => option.type === type);
}

export function getReactionTotal(
  summary: ReactionSummaryResponse | undefined,
  fallback: number,
) {
  return summary?.totalCount ?? fallback;
}

export function formatCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function displayName(author: {
  username?: string | null;
  displayName?: string | null;
}) {
  return author.displayName || author.username || "Kirenz User";
}

export function uniqueCommentAuthors(comments: CommentResponse[]) {
  const authors = new Map<
    string,
    { name: string; avatarUrl?: string | null; count: number }
  >();
  comments.forEach((comment) => {
    const existing = authors.get(comment.author.id);
    if (existing) {
      existing.count += 1;
      return;
    }
    authors.set(comment.author.id, {
      name: displayName(comment.author),
      avatarUrl: comment.author.avatarUrl,
      count: 1,
    });
  });
  return Array.from(authors.values());
}

export function topLevelComments(comments: CommentResponse[]) {
  return comments.filter((comment) => !comment.parentCommentId);
}

export function repliesForComment(
  comments: CommentResponse[],
  parentCommentId: string,
) {
  return comments.filter(
    (comment) => comment.parentCommentId === parentCommentId,
  );
}

export function descendantComments(
  comments: CommentResponse[],
  parentCommentId: string,
): CommentResponse[] {
  return repliesForComment(comments, parentCommentId).flatMap((reply) => [
    reply,
    ...descendantComments(comments, reply.id),
  ]);
}
