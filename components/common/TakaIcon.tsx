"use client";

import React, { useId } from "react";

export interface TakaIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  variant?: "theme" | "gradient";
}

/**
 * TakaIcon - Financial growth chart icon matching user reference:
 * - Circular coin at top-left containing the Bangladeshi Taka symbol (৳)
 * - 3 ascending bar chart bars (growth columns)
 * - Upward curving trend arrow swooshing across the chart
 */
export const TakaIcon: React.FC<TakaIconProps> = ({
  className = "w-5 h-5",
  size,
  variant = "theme",
  ...props
}) => {
  const uniqueId = useId().replace(/:/g, "_");
  const coinMaskId = `taka_coin_mask_${uniqueId}`;
  const barMaskId = `taka_bar_mask_${uniqueId}`;
  const gradCyanId = `taka_grad_cyan_${uniqueId}`;
  const gradArrowId = `taka_grad_arrow_${uniqueId}`;

  // Curved trend arrow path with arrowhead pointing ↗
  const arrowPath =
    "M 2.2 20.6 C 6.5 20.4, 12.0 18.2, 17.5 12.6 L 21.0 13.4 L 22.8 6.8 L 16.2 8.6 L 17.0 11.0 C 11.5 16.8, 6.5 19.0, 2.2 19.2 Z";

  const isGradient = variant === "gradient";

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
      <defs>
        {/* Gradient 1: Cyan to vibrant blue for coin and bars */}
        <linearGradient id={gradCyanId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d2ff" />
          <stop offset="100%" stopColor="#0070f3" />
        </linearGradient>

        {/* Gradient 2: Royal blue to indigo for upward growth arrow */}
        <linearGradient id={gradArrowId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0066ff" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        {/* Cutout mask for Taka symbol (৳) inside circular coin */}
        <mask id={coinMaskId}>
          <rect width="24" height="24" fill="white" />
          <text
            x="6.2"
            y="6.7"
            textAnchor="middle"
            dominantBaseline="central"
            fill="black"
            stroke="black"
            strokeWidth="0.5"
            strokeLinejoin="round"
            fontSize="6.8"
            fontWeight="900"
            fontFamily="'Nirmala UI', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          >
            ৳
          </text>
        </mask>

        {/* Separation mask for bars where arrow swooshes across */}
        <mask id={barMaskId}>
          <rect width="24" height="24" fill="white" />
          <path
            d={arrowPath}
            stroke="black"
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill="black"
          />
        </mask>
      </defs>

      {/* 1. Coin at top-left with Bangladeshi Taka (৳) cutout */}
      <circle
        cx="6.2"
        cy="6.0"
        r="4.2"
        fill={isGradient ? `url(#${gradCyanId})` : "currentColor"}
        mask={`url(#${coinMaskId})`}
      />

      {/* 2. Three Ascending Bar Columns */}
      <g mask={`url(#${barMaskId})`}>
        {/* Bar 1 (Left - Shortest) */}
        <rect
          x="4.5"
          y="12.8"
          width="2.8"
          height="7.7"
          rx="0.9"
          fill={isGradient ? `url(#${gradCyanId})` : "currentColor"}
          fillOpacity={isGradient ? 1 : 0.72}
        />
        {/* Bar 2 (Middle - Medium) */}
        <rect
          x="9.2"
          y="9.6"
          width="2.8"
          height="10.9"
          rx="0.9"
          fill={isGradient ? `url(#${gradCyanId})` : "currentColor"}
          fillOpacity={isGradient ? 1 : 0.72}
        />
        {/* Bar 3 (Right - Tallest) */}
        <rect
          x="13.9"
          y="6.4"
          width="2.8"
          height="14.1"
          rx="0.9"
          fill={isGradient ? `url(#${gradCyanId})` : "currentColor"}
          fillOpacity={isGradient ? 1 : 0.72}
        />
      </g>

      {/* 3. Upward Curved Trend Arrow */}
      <path
        d={arrowPath}
        fill={isGradient ? `url(#${gradArrowId})` : "currentColor"}
      />
    </svg>
  );
};

export default TakaIcon;
