"use client";

import React from "react";

export const MedSupportLogo: React.FC<{ className?: string; iconOnly?: boolean }> = ({
  className = "w-9 h-9",
}) => {
  return (
    <img
      src="/logo.png"
      alt="MedSupport BD Logo"
      className={`object-contain brightness-0 invert max-h-full max-w-full ${className}`}
    />
  );
};
