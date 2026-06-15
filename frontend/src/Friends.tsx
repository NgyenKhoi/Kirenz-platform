import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
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
import { FriendRequestResponse, FriendResponse } from './types/friend.types';
import { useAuthStore } from './store/authStore';

type FriendsTab = 'friends' | 'incoming' | 'outgoing';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  const [receiverId, setReceiverId] = useState('');
  const [statusTargetId, setStatusTargetId] = useState('');
  const [statusResult, setStatusResult] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestResponse[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleSendRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedReceiverId = receiverId.trim();

    if (!uuidPattern.test(trimmedReceiverId)) {
      setError('Enter a valid user UUID.');
      return;
    }

    await runAction(
      trimmedReceiverId,
      async () => {
        await friendService.sendRequest({ receiverId: trimmedReceiverId });
        setReceiverId('');
        setActiveTab('outgoing');
      },
      'Friend request sent.'
    );
  };

  const handleCheckStatus = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTargetId = statusTargetId.trim();

    if (!uuidPattern.test(trimmedTargetId)) {
      setError('Enter a valid user UUID to check relationship status.');
      return;
    }

    setActionId(`status-${trimmedTargetId}`);
    setError(null);
    setMessage(null);
    try {
      const result = await friendService.getStatus(trimmedTargetId);
      setStatusResult(result.status);
    } catch (statusError) {
      setError(getErrorMessage(statusError));
    } finally {
      setActionId(null);
    }
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

            {user?.id && (
              <div className="mt-4 rounded-2xl bg-surface-container-lowest border border-outline-variant px-5 py-4">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.08em] mb-1">Current user ID</p>
                <p className="font-mono text-sm text-on-surface break-all">{user.id}</p>
              </div>
            )}
          </header>

          {(message || error) && (
            <div className={`rounded-2xl px-5 py-4 text-sm font-bold ${error ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
              {error || message}
            </div>
          )}

          <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <form
              onSubmit={handleSendRequest}
              className="bg-surface-container-lowest rounded-3xl p-6 border border-primary-container/30 shadow-[0_10px_40px_-10px_rgba(139,78,62,0.1)]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Send friend request</h3>
                  <p className="text-sm text-on-surface-variant">Use another account's UUID while search is not implemented yet.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={receiverId}
                  onChange={(event) => setReceiverId(event.target.value)}
                  placeholder="Receiver user UUID"
                  className="min-w-0 flex-1 bg-surface-container border border-outline-variant rounded-2xl py-3 px-4 font-mono text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-container/20"
                />
                <button
                  type="submit"
                  disabled={actionId === receiverId.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-on-primary px-5 py-3 font-bold hover:brightness-95 active:scale-95 disabled:opacity-60 transition-all"
                >
                  {actionId === receiverId.trim() ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Send
                </button>
              </div>
            </form>

            <form
              onSubmit={handleCheckStatus}
              className="bg-surface-container rounded-3xl p-6 border border-outline-variant"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                  <Search size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Check status</h3>
                  <p className="text-sm text-on-surface-variant">Inspect your relationship with a user ID.</p>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  value={statusTargetId}
                  onChange={(event) => setStatusTargetId(event.target.value)}
                  placeholder="Target user UUID"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3 px-4 font-mono text-sm text-on-surface focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-tertiary text-on-tertiary px-5 py-3 font-bold hover:brightness-95 active:scale-95 transition-all"
                >
                  {actionId?.startsWith('status-') ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  Check
                </button>
                {statusResult && (
                  <div className="rounded-2xl bg-surface-container-lowest px-4 py-3 text-center">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.08em]">Status</p>
                    <p className="text-lg font-bold text-primary">{statusResult.replaceAll('_', ' ')}</p>
                  </div>
                )}
              </div>
            </form>
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
          <h4 className="text-xl font-bold text-primary mb-4">Friend Flow</h4>
          <div className="space-y-4 text-sm text-on-surface-variant">
            <FlowStep icon={<Send size={18} />} title="Send" text="Copy another user's UUID and send a request." />
            <FlowStep icon={<Check size={18} />} title="Accept" text="Login as the receiver to accept the incoming request." />
            <FlowStep icon={<Users size={18} />} title="Manage" text="Both users will see the friendship after acceptance." />
          </div>
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
      {friends.map((friend) => (
        <div key={friend.friendshipId} className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.08em]">Friend ID</p>
              <p className="font-mono text-sm text-on-surface break-all mt-1">{friend.friendId}</p>
              <p className="text-xs text-on-surface-variant mt-3">Friends since {formatDate(friend.createdAt)}</p>
            </div>
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
        </div>
      ))}
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

function FlowStep({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-bold text-on-surface">{title}</p>
        <p>{text}</p>
      </div>
    </div>
  );
}
