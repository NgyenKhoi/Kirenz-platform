import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Bell,
  Bookmark,
  Calendar,
  Gift,
  Video,
  Edit2,
} from "lucide-react";
import Layout from "./components/Layout";
import { postService } from "./services/post.service";
import { PostResponse } from "./types/post.types";
import { ReactionSummaryResponse } from "./types/reaction.types";
import { useAuthStore } from "./store/authStore";
import { getErrorMessage } from "./utils/post.utils";
import { PostCard } from "./components/Post/PostCard";
import { CreatePost } from "./components/Post/CreatePost";

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
        <header className="md:hidden flex justify-between items-center mb-6 mt-4">
          <h1 className="text-xl font-bold text-primary-container tracking-tight">
            MOMENTS
          </h1>
          <button
            className="text-on-surface-variant hover:text-primary"
            aria-label="Search"
          >
            <Search size={24} />
          </button>
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
        <div className="relative w-full mb-2">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
          />
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
            <span className="font-bold text-on-surface">Elena Vance</span> and{" "}
            <span className="font-bold text-on-surface">2 others</span> have
            birthdays today.
          </p>
          <button className="mt-4 w-full py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-bold active:scale-95 hover:bg-secondary-fixed transition-colors">
            View Birthdays
          </button>
        </div>
      </aside>

      <button className="lg:hidden fixed bottom-20 right-6 w-14 h-14 bg-primary-container text-on-primary-container rounded-full shadow-[0_8px_16px_rgba(255,176,156,0.4)] flex items-center justify-center active:scale-95 transition-transform z-40">
        <Edit2 size={24} />
      </button>
    </Layout>
  );
}
