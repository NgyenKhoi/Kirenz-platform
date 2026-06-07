import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, Volume2, MoreHorizontal, 
  ChevronLeft, ChevronRight, Heart, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SARAH_STORIES = [
  {
    id: 1,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4RsetzzJMtmjAgUFusHn9vdmL-Y9kGwCUFVQCY69DwM8gss7EkQA0HUbV2XkNbGbj6M5jk-R3I6t2C6vbE6KfTvEepbOI4egqvEUnU6_CU53NRec2Y8lnmOA6USg9fPz3vzMHaK_o8gXTcw7_x3sG7p71pNKfepGIgr8PVGE01X5FeqRv7tVuN55MOuFlXMqo6TWvpc8P-n9maXmY-IZzOggdlX2E6BkCs0LCfbjl1O1wLPaQwZ2ZYrP6zjAy2cNbUHEghlgMvcU",
    caption: "Slow mornings are for tea and journals... ✨",
    duration: 3000
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=420&h=740",
    caption: "Loving this new book 📖",
    duration: 3000
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1544422619-33eb92de324f?auto=format&fit=crop&q=80&w=420&h=740",
    caption: "Perfect day outside 🌿",
    duration: 3000
  }
];

export default function StoryViewer() {
  const navigate = useNavigate();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reactions State
  const [reactions, setReactions] = useState<{id: number, emoji: string, startX: number}[]>([]);

  const startProgress = useCallback(() => {
    setProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    const startTime = Date.now();
    const duration = SARAH_STORIES[currentStoryIndex].duration;
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(progressIntervalRef.current!);
        if (currentStoryIndex < SARAH_STORIES.length - 1) {
          setCurrentStoryIndex(prev => prev + 1);
        } else {
          // Reached end, could close or just stop
        }
      }
    }, 16); // 60fps
  }, [currentStoryIndex]);

  useEffect(() => {
    startProgress();
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [startProgress]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentStoryIndex < SARAH_STORIES.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  const handleMutedAreaClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    if (x < rect.width / 3) {
      handlePrev(e);
    } else {
      handleNext(e);
    }
  };

  const currentStory = SARAH_STORIES[currentStoryIndex];

  const handleReaction = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const id = Date.now();
    
    // Create a single reaction with clean coordinates
    const newReaction = {
      id,
      emoji,
      startX: e.clientX,
      startY: e.clientY
    };
    
    setReactions(prev => [...prev, newReaction]);
    
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 1500);
  };

  return (
    <div className="bg-black text-white font-sans overflow-hidden h-screen select-none relative">
      {/* Background Layer (Immersive) */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          key={currentStory.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${currentStory.image})`,
            filter: 'blur(40px) brightness(0.7)',
            transform: 'scale(1.1)'
          }}
        />
      </AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xl z-0" />

      {/* Top Navigation (Back to Home) */}
      <header className="fixed top-0 inset-x-0 h-20 flex items-center px-4 md:px-8 z-50 pointer-events-none">
        <button 
          onClick={() => navigate('/stories')}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all pointer-events-auto backdrop-blur-md group shadow-lg"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-bold">Back to Stories</span>
        </button>
      </header>

      {/* Main Content Container */}
      <div className="relative z-10 flex h-full items-center justify-center pt-20">
        <div className="flex flex-row w-full h-full max-w-[1400px] mx-auto px-4 gap-8">
          
          {/* Left Column: Friend List (Desktop Only) */}
          <aside className="hidden xl:flex flex-col w-[300px] gap-6 py-8 overflow-hidden">
            <div className="flex items-center gap-3 px-2">
              <Sparkles className="text-primary-container" size={28} />
              <h2 className="text-xl font-bold text-white tracking-tight">Memories</h2>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5">
              
              {/* Active Story Item */}
              <button className="flex items-center gap-4 p-4 rounded-2xl bg-white/15 border border-white/25 text-left transition-all">
                <div className="relative w-12 h-12 rounded-full p-0.5 border-2 border-primary-container shrink-0">
                  <img 
                    alt="Sarah J." 
                    className="w-full h-full rounded-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-Yph-8PxENRCwi4ehV2SDYVnzUB7wzNS8_q_uJ7G2V2xk0kQmoS8MSewuM21eYkp-sMrqYecQnRvfQZSE4G1zh_qWnByvoj2ty_XddzLGruwjnMZqmWwEkH2HwkrABiyjk4cEqq0XFodF3Fkqgapiom4c5s4rxSB_fumpskIeMS1mliTRVb5qemDJvZEbiZy8iItuT54t5JMdnvR5a5SFWjeKMXsuk0SxEQmPxMWqShxUE8yAUCEezGSLnxrvipK2UvHiZ5EqZAY"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Sarah J.</p>
                  <p className="text-xs font-medium text-white/70">Watching now</p>
                </div>
              </button>

              {/* Other Friends */}
              <button className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-left transition-all group">
                <div className="relative w-12 h-12 rounded-full p-0.5 border-2 border-white/20 shrink-0">
                  <img 
                    alt="Marcus V." 
                    className="w-full h-full rounded-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvxchhML2g8PF-TewcpfOXRgEW4-wzl-Xut8C8obzLRkGT-5uRtA48iCNmIR3oZBJzND3siPMYIcANnr9Se2dMmrnFyRaD8iLSyrslispPsu46w7ILiFU3PhysbjKE4O8KtD6Cx5EKxkh7-0EzRGRURxOCgfDkC9gZCrn3LnBsqouvuwM93H12WNkeIFvVwGnizDbfXQ-uFyLF1I_KrPkc-O58Tq9NdyIfT70GGX7kBEXrMhAkdTtOmFfKWg-QTlUpkR4Lupr2RHk"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white/90 group-hover:text-white">Marcus V.</p>
                  <p className="text-xs font-medium text-white/50">2h ago</p>
                </div>
              </button>

              <button className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-left transition-all group">
                <div className="relative w-12 h-12 rounded-full p-0.5 border-2 border-white/20 shrink-0">
                  <img 
                    alt="Elena Rae" 
                    className="w-full h-full rounded-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKezMyhpHBn5OY_aXDB98MLrrQOsQEnJK2Gs08C-1ifwTQwiS_txW_HhZH7NW9CCmdM9Nq_CPAnt6BmqI-4aksKbTslBVtkTi-fnGNPXIlfLhxzKaybwdlNq2POItbaSdhlVPSq5_h9U-w5cWw2y-wsYi5Pc6Pe5d57MWZbCNNH7FdgBNri0B7KPZbRdmdclx8WpDcdB2TRaLkUYLuTc2s4hT0lIyAwhdQDLxEqD_FQ58GdM7K07yVCUOTBBT3d16penrEqmcv42w"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white/90 group-hover:text-white">Elena Rae</p>
                  <p className="text-xs font-medium text-white/50">5h ago</p>
                </div>
              </button>

              <button className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-left transition-all group">
                <div className="relative w-12 h-12 rounded-full p-0.5 border-2 border-white/20 shrink-0">
                  <img 
                    alt="Kofi M." 
                    className="w-full h-full rounded-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCy94IFBZMxw5gselDP14TCPAMFHwx0fXlITwsDDVCkwXJviDFTpPQzJnXpfRhrbU408UM7_xgv_xlfIhG7meC1ue442I_mOJAORLAJFbpvviO8o7nFlqLoo7PbX4Gi5ToKCIpsDSMICp2RV-vFS1p2tUI6fSDLKl6V0qWrGs9A4hNx_wvdIsuwF7_dwjAEU1ZuDfwXoaAZuYe2XloK0QlFHzXxcEfS1xTsTr9dtNDb_U331_j4XMC9ZmB332sqZITiLZoQNNMSfls"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white/90 group-hover:text-white">Kofi M.</p>
                  <p className="text-xs font-medium text-white/50">12h ago</p>
                </div>
              </button>
            </div>
          </aside>

          {/* Center Content: Story Player */}
          <main className="flex-1 flex items-center justify-center relative pb-10">
            {/* Navigation Arrows (Desktop) */}
            <button 
              onClick={handlePrev}
              className="hidden md:flex absolute left-0 lg:left-8 xl:-left-12 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/30 text-white transition-all z-20 border border-white/10 hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Story Card */}
            <div 
              className="relative w-full max-w-[420px] max-h-[85vh] aspect-[9/16] bg-black rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/20 transform transition-all duration-500 cursor-pointer"
              onClick={handleMutedAreaClick}
            >
              {/* Image Content */}
              <AnimatePresence mode="popLayout">
                <motion.img 
                  key={currentStory.id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  alt="Story content" 
                  className="absolute inset-0 w-full h-full object-cover" 
                  src={currentStory.image}
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              
              {/* Gradient Overlays */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />
              
              {/* Top Controls */}
              <div className="absolute top-0 inset-x-0 p-4 space-y-4 z-10">
                <div className="flex gap-1.5 w-full">
                  {SARAH_STORIES.map((_, idx) => (
                    <div key={idx} className="h-[3px] bg-white/30 rounded-full overflow-hidden flex-1">
                      <div 
                        className="h-full bg-white transition-none" 
                        style={{ width: `${idx < currentStoryIndex ? 100 : idx === currentStoryIndex ? progress : 0}%` }} 
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      alt="Sarah J." 
                      className="w-9 h-9 rounded-full border-2 border-white/50 object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6jXzxpHGym_Gf_-vn2gDAwKecz483IXSqtk4qi5qLb7fRLChPNKwlcG3n_vY8S_2hVEjbFbXmWy2Te9iU7OjlHh3ipsCAkQSheqq_xwoY1Crpi79fx6ZfGgezRtDK-RnpGscRHd75DTUT66mv0WX9nY7H61oLeHufaZLEbfZF8kD51Uftfzwl7mvk0cSCC8v_gIe0IJL0Tdfybr0pVuGKe8KAsFlcfvQqK6JyUSFTFcIF7v9jZ8kp_RY-eh5tpSk8ZeORXjWZKBk"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">Sarah J.</p>
                      <p className="text-white/70 text-[11px] font-medium">Active now</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-white/80 hover:text-white transition-colors">
                      <Volume2 size={20} />
                    </button>
                    <button className="p-2 text-white/80 hover:text-white transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div className="absolute bottom-24 lg:bottom-12 left-6 right-6 z-10">
                <AnimatePresence mode="wait">
                  <motion.h3 
                    key={currentStory.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-white text-2xl font-bold leading-tight drop-shadow-xl tracking-tight"
                  >
                    {currentStory.caption}
                  </motion.h3>
                </AnimatePresence>
              </div>

              {/* Mobile Interaction Bar */}
              <div className="absolute bottom-6 left-6 right-6 lg:hidden flex gap-3">
                <input 
                  className="flex-1 bg-white/20 border border-white/30 rounded-full px-5 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm font-medium backdrop-blur-md" 
                  placeholder="Reply..." 
                  type="text"
                />
                <button 
                  className="w-12 h-12 flex items-center justify-center bg-primary-container text-on-primary-container rounded-full shadow-lg shrink-0"
                  onClick={(e) => handleReaction('❤️', e)}
                >
                  <Heart size={24} className="fill-current" />
                </button>
              </div>
            </div>

            <button 
              onClick={handleNext}
              className="hidden md:flex absolute right-0 lg:right-8 xl:-right-12 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/30 text-white transition-all z-20 border border-white/10 hover:scale-110 active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          </main>

          {/* Right Column: Reactions & Reply (Desktop Only) */}
          <aside className="hidden lg:flex flex-col w-[320px] gap-8 py-8 h-[85vh]">
            <div className="flex justify-between items-center text-white px-2">
              <h3 className="text-xl font-bold tracking-tight">Show Some Love</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={(e) => handleReaction('❤️', e)}
                className="group flex flex-col items-center gap-2 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#ffb09c]/20 hover:border-[#ffb09c]/40 transition-all active:scale-95"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">❤️</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Heart</span>
              </button>

              <button 
                onClick={(e) => handleReaction('🤗', e)}
                className="group flex flex-col items-center gap-2 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#ffd97d]/20 hover:border-[#ffd97d]/40 transition-all active:scale-95"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">🤗</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Hug</span>
              </button>

              <button 
                onClick={(e) => handleReaction('✨', e)}
                className="group flex flex-col items-center gap-2 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#a1c5ff]/20 hover:border-[#a1c5ff]/40 transition-all active:scale-95"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">✨</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Spark</span>
              </button>
            </div>

            <div className="mt-auto space-y-4">
              <div className="space-y-1 ml-2">
                <label className="text-white/70 text-sm font-bold block">Quick Reply</label>
              </div>
              
              <div className="relative group">
                <textarea 
                  className="w-full bg-white/5 border border-white/15 rounded-2xl p-4 text-white placeholder-white/40 focus:border-primary-container focus:bg-white/10 focus:outline-none transition-all resize-none text-base font-medium min-h-[120px]" 
                  placeholder="Write a sweet message..."
                />
              </div>

              <button className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold shadow-xl hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(255,176,156,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Send size={20} />
                Send to Sarah
              </button>
              
              <p className="text-center text-white/40 text-xs italic font-medium">
                Only Sarah can see your replies and reactions.
              </p>
            </div>
          </aside>

        </div>
      </div>
      
      {/* Floating Reactions Container */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        <AnimatePresence>
          {reactions.map((r) => {
            const endY = (r.startY || window.innerHeight / 2) - 150 - Math.random() * 50;
            return (
              <motion.div
                key={r.id}
                initial={{ 
                  x: r.startX - 30, // center the 60px emoji
                  y: (r.startY || window.innerHeight / 2) - 30, 
                  scale: 0.2, 
                  opacity: 0,
                  rotate: 0,
                }}
                animate={{ 
                  y: endY,
                  scale: [0.2, 1.2, 1],
                  opacity: [0, 1, 0],
                  rotate: (Math.random() - 0.5) * 30,
                }}
                transition={{ 
                  duration: 1.2,
                  ease: [0.23, 1, 0.32, 1]
                }}
                className="absolute text-6xl drop-shadow-lg"
              >
                {r.emoji}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
