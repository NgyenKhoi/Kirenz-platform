import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, Menu, Phone, Video, Info, 
  MessageSquare, PlusCircle, Smile, Send, X, Edit3
} from 'lucide-react';
import Layout from './components/Layout';

export default function Chat() {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Sarah Chen',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOHALOMWTGRcX-6j1AcnxQ0xC4ODgfgso7dPXgJjKN75E09a8hyK4t9xhoG7q_OO9RRzjMDI5symyGe3HeMWQFb_ZGHuyA5IzwAapqS8cSpg-wYtEvsUcs1oaVGSIh0T8QcNbzvmBsR9w8DXEHYRbxeSmZSuRsIpvMYVpXvq8Ivyk9KxUITRrsG8HDXYwQUagpCbeSdiFBv5HXXd4GmT1p4UEFteaL7peJvIE0wk5kYd6kn-gtAGbUU7Y11PXQjlaVqwRyK8HOxnk',
      text: "Hey Alex! Hope you're having a wonderful morning. Look at what I found today while walking in the park! 🌸",
      time: '9:12 AM',
      isMe: false
    },
    {
      id: 2,
      sender: 'Sarah Chen',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKfML-dnRwp16O0CKCzixygnhXMx8pxJKmQnhAZ1xPhJXUDvFnBY3hU8z8fRXcdMyKxtuGGDhRCjUBGoOsdVz2_AJZK1guSHqI67Q9dtskw9mFZmv9Gvg8cgC4Iie4-9z6afFE96-BmMMn12kWVV0XIQ5kxBWj818MVsIj87nwyvaVDIcsKSmb1O9Wc4fnK7BwgPnc8BC6XfBgolNoHy5X9gKIq0x4NX45oRLgLcLJQj6AlI2kAfKF8a45BdaIkRZUhsikYHvndK8',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzOeBc3Qh4HfDoADp36qRw5gEtlGzdNQGb1sSOUrIxKDsHs8felQYKLWBF4tTKxsGKclX6TnKrhvlnrzlnC_cOaHDKbdrSCgteMFaTgFfw7amLYL_ZU4D0haUvAluDsgu-VpE0EkPutjGu8Mv5yKxaRH-vbwqn2aYpkfCZHrbuH9yHVGAtJM4yaeMc5t-VTKTb99BhSNNjYuayTwfjoWmX8PSLz-u9KbFsQteKHXng5UuCMsbMZI4JmRuNnxo994q1Dd_oiQ4hT4I',
      time: '9:13 AM',
      isMe: false
    },
    {
      id: 3,
      sender: 'Me',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD40MliqZjRSR3rWfUYwIrAY3zBTJOCWKCH8oqltI4l-DDeWM2eF2-V4eYv0T8sv6ucoxhh_eCPzYld2y3Wy22ZtJaOrI5_R2-7hZxxS3a8NrvhzbWlvSRwMTpOON356fTuSGXtjHXUwbM5JM2ZAV2tUO89FK_34VrddpDcg8tAgU6oHeLdfN7izBAxNZ2vUj0WnSGIAC3T4jvtWnaD3_84dCe_ACj3c0kXCBK6xD75VJc7Idr60czYTF5Skpdgjdyuh8uxcOJVRKA',
      text: "Oh wow, Sarah! That's absolutely beautiful. The colors are so vivid. Thanks for sharing this moment with me! ✨",
      time: '9:15 AM',
      isMe: true
    }
  ]);
  const [showToast, setShowToast] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate incoming toast message
    const timer = setTimeout(() => {
      setShowToast(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        sender: 'Me',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD40MliqZjRSR3rWfUYwIrAY3zBTJOCWKCH8oqltI4l-DDeWM2eF2-V4eYv0T8sv6ucoxhh_eCPzYld2y3Wy22ZtJaOrI5_R2-7hZxxS3a8NrvhzbWlvSRwMTpOON356fTuSGXtjHXUwbM5JM2ZAV2tUO89FK_34VrddpDcg8tAgU6oHeLdfN7izBAxNZ2vUj0WnSGIAC3T4jvtWnaD3_84dCe_ACj3c0kXCBK6xD75VJc7Idr60czYTF5Skpdgjdyuh8uxcOJVRKA',
        text: messageText,
        time: 'Just now',
        isMe: true
      }
    ]);
    setMessageText('');
  };

  return (
    <Layout>
      <div className="bg-surface text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container pb-20 md:pb-0 h-screen flex flex-col">
        
        {/* Top App Bar (Mobile Content Header) */}
        <header className="md:hidden flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button className="p-2 flex-col items-center gap-1 text-primary-container">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-primary truncate">Moments</h2>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button className="p-2 text-on-surface-variant hover:bg-primary-container/20 rounded-full transition-colors active:scale-95">
              <Bell size={24} />
            </button>
            <button className="p-2 text-primary font-bold bg-primary-container/20 rounded-full transition-colors active:scale-95">
              <MessageSquare size={24} className="fill-current" />
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex justify-between items-center px-8 py-4 w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md shadow-sm shrink-0">
          <div className="flex items-center gap-6">
            <span className="text-2xl font-bold text-primary tracking-tight">Moments</span>
            <div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full gap-2 w-72 border border-outline-variant/20 focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
              <Search size={20} className="text-outline shrink-0" />
              <input 
                type="text" 
                placeholder="Search memories..." 
                className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full placeholder:text-outline-variant outline-none text-on-surface"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 rounded-full active:scale-95">
              <Bell size={22} />
            </button>
            <button className="p-2.5 text-primary font-bold bg-primary-container/20 hover:bg-surface-container-high transition-colors duration-200 rounded-full active:scale-95 relative">
              <MessageSquare size={22} className="fill-current" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container shrink-0 ml-2">
              <img 
                alt="User Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs8AQ1VyctgRMqOBqcr3PDc7VEE9fQ2Finhj3ZftNZfaFDrOEUoeQ19iPtUyTrCijbr6p9xNxzWw8p_x6kxMmKvn_dfE1apfaKVZ5nrCzUzLb2VGanYhffU2Wdg7mSFxI-4RIzUGYB7Uk0_E39bQoOqSMovV-mxAlZYmeNfP-9PMJno1uQB10MAUfCdpRAiHr2bQBE50OhVtqM_M-N8ruZ6NeEIZZupVjU5N-EdjthGlfNpVJRVgG-wsao1aT-a-SG0AnWKaaw-5E"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 pb-4 flex flex-col md:flex-row gap-6 overflow-hidden md:h-[calc(100vh-80px)]">
          {/* Conversation List Sidebar */}
          <section className="flex flex-col w-full md:w-[320px] lg:w-[380px] bg-surface-container-low md:h-full rounded-[2rem] overflow-hidden border border-surface-container shrink-0 shadow-[0_4px_20px_rgba(28,28,24,0.03)] h-[400px] md:h-auto">
            <div className="p-6 shrink-0">
              <h2 className="text-2xl font-bold text-on-surface mb-4 tracking-tight">Messages</h2>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search chats..." 
                  className="w-full bg-surface-container-lowest border-2 border-transparent focus:border-tertiary-container rounded-full px-4 py-2.5 pl-11 text-sm font-medium focus:ring-0 transition-all outline-none text-on-surface placeholder:text-on-surface-variant"
                />
                <Search size={18} className="absolute left-4 top-3 text-outline-variant" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-outline-variant/30 scrollbar-track-transparent px-4 pb-4">
              
              {/* Conversation Item: Active */}
              <div className="flex items-center gap-4 p-3 mb-2 bg-surface-container-highest/60 rounded-2xl cursor-pointer transition-all hover:bg-surface-container-highest">
                <div className="relative shrink-0">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDL2sgy7kVl8cnW3LBSSO5vvPpbyd2AcYjul2dCeqlKE48KLAQhfuPK5KYmc5zdQ2Ffh_sOzcxzLFS4KsL6DjdmmJOSJsm-Y8vpGeq-k2xXMQ7LOIR_XzVIcWMaOsexNoMNVEtuRZ6yrDtOTKZzV4qhE-DadOVtfII-ZwI0_N03uPa3jo_UpiJBFbUn91QwxAWa72iy8Lx-xOazkts6ZtjWduZlmXmT44mZ3OHlIKMZsykIMF_pcdzbBr9pjhiE7jdXcxKyZ52cUTI" 
                    alt="Sarah Chen" 
                    className="w-12 h-12 rounded-full object-cover border border-outline-variant/20"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0.5 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface-container-low rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-bold text-sm text-on-surface truncate pr-2">Sarah Chen</h3>
                    <span className="text-xs font-bold text-outline shrink-0">2m</span>
                  </div>
                  <p className="text-sm font-bold text-primary truncate">Sent a photo</p>
                </div>
              </div>

              {/* Conversation Item */}
              <div className="flex items-center gap-4 p-3 mb-2 rounded-2xl cursor-pointer transition-all hover:bg-surface-container-high group">
                <div className="relative shrink-0">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhHiwQzEvFyjDTOBQhfwjTetruOv4L1jNJOvy1252fJOOVnyHMAv2ujFj143JRiWBrZ4NdZxd83CpdgwM7IOnrWH5PAkJnoYxrWVAhvxdCg3M7zo17dIhd4wlB-e0sYqRj7b57EsFyh3KKhQsGQ2jvKvVaxUK5MhW-5A3OmSo-oPLZQC8AM0Gdyqis1f6M_jD_5jPJs1cByiQCyG9SA8sZ7CQ5PZ16WY8bTsSMxdF6u96VKAbp_S5vloetntYrSNOPAS883OvcHm8" 
                    alt="Marcus Thompson" 
                    className="w-12 h-12 rounded-full object-cover border border-outline-variant/20"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-bold text-sm text-on-surface truncate pr-2 group-hover:text-primary transition-colors">Marcus Thompson</h3>
                    <span className="text-xs font-bold text-outline shrink-0">1h</span>
                  </div>
                  <p className="text-sm font-medium text-on-surface-variant truncate">That looks so cozy!</p>
                </div>
              </div>

              {/* Conversation Item */}
              <div className="flex items-center gap-4 p-3 mb-2 rounded-2xl cursor-pointer transition-all hover:bg-surface-container-high group">
                <div className="relative shrink-0">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUtMPFEHa8PrNOJ5PfFlB3bk_4Q5S-Kbvp9AJRACpKAD873VSiAzNpei1dP0eVPInB_CJdeWQI1Hr36vqs3vxJ9fdM3sEZOb4DK0G5xMbwZFQW1Y3GVvRZof5mmF87kv9a2bPtJUl_mmS9fTG2GYhZQCVlypwfwycdB8WP0brRolkeJ7fHErITPeMAMBilV3GpcXM-cFoJZPOBJhU34xNyHcVB10VUMIYg-STtK7S9OLTTYOzgtOKUc_fo8ykVZGmMJspTq8jlLDQ" 
                    alt="Elena Rodriguez" 
                    className="w-12 h-12 rounded-full object-cover border border-outline-variant/20"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-bold text-sm text-on-surface truncate pr-2 group-hover:text-primary transition-colors">Elena Rodriguez</h3>
                    <span className="text-xs font-bold text-outline shrink-0">3h</span>
                  </div>
                  <p className="text-sm font-medium text-on-surface-variant truncate">Are we still on for the park?</p>
                </div>
              </div>

            </div>
          </section>

          {/* Active Chat Window */}
          <section className="flex flex-col flex-1 bg-surface-container-lowest md:h-full rounded-[2rem] overflow-hidden shadow-[0_12px_40px_-12px_rgba(139,78,62,0.15)] border border-surface-container h-[600px] md:h-auto z-10 relative">
            
            {/* Chat Header */}
            <header className="h-20 px-6 flex items-center justify-between border-b border-surface-container bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgKhbG_cwzKqu1J0j89mXXuaWyaOGcLrfRrJeZTOK1IVuCtPLdosTLpt_ZS-6mJt16bYP-eQzWUPUntcCbD6Zeu5noGgdllWV_99EViAagn3N681OeY1r6_AdwCTEMPcBEir0pLRPS10qS7z1PvUBGSyPqf9GiEUMNdoxdTNORXYSj0KiuFUY1Bo-SOYebOSUGYvQNaffj2WncAj8YWScURaQHYAlVG8mmrr-QwwHV2dFhzTam7It30UzZJ09CG7YFAdLRSiJxydk" 
                    alt="Sarah Chen" 
                    className="w-11 h-11 rounded-full object-cover border border-outline-variant/20"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface-container-lowest rounded-full"></span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface tracking-tight leading-none mb-1">Sarah Chen</h3>
                  <p className="text-xs font-bold text-tertiary">Online</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 md:p-3 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full active:scale-95">
                  <Phone size={20} />
                </button>
                <button className="p-2 md:p-3 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full active:scale-95">
                  <Video size={20} />
                </button>
                <button className="hidden md:block p-3 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full active:scale-95">
                  <Info size={20} />
                </button>
              </div>
            </header>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 scroll-smooth bg-surface-bright pb-32 md:pb-6">
              
              {messages.map((msg, idx) => (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.isMe ? 'flex-row-reverse ml-auto' : ''}`}>
                  <img 
                    src={msg.avatar} 
                    alt={msg.sender} 
                    className="w-8 h-8 rounded-full object-cover mt-2 shrink-0 border border-outline-variant/20"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`flex flex-col ${msg.isMe ? 'items-end' : ''}`}>
                    <div className={`
                      p-4 shadow-sm
                      ${msg.isMe 
                        ? 'bg-primary-container text-on-primary-container rounded-[1.5rem] rounded-tr-sm' 
                        : 'bg-surface-container text-on-surface rounded-[1.5rem] rounded-tl-sm'
                      }
                      ${msg.image ? 'p-2' : ''}
                    `}>
                      {msg.image ? (
                        <div className="rounded-xl overflow-hidden shadow-sm">
                          <img 
                            src={msg.image} 
                            alt="Shared memory" 
                            className="w-full max-h-[300px] object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <p className="text-sm md:text-base font-medium leading-relaxed">{msg.text}</p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-outline-variant mt-1.5 px-1">{msg.time}</span>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 max-w-[80%] animate-pulse duration-1000">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxDcJN-RKI5xGACxVHsnUokzGIGb6xsnnIuMGbFxZXjsFgWUN0k96WpNu3wOh7V85DlrUR-QVn_obtLQHjloFGN4JO02ZnG1VWEcj4LsflVM1lkyez9FXFKKFM7B_l37nEVGrdCT9BszsT6w1x-GGhbazY_EKw-8c_05D1S_SL_gLt4zhL6WZk1hcY2aqx-Jv-_nBLmRbGt3uqooiyP5DAWItewHvECzUg-6ExOL0Vxhhpxy6UltV4aR0fTx_LeumI8FuIW1vr7J8" 
                    alt="Sarah" 
                    className="w-8 h-8 rounded-full object-cover mt-2 shrink-0 border border-outline-variant/20"
                    referrerPolicy="no-referrer"
                  />
                  <div className="bg-tertiary-container text-on-tertiary-container px-4 py-3 rounded-full rounded-tl-none shadow-sm flex items-center gap-2">
                    <Edit3 size={16} className="shrink-0 opacity-70" />
                    <p className="text-xs md:text-sm font-bold">Sarah is typing a warm message...</p>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 border-t border-surface-container bg-white shrink-0 absolute bottom-0 left-0 right-0 z-20 md:relative">
              <form 
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 md:gap-4 bg-surface-container-low p-2 pr-2.5 rounded-full border-2 border-transparent focus-within:border-primary-container focus-within:bg-white transition-all shadow-sm"
              >
                <button 
                  type="button"
                  className="p-2.5 text-primary hover:bg-primary-container/20 rounded-full transition-colors shrink-0"
                >
                  <PlusCircle size={22} />
                </button>
                <input 
                  type="text" 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Write a warm message..." 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base font-medium py-2 px-1 outline-none text-on-surface placeholder:text-on-surface-variant/70 min-w-0"
                />
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                  <button 
                    type="button"
                    className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors hidden sm:block"
                  >
                    <Smile size={22} />
                  </button>
                  <button 
                    type="submit"
                    disabled={!messageText.trim()}
                    className={`p-3 rounded-full transition-all flex items-center justify-center shrink-0 ${
                      messageText.trim() 
                        ? 'bg-primary text-white shadow-[0_4px_12px_rgba(139,78,62,0.3)] hover:-translate-y-0.5 active:scale-95' 
                        : 'bg-primary-container text-on-primary-container/50 shadow-sm cursor-not-allowed'
                    }`}
                  >
                    <Send size={18} className="ml-0.5" />
                  </button>
                </div>
              </form>
            </div>
            
          </section>

        </div>
      </div>

      {/* Floating Toast Notification */}
      <div 
        className={`fixed bottom-24 md:bottom-8 right-6 md:right-8 z-[60] transform transition-all duration-500 ease-out flex items-center gap-4 bg-white p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border-l-4 border-primary ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
        }`}
      >
        <div className="relative shrink-0">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOISUfluQJvHTh6Pn2GhymNkErZxvHVPZCCscDx0XaiCG9o0RFv6-vWOMjmMbyFo0Hgi5dUrdw8sDa0VsW8ve7gu5eXP_eByVWcPLlVslW0ougPqQHxIFjcRERMqWBdxop_KPRuojQn5XXYiouoxRCoAPvm4vgag705U2qXUwgbuhu0QG79l8he9OvUsr9MEjQNTPcF30o7I6tkBcpMitlvIxtuoVN7w2g7xhv22pBDEehdMiYHpRZltBMT_LJzORxGNkqHQIdihc" 
            alt="Marcus" 
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            referrerPolicy="no-referrer"
          />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
          </span>
        </div>
        <div className="pr-4">
          <p className="text-sm font-bold text-on-surface">Marcus Thompson</p>
          <p className="text-sm font-medium text-on-surface-variant mt-0.5">Sent you a hug! 🤗</p>
        </div>
        <button 
          onClick={() => setShowToast(false)}
          className="absolute top-2 right-2 p-1.5 text-outline-variant hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      </div>

    </Layout>
  );
}
