import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageSquare, UsersRound, BookOpen, Sparkles, 
  Settings, Bell, Camera, User as UserIcon, Mail, Sun, Moon, Palette,
  CheckCircle, Loader2, Menu
} from 'lucide-react';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';

export default function ProfileSettings() {
  const { user, updateProfile, isUpdatingProfile, updateProfileSuccess, uploadAvatarAsync, isUploadingAvatar } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  
  const avatarUrl = user?.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCs8AQ1VyctgRMqOBqcr3PDc7VEE9fQ2Finhj3ZftNZfaFDrOEUoeQ19iPtUyTrCijbr6p9xNxzWw8p_x6kxMmKvn_dfE1apfaKVZ5nrCzUzLb2VGanYhffU2Wdg7mSFxI-4RIzUGYB7Uk0_E39bQoOqSMovV-mxAlZYmeNfP-9PMJno1uQB10MAUfCdpRAiHr2bQBE50OhVtqM_M-N8ruZ6NeEIZZupVjU5N-EdjthGlfNpVJRVgG-wsao1aT-a-SG0AnWKaaw-5E';
  
  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.');
      return;
    }

    setAvatarError(null);
    try {
      await uploadAvatarAsync(file);
    } catch {
      setAvatarError('Could not upload avatar. Please try again.');
    }
  };
  const handleSave = () => {
    updateProfile({
      displayName: formData.displayName,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
    });
  };


  return (
    <Layout>
      <div className="bg-surface text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container pb-20 md:pb-0">

        {/* Top App Bar (Mobile & Desktop Content Header) */}
        <header className="flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 flex-col items-center gap-1 text-primary-container">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-primary">Settings</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:bg-primary-container/20 rounded-full transition-colors active:scale-95">
              <Bell size={24} />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container hidden md:block">
              <img 
                alt="User Profile" 
                className="w-full h-full object-cover" 
                src={avatarUrl}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Settings Form Container */}
          <div className="flex flex-col gap-10">
            
            {/* Section 1: Profile Identity */}
            <section className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_10px_30px_-5px_rgba(255,176,156,0.15)] flex flex-col md:flex-row items-center gap-8 border border-outline-variant/10">
              <div className="relative group shrink-0">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-container/30">
                  <img 
                    alt="Large Avatar" 
                    className="w-full h-full object-cover" 
                    src={avatarUrl}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 flex items-center justify-center rounded-full shadow-[0_4px_12px_rgba(139,78,62,0.3)] hover:scale-110 transition-transform active:scale-95 disabled:opacity-60"
                  aria-label="Change avatar"
                >
                  {isUploadingAvatar ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                </button>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-on-surface mb-2">Profile Identity</h3>
                <p className="text-base font-medium text-on-surface-variant mb-6">Update your photo and identity to let your friends recognize you.</p>
                {avatarError && <p className="mb-3 text-sm font-bold text-on-error-container">{avatarError}</p>}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
                </button>
              </div>
            </section>

            {/* Section 2: Personal Info */}
            <section className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_10px_30px_-5px_rgba(255,176,156,0.15)] border border-outline-variant/10">
              <div className="flex items-center gap-2 mb-8 text-primary">
                <UserIcon size={24} />
                <h3 className="text-xl font-bold">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-2">Full Name</label>
                  <input 
                    type="text" 
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="bg-surface p-4 rounded-full border-2 border-outline-variant/30 focus:border-tertiary focus:ring-0 transition-colors text-base font-medium text-on-surface outline-none" 
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-2">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">@</span>
                    <input 
                      type="text" 
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled
                      className="bg-surface p-4 pl-10 rounded-full w-full border-2 border-outline-variant/30 focus:border-tertiary focus:ring-0 transition-colors text-base font-medium text-on-surface outline-none opacity-70 cursor-not-allowed" 
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-2">Bio</label>
                  <textarea 
                    rows={3}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="bg-surface p-4 rounded-2xl border-2 border-outline-variant/30 focus:border-tertiary focus:ring-0 transition-colors text-base font-medium text-on-surface outline-none resize-none" 
                  />
                </div>
                
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-2">Location</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <input 
                      type="text" 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="bg-surface p-4 pl-12 rounded-full w-full border-2 border-outline-variant/30 focus:border-tertiary focus:ring-0 transition-colors text-base font-medium text-on-surface outline-none" 
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* Section 3: Contact Details */}
            <section className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_10px_30px_-5px_rgba(255,176,156,0.15)] border border-outline-variant/10">
              <div className="flex items-center gap-2 mb-8 text-primary">
                <Mail size={24} />
                <h3 className="text-xl font-bold">Contact Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-2">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    readOnly
                    className="bg-surface p-4 rounded-full border-2 border-outline-variant/30 focus:border-tertiary focus:ring-0 transition-colors text-base font-medium text-on-surface outline-none opacity-70 cursor-not-allowed" 
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-2">Website</label>
                  <input 
                    type="url" 
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="bg-surface p-4 rounded-full border-2 border-outline-variant/30 focus:border-tertiary focus:ring-0 transition-colors text-base font-medium text-on-surface outline-none" 
                  />
                </div>

              </div>
            </section>

            {/* Section 4: Preferences */}
            <section className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_10px_30px_-5px_rgba(255,176,156,0.15)] border border-outline-variant/10">
              <div className="flex items-center gap-2 mb-8 text-primary">
                <Settings size={24} />
                <h3 className="text-xl font-bold">Preferences</h3>
              </div>
              
              <div className="flex flex-col gap-8">
                {/* Profile Visibility */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">Profile Visibility</h4>
                    <p className="text-sm text-on-surface-variant">Allow everyone to see your shared moments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-14 h-7 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-surface-variant after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>

                {/* Theme Selection */}
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
              </div>
            </section>

            {/* Section 5: Action Buttons */}
            <footer className="flex items-center justify-end gap-4 sm:gap-6 pt-4 pb-12">
              <button className="px-6 sm:px-8 py-3 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-variant transition-colors active:scale-95">
                Cancel
              </button>
              
              <button 
                onClick={handleSave}
                disabled={isUpdatingProfile}
                className={`px-8 sm:px-10 py-3 rounded-full text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 min-w-[160px] ${
                  updateProfileSuccess 
                    ? 'bg-tertiary-container text-on-tertiary-container shadow-[0_4px_12px_rgba(161,197,255,0.4)]' 
                    : isUpdatingProfile
                      ? 'bg-primary-container text-on-primary-container opacity-80 cursor-not-allowed'
                      : 'bg-primary-container text-on-primary-container shadow-[0_4px_12px_rgba(255,176,156,0.3)] hover:shadow-[0_8px_16px_rgba(255,176,156,0.4)] hover:-translate-y-0.5 active:scale-[0.98]'
                }`}
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : updateProfileSuccess ? (
                  <>
                    <span>Saved!</span>
                    <CheckCircle size={20} />
                  </>
                ) : (
                  <>
                    <span>Save Changes</span>
                    <CheckCircle size={20} />
                  </>
                )}
              </button>

            </footer>
          </div>
        </div>
      </div>
    </Layout>
  );
}
