import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Sparkles, User, UserCircle, Bell, Menu, Plus, Settings, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
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
            <MessageSquare size={24} className={path === '/chat' ? 'fill-current' : ''} />
            <span className="text-sm font-bold">Messages</span>
          </Link>
          <Link 
            to="/friends" 
            className={`flex items-center gap-3 rounded-full px-6 py-3 transition-all active:scale-[0.98] hover:translate-x-1 duration-200 ${path === '/friends' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <Users size={24} className={path === '/friends' ? 'fill-current' : ''} />
            <span className="text-sm font-bold">Friends</span>
          </Link>
          <a href="#" className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high rounded-full px-6 py-3 transition-all active:scale-[0.98] hover:translate-x-1 duration-200">
            <Sparkles size={24} />
            <span className="text-sm font-bold">Memories</span>
          </a>
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
        <button className="text-on-surface-variant flex flex-col items-center gap-1">
          <Sparkles size={24} />
          <span className="text-[10px] font-bold">Memories</span>
        </button>
        <Link to="/profile" className={`${path === '/profile' ? 'text-primary' : 'text-on-surface-variant'} flex flex-col items-center gap-1`}>
          <UserCircle size={24} className={path === '/profile' ? 'fill-current' : ''} />
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
