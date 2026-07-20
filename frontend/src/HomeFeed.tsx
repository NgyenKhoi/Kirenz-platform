import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { UserPlus } from "lucide-react";
import Layout from "./components/Layout";
import { postService } from "./services/post.service";
import { PostResponse } from "./types/post.types";
import { ReactionSummaryResponse } from "./types/reaction.types";
import { useAuthStore } from "./store/authStore";
import { getErrorMessage } from "./utils/post.utils";
import { PostCard } from "./components/Post/PostCard";
import { CreatePost } from "./components/Post/CreatePost";
import { friendService } from "./services/friend.service";
import { FriendSuggestionResponse } from "./types/friend.types";

export default function HomeFeed() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const targetPostId = searchParams.get("postId");
  const notificationId = searchParams.get("notificationId");
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<FriendSuggestionResponse[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [requestingUserId, setRequestingUserId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const profileName = useMemo(
    () => user?.displayName || user?.username || "there",
    [user],
  );

  const loadPosts = async (focusedPostId?: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const page = await postService.listFeedPage();
      const feedPosts = page.items;
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
      if (!focusedPostId || feedPosts.some((post) => post.id === focusedPostId)) {
        setPosts(feedPosts);
        return;
      }

      try {
        const focusedPost = await postService.getById(focusedPostId);
        setPosts([focusedPost, ...feedPosts]);
      } catch {
        setPosts(feedPosts);
        setError("The post from this notification is unavailable or you no longer have access to it.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const page = await postService.listFeedPage(nextCursor);
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
  }, [hasMore, isLoadingMore, nextCursor]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) void loadMore(); },
      { rootMargin: "300px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    void loadPosts(targetPostId);
  }, [targetPostId]);

  useEffect(() => {
    let active = true;
    friendService.getSuggestions(6)
      .then((items) => { if (active) setSuggestions(items); })
      .catch(() => { if (active) setSuggestions([]); })
      .finally(() => { if (active) setSuggestionsLoading(false); });
    return () => { active = false; };
  }, []);

  const sendSuggestionRequest = async (suggestion: FriendSuggestionResponse) => {
    setRequestingUserId(suggestion.id);
    try {
      await friendService.sendRequest({ receiverId: suggestion.id });
      setSuggestions((current) => current.filter((item) => item.id !== suggestion.id));
      setMessage(`Friend request sent to ${suggestion.displayName || suggestion.username || 'this user'}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRequestingUserId(null);
    }
  };

  useEffect(() => {
    if (!targetPostId || isLoading) return;

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(`post-${targetPostId}`);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedPostId(targetPostId);
    });
    const timer = window.setTimeout(() => setHighlightedPostId(null), 3000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [targetPostId, notificationId, isLoading]);

  const handlePostCreated = (newPost: PostResponse) => {
    setPosts((current) => [newPost, ...current]);
  };

  const handleUpdate = async (postId: string, data: any) => {
    setError(null);
    setMessage(null);
    try {
      const updated = await postService.update(postId, data);
      setPosts((current) =>
        current.map((post) => (post.id === postId ? updated : post)),
      );
      setMessage("Post updated successfully.");
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
      setMessage("Post deleted successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleShare = async (postId: string, caption: string) => {
    setError(null);
    setMessage(null);
    try {
      const shared = await postService.share(postId, { caption });
      setPosts((current) => [shared, ...current]);
      setMessage("Post shared successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  };

  const handleCommentCountChange = (postId: string, delta: number) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: Math.max(0, post.commentsCount + delta) }
          : post,
      ),
    );
  };

  const handleReactionSummaryChange = (
    postId: string,
    summary: ReactionSummaryResponse,
  ) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
            ...post,
            reactionsCount: summary.totalCount,
            reactionSummary: summary,
          }
          : post,
      ),
    );
  };

  return (
    <Layout>
      <main className="px-6 md:px-8 py-8 min-h-screen xl:mr-[320px]">
        <header className="md:hidden flex items-center mb-6 mt-4">
          <h1 className="text-xl font-bold text-primary-container tracking-tight">
            MOMENTS
          </h1>
        </header>

        <div className="flex flex-col gap-6 pb-20 lg:pb-6 max-w-[600px] mx-auto md:max-w-none xl:max-w-[800px]">
          {(message || error) && (
            <div
              className={`rounded-2xl px-5 py-4 text-sm font-bold ${error ? "bg-error-container text-on-error-container" : "bg-primary-container text-on-primary-container"}`}
            >
              {error || message}
            </div>
          )}

          <CreatePost
            user={user}
            profileName={profileName}
            onPostCreated={handlePostCreated}
            onMessage={setMessage}
            onError={setError}
          />

          {isLoading ? (
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 text-center text-on-surface-variant font-bold">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 text-center text-on-surface-variant font-bold">
              No posts yet.
            </div>
          ) : (
            <>
            {posts.map((post) => (
              <div
                id={`post-${post.id}`}
                key={post.id}
                className={`scroll-mt-24 rounded-[2rem] transition-all duration-500 ${highlightedPostId === post.id ? "ring-4 ring-primary/60 shadow-[0_0_0_10px_rgba(139,78,62,0.12)]" : "ring-0 ring-transparent"}`}
              >
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
              </div>
            ))}
            <div ref={loadMoreRef} className="py-3 text-center text-sm font-bold text-on-surface-variant">
              {loadMoreError ? (
                <button type="button" onClick={() => void loadMore()} className="rounded-full bg-error-container px-4 py-2 text-on-error-container">
                  Could not load more. Retry
                </button>
              ) : isLoadingMore ? "Loading more posts..." : null}
            </div>
            </>
          )}
        </div>
      </main>

      <aside className="fixed right-0 top-0 h-screen w-[320px] p-8 hidden xl:flex flex-col gap-6 bg-surface z-40 overflow-y-auto">
        <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface">People you may know</h2>
            <Link to="/friends" className="text-xs font-bold text-primary hover:underline">See all</Link>
          </div>
          {suggestionsLoading ? (
            <div className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-2xl bg-surface-container" />)}</div>
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No friend-of-friend suggestions yet.</p>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => {
                const name = suggestion.displayName || suggestion.username || 'Kirenz User';
                return <div key={suggestion.id} className="flex items-center gap-3">
                  <Link to={`/profile/${suggestion.id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 hover:bg-surface-container">
                    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-container font-bold text-on-primary-container">{suggestion.avatarUrl ? <img src={suggestion.avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : name.slice(0, 1).toUpperCase()}</span>
                    <span className="min-w-0"><span className="block truncate text-sm font-bold text-on-surface">{name}</span><span className="block text-xs text-on-surface-variant">{suggestion.mutualFriendCount} mutual friend{suggestion.mutualFriendCount === 1 ? '' : 's'}</span></span>
                  </Link>
                  <button type="button" disabled={requestingUserId === suggestion.id} onClick={() => void sendSuggestionRequest(suggestion)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-container text-on-primary-container disabled:opacity-50" aria-label={`Add ${name} as friend`}><UserPlus size={17} /></button>
                </div>;
              })}
            </div>
          )}
        </div>
      </aside>
    </Layout>
  );
}
