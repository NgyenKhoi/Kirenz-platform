import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, Shield, UserX } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Layout from './components/Layout';
import { useBlockedUsers, useBlockUser, useUnblockUser } from './hooks/useBlocks';
import { BlockResponse } from './types/block.types';
import { extractErrorMessage } from './utils/formErrors';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  const [searchQuery, setSearchQuery] = useState('');
  const [blockedUserId, setBlockedUserId] = useState('');
  const [blockInputError, setBlockInputError] = useState('');
  const [userToUnblock, setUserToUnblock] = useState<BlockResponse | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const blockedUsersQuery = useBlockedUsers();
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  const blockedUsers = blockedUsersQuery.data ?? [];
  const filteredUsers = useMemo(
    () =>
      blockedUsers.filter((user) =>
        user.blockedUserId.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ),
    [blockedUsers, searchQuery]
  );

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(''), 3000);
  };

  const handleBlockUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUserId = blockedUserId.trim();
    setActionError('');

    if (!trimmedUserId) {
      setBlockInputError('User UUID is required');
      return;
    }

    if (!uuidPattern.test(trimmedUserId)) {
      setBlockInputError('Enter a valid user UUID');
      return;
    }

    setBlockInputError('');
    try {
      await blockUserMutation.mutateAsync(trimmedUserId);
      setBlockedUserId('');
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
            <button onClick={() => navigate('/privacy')} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-all text-primary">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-primary tracking-tight">Blocked Users</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-24 lg:pt-16">
          <section className="mb-8 text-center lg:text-left">
            <h2 className="hidden lg:flex items-center gap-4 text-3xl font-bold text-primary mb-3">
              <button onClick={() => navigate('/privacy')} className="hover:bg-primary-container/20 p-2 rounded-full transition-colors active:scale-95">
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

          <section className="mb-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            <form onSubmit={handleBlockUser} noValidate className="bg-surface-container-lowest rounded-3xl p-5 border border-primary-container/30">
              <label className="block text-sm font-bold text-on-surface-variant mb-2 ml-1" htmlFor="blockedUserId">
                Block user by UUID
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="blockedUserId"
                  value={blockedUserId}
                  onChange={(event) => {
                    setBlockedUserId(event.target.value);
                    setBlockInputError('');
                    setActionError('');
                  }}
                  placeholder="User UUID"
                  aria-invalid={Boolean(blockInputError)}
                  aria-describedby={blockInputError ? 'blockedUserId-error' : undefined}
                  className={`min-w-0 flex-1 bg-surface-container rounded-2xl border-2 py-3 px-4 font-mono text-sm text-on-surface focus:outline-none ${blockInputError ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'}`}
                />
                <button
                  type="submit"
                  disabled={blockUserMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-on-primary px-5 py-3 font-bold hover:brightness-95 active:scale-95 disabled:opacity-60 transition-all"
                >
                  {blockUserMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <UserX size={18} />}
                  Block
                </button>
              </div>
              {blockInputError && (
                <p id="blockedUserId-error" className="mt-2 ml-1 text-sm font-medium text-error">{blockInputError}</p>
              )}
            </form>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
              <input
                className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-2 border-primary-container/50 rounded-2xl focus:ring-4 focus:ring-primary-container/30 focus:border-primary transition-all outline-none font-medium text-on-surface"
                placeholder="Search blocked UUIDs..."
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {blockedUsersQuery.isLoading ? (
              <div className="col-span-full min-h-[280px] flex items-center justify-center text-primary">
                <Loader2 size={34} className="animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
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
            <Link to="/privacy" className="text-sm font-bold text-primary hover:underline">
              Back to privacy settings
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
