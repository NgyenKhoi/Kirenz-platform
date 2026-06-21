import React from "react";
import { useHoverPopover } from "../../hooks/useHoverPopover";

interface CountPopoverProps {
  label: string;
  children: React.ReactNode;
  align?: "left" | "right";
  onOpen?: () => void;
}

export function CountPopover({
  label,
  children,
  align = "left",
  onOpen,
}: CountPopoverProps) {
  const { isOpen, open, closeSoon } = useHoverPopover();

  const handleOpen = () => {
    onOpen?.();
    open();
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={handleOpen}
      onMouseLeave={closeSoon}
      onFocus={handleOpen}
      onBlur={closeSoon}
    >
      <button
        type="button"
        onClick={handleOpen}
        className="text-xs font-bold text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
      >
        {label}
      </button>
      {isOpen && (
        <span
          className={`absolute top-6 z-40 ${
            align === "right" ? "right-0" : "left-0"
          }`}
          onMouseEnter={open}
          onMouseLeave={closeSoon}
        >
          {children}
        </span>
      )}
    </span>
  );
}
