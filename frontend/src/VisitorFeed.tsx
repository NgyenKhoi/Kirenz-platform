import { useEffect, useMemo, useState } from 'react';
import { Link2, Loader2, LogIn, MessageSquare, Share2, ThumbsUp } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { fallbackAvatar } from './constants/post.constants';
import { postService } from './services/post.service';
import { useAuthStore } from './store/authStore';
import { PostMediaResponse, PostResponse } from './types/post.types';
import { formatPostTime, getErrorMessage } from './utils/post.utils';

const loginTarget = (returnTo: string) =>
  `/login?returnTo=${encodeURIComponent(returnTo)}`;

function PublicMedia({ media }: { media: PostMediaResponse[] }) {
  if (!media.length) return null;

  return (
    <div className={`grid gap-1 overflow-hidden bg-surface-container ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {media.slice(0, 4).map((item, index) => (
        item.type === 'VIDEO' ? (
          <video
            key={`${item.url}-${index}`}
            src={item.url}
            controls
            preload="metadata"
            className="max-h-[520px] w-full bg-black object-contain"
          />
        ) : (
          <img
            key={`${item.url}-${index}`}
            src={item.url}
            alt="Public post media"
            className="max-h-[520px] w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )
      ))}
    </div>
  );
}

export default function VisitorFeed() {
  const { postId } = useParams<{ postId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const returnTo = useMemo(
    () => `${location.pathname}${location.search}`,
    [location.pathname, location.search],
  );

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    const request = postId
      ? postService.getPublicById(postId).then((post) => [post])
      : postService.listPublic();

    request
      .then((rows) => {
        if (active) setPosts(rows);
      })
      .catch((requestError) => {
        if (active) {
          setPosts([]);
          setError(postId ? 'This public post is unavailable.' : getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [postId]);

  const requireLogin = () => navigate(loginTarget(returnTo));

  const copyPublicLink = async (post: PostResponse) => {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedPostId(post.id);
      window.setTimeout(() => setCopiedPostId(null), 1800);
    } catch {
      window.prompt('Copy this public post link:', url);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bright text-on-surface">
      <header className="sticky top-0 z-40 border-b border-outline-variant/20 bg-surface-container-lowest/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-[920px] items-center justify-between gap-4">
          <Link to="/" className="text-xl font-black tracking-tight text-primary">MOMENTS</Link>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/home" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary">
                Open my feed
              </Link>
            ) : (
              <>
                <Link to={loginTarget(returnTo)} className="rounded-full px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary-container/30">
                  Sign in
                </Link>
                <Link to="/register" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary">
                  Join Moments
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-4 py-8 pb-16 sm:px-6">
        <section className="mb-6 rounded-[2rem] bg-primary-container/25 px-6 py-5">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">Public moments</p>
          <h1 className="mt-1 text-2xl font-black">See what people are sharing</h1>
          <p className="mt-2 text-sm font-medium text-on-surface-variant">
            You are browsing as a visitor. Public posts are readable; sign in to react, comment, view discussions, or share a post to your own feed.
          </p>
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-[2rem] bg-surface-container-lowest p-10 font-bold text-on-surface-variant">
            <Loader2 className="animate-spin text-primary" size={22} /> Loading public posts...
          </div>
        ) : error ? (
          <div className="rounded-[2rem] bg-error-container p-8 text-center font-bold text-on-error-container">
            {error}
            <div className="mt-5">
              <Link to="/" className="rounded-full bg-on-error-container px-5 py-2.5 text-sm text-error-container">Browse public feed</Link>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-[2rem] bg-surface-container-lowest p-10 text-center font-bold text-on-surface-variant">No public posts yet.</div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-[0_16px_40px_-28px_rgba(28,28,24,0.5)]">
                <div className="p-6">
                  <button type="button" onClick={requireLogin} className="flex items-center gap-3 text-left">
                    <img
                      src={post.author.avatarUrl || fallbackAvatar}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span>
                      <span className="block font-black">{post.author.displayName || post.author.username || 'Kirenz User'}</span>
                      <span className="block text-xs font-bold text-on-surface-variant">{formatPostTime(post.createdAt)} · Public</span>
                    </span>
                  </button>
                  {post.content && <p className="mt-4 whitespace-pre-wrap text-base font-medium leading-7">{post.content}</p>}
                </div>

                <PublicMedia media={post.media} />

                <div className="px-6 py-4">
                  <div className="mb-3 flex items-center justify-between text-xs font-bold text-on-surface-variant">
                    <button type="button" onClick={requireLogin} className="hover:text-primary">
                      {post.reactionsCount} reactions
                    </button>
                    <button type="button" onClick={requireLogin} className="hover:text-primary">
                      {post.commentsCount} comments
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 border-t border-outline-variant/20 pt-3">
                    <button type="button" onClick={requireLogin} className="flex items-center justify-center gap-2 rounded-full py-2 text-sm font-bold text-primary hover:bg-primary-container/30">
                      <ThumbsUp size={18} /> <span className="hidden sm:inline">Like</span>
                    </button>
                    <button type="button" onClick={requireLogin} className="flex items-center justify-center gap-2 rounded-full py-2 text-sm font-bold text-secondary hover:bg-secondary-container/40">
                      <MessageSquare size={18} /> <span className="hidden sm:inline">Comment</span>
                    </button>
                    <button type="button" onClick={requireLogin} className="flex items-center justify-center gap-2 rounded-full py-2 text-sm font-bold text-tertiary hover:bg-tertiary-container/40">
                      <Share2 size={18} /> <span className="hidden sm:inline">Repost</span>
                    </button>
                    <button type="button" onClick={() => void copyPublicLink(post)} className="flex items-center justify-center gap-2 rounded-full py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high">
                      <Link2 size={18} /> <span className="hidden sm:inline">{copiedPostId === post.id ? 'Copied' : 'Copy link'}</span>
                    </button>
                  </div>
                  <button type="button" onClick={requireLogin} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-surface-container-low py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high">
                    <LogIn size={17} /> Sign in to view the discussion
                  </button>
                  {!postId && (
                    <Link to={`/posts/${post.id}`} className="mt-3 block text-center text-xs font-bold text-primary hover:underline">
                      Open public permalink
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
