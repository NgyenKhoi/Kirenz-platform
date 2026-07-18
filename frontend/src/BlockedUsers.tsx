import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, Shield, UserX } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Layout from './components/Layout';
import { useBlockedUsers, useBlockUser, useUnblockUser } from './hooks/useBlocks';
import { BlockResponse } from './types/block.types';
import { extractErrorMessage } from './utils/formErrors';
import { friendService } from './services/friend.service';
import type { UserSearchResponse } from './types/friend.types';
import { useEscapeKey } from './hooks/useEscapeKey';

function formatBlockedDate(value?: string): string {
  if (!value) return 'Blocked just now';
  return `Blocked ${new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value))}`;
}

function shortId(id: string): string {
  return `${id.slice(0, 8)}...${id.slice(-6)}`;
}

export default function BlockedUsers() {
  const navigate = useNavigate();
  const [blockQuery, setBlockQuery] = useState('');
  const [blockSearchResults, setBlockSearchResults] = useState<UserSearchResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userToUnblock, setUserToUnblock] = useState<BlockResponse | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const blockedUsersQuery = useBlockedUsers();
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();
  useEscapeKey(Boolean(userToUnblock), () => setUserToUnblock(null));

  const blockedUsers = blockedUsersQuery.data ?? [];
  useEffect(() => {
    const query = blockQuery.trim();
    if (query.length < 2) {
      setBlockSearchResults([]);
      setIsSearching(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await friendService.searchUsers(query, 10);
        const blockedIds = new Set(blockedUsers.map(user => user.blockedUserId));
        if (active) setBlockSearchResults(results.filter(user => !blockedIds.has(user.id)));
      } catch (error) {
        if (active) {
          setBlockSearchResults([]);
          setActionError(extractErrorMessage(error, 'Could not search users. Please try again.'));
        }
      } finally {
        if (active) setIsSearching(false);
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [blockQuery, blockedUsersQuery.data]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(''), 3000);
  };

  const handleBlockUser = async (selectedUser: UserSearchResponse) => {
    setActionError('');
    try {
      await blockUserMutation.mutateAsync(selectedUser.id);
      setBlockQuery('');
      setBlockSearchResults([]);
      showToast('User blocked successfully.');
    } catch (error) {
      setActionError(extractErrorMessage(error, 'Could not block this user. Please try again.'));
    }
  };

  const handleUnblock = async () => {
    if (!userToUnblock) return;
    setActionError('');

    try {
      await unblockUserMutation.mutateAsync(userToUnblock.blockedUserId);
      showToast('User unblocked successfully.');
      setUserToUnblock(null);
    } catch (error) {
      setActionError(extractErrorMessage(error, 'Could not unblock this user. Please try again.'));
    }
  };

  return (
    <Layout>
      <div className="bg-background min-h-screen pb-24 md:pb-8">
        <header className="lg:hidden fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-md shadow-sm h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-all text-primary">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-primary tracking-tight">Blocked Users</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-24 lg:pt-16">
          <section className="mb-8 text-center lg:text-left">
            <h2 className="hidden lg:flex items-center gap-4 text-3xl font-bold text-primary mb-3">
              <button onClick={() => navigate('/settings')} className="hover:bg-primary-container/20 p-2 rounded-full transition-colors active:scale-95">
                <ArrowLeft size={28} />
              </button>
              Blocked Users
            </h2>
            <p className="text-lg font-medium text-on-surface-variant max-w-2xl mx-auto lg:mx-0">
              Manage who cannot find your profile, view your moments, or start conversations with you.
            </p>
          </section>

          {(actionError || blockedUsersQuery.error) && (
            <div className="mb-6 rounded-2xl bg-error-container text-on-error-container border border-error px-5 py-4 text-sm font-bold">
              {actionError || extractErrorMessage(blockedUsersQuery.error, 'Could not load blocked users. Please try again.')}
            </div>
          )}

          <section className="relative mb-8 rounded-3xl border border-primary-container/30 bg-surface-container-lowest p-5">
              <label className="block text-sm font-bold text-on-surface-variant mb-2 ml-1" htmlFor="blockUserSearch">
                Find someone to block
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                <input
                  id="blockUserSearch"
                  value={blockQuery}
                  onChange={(event) => {
                    setBlockQuery(event.target.value);
                    setActionError('');
                  }}
                  placeholder="Search by display name or email"
                  className="w-full bg-surface-container rounded-2xl border-2 border-outline-variant py-3 pl-12 pr-4 text-sm text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              {blockQuery.trim().length >= 2 && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container">
                  {isSearching ? (
                    <div className="flex items-center justify-center p-5 text-primary"><Loader2 size={22} className="animate-spin" /></div>
                  ) : blockSearchResults.length === 0 ? (
                    <p className="p-5 text-center text-sm font-bold text-on-surface-variant">No matching users found.</p>
                  ) : blockSearchResults.map(result => (
                    <div key={result.id} className="flex items-center gap-3 border-b border-outline-variant/30 p-3 last:border-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container font-bold text-on-primary-container">
                        {result.avatarUrl ? <img src={result.avatarUrl} alt="" className="h-full w-full object-cover" /> : (result.displayName || result.username).slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-on-surface">{result.displayName || result.username}</p>
                        <p className="truncate text-xs text-on-surface-variant">{result.email || `@${result.username}`}</p>
                      </div>
                      <button type="button" onClick={() => void handleBlockUser(result)} disabled={blockUserMutation.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60">
                        <UserX size={16} /> Block
                      </button>
                    </div>
                  ))}
                </div>
              )}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {blockedUsersQuery.isLoading ? (
              <div className="col-span-full min-h-[280px] flex items-center justify-center text-primary">
                <Loader2 size={34} className="animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {blockedUsers.length > 0 ? (
                  blockedUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_10px_30px_-5px_rgba(139,78,62,0.05)] flex items-center justify-between gap-4 border border-surface-container"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">
                          {user.blockedUserId.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg md:text-xl font-bold text-on-surface">{shortId(user.blockedUserId)}</h3>
                          <p className="text-xs md:text-sm font-bold text-on-surface-variant mt-0.5">{formatBlockedDate(user.createdAt)}</p>
                          <p className="text-xs font-mono text-on-surface-variant truncate mt-2">{user.blockedUserId}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setUserToUnblock(user)}
                        disabled={unblockUserMutation.isPending}
                        className="px-4 md:px-6 py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-bold hover:bg-secondary-fixed transition-colors active:scale-95 shadow-sm disabled:opacity-60"
                      >
                        Unblock
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-70"
                  >
                    <Shield size={64} className="text-outline mb-4" strokeWidth={1.5} />
                    <p className="text-xl font-bold text-on-surface">No blocked users found</p>
                    <p className="text-base text-on-surface-variant mt-1">Your block list is empty.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </section>

          <div className="mt-8 text-center">
            <Link to="/settings" className="text-sm font-bold text-primary hover:underline">
              Back to settings
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {userToUnblock && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
              onClick={() => setUserToUnblock(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-surface-container-lowest w-full max-w-md rounded-3xl p-6 md:p-8 shadow-[0_20px_40px_-10px_rgba(139,78,62,0.15)] border border-surface-container-high"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-on-surface leading-tight">
                  Unblock {shortId(userToUnblock.blockedUserId)}?
                </h3>
              </div>
              <p className="text-base font-medium text-on-surface-variant mb-8 leading-relaxed">
                This user may be able to find your profile or interact with you again depending on your privacy settings.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setUserToUnblock(null)}
                  className="flex-1 px-6 py-3 border-2 border-outline-variant text-on-surface-variant rounded-full font-bold hover:bg-surface-container transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnblock}
                  disabled={unblockUserMutation.isPending}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-full font-bold shadow-[0_4px_12px_rgba(139,78,62,0.2)] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60"
                >
                  {unblockUserMutation.isPending ? 'Unblocking...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-24 md:bottom-10 left-1/2 bg-on-surface text-surface px-6 py-3 rounded-full text-sm font-bold z-[70] shadow-xl text-center whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
