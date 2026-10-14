"use client";

import React from "react";

export interface TakaIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export const TakaIcon: React.FC<TakaIconProps> = ({
  className = "w-5 h-5",
  size,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <text
        x="50%"
        y="52%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="currentColor"
        fontSize="19"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        ৳
      </text>
    </svg>
  );
};

export default TakaIcon;
