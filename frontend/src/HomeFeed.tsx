import React from 'react';
import { 
  Search, Home, Users, Bell, User, UsersRound, Sparkles, 
  Bookmark, Calendar, Image as ImageIcon, Smile,
  Globe, MoreHorizontal, Heart, MessageSquare, Share2, ThumbsUp,
  Gift, Video, Menu, Edit2
} from 'lucide-react';
import Layout from './components/Layout';

export default function HomeFeed() {
  return (
    <Layout>
      <main className="px-6 md:px-8 py-8 min-h-screen xl:mr-[320px]">
        {/* Header (Mobile Logo + Search) */}
        <header className="md:hidden flex justify-between items-center mb-6 mt-4">
          <h1 className="text-xl font-bold text-primary-container tracking-tight">MOMENTS</h1>
          <button className="text-on-surface-variant hover:text-primary">
            <Search size={24} />
          </button>
        </header>

        {/* Center Column: Main Feed */}
        <div className="flex flex-col gap-6 pb-20 lg:pb-6 max-w-[600px] mx-auto md:max-w-none xl:max-w-[800px]">
          
          {/* Create Post Box */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)]">
            <div className="flex gap-4 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                <img 
                  alt="Profile" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6OZmEvc5z_VzqtGWlu1CnwIZ5yIzZ41xfHoc684Gv1_k0UwG56p95m0odStkwO91OFz04RZR_uNHcmDn3XP8_CFYZLeK9udAskwJ7OojKfqXFKOpKV-iLJhIa37BFH3R9a_VGiYpRD46RfKC4HKnjIO2N3nNtte6VJ97PwNkfZkKqosTycRhvgdo1iXJbUu-SXwwSqX0YH40QDKS1Hywfrr5zgx7GPcNobZMil2Aa1hJDRxWlny7_l-bZWwqYexNeVX8x6581LUo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button className="w-full bg-surface-container-low hover:bg-surface-container-high text-left px-6 py-3 rounded-full text-on-surface-variant text-base font-medium transition-colors border-none outline-none">
                What's on your mind, Alex?
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-between items-center pt-2 border-t border-outline-variant/30 mt-4">
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-low rounded-lg transition-colors text-sm font-bold text-tertiary">
                  <ImageIcon size={20} /> Photo/Video
                </button>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-low rounded-lg transition-colors text-sm font-bold text-secondary hidden sm:flex">
                  <Smile size={20} /> Feeling/Activity
                </button>
              </div>
              <button className="bg-primary-container text-on-primary-container px-8 py-2 rounded-full text-sm font-bold active:scale-95 transition-transform shadow-sm">
                Post
              </button>
            </div>
          </div>

          {/* Feed Post 1 */}
          <article className="bg-surface-container-lowest rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] overflow-hidden">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
                    <img 
                      alt="Sarah Chen" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuACphfbeyI4x91RUfnAAgrqnLjRtyZ__cPoEzrqU_Q8dtC1ypBmQPrVexNj0V_cpdYzqqRaqJVLiIvQTSGfpO7_dIDd0LVI3Wk5CX0AZVgXPVLUoAxOdngUYxjkaeOnjjarAHNYWJvY032xNyV4yhhipgYBo6g4VF2w0XJsq64pO3aulvnhxH5WNOBV9s_Ovjo8z1eUoFSaTajTahTnUt2kMS0WkaMbGr2Uzibcd0DszByVoz4JmWAVfR7IkCLQp3OFlUaiRqGedRw"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-on-surface leading-tight">Sarah Chen</h3>
                    <p className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                      2 hours ago • <Globe size={12} />
                    </p>
                  </div>
                </div>
                <button className="p-2 text-outline hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors">
                  <MoreHorizontal size={24} />
                </button>
              </div>
              
              <p className="text-lg font-medium text-on-surface mb-4">
                Nothing beats Sunday morning pancakes with the whole family. Grateful for these small, sweet moments! 🥞✨
              </p>
            </div>
            
            <div className="px-4 pb-4">
              <div className="rounded-[1.5rem] overflow-hidden h-[300px] sm:h-[400px]">
                <img 
                  alt="Family breakfast" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvnV7amCwo8FRteBAUKETVq9u4kOBZEWoozSNcUHA-wMl7zYiIk7dJcrpz0poVjuEOynZPNE0jne0WRmyr1Fo5VjeUmj8AzlHa9M0E0WBDK4eSGW9M_3OFBAoUgkQ8VznK9CbDr6NLz-UmfOjm1jspLPYOqxHLK7mUW629cmuJir7l5wDVaW2tL1Q5u4LJ3CRs4RUe8wdDuV38Aex8A-bGBcNkbw9xPOEOfuhp9jRox_oZj4-TI_dfidZZNF8LkIZGJCvyW-KFuhk"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            
            <div className="px-6 pb-6 pt-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 py-2 border-b border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-surface-container-lowest z-20">
                      <Heart size={12} className="text-white fill-current" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center border-2 border-surface-container-lowest z-10">
                      <Sparkles size={12} className="text-white fill-current" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">Maria and 42 others</span>
                </div>
                <span className="text-xs font-bold text-on-surface-variant">12 comments • 4 shares</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button className="flex items-center justify-center gap-2 py-2 hover:bg-primary-fixed rounded-full text-primary transition-all text-sm font-bold active:scale-95">
                  <Heart size={20} /> <span className="hidden sm:inline">Love</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-2 hover:bg-secondary-fixed rounded-full text-secondary transition-all text-sm font-bold active:scale-95">
                  <MessageSquare size={20} /> <span className="hidden sm:inline">Comment</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-2 hover:bg-tertiary-fixed rounded-full text-tertiary transition-all text-sm font-bold active:scale-95">
                  <Share2 size={20} /> <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </article>

          {/* Feed Post 2 */}
          <article className="bg-surface-container-lowest rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] overflow-hidden">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
                    <img 
                      alt="Marcus Jones" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSLhTe_-fRFz2OZ9_npRSjoR7VvPuQq4eJI3JyLZjPdgwhb3S8dDDK8X3l3XkwOzUokW1lnntUo0CheLs828O7iboXlXTE2w3VtgOUvzUsMRgr12wHNzgC0eLYBnv0b2n2LfBb8enT_bcFt4asIWXGcxOB-nZQcxFKyVO7xW2RsXnYoOJYsHtKGVmFXtWhZz3BZES_Q1rsoQf2kJvLNxEBKj97o_WWg5E31g7DcuDsUcJ6ta6T0_RnYVsl8q2K4BUsIPTeZyDdTc8"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-on-surface leading-tight">Marcus Jones</h3>
                    <p className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                      5 hours ago
                    </p>
                  </div>
                </div>
                <button className="p-2 text-outline hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors">
                  <MoreHorizontal size={24} />
                </button>
              </div>
              
              <p className="text-lg font-medium text-on-surface mb-4">
                Finally finished the backyard project! Can't wait for our first community BBQ here. Everyone's invited! 🏡🌿
              </p>
            </div>
            
            <div className="px-4 pb-4">
              <div className="rounded-[1.5rem] overflow-hidden h-[250px] sm:h-[350px]">
                <img 
                  alt="Backyard project" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuADTVHUicXBXL-AZWBCSf8ztzvQJ_z-R0AsHJBqTlIcxnfSRdsCSD-aGjUit9SwXoArcgXbxbQQ9u00xh-kKwLq8TZlGrBLuPPFW53-Hwq467XqaPWrTYn1TKVKTsZMq05dH8lQ2zqJzmlt9ZGUcbi2YVWxuDFcyHO9MLrief8JZzfZl_yS_9y1bCHC-D0p1jUTj91K7LxifJMj86EFosdiqjbsyuAuhNle4DtFkTKLYJc8O-6AEuOvO4KCn1v2DGv82iT79jBC3rU"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            
            <div className="px-6 pb-6 pt-2">
              <div className="flex items-center gap-2 mb-4 py-2 border-b border-outline-variant/30">
                <div className="w-6 h-6 rounded-full bg-tertiary flex items-center justify-center">
                  <ThumbsUp size={12} className="text-white fill-current" />
                </div>
                <span className="text-xs font-bold text-on-surface-variant">88 people liked this</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button className="flex items-center justify-center gap-2 py-2 hover:bg-primary-fixed rounded-full text-primary transition-all text-sm font-bold active:scale-95">
                  <Heart size={20} /> <span className="hidden sm:inline">Love</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-2 hover:bg-secondary-fixed rounded-full text-secondary transition-all text-sm font-bold active:scale-95">
                  <MessageSquare size={20} /> <span className="hidden sm:inline">Comment</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-2 hover:bg-tertiary-fixed rounded-full text-tertiary transition-all text-sm font-bold active:scale-95">
                  <Share2 size={20} /> <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </article>
          
        </div>
      </main>

      {/* Right Column: Sidebar */}
      <aside className="fixed right-0 top-0 h-screen w-[320px] p-8 hidden xl:flex flex-col gap-6 bg-surface z-40 overflow-y-auto">
        <div className="relative w-full mb-2">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input 
            type="text" 
            placeholder="Search for joy..." 
            className="w-full bg-surface-container-lowest border-none rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-container text-base font-medium transition-all shadow-[0_4px_12px_rgba(139,78,62,0.05)]" 
          />
        </div>

        {/* Birthdays */}
        <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)]">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="text-primary-container shrink-0" size={28} />
            <h2 className="text-xl font-bold text-on-surface">Birthdays</h2>
          </div>
          <p className="text-base font-medium text-on-surface-variant leading-snug">
            <span className="font-bold text-on-surface">Elena Vance</span> and <span className="font-bold text-on-surface">2 others</span> have birthdays today. Send them some love!
          </p>
          <button className="mt-4 w-full py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-bold active:scale-95 hover:bg-secondary-fixed transition-colors">
            View Birthdays
          </button>
        </div>

        {/* Contacts */}
        <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-on-surface">Contacts</h2>
            <div className="flex gap-2">
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <Video size={20} />
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
          
          <ul className="flex flex-col gap-2">
            {[
              { name: 'Elena Vance', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm96y7GDFa9_V9laPJPmxPtdOCLZjOzdISZaruYmtk0lF_NGCr2U4pp2DTqhbr47U3LGo4IVHFUdEk34jOTxNmjY2nwfmeGkLy2XsRwvFwatLFLFMI19xrFcaEqpUk1qKDfx7A8huUjlTdT6aebup9SFk44M5gnJ48HTqlr0ZtbuQRrfRkMQFhikJxwvvJ09SKYq-Umr5tOi-QAF9AE3lwPKFmHD7SrbAatBFyOyaqVOfPVwXLoNDQ9SYJE_quame3lxaGUWw0yjE' },
              { name: 'David Miller', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTncRQYbthq3IOr0hY7caydH3cPfyUpc54y2q-raol-xQBpc6l2_QmnEH7nKI_if0fpdA4MTnCVklrFC5D9BiMaZwSI0n3m81brgfnt2EZaRzejdZ3ajZOI9Q3RZpuKHu9P85KaJwe2lQ-EGZiMqLSG_kGUMNd36GiNlL5reTu1BOBBctyhx4Z1uUKE_Zi5lxVxbMEVRnbYukvhv9F_7sBO3_BBT6vAQow-zjRF2x766NvZDTUY4y9aH4t_8tGKQXfzsieDgzdgWc' },
              { name: 'Sophia Bloom', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAduhiXGYzfyQFxt_M6dYGc3daKge46FQvYP-Ug4tYnzYZFi_L-XsVMkbhFl8rPzAyWI9sysRTDhlH2ObgmNz3eZ-_QigZSj_h1QgkOwKJKZLsR9kE_u8EJAbOk512lh71H2WABZMcVfigi__WlBo140g4-4Wo9g5a-VxGrRbxByyVbzGRKFn56kebmOI8FWnR3SxcVDECQjVYWrHcbh2WU3IgApai1wbKOhhYOcb_r_yJjENaILSpgiDMvs9k4AaFNYNK7c1Sz698' },
              { name: 'Uncle Jim', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNhyXq-WoeQ6lqN7A1ay-LifNDyvfKYL7njl-g1pohdRpS4zogmFYeGHE5YgklmHDqxCwWccUuPrmsaJdPZJOPuGMfT38RajBdj3EiHF8zT250UKB1qRw1OUV5Lc2bf3WOujToZljcP3dib-DsC9C-j75xO8SFoqGBZqIkGT8Pz5V8wY7vqZkb3930vb6jCJ6HAim1bfEmf7gNVjD3yBnps7EK8j7JtPE3vRWZl_JNAfymY5PGc3A84wmsc41eqA0FnV45t--yOlo' }
            ].map((contact, i) => (
              <li key={i} className="flex items-center gap-4 cursor-pointer hover:bg-surface-container-low p-2 rounded-[1rem] transition-all group">
                <div className="relative w-10 h-10 shrink-0">
                  <img 
                    alt={contact.name} 
                    src={contact.img}
                    className="rounded-full w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-container-lowest rounded-full"></div>
                </div>
                <span className="text-base font-medium text-on-surface group-hover:text-primary transition-colors">{contact.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* FAB (Mobile Only) */}
      <button className="lg:hidden fixed bottom-20 right-6 w-14 h-14 bg-primary-container text-on-primary-container rounded-full shadow-[0_8px_16px_rgba(255,176,156,0.4)] flex items-center justify-center active:scale-95 transition-transform z-40">
        <Edit2 size={24} />
      </button>
    </Layout>
  );
}

