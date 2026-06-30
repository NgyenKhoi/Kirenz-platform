import React, { useState, useEffect } from "react";
import { MoreHorizontal, Edit2, Trash2, X, Save, MessageSquare, Share2, ThumbsUp, Send, Image as ImageIcon } from "lucide-react";
import { PostResponse } from "../../types/post.types";
import { CommentResponse } from "../../types/comment.types";
import { ReactionSummaryResponse, ReactionType } from "../../types/reaction.types";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { commentService } from "../../services/comment.service";
import { postService } from "../../services/post.service";
import { reactionService } from "../../services/reaction.service";
import { friendService } from "../../services/friend.service";
import {
  displayName,
  formatPostTime,
  getErrorMessage,
  getReactionOption,
  getReactionTotal,
  formatCount,
  topLevelComments,
  repliesForComment,
  descendantComments,
} from "../../utils/post.utils";
import { fallbackAvatar } from "../../constants/post.constants";
import { PrivacyDropdown } from "../common/PrivacyDropdown";
import { PostMediaGallery } from "./PostMediaGallery";
import { CountPopover } from "../common/CountPopover";
import { ReactionBreakdown } from "./ReactionBreakdown";
import { CommentersPopover } from "./CommentersPopover";
import { ReactionPicker } from "./ReactionPicker";
import { CommentItem } from "./CommentItem";

interface PostCardProps {
  post: PostResponse;
  currentUserId?: string;
  currentUserAvatarUrl?: string | null;
  onUpdate: (
    postId: string,
    data: {
      content: string;
      privacy?: "PUBLIC" | "FRIENDS" | "ONLY_ME";
      media?: { type: "IMAGE" | "VIDEO"; url: string; publicId?: string | null }[];
    },
  ) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onShare: (postId: string, caption: string) => Promise<void>;
  onCommentCountChange: (postId: string, delta: number) => void;
  onReactionSummaryChange: (
    postId: string,
    summary: ReactionSummaryResponse,
  ) => void;
}

