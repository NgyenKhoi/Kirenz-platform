import React from "react";
import { Globe, Users, Lock, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useHoverPopover } from "../../hooks/useHoverPopover";

interface PrivacyDropdownProps {
  value: "PUBLIC" | "FRIENDS" | "PRIVATE";
  onChange?: (val: "PUBLIC" | "FRIENDS" | "PRIVATE") => void;
  readOnly?: boolean;
  compact?: boolean;
}

export function PrivacyDropdown({
  value,
  onChange,
  readOnly = false,
  compact = false,
}: PrivacyDropdownProps) {
  const { isOpen, setIsOpen, open, closeSoon } = useHoverPopover();

  const options = [
    {
      type: "PUBLIC",
      label: "Public",
      icon: <Globe size={compact ? 12 : 16} />,
    },
    {
      type: "FRIENDS",
      label: "Friends",
      icon: <Users size={compact ? 12 : 16} />,
    },
    {
      type: "PRIVATE",
      label: "Only me",
      icon: <Lock size={compact ? 12 : 16} />,
    },
  ] as const;

  const currentOption = options.find((o) => o.type === value) || options[0];

  if (readOnly) {
    return (
      <span className="flex items-center gap-1 text-on-surface-variant group-hover:text-primary transition-colors">
        {currentOption.icon}
        {!compact && <span>{currentOption.label}</span>}
      </span>
    );
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={open}
      onMouseLeave={closeSoon}
      onFocus={open}
      onBlur={closeSoon}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-md transition-colors hover:bg-surface-container hover:text-on-surface active:bg-surface-container-high ${
          compact
            ? "text-on-surface-variant"
            : "bg-surface-container-low px-3 py-1.5 text-sm font-bold text-on-surface hover:bg-surface-container-high"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {currentOption.icon}
        {!compact && <span>{currentOption.label}</span>}
        <ChevronDown
          size={compact ? 12 : 16}
          className={compact ? "text-on-surface-variant" : ""}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15, type: "spring", bounce: 0 }}
            className={`absolute z-50 flex flex-col min-w-32 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest py-1 shadow-lg ${
              compact ? "left-0 top-full mt-1" : "left-0 top-full mt-2"
            }`}
            role="listbox"
          >
            {options.map((option) => (
              <button
                key={option.type}
                type="button"
                onClick={() => {
                  onChange?.(option.type);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-container-low ${
                  value === option.type
                    ? "bg-primary-container/30 text-primary"
                    : "text-on-surface"
                }`}
                role="option"
                aria-selected={value === option.type}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
