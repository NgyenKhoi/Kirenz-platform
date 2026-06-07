import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Bell, Grid, View, Plus, 
  Compass, Sparkles, PartyPopper, 
  Smile, UserPlus, Lightbulb, Menu 
} from 'lucide-react';
import Layout from './components/Layout';

export default function Stories() {
  return (
    <Layout>
      <div className="bg-surface text-on-surface min-h-screen pb-20 lg:pb-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex justify-between items-center mb-0 mt-4 px-6 z-50 absolute w-full top-0">
           <div className="flex gap-2 ml-auto">
            <button className="bg-surface/50 backdrop-blur p-2 rounded-full text-on-surface-variant hover:text-primary">
              <Search size={20} />
            </button>
            <button className="bg-surface/50 backdrop-blur p-2 rounded-full text-on-surface-variant hover:text-primary">
              <Bell size={20} />
            </button>
           </div>
        </header>

        <div className="flex min-h-screen pt-16 lg:pt-0">
          {/* Main Content Canvas */}
          <main className="flex-1 w-full p-4 md:p-8">
            <div className="max-w-6xl mx-auto xl:mr-[320px]">
              
              {/* Top App Bar (Desktop Content Header) */}
              <header className="hidden lg:flex justify-between items-center w-full mb-8">
                <div className="flex items-center gap-4 bg-surface-container rounded-full px-4 py-2 w-80 shadow-sm border border-outline-variant/20 focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                  <Search size={20} className="text-outline" />
                  <input 
                    type="text" 
                    placeholder="Search memories..." 
                    className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full outline-none text-on-surface"
                  />
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                  <button className="p-2 text-on-surface-variant hover:bg-primary-container/20 rounded-full transition-colors active:scale-95">
                    <Bell size={24} />
                  </button>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container shrink-0">
                    <img 
                      alt="User Profile" 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs8AQ1VyctgRMqOBqcr3PDc7VEE9fQ2Finhj3ZftNZfaFDrOEUoeQ19iPtUyTrCijbr6p9xNxzWw8p_x6kxMmKvn_dfE1apfaKVZ5nrCzUzLb2VGanYhffU2Wdg7mSFxI-4RIzUGYB7Uk0_E39bQoOqSMovV-mxAlZYmeNfP-9PMJno1uQB10MAUfCdpRAiHr2bQBE50OhVtqM_M-N8ruZ6NeEIZZupVjU5N-EdjthGlfNpVJRVgG-wsao1aT-a-SG0AnWKaaw-5E"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </header>

              {/* Section Header */}
              <header className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-primary tracking-tight">Daily Stories</h2>
                  <p className="text-base font-medium text-on-surface-variant mt-1">Ephemeral moments from your kindred spirits.</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full bg-surface-container-high text-primary hover:bg-primary-container hover:text-on-primary-container transition-all">
                    <Grid size={20} />
                  </button>
                  <button className="p-2 rounded-full bg-surface-container-high text-primary hover:bg-primary-container hover:text-on-primary-container transition-all">
                    <View size={20} />
                  </button>
                </div>
              </header>

              {/* Stories Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                
                {/* Your Story Creator Card */}
                <div className="relative group aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(28,28,24,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(28,28,24,0.12)] border border-outline-variant/20">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnRU03r6a8PJ9qFRoDv-JXqwfJ5_zOn160D-wlxB5JG9wr1vbq6BJSp0jhlSrSnovYoy9e9lHv_c9lpnMVP8aHs823Uh8iU8VNZ0MgrVxcZsPJ7i3QcKySmcGXBE20NYuD3oXueoBZbJofpil3EoCO1JjeyU-jb8Eihxa57SLe40sYW7ZwqsnoRMuzx3uVCGpsxFFge3ufwbPNv82CQkW-ddZ4mOls5cfYiDdhwWqIwXHk3RUC3ychTik9ewJ6K86f2gPvjuvEBkY"
                    alt="Create story background"
                    className="w-full h-full object-cover blur-[2px] brightness-75 group-hover:blur-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 group-hover:bg-black/10 transition-all">
                    <div className="w-14 h-14 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-3 shadow-[0_4px_12px_rgba(139,78,62,0.3)] transform group-hover:rotate-90 transition-transform duration-500">
                      <Plus size={32} />
                    </div>
                    <span className="text-white font-bold text-sm drop-shadow-md">Add Story</span>
                  </div>
                </div>

                {/* Friend Story 1 */}
                <Link to="/story/1" className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(28,28,24,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(28,28,24,0.12)] group border border-outline-variant/20 block">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5a96OpWV9b5fYm4-XJzYCRnxMLScbBI3cwlqEZAq84uJDcjXiJedJnz0VmQc4hqbujWeOsf5WT7ZYfgttcJzuP3ItAY3ce69oxFBsAv0EGlkBrjeO5AzxWYDrqrfFn0e6p02pjpsutmLXcC-bLu0pFgoFsr1aQ1fjawJwqHjMgdJkUAuxNliRuV_2P3UIxfTGbCUK0Y7TdxWwV7PiIXqbfXPQK3qkFcHYfRxuVyIGIk5SVrDPVOwzyLvs0Sqk0QsLDOTVPL5Y_I4"
                    alt="Oliver's Story"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-white/70 backdrop-blur-md m-2 rounded-[1rem] border border-white/40 shadow-sm transition-transform translate-y-1 group-hover:translate-y-0 duration-300">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full shadow-[0_0_12px_rgba(255,176,156,0.6)] p-0.5 overflow-hidden shrink-0 bg-primary-container">
                        <img 
                          alt="Oliver Hayes" 
                          className="w-full h-full rounded-full object-cover border-2 border-white" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd6XG3u1U1t_SDj6NTj1XglCcZ49PAY1tejlXOJsX8PYnH0U6RTv566KJYMW8w4RHlgJ_yqUOycdjVHD_eg7iv50XrEOjup1fJ14-7bqt2tuQrovZYLVcfNrVNO_yHhkJANCyUs79i_mG6ilIBTkUUppFBGE8aqBEHaXWNlgxJD0i0zmuL8dKveTP2SXW_TWx28Ewrz_s_PGLepGAd-fv51jKuzn9uYb9yNtfl3ThVOAY9vx__i9VqP0qY15mQ27hTh-oRtuJw8jw"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-on-surface font-bold text-xs truncate">Oliver Hayes</p>
                        <p className="text-on-surface-variant text-[10px] font-medium mt-0.5">2h ago</p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Friend Story 2 */}
                <Link to="/story/2" className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(28,28,24,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(28,28,24,0.12)] group border border-outline-variant/20 hidden sm:block">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnspysFS6q-cMoOF6ZIrzbqLdG40cNSoWLqf1C13ZgaGswt73cCzibzz6WHKNfr9gZGHSzdi-vDUuxLjvwIT5G6tL5UXKsDu7_H4a0X5Kb2XNQpZlsn20XFIXlT8lAyrlNW9abng4Y45XmUXEqUL6_ihKgdKFSuBKeF3ik6Vhs7ZMm-wVEPs5zIQ9apcpcacdzte0KNPyTwhZU8U6N4Iaq-PWUpMNJaHODmVwXTcIYonZQVyOCpYbx820YDLJnuvDUz5rRyZtpxJQ"
                    alt="Elena's Story"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-white/70 backdrop-blur-md m-2 rounded-[1rem] border border-white/40 shadow-sm transition-transform translate-y-1 group-hover:translate-y-0 duration-300">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full shadow-[0_0_12px_rgba(255,176,156,0.6)] p-0.5 overflow-hidden shrink-0 bg-primary-container">
                        <img 
                          alt="Elena Thorne" 
                          className="w-full h-full rounded-full object-cover border-2 border-white" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlONZjrpe8f_nJwHzGuS_pZFm1BSon44kVmplGy2g4O6DH7KZfDuPnuCv_eWr6HPNObVVk8QURY5Xxy5e2dYWRipoj-S0_3tkr8v5zRWO7cZ5tjJ0_9odA6mzPB7KvVFWvgxFKntxqu8KEBJV7IH8LkhLrzx3FxugFVbW4PWdRma1EiYdaAeDvoAODLSvHa9mGZqqiQovbOi5AHQ2UbswXKR9TqzxNYfbNycLTdnhS0cEqU6avG_nlV0g2Nf2CjfEq3DKBbY5p43g"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-on-surface font-bold text-xs truncate">Elena Thorne</p>
                        <p className="text-on-surface-variant text-[10px] font-medium mt-0.5">5h ago</p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Friend Story 3 */}
                <Link to="/story/3" className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(28,28,24,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(28,28,24,0.12)] group border border-outline-variant/20 hidden md:block">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKv506YWqC6yY-SSvaehjifhnJhWOoTKSgXit65Im0neogUl7jT11wqZH-N75RY_VgWK1PrYmPhnucTmXvAyxJ0i5EF_odd95iKNatROEdaZziciLwknVpyU4d3IIMKmeT3BJLMhDm_h9wivt1dpgwyUeGMy2yabUl43Op1cKiSr4zuMDZFvCmqwoC3FrTjdv0Ac8lquibrW27kTIn-io6NCEbzk9ZkqHc_nYxOtC7g0zIZWAVtlfoAG0BC-mWH7wJSLGfF3_wQ4g"
                    alt="Maya's Story"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-white/70 backdrop-blur-md m-2 rounded-[1rem] border border-white/40 shadow-sm transition-transform translate-y-1 group-hover:translate-y-0 duration-300">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full shadow-[0_0_12px_rgba(255,176,156,0.6)] p-0.5 overflow-hidden shrink-0 bg-primary-container">
                        <img 
                          alt="Maya June" 
                          className="w-full h-full rounded-full object-cover border-2 border-white" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfIn6vNGMWiCb-pq6220jM-QMI4-nNWvFsbE5n47p5oFXfu67zJ1dYineM8M1DEjQPEzVkp91XqXoaTeVG4vVqf1G1ecy57PE01MKyu8LNRSEZr48TkdFuZzYCkxzUFitNhT-LtcSBF6q473mnrWasFUNmf0B6Wqr7kCSjeGOoUElhKW5YZ48FHHdZ8jiqvmSN6sfcz1wL5i-AMgYgD0pko1NM9viFp1ArAbEjfQ2eUzogae5ltDhducupDwxUN9VWlPCrhs1zxQ8"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-on-surface font-bold text-xs truncate">Maya June</p>
                        <p className="text-on-surface-variant text-[10px] font-medium mt-0.5">12m ago</p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Friend Story 4 */}
                <Link to="/story/4" className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(28,28,24,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(28,28,24,0.12)] group border border-outline-variant/20 hidden lg:block">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIY9a7Z5boU7Q6hzKL2J7JCZprpt-UA43f_devkds-2zyPPVRxzXQZBy2_nbEn3tWnkyx_xgaimt1mUVYyX6KInxutVpvCmunh242v-7Hwb5lkPKwvLGnhIcfNPLW2N8aKwhtg2wMPxut0Yufn60yIm_j24uMGBnG7CJYsp8n78GzoZKuPB9JaPl0gc6nsj9sQhKMFk1Pt-rP2SPbyFuQvLXKDAlyNQkmqstiW861oY0JknBXQtqdQINI_ZILHgB8MN3l7R2jjPpM"
                    alt="Leo's Story"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-white/70 backdrop-blur-md m-2 rounded-[1rem] border border-white/40 shadow-sm transition-transform translate-y-1 group-hover:translate-y-0 duration-300">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full shadow-[0_0_12px_rgba(255,176,156,0.6)] p-0.5 overflow-hidden shrink-0 bg-primary-container">
                        <img 
                          alt="Leo Vance" 
                          className="w-full h-full rounded-full object-cover border-2 border-white" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7bbTBuq8x0GO2lT7FmFhKUPhNEZ9NG43o-3cBkxrROA2q-rC7zwQBF1ZSymtmZm4lU9NIrdyvLjUIZ0eIGDSSy5vDA93kbaDjCEpNN04NiOt7qJkR0jNy3hs1Pxz_q2Z73HtHhnquEg3QTlTFxeQro_20_ST9L_TFBAis-evr-GigOvJKqqUUossAY4jIxvPX84Bs_DlZJL4oIU79wSlAiyxbtrbLsCxvim1yacWqTRrqx_eO4wEQlBIFLE_H4m8m7eKo-IYKlJU"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-on-surface font-bold text-xs truncate">Leo Vance</p>
                        <p className="text-on-surface-variant text-[10px] font-medium mt-0.5">8h ago</p>
                      </div>
                    </div>
                  </div>
                </Link>

              </div>

              {/* Discovery Section */}
              <section className="mt-16">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2 tracking-tight">
                    <Compass size={28} />
                    Trending Discovery
                  </h3>
                  <a className="text-sm font-bold text-secondary hover:underline transition-all" href="#">View all public stories</a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Discovery Card 1 */}
                  <div className="bg-surface-container-lowest p-4 rounded-[1.5rem] shadow-[0_4px_12px_rgba(28,28,24,0.05)] border border-surface-container hover:shadow-[0_8px_20px_rgba(28,28,24,0.08)] transition-all flex gap-4 items-center cursor-pointer group">
                    <div className="w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden relative">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuANUKSC8_QdjMepdWrJX8S2yFojBn84Ko-rN3I2uthmZ6R4yIMMJaatIEqLNxtrsZp14xqD6zhe6krqBFc-l-SEvQNkuEU1ZmiJlqHF0e6SonoyLuG-t4haCiVOzkUGlT8GoZ_ZglZCD9W3sBWjyV0tVgt40Gn3c8rmtR07tuRphBhThdN3v4JqhTM6tHoX-guFpSDH6MlKdMLXA7n7wlKcMm6uv27-pOZJWdD6SVZn6TIiFQMjC03ZhVr5xUX83Lj0Su-c-7xo2xk"
                        alt="Peak Moments"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-white p-1.5 rounded-full shadow-md">
                        <Sparkles size={14} />
                      </div>
                    </div>
                    <div className="flex flex-col h-full py-1">
                      <h4 className="font-bold text-base text-on-surface">Peak Moments</h4>
                      <p className="text-xs font-medium text-on-surface-variant line-clamp-2 mt-1 leading-snug">Join the community in sharing your most height-defying memories this week.</p>
                      <div className="flex items-center gap-2 mt-auto pt-2">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-secondary-fixed"></div>
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-primary-fixed"></div>
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-tertiary-fixed"></div>
                        </div>
                        <span className="text-[10px] text-on-surface-variant font-bold">12k Joining</span>
                      </div>
                    </div>
                  </div>

                  {/* Discovery Card 2 */}
                  <div className="bg-surface-container-lowest p-4 rounded-[1.5rem] shadow-[0_4px_12px_rgba(28,28,24,0.05)] border border-surface-container hover:shadow-[0_8px_20px_rgba(28,28,24,0.08)] transition-all flex gap-4 items-center cursor-pointer group">
                    <div className="w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden relative">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnJfesdeDafGOTVRaMnOuMY20oI0a9MDvI45rr4ZhJAcd6hj00b7RpfvEVY_SQ5Kuawx25DvknEilzYZ0rpQfU6KX_eaEY8doGx_EBllwgulpwxFVMe2gyD_zZghjHMIAIQBXZhJ90g5RsE0geT_71jNrFFlj19QLtw9GMJ69NiN0g6EME9UjcMll0yhsaLRRbtp__bpJRzAS2N0E9ylVRqjZWUNt0onXRHkb71ohduPyZiOogBEywVVPEbaGN4GW-KQozEeLYKIA"
                        alt="Sweet Celebrations"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-secondary text-on-secondary p-1.5 rounded-full shadow-md">
                        <PartyPopper size={14} />
                      </div>
                    </div>
                    <div className="flex flex-col h-full py-1">
                      <h4 className="font-bold text-base text-on-surface">Sweet Celebrations</h4>
                      <p className="text-xs font-medium text-on-surface-variant line-clamp-2 mt-1 leading-snug">Small wins deserve big smiles. Share your tiny victories today!</p>
                      <div className="flex items-center gap-2 mt-auto pt-2">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-primary-fixed"></div>
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-secondary-fixed"></div>
                        </div>
                        <span className="text-[10px] text-on-surface-variant font-bold">8.4k Stories</span>
                      </div>
                    </div>
                  </div>

                  {/* Discovery Card 3 */}
                  <div className="bg-surface-container-lowest p-4 rounded-[1.5rem] shadow-[0_4px_12px_rgba(28,28,24,0.05)] border border-surface-container hover:shadow-[0_8px_20px_rgba(28,28,24,0.08)] transition-all flex gap-4 items-center cursor-pointer group">
                    <div className="w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden relative">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuALxkiEzUSRitllJmrNtg8M-TUfQ5yRxk_FK8dT7BqYnzBCPvMnbc8KMO56rQMkbeSsBEi-stfOLgUWoDTD9F1k2XHUwXPz3ZkfUkrOzhj0uUptpzaMe76saF1bFmvkgzOZcGfjURywI4_75HKWp4HD1z8yhGT9fYKuU7ffk__d6HryM1rFh9bn5Zp2bp8dzasBXWn8ALFvpmy04pJCF0VJSmUXBXxqFr-2FseuD-CzIZ06y7QLo4TiTyHRmUpFgY_Y4RroaaGzH0s"
                        alt="Morning Rituals"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-tertiary text-on-tertiary p-1.5 rounded-full shadow-md">
                        <Smile size={14} />
                      </div>
                    </div>
                    <div className="flex flex-col h-full py-1">
                      <h4 className="font-bold text-base text-on-surface">Morning Rituals</h4>
                      <p className="text-xs font-medium text-on-surface-variant line-clamp-2 mt-1 leading-snug">What grounds you before the world wakes up? Share your calm.</p>
                      <div className="flex items-center gap-2 mt-auto pt-2">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-tertiary-fixed"></div>
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-primary-fixed"></div>
                        </div>
                        <span className="text-[10px] text-on-surface-variant font-bold">25k Stories</span>
                      </div>
                    </div>
                  </div>

                </div>
              </section>

            </div>
          </main>

          {/* Right Discovery Sidebar */}
          <aside className="fixed right-0 top-0 h-screen w-[320px] p-8 hidden xl:flex flex-col gap-8 bg-surface border-l border-outline-variant/10 overflow-y-auto">
            
            <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
              <h3 className="text-xl font-bold text-primary mb-6">Kindred Spirits</h3>
              <div className="space-y-6">
                
                {/* Sprit 1 */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="w-12 h-12 rounded-full shadow-[0_0_12px_rgba(255,176,156,0.6)] p-0.5 overflow-hidden shrink-0 bg-primary-container border border-primary/20">
                      <img 
                        alt="Arthur Dent" 
                        className="w-full h-full rounded-full object-cover border-2 border-white" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8TOsXLxeNO3YtzYOrnpJ0ujk1hbN-GafbsUSTAdgviIlSa2HdHu2yi1Mpb-Yzsebc-3T5TLN6lJO44A0rDPpjRlXLngj5pwxxT6WcIHk803_PofWKPFJxBXwPLARYWmuC-mbvgL6A5ruWOqzScUy8xxJWJTndtFC1gq-3ZVDlaxzYHkZWZRMIBmgEQOjWmywKW7CtInD-nJDvRUM4yI33G1VWJ4I9h1vj5wpJdZdUQrGhdmb26QGt7m5NNgUsOKfAU3oMk1WkTIo"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Arthur Dent</p>
                      <p className="text-[11px] font-medium text-on-surface-variant mt-0.5">Matches your energy</p>
                    </div>
                  </div>
                  <button className="text-primary hover:bg-primary-container hover:text-on-primary-container p-2 rounded-full transition-colors active:scale-95">
                    <UserPlus size={20} />
                  </button>
                </div>

                {/* Sprit 2 */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="w-12 h-12 rounded-full shadow-[0_0_12px_rgba(255,176,156,0.6)] p-0.5 overflow-hidden shrink-0 bg-primary-container border border-primary/20">
                      <img 
                        alt="Sarah Jenkins" 
                        className="w-full h-full rounded-full object-cover border-2 border-white" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAU_egNW3-JyB2JE3UABelBqPTMEkB-5n6VWfw8Qv9dZEw1fJWKku2dWRQzfrJhWo4LlsDFdQeyBjZRa9jFd-dDV9fV2TeP6maTaNyZLgsRB7Clzkg-6vYjK85S0E7hc1eGM0rYFWpq5DNjCnSbSNWqPLh_U1yakWIyOS50cuOpL4ovEHwLQVlYJjUK_fJN72ABQ-Zlqb6e8ZpyiL0XQR_G41EIdlWEb7O5Q9WNDL1SvzQ_YvWhoCaL76wxDlwEMbsuVbaYrqmKuU"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Sarah Jenkins</p>
                      <p className="text-[11px] font-medium text-on-surface-variant mt-0.5">Coffee lover</p>
                    </div>
                  </div>
                  <button className="text-primary hover:bg-primary-container hover:text-on-primary-container p-2 rounded-full transition-colors active:scale-95">
                    <UserPlus size={20} />
                  </button>
                </div>

              </div>
            </div>

            <div className="bg-secondary-container p-6 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(255,217,125,0.4)] text-on-secondary-container mt-2">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={24} className="fill-current" />
                <h4 className="font-bold text-lg">Story Prompt</h4>
              </div>
              <p className="text-base font-medium italic leading-relaxed">
                "What's a small detail that made you smile today?"
              </p>
              <button className="mt-6 w-full bg-white text-secondary font-bold py-3 rounded-full shadow-[0_4px_12px_rgba(118,91,6,0.15)] hover:shadow-[0_8px_20px_rgba(118,91,6,0.2)] transition-all hover:-translate-y-0.5 active:scale-95">
                Answer now
              </button>
            </div>

          </aside>
        </div>
      </div>
    </Layout>
  );
}
