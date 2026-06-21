import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MediaItem {
  url: string;
  type: "IMAGE" | "VIDEO";
}

interface MediaViewerModalProps {
  media: MediaItem[];
  index: number;
  onClose: () => void;
}

export function MediaViewerModal({
  media,
  index: initialIndex,
  onClose,
}: MediaViewerModalProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  if (media.length === 0) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex < media.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      >
        <button
          className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          onClick={onClose}
        >
          <X size={28} />
        </button>

        {activeIndex > 0 && (
          <button
            className="absolute left-4 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors hover:scale-110 active:scale-95"
            onClick={handlePrev}
          >
            <ChevronLeft size={32} />
          </button>
        )}

        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {media[activeIndex].type === "VIDEO" ? (
            <video
              src={media[activeIndex].url}
              controls
              autoPlay
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
          ) : (
            <img
              src={media[activeIndex].url}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              referrerPolicy="no-referrer"
              alt={`Media ${activeIndex + 1}`}
            />
          )}
        </motion.div>

        {activeIndex < media.length - 1 && (
          <button
            className="absolute right-4 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors hover:scale-110 active:scale-95"
            onClick={handleNext}
          >
            <ChevronRight size={32} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
