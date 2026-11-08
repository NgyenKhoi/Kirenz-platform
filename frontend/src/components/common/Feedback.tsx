import React, { useEffect } from "react";
import { CheckCircle2, Loader2, TriangleAlert, X } from "lucide-react";

const bone = "animate-pulse rounded-full bg-surface-container-high";

/** Placeholder shaped like a PostCard, shown while a feed loads. */
export function PostCardSkeleton({ withMedia = false }: { withMedia?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-[0_14px_34px_-22px_rgba(28,28,24,0.35)]"
    >
      <div className="mb-5 flex items-center gap-4">
        <div className={`${bone} h-11 w-11 shrink-0`} />
        <div className="flex-1 space-y-2">
          <div className={`${bone} h-4 w-40`} />
          <div className={`${bone} h-3 w-24`} />
        </div>
      </div>
      <div className="space-y-2.5">
        <div className={`${bone} h-3.5 w-full`} />
        <div className={`${bone} h-3.5 w-11/12`} />
        <div className={`${bone} h-3.5 w-2/3`} />
      </div>
      {withMedia && <div className="mt-5 h-56 animate-pulse rounded-3xl bg-surface-container-high" />}
      <div className="mt-6 flex gap-3 border-t border-outline-variant/10 pt-4">
        <div className={`${bone} h-9 flex-1`} />
        <div className={`${bone} h-9 flex-1`} />
        <div className={`${bone} h-9 flex-1`} />
      </div>
    </div>
  );
}

export function PostListSkeleton({ count = 3, label = "Loading posts" }: { count?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-6">
      {Array.from({ length: count }, (_, index) => (
        <React.Fragment key={index}>
          <PostCardSkeleton withMedia={index === 0} />
        </React.Fragment>
      ))}
    </div>
  );
}

/** Placeholder for a list of people (avatar + two lines + action). */
export function UserRowSkeleton({ count = 3, label = "Loading people" }: { count?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-2xl p-2">
          <div className={`${bone} h-11 w-11 shrink-0`} />
          <div className="flex-1 space-y-2">
            <div className={`${bone} h-3.5 w-1/2`} />
            <div className={`${bone} h-3 w-1/3`} />
          </div>
          <div className={`${bone} h-9 w-9 shrink-0`} />
        </div>
      ))}
    </div>
  );
}

/** Footer for infinite lists: spinner while loading, retry button on error. */
export function LoadMoreStatus({
  isLoading,
  error,
  onRetry,
  hasMore,
}: {
  isLoading: boolean;
  error: boolean;
  onRetry: () => void;
  hasMore: boolean;
}) {
  if (error) {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-error-container px-4 py-2 text-on-error-container transition-transform active:scale-95"
      >
        Could not load more. Retry
      </button>
    );
  }
  if (isLoading) {
    return (
      <span role="status" className="inline-flex items-center gap-2">
        <Loader2 size={16} className="animate-spin text-primary" /> Loading more posts
      </span>
    );
  }
  if (!hasMore) {
    return <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">You're all caught up</span>;
  }
  return null;
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex animate-fade-in-up flex-col items-center rounded-[2rem] border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-10 text-center">
      {icon && (
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary-container/40 text-primary">{icon}</div>
      )}
      <p className="text-base font-bold text-on-surface">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const SUCCESS_DISMISS_MS = 4000;

/** Inline banner: success auto-dismisses, errors stay until closed. */
export function FlashMessage({
  message,
  error,
  onDismiss,
}: {
  message?: string | null;
  error?: string | null;
  onDismiss: () => void;
}) {
  const text = error || message;

  useEffect(() => {
    if (!text || error) return;
    const timer = window.setTimeout(onDismiss, SUCCESS_DISMISS_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, error]);

  if (!text) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      className={`flex animate-pop-in items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold ${error ? "bg-error-container text-on-error-container" : "bg-primary-container text-on-primary-container"}`}
    >
      {error ? <TriangleAlert size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
      <span className="flex-1">{text}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors hover:bg-black/10"
      >
        <X size={16} />
      </button>
    </div>
  );
}
