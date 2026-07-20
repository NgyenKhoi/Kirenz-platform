import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCallback, useRef } from 'react';
import { Compass, FileText, Hash, Loader2, Search, Send, TrendingUp, UserPlus, Users } from 'lucide-react';
import Layout from './components/Layout';
import { PostCard } from './components/Post/PostCard';
import { friendService } from './services/friend.service';
import { postService } from './services/post.service';
import { useAuthStore } from './store/authStore';
import { UserSearchResponse } from './types/friend.types';
import { PostResponse, TrendingHashtagResponse } from './types/post.types';
import { ReactionSummaryResponse } from './types/reaction.types';
import { getErrorMessage } from './utils/post.utils';

export default function Explore() {
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [users, setUsers] = useState<UserSearchResponse[]>([]);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtagResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoadingPosts(true);
    postService.trending()
      .then((data) => {
        if (active) setTrendingHashtags(data || []);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setIsLoadingPosts(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const value = submittedQuery.trim().replace(/^#/, '');
    if (value.length < 2) {
      setPosts([]);
      setHasMore(false);
      setNextCursor(null);
      return;
    }
    let active = true;
    setIsLoadingPosts(true);
    setLoadMoreError(null);
    postService.explore(submittedQuery)
      .then((page) => {
        if (!active) return;
        setPosts(page.items);
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      })
      .catch((err) => { if (active) setError(getErrorMessage(err)); })
      .finally(() => { if (active) setIsLoadingPosts(false); });
    return () => { active = false; };
  }, [submittedQuery]);

  useEffect(() => {
    const value = submittedQuery.trim();
    if (value.length < 2) {
      setUsers([]);
      setIsSearchingUsers(false);
      return;
    }

    let active = true;
    setIsSearchingUsers(true);
    friendService.searchUsers(value, 12)
      .then((results) => {
        if (active) {
          setUsers(results || []);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setUsers([]);
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (active) setIsSearchingUsers(false);
      });

    return () => {
      active = false;
    };
  }, [submittedQuery]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const page = await postService.explore(submittedQuery, nextCursor);
      setPosts((current) => {
        const known = new Set(current.map((post) => post.id));
        return [...current, ...page.items.filter((post) => !known.has(post.id))];
      });
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (err) {
      setLoadMoreError(getErrorMessage(err));
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, nextCursor, submittedQuery]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void loadMore();
    }, { rootMargin: '300px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore]);

  const hasSearched = submittedQuery.trim().length > 0;
  const canSearch = query.trim().replace(/^#/, '').length >= 2;

  const submitSearchValue = (value: string) => {
    const nextQuery = value.trim();
    if (nextQuery.replace(/^#/, '').length < 2) return;
    setQuery(nextQuery);
    setSubmittedQuery(nextQuery);
    setMessage(null);
    setError(null);
  };

  const handleSearch = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    submitSearchValue(query);
  };

  const handleTrendingClick = (tag: string) => {
    submitSearchValue(`#${tag}`);
  };

  const handleSendRequest = async (receiverId: string) => {
    setActionId(receiverId);
    setMessage(null);
    setError(null);
    try {
      await friendService.sendRequest({ receiverId });
      setUsers((current) =>
        current.map((item) =>
          item.id === receiverId ? { ...item, relationshipStatus: 'OUTGOING_REQUEST' } : item
        )
      );
      setMessage('Friend request sent.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const handleUpdate = async (postId: string, data: any) => {
    const updated = await postService.update(postId, data);
    setPosts((current) => current.map((post) => (post.id === postId ? updated : post)));
  };

  const handleDelete = async (postId: string) => {
    await postService.remove(postId);
    setPosts((current) => current.filter((post) => post.id !== postId));
  };

  const handleShare = async (postId: string, caption: string) => {
    const shared = await postService.share(postId, { caption });
    setPosts((current) => [shared, ...current]);
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
      <main className="min-h-screen px-4 py-8 sm:px-6 md:px-8">
        <div className="mx-auto flex max-w-[920px] flex-col gap-6 pb-20 md:pb-8">
          <header className="mt-8 md:mt-0">
            <div className="flex items-center gap-3 text-primary">
              <Compass size={24} />
              <p className="text-sm font-bold uppercase tracking-[0.08em]">Explore</p>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-on-surface">Search results</h1>
          </header>

          <section className="rounded-3xl border border-surface-container bg-surface-container-lowest p-5 shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)]">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search people, post content, or #hashtag"
                  className="w-full rounded-2xl border border-outline-variant bg-surface-container py-3 pl-12 pr-4 text-sm font-medium text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-container/20"
                />
              </div>
              <button
                type="submit"
                disabled={!canSearch}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-all hover:brightness-95 active:scale-95 disabled:opacity-50"
              >
                <Search size={18} />
                Search
              </button>
            </form>
          </section>

          {(message || error) && (
            <div className={`rounded-2xl px-5 py-4 text-sm font-bold ${error ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
              {error || message}
            </div>
          )}

          <ResultSection
            icon={<TrendingUp size={22} />}
            title="Trending"
            count={trendingHashtags.length}
          >
            {isLoadingPosts ? (
              <LoadingState text="Loading trending hashtags..." />
            ) : trendingHashtags.length === 0 ? (
              <EmptyState text="No hashtags found in posts yet." />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {trendingHashtags.map((item, index) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleTrendingClick(item.tag)}
                    className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md ${submittedQuery === `#${item.tag}` ? 'border-primary bg-primary-container/25' : 'border-outline-variant bg-surface-container-low'}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                        <Hash size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-on-surface">#{item.tag}</p>
                        <p className="text-xs font-medium text-on-surface-variant">
                          {item.postCount} related post{item.postCount === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-surface-container px-2.5 py-1 text-xs font-bold text-primary">
                      #{index + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </ResultSection>

          {!hasSearched ? (
            <EmptyState text="Type a search and press Enter to see people first, then related posts." />
          ) : submittedQuery.trim().replace(/^#/, '').length < 2 ? (
            <EmptyState text="Type at least 2 characters to search." />
          ) : (
            <>
              <ResultSection
                icon={<Users size={22} />}
                title="People"
                count={users.length}
              >
                {isSearchingUsers ? (
                  <LoadingState text="Searching people..." />
                ) : users.length === 0 ? (
                  <EmptyState text="No people matched that search." />
                ) : (
                  <div className="space-y-3">
                    {users.map((result) => {
                      const displayName = result.displayName || result.username || 'Kirenz User';
                      const canSendRequest = result.relationshipStatus === 'NONE';
                      return (
                        <article key={result.id} className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-4 sm:flex-row sm:items-center">
                          <Link to={`/profile/${result.id}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container text-on-primary-container font-bold">
                              {result.avatarUrl ? (
                                <img src={result.avatarUrl} alt={displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                displayName.slice(0, 1).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-on-surface">{displayName}</p>
                              <p className="truncate text-xs font-bold text-primary">@{result.username}</p>
                              {result.bio && <p className="mt-1 line-clamp-1 text-xs text-on-surface-variant">{result.bio}</p>}
                            </div>
                          </Link>
                          <div className="flex gap-2 sm:shrink-0">
                            <Link
                              to={`/profile/${result.id}`}
                              className="inline-flex items-center justify-center rounded-full bg-secondary-container px-4 py-2 text-sm font-bold text-on-secondary-container transition-all hover:brightness-95 active:scale-95"
                            >
                              View profile
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleSendRequest(result.id)}
                              disabled={!canSendRequest || actionId === result.id}
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-all hover:brightness-95 active:scale-95 disabled:opacity-60"
                            >
                              {actionId === result.id ? <Loader2 size={16} className="animate-spin" /> : canSendRequest ? <Send size={16} /> : <UserPlus size={16} />}
                              {canSendRequest ? 'Add' : result.relationshipStatus.replaceAll('_', ' ')}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </ResultSection>

              <ResultSection
                icon={<FileText size={22} />}
                title="Related Posts"
                count={posts.length}
              >
                {isLoadingPosts ? (
                  <LoadingState text="Loading posts..." />
                ) : posts.length === 0 ? (
                  <EmptyState text="No posts matched that search." />
                ) : (
                  <div className="flex flex-col gap-6">
                    {posts.map((post) => (
                      <React.Fragment key={post.id}>
                        <PostCard
                          post={post}
                          currentUserId={user?.id}
                          currentUserAvatarUrl={user?.avatarUrl}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                          onShare={handleShare}
                          onCommentCountChange={handleCommentCountChange}
                          onReactionSummaryChange={handleReactionSummaryChange}
                        />
                      </React.Fragment>
                    ))}
                    <div ref={loadMoreRef} className="py-3 text-center text-sm font-bold text-on-surface-variant">
                      {loadMoreError ? (
                        <button type="button" onClick={() => void loadMore()} className="rounded-full bg-error-container px-4 py-2 text-on-error-container">
                          Could not load more. Retry
                        </button>
                      ) : isLoadingMore ? 'Loading more posts...' : null}
                    </div>
                  </div>
                )}
              </ResultSection>
            </>
          )}
        </div>
      </main>
    </Layout>
  );
}

function ResultSection({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-surface-container bg-surface-container-lowest p-5 shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-primary">
          {icon}
          <h2 className="text-xl font-bold text-on-surface">{title}</h2>
        </div>
        <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-on-surface-variant">
          {count}
        </span>
      </div>
      {children}
    </section>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-surface-container bg-surface-container-low p-8 text-sm font-bold text-on-surface-variant">
      <Loader2 size={18} className="animate-spin text-primary" />
      {text}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-8 text-center text-sm font-bold text-on-surface-variant">
      {text}
    </div>
  );
}
