import React from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ReactionType } from "../../types/reaction.types";
import { reactionOptions } from "../../constants/post.constants";
import { useHoverPopover } from "../../hooks/useHoverPopover";

interface ReactionPickerProps {
  currentReaction?: ReactionType | null;
  selectedReaction?: { type: ReactionType; label: string; icon: string };
  isReacting: boolean;
  onSelect: (type: ReactionType) => void;
  compact?: boolean;
}

export function ReactionPicker({
  currentReaction,
  selectedReaction,
  isReacting,
  onSelect,
  compact = false,
}: ReactionPickerProps) {
  const { isOpen, setIsOpen, open, closeSoon } = useHoverPopover();

  const handleMainClick = () => {
    if (currentReaction) {
      onSelect(currentReaction);
      setIsOpen(false);
      return;
    }
    setIsOpen((value) => !value);
  };

  return (
    <div
      className="relative"
      onMouseEnter={open}
      onMouseLeave={closeSoon}
      onFocus={open}
      onBlur={closeSoon}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={handleMainClick}
        disabled={isReacting}
        className={
          compact
            ? `text-[11px] font-bold disabled:opacity-60 ${
                selectedReaction
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`
            : `w-full flex items-center justify-center gap-2 py-2 hover:bg-primary-fixed rounded-full transition-colors text-sm font-bold disabled:opacity-60 ${
                selectedReaction ? "text-primary" : "text-on-surface-variant"
              }`
        }
      >
        <AnimatePresence mode="popLayout">
          {selectedReaction ? (
            <motion.span
              key={selectedReaction.type}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="inline-flex items-center gap-1"
            >
              {compact ? (
                <>
                  {selectedReaction.icon} {selectedReaction.label}
                </>
              ) : (
                <span className="text-lg leading-none">
                  {selectedReaction.icon}
                </span>
              )}
            </motion.span>
          ) : (
            <motion.span
              key="default"
              className="inline-flex items-center gap-1"
            >
              {compact ? "React" : <Heart size={20} />}
            </motion.span>
          )}
        </AnimatePresence>
        {!compact && (
          <span className="hidden sm:inline">
            {selectedReaction?.label || "React"}
          </span>
        )}
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.8,
              y: 10,
              transition: { duration: 0.15 },
            }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
            className={`absolute z-40 flex gap-1 rounded-full border border-outline-variant/40 bg-surface-container-lowest px-2 py-2 shadow-lg ${
              compact ? "bottom-6 left-0" : "bottom-11 left-0"
            }`}
            onMouseEnter={open}
            onMouseLeave={closeSoon}
          >
            {reactionOptions.map((option, index) => (
              <motion.button
                key={option.type}
                type="button"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  bounce: 0.6,
                  delay: index * 0.04,
                }}
                whileHover={{ scale: 1.3, originY: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onSelect(option.type);
                  setIsOpen(false);
                }}
                className={`${
                  compact ? "h-9 w-9 text-lg" : "h-10 w-10 text-xl"
                } rounded-full flex items-center justify-center origin-bottom ${
                  currentReaction === option.type
                    ? "bg-primary-container"
                    : "hover:bg-surface-container-low"
                }`}
                aria-label={option.label}
                title={option.label}
              >
                {option.icon}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
