import React from "react";

interface BrandLogoProps {
  name: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ name, className = "w-4 h-4" }) => {
  const normalized = name.toLowerCase();

  // 1. Square Pharmaceuticals (Iconic Red 4-Founder Square)
  if (normalized.includes("square")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect width="32" height="32" rx="7" fill="#E51B24" />
        <rect x="6.5" y="6.5" width="8.5" height="8.5" rx="2" fill="#FFFFFF" />
        <rect x="17" y="6.5" width="8.5" height="8.5" rx="2" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="6.5" y="17" width="8.5" height="8.5" rx="2" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="17" y="17" width="8.5" height="8.5" rx="2" fill="#FFFFFF" />
      </svg>
    );
  }

  // 2. Beximco Pharma (Iconic Yellow & Blue Swirl "B")
  if (normalized.includes("beximco")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#002B66" />
        {/* Upper Yellow Wing */}
        <path
          d="M8 12C8 8.5 12 7 17 7C22.5 7 24.5 10 24.5 13C24.5 15.5 22.5 17 19 17.5C21.5 16 21 13 18 12.5C15 12 11 12 8 12Z"
          fill="#FFCC00"
        />
        {/* Lower Blue Swirl */}
        <path
          d="M8 14.5C11 14.5 15.5 14.5 18 16C21 17.5 23 20 20 23.5C17 27 11 25.5 8 23.5C11 23 15 22.5 15.5 20C16 17.5 11 17 8 14.5Z"
          fill="#00A3E0"
        />
        <circle cx="16" cy="16" r="3" fill="#FFFFFF" />
      </svg>
    );
  }

  // 3. Incepta Pharma (Official Blue Ring & Wordmark Logo)
  if (normalized.includes("incepta")) {
    return (
      <img
        src="/brands/incepta.png"
        alt="Incepta"
        className={`${className} object-contain`}
      />
    );
  }

  // 4. Renata Limited (Golden Sunburst / Flower)
  if (normalized.includes("renata")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#0D2033" />
        <g fill="#FFB81C">
          <circle cx="16" cy="16" r="3.5" />
          <path d="M16 6L18 12H14L16 6Z" />
          <path d="M16 26L18 20H14L16 26Z" />
          <path d="M6 16L12 18V14L6 16Z" />
          <path d="M26 16L20 18V14L26 16Z" />
          <path d="M9 9L14.5 12.5L12.5 14.5L9 9Z" />
          <path d="M23 23L17.5 19.5L19.5 17.5L23 23Z" />
          <path d="M23 9L19.5 14.5L17.5 12.5L23 9Z" />
          <path d="M9 23L12.5 17.5L14.5 19.5L9 23Z" />
        </g>
      </svg>
    );
  }

  // 5. ACI Limited (Official Green Circular Logo)
  if (normalized.includes("aci")) {
    return (
      <img
        src="/brands/aci.png"
        alt="ACI"
        className={`${className} object-contain rounded-full`}
      />
    );
  }

  // 6. Eskayef / SK+F (Deep Blue Shield with SK+F Emblem)
  if (normalized.includes("eskayef") || normalized.includes("sk+f") || normalized.includes("skf")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#082042" />
        <rect x="7" y="10" width="18" height="12" rx="3" fill="#E4002B" />
        <path d="M10 13H14C15 13 15 15 14 15.5C15 16 15 19 13.5 19H10V13Z" fill="#FFFFFF" />
        <path d="M17 13V19M21 13L18 16L21 19" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  // 7. The ACME Laboratories (Red Delta / Diamond)
  if (normalized.includes("acme")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#FFF5F5" stroke="#FCA5A5" />
        <path d="M16 6L26 24H6L16 6Z" fill="#E30613" />
        <path d="M16 11L21 21H11L16 11Z" fill="#FFFFFF" />
        <path d="M16 13V19M13.5 16.5H18.5" stroke="#E30613" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  // 8. Healthcare Pharmaceuticals (HPL Leaf & Cross)
  if (normalized.includes("healthcare")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#E6F9F0" />
        <path
          d="M8 20C8 12 14 8 22 8C22 16 16 22 8 20Z"
          fill="#00A651"
        />
        <path
          d="M20 15H17V12H15V15H12V17H15V20H17V17H20V15Z"
          fill="#00AEEF"
        />
      </svg>
    );
  }

  // 9. Popular Pharma (Red & Blue Medical Wave)
  if (normalized.includes("popular")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#1A365D" />
        <circle cx="16" cy="16" r="11" fill="#FFFFFF" />
        <path d="M8 16C12 12 16 20 24 16" stroke="#E4002B" strokeWidth="3" strokeLinecap="round" />
        <circle cx="16" cy="16" r="3" fill="#1A365D" />
      </svg>
    );
  }

  // 10. Aristopharma (Maroon & Gold Crest)
  if (normalized.includes("aristopharma")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#6A1012" />
        <circle cx="16" cy="16" r="13" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M16 8L22 22H19.5L18 18H14L12.5 22H10L16 8Z" fill="#D4AF37" />
        <path d="M14.7 16H17.3L16 12L14.7 16Z" fill="#6A1012" />
      </svg>
    );
  }

  // 11. Opsonin Pharma (Blue & Orange Capsule Circle)
  if (normalized.includes("opsonin")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#004C97" />
        <path d="M16 8C20.4 8 24 11.6 24 16C24 20.4 20.4 24 16 24C11.6 24 8 20.4 8 16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 16C12 13 15 11 18 13C20 14.5 20 18 17 19C14 20 12 18 12 16Z" fill="#FF6A13" />
      </svg>
    );
  }

  // 12. Radiant Pharma (Radiating Cyan-Orange Sunburst)
  if (normalized.includes("radiant")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#F0FAFF" stroke="#BAE6FD" />
        <g fill="#00A3E0">
          <circle cx="16" cy="16" r="5" fill="#FF7900" />
          <rect x="15" y="5" width="2" height="4" rx="1" />
          <rect x="15" y="23" width="2" height="4" rx="1" />
          <rect x="5" y="15" width="4" height="2" rx="1" />
          <rect x="23" y="15" width="4" height="2" rx="1" />
          <path d="M8 8L11 11M21 21L24 24M24 8L21 11M8 24L11 21" stroke="#00A3E0" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  // 13. Beacon Pharma (Lighthouse Rays)
  if (normalized.includes("beacon")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#003366" />
        <path d="M14 24L15 12H17L18 24H14Z" fill="#FFFFFF" />
        <path d="M12 11H20V13H12V11Z" fill="#E31837" />
        <path d="M8 12L4 9M24 12L28 9M7 16L3 17M25 16L29 17" stroke="#FFCC00" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  // 14. Ibn Sina (Islamic Medical Seal)
  if (normalized.includes("ibn sina")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#006837" />
        <circle cx="16" cy="16" r="13" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M18 10C14 10 11 13 11 17C11 21 14 24 18 24C15 23 13 20 13 17C13 14 15 11 18 10Z" fill="#FFDF00" />
        <circle cx="19" cy="16" r="2.5" fill="#FFFFFF" />
      </svg>
    );
  }

  // 15. Drug International (Green & Blue Globe Rx)
  if (normalized.includes("drug int")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#008542" />
        <circle cx="16" cy="16" r="11" fill="#FFFFFF" />
        <path d="M16 9V23M9 16H23" stroke="#005BAC" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // 16. Orion Pharma
  if (normalized.includes("orion")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#003B71" />
        <circle cx="16" cy="16" r="9" stroke="#E31B23" strokeWidth="3" />
        <circle cx="16" cy="16" r="4" fill="#FFFFFF" />
      </svg>
    );
  }

  // 17. Delta Pharma
  if (normalized.includes("delta")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#059669" />
        <path d="M16 8L25 24H7L16 8Z" fill="#FFFFFF" />
        <path d="M16 13L21 22H11L16 13Z" fill="#059669" />
      </svg>
    );
  }

  // 18. General Pharma
  if (normalized.includes("general")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#1E40AF" />
        <circle cx="16" cy="16" r="11" stroke="#EF4444" strokeWidth="2.5" />
        <path d="M12 16H20M16 12V20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 19. UniMed UniHealth
  if (normalized.includes("unimed")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#0F766E" />
        <circle cx="13" cy="16" r="6" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="19" cy="16" r="6" stroke="#5EEAD4" strokeWidth="2" />
      </svg>
    );
  }

  // 20. Globe Pharma
  if (normalized.includes("globe")) {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="16" fill="#2563EB" />
        <circle cx="16" cy="16" r="10" stroke="#FFFFFF" strokeWidth="1.5" />
        <ellipse cx="16" cy="16" rx="5" ry="10" stroke="#FFFFFF" strokeWidth="1.2" />
        <path d="M6 16H26" stroke="#FFFFFF" strokeWidth="1.2" />
      </svg>
    );
  }

  // Default Medical Brand Badge
  return (
    <div className={`${className} rounded-full bg-[#139485]/15 flex items-center justify-center text-[#139485] font-black text-[9px]`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
};
