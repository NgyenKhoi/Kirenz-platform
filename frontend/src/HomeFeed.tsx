import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, Bell, Bookmark, Calendar, Image as ImageIcon, Smile,
  Globe, MoreHorizontal, Heart, MessageSquare, Share2, ThumbsUp,
  Gift, Video, Edit2, Save, Trash2, X, Send
} from 'lucide-react';
import { AxiosError } from 'axios';
import Layout from './components/Layout';
import { commentService } from './services/comment.service';
import { postService } from './services/post.service';
import { reactionService } from './services/reaction.service';
import { ErrorResponse } from './types/auth.types';
import { CommentResponse } from './types/comment.types';
import { PostResponse } from './types/post.types';
import { ReactionSummaryResponse, ReactionType } from './types/reaction.types';
import { useAuthStore } from './store/authStore';

const fallbackAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDn9I6Bn8A1s6Gv_kblRDw5crnta6Vb7W0KyrBjRdHoUu3nEM5p1A7ODn_isaa7M80w2yF_GqrvezNIIz11PYt7KqMNO5ISVUrgUKCJZ3FvNZkhQeNhkwYyW_jdHb2Qja9CR9u9BVzj_6IFkVhiHPLeS6JXKmIBmfaC71-cnJodIWg_zqMW4RUF73sKvLv8IZWTXErCay6A4e6Xaho8Q6Y-8TCyc4_rZbQGrTBGVqYllUj1ftVmkK9I2EnSe5Ph9NHEg-y1kcqoQHI';

function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ErrorResponse>;
  return axiosError.response?.data?.message || 'Something went wrong. Please try again.';
}

function formatPostTime(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (Number.isNaN(date.getTime())) {
    return '';
  }
  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
}

const legacyReactionOptions: Array<{ type: ReactionType; label: string; icon: string }> = [
  { type: 'LIKE', label: 'Like', icon: '👍' },
  { type: 'LOVE', label: 'Love', icon: '❤️' },
  { type: 'HAHA', label: 'Haha', icon: '😆' },
  { type: 'WOW', label: 'Wow', icon: '😮' },
  { type: 'SAD', label: 'Sad', icon: '😢' },
  { type: 'ANGRY', label: 'Angry', icon: '😡' },
];

const reactionOptions: Array<{ type: ReactionType; label: string; icon: string }> = [
  { type: 'LIKE', label: 'Like', icon: '\u{1F44D}' },
  { type: 'LOVE', label: 'Love', icon: '\u{2764}\u{FE0F}' },
  { type: 'HAHA', label: 'Haha', icon: '\u{1F606}' },
  { type: 'WOW', label: 'Wow', icon: '\u{1F62E}' },
  { type: 'SAD', label: 'Sad', icon: '\u{1F622}' },
  { type: 'ANGRY', label: 'Angry', icon: '\u{1F621}' },
];

function getReactionOption(type?: ReactionType | null) {
  return reactionOptions.find((option) => option.type === type);
}

function getReactionTotal(summary: ReactionSummaryResponse | undefined, fallback: number) {
  return summary?.totalCount ?? fallback;
}

function formatCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function displayName(author: { username?: string | null; displayName?: string | null }) {
  return author.displayName || author.username || 'Kirenz User';
}

function uniqueCommentAuthors(comments: CommentResponse[]) {
  const authors = new Map<string, { name: string; avatarUrl?: string | null; count: number }>();
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

function topLevelComments(comments: CommentResponse[]) {
  return comments.filter((comment) => !comment.parentCommentId);
}

function repliesForComment(comments: CommentResponse[], parentCommentId: string) {
  return comments.filter((comment) => comment.parentCommentId === parentCommentId);
}

function descendantComments(comments: CommentResponse[], parentCommentId: string): CommentResponse[] {
  return repliesForComment(comments, parentCommentId).flatMap((reply) => [
    reply,
    ...descendantComments(comments, reply.id),
  ]);
}

function useHoverPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const open = () => {
    clearCloseTimer();
    setIsOpen(true);
  };

  const closeSoon = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setIsOpen(false), 160);
  };

  useEffect(() => () => clearCloseTimer(), []);

  return { isOpen, setIsOpen, open, closeSoon };
}

