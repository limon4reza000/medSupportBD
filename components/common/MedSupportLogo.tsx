"use client";

import React from "react";

export const MedSupportLogo: React.FC<{
  className?: string;
  iconOnly?: boolean;
}> = ({ className = "h-9 w-auto", iconOnly = false }) => {
  if (iconOnly) {
    return (
      <img
        src="/images/sidebar-logo.png"
        alt="MedGo Icon"
        className={`object-contain max-h-full max-w-full ${className}`}
      />
    );
  }

  return (
    <img
      src="/images/png-final.png"
      alt="MedGo Logo"
      className={`object-contain max-h-full max-w-full ${className}`}
    />
  );
};

