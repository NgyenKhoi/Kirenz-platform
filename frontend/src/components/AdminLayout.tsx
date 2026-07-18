import { Activity, ClipboardList, Flag, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const items = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
  { to: '/admin/monitoring', label: 'Monitoring', icon: Activity },
  { to: '/admin/audit', label: 'Audit', icon: ClipboardList },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-surface text-on-surface lg:flex">
      <aside className="border-b border-outline-variant/30 bg-surface-container-lowest p-4 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:p-6">
        <div className="mb-6 px-2">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-primary">Kirenz</p>
          <h1 className="mt-1 text-2xl font-semibold">Admin Center</h1>
        </div>
        <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Admin navigation">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-full px-4 py-3 text-sm font-bold transition-colors ${isActive ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={() => logout()} className="mt-6 flex items-center gap-3 rounded-full px-4 py-3 text-sm font-bold text-error hover:bg-error-container lg:absolute lg:bottom-6">
          <LogOut size={18} /> Sign out
        </button>
      </aside>
      <div className="min-w-0 flex-1"><Outlet /></div>
    </div>
  );
}
