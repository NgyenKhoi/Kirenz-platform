import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, History, Search, ShieldAlert, X } from 'lucide-react';
import { useAdminUsers } from './hooks/useAdminUsers';
import type { AdminUser } from './types/admin.types';

type Action = 'warn' | 'suspend' | 'ban' | 'unban';
const reasons = ['SPAM', 'HARASSMENT', 'HATE_SPEECH', 'VIOLENCE', 'NUDITY', 'FALSE_INFORMATION', 'IMPERSONATION', 'OTHER'];

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [verified, setVerified] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AdminUser>();
  const [action, setAction] = useState<Action>();
  const [reason, setReason] = useState('HARASSMENT');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('Your account activity violated our community guidelines.');
  const [until, setUntil] = useState('');
  useEffect(() => { const id = window.setTimeout(() => { setQuery(search.trim()); setPage(0); }, 350); return () => window.clearTimeout(id); }, [search]);
  const params = useMemo(() => ({ query: query || undefined, status: status || undefined, emailVerified: verified === '' ? undefined : verified === 'true', page, size: 20 }), [query, status, verified, page]);
  const admin = useAdminUsers(params, selected?.id);
  const mutation = action === 'warn' ? admin.warn : action === 'suspend' ? admin.suspend : action === 'ban' ? admin.ban : admin.unban;
  const close = () => { setAction(undefined); setNote(''); setUntil(''); };
  const submit = async () => {
    if (!selected || !action || !reason) return;
    if (action === 'warn') await admin.warn.mutateAsync({ id: selected.id, reason, message, note: note || undefined });
    else if (action === 'suspend') await admin.suspend.mutateAsync({ id: selected.id, moderationReason: reason, suspendedUntil: new Date(until).toISOString(), note: note || undefined });
    else if (action === 'ban') await admin.ban.mutateAsync({ id: selected.id, reason, note: note || undefined });
    else await admin.unban.mutateAsync({ id: selected.id, reason, note: note || undefined });
    close();
  };

  return <main className="p-4 sm:p-8"><div className="mx-auto max-w-7xl space-y-6">
    <header><p className="text-sm font-bold uppercase tracking-[.2em] text-primary">Community</p><h2 className="mt-2 text-4xl font-semibold">User Management</h2><p className="mt-2 text-on-surface-variant">Search accounts and apply audited moderation actions.</p></header>
    <section className="grid gap-3 rounded-3xl bg-surface-container-lowest p-5 md:grid-cols-3">
      <label className="relative"><span className="sr-only">Search users</span><Search className="absolute left-4 top-3.5" size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, username or email" className="w-full rounded-full bg-surface-container py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary"/></label>
      <select value={status} onChange={e=>{setStatus(e.target.value);setPage(0)}} className="rounded-full bg-surface-container px-4 py-3"><option value="">All statuses</option>{['ACTIVE','SUSPENDED','BANNED','DEACTIVATED'].map(x=><option key={x}>{x}</option>)}</select>
      <select value={verified} onChange={e=>{setVerified(e.target.value);setPage(0)}} className="rounded-full bg-surface-container px-4 py-3"><option value="">Any verification</option><option value="true">Verified</option><option value="false">Unverified</option></select>
    </section>
    {admin.users.isError && <div role="alert" className="rounded-2xl bg-error-container p-4 text-on-error-container">Users could not be loaded. Please retry.</div>}
    <section className="overflow-hidden rounded-3xl bg-surface-container-lowest">
      {admin.users.isLoading ? <div className="grid min-h-72 place-items-center">Loading users…</div> : !admin.users.data?.content.length ? <div className="grid min-h-72 place-items-center text-on-surface-variant">No users match these filters.</div> : <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-surface-container text-xs uppercase tracking-wider text-on-surface-variant"><tr><th className="p-4">User</th><th>Email</th><th>Status</th><th>Verified</th><th>Joined</th><th>Actions</th></tr></thead><tbody>{admin.users.data.content.map(user=><tr key={user.id} className="border-t border-outline-variant/20"><td className="p-4"><button onClick={()=>setSelected(user)} className="text-left font-bold text-primary">{user.displayName || user.username}<span className="block text-xs font-normal text-on-surface-variant">@{user.username}</span></button></td><td>{user.email}</td><td><span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold">{user.status}</span></td><td>{user.emailVerified ? <CheckCircle2 className="text-green-600" size={18}/> : 'No'}</td><td>{new Date(user.createdAt).toLocaleDateString()}</td><td className="py-3"><div className="flex flex-wrap gap-1"><button onClick={()=>{setSelected(user);setAction('warn')}} className="rounded-full px-3 py-2 text-xs font-bold hover:bg-surface-container">Warn</button><button onClick={()=>{setSelected(user);setAction('suspend')}} className="rounded-full px-3 py-2 text-xs font-bold hover:bg-surface-container">Suspend</button>{user.status==='BANNED'?<button onClick={()=>{setSelected(user);setAction('unban')}} className="rounded-full px-3 py-2 text-xs font-bold text-green-700">Unban</button>:<button onClick={()=>{setSelected(user);setAction('ban')}} className="rounded-full px-3 py-2 text-xs font-bold text-error">Ban</button>}</div></td></tr>)}</tbody></table></div>}
      <footer className="flex items-center justify-between border-t border-outline-variant/20 p-4"><span className="text-sm text-on-surface-variant">{admin.users.data?.totalElements ?? 0} users</span><div className="flex gap-2"><button disabled={page===0} onClick={()=>setPage(p=>p-1)} className="rounded-full p-2 disabled:opacity-30"><ChevronLeft/></button><span className="px-2 py-2 text-sm">Page {page+1}</span><button disabled={page+1 >= (admin.users.data?.totalPages ?? 1)} onClick={()=>setPage(p=>p+1)} className="rounded-full p-2 disabled:opacity-30"><ChevronRight/></button></div></footer>
    </section>
  </div>
  {selected && !action && <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={()=>setSelected(undefined)}><aside onClick={e=>e.stopPropagation()} className="h-full w-full max-w-lg overflow-y-auto bg-surface p-6 shadow-xl"><button onClick={()=>setSelected(undefined)} className="float-right p-2"><X/></button><History className="mb-3 text-primary"/><h3 className="text-2xl font-semibold">Moderation history</h3><p className="mb-6 text-on-surface-variant">{selected.displayName || selected.username}</p>{admin.actions.isLoading?<p>Loading history…</p>:!admin.actions.data?.content.length?<p className="text-on-surface-variant">No moderation actions.</p>:<div className="space-y-3">{admin.actions.data.content.map(item=><article key={item.id} className="rounded-2xl bg-surface-container p-4"><b>{item.actionType.replaceAll('_',' ')}</b><p className="text-sm text-on-surface-variant">{item.reason} · {new Date(item.createdAt).toLocaleString()}</p>{item.note&&<p className="mt-2 text-sm">{item.note}</p>}</article>)}</div>}</aside></div>}
  {selected && action && <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"><form onSubmit={e=>{e.preventDefault();void submit()}} className="w-full max-w-lg rounded-3xl bg-surface p-6 shadow-xl"><div className="flex justify-between"><ShieldAlert className="text-primary"/><button type="button" onClick={close}><X/></button></div><h3 className="mt-4 text-2xl font-semibold capitalize">{action} {selected.displayName || selected.username}</h3>{mutation.error&&<p role="alert" className="mt-4 rounded-xl bg-error-container p-3 text-on-error-container">The action failed. Check the account state and try again.</p>}<label className="mt-5 block text-sm font-bold">Reason<select value={reason} onChange={e=>setReason(e.target.value)} className="mt-2 w-full rounded-2xl bg-surface-container p-3">{reasons.map(x=><option key={x}>{x}</option>)}</select></label>{action==='warn'&&<label className="mt-4 block text-sm font-bold">User message<textarea required value={message} onChange={e=>setMessage(e.target.value)} className="mt-2 w-full rounded-2xl bg-surface-container p-3"/></label>}{action==='suspend'&&<label className="mt-4 block text-sm font-bold">Suspended until<input required type="datetime-local" value={until} onChange={e=>setUntil(e.target.value)} className="mt-2 w-full rounded-2xl bg-surface-container p-3"/></label>}<label className="mt-4 block text-sm font-bold">Private note<textarea value={note} onChange={e=>setNote(e.target.value)} className="mt-2 w-full rounded-2xl bg-surface-container p-3"/></label><button disabled={mutation.isPending || !reason || (action==='suspend'&&!until)} className="mt-6 w-full rounded-full bg-primary py-3 font-bold text-white disabled:opacity-50">{mutation.isPending?'Applying…':'Confirm action'}</button></form></div>}
  </main>;
}
