import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Home, UserCircle, Bell, Plus, Settings, MessageSquare, LogOut, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { notificationService, NotificationResponse } from '../services/notification.service';
import { notificationWebsocketService } from '../services/notificationWebsocket.service';
import { fallbackAvatar } from '../constants/post.constants';
import { chatService } from '../services/chat.service';
import { websocketService } from '../services/websocket.service';

const mergeNotificationsById = (
  current: NotificationResponse[],
  incoming: NotificationResponse[],
) => {
  const rowsById = new Map(current.map((row) => [row.id, row]));
  incoming.forEach((row) => rowsById.set(row.id, row));
  return Array.from(rowsById.values()).sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
};

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
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [isMarkingAllNotifications, setIsMarkingAllNotifications] = useState(false);

  // Load initial notifications and unread count
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setNotificationError(null);

      const [listResult, countResult] = await Promise.allSettled([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);

      if (listResult.status === 'fulfilled') {
        setNotifications((current) => mergeNotificationsById(current, listResult.value || []));
      } else {
        setNotificationError('Could not load notifications. Please try again.');
      }

      if (countResult.status === 'fulfilled') {
        setUnreadCount(countResult.value || 0);
      } else {
        setNotificationError('Could not refresh the notification count. Please try again.');
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
            setNotifications((current) => mergeNotificationsById(current, [newNotif]));
          },
          (newCount) => {
            setUnreadCount(newCount);
          }
        );
      })
      .catch(() => setNotificationError('Realtime notifications are temporarily unavailable.'));

    return () => {
      notificationWebsocketService.disconnect();
    };
  }, [user]);

  const handleNotificationClick = async (notif: NotificationResponse) => {
    setNotificationError(null);
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {
        setNotificationError('Could not mark this notification as read.');
      }
    }
    setShowNotifications(false);

    if (notif.type === 'FRIEND_REQUEST') {
      navigate('/profile?tab=friends');
    } else if (notif.type === 'FRIEND_ACCEPT' && notif.actorId) {
      navigate(`/profile/${notif.actorId}`);
    } else if (notif.type === 'BIRTHDAY') {
      const profileId = notif.actorId || notif.targetId;
      if (profileId) {
        navigate(`/profile/${profileId}`);
      }
    } else if (
      notif.type === 'POST_COMMENT' ||
      notif.type === 'POST_LIKE' ||
      notif.type === 'COMMENT_REPLY' ||
      notif.type === 'POST_MENTION' ||
      notif.type === 'COMMENT_MENTION'
    ) {
      if (notif.targetId) {
        const params = new URLSearchParams({
          postId: notif.targetId,
          notificationId: notif.id,
        });
        navigate(`/home?${params.toString()}`);
      }
    } else if (notif.type === 'WELCOME') {
      navigate('/profile?edit=profile');
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotificationError(null);
    setIsMarkingAllNotifications(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      setNotificationError('Could not mark all notifications as read. Please try again.');
    } finally {
      setIsMarkingAllNotifications(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalUnreadMessages = Object.values(unreadCountMap).reduce<number>((sum, count) => sum + Number(count || 0), 0);

  const formatNotificationTime = (createdAt: string) => {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

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
            to="/explore" 
            className={`flex items-center gap-3 rounded-full px-6 py-3 transition-all active:scale-[0.98] hover:translate-x-1 duration-200 ${path === '/explore' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <Compass size={24} className={path === '/explore' ? 'fill-current' : ''} />
            <span className="text-sm font-bold">Explore</span>
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
        <div className="fixed inset-y-0 right-0 md:left-[280px] z-[90] flex justify-end bg-on-surface/25 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close notifications"
            className="absolute inset-0 cursor-default"
            onClick={() => setShowNotifications(false)}
          />
          <aside className="relative z-10 flex h-full w-full max-w-[440px] flex-col border-l border-outline-variant/20 bg-surface-container-lowest shadow-[-18px_0_48px_-28px_rgba(28,28,24,0.45)]">
            <header className="flex items-center justify-between gap-4 border-b border-outline-variant/15 bg-surface-container-lowest px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Bell size={20} className="text-primary" />
                  <h2 className="text-lg font-bold text-on-surface">Notifications</h2>
                </div>
                <p className="mt-0.5 text-xs font-medium text-on-surface-variant">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="rounded-full bg-primary-container/30 px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary-container/50 disabled:opacity-40"
                    disabled={unreadCount === 0 || isMarkingAllNotifications}
                  >
                    {isMarkingAllNotifications ? 'Marking…' : 'Mark read'}
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                  aria-label="Close notifications"
                >
                  <X size={20} />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {notificationError && (
                <div role="alert" className="mb-3 rounded-2xl bg-error-container px-4 py-3 text-sm font-bold text-on-error-container">
                  {notificationError}
                </div>
              )}
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={`group flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_26px_-18px_rgba(28,28,24,0.5)] ${!n.isRead ? 'border-primary-container bg-primary-container/25 shadow-sm' : 'border-outline-variant/10 bg-surface-container-lowest hover:bg-surface-container-low'}`}
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-container-high ring-2 ring-surface-container-lowest shadow-sm">
                        <img
                          src={n.actorAvatar || fallbackAvatar}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {!n.isRead && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-container-lowest bg-primary" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-5 text-on-surface">
                          <span className="font-bold">{n.actorName || 'Kirenz User'}</span>
                          <span className="text-on-surface-variant"> {n.message}</span>
                        </p>
                        <span className="mt-2 inline-flex rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">
                          {formatNotificationTime(n.createdAt)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/40 text-primary">
                    <Bell size={24} />
                  </div>
                  <p className="text-sm font-bold text-on-surface">No notifications yet</p>
                  <p className="mt-1 max-w-56 text-xs font-medium text-on-surface-variant">
                    New reactions, comments, friend updates, and mentions will appear here.
                  </p>
                </div>
              )}
            </div>
          </aside>
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
        <Link to="/explore" className={`${path === '/explore' ? 'text-primary' : 'text-on-surface-variant'} flex flex-col items-center gap-1`}>
          <Compass size={24} className={path === '/explore' ? 'fill-current' : ''} />
          <span className="text-[10px] font-bold">Explore</span>
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

