import React, { useState, useEffect } from "react";
import { MoreHorizontal, Edit2, Trash2, X, Save, Send } from "lucide-react";
import { CommentResponse } from "../../types/comment.types";
import { ReactionSummaryResponse, ReactionType } from "../../types/reaction.types";
import { reactionService } from "../../services/reaction.service";
import {
  displayName,
  formatPostTime,
  getErrorMessage,
  getReactionOption,
  getReactionTotal,
  formatCount,
} from "../../utils/post.utils";
import { fallbackAvatar } from "../../constants/post.constants";
import { ReactionPicker } from "./ReactionPicker";
import { CountPopover } from "../common/CountPopover";
import { ReactionBreakdown } from "./ReactionBreakdown";

interface CommentItemProps {
  comment: CommentResponse;
  currentUserId?: string;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReply: (commentId: string, content: string) => Promise<void>;
  onReactionChange: (
    commentId: string,
    summary: ReactionSummaryResponse,
  ) => void;
  depth?: number;
}

export function CommentItem({
  comment,
  currentUserId,
  onUpdate,
  onDelete,
  onReply,
  onReactionChange,
  depth = 0,
}: CommentItemProps) {
  const isOwner = comment.author.id === currentUserId;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [reactionError, setReactionError] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const authorName = displayName(comment.author);
  const isNested = depth > 0;
  const isDeepNested = depth > 1;
  const currentReaction = comment.reactionSummary?.currentUserReaction;
  const selectedReaction = getReactionOption(currentReaction);
  const reactionTotal = getReactionTotal(
    comment.reactionSummary,
    comment.reactionsCount || 0,
  );

  useEffect(() => {
    setDraftContent(comment.content);
  }, [comment.content]);

  const handleSave = async () => {
    if (!draftContent.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(comment.id, draftContent);
      setIsEditing(false);
      setIsMenuOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCommentReaction = async (type: ReactionType) => {
    setIsReacting(true);
    setReactionError(null);
    try {
      const summary =
        currentReaction === type
          ? await reactionService.unreactToComment(comment.id)
          : await reactionService.reactToComment(comment.id, type);
      onReactionChange(comment.id, summary);
    } catch (err) {
      setReactionError(getErrorMessage(err));
    } finally {
      setIsReacting(false);
    }
  };

  const handleSubmitReply = async (event: React.FormEvent) => {
    event.preventDefault();
    setReplyError(null);

    if (!replyDraft.trim()) {
      setReplyError("Reply content is required.");
      return;
    }

    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyDraft);
      setReplyDraft("");
      setIsReplying(false);
    } catch (err) {
      setReplyError(getErrorMessage(err));
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="flex min-w-0 max-w-full gap-3">
      <div
        className={`${isNested ? "h-8 w-8" : "h-9 w-9"} rounded-full overflow-hidden shrink-0`}
      >
        <img
          alt={authorName}
          src={comment.author.avatarUrl || fallbackAvatar}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={`${isNested ? "rounded-2xl bg-surface-container-lowest border border-outline-variant/25" : "rounded-2xl bg-surface-container-low"} ${isDeepNested ? "px-3" : "px-4"} py-3`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-on-surface">
                {authorName}
              </p>
              {isEditing ? (
                <textarea
                  value={draftContent}
                  onChange={(event) => setDraftContent(event.target.value)}
                  rows={2}
                  className="mt-2 w-full resize-none rounded-xl bg-surface-container-lowest px-3 py-2 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                />
              ) : (
                <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-on-surface">
                  {comment.content}
                </p>
              )}
            </div>

            {isOwner && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((open) => !open)}
                  className="p-1 text-outline hover:text-on-surface"
                  aria-label="Comment actions"
                >
                  <MoreHorizontal size={18} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 top-7 z-20 w-36 rounded-2xl bg-surface-container-lowest shadow-lg border border-outline-variant/40 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-low"
                    >
                      <Edit2 size={15} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(comment.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-on-error-container hover:bg-error-container"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraftContent(comment.content);
                  setIsEditing(false);
                }}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
              >
                <X size={14} /> Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !draftContent.trim()}
                className="inline-flex items-center gap-1 rounded-full bg-secondary-container text-on-secondary-container px-3 py-1 text-xs font-bold disabled:opacity-60 active:scale-95 transition-all"
              >
                <Save size={14} /> {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-4 text-[11px] font-bold text-on-surface-variant">
          <span>{formatPostTime(comment.createdAt)}</span>
          {comment.updatedAt !== comment.createdAt && <span>edited</span>}
          <ReactionPicker
            currentReaction={currentReaction}
            selectedReaction={selectedReaction}
            isReacting={isReacting}
            onSelect={handleCommentReaction}
            compact
          />
          <button
            type="button"
            onClick={() => setIsReplying((value) => !value)}
            className="text-[11px] font-bold text-on-surface-variant hover:text-secondary"
          >
            Reply
          </button>
          {reactionTotal > 0 && (
            <CountPopover
              label={formatCount(reactionTotal, "reaction", "reactions")}
            >
              <ReactionBreakdown summary={comment.reactionSummary} />
            </CountPopover>
          )}
        </div>
        {isReplying && (
          <div className="mt-2 px-4">
            <p className="mb-1 text-[11px] font-bold text-secondary">
              Replying to {authorName}
            </p>
            <form onSubmit={handleSubmitReply} className="flex gap-2">
              <input
                value={replyDraft}
                onChange={(event) => setReplyDraft(event.target.value)}
                placeholder={`Write a reply...`}
                className="min-w-0 flex-1 rounded-full bg-surface-container-low px-4 py-2 text-xs font-medium text-on-surface outline-none focus:ring-2 focus:ring-secondary-container"
              />
              <button
                type="submit"
                disabled={isSubmittingReply || !replyDraft.trim()}
                className="shrink-0 text-secondary disabled:opacity-50 active:scale-95 transition-transform"
                aria-label="Send reply"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
        {replyError && (
          <p className="mt-1 px-4 text-[11px] font-bold text-on-error-container">
            {replyError}
          </p>
        )}
        {reactionError && (
          <p className="mt-1 px-4 text-[11px] font-bold text-on-error-container">
            {reactionError}
          </p>
        )}
      </div>
    </div>
  );
}
