import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface PostMediaGalleryProps {
  media: { url: string; type: string }[];
}

export function PostMediaGallery({ media }: PostMediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  
  useEscapeKey(activeIndex !== null, () => setActiveIndex(null));

  if (media.length === 0) return null;

  const displayMedia = media.slice(0, 4);
  const remainingCount = media.length - 4;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) =>
      prev !== null && prev < media.length - 1 ? prev + 1 : prev,
    );
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  };

  return (
    <>
      <div
        className={`px-4 pb-4 grid gap-2 ${
          media.length === 1
            ? "grid-cols-1"
            : media.length === 2
              ? "grid-cols-2"
              : media.length === 3
                ? "grid-cols-2"
                : "grid-cols-2"
        }`}
      >
        {displayMedia.map((m, i) => (
          <div
            key={m.url}
            role="button"
            tabIndex={0}
            onClick={() => setActiveIndex(i)}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && setActiveIndex(i)
            }
            className={`relative rounded-3xl overflow-hidden cursor-pointer bg-surface-container-low ${
              media.length === 3 && i === 0 ? "col-span-2" : ""
            }`}
          >
            {m.type === "VIDEO" ? (
              <video
                src={m.url}
                className="w-full h-full min-h-[250px] max-h-[420px] object-cover"
              />
            ) : (
              <img
                alt="Post media"
                src={m.url}
                className="w-full h-full min-h-[250px] max-h-[420px] object-cover hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            )}
            {i === 3 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setActiveIndex(null)}
          >
            <div className="absolute right-6 top-6 z-10 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <a
                href={media[activeIndex].url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Download media"
                title="Download"
              >
                <Download size={24} />
              </a>
              <button
                className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                onClick={() => setActiveIndex(null)}
                aria-label="Close media viewer"
              >
                <X size={28} />
              </button>
            </div>

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
        )}
      </AnimatePresence>
    </>
  );
}
