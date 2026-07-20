import { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { reportService, type ReportReason, type ReportTargetType } from '../../services/report.service';
import { useEscapeKey } from '../../hooks/useEscapeKey';

const reasons: Array<{ value: ReportReason; label: string }> = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'HATE_SPEECH', label: 'Hate speech' },
  { value: 'VIOLENCE', label: 'Violence or threats' },
  { value: 'NUDITY', label: 'Nudity or sexual content' },
  { value: 'FALSE_INFORMATION', label: 'False information' },
  { value: 'IMPERSONATION', label: 'Impersonation' },
  { value: 'OTHER', label: 'Other' },
];

export function ReportDialog({ open, targetType, targetId, onClose }: { open: boolean; targetType: ReportTargetType; targetId: string; onClose: () => void }) {
  const [reason, setReason] = useState<ReportReason>('HARASSMENT');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEscapeKey(open, onClose);
  if (!open) return null;

  const submit = async () => {
    setSubmitting(true); setError('');
    try {
      await reportService.create({ targetType, targetId, reason, description: description.trim() || undefined });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not submit this report. Please try again.');
    } finally { setSubmitting(false); }
  };

  return <div className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-label={`Report ${targetType.toLowerCase()}`} onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-surface p-6 shadow-2xl">
      <button type="button" onClick={onClose} className="float-right rounded-full p-2 hover:bg-surface-container" aria-label="Close report dialog"><X /></button>
      <Flag className="text-error" />
      {submitted ? <div className="py-8 text-center"><h3 className="text-2xl font-bold">Report submitted</h3><p className="mt-2 text-on-surface-variant">Our moderation team will review it. Thank you for helping keep Kirenz safe.</p><button type="button" onClick={onClose} className="mt-6 rounded-full bg-primary px-6 py-3 font-bold text-white">Done</button></div> : <form onSubmit={e => { e.preventDefault(); void submit(); }}>
        <h3 className="mt-4 text-2xl font-bold">Report {targetType === 'POST' ? 'post' : 'profile'}</h3>
        <p className="mt-2 text-sm text-on-surface-variant">Reports are confidential. The reported user will not see who submitted the report.</p>
        <label className="mt-5 block text-sm font-bold">Reason<select value={reason} onChange={e => setReason(e.target.value as ReportReason)} className="mt-2 w-full rounded-xl border border-outline-variant bg-surface-container p-3">{reasons.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label className="mt-4 block text-sm font-bold">Additional details (optional)<textarea maxLength={1000} rows={4} value={description} onChange={e => setDescription(e.target.value)} className="mt-2 w-full resize-none rounded-xl border border-outline-variant bg-surface-container p-3" /></label>
        {error && <p role="alert" className="mt-4 rounded-xl bg-error-container p-3 text-on-error-container">{error}</p>}
        <button disabled={submitting} className="mt-6 w-full rounded-full bg-error py-3 font-bold text-on-error disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit report'}</button>
      </form>}
    </div>
  </div>;
}
