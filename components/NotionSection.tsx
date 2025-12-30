"use client";

import { useState, useEffect, ReactNode } from "react";

interface NotionSectionProps {
  title: string;
  count: number;
  children: ReactNode;
  defaultExpanded?: boolean;
  storageKey?: string;
}

export default function NotionSection({ 
  title, 
  count, 
  children, 
  defaultExpanded = true,
  storageKey 
}: NotionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Load from localStorage if key provided
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setIsExpanded(saved === "true");
      }
    }
  }, [storageKey]);

  // Save to localStorage
  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (storageKey) {
      localStorage.setItem(storageKey, String(newExpanded));
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
        className="notion-section-header w-full text-left"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${title} section`}
        type="button"
      >
        <svg
          className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>{title}</span>
        <span className="text-notion-textMuted">·</span>
        <span className="text-notion-textMuted">{count}</span>
      </button>

      {isExpanded && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
}

