import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
  Check,
  Clock,
  Copy,
  Loader2,
  Search,
  Send,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import Layout from './components/Layout';
import { friendService } from './services/friend.service';
import { ErrorResponse } from './types/auth.types';
import { FriendRequestResponse, FriendResponse, FriendSuggestionResponse, UserSearchResponse } from './types/friend.types';
import { useAuthStore } from './store/authStore';

type FriendsTab = 'friends' | 'incoming' | 'outgoing';



function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ErrorResponse>;
  return axiosError.response?.data?.message || 'Something went wrong. Please try again.';
}

function formatDate(value?: string | null): string {
  if (!value) return 'Just now';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function shortId(id: string): string {
  return `${id.slice(0, 8)}...${id.slice(-6)}`;
}

export default function Friends() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<FriendsTab>('friends');
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [friendSearchResults, setFriendSearchResults] = useState<UserSearchResponse[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestResponse[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<FriendSuggestionResponse[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(true);

  const loadFriendsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [friendsData, incomingData, outgoingData] = await Promise.all([
        friendService.getFriends(),
        friendService.getIncomingRequests(),
        friendService.getOutgoingRequests(),
      ]);
      setFriends(friendsData);
      setIncomingRequests(incomingData);
      setOutgoingRequests(outgoingData);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriendsData();
  }, [loadFriendsData]);

  useEffect(() => {
    let active = true;
    setIsSuggestionsLoading(true);
    friendService.getSuggestions(10)
      .then((data) => { if (active) setSuggestions(data); })
      .catch(() => { /* ignore */ })
      .finally(() => { if (active) setIsSuggestionsLoading(false); });
    return () => { active = false; };
  }, []);

  const totalPending = incomingRequests.length + outgoingRequests.length;

  const tabCounts = useMemo(
    () => ({
      friends: friends.length,
      incoming: incomingRequests.length,
      outgoing: outgoingRequests.length,
    }),
    [friends.length, incomingRequests.length, outgoingRequests.length]
  );

  const copyMyId = async () => {
    if (!user?.id) return;
    await navigator.clipboard.writeText(user.id);
    setMessage('Your user ID was copied.');
  };

  const runAction = async (id: string, action: () => Promise<void>, successMessage: string) => {
    setActionId(id);
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(successMessage);
      await loadFriendsData();
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setActionId(null);
    }
  };

  useEffect(() => {
    const query = friendSearchQuery.trim();
    if (query.length < 2) {
      setFriendSearchResults([]);
      setIsSearchingUsers(false);
      return;
    }

    let isActive = true;
    setIsSearchingUsers(true);
    const timer = window.setTimeout(async () => {
      try {
        const results = await friendService.searchUsers(query, 10);
        if (isActive) {
          setFriendSearchResults(results);
          setError(null);
        }
      } catch (searchError) {
        if (isActive) {
          setFriendSearchResults([]);
          setError(getErrorMessage(searchError));
        }
      } finally {
        if (isActive) {
          setIsSearchingUsers(false);
        }
      }
    }, 300);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [friendSearchQuery]);

  const handleSendRequestToUser = async (receiverId: string) => {
    await runAction(
      receiverId,
      async () => {
        await friendService.sendRequest({ receiverId });
        setFriendSearchQuery('');
        setFriendSearchResults([]);
        setSuggestions((prev) => prev.filter((s) => s.id !== receiverId));
        setActiveTab('outgoing');
      },
      'Friend request sent.'
    );
  };

  return (
    <Layout>
      <main className="px-4 sm:px-6 md:px-8 py-8 min-h-screen xl:mr-[320px]">
        <div className="max-w-[1040px] mx-auto space-y-8">
          <header className="mt-10 md:mt-0">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <p className="text-sm font-bold text-primary uppercase tracking-[0.08em]">Relationship Center</p>
                <h2 className="text-[32px] leading-[40px] font-bold text-on-surface mt-2">Friends</h2>
                <p className="text-on-surface-variant text-base font-medium mt-2">
                  Send requests, review invitations, and manage current friendships.
                </p>
              </div>

              <button
                type="button"
                onClick={copyMyId}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container-lowest border border-outline-variant px-5 py-3 text-sm font-bold text-primary hover:bg-surface-container-low active:scale-95 transition-all"
              >
                <Copy size={18} />
                Copy my ID
              </button>
            </div>
          </header>

          {(message || error) && (
            <div className={`rounded-2xl px-5 py-4 text-sm font-bold ${error ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
              {error || message}
            </div>
          )}

          <section className="bg-surface-container-lowest rounded-3xl p-6 border border-primary-container/30 shadow-[0_10px_40px_-10px_rgba(139,78,62,0.1)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                <UserPlus size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">Find friends</h3>
                <p className="text-sm text-on-surface-variant">Search by username, display name, or email.</p>
              </div>
            </div>

            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={friendSearchQuery}
                onChange={(event) => setFriendSearchQuery(event.target.value)}
                placeholder="Search users"
                className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-container/20"
              />
            </div>

            <div className="mt-4 space-y-3">
              {isSearchingUsers && (
                <div className="rounded-2xl bg-surface-container px-4 py-3 text-sm font-bold text-on-surface-variant flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Searching users...
                </div>
              )}

              {!isSearchingUsers && friendSearchQuery.trim().length >= 2 && friendSearchResults.length === 0 && (
                <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container px-4 py-4 text-sm font-bold text-on-surface-variant text-center">
                  No users found.
                </div>
              )}

              {friendSearchResults.map((result) => {
                const canSendRequest = result.relationshipStatus === 'NONE';
                return (
                  <div key={result.id} className="rounded-2xl bg-surface-container border border-outline-variant p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <Link to={`/profile/${result.id}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="h-12 w-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0 overflow-hidden">
                        {result.avatarUrl ? (
                          <img src={result.avatarUrl} alt={result.displayName || result.username} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          (result.displayName || result.username || '?').slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-on-surface truncate">{result.displayName || result.username}</p>
                        <p className="text-xs text-primary font-bold truncate">@{result.username}</p>
                        {result.bio && <p className="text-xs text-on-surface-variant line-clamp-1 mt-1">{result.bio}</p>}
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleSendRequestToUser(result.id)}
                      disabled={!canSendRequest || actionId === result.id}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary px-4 py-2 text-sm font-bold hover:brightness-95 active:scale-95 disabled:opacity-60 transition-all"
                    >
                      {actionId === result.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {canSendRequest ? 'Send request' : result.relationshipStatus.replaceAll('_', ' ')}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-3xl border border-primary-container/30 shadow-[0_10px_40px_-10px_rgba(139,78,62,0.1)] overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border-b border-outline-variant">
              <div>
                <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <Users size={22} className="text-primary" />
                  Friend Network
                </h3>
                <p className="text-sm text-on-surface-variant">{friends.length} friends, {totalPending} pending requests</p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-surface-container p-1 rounded-2xl">
                {(['friends', 'incoming', 'outgoing'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                  >
                    {tab} {tabCounts[tab]}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {isLoading ? (
                <div className="min-h-[280px] flex items-center justify-center text-primary">
                  <Loader2 size={32} className="animate-spin" />
                </div>
              ) : (
                <>
                  {activeTab === 'friends' && (
                    <FriendList
                      friends={friends}
                      actionId={actionId}
                      onRemove={(friendId) =>
                        runAction(
                          friendId,
                          () => friendService.removeFriend(friendId),
                          'Friend removed.'
                        )
                      }
                    />
                  )}

                  {activeTab === 'incoming' && (
                    <RequestList
                      type="incoming"
                      requests={incomingRequests}
                      actionId={actionId}
                      onAccept={(requestId) =>
                        runAction(
                          requestId,
                          () => friendService.acceptRequest(requestId).then(() => undefined),
                          'Friend request accepted.'
                        )
                      }
                      onDecline={(requestId) =>
                        runAction(
                          requestId,
                          () => friendService.declineRequest(requestId).then(() => undefined),
                          'Friend request declined.'
                        )
                      }
                    />
                  )}

                  {activeTab === 'outgoing' && (
                    <RequestList
                      type="outgoing"
                      requests={outgoingRequests}
                      actionId={actionId}
                      onCancel={(requestId) =>
                        runAction(
                          requestId,
                          () => friendService.cancelRequest(requestId).then(() => undefined),
                          'Friend request cancelled.'
                        )
                      }
                    />
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      <aside className="fixed right-0 top-0 h-screen w-[320px] p-8 hidden xl:block bg-surface z-40 overflow-y-auto">
        <div className="bg-surface-container rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(139,78,62,0.1)]">
          <h4 className="text-xl font-bold text-primary mb-4">Friends You May Know</h4>
          {isSuggestionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-4 text-center">
              <Users size={32} className="mx-auto text-on-surface-variant/60 mb-2" />
              <p className="text-sm font-bold text-on-surface">No suggestions yet</p>
              <p className="text-xs text-on-surface-variant mt-1">Add more friends to discover people you may know!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => {
                const displayName = suggestion.displayName || suggestion.username || 'Kirenz User';
                return (
                  <div key={suggestion.id} className="rounded-2xl bg-surface-container-low border border-outline-variant p-3 transition-all hover:border-primary/30 hover:shadow-sm">
                    <Link to={`/profile/${suggestion.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="h-10 w-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0 overflow-hidden text-sm">
                        {suggestion.avatarUrl ? (
                          <img src={suggestion.avatarUrl} alt={displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          displayName.slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-on-surface text-sm truncate">{displayName}</p>
                        {suggestion.username && <p className="text-[11px] text-primary font-bold truncate">@{suggestion.username}</p>}
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {suggestion.mutualFriendCount} mutual friend{suggestion.mutualFriendCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleSendRequestToUser(suggestion.id)}
                      disabled={actionId === suggestion.id}
                      className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-on-primary px-3 py-2 text-xs font-bold hover:brightness-95 active:scale-95 disabled:opacity-60 transition-all"
                    >
                      {actionId === suggestion.id ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                      Add Friend
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </Layout>
  );
}

function FriendList({
  friends,
  actionId,
  onRemove,
}: {
  friends: FriendResponse[];
  actionId: string | null;
  onRemove: (friendId: string) => void;
}) {
  if (friends.length === 0) {
    return <EmptyState title="No friends yet" text="Send a request, then login as the receiver to accept it." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {friends.map((friend) => {
        const displayName = friend.displayName || friend.username || 'Kirenz User';
        return (
          <div key={friend.friendshipId} className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link to={`/profile/${friend.friendId}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-12 w-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0 overflow-hidden">
                {friend.avatarUrl ? (
                  <img src={friend.avatarUrl} alt={displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  displayName.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-on-surface truncate">{displayName}</p>
                {friend.username && <p className="text-xs text-primary font-bold truncate">@{friend.username}</p>}
                {friend.bio && <p className="text-xs text-on-surface-variant line-clamp-1 mt-1">{friend.bio}</p>}
                <p className="text-[10px] text-on-surface-variant mt-2 font-medium">Friends since {formatDate(friend.createdAt)}</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => onRemove(friend.friendId)}
              disabled={actionId === friend.friendId}
              className="shrink-0 inline-flex items-center justify-center rounded-full w-11 h-11 bg-error-container text-on-error-container hover:brightness-95 active:scale-95 disabled:opacity-60 transition-all"
              title="Remove friend"
            >
              {actionId === friend.friendId ? <Loader2 size={18} className="animate-spin" /> : <UserMinus size={18} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function RequestList({
  type,
  requests,
  actionId,
  onAccept,
  onDecline,
  onCancel,
}: {
  type: 'incoming' | 'outgoing';
  requests: FriendRequestResponse[];
  actionId: string | null;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        title={type === 'incoming' ? 'No incoming requests' : 'No outgoing requests'}
        text={type === 'incoming' ? 'Incoming invitations will appear here.' : 'Requests you send will appear here until accepted or cancelled.'}
      />
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const otherUserId = type === 'incoming' ? request.requesterId : request.receiverId;
        return (
          <div key={request.id} className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-primary" />
                  <p className="text-xs font-bold text-primary uppercase tracking-[0.08em]">
                    {type === 'incoming' ? 'From' : 'To'} {shortId(otherUserId)}
                  </p>
                </div>
                <p className="font-mono text-sm text-on-surface break-all">{otherUserId}</p>
                <p className="text-xs text-on-surface-variant mt-3">Requested {formatDate(request.createdAt)}</p>
              </div>

              {type === 'incoming' ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onAccept?.(request.id)}
                    disabled={actionId === request.id}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary px-4 py-3 text-sm font-bold hover:brightness-95 active:scale-95 disabled:opacity-60 transition-all"
                  >
                    {actionId === request.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => onDecline?.(request.id)}
                    disabled={actionId === request.id}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container-high text-on-surface-variant px-4 py-3 text-sm font-bold hover:brightness-95 active:scale-95 disabled:opacity-60 transition-all"
                  >
                    <X size={16} />
                    Decline
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onCancel?.(request.id)}
                  disabled={actionId === request.id}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-error-container text-on-error-container px-4 py-3 text-sm font-bold hover:brightness-95 active:scale-95 disabled:opacity-60 transition-all"
                >
                  {actionId === request.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Cancel
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="min-h-[260px] rounded-2xl border border-dashed border-outline-variant bg-surface-container-low flex flex-col items-center justify-center text-center px-6">
      <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-4">
        <Users size={26} />
      </div>
      <h4 className="text-lg font-bold text-on-surface">{title}</h4>
      <p className="text-sm text-on-surface-variant max-w-sm mt-2">{text}</p>
    </div>
  );
}


