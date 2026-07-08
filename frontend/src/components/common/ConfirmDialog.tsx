import React from 'react';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { X, AlertTriangle, Trash2, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'info',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEscapeKey(isOpen, onCancel);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 size={24} className="text-error" />;
      case 'warning':
        return <AlertTriangle size={24} className="text-secondary" />;
      default:
        return <HelpCircle size={24} className="text-primary" />;
    }
  };

  const getConfirmButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-error text-on-error hover:brightness-95 hover:shadow-[0_4px_12px_rgba(186,26,26,0.3)]';
      case 'warning':
        return 'bg-secondary text-on-secondary hover:brightness-110 hover:shadow-[0_4px_12px_rgba(118,91,6,0.3)]';
      default:
        return 'bg-primary text-on-primary hover:brightness-110 hover:shadow-[0_4px_12px_rgba(139,78,62,0.3)]';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-[2rem] border border-outline-variant/30 shadow-2xl p-6 md:p-8 space-y-6 relative animate-in zoom-in-95 duration-200">
        
        {/* Header/Content Area */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${type === 'danger' ? 'bg-error-container/20' : type === 'warning' ? 'bg-secondary-container/20' : 'bg-primary-container/20'}`}>
            {getIcon()}
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            <h3 className="text-xl font-bold text-on-surface leading-tight break-words">
              {title}
            </h3>
            <p className="text-sm font-medium text-on-surface-variant leading-relaxed break-words">
              {message}
            </p>
          </div>
          <button 
            onClick={onCancel}
            type="button"
            className="text-on-surface-variant hover:text-on-surface p-1.5 hover:bg-surface-container rounded-full transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95"
          >
            {cancelLabel}
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-full text-sm font-bold shadow-md active:scale-[0.98] transition-all min-w-[100px] flex justify-center items-center ${getConfirmButtonStyles()}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
