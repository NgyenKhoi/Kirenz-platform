import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import apiClient from './config/api.config';
import type { ApiResponse } from './types/auth.types';
import { notificationService, type NotificationResponse } from './services/notification.service';
import Layout from './components/Layout';

interface ModerationDetail { id: string; actionType: string; reason: string; evidenceUrl?: string; createdAt: string }

export default function ModerationDetailPage() {
  const { actionId } = useParams(); const [params] = useSearchParams();
  const [detail, setDetail] = useState<ModerationDetail>(); const [notification, setNotification] = useState<NotificationResponse>(); const [error, setError] = useState('');
  useEffect(() => { if (!actionId) return; const notificationId = params.get('notificationId'); Promise.all([
    apiClient.get<ApiResponse<ModerationDetail>>(`/moderation/actions/${actionId}`).then(r => r.data.data),
    notificationId ? notificationService.getNotification(notificationId) : Promise.resolve(undefined),
  ]).then(([action, item]) => { setDetail(action); setNotification(item); }).catch(() => setError('This moderation notice is unavailable.')); }, [actionId, params]);
  const title = detail?.actionType === 'SEND_WARNING' ? 'Account warning' : detail?.actionType === 'SUSPEND_ACCOUNT' ? 'Account suspension' : 'Account ban';
  return <Layout><main className="mx-auto min-h-screen max-w-3xl px-5 py-12"><section className="rounded-3xl bg-surface-container-lowest p-7 shadow-xl"><ShieldAlert size={42} className="text-error" />{error ? <p role="alert" className="mt-5 rounded-xl bg-error-container p-4">{error}</p> : !detail ? <p className="mt-5">Loading moderation notice…</p> : <><h1 className="mt-4 text-3xl font-bold">{title}</h1><p className="mt-2 text-sm text-on-surface-variant">Issued {new Date(detail.createdAt).toLocaleString()}</p><div className="mt-6 rounded-2xl bg-surface-container p-5"><h2 className="font-bold">Reason</h2><p className="mt-2">{detail.reason.replaceAll('_', ' ')}</p>{notification?.message && <p className="mt-3 text-on-surface-variant">{notification.message}</p>}</div>{detail.evidenceUrl && <div className="mt-5"><h2 className="font-bold">Evidence</h2><a href={detail.evidenceUrl} target="_blank" rel="noreferrer"><img src={detail.evidenceUrl} alt="Moderation evidence" className="mt-3 max-h-[32rem] w-full rounded-2xl object-contain bg-surface-container" /></a></div>}<p className="mt-6 text-sm text-on-surface-variant">If you believe this decision is incorrect, contact platform support and include notice ID {detail.id}.</p></>}<Link to="/home" className="mt-7 inline-flex rounded-full bg-primary px-6 py-3 font-bold text-white">Back to home</Link></section></main></Layout>;
}