export function PostCard({
  post,
  currentUserId,
  currentUserAvatarUrl,
  onUpdate,
  onDelete,
  onShare,
  onCommentCountChange,
  onReactionSummaryChange,
}: PostCardProps) {
  const isOwner = post.author.id === currentUserId;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(post.content);
  const [draftPrivacy, setDraftPrivacy] = useState(post.privacy);
  const [draftImages, setDraftImages] = useState(post.media);
  const [newImages, setNewImages] = useState<{ id: string, file: File, previewUrl: string }[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [reactionError, setReactionError] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareCaption, setShareCaption] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isOriginalModalOpen, setIsOriginalModalOpen] = useState(false);
  const [originalPostDetail, setOriginalPostDetail] =
    useState<PostResponse | null>(null);
  const [isLoadingOriginalPost, setIsLoadingOriginalPost] = useState(false);
  const [originalPostError, setOriginalPostError] = useState<string | null>(
    null,
  );
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    type: "info",
    onConfirm: () => {},
  });

  useEffect(() => {
    setDraftContent(post.content);
    setDraftPrivacy(post.privacy);
    setDraftImages(post.media);
  }, [post.content, post.privacy, post.media]);

  useEffect(() => {
    return () => {
      newImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    };
  }, [newImages]);

  const authorName = displayName(post.author);
  const currentReaction = post.reactionSummary?.currentUserReaction;
  const selectedReaction = getReactionOption(currentReaction);
  const reactionTotal = getReactionTotal(
    post.reactionSummary,
    post.reactionsCount,
  );
  const sharedPost = post.sharedPost;

  const handleSave = () => {
    if (!draftContent.trim() && draftImages.length === 0 && newImages.length === 0) {
      return;
    }

    setConfirmState({
      isOpen: true,
      title: "Save Changes",
      message: "Are you sure you want to save changes to this post?",
      confirmLabel: "Save",
      type: "info",
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        setIsSaving(true);
        try {
          const uploadedMedia = newImages.length > 0 
            ? await postService.uploadImages(newImages.map(ni => ni.file))
            : [];
          
          const finalMedia = [
            ...draftImages,
            ...uploadedMedia.map(m => ({
              type: m.type,
              url: m.url,
              publicId: m.publicId
            }))
          ];

          await onUpdate(post.id, {
            content: draftContent,
            privacy: draftPrivacy,
            media: finalMedia
          });
          
          newImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
          setNewImages([]);
          setIsEditing(false);
          setIsMenuOpen(false);
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleDelete = () => {
    setConfirmState({
      isOpen: true,
      title: "Delete Post",
      message: "Are you sure you want to delete this post? This action cannot be undone.",
      confirmLabel: "Delete",
      type: "danger",
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        await onDelete(post.id);
      }
    });
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
      setCommentError("Comment content is required.");
      return;
    }

    setIsSubmittingComment(true);
    try {
      let taggedUserIds: string[] = [];
      try {
        const myFriends = await friendService.getFriends();
        const matches = commentDraft.match(/@(\w+)/g);
        if (matches) {
          const mentionedUsernames = matches.map(m => m.substring(1).toLowerCase());
          taggedUserIds = myFriends
            .filter(f => f.username && mentionedUsernames.includes(f.username.toLowerCase()))
            .map(f => f.friendId);
        }
      } catch (err) {
        console.error("Error matching tags in comment:", err);
      }

      const created = await commentService.create(post.id, {
        content: commentDraft,
        taggedUserIds,
      });
      setComments((current) => [...current, created]);
      setCommentDraft("");
      onCommentCountChange(post.id, 1);
    } catch (err) {
      setCommentError(getErrorMessage(err));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCreateReply = async (
    parentCommentId: string,
    content: string,
  ) => {
    setCommentError(null);
    try {
      let taggedUserIds: string[] = [];
      try {
        const myFriends = await friendService.getFriends();
        const matches = content.match(/@(\w+)/g);
        if (matches) {
          const mentionedUsernames = matches.map(m => m.substring(1).toLowerCase());
          taggedUserIds = myFriends
            .filter(f => f.username && mentionedUsernames.includes(f.username.toLowerCase()))
            .map(f => f.friendId);
        }
      } catch (err) {
        console.error("Error matching tags in reply:", err);
      }

      const created = await commentService.create(post.id, {
        content,
        parentCommentId,
        taggedUserIds,
      });
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
      const updated = await commentService.update(post.id, commentId, {
        content,
      });
      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId ? updated : comment,
        ),
      );
    } catch (err) {
      setCommentError(getErrorMessage(err));
      throw err;
    }
  };

  const handleDeleteComment = (commentId: string): Promise<void> => {
    setConfirmState({
      isOpen: true,
      title: "Delete Comment",
      message: "Are you sure you want to delete this comment? This action cannot be undone.",
      confirmLabel: "Delete",
      type: "danger",
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        setCommentError(null);
        try {
          await commentService.remove(post.id, commentId);
          const removedIds = new Set([
            commentId,
            ...descendantComments(comments, commentId).map((comment) => comment.id),
          ]);
          setComments((current) =>
            current.filter((comment) => !removedIds.has(comment.id)),
          );
          const removedCount = removedIds.size;
          onCommentCountChange(post.id, -removedCount);
        } catch (err) {
          setCommentError(getErrorMessage(err));
        }
      }
    });
    return Promise.resolve();
  };

  const renderCommentThread = (
    comment: CommentResponse,
    depth = 0,
  ): React.ReactNode => {
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
                  ? {
                    ...item,
                    reactionsCount: summary.totalCount,
                    reactionSummary: summary,
                  }
                  : item,
              ),
            );
          }}
          depth={depth}
        />
        {replies.length > 0 && (
          <div
            className={`flex flex-col gap-3 border-l border-outline-variant/40 pl-3 sm:pl-4 ${depth === 0 ? "ml-10 sm:ml-14" : "ml-6 sm:ml-8"
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
      const summary =
        currentReaction === type
          ? await reactionService.unreactToPost(post.id)
          : await reactionService.reactToPost(post.id, type);
      onReactionSummaryChange(post.id, summary);
    } catch (err) {
      setReactionError(getErrorMessage(err));
    } finally {
      setIsReacting(false);
    }
  };

  const handleShareSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setShareError(null);
    setIsSharing(true);
    try {
      await onShare(post.id, shareCaption);
      setShareCaption("");
      setIsShareOpen(false);
    } catch (err) {
      setShareError(getErrorMessage(err));
    } finally {
      setIsSharing(false);
    }
  };

  const openOriginalPost = async () => {
    if (!sharedPost?.available) {
      return;
    }

    setIsOriginalModalOpen(true);
    setOriginalPostError(null);

    if (originalPostDetail?.id === sharedPost.id) {
      return;
    }

    setIsLoadingOriginalPost(true);
    try {
      setOriginalPostDetail(await postService.getById(sharedPost.id));
    } catch (err) {
      setOriginalPostError(getErrorMessage(err));
      setOriginalPostDetail(null);
    } finally {
      setIsLoadingOriginalPost(false);
    }
  };

  const handleOriginalPostUpdate = async (postId: string, data: any) => {
    const updated = await postService.update(postId, data);
    setOriginalPostDetail(updated);
  };

  const handleOriginalPostDelete = async (postId: string) => {
    await onDelete(postId);
    setOriginalPostDetail(null);
    setOriginalPostError("This post is no longer available.");
  };

  const handleOriginalPostCommentCountChange = (
    postId: string,
    delta: number,
  ) => {
    setOriginalPostDetail((current) =>
      current && current.id === postId
        ? {
          ...current,
          commentsCount: Math.max(0, current.commentsCount + delta),
        }
        : current,
    );
  };

  const handleOriginalPostReactionSummaryChange = (
    postId: string,
    summary: ReactionSummaryResponse,
  ) => {
    setOriginalPostDetail((current) =>
      current && current.id === postId
        ? {
          ...current,
          reactionsCount: summary.totalCount,
          reactionSummary: summary,
        }
        : current,
    );
  };

  return (
    <>
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
                <h3 className="text-xl font-bold text-on-surface leading-tight">
                  {authorName}
                  {post.taggedUsers && post.taggedUsers.length > 0 && (
                    <span className="text-sm font-medium text-on-surface-variant">
                      {" "}is with{" "}
                      {post.taggedUsers.map((u, i) => (
                        <span key={u.id}>
                          {i > 0 && (i === post.taggedUsers!.length - 1 ? " and " : ", ")}
                          <span className="font-bold text-on-surface">{u.displayName || u.username || "Kirenz User"}</span>
                        </span>
                      ))}
                    </span>
                  )}
                </h3>
                <p className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                  {post.originalPostId
                    ? "Shared a post"
                    : formatPostTime(post.createdAt)}
                  {post.originalPostId && <span aria-hidden="true">.</span>}
                  {post.originalPostId && (
                    <span>{formatPostTime(post.createdAt)}</span>
                  )}
                  <span aria-hidden="true">.</span>
                  <PrivacyDropdown
                    value={isEditing ? (draftPrivacy === 'ONLY_ME' ? 'PRIVATE' : draftPrivacy) : (post.privacy === 'ONLY_ME' ? 'PRIVATE' : post.privacy)}
                    onChange={(val) => setDraftPrivacy(val === 'PRIVATE' ? 'ONLY_ME' : val)}
                    readOnly={!isOwner || !isEditing}
                    compact
                  />
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

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {draftImages.map((img, idx) => (
                  <div key={`${img.url}-${idx}`} className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container-low">
                    <img src={img.url} className="h-full w-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setDraftImages(current => current.filter((_, i) => i !== idx))}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest/90 text-on-surface shadow-sm active:scale-95"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {newImages.map((img) => (
                  <div key={img.id} className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container-low ring-2 ring-primary">
                    <img src={img.previewUrl} className="h-full w-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => {
                        URL.revokeObjectURL(img.previewUrl);
                        setNewImages(current => current.filter(i => i.id !== img.id));
                      }}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest/90 text-on-surface shadow-sm active:scale-95"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {(draftImages.length + newImages.length < 10) && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  >
                    <ImageIcon size={24} />
                    <span className="text-xs font-bold">Add Photo</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).filter((f: any) => f.type.startsWith('image/'));
                  e.target.value = "";
                  setNewImages(curr => [
                    ...curr,
                    ...files.map((f: File) => ({
                      id: `${f.name}-${Date.now()}-${Math.random()}`,
                      file: f,
                      previewUrl: URL.createObjectURL(f)
                    }))
                  ].slice(0, 10 - draftImages.length));
                }}
                className="hidden"
              />

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraftContent(post.content);
                    setDraftPrivacy(post.privacy);
                    setDraftImages(post.media);
                    newImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
                    setNewImages([]);
                    setIsEditing(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || (!draftContent.trim() && draftImages.length === 0 && newImages.length === 0)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-container text-on-primary-container px-5 py-2 text-sm font-bold disabled:opacity-60 active:scale-95 transition-all"
                >
                  <Save size={16} /> {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            post.content.trim() && (
              <p className="text-lg font-medium text-on-surface mb-4 whitespace-pre-wrap">
                {post.content}
              </p>
            )
          )}
        </div>

        <PostMediaGallery media={post.media} />

        {sharedPost && (
          <div className="px-4 pb-4">
            {sharedPost.available ? (
              <div
                role="button"
                tabIndex={0}
                onClick={openOriginalPost}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    void openOriginalPost();
                  }
                }}
                className="overflow-hidden rounded-[1.5rem] border border-outline-variant/40 bg-surface-container-lowest cursor-pointer transition-colors hover:bg-surface-container-low"
              >
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <img
                      alt={
                        sharedPost.author?.displayName ||
                        sharedPost.author?.username ||
                        "Kirenz User"
                      }
                      src={sharedPost.author?.avatarUrl || fallbackAvatar}
                      className="h-9 w-9 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-on-surface">
                        {sharedPost.author?.displayName ||
                          sharedPost.author?.username ||
                          "Kirenz User"}
                      </p>
                      <p className="text-[11px] font-bold text-on-surface-variant">
                        {sharedPost.createdAt
                          ? formatPostTime(sharedPost.createdAt)
                          : ""}
                      </p>
                    </div>
                  </div>
                  {sharedPost.content && (
                    <p className="whitespace-pre-wrap text-sm font-medium text-on-surface">
                      {sharedPost.content}
                    </p>
                  )}
                </div>
                <PostMediaGallery media={sharedPost.media} />
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-outline-variant/60 bg-surface-container-low px-4 py-5 text-sm font-bold text-on-surface-variant">
                This shared post is no longer available.
              </div>
            )}
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
              <CountPopover
                label={formatCount(reactionTotal, "reaction", "reactions")}
              >
                <ReactionBreakdown
                  summary={post.reactionSummary}
                  currentUserAvatarUrl={currentUserAvatarUrl}
                />
              </CountPopover>
            </div>
            <CountPopover
              label={formatCount(post.commentsCount, "comment", "comments")}
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
              <MessageSquare size={20} />{" "}
              <span className="hidden sm:inline">Comment</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShareError(null);
                setIsShareOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-2 hover:bg-tertiary-fixed rounded-full text-tertiary transition-all text-sm font-bold active:scale-95"
            >
              <Share2 size={20} />{" "}
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          {isShareOpen && (
            <div className="mt-4 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4">
              <form onSubmit={handleShareSubmit} className="space-y-3">
                <textarea
                  value={shareCaption}
                  onChange={(event) => setShareCaption(event.target.value)}
                  rows={3}
                  placeholder="Say something about this post..."
                  className="w-full resize-none rounded-2xl bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-tertiary-container"
                />
                {shareError && (
                  <p className="text-xs font-bold text-on-error-container">
                    {shareError}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsShareOpen(false);
                      setShareCaption("");
                    }}
                    className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSharing}
                    className="inline-flex items-center gap-1 rounded-full bg-tertiary-container px-5 py-2 text-xs font-bold text-on-tertiary-container disabled:opacity-60 active:scale-95"
                  >
                    <Share2 size={14} />{" "}
                    {isSharing ? "Sharing..." : "Share now"}
                  </button>
                </div>
              </form>
            </div>
          )}

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
                  {topLevelComments(comments).map((comment) =>
                    renderCommentThread(comment),
                  )}
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
      {isOriginalModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-[760px]">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOriginalModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-lg hover:bg-surface-container-low"
                aria-label="Close shared post detail"
              >
                <X size={20} />
              </button>
            </div>
            {isLoadingOriginalPost ? (
              <div className="rounded-[2rem] bg-surface-container-lowest p-8 text-center text-sm font-bold text-on-surface-variant shadow-xl">
                Loading original post...
              </div>
            ) : originalPostDetail ? (
              <PostCard
                post={originalPostDetail}
                currentUserId={currentUserId}
                currentUserAvatarUrl={currentUserAvatarUrl}
                onUpdate={handleOriginalPostUpdate}
                onDelete={handleOriginalPostDelete}
                onShare={onShare}
                onCommentCountChange={handleOriginalPostCommentCountChange}
                onReactionSummaryChange={
                  handleOriginalPostReactionSummaryChange
                }
              />
            ) : (
              <div className="rounded-[2rem] border border-dashed border-outline-variant/60 bg-surface-container-lowest p-8 text-center text-sm font-bold text-on-surface-variant shadow-xl">
                {originalPostError || "This post is no longer available."}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        type={confirmState.type}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
