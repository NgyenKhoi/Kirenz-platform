import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, Globe, Users, Lock, Shield, UserPlus,
  MessageSquare, Menu, Bell, Loader2, UserX,
  Sun, Moon, Palette, Settings
} from 'lucide-react';
import Layout from './components/Layout';
import { useBlockedUsers, useUnblockUser } from './hooks/useBlocks';
import { extractErrorMessage } from './utils/formErrors';
import { useAuthStore } from './store/authStore';

function shortId(id: string): string {
  return `${id.slice(0, 8)}...${id.slice(-6)}`;
}

export default function ProfileSettings() {
  const { user } = useAuthStore();
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [actionError, setActionError] = useState('');
  
  const blockedUsersQuery = useBlockedUsers();
  const unblockUserMutation = useUnblockUser();

  const blockedUsers = (blockedUsersQuery.data ?? []).slice(0, 2);

  const handleUnblock = async (blockedUserId: string) => {
    setActionError('');
    try {
      await unblockUserMutation.mutateAsync(blockedUserId);
    } catch (error) {
      setActionError(extractErrorMessage(error, 'Could not unblock this user. Please try again.'));
    }
  };

  const avatarUrl = user?.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCs8AQ1VyctgRMqOBqcr3PDc7VEE9fQ2Finhj3ZftNZfaFDrOEUoeQ19iPtUyTrCijbr6p9xNxzWw8p_x6kxMmKvn_dfE1apfaKVZ5nrCzUzLb2VGanYhffU2Wdg7mSFxI-4RIzUGYB7Uk0_E39bQoOqSMovV-mxAlZYmeNfP-9PMJno1uQB10MAUfCdpRAiHr2bQBE50OhVtqM_M-N8ruZ6NeEIZZupVjU5N-EdjthGlfNpVJRVgG-wsao1aT-a-SG0AnWKaaw-5E';

  return (
    <Layout>
      <div className="bg-surface text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container pb-20 md:pb-0">
        
        {/* Top App Bar */}
        <header className="flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 flex-col items-center gap-1 text-primary-container">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-primary truncate">Settings</h2>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <button className="p-2 text-on-surface-variant hover:bg-primary-container/20 rounded-full transition-colors active:scale-95">
              <Bell size={24} />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container hidden md:block shrink-0">
              <img 
                alt="User Profile" 
                className="w-full h-full object-cover" 
                src={avatarUrl}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2 tracking-tight">Settings & Privacy</h2>
            <p className="text-base font-medium text-on-surface-variant">Manage who can see your moments, block users, and customize application preferences.</p>
          </header>

          <div className="flex flex-col gap-6">
            
            {/* Privacy & Visibility Section */}
            <section className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="text-primary" size={24} />
                <h3 className="text-xl font-bold text-on-surface">Privacy & Visibility</h3>
              </div>
              
              <div className="space-y-8">
                {/* Profile Visibility */}
                <div>
                  <label className="text-sm font-bold block mb-3 text-on-surface-variant">Profile Visibility</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button 
                      onClick={() => setProfileVisibility('public')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        profileVisibility === 'public' 
                          ? 'border-primary-container bg-primary-fixed/30 text-on-primary-container' 
                          : 'border-outline-variant hover:border-primary-container hover:bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      <Globe size={24} className="mb-2" />
                      <span className="text-sm font-bold">Public</span>
                    </button>
                    
                    <button 
                      onClick={() => setProfileVisibility('friends')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        profileVisibility === 'friends' 
                          ? 'border-primary-container bg-primary-fixed/30 text-on-primary-container' 
                          : 'border-outline-variant hover:border-primary-container hover:bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      <Users size={24} className="mb-2" />
                      <span className="text-sm font-bold">Friends-only</span>
                    </button>
                    
                    <button 
                      onClick={() => setProfileVisibility('private')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        profileVisibility === 'private' 
                          ? 'border-primary-container bg-primary-fixed/30 text-on-primary-container' 
                          : 'border-outline-variant hover:border-primary-container hover:bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      <Lock size={24} className="mb-2" />
                      <span className="text-sm font-bold">Private</span>
                    </button>
                  </div>
                </div>

                {/* Post Visibility */}
                <div>
                  <label className="text-sm font-bold block mb-2 text-on-surface-variant">Default Post Visibility</label>
                  <select defaultValue="Friends Only" className="w-full bg-surface-container rounded-full border-2 border-outline-variant/30 py-3 px-6 text-base font-medium text-on-surface focus:border-primary-container focus:ring-0 outline-none transition-all hover:border-outline-variant cursor-pointer appearance-none">
                    <option>Everyone</option>
                    <option>Friends Only</option>
                    <option>Specific Friends...</option>
                    <option>Only Me</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Defensive Controls Section */}
            <section className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <Shield className="text-primary" size={24} />
                  <h3 className="text-xl font-bold text-on-surface">Defensive Controls</h3>
                </div>
                <Link to="/blocked" className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 w-full sm:w-auto">
                  <UserPlus size={18} />
                  Add to Block List
                </Link>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between ml-1 mb-2">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Blocked Users</p>
                  <Link to="/blocked" className="text-xs font-bold text-primary hover:underline">Manage All</Link>
                </div>

                {(actionError || blockedUsersQuery.error) && (
                  <div className="rounded-2xl bg-error-container text-on-error-container px-4 py-3 text-sm font-bold">
                    {actionError || extractErrorMessage(blockedUsersQuery.error, 'Could not load blocked users.')}
                  </div>
                )}

                {blockedUsersQuery.isLoading ? (
                  <div className="flex items-center justify-center p-6 text-primary">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                ) : blockedUsers.length > 0 ? (
                  blockedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between gap-3 p-3 bg-surface-container-low rounded-[1.5rem] hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">
                          <UserX size={18} />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-base font-bold text-on-surface">{shortId(user.blockedUserId)}</span>
                          <span className="block text-xs font-mono text-on-surface-variant truncate">{user.blockedUserId}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnblock(user.blockedUserId)}
                        disabled={unblockUserMutation.isPending}
                        className="text-primary text-sm font-bold hover:underline px-3 py-1 disabled:opacity-60"
                      >
                        Unblock
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-outline-variant p-6 text-center">
                    <p className="text-sm font-bold text-on-surface">No blocked users</p>
                    <p className="text-xs text-on-surface-variant mt-1">People you block will appear here.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Interactions Section */}
            <section className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="text-primary" size={24} />
                <h3 className="text-xl font-bold text-on-surface">Interactions</h3>
              </div>
              
              <div className="space-y-6">
                {/* Toggle Item 1 */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/20 pb-4">
                  <div>
                    <p className="text-base font-bold text-on-surface">Direct Messages</p>
                    <p className="text-sm font-medium text-on-surface-variant">Allow anyone to send you a message</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-14 h-7 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-surface-variant after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Toggle Item 2 */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/20 pb-4">
                  <div>
                    <p className="text-base font-bold text-on-surface">Story Views</p>
                    <p className="text-sm font-medium text-on-surface-variant">Allow friends of friends to see your stories</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-14 h-7 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-surface-variant after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Toggle Item 3 */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-base font-bold text-on-surface">Tagging</p>
                    <p className="text-sm font-medium text-on-surface-variant">Allow others to tag you in their moments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-14 h-7 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-surface-variant after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Preferences (Theme Selection) Section */}
            <section className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="text-primary" size={24} />
                <h3 className="text-xl font-bold text-on-surface">Preferences</h3>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-on-surface mb-4">Theme Selection</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-[1.5rem] transition-all border-2 ${theme === 'light' ? 'bg-primary-container/10 border-primary-container' : 'bg-surface-container-low border-transparent hover:bg-surface-variant'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-surface-bright flex items-center justify-center border border-primary-container/20">
                      <Sun size={24} className={theme === 'light' ? 'text-primary' : 'text-on-surface-variant'} />
                    </div>
                    <span className={`text-sm font-bold ${theme === 'light' ? 'text-primary' : 'text-on-surface-variant'}`}>Soft Light</span>
                  </button>
                  
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-[1.5rem] transition-all border-2 ${theme === 'dark' ? 'bg-primary-container/10 border-primary-container' : 'bg-surface-container-low border-transparent hover:bg-surface-variant'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                      <Moon size={24} className="text-white" />
                    </div>
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-primary' : 'text-on-surface-variant'}`}>Deep Dark</span>
                  </button>
                  
                  <button 
                    onClick={() => setTheme('auto')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-[1.5rem] transition-all border-2 ${theme === 'auto' ? 'bg-primary-container/10 border-primary-container' : 'bg-surface-container-low border-transparent hover:bg-surface-variant'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center">
                      <Palette size={24} className="text-on-tertiary-container" />
                    </div>
                    <span className={`text-sm font-bold ${theme === 'auto' ? 'text-primary' : 'text-on-surface-variant'}`}>Auto</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-4 mt-4 pb-12">
              <button className="px-6 sm:px-8 py-3 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container-highest transition-all active:scale-95">
                Cancel
              </button>
              <button className="px-6 sm:px-8 py-3 rounded-full text-sm font-bold bg-primary text-on-primary shadow-[0_4px_12px_rgba(139,78,62,0.3)] hover:shadow-[0_8px_16px_rgba(139,78,62,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all">
                Save Changes
              </button>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
