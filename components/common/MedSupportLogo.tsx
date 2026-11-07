"use client";

import React from "react";

export const MedSupportLogo: React.FC<{
  className?: string;
  iconOnly?: boolean;
}> = ({ className = "h-9 w-auto", iconOnly = false }) => {
  if (iconOnly) {
    return (
      <img
        src="/logo.png"
        alt="MedGo Icon"
        className={`object-contain max-h-full max-w-full ${className}`}
      />
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0">
      <img
        src="/logo.png"
        alt="MedGo Logo"
        className={`object-contain max-h-full max-w-full shrink-0 ${className}`}
      />
      <span className="text-lg font-normal tracking-tight text-inherit whitespace-nowrap">
        Med<span className="text-[#00ac92]">Go</span>
      </span>
    </div>
  );
};

