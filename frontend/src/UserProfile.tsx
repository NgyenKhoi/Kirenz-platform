import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Bell, Heart, Mail, User, Users, UsersRound, Sparkles, 
  PlusCircle, Camera, Plus, Edit2, MapPin, Calendar, Link as LinkIcon, 
  Image as ImageIcon, Smile, MoreHorizontal, MessageSquare, Share2, ThumbsUp
} from 'lucide-react';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';

export default function UserProfile() {
  const { user } = useAuth();

  const displayName = user?.displayName || user?.username || 'User';
  const bio = user?.bio || 'Capturing life\'s little joys. 🌻';
  const location = user?.location || 'Portland, Oregon';
  const website = user?.website || 'kirenz.com';
  const avatarUrl = user?.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbY_GUlw34tnkyFIMOl2BKettMEaotAsjvlMn6C_uAYu2C3nM_ijw2rr7U9XDlyBU_0LlidZUITe7OACoMYLzy0O5RdjRo0fH9NEmNkLOhjpaIoRogweGdwOQ-QcP4_RepAyayI6_jVKYnJjekbEf07QzVchgO3G2gcSWct_pYdY99tJYJchT_3k1kNmpev6u7x_QcQx94o5RYQ1tq5OVrkvJSM5IlD4Q11oyMhGIqiJ2ENgSg_Qv24OaSlAfI-ypwo4U6jlVrwoA';
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'September 2021';
  return (
    <Layout>
      <div className="bg-surface text-on-surface min-h-screen pb-20 md:pb-0">
        
        {/* Mobile Header (Optional) */}
        <header className="md:hidden flex justify-between items-center mb-0 mt-4 px-6 z-50 absolute w-full top-0">
           <div className="flex gap-2 ml-auto">
            <button className="bg-surface/50 backdrop-blur p-2 rounded-full text-on-surface hover:text-primary">
              <Search size={20} />
            </button>
            <button className="bg-surface/50 backdrop-blur p-2 rounded-full text-on-surface hover:text-primary">
              <Bell size={20} />
            </button>
           </div>
        </header>

        {/* Main Content */}
        <main className="min-h-screen">
          {/* Header Section */}
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-64 md:h-80 w-full overflow-hidden relative group">
              <img 
                alt="Cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG_4uv5c7LMPK5KoWQBZhw2UhexJJ8IIJLAk6l9zKKv7qDm2uCc4PU0QgciFnRx011VAxSWcTIlt_W169WWVryMv3s5jpnMViYu0PScoW1Rp7m7zehvHtLXADvwVAGMOXhDVxpcEfQdyysA2YBZZtpo183gpTP8uw7rAp2rdbrfqN6eA8a1PxyKsfK5FcRNMdDiaxvOMoR_kZKd7ErrytAtfm4J99HXQKAm9dXM2RLUIr6dR3zn79NAIqs7r64_ycRqGODy4c3dHk"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              
              <Link 
                to="/edit-cover" 
                className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/20 hover:bg-white/40 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all border border-white/30 hover:scale-105 active:scale-95"
              >
                <Camera size={18} />
                <span className="hidden sm:inline">Edit Cover Photo</span>
              </Link>
            </div>
            
            {/* Profile Info Container */}
            <div className="max-w-[1000px] mx-auto px-4 -mt-16 md:-mt-24 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end gap-6 md:justify-between bg-surface/80 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                  <div className="relative group">
                    <img 
                      alt={displayName} 
                      src={avatarUrl}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-surface ring-4 ring-primary-container object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button className="absolute bottom-2 right-2 bg-secondary-container p-2 rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center">
                      <Camera size={20} className="text-on-secondary-container" />
                    </button>
                  </div>
                  
                  <div className="pb-2">
                    <h1 className="text-3xl font-bold text-on-surface">{displayName}</h1>
                    <div className="flex gap-4 mt-2 justify-center md:justify-start text-on-surface-variant font-medium">
                      <span><strong className="text-on-surface">1.2k</strong> Followers</span>
                      <span><strong className="text-on-surface">840</strong> Following</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center mb-2 md:mb-0">
                  <button className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 active:scale-95 shadow-[0_4px_12px_rgba(139,78,62,0.3)] hover:brightness-110 transition-all">
                    <Plus size={20} />
                    Add Story
                  </button>
                   <Link 
                    to="/settings"
                    className="bg-surface-container-high text-on-surface-variant px-6 py-3 rounded-full font-bold flex items-center gap-2 active:scale-95 border-2 border-outline-variant hover:bg-surface-container-highest transition-all"
                  >
                    <Edit2 size={20} />
                    Edit Profile
                  </Link>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-surface-variant mt-6 px-2 overflow-x-auto gap-8 hide-scrollbar">
                <button className="px-4 py-4 text-primary border-b-4 border-primary font-bold whitespace-nowrap outline-none">Posts</button>
                <button className="px-4 py-4 text-on-surface-variant font-bold hover:text-primary transition-colors whitespace-nowrap outline-none">About</button>
                <button className="px-4 py-4 text-on-surface-variant font-bold hover:text-primary transition-colors whitespace-nowrap outline-none">Friends</button>
                <button className="px-4 py-4 text-on-surface-variant font-bold hover:text-primary transition-colors whitespace-nowrap outline-none">Photos</button>
              </div>
            </div>
          </div>

          {/* Profile Content Grid */}
          <div className="max-w-[1000px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Intro & Photos Preview */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Intro Card */}
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
                <h3 className="text-xl font-bold text-on-surface mb-4">Intro</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <MapPin size={24} className="text-primary shrink-0" />
                    <span className="text-base font-medium">Lives in {location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Calendar size={24} className="text-primary shrink-0" />
                    <span className="text-base font-medium">Joined {joinedDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <LinkIcon size={24} className="text-primary shrink-0" />
                    <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-tertiary hover:underline">{website}</a>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Heart size={24} className="text-primary shrink-0" />
                    <span className="text-base font-medium">{bio}</span>
                  </div>
                </div>
                 <Link 
                  to="/settings"
                  className="w-full mt-6 py-3 bg-surface-container-high rounded-full font-bold text-on-surface-variant active:scale-95 hover:bg-surface-container-highest transition-all text-center flex items-center justify-center"
                >
                  Edit Bio
                </Link>
              </div>

              {/* Photos Preview Card */}
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-on-surface">Photos</h3>
                  <a href="#" className="text-primary font-bold text-sm hover:underline">See All</a>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdYpvc9i4RXHyvc1973iPtBPf4pAdNIPf1MYh1ehlOmAl2Hpvmo0UueCpJ575kwYs8sln2UQfzTRE3oAF_DamtKMXOw535Avd8iHSeRf0W4LqoUWy_vqGtjXF8Fgf_F9EwrRk2voyDOhTo5NV5St8l3h8qr0BBs_G6bV3s4HKFbOA-6-AiV4wkPISCY6jST2VVMbgewkjeEVNZp9sRd0tHxGqUBnFJO6Ae8OghUkVvl9QrQ8YUqlEE8OpVqPQt_JBiPX3dFxPWFoU"
                    alt="Forest flowers"
                    className="w-full aspect-square object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrKetq0iEQVlAeWQIqd0aCvPPlJm3s8IIXmsQfm1oZH5BxttsKb8JTzmB33ATKwzfuNSt2fZeLXP7i0ZYijyS-18F-uTKRxWOF09WG1c01oFv3GAvpTog8phPhg7GU41qSQaDBLCmPcX3cIxlqts0ukzz1rTqLUuIzJKSrm9STdUYJxcnit5bxml5_hwC8FnulOfpIq8XcwlAAqxWuq8IwjEa-Bnj4X6fQSzTI_6YN63eWZEZBWIT8UiDIstKcJanED9AJPCTaQoc"
                    alt="Coffee and book"
                    className="w-full aspect-square object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdhWdDTiiIG4B5zzXYZUCNjBZR12M0Q_XWuKWTNtGBu4dmK3pgwxB0RqPpUkxZNxk_GMCv3NR4cm9DMFC7Lmn4UUuipWfq_leCJKEzEB1guSUV1I21gFiPw52OGvLHmwTPZCSi8nE4ceFu8PKIreyszVJk3EgdFg6XzBCPgBcrkf-Wnf3GmFW7cNeV_11Horw772ob8FsFIDqKLlaG91i9GeMxvydD7Vet1ZuMVlZofXf1f-fSjLXXeOr6rOTFACoxKH-nzUejRm4"
                    alt="Desk setup"
                    className="w-full aspect-square object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1u2H02N3-kBMUUnqDejjyQJv9o6VvrbrO7eRZPjfSL4zFi4j68qH7iNMpTjj7TI1AIpI4zDHlUy4P1OpmDqN7NenXm4TFLl1HZiiX5T_8YWLEXdlv142QCgtZrXIVzFgpx7zHVrlcmO9zIt7jUd-SiqH5G226zm942bQZnyJ_1J6NJjUTHuJ2_SsC-jgulypkAsgCMlOGExDJjkoAxyMkN9eQ_rHRcNDSr8eHY6BUJ9X0GN_eNcwsEFXYWQSoI3pb_kgNfSy0N5M"
                    alt="Avocado toast"
                    className="w-full aspect-square object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuApHogXBMWoUD-se2buD5BPx7Lw31K7Oaf2G5FiRezlm57WBd7qd-tupCLuWbzt3pag7-fs2_nBGNHTKr1xt96i1joCBqLqQXT7nBhzlOkWqo4c5f8KKWNaEr3C3Jt_h4sJBIiwW87WUMp9huO_W7lfpr7718TtoEqjShdZEg1UQsvk2ZOu1JSO3rSV7Wd-EXdTq7U4Wk2Cw1-0NuAAttM3xxqsq45Pkg89Yh-6t35XzoIv8mFJTXeOutvZ1a-KgwiVkcpnLowA6ww"
                    alt="Laughing child"
                    className="w-full aspect-square object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSJXy98glpRVs2tEJ_PJaQ85qdPl1L5TFgY_xszE8xWjykjcre2DJIQv-JF4Sgh3KAcV4yWlAv7bw6ZNCQlX62JOR5yTNVWhTb6i2HMJWzbfKNQc46OmDyRYGKmAVQAq9IkwiwCFJ4kxbuTaphOKS0hE9_GjAqZwB6luZm2ieywwJToeydztQam3ZOr73EdeLv9RU6XOkVjY40bL8KF91fCZ0lv2RU8PG9CG0qzoBC4aI2y8mnDkFYFQ_lN9vKsBQvJmkjUlf-yew"
                    alt="Leaves with dew"
                    className="w-full aspect-square object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              
            </div>

            {/* Right Column: Posts Feed */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Create Post (Mini) */}
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container flex items-center gap-4">
                <img 
                  alt="Alex" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPNex2nR06iU5gSe9fB5C6pYwUMraBZJH0sn-mb4Nbc6v3UrxSqNURwENaMiEdA5NFQYSDMAX1Xj0x3dvsKufVXJYSGpsAtDnKg9JhETu2mX9yEb3HrxO7JYdl2YFNa3PyidnvLPqpIujp-OGY0aEWTsfwH6sasTrWsWbX4ign1bR7BHq3nCRF82VG2F4gwKVCbw_qSS8TvHs8AQZi2X9nCLgOwIzEwjI3OGstKNf98bQqwhNEwVn4rylJVICAVDzBeQSiWTMtbtc"
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <button className="flex-grow text-left px-6 py-3 bg-surface-container-low rounded-full text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-colors outline-none border-none">
                  What's on your mind, {user?.displayName || user?.username || 'Alex'}?
                </button>
                <div className="flex gap-1 shrink-0">
                  <button className="p-2 text-primary hover:bg-primary-fixed rounded-full transition-colors hidden sm:block">
                    <ImageIcon size={20} />
                  </button>
                  <button className="p-2 text-secondary hover:bg-secondary-fixed rounded-full transition-colors hidden sm:block">
                    <Smile size={20} />
                  </button>
                </div>
              </div>

              {/* Feed Post 1 */}
              <article className="bg-surface-container-lowest rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] p-6 border border-surface-container hover:shadow-[0_0_20px_rgba(255,176,156,0.3)] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgclLBJo25expsXmBpa58xNNqpANNZ2zeZtY8MMp531ZRhcyuOYZDP1AK4Z6Rwfc20jjCOnnWeMpvEy8MdKPxqM7kwntSskyKFu51DwcDxsu_4h3RkdpbHWIwZIu9SnV7NtYOkArsMNfQEf2LV-35YJhVK5XsD1QyqEe0GjIUe2sIrUHFHX0vSFugV56hOCVfNTFutJ1WI-LcHsqw7Me9ro9u8bow6KcispK8I9p6lFJFv05L0uwwmCSQ6XPuA5diiWrjfpZ3OhD4"
                      alt="Alex Rivera"
                      className="w-12 h-12 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-on-surface leading-tight">Alex Rivera</h4>
                      <span className="text-[12px] font-bold text-outline-variant">2 hours ago • Public</span>
                    </div>
                  </div>
                  <button className="text-outline hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container">
                    <MoreHorizontal size={24} />
                  </button>
                </div>
                
                <p className="text-base font-medium text-on-surface mb-4">
                  Found this beautiful corner in the park today. Nature always knows how to reset the soul. 🌿✨
                </p>
                
                <div className="rounded-[1.5rem] overflow-hidden mb-4">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC94qfhd1h4zL-iFK9nO1KMnSUFeU7fFF7OKPOD1TH8B0sZrObPo4AdKEi17Ix5lzonDmnwsEGAraX9Qsk1ERPMlCrJE229LHm0mRobNVSE6TYhuKmXnPp8ytVobk5bu4gUftw7DANYQhwwdLpcJR6EBhEEMax940LvI8_lujsIctQ4owqbXgjrUH2olEkoMRKaSM-Z38PaQcgxw3g2bsG5hcuvjElOcoxxX6dpksPDo3kUvQAO8wngHovxUcSGdJ-Bwsh-fP4cap0"
                    alt="Park trail"
                    className="w-full h-64 sm:h-80 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex items-center justify-between py-3 border-y border-outline-variant/30">
                  <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-surface-container-lowest z-20">
                      <Heart size={14} className="text-white fill-current" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-2 border-surface-container-lowest z-10">
                      <Sparkles size={14} className="text-white fill-current" />
                    </div>
                    <span className="pl-4 text-xs font-bold text-on-surface-variant">42 people reacted</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">12 comments</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-primary-fixed text-primary rounded-full transition-all active:scale-95 text-sm font-bold">
                    <Heart size={20} /> <span className="hidden sm:inline">Love</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-secondary-fixed text-secondary rounded-full transition-all active:scale-95 text-sm font-bold">
                    <MessageSquare size={20} /> <span className="hidden sm:inline">Comment</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-tertiary-fixed text-tertiary rounded-full transition-all active:scale-95 text-sm font-bold">
                    <Share2 size={20} /> <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </article>

              {/* Feed Post 2 */}
              <article className="bg-surface-container-lowest rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] p-6 border border-surface-container hover:shadow-[0_0_20px_rgba(255,176,156,0.3)] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0CKoxyvz8LBy35PGCZMciqnVFXfHe3e2s6UFCYPxOkDecU5m8LJiraFw7idjozOqJsQ71QYW4RuoY1ns43erMiFKfN7EUOMKsI2gcDnacSM58unWLZOIfI9CorOwW4iPcAi8ckJpcGHJkztHFnoY7SSjCIssSYhMr249jwRZbucml7vTK38vfGTKrarAAauj27ffk79pRpLAMWLKJj-nMlpZeghYE4TtJOZdzqv7U-K7IanPE-XhmNwNTfvn-80VCOd8SrLVBvQY"
                      alt="Alex Rivera"
                      className="w-12 h-12 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-on-surface leading-tight">Alex Rivera</h4>
                      <span className="text-[12px] font-bold text-outline-variant">Yesterday at 6:15 PM • Friends</span>
                    </div>
                  </div>
                  <button className="text-outline hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container">
                    <MoreHorizontal size={24} />
                  </button>
                </div>
                
                <p className="text-base font-medium text-on-surface mb-4">
                  The sourdough experiment continues! Best loaf yet. 🍞☕️
                </p>
                
                <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] overflow-hidden mb-4">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTCOHNFRsCQ882A19vhRMS5XWwfwpvUz5Twda0_JH7b1xRPF0aGeKLjMOMm56zuPvdxB6WJivjOt9Y-UtEJhAHbacDi0CHSckxoCEmauBPHxmsUP9FBjYVLOF3z3nk9PaG8VmXAl1mYrnHn3cS18D03-p0o0Y2xvFGmA3o8JOugcUgmGWBM47NbNlzObRvAOo7wcVp4AYCViQrjrS6G_geVZHDC0cSSQ-94hGJ10FHLDQJj1dEYRT5z6zm5SGNqUaDP8t6HfaeWvw"
                    alt="Sourdough loaf"
                    className="h-48 sm:h-60 w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVFtzglZwWA9Tk5pS848L5nj-Yz8vuMjhQfS7gJ3l-9h48CwBFeBKvS7uS_lOQg3l4tLpERx_6TCxldtyhlZESGFUQp2XpbvruvENm0uSEYHJGappKxbtxH0uBMlyKPW2YJ6KxFE4x9m8lVs5czYMTFg_E8wx5O66KcTcvr8xjaQqL0YJoINEiD1TkOntPvQX0tr-cWMCYDyPo3IJq5pRniw8G_7V2kh1zg3yyS6OeINNDqv9y8cGcwkSQOyeaRWTj0mw_s6bIC6s"
                    alt="Coffee and bread"
                    className="h-48 sm:h-60 w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-outline-variant/30">
                  <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center border-2 border-surface-container-lowest z-10">
                      <ThumbsUp size={14} className="text-white fill-current" />
                    </div>
                    <span className="pl-4 text-xs font-bold text-on-surface-variant">88 people reacted</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">24 comments</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-primary-fixed text-primary rounded-full transition-all active:scale-95 text-sm font-bold">
                    <Heart size={20} /> <span className="hidden sm:inline">Love</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-secondary-fixed text-secondary rounded-full transition-all active:scale-95 text-sm font-bold">
                    <MessageSquare size={20} /> <span className="hidden sm:inline">Comment</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-tertiary-fixed text-tertiary rounded-full transition-all active:scale-95 text-sm font-bold">
                    <Share2 size={20} /> <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </article>

            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
