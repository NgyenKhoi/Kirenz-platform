import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, Bell, Bookmark, Calendar, Image as ImageIcon, Smile,
  Globe, MoreHorizontal, Heart, MessageSquare, Share2, ThumbsUp,
  Gift, Video, Edit2, Save, Trash2, X
} from 'lucide-react';
import { AxiosError } from 'axios';
import Layout from './components/Layout';
import { postService } from './services/post.service';
import { ErrorResponse } from './types/auth.types';
import { PostResponse } from './types/post.types';
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

function PostCard({
  post,
  currentUserId,
  onUpdate,
  onDelete,
}: {
  post: PostResponse;
  currentUserId?: string;
  onUpdate: (postId: string, content: string) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
}) {
  const isOwner = post.author.id === currentUserId;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftContent(post.content);
  }, [post.content]);

  const authorName = post.author.displayName || post.author.username || 'Kirenz User';

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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 py-2 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-tertiary flex items-center justify-center">
              <ThumbsUp size={12} className="text-white fill-current" />
            </div>
            <span className="text-xs font-bold text-on-surface-variant">{post.reactionsCount} reactions</span>
          </div>
          <span className="text-xs font-bold text-on-surface-variant">{post.commentsCount} comments</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button className="flex items-center justify-center gap-2 py-2 hover:bg-primary-fixed rounded-full text-primary transition-all text-sm font-bold active:scale-95">
            <Heart size={20} /> <span className="hidden sm:inline">Love</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-2 hover:bg-secondary-fixed rounded-full text-secondary transition-all text-sm font-bold active:scale-95">
            <MessageSquare size={20} /> <span className="hidden sm:inline">Comment</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-2 hover:bg-tertiary-fixed rounded-full text-tertiary transition-all text-sm font-bold active:scale-95">
            <Share2 size={20} /> <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </article>
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
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
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