function ReactionBreakdown({
  summary,
  currentUserAvatarUrl,
}: {
  summary?: ReactionSummaryResponse;
  currentUserAvatarUrl?: string | null;
}) {
  const total = summary?.totalCount ?? 0;
  const currentReaction = getReactionOption(summary?.currentUserReaction);
  const knownCurrentUser = currentReaction ? 1 : 0;
  const remaining = Math.max(0, total - knownCurrentUser);

  return (
    <div className="w-64 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-lg">
      <p className="mb-2 text-xs font-bold text-on-surface">Reactions</p>
      {total === 0 ? (
        <p className="text-xs font-bold text-on-surface-variant">No reactions yet.</p>
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
                <p className="truncate text-xs font-bold text-on-surface">You</p>
                <p className="text-[11px] font-bold text-on-surface-variant">
                  {currentReaction.icon} {currentReaction.label}
                </p>
              </div>
            </div>
          )}
          {remaining > 0 && (
            <p className="text-xs font-bold text-on-surface-variant">
              {formatCount(remaining, 'other person', 'other people')} reacted.
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

function CommentersPopover({
  comments,
  isLoading,
  commentsCount,
}: {
  comments: CommentResponse[];
  isLoading: boolean;
  commentsCount: number;
}) {
  const authors = uniqueCommentAuthors(comments);
  const listedCount = authors.reduce((total, author) => total + author.count, 0);
  const remaining = Math.max(0, commentsCount - listedCount);

  return (
    <div className="w-64 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-lg">
      <p className="mb-2 text-xs font-bold text-on-surface">Comments</p>
      {isLoading ? (
        <p className="text-xs font-bold text-on-surface-variant">Loading commenters...</p>
      ) : authors.length === 0 ? (
        <p className="text-xs font-bold text-on-surface-variant">No comments yet.</p>
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
              <p className="min-w-0 flex-1 truncate text-xs font-bold text-on-surface">{author.name}</p>
              {author.count > 1 && (
                <span className="text-[11px] font-bold text-on-surface-variant">x{author.count}</span>
              )}
            </div>
          ))}
          {remaining > 0 && (
            <p className="text-xs font-bold text-on-surface-variant">
              {formatCount(remaining, 'more comment', 'more comments')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CountPopover({
  label,
  children,
  align = 'left',
  onOpen,
}: {
  label: string;
  children: React.ReactNode;
  align?: 'left' | 'right';
  onOpen?: () => void;
}) {
  const { isOpen, open, closeSoon } = useHoverPopover();

  const handleOpen = () => {
    onOpen?.();
    open();
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={handleOpen}
      onMouseLeave={closeSoon}
      onFocus={handleOpen}
      onBlur={closeSoon}
    >
      <button
        type="button"
        onClick={handleOpen}
        className="text-xs font-bold text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
      >
        {label}
      </button>
      {isOpen && (
        <span
          className={`absolute top-6 z-40 ${align === 'right' ? 'right-0' : 'left-0'}`}
          onMouseEnter={open}
          onMouseLeave={closeSoon}
        >
          {children}
        </span>
      )}
    </span>
  );
}

function ReactionPicker({
  currentReaction,
  selectedReaction,
  isReacting,
  onSelect,
  compact = false,
}: {
  currentReaction?: ReactionType | null;
  selectedReaction?: { type: ReactionType; label: string; icon: string };
  isReacting: boolean;
  onSelect: (type: ReactionType) => void;
  compact?: boolean;
}) {
  const { isOpen, setIsOpen, open, closeSoon } = useHoverPopover();

  const handleMainClick = () => {
    if (currentReaction) {
      onSelect(currentReaction);
      setIsOpen(false);
      return;
    }
    setIsOpen((value) => !value);
  };

  return (
    <div
      className="relative"
      onMouseEnter={open}
      onMouseLeave={closeSoon}
      onFocus={open}
      onBlur={closeSoon}
    >
      <button
        type="button"
        onClick={handleMainClick}
        disabled={isReacting}
        className={compact
          ? `text-[11px] font-bold active:scale-95 disabled:opacity-60 ${selectedReaction ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`
          : `w-full flex items-center justify-center gap-2 py-2 hover:bg-primary-fixed rounded-full transition-all text-sm font-bold active:scale-95 disabled:opacity-60 ${selectedReaction ? 'text-primary' : 'text-on-surface-variant'}`
        }
      >
        {selectedReaction ? (
          compact ? `${selectedReaction.icon} ${selectedReaction.label}` : <span className="text-lg leading-none">{selectedReaction.icon}</span>
        ) : compact ? (
          'React'
        ) : (
          <Heart size={20} />
        )}
        {!compact && <span className="hidden sm:inline">{selectedReaction?.label || 'React'}</span>}
      </button>
      {isOpen && (
        <div
          className={`absolute z-40 flex gap-1 rounded-full border border-outline-variant/40 bg-surface-container-lowest px-2 py-2 shadow-lg ${compact ? 'bottom-6 left-0' : 'bottom-11 left-0'}`}
          onMouseEnter={open}
          onMouseLeave={closeSoon}
        >
          {reactionOptions.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => {
                onSelect(option.type);
                setIsOpen(false);
              }}
              className={`${compact ? 'h-9 w-9 text-lg' : 'h-10 w-10 text-xl'} rounded-full transition-transform hover:scale-125 ${currentReaction === option.type ? 'bg-primary-container' : 'hover:bg-surface-container-low'}`}
              aria-label={option.label}
              title={option.label}
            >
              {option.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PostCard({
  post,
  currentUserId,
  currentUserAvatarUrl,
  onUpdate,
  onDelete,
  onCommentCountChange,
  onReactionSummaryChange,
}: {
  post: PostResponse;
  currentUserId?: string;
  currentUserAvatarUrl?: string | null;
  onUpdate: (postId: string, content: string) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onCommentCountChange: (postId: string, delta: number) => void;
  onReactionSummaryChange: (postId: string, summary: ReactionSummaryResponse) => void;
}) {
  const isOwner = post.author.id === currentUserId;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [reactionError, setReactionError] = useState<string | null>(null);

  useEffect(() => {
    setDraftContent(post.content);
  }, [post.content]);

  const authorName = displayName(post.author);
  const currentReaction = post.reactionSummary?.currentUserReaction;
  const selectedReaction = getReactionOption(currentReaction);
  const reactionTotal = getReactionTotal(post.reactionSummary, post.reactionsCount);

  const handleSave = async () => {
    if (!draftContent.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(post.id, draftContent);
      setIsEditing(false);
      setIsMenuOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this post?');
    if (!confirmed) {
      return;
    }
    await onDelete(post.id);
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    setCommentError(null);
    try {
      setComments(await commentService.listByPost(post.id));
    } catch (err) {
      setCommentError(getErrorMessage(err));
    } finally {
      setIsLoadingComments(false);
    }
  };

  const loadCommentsForPopover = () => {
    if (post.commentsCount > 0 && comments.length === 0 && !isLoadingComments) {
      void loadComments();
    }
  };

  const toggleComments = async () => {
    const nextOpen = !isCommentsOpen;
    setIsCommentsOpen(nextOpen);
    if (nextOpen && comments.length === 0) {
      await loadComments();
    }
  };

  const handleCreateComment = async (event: React.FormEvent) => {
    event.preventDefault();
    setCommentError(null);

    if (!commentDraft.trim()) {
      setCommentError('Comment content is required.');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const created = await commentService.create(post.id, { content: commentDraft });
      setComments((current) => [...current, created]);
      setCommentDraft('');
      onCommentCountChange(post.id, 1);
    } catch (err) {
      setCommentError(getErrorMessage(err));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCreateReply = async (parentCommentId: string, content: string) => {
    setCommentError(null);
    try {
      const created = await commentService.create(post.id, { content, parentCommentId });
      setComments((current) => [...current, created]);
      onCommentCountChange(post.id, 1);
    } catch (err) {
      setCommentError(getErrorMessage(err));
      throw err;
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    setCommentError(null);
    try {
      const updated = await commentService.update(post.id, commentId, { content });
      setComments((current) => current.map((comment) => (comment.id === commentId ? updated : comment)));
    } catch (err) {
      setCommentError(getErrorMessage(err));
      throw err;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const confirmed = window.confirm('Delete this comment?');
    if (!confirmed) {
      return;
    }

    setCommentError(null);
    try {
      await commentService.remove(post.id, commentId);
      const removedIds = new Set([
        commentId,
        ...descendantComments(comments, commentId).map((comment) => comment.id),
      ]);
      setComments((current) => current.filter((comment) => !removedIds.has(comment.id)));
      const removedCount = removedIds.size;
      onCommentCountChange(post.id, -removedCount);
    } catch (err) {
      setCommentError(getErrorMessage(err));
    }
  };

  const renderCommentThread = (comment: CommentResponse, depth = 0): React.ReactNode => {
    const replies = repliesForComment(comments, comment.id);

    return (
      <React.Fragment key={comment.id}>
        <CommentItem
          comment={comment}
          currentUserId={currentUserId}
          onUpdate={handleUpdateComment}
          onDelete={handleDeleteComment}
          onReply={handleCreateReply}
          onReactionChange={(commentId, summary) => {
            setComments((current) =>
              current.map((item) =>
                item.id === commentId
                  ? { ...item, reactionsCount: summary.totalCount, reactionSummary: summary }
                  : item
              )
            );
          }}
          depth={depth}
        />
        {replies.length > 0 && (
          <div
            className={`flex flex-col gap-3 border-l border-outline-variant/40 pl-3 sm:pl-4 ${
              depth === 0 ? 'ml-10 sm:ml-14' : 'ml-6 sm:ml-8'
            }`}
          >
            {replies.map((reply) => renderCommentThread(reply, depth + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  const handlePostReaction = async (type: ReactionType) => {
    setIsReacting(true);
    setReactionError(null);
    try {
      const summary = currentReaction === type
        ? await reactionService.unreactToPost(post.id)
        : await reactionService.reactToPost(post.id, type);
      onReactionSummaryChange(post.id, summary);
    } catch (err) {
      setReactionError(getErrorMessage(err));
    } finally {
      setIsReacting(false);
    }
  };

  return (
    <article className="bg-surface-container-lowest rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] overflow-hidden">
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
              <img
                alt={authorName}
                src={post.author.avatarUrl || fallbackAvatar}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-on-surface leading-tight truncate">{authorName}</h3>
              <p className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                {formatPostTime(post.createdAt)} <span aria-hidden="true">.</span> <Globe size={12} />
              </p>
            </div>
          </div>

          {isOwner && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="p-2 text-outline hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors"
                aria-label="Post actions"
              >
                <MoreHorizontal size={24} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-11 z-20 w-40 rounded-2xl bg-surface-container-lowest shadow-lg border border-outline-variant/40 p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-low"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-on-error-container hover:bg-error-container"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-2xl bg-surface-container-low border border-outline-variant/40 px-4 py-3 text-base font-medium text-on-surface focus:ring-2 focus:ring-primary-container outline-none"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraftContent(post.content);
                  setIsEditing(false);
                }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low"
              >
                <X size={16} /> Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !draftContent.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-primary-container text-on-primary-container px-5 py-2 text-sm font-bold disabled:opacity-60 active:scale-95 transition-all"
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-lg font-medium text-on-surface mb-4 whitespace-pre-wrap">{post.content}</p>
        )}
      </div>

      {post.media.length > 0 && (
        <div className="px-4 pb-4 grid gap-3">
          {post.media.map((media) => (
            <div key={media.url} className="rounded-[1.5rem] overflow-hidden max-h-[420px] bg-surface-container-low">
              {media.type === 'VIDEO' ? (
                <video src={media.url} controls className="w-full max-h-[420px] object-cover" />
              ) : (
                <img alt="Post media" src={media.url} className="w-full max-h-[420px] object-cover" referrerPolicy="no-referrer" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="px-6 pb-6 pt-2">
        {reactionError && (
          <div className="mb-4 rounded-2xl bg-error-container px-4 py-3 text-sm font-bold text-on-error-container">
            {reactionError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 py-2 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-tertiary flex items-center justify-center">
              <ThumbsUp size={12} className="text-white fill-current" />
            </div>
            <CountPopover label={formatCount(reactionTotal, 'reaction', 'reactions')}>
              <ReactionBreakdown
                summary={post.reactionSummary}
                currentUserAvatarUrl={currentUserAvatarUrl}
              />
            </CountPopover>
          </div>
          <CountPopover
            label={formatCount(post.commentsCount, 'comment', 'comments')}
            align="right"
            onOpen={loadCommentsForPopover}
          >
            <CommentersPopover
              comments={comments}
              isLoading={isLoadingComments}
              commentsCount={post.commentsCount}
            />
          </CountPopover>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <ReactionPicker
            currentReaction={currentReaction}
            selectedReaction={selectedReaction}
            isReacting={isReacting}
            onSelect={handlePostReaction}
          />
          <button
            type="button"
            onClick={toggleComments}
            className="flex items-center justify-center gap-2 py-2 hover:bg-secondary-fixed rounded-full text-secondary transition-all text-sm font-bold active:scale-95"
          >
            <MessageSquare size={20} /> <span className="hidden sm:inline">Comment</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-2 hover:bg-tertiary-fixed rounded-full text-tertiary transition-all text-sm font-bold active:scale-95">
            <Share2 size={20} /> <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {isCommentsOpen && (
          <div className="mt-5 border-t border-outline-variant/30 pt-5">
            {commentError && (
              <div className="mb-4 rounded-2xl bg-error-container px-4 py-3 text-sm font-bold text-on-error-container">
                {commentError}
              </div>
            )}

            {isLoadingComments ? (
              <div className="rounded-2xl bg-surface-container-low px-4 py-4 text-center text-sm font-bold text-on-surface-variant">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-2xl bg-surface-container-low px-4 py-4 text-center text-sm font-bold text-on-surface-variant">
                No comments yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {topLevelComments(comments).map((comment) => renderCommentThread(comment))}
              </div>
            )}

            <form onSubmit={handleCreateComment} className="mt-4 flex gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                <img
                  alt="Your avatar"
                  src={currentUserAvatarUrl || fallbackAvatar}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 flex gap-2 rounded-2xl bg-surface-container-low px-4 py-2">
                <input
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder="Write a comment..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-on-surface outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !commentDraft.trim()}
                  className="shrink-0 text-secondary disabled:opacity-50 active:scale-95 transition-transform"
                  aria-label="Send comment"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onUpdate,
  onDelete,
  onReply,
  onReactionChange,
  depth = 0,
}: {
  comment: CommentResponse;
  currentUserId?: string;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReply: (commentId: string, content: string) => Promise<void>;
  onReactionChange: (commentId: string, summary: ReactionSummaryResponse) => void;
  depth?: number;
}) {
  const isOwner = comment.author.id === currentUserId;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isReactionMenuOpen, setIsReactionMenuOpen] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [reactionError, setReactionError] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const authorName = displayName(comment.author);
  const isNested = depth > 0;
  const isDeepNested = depth > 1;
  const currentReaction = comment.reactionSummary?.currentUserReaction;
  const selectedReaction = getReactionOption(currentReaction);
  const reactionTotal = getReactionTotal(comment.reactionSummary, comment.reactionsCount || 0);

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
      const summary = currentReaction === type
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
      setReplyError('Reply content is required.');
      return;
    }

    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyDraft);
      setReplyDraft('');
      setIsReplying(false);
    } catch (err) {
      setReplyError(getErrorMessage(err));
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="flex min-w-0 max-w-full gap-3">
      <div className={`${isNested ? 'h-8 w-8' : 'h-9 w-9'} rounded-full overflow-hidden shrink-0`}>
        <img
          alt={authorName}
          src={comment.author.avatarUrl || fallbackAvatar}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`${isNested ? 'rounded-2xl bg-surface-container-lowest border border-outline-variant/25' : 'rounded-2xl bg-surface-container-low'} ${isDeepNested ? 'px-3' : 'px-4'} py-3`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-on-surface">{authorName}</p>
              {isEditing ? (
                <textarea
                  value={draftContent}
                  onChange={(event) => setDraftContent(event.target.value)}
                  rows={2}
                  className="mt-2 w-full resize-none rounded-xl bg-surface-container-lowest px-3 py-2 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                />
              ) : (
                <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-on-surface">{comment.content}</p>
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
                <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
        <p className="hidden">
          {formatPostTime(comment.createdAt)}
          {comment.updatedAt !== comment.createdAt ? ' · edited' : ''}
        </p>
        <div className="hidden">
          <button
            type="button"
            onClick={() => setIsReactionMenuOpen((open) => !open)}
            disabled={isReacting}
            className={`text-[11px] font-bold active:scale-95 disabled:opacity-60 ${selectedReaction ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            {selectedReaction ? `${selectedReaction.icon} ${selectedReaction.label}` : 'React'}
          </button>
          {reactionTotal > 0 && (
            <span className="text-[11px] font-bold text-on-surface-variant">{reactionTotal}</span>
          )}
          {isReactionMenuOpen && (
            <div className="absolute bottom-6 left-2 z-30 flex gap-1 rounded-full border border-outline-variant/40 bg-surface-container-lowest px-2 py-2 shadow-lg">
              {reactionOptions.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => handleCommentReaction(option.type)}
                  className={`h-9 w-9 rounded-full text-lg transition-transform hover:scale-125 ${currentReaction === option.type ? 'bg-primary-container' : 'hover:bg-surface-container-low'}`}
                  aria-label={option.label}
                  title={option.label}
                >
                  {option.icon}
                </button>
              ))}
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
            <CountPopover label={formatCount(reactionTotal, 'reaction', 'reactions')}>
              <ReactionBreakdown summary={comment.reactionSummary} />
            </CountPopover>
          )}
        </div>
        {isReplying && (
          <div className="mt-2 px-4">
            <p className="mb-1 text-[11px] font-bold text-secondary">Replying to {authorName}</p>
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
          <p className="mt-1 px-4 text-[11px] font-bold text-on-error-container">{replyError}</p>
        )}
        {reactionError && (
          <p className="mt-1 px-4 text-[11px] font-bold text-on-error-container">{reactionError}</p>
        )}
      </div>
    </div>
  );
}

export default function HomeFeed() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profileName = useMemo(() => user?.displayName || user?.username || 'there', [user]);

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setPosts(await postService.listFeed());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!content.trim()) {
      setError('Post content is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await postService.create({
        content,
        media: mediaUrl.trim() ? [{ type: mediaType, url: mediaUrl.trim() }] : [],
      });
      setPosts((current) => [created, ...current]);
      setContent('');
      setMediaUrl('');
      setMessage('Post created successfully.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (postId: string, nextContent: string) => {
    setError(null);
    setMessage(null);
    try {
      const updated = await postService.update(postId, { content: nextContent });
      setPosts((current) => current.map((post) => (post.id === postId ? updated : post)));
      setMessage('Post updated successfully.');
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  };

  const handleDelete = async (postId: string) => {
    setError(null);
    setMessage(null);
    try {
      await postService.remove(postId);
      setPosts((current) => current.filter((post) => post.id !== postId));
      setMessage('Post deleted successfully.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCommentCountChange = (postId: string, delta: number) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: Math.max(0, post.commentsCount + delta) }
          : post
      )
    );
  };

  const handleReactionSummaryChange = (postId: string, summary: ReactionSummaryResponse) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, reactionsCount: summary.totalCount, reactionSummary: summary }
          : post
      )
    );
  };

  return (
    <Layout>
      <main className="px-6 md:px-8 py-8 min-h-screen xl:mr-[320px]">
        <header className="md:hidden flex justify-between items-center mb-6 mt-4">
          <h1 className="text-xl font-bold text-primary-container tracking-tight">MOMENTS</h1>
          <button className="text-on-surface-variant hover:text-primary" aria-label="Search">
            <Search size={24} />
          </button>
        </header>

        <div className="flex flex-col gap-6 pb-20 lg:pb-6 max-w-[600px] mx-auto md:max-w-none xl:max-w-[800px]">
          {(message || error) && (
            <div className={`rounded-2xl px-5 py-4 text-sm font-bold ${error ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
              {error || message}
            </div>
          )}

          <form onSubmit={handleCreate} className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)]">
            <div className="flex gap-4 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                <img
                  alt="Profile"
                  src={user?.avatarUrl || fallbackAvatar}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={3}
                placeholder={`What's on your mind, ${profileName}?`}
                className="w-full bg-surface-container-low focus:bg-surface-container-high text-left px-6 py-3 rounded-3xl text-on-surface text-base font-medium transition-colors border-none outline-none resize-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-[140px_1fr] mb-4">
              <select
                value={mediaType}
                onChange={(event) => setMediaType(event.target.value as 'IMAGE' | 'VIDEO')}
                className="bg-surface-container-low rounded-full px-4 py-3 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                aria-label="Media type"
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
              </select>
              <input
                type="url"
                value={mediaUrl}
                onChange={(event) => setMediaUrl(event.target.value)}
                placeholder="Optional image or video URL"
                className="bg-surface-container-low rounded-full px-5 py-3 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-between items-center pt-2 border-t border-outline-variant/30 mt-4">
              <div className="flex gap-2">
                <span className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-tertiary">
                  <ImageIcon size={20} /> Photo/Video
                </span>
                <span className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-secondary hidden sm:flex">
                  <Smile size={20} /> Feeling/Activity
                </span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="bg-primary-container text-on-primary-container px-8 py-2 rounded-full text-sm font-bold active:scale-95 transition-transform shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>

          {isLoading ? (
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 text-center text-on-surface-variant font-bold">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 text-center text-on-surface-variant font-bold">
              No posts yet.
            </div>
          ) : (
            posts.map((post) => (
              <React.Fragment key={post.id}>
                <PostCard
                  post={post}
                  currentUserId={user?.id}
                  currentUserAvatarUrl={user?.avatarUrl}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onCommentCountChange={handleCommentCountChange}
                  onReactionSummaryChange={handleReactionSummaryChange}
                />
              </React.Fragment>
            ))
          )}
        </div>
      </main>

      <aside className="fixed right-0 top-0 h-screen w-[320px] p-8 hidden xl:flex flex-col gap-6 bg-surface z-40 overflow-y-auto">
        <div className="relative w-full mb-2">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            placeholder="Search for joy..."
            className="w-full bg-surface-container-lowest border-none rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-container text-base font-medium transition-all shadow-[0_4px_12px_rgba(139,78,62,0.05)]"
          />
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)]">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="text-primary-container shrink-0" size={28} />
            <h2 className="text-xl font-bold text-on-surface">Birthdays</h2>
          </div>
          <p className="text-base font-medium text-on-surface-variant leading-snug">
            <span className="font-bold text-on-surface">Elena Vance</span> and <span className="font-bold text-on-surface">2 others</span> have birthdays today.
          </p>
          <button className="mt-4 w-full py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-bold active:scale-95 hover:bg-secondary-fixed transition-colors">
            View Birthdays
          </button>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-on-surface">Shortcuts</h2>
            <div className="flex gap-2 text-on-surface-variant">
              <Video size={20} />
              <Bell size={20} />
            </div>
          </div>
          <ul className="flex flex-col gap-2">
            {[
              { label: 'Saved Posts', icon: Bookmark },
              { label: 'Events', icon: Calendar },
              { label: 'Live Video', icon: Video },
            ].map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-4 hover:bg-surface-container-low p-3 rounded-[1rem] transition-all">
                <Icon size={20} className="text-primary" />
                <span className="text-base font-medium text-on-surface">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <button className="lg:hidden fixed bottom-20 right-6 w-14 h-14 bg-primary-container text-on-primary-container rounded-full shadow-[0_8px_16px_rgba(255,176,156,0.4)] flex items-center justify-center active:scale-95 transition-transform z-40">
        <Edit2 size={24} />
      </button>
    </Layout>
  );
}
