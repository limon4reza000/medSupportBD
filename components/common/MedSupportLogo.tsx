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
        alt="MedSupplyBD Icon"
        className={`object-contain max-h-full max-w-full ${className}`}
      />
    );
  }

  return (
    <img
      src="/images/medsupplybd-logo.png"
      alt="MedSupplyBD Logo"
      className={`object-contain max-h-full max-w-full ${className}`}
    />
  );
};

