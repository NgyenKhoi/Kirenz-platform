import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, Loader2, MapPin, MessageCircle, UserCheck, UserMinus, UserPlus } from "lucide-react";
import { authService } from "../../services/auth.service";
import { friendService } from "../../services/friend.service";
import { useAuthStore } from "../../store/authStore";
import { fallbackAvatar } from "../../constants/post.constants";

interface UserHoverCardProps {
  userId?: string | null;
  // Shown instantly while the full profile loads (or if it cannot be loaded).
  name: string;
  avatarUrl?: string | null;
  className?: string;
  children: React.ReactNode;
}

const OPEN_DELAY_MS = 350;
const CLOSE_DELAY_MS = 160;
const CARD_WIDTH = 320;
const CARD_HEIGHT_ESTIMATE = 250;

type Position = { left: number; top?: number; bottom?: number };

export function UserHoverCard({ userId, name, avatarUrl, className = "", children }: UserHoverCardProps) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const isOpen = position !== null;

  const clearTimers = () => {
    if (openTimer.current !== null) window.clearTimeout(openTimer.current);
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    openTimer.current = closeTimer.current = null;
  };

  const computePosition = (): Position | null => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - CARD_WIDTH - 8);
    const fitsBelow = rect.bottom + 8 + CARD_HEIGHT_ESTIMATE <= window.innerHeight;
    return fitsBelow
      ? { left, top: rect.bottom + 8 }
      : { left, bottom: window.innerHeight - rect.top + 8 };
  };

  const openSoon = () => {
    clearTimers();
    openTimer.current = window.setTimeout(() => setPosition(computePosition()), OPEN_DELAY_MS);
  };

  const keepOpen = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const closeSoon = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => setPosition(null), CLOSE_DELAY_MS);
  };

  useEffect(() => clearTimers, []);

  // The card is position:fixed, so close it instead of letting it drift on scroll.
  useEffect(() => {
    if (!isOpen) return;
    const close = () => setPosition(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  if (!userId) {
    return <span className={className}>{children}</span>;
  }

  return (
    <>
      <Link
        ref={anchorRef}
        to={`/profile/${userId}`}
        className={className}
        onMouseEnter={openSoon}
        onMouseLeave={closeSoon}
        onFocus={openSoon}
        onBlur={closeSoon}
      >
        {children}
      </Link>
      {isOpen &&
        createPortal(
          <div
            role="dialog"
            aria-label={`${name} profile preview`}
            onMouseEnter={keepOpen}
            onMouseLeave={closeSoon}
            style={{ left: position.left, top: position.top, bottom: position.bottom, width: CARD_WIDTH }}
            className="fixed z-[100] animate-pop-in rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-[0_18px_42px_-12px_rgba(28,28,24,0.45)]"
          >
            <UserHoverCardBody userId={userId} name={name} avatarUrl={avatarUrl} onNavigate={() => setPosition(null)} />
          </div>,
          document.body
        )}
    </>
  );
}

function UserHoverCardBody({
  userId,
  name,
  avatarUrl,
  onNavigate,
}: {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  onNavigate: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const isSelf = currentUser?.id === userId;
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { data: profile, isPending: isProfilePending } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => authService.getUserProfile(userId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: status } = useQuery({
    queryKey: ["friendStatus", userId],
    queryFn: async () => (await friendService.getStatus(userId)).status,
    enabled: isAuthenticated && !isSelf,
    staleTime: 30 * 1000,
    retry: false,
  });

  const runFriendAction = async (action: () => Promise<unknown>) => {
    setIsActionLoading(true);
    try {
      await action();
    } catch (err) {
      console.error(err);
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["friendStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      setIsActionLoading(false);
    }
  };

  const sendRequest = () => runFriendAction(() => friendService.sendRequest({ receiverId: userId }));
  const cancelRequest = () =>
    runFriendAction(async () => {
      const request = (await friendService.getOutgoingRequests()).find((r) => r.receiverId === userId);
      if (request) await friendService.cancelRequest(request.id);
    });
  const acceptRequest = () =>
    runFriendAction(async () => {
      const request = (await friendService.getIncomingRequests()).find((r) => r.requesterId === userId);
      if (request) await friendService.acceptRequest(request.id);
    });

  const displayName = profile?.displayName || profile?.username || name;
  const isBlocked = status === "BLOCKED" || status === "BLOCKED_BY_TARGET";
  const canMessage = isAuthenticated && !isSelf && !isBlocked && profile?.allowDirectMessages !== false;
  const joined = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;

  const primaryBtn =
    "flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-all hover:brightness-110 active:scale-95 disabled:opacity-60";
  const secondaryBtn =
    "flex flex-1 items-center justify-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest active:scale-95 disabled:opacity-60";
  const spinnerOr = (icon: React.ReactNode) => (isActionLoading ? <Loader2 size={16} className="animate-spin" /> : icon);

  return (
    <>
      <div className="flex gap-4">
        <Link to={`/profile/${userId}`} onClick={onNavigate} className="shrink-0">
          <img
            alt={displayName}
            src={profile?.avatarUrl || avatarUrl || fallbackAvatar}
            className="h-20 w-20 rounded-full object-cover ring-2 ring-surface-container-low"
            referrerPolicy="no-referrer"
          />
        </Link>
        <div className="min-w-0 flex-1 pt-1">
          <Link
            to={`/profile/${userId}`}
            onClick={onNavigate}
            className="block truncate text-lg font-bold leading-tight text-on-surface hover:underline"
          >
            {displayName}
          </Link>
          {profile?.username && (
            <p className="truncate text-sm text-on-surface-variant">@{profile.username}</p>
          )}
          {status === "FRIENDS" && (
            <p className="mt-1 flex items-center gap-1 text-xs font-bold text-primary">
              <UserCheck size={14} /> Friends
            </p>
          )}
        </div>
      </div>

      {isProfilePending && (
        <div aria-hidden="true" className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-surface-container-high" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-surface-container-high" />
        </div>
      )}

      {(profile?.bio || profile?.location || joined) && (
        <div className="mt-3 space-y-1.5 text-sm text-on-surface-variant">
          {profile?.bio && <p className="line-clamp-2 text-on-surface">{profile.bio}</p>}
          {profile?.location && (
            <p className="flex items-center gap-2">
              <MapPin size={15} className="shrink-0" />
              <span className="truncate">Lives in <span className="font-bold text-on-surface">{profile.location}</span></span>
            </p>
          )}
          {joined && (
            <p className="flex items-center gap-2">
              <CalendarDays size={15} className="shrink-0" />
              Joined {joined}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {isSelf ? (
          <Link to="/profile" onClick={onNavigate} className={secondaryBtn}>
            View your profile
          </Link>
        ) : (
          <>
            {status === "NONE" && (
              <button type="button" onClick={sendRequest} disabled={isActionLoading} className={primaryBtn}>
                {spinnerOr(<UserPlus size={16} />)} Add friend
              </button>
            )}
            {status === "OUTGOING_REQUEST" && (
              <button type="button" onClick={cancelRequest} disabled={isActionLoading} className={secondaryBtn}>
                {spinnerOr(<UserMinus size={16} />)} Cancel request
              </button>
            )}
            {status === "INCOMING_REQUEST" && (
              <button type="button" onClick={acceptRequest} disabled={isActionLoading} className={primaryBtn}>
                {spinnerOr(<Check size={16} />)} Accept
              </button>
            )}
            {canMessage && (
              <button
                type="button"
                onClick={() => {
                  onNavigate();
                  navigate(`/chat?userId=${encodeURIComponent(userId)}`);
                }}
                className={status === "NONE" || status === "INCOMING_REQUEST" ? secondaryBtn : primaryBtn}
              >
                <MessageCircle size={16} /> Message
              </button>
            )}
            {!canMessage && status !== "NONE" && status !== "OUTGOING_REQUEST" && status !== "INCOMING_REQUEST" && (
              <Link to={`/profile/${userId}`} onClick={onNavigate} className={secondaryBtn}>
                View profile
              </Link>
            )}
          </>
        )}
      </div>
    </>
  );
}
