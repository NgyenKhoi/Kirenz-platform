import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Sparkles, User, UserCircle, Bell, Menu, Plus, Settings, MessageSquare, LogOut, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { notificationService, NotificationResponse } from '../services/notification.service';
import { notificationWebsocketService } from '../services/notificationWebsocket.service';
import { fallbackAvatar } from '../constants/post.constants';
import { chatService } from '../services/chat.service';
import { websocketService } from '../services/websocket.service';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user } = useAuthStore();

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCountMap, setUnreadCountMap] = useState<Record<string, number>>({});

  // Load initial notifications and unread count
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const list = await notificationService.getNotifications();
        setNotifications(list || []);
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count || 0);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    const loadConversations = async () => {
      try {
        const list = await chatService.getConversations();
        const map: Record<string, number> = {};
        list.forEach(c => {
          map[c.id] = c.unreadCount || 0;
        });
        setUnreadCountMap(map);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    };

    loadData();
    loadConversations();
  }, [user]);

  // Connect to Chat WebSocket and subscribe to updates
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    let userQueueSub: { unsubscribe: () => void } | undefined;

    websocketService.connect(token, user.id)
      .then(() => {
        userQueueSub = websocketService.subscribeToUserQueue(user.id, (update) => {
          setUnreadCountMap(prev => ({
            ...prev,
            [update.conversationId]: update.unreadCount
          }));
        });
      })
      .catch(err => console.error("Error connecting to chat websocket in Layout:", err));

    return () => {
      userQueueSub?.unsubscribe();
    };
  }, [user]);

  // Connect to WebSocket and subscribe to notifications
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    notificationWebsocketService.connect(token, user.id)
      .then(() => {
        notificationWebsocketService.subscribeToNotifications(
          user.id,
          (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
          },
          (newCount) => {
            setUnreadCount(newCount);
          }
        );
      })
      .catch(err => console.error("Error with notification websocket:", err));

    return () => {
      notificationWebsocketService.disconnect();
    };
  }, [user]);

  const handleNotificationClick = async (notif: NotificationResponse) => {
    try {
      if (!notif.isRead) {
        await notificationService.markAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setShowNotifications(false);

      if (notif.type === 'FRIEND_REQUEST') {
        navigate('/friends');
      } else if (notif.type === 'FRIEND_ACCEPT' || notif.type === 'BIRTHDAY') {
        navigate(`/profile/${notif.targetId}`);
      } else if (
        notif.type === 'POST_COMMENT' ||
        notif.type === 'POST_LIKE' ||
        notif.type === 'COMMENT_REPLY' ||
        notif.type === 'POST_MENTION' ||
        notif.type === 'COMMENT_MENTION'
      ) {
        navigate(`/home?postId=${notif.targetId}`);
      } else if (notif.type === 'WELCOME') {
        navigate('/settings');
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalUnreadMessages = Object.values(unreadCountMap).reduce<number>((sum, count) => sum + Number(count || 0), 0);

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen font-body-md">
      {/* Desktop Navigation Shell */}
      <aside className="fixed left-0 top-0 h-full hidden md:flex flex-col p-6 gap-4 z-40 bg-surface-container-low w-[280px] rounded-r-3xl shadow-[4px_0_24px_-8px_rgba(139,78,62,0.08)]">
        <div className="mb-8">
          <Link to="/home" className="text-xl font-bold text-primary tracking-tight">MOMENTS</Link>
        </div>
        
        <div className="flex items-center gap-4 mb-10 p-2">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container shrink-0">
            <img 
              alt="User avatar" 
              src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDn9I6Bn8A1s6Gv_kblRDw5crnta6Vb7W0KyrBjRdHoUu3nEM5p1A7ODn_isaa7M80w2yF_GqrvezNIIz11PYt7KqMNO5ISVUrgUKCJZ3FvNZkhQeNhkwYyW_jdHb2Qja9CR9u9BVzj_6IFkVhiHPLeS6JXKmIBmfaC71-cnJodIWg_zqMW4RUF73sKvLv8IZWTXErCay6A4e6Xaho8Q6Y-8TCyc4_rZbQGrTBGVqYllUj1ftVmkK9I2EnSe5Ph9NHEg-y1kcqoQHI"}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">Welcome back</p>
            <p className="text-on-surface-variant text-sm truncate">{user?.displayName || user?.username || 'User'}</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2">
          <Link 
            to="/profile" 
            className={`flex items-center gap-3 rounded-full px-6 py-3 transition-all active:scale-[0.98] hover:translate-x-1 duration-200 ${path === '/profile' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <UserCircle size={24} className={path === '/profile' ? 'fill-current' : ''} />
            <span className="text-sm font-bold">Profile</span>
          </Link>
          <Link 
            to="/home" 
            className={`flex items-center gap-3 rounded-full px-6 py-3 transition-all active:scale-[0.98] hover:translate-x-1 duration-200 ${path === '/home' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <Home size={24} className={path === '/home' ? 'fill-current' : ''} />
            <span className="text-sm font-bold">HomeFeed</span>
          </Link>
          <Link 
            to="/stories" 
            className={`flex items-center gap-3 rounded-full px-6 py-3 transition-all active:scale-[0.98] hover:translate-x-1 duration-200 ${path === '/stories' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <Sparkles size={24} className={path === '/stories' ? 'fill-current' : ''} />
            <span className="text-sm font-bold">Stories</span>
          </Link>
          <Link 
            to="/chat" 
            className={`flex items-center gap-3 rounded-full px-6 py-3 transition-all active:scale-[0.98] hover:translate-x-1 duration-200 ${path === '/chat' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <div className="relative shrink-0">
              <MessageSquare size={24} className={path === '/chat' ? 'fill-current' : ''} />
              {totalUnreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  {totalUnreadMessages}
                </span>
              )}
            </div>
            <span className="text-sm font-bold">Messages</span>
          </Link>
          <Link 
            to="/friends" 
            className={`flex items-center gap-3 rounded-full px-6 py-3 transition-all active:scale-[0.98] hover:translate-x-1 duration-200 ${path === '/friends' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <Users size={24} className={path === '/friends' ? 'fill-current' : ''} />
            <span className="text-sm font-bold">Friends</span>
          </Link>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`flex items-center w-full gap-3 rounded-full px-6 py-3 transition-all active:scale-[0.98] hover:translate-x-1 duration-200 ${showNotifications ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <div className="relative shrink-0">
              <Bell size={24} className={showNotifications ? 'fill-current' : ''} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-sm font-bold">Notifications</span>
          </button>
          <Link 
            to="/settings" 
            className={`flex items-center gap-3 rounded-full px-6 py-3 transition-all active:scale-[0.98] hover:translate-x-1 duration-200 ${path === '/settings' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <Settings size={24} className={path === '/settings' ? 'fill-current' : ''} />
            <span className="text-sm font-bold">Settings</span>
          </Link>
        </nav>
        
        <div className="mt-auto space-y-3">
          <button 
            onClick={handleLogout}
            className="w-full py-3 flex items-center justify-center gap-3 bg-error-container text-on-error-container font-bold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
          <button className="w-full py-4 bg-primary text-on-primary font-bold rounded-full shadow-[0_4px_12px_rgba(139,78,62,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
            Share a Moment
          </button>
        </div>
      </aside>

      {/* Floating Notifications Drawer Overlay */}
      {showNotifications && (
        <div className="fixed inset-y-0 right-0 z-50 flex justify-end bg-black/20 backdrop-blur-xs w-full">
          <div className="w-full max-w-[380px] bg-surface-container-lowest border-l border-outline-variant/30 flex flex-col shadow-2xl h-full animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <span className="font-bold text-lg text-on-surface">Notifications</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex gap-3 p-3 rounded-2xl cursor-pointer hover:bg-surface-container-low transition-colors ${!n.isRead ? 'bg-primary-container/10 border-l-4 border-primary' : 'bg-surface-container-lowest'}`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-surface-container-high">
                    <img
                      src={n.actorAvatar || fallbackAvatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-on-surface leading-normal">
                      <span className="font-bold text-on-surface">{n.actorName || "Kirenz User"}</span> {n.message}
                    </p>
                    <span className="text-[10px] text-on-surface-variant font-medium mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString() + " " + new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-sm text-on-surface-variant text-center py-20 font-bold">
                  No notifications yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="md:ml-[280px]">
        {children}
      </div>

      {/* Mobile Navigation Shell */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest shadow-[0_-4px_20px_-4px_rgba(139,78,62,0.1)] flex justify-around items-center py-4 px-6 z-50">
        <Link to="/home" className={`${path === '/home' ? 'text-primary' : 'text-on-surface-variant'} flex flex-col items-center gap-1`}>
          <Home size={24} className={path === '/home' ? 'fill-current' : ''} />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link to="/friends" className={`${path === '/friends' ? 'text-primary' : 'text-on-surface-variant'} flex flex-col items-center gap-1`}>
          <Users size={24} className={path === '/friends' ? 'fill-current' : ''} />
          <span className="text-[10px] font-bold">Friends</span>
        </Link>
        <button className="bg-primary-container text-on-primary-container p-4 rounded-full -mt-10 shadow-[0_8px_16px_rgba(255,176,156,0.4)] active:scale-90 transition-transform">
          <Plus size={24} />
        </button>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`${showNotifications ? 'text-primary' : 'text-on-surface-variant'} flex flex-col items-center gap-1 relative`}
        >
          <div className="relative">
            <Bell size={24} className={showNotifications ? 'fill-current' : ''} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black rounded-full h-3.5 w-3.5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Alerts</span>
        </button>
        <Link to="/profile" className={`${path === '/profile' ? 'text-primary' : 'text-on-surface-variant'} flex flex-col items-center gap-1`}>
          <UserCircle size={24} className={path === '/profile' ? 'fill-current' : ''} />
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
