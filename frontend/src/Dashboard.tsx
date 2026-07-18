import { useMemo, useState } from 'react';
import { Activity, Flag, RefreshCw, ShieldAlert, Users } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { useAdminDashboard } from './hooks/useAdminDashboard';
import type { DashboardGranularity } from './services/admin.service';

const dateValue = (date: Date) => date.toISOString().slice(0, 10);

function MetricCard({ label, value, icon: Icon }: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <article className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container/30 text-primary">
        <Icon size={22} aria-hidden="true" />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-on-surface">{value.toLocaleString()}</p>
    </article>
  );
}

function Bars({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values, 1);
  if (!values.length) {
    return <div className="grid min-h-52 place-items-center text-sm text-on-surface-variant">No data in this range.</div>;
  }
  return (
    <div className="flex min-h-52 items-end gap-1" aria-label="Growth chart">
      {values.map((value, index) => (
        <div key={`${labels[index]}-${index}`} className="group flex min-w-0 flex-1 items-end" title={`${labels[index]}: ${value}`}>
          <div className="w-full rounded-t-full bg-primary/30 transition-colors group-hover:bg-primary" style={{ height: `${Math.max(4, (value / max) * 190)}px` }} />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [granularity, setGranularity] = useState<DashboardGranularity>('DAY');
  const range = useMemo(() => {
    const to = new Date();
    const from = new Date(to);
    if (granularity === 'MONTH') from.setMonth(from.getMonth() - 11);
    else from.setDate(from.getDate() - 29);
    return { from: dateValue(from), to: dateValue(to), granularity };
  }, [granularity]);
  const dashboard = useAdminDashboard(range);
  const error = dashboard.summary.error || dashboard.users.error || dashboard.content.error;
  const partial = [
    ...(dashboard.summary.data?.unavailableComponents ?? []),
    ...(dashboard.users.data?.unavailableComponents ?? []),
    ...(dashboard.content.data?.unavailableComponents ?? []),
  ];
  const userSeries = dashboard.users.data?.series ?? [];
  const contentSeries = dashboard.content.data?.series ?? [];

  return (
    <main className="min-h-screen bg-surface p-4 text-on-surface sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Kirenz Admin</p>
            <h1 className="mt-2 text-4xl font-semibold">Welcome back, {user?.displayName || user?.username}.</h1>
            <p className="mt-2 text-on-surface-variant">Community health and activity at a glance.</p>
          </div>
          <button
            type="button"
            onClick={() => void dashboard.refresh()}
            disabled={dashboard.isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-white disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw size={18} className={dashboard.isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </header>

        {error && <div role="alert" className="mb-6 rounded-2xl bg-error-container p-4 text-on-error-container">Dashboard data could not be loaded. Please try again.</div>}
        {partial.length > 0 && <div role="status" className="mb-6 rounded-2xl bg-secondary-container/40 p-4 text-on-secondary-container">Partial data: {Array.from(new Set(partial)).join(', ')} is temporarily unavailable.</div>}

        {dashboard.isLoading ? (
          <div className="grid min-h-96 place-items-center text-on-surface-variant">Loading dashboard…</div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Registered users" value={dashboard.summary.data?.totalUsers ?? 0} icon={Users} />
              <MetricCard label="New this month" value={dashboard.summary.data?.registrationsThisMonth ?? 0} icon={Activity} />
              <MetricCard label="Restricted users" value={(dashboard.summary.data?.bannedUsers ?? 0) + (dashboard.summary.data?.suspendedUsers ?? 0)} icon={ShieldAlert} />
              <MetricCard label="Open reports" value={(dashboard.summary.data?.pendingReports ?? 0) + (dashboard.summary.data?.reviewingReports ?? 0)} icon={Flag} />
            </section>

            <div className="my-8 flex justify-end">
              <select value={granularity} onChange={(event) => setGranularity(event.target.value as DashboardGranularity)} className="rounded-full bg-surface-container px-5 py-3 text-sm font-bold outline-none ring-primary focus:ring-2" aria-label="Chart granularity">
                <option value="DAY">Last 30 days</option>
                <option value="MONTH">Last 12 months</option>
              </select>
            </div>

            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6">
                <h2 className="mb-6 text-xl font-semibold">Community growth</h2>
                <Bars values={userSeries.map((point) => point.count)} labels={userSeries.map((point) => point.period)} />
              </article>
              <article className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6">
                <h2 className="mb-6 text-xl font-semibold">Active moments</h2>
                <Bars values={contentSeries.map((point) => point.posts + point.comments + point.reactions)} labels={contentSeries.map((point) => point.period)} />
                <div className="mt-5 flex flex-wrap gap-5 text-sm text-on-surface-variant">
                  <span>Posts: {(dashboard.summary.data?.posts ?? 0).toLocaleString()}</span>
                  <span>Comments: {(dashboard.summary.data?.comments ?? 0).toLocaleString()}</span>
                  <span>Reactions: {(dashboard.summary.data?.reactions ?? 0).toLocaleString()}</span>
                </div>
              </article>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
