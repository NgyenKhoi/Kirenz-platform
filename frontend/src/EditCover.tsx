import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Info, Loader2, Upload } from 'lucide-react';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';

const defaultCoverUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG_4uv5c7LMPK5KoWQBZhw2UhexJJ8IIJLAk6l9zKKv7qDm2uCc4PU0QgciFnRx011VAxSWcTIlt_W169WWVryMv3s5jpnMViYu0PScoW1Rp7m7zehvHtLXADvwVAGMOXhDVxpcEfQdyysA2YBZZtpo183gpTP8uw7rAp2rdbrfqN6eA8a1PxyKsfK5FcRNMdDiaxvOMoR_kZKd7ErrytAtfm4J99HXQKAm9dXM2RLUIr6dR3zn79NAIqs7r64_ycRqGODy4c3dHk';

export default function EditCover() {
  const navigate = useNavigate();
  const { user, uploadCoverAsync, isUploadingCover } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!selectedFile) return user?.coverPhotoUrl || defaultCoverUrl;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile, user?.coverPhotoUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    event.target.value = '';
    setError(null);

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setSelectedFile(file);
  };

  const handleSave = async () => {
    if (!selectedFile) {
      navigate('/profile');
      return;
    }

    setError(null);
    try {
      await uploadCoverAsync(selectedFile);
      navigate('/profile');
    } catch {
      setError('Could not upload cover photo. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="bg-background min-h-screen pb-20 md:pb-0 w-full">
        <header className="sticky top-0 z-40 flex w-full flex-col gap-4 border-b border-surface-container bg-surface/80 px-4 py-6 backdrop-blur-md md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="rounded-full p-2 transition-colors hover:bg-primary-container/20 active:scale-95"
              aria-label="Back to profile"
            >
              <ArrowLeft size={24} className="text-primary" />
            </button>
            <h2 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">Edit Cover Photo</h2>
          </div>
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={() => navigate('/profile')}
              className="rounded-full border-2 border-outline-variant px-6 py-2 text-sm font-bold text-on-surface-variant transition-all hover:bg-surface-container active:scale-95 md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUploadingCover}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-bold text-white shadow-[0_4px_20px_rgba(139,78,62,0.3)] transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 md:px-8 md:text-base"
            >
              {isUploadingCover && <Loader2 size={18} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1000px] space-y-8 px-4 py-8 md:px-8">
          <section className="space-y-4">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="mb-1 text-xl font-bold text-on-surface">Preview</h3>
                <p className="text-base font-medium text-on-surface-variant">Choose a cover image for your profile.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-on-surface-variant">Aspect Ratio: 3:1</span>
                <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-on-surface-variant">Image upload</span>
              </div>
            </div>

            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-highest shadow-lg md:aspect-[3/1] md:rounded-[2rem]">
              <img
                src={previewUrl}
                alt="Cover preview"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 left-4 flex translate-y-1/3 items-end gap-4 pointer-events-none md:left-8 md:gap-6">
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg md:h-32 md:w-32">
                  <img
                    src={user?.avatarUrl || 'https://ui-avatars.com/api/?name=User'}
                    alt="Profile mockup"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-2xl bg-error-container px-5 py-4 text-sm font-bold text-on-error-container">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex cursor-pointer flex-col items-center gap-4 rounded-[2rem] border-2 border-primary-container/30 bg-surface/50 p-8 text-center shadow-[0_4px_20px_rgba(255,176,156,0.15)] transition-colors hover:border-primary-container/60">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20 text-primary">
                <Upload size={32} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-primary">Upload New</h4>
                <p className="mt-2 px-4 text-sm font-medium leading-snug text-on-surface-variant">
                  Choose a high-resolution photo from your device.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full rounded-full bg-primary py-3 font-bold text-white shadow-md transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Select File
              </button>
            </div>

            <div className="flex flex-col gap-6 rounded-[2rem] border border-surface-container bg-surface/50 p-8 backdrop-blur-md md:col-span-1 lg:col-span-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Guidelines</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-tertiary" />
                  <span className="text-base font-medium text-on-surface-variant">Recommended size: 1500x500 pixels.</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-tertiary" />
                  <span className="text-base font-medium text-on-surface-variant">JPG, PNG, and WebP images are supported.</span>
                </li>
                <li className="flex items-start gap-4">
                  <Info size={24} className="mt-0.5 shrink-0 text-tertiary" />
                  <span className="text-base font-medium text-on-surface-variant">Keep important content centered for best display on mobile.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
