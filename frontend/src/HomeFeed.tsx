import React, { useEffect, useMemo, useState } from "react";
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
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profileName = useMemo(
    () => user?.displayName || user?.username || "there",
    [user],
  );

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
            posts.map((post) => (
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
            ))
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
