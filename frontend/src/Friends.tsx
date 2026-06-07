import React from 'react';
import { Search, Sparkles, Users } from 'lucide-react';
import Layout from './components/Layout';

export default function Friends() {
  return (
    <Layout>
      <main className="px-6 md:px-8 py-8 min-h-screen xl:mr-[320px]">
        {/* Header & Search */}
        <header className="max-w-[1000px] mx-auto mb-12 mt-12 md:mt-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-[32px] leading-[40px] tracking-[-0.02em] font-bold text-primary mb-2">Kindred Spirits</h2>
              <p className="text-on-surface-variant text-base font-medium">Connect with people who share your light.</p>
            </div>
          </div>
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search size={24} className="text-primary" />
            </div>
            <input 
              type="text"
              placeholder="Find friends by name or interest..."
              className="w-full bg-surface-container-lowest border-2 border-primary-fixed-dim rounded-full py-4 pl-16 pr-8 text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-container/20 transition-all text-base font-medium placeholder-on-surface-variant/50 shadow-sm" 
            />
          </div>
        </header>

        {/* Main Grid Area */}
        <div className="max-w-[1000px] mx-auto">
          {/* Recent Interactions Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <Sparkles size={24} className="text-primary bg-surface-container-low rounded-full" />
                Recent Interactions
              </h3>
              <button className="text-primary text-sm font-bold hover:underline decoration-2 underline-offset-4">View All</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {/* Friend Card 1 */}
              <div className="bg-surface-container-lowest rounded-[2rem] p-6 shadow-[0_10px_40px_-10px_rgba(139,78,62,0.1)] border border-primary-container/20 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,176,156,0.3)] transition-all group">
                <div className="flex items-start gap-5">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary-fixed">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ-7s6adsOiqYAPUsWELBel8cOaHj9a1Z6pkRvE9bZeILkXa4Uojddjqq-au7S_Q4l5jMVazDJmPaaUbJTXIs4IVQku6xO7i1fmlzLxfQaWnsagvGsnWfT3yUsyfakSrN-5Cu-qB0q0zUAg7zCj9htAQiGhC5N5lUES_uLmx00Q2W4Q1XNteMHgL8eXQ6ylkH8KM5ApYQa6FKPkUylo4eYrtNTMzcHD9W7VvKLIO414iXq8zz3gfffXni0zi_Uc0JDHgBV8B3yrV0" 
                        alt="Clara Sterling"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 border-4 border-surface-container-lowest rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-on-surface">Clara Sterling</h4>
                    <p className="text-on-surface-variant text-xs font-bold mb-2">12 mutual friends</p>
                    <div className="bg-surface-container-low rounded-xl p-3 mb-4 italic text-on-surface-variant text-sm">
                      "Baking sourdough and chasing sunsets today 🥖✨"
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-primary-container text-on-primary-container rounded-full font-bold text-sm hover:brightness-95 active:scale-95 transition-all">
                        Message
                      </button>
                      <button className="px-5 py-3 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-bold text-sm hover:brightness-95 active:scale-95 transition-all">
                        Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Friend Card 2 */}
              <div className="bg-surface-container-lowest rounded-[2rem] p-6 shadow-[0_10px_40px_-10px_rgba(139,78,62,0.1)] border border-primary-container/20 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,176,156,0.3)] transition-all group">
                <div className="flex items-start gap-5">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary-fixed">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfA-7JrRR90czNiNKVYCmrwQ-kgyuxGMJ_T9NStnOy1T9lWSFEpocHGLxOMHrUVo0PTXBZhbv58vke2jf546IJN0V88E3dGBlvcr7xYqLqYjPNTuTD4M_55L-C6E2JIhDdVrGamEO8RgubOyyuyUYWpV7gsj_ip92D-FdVQ5uMs1jNEbBZlHfxDYICloalLhHZwmPte0QYkqyMKZraFDuvGGIxGhMEEcdMEG0Cq5X44fx6UOTavz8e0QhzJD5B2ZZewO2U3nu3x7w" 
                        alt="Julian Rivers"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 border-4 border-surface-container-lowest rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-on-surface">Julian Rivers</h4>
                    <p className="text-on-surface-variant text-xs font-bold mb-2">8 mutual friends</p>
                    <div className="bg-surface-container-low rounded-xl p-3 mb-4 italic text-on-surface-variant text-sm">
                      "Exploring the local library's hidden gems... 📚"
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-primary-container text-on-primary-container rounded-full font-bold text-sm hover:brightness-95 active:scale-95 transition-all">
                        Message
                      </button>
                      <button className="px-5 py-3 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-bold text-sm hover:brightness-95 active:scale-95 transition-all">
                        Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* People You May Know Section */}
          <section className="pb-24 lg:pb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <Users size={24} className="text-primary" />
                People You May Know
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Suggestion Card 1 */}
              <div className="bg-white rounded-[2rem] p-6 shadow-[0_10px_40px_-10px_rgba(139,78,62,0.1)] flex flex-col items-center text-center border border-primary-container/10">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-tertiary-fixed shadow-inner shrink-0">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAarujfctw0GD8Axw7Tzoe5R0n_N42IYOi_LqP-hwdOeXhjlmGNiaWxGhoVkU2lDXMTMGNp8f-dcbsQzRQTe5NJNxU5PM_tmOYut5nb0kps26c9gjdr_eM5bWaRMXnXSorcdHgvTszAgGd0TtPquZ2e7B2hitZmsQDHpNn_Xv8pXPs-eyJc98el8BW1OlKt9W5-DAidETz-srz-EcoavoUDgBXq0_hbAvbB3YBoLAkoaYVGtKSiaL6rfn2BPsRm48KcryM8idVrJo" 
                    alt="Mia Thornton"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h5 className="text-xl font-bold text-on-surface">Mia Thornton</h5>
                <p className="text-primary text-xs font-bold mb-3">Loves: Pottery & Jazz</p>
                <p className="text-on-surface-variant text-sm mb-6 line-clamp-2 px-2">Always looking for new friends to visit local art markets with.</p>
                <div className="flex flex-col w-full gap-2 mt-auto">
                  <button className="w-full py-3 bg-primary-container text-on-primary-container rounded-full font-bold hover:brightness-95 active:scale-95 transition-all">
                    Add Friend
                  </button>
                  <button className="w-full py-2 text-on-surface-variant font-medium hover:bg-surface-container-low rounded-full transition-all text-sm">
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Suggestion Card 2 */}
              <div className="bg-white rounded-[2rem] p-6 shadow-[0_10px_40px_-10px_rgba(139,78,62,0.1)] flex flex-col items-center text-center border border-primary-container/10">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-tertiary-fixed shadow-inner shrink-0">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwjqExgM1NtXhvsb_SQvt4zNgl3q7b-l_fACaTd9mq9dlD1GNYzzEivfIgPmlA6OInIZajtsb_lUEBTXp8-AZ_wGXfsyj_c4JYK_dqEnwRDY5TyUNIxb-bIZWzD5eO_L-D-eUgCSEMIcjUUztDOLJmJII6rCaGcMv0r8jyNT1iS6N_0p_viswWignhbNtxLNnSRhH-PaZgMK6VrUIfffv48u02gxi198mMnZdGhiV_Addjn73vXpwNkuEScbTrZsMXQ8AoPZp3X6c" 
                    alt="Samuel Lee"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h5 className="text-xl font-bold text-on-surface">Samuel Lee</h5>
                <p className="text-primary text-xs font-bold mb-3">Loves: Hiking & Coding</p>
                <p className="text-on-surface-variant text-sm mb-6 line-clamp-2 px-2">Recently moved to the area. Let's explore some trails!</p>
                <div className="flex flex-col w-full gap-2 mt-auto">
                  <button className="w-full py-3 bg-primary-container text-on-primary-container rounded-full font-bold hover:brightness-95 active:scale-95 transition-all">
                    Add Friend
                  </button>
                  <button className="w-full py-2 text-on-surface-variant font-medium hover:bg-surface-container-low rounded-full transition-all text-sm">
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Suggestion Card 3 */}
              <div className="bg-white rounded-[2rem] p-6 shadow-[0_10px_40px_-10px_rgba(139,78,62,0.1)] flex flex-col items-center text-center border border-primary-container/10">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-tertiary-fixed shadow-inner shrink-0">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF_pZ_qGgmyYtbauMJb_PCo3SjF41yXQiTJcZtGTKKS_5dQsMTDkLO3POmyUcJXL-HnXlvugZaGEqZMJj2rm__pfWf2tFdoDvWVZoSu1YLFVztVUL9hBAP2oSlc7VE0P_kbqAMpRAm6nDQQKBPtXkOgxiiGVHwsIo2nh4vNo7GVXWl0X5dsrLg2rTAd1Hk9BUKamVkrnoe-8-gVKUCzpufuGSlwzcfTJ_YiegDnZitZ9XJYDmd9OF5aAaC396gmB8b77YMekwJ2O0" 
                    alt="Elena Rossi"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h5 className="text-xl font-bold text-on-surface">Elena Rossi</h5>
                <p className="text-primary text-xs font-bold mb-3">Loves: Cats & Yoga</p>
                <p className="text-on-surface-variant text-sm mb-6 line-clamp-2 px-2">Spreading positive vibes and morning stretches.</p>
                <div className="flex flex-col w-full gap-2 mt-auto">
                  <button className="w-full py-3 bg-primary-container text-on-primary-container rounded-full font-bold hover:brightness-95 active:scale-95 transition-all">
                    Add Friend
                  </button>
                  <button className="w-full py-2 text-on-surface-variant font-medium hover:bg-surface-container-low rounded-full transition-all text-sm">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Right Sidebar Discovery */}
      <aside className="fixed right-0 top-0 h-screen w-[320px] p-8 hidden xl:block bg-surface z-40 overflow-y-auto">
        <div className="bg-surface-container rounded-[2rem] p-6 shadow-[0_10px_40px_-10px_rgba(139,78,62,0.1)]">
          <h4 className="text-xl font-bold text-primary mb-6">Trending Interests</h4>
          <div className="flex flex-wrap gap-2 mb-8">
            {['#SourdoughBaking', '#MorningYoga', '#CozyHomes', '#DigitalArt'].map(tag => (
              <span key={tag} className="px-4 py-2 bg-tertiary-container text-on-tertiary-container rounded-full text-xs font-bold">
                {tag}
              </span>
            ))}
          </div>

          <h4 className="text-xl font-bold text-primary mb-6">Upcoming Hangouts</h4>
          <div className="space-y-4">
            <div className="flex gap-4 p-3 bg-surface-container-lowest rounded-xl border border-primary-container/20">
              <div className="w-12 h-12 bg-primary-container rounded-xl flex flex-col items-center justify-center text-on-primary-container font-bold shrink-0">
                <span className="text-[10px]">OCT</span>
                <span className="text-lg leading-tight">12</span>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-bold text-on-surface">Pottery Workshop</p>
                <p className="text-xs text-on-surface-variant">3 friends attending</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-3 bg-surface-container-lowest rounded-xl border border-primary-container/20">
              <div className="w-12 h-12 bg-secondary-container rounded-xl flex flex-col items-center justify-center text-on-secondary-container font-bold shrink-0">
                <span className="text-[10px]">OCT</span>
                <span className="text-lg leading-tight">15</span>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-bold text-on-surface">Book Club Night</p>
                <p className="text-xs text-on-surface-variant">5 friends attending</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </Layout>
  );
}
