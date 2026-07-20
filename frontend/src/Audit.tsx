import { useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ClipboardList, UserRound } from 'lucide-react';
import { adminService } from './services/admin.service';
import type { AdminAction, AdminUser } from './types/admin.types';

function UserTargetCard({ user, isLoading }: { user?: AdminUser; isLoading: boolean }) {
  if (isLoading) {
    return <div className="h-14 w-full max-w-sm animate-pulse rounded-2xl bg-surface-container" aria-label="Loading target user" />;
  }

  if (!user) {
    return (
      <div className="flex max-w-sm items-center gap-3 rounded-2xl bg-surface-container px-3 py-2.5 text-on-surface-variant">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-container-high">
          <UserRound size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold">User unavailable</p>
          <p className="text-xs">This account may no longer exist.</p>
        </div>
      </div>
    );
  }

  const name = user.displayName || user.username;
  return (
    <div className="flex max-w-sm items-center gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-low px-3 py-2.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-container font-bold text-on-primary-container">
        {user.avatarUrl
          ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          : name.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{name}</p>
        <p className="truncate text-xs text-on-surface-variant">@{user.username}</p>
      </div>
      <span className="shrink-0 rounded-full bg-surface-container-high px-2 py-1 text-[10px] font-bold">{user.status}</span>
    </div>
  );
}

function Target({ item, user, isLoading }: { item: AdminAction; user?: AdminUser; isLoading: boolean }) {
  if (item.targetType === 'USER') return <UserTargetCard user={user} isLoading={isLoading} />;
  return <p className="truncate text-xs text-on-surface-variant">{item.targetType} · {item.targetId}</p>;
}

export default function Audit() {
  const [targetType, setTargetType] = useState('');
  const [targetId, setTargetId] = useState('');
  const [page, setPage] = useState(0);
  const query = useQuery({
    queryKey: ['admin', 'actions', targetType, targetId, page],
    queryFn: () => adminService.getActions({ targetType: targetType || undefined, targetId: targetId.trim() || undefined, page, size: 20 }),
  });
  const userIds = useMemo(() => [...new Set(query.data?.content.filter((item) => item.targetType === 'USER').map((item) => item.targetId) ?? [])], [query.data]);
  const userQueries = useQueries({
    queries: userIds.map((id) => ({
      queryKey: ['admin', 'user', id],
      queryFn: () => adminService.getUser(id),
      staleTime: 5 * 60 * 1000,
      retry: false,
    })),
  });
  const users = new Map<string, AdminUser>();
  const loadingUsers = new Set<string>();
  userIds.forEach((id, index) => {
    const userQuery = userQueries[index];
    const user = userQuery.data as AdminUser | undefined;
    if (user) users.set(id, user);
    if (userQuery.isLoading) loadingUsers.add(id);
  });

  return (
    <main className="p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header><p className="text-sm font-bold uppercase tracking-[.2em] text-primary">Compliance</p><h2 className="mt-2 text-4xl font-semibold">Audit Log</h2><p className="mt-2 text-on-surface-variant">Immutable history of privileged moderation actions.</p></header>
        <section className="grid gap-3 rounded-3xl bg-surface-container-lowest p-5 sm:grid-cols-2">
          <select value={targetType} onChange={(event) => { setTargetType(event.target.value); setPage(0); }} className="rounded-full bg-surface-container px-4 py-3"><option value="">All target types</option>{['REPORT', 'POST', 'COMMENT', 'USER'].map((item) => <option key={item}>{item}</option>)}</select>
          <input value={targetId} onChange={(event) => { setTargetId(event.target.value); setPage(0); }} placeholder="Filter by target ID" className="rounded-full bg-surface-container px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
        </section>
        {query.isError && <div role="alert" className="rounded-2xl bg-error-container p-4">Audit history could not be loaded.</div>}
        <section className="overflow-hidden rounded-3xl bg-surface-container-lowest">
          {query.isLoading ? <div className="grid min-h-72 place-items-center">Loading audit history…</div> : !query.data?.content.length ? <div className="grid min-h-72 place-items-center text-on-surface-variant"><ClipboardList className="mb-2" />No matching actions.</div> : (
            <div className="divide-y divide-outline-variant/20">{query.data.content.map((item) => {
              return <article key={item.id} className="grid gap-3 p-5 sm:grid-cols-[220px_1fr_180px]"><div><b>{item.actionType.replaceAll('_', ' ')}</b><p className="text-xs text-on-surface-variant">{item.targetType}</p></div><div className="space-y-2"><p className="text-sm">{item.reason}</p><Target item={item} user={users.get(item.targetId)} isLoading={loadingUsers.has(item.targetId)} />{item.note && <p className="text-sm text-on-surface-variant">{item.note}</p>}</div><time className="text-sm text-on-surface-variant">{new Date(item.createdAt).toLocaleString()}</time></article>;
            })}</div>
          )}
          <footer className="flex justify-end gap-3 border-t border-outline-variant/20 p-4"><button disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="p-2 disabled:opacity-30"><ChevronLeft /></button><span className="py-2 text-sm">Page {page + 1}</span><button disabled={page + 1 >= (query.data?.totalPages ?? 1)} onClick={() => setPage((current) => current + 1)} className="p-2 disabled:opacity-30"><ChevronRight /></button></footer>
        </section>
      </div>
    </main>
  );
}
