import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Upload, CheckCircle2, Info, Move
} from 'lucide-react';
import Layout from './components/Layout';

export default function EditCover() {
  const navigate = useNavigate();
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startY.current = clientY - (offsetY * window.innerHeight / 100); // Approximate normalization
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    startY.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || startY.current === null) return;
    
    // Prevent scrolling when dragging on touch devices
    if ('touches' in e) {
      // We can't entirely preventDefault in React synthetic events like this easily without native events,
      // but we do our best. Usually better handled via touch-action: none via CSS.
    }

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Calculate new offset as a percentage approximation to make it responsive
    const movementY = clientY - startY.current;
    
    // Very rudimentary scaling factor based on approximate element height.
    // In a real app we'd measure the DOM elements accurately.
    const newOffset = Math.min(0, Math.max(-50, (movementY / window.innerHeight) * 100)); 
    setOffsetY(newOffset);
  };

  const previousCovers = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBKR5ecYvj2IuHrlat58iUtUATdQTvwG9wTcMwBimfBJywt0z0wNTICkvXYZp9FZWHO9NMSktUvhi1kbbYAKDyU-VZX0TCUkXpR8-VUE0tdgkpf04ameefmVQkVYZtuD-PihEheCfzS_KNq4_IPP5COMpGuS6dSJuLnX8vkXytpzgKr9_n38s7dyJRpm7aWzVL8VjdrIwzf3ZNjlc2U_Gl61MdlIjBpiqqhl1k5nTVR8Qr1rjUfNQdXHjoEP0Ala-bEWqmgmfWCd5c",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBNGjNJ0R47GmEyCZQbKaG1LYcpiI7nEd1hU0epg1Ia-gx3ZH0Z_cI3d-EqYbb61dZkNbTy9RDSg5NI5M0EKKwrEJWyUqrfsqkUr1cuMLWPquamFmnC2s53IqBh7R0s0pGi4SWaRF7kEPZLZ4bGUoGV3YZYJeZVnIwT1Uivr0ZkfMWXA8LXuOhfsaYliUlkJ2bxgINAlkZ9Fz2ISUwFNDPXdktj0kKAAmt_umChT_vFEuXmi1KQ_AFn0sg6N6zhQ9rPi31erGOeFSA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCT4x4wF0tLZ2EWZ42Vu0gdDJRUuAN8ZFLh_gb0vEl37_FZlrpYRwn2qkJhrF7Zy6NNUkymNwKz0EFpGbPJeawWy2-o4uxyNIUeH06WOFlav-06vQes03TaU4ioa7avFJA5vfjJurKLCvqzfYU267yegkqdg5M7BPzMz7ojm-m43X_NF-MnHJLcACjQ6Smznpgpy5IRg6mQ1S81Sm3mT4mMPxdBjArgEDei4MGlQrEVjmSUmlKh_ofbP4AnrrTmJJi8KGgUWS5ZiNU",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBGzCXBXJYTOrngXnrXuh1Fhr8P8AuD2HwHiz7Dl_eA1NPXtq0w-8fJlKgnpOoBcRmJYGVySSbdMsIqi8SaG3r00ql1rgbdwM0ptgYwJIQ-HysYREtUqnJCEnMYvBx4UWwzetUcmXeAHKx8JJPUqWtOsB8Stgb8FUuL5BDfwtllGwK0SE-hrZ7SovnyeqU2No2uHN0t7jtuXehGN7YNGaYvpMDfdaKXvhtN_HDfTd6TP--RZugGtDvLerrkAbUQbYEJV_chOZ2H66Y"
  ];

  return (
    <Layout>
      <div className="bg-background min-h-screen pb-20 md:pb-0 w-full">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center px-4 md:px-8 py-6 w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md gap-4 border-b border-surface-container">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-primary-container/20 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft size={24} className="text-primary" />
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Edit Cover Photo</h2>
          </div>
          <div className="flex items-center gap-3 md:gap-4 self-end md:self-auto">
            <button 
              onClick={() => navigate('/profile')}
              className="px-6 py-2 border-2 border-outline-variant text-on-surface-variant rounded-full font-bold hover:bg-surface-container transition-all active:scale-95 text-sm md:text-base"
            >
              Cancel
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="px-6 md:px-8 py-2 bg-primary text-white rounded-full font-bold hover:-translate-y-0.5 active:scale-95 transition-all shadow-[0_4px_20px_rgba(139,78,62,0.3)] text-sm md:text-base"
            >
              Save Changes
            </button>
          </div>
        </header>

        <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 space-y-8">
          
          {/* Hero Preview Area */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-1">Preview</h3>
                <p className="text-base font-medium text-on-surface-variant">Click and drag to reposition your banner</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-bold text-on-surface-variant">Aspect Ratio: 3:1</span>
                <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-bold text-on-surface-variant">1500 x 500px</span>
              </div>
            </div>

            {/* Banner Preview Container */}
            <div 
              className="relative w-full aspect-[21/9] md:aspect-[3/1] bg-surface-container-highest rounded-2xl md:rounded-[2rem] overflow-hidden group border-2 border-dashed border-outline-variant shadow-lg"
              style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            >
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL0hbWCgb-06lryCkODifmgSnFX77K_b5XiycRzAENVkvTlIZUafUNBbJV78g8lpXnlmrfWKdPd9KQTR3SG4j4qSM20DaQg8JG3TMh1rrzMwfCY9ZNrWxcHVjv5sw83jDCsWGRJuKGi4Cau7_p62QehdOEfz4vtWmANXIyvSpGW8negxpqmtDQY_RgQKUbktkt07uAN87E1UqiPrG_h66-CozOC8Rt7OnMswdZ6JtrsIpNRv7W22dOpN4yxPFXCj2tD4vsVQVxp6k" 
                alt="Banner Preview" 
                className="w-full h-[150%] object-cover pointer-events-none"
                style={{ 
                  transform: `translateY(${offsetY}%)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
                referrerPolicy="no-referrer"
              />
              
              {/* Reposition Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white/70 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2 border border-white/30 shadow-lg">
                  <Move size={20} className="text-primary" />
                  <span className="text-sm font-bold text-primary">Drag to Reposition</span>
                </div>
              </div>

              {/* Profile Mockup Overlay */}
              <div className="absolute bottom-0 left-4 md:left-8 translate-y-1/3 flex items-end gap-4 md:gap-6 pointer-events-none">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7FPtd-sYe6S4w-S1y48nt0lcgNvtyS_SmAm_EXOG-SCI7I0PnuQO-LdFEmp3ctJzbikGQMF0eUfWERgXxCy1hOmrPwkLfVK22dpRylzFgHtcBdQqkbZKeaf-3XFq-SjyM0yj6uYs2-yg647_E7U4BERgeociL2al-F293tV_wyupzbcXBEKzn5fBh__GHho1piaIaNdNZnA2SO-dhAG4Rggyvl8q9TomaIF0pIZBcyK5I17FY8dlWvNXyHVAjH7BAfqcNtXkz7t8" 
                    alt="Profile Mockup" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Control Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 md:pt-12">
            
            {/* Upload Control */}
            <div className="lg:col-span-1 bg-surface/50 backdrop-blur-md p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(255,176,156,0.15)] flex flex-col items-center text-center gap-4 border-2 border-primary-container/30 hover:border-primary-container/60 transition-colors group cursor-pointer">
              <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary-container/30 transition-all">
                <Upload size={32} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-primary">Upload New</h4>
                <p className="text-sm font-medium text-on-surface-variant mt-2 leading-snug px-4">
                  Choose a high-resolution photo from your device.
                </p>
              </div>
              <button className="w-full mt-2 py-3 bg-primary text-white rounded-full font-bold hover:-translate-y-0.5 active:scale-95 transition-all shadow-md">
                Select File
              </button>
            </div>

            {/* Dimension Guidelines */}
            <div className="lg:col-span-2 bg-surface/50 backdrop-blur-md p-8 rounded-[2rem] flex flex-col gap-6 border border-surface-container">
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Guidelines</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <CheckCircle2 size={24} className="text-tertiary shrink-0 mt-0.5" />
                  <span className="text-base font-medium text-on-surface-variant">Recommended size: 1500x500 pixels.</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 size={24} className="text-tertiary shrink-0 mt-0.5" />
                  <span className="text-base font-medium text-on-surface-variant">Max file size: 5MB (JPG, PNG, WebP).</span>
                </li>
                <li className="flex items-start gap-4">
                  <Info size={24} className="text-tertiary shrink-0 mt-0.5" />
                  <span className="text-base font-medium text-on-surface-variant">Keep important content centered for best display on mobile.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Suggestion Gallery */}
          <section className="space-y-4 pt-4">
            <h3 className="text-xl font-bold text-on-surface">Previous Cover Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previousCovers.map((src, idx) => (
                <div key={idx} className="aspect-[21/9] md:aspect-video rounded-xl md:rounded-2xl overflow-hidden cursor-pointer hover:ring-4 ring-primary-container transition-all group">
                  <img 
                    src={src} 
                    alt={`Previous cover ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
}
