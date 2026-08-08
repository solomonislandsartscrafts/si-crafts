/**
 * Custom hand-drawn style SVG icons for SI Crafts.
 * These replace generic Lucide icons with organic, craft-inspired shapes
 * that reflect the handmade nature of Solomon Islands artisan work.
 *
 * All icons accept className for sizing/coloring via Tailwind.
 */

interface IconProps {
  className?: string;
  /** Accessible title — when provided, the icon is treated as meaningful (aria-hidden removed). */
  title?: string;
}

/** A woven shield/badge shape — represents authenticity & protection */
export function IconAuthenticity({ className = 'w-6 h-6', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} role={title ? 'img' : undefined} aria-label={title || undefined}>
      {title && <title>{title}</title>}
      {/* Shield outline with organic curves */}
      <path d="M12 2C9 4 5 4.5 4 4.5c0 6 1 12.5 8 17.5 7-5 8-11.5 8-17.5-1 0-5-.5-8-2.5z" />
      {/* Woven check pattern inside */}
      <path d="M9 12l2 2 4-4" strokeWidth="2" />
      {/* Decorative weave lines */}
      <path d="M8 8.5c1.5.5 3 .5 4.5 0M7.5 11c2 .7 4 .7 6 0" strokeWidth="0.75" opacity="0.4" />
    </svg>
  );
}

/** A hand holding/offering — represents fair trade & giving */
export function IconHandHeart({ className = 'w-6 h-6', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} role={title ? 'img' : undefined} aria-label={title || undefined}>
      {title && <title>{title}</title>}
      {/* Open palm */}
      <path d="M8 18c-2 0-4-1-5-3l-1-2c0-1 .5-2 1.5-2h1c.5 0 1 .3 1.2.7l.3.6" />
      <path d="M16 18c2 0 4-1 5-3l1-2c0-1-.5-2-1.5-2h-1c-.5 0-1 .3-1.2.7l-.3.6" />
      {/* Heart shape above hands */}
      <path d="M12 7c-1-2-3.5-2.5-4.5-1.5S6 8 12 13c6-5 6.5-6 5.5-7.5S13 5 12 7z" />
    </svg>
  );
}

/** An eye with a leaf/organic shape — represents cultural respect & seeing */
export function IconCulturalEye({ className = 'w-6 h-6', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} role={title ? 'img' : undefined} aria-label={title || undefined}>
      {title && <title>{title}</title>}
      {/* Eye outline shaped like a leaf */}
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
      {/* Pupil */}
      <circle cx="12" cy="12" r="3" />
      {/* Decorative leaf vein through eye */}
      <path d="M12 6v1.5M12 16.5V18" strokeWidth="0.75" opacity="0.5" />
    </svg>
  );
}

/** Connected people in a circle — represents community & consent */
export function IconCommunity({ className = 'w-6 h-6', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} role={title ? 'img' : undefined} aria-label={title || undefined}>
      {title && <title>{title}</title>}
      {/* Three people in organic arrangement */}
      <circle cx="12" cy="5" r="2" />
      <path d="M10 9c-1 0-2 1-2 2v2h8v-2c0-1-1-2-2-2" />
      <circle cx="5" cy="14" r="1.5" />
      <path d="M3 17.5c0-.8.7-1.5 1.5-1.5h1c.8 0 1.5.7 1.5 1.5V19H3v-1.5z" />
      <circle cx="19" cy="14" r="1.5" />
      <path d="M17 17.5c0-.8.7-1.5 1.5-1.5h1c.8 0 1.5.7 1.5 1.5V19h-4v-1.5z" />
      {/* Connecting arc */}
      <path d="M7 18c1.5 2 7.5 2 10 0" strokeWidth="0.75" opacity="0.4" strokeDasharray="2 1" />
    </svg>
  );
}

/** Shell money / cowrie shape — represents value & payment */
export function IconShellMoney({ className = 'w-6 h-6', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} role={title ? 'img' : undefined} aria-label={title || undefined}>
      {title && <title>{title}</title>}
      {/* Cowrie shell shape */}
      <ellipse cx="12" cy="12" rx="6" ry="8" />
      {/* Shell opening/slit */}
      <path d="M12 4c-1 2-1 6 0 8s1 6 0 8" />
      {/* Shell ridges */}
      <path d="M8 9c1.5.5 3 .5 4.5 0M8 12c1.5.5 3 .5 4.5 0M8 15c1.5.5 3 .5 4.5 0" strokeWidth="0.75" opacity="0.5" />
    </svg>
  );
}

/** A question mark with a woven circle — represents help/FAQ */
export function IconWovenQuestion({ className = 'w-6 h-6', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} role={title ? 'img' : undefined} aria-label={title || undefined}>
      {title && <title>{title}</title>}
      {/* Organic circle border */}
      <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z" />
      {/* Question mark */}
      <path d="M9 9c0-1.7 1.3-3 3-3s3 1.3 3 3c0 1.5-1.2 2-2 2.5-.5.3-1 .7-1 1.5" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      {/* Weave texture on circle */}
      <path d="M4 10c2-.3 3.5-.1 5.5.3M14.5 10c2-.3 3.5-.1 5.5.3" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

/** A basket/woven container — represents wholesale store/shopping */
export function IconWovenBasket({ className = 'w-6 h-6', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} role={title ? 'img' : undefined} aria-label={title || undefined}>
      {title && <title>{title}</title>}
      {/* Basket body */}
      <path d="M4 10h16l-1.5 9c-.2 1.2-1.2 2-2.4 2H7.9c-1.2 0-2.2-.8-2.4-2L4 10z" />
      {/* Basket handle */}
      <path d="M8 10c0-4 1.8-7 4-7s4 3 4 7" />
      {/* Weave pattern */}
      <path d="M6 13h12M7 16h10M8 19h8" strokeWidth="0.75" opacity="0.4" />
      <path d="M9 10v9M12 10v11M15 10v9" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

/** A hand with a leaf/plant — represents handmade/organic process */
export function IconHandmade({ className = 'w-6 h-6', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} role={title ? 'img' : undefined} aria-label={title || undefined}>
      {title && <title>{title}</title>}
      {/* Hand shape */}
      <path d="M6 16c-1-1-2-3-2-5 0-1 .8-1.5 1.5-1s1 1.5 1 2.5" />
      <path d="M6.5 12.5V7c0-1 .7-1.5 1.5-1.5s1.5.5 1.5 1.5v5" />
      <path d="M9.5 11V5.5c0-1 .7-1.5 1.5-1.5s1.5.5 1.5 1.5V11" />
      <path d="M12.5 11.5V6.5c0-1 .7-1.5 1.5-1.5s1.5.5 1.5 1.5v5" />
      <path d="M15.5 12V9c0-1 .7-1.5 1.5-1.5s1.5.5 1.5 1.5v5c0 4-3 7-7 7H11c-2 0-4-1-5-3" />
      {/* Small leaf decoration */}
      <path d="M14 2c1 0 2.5 1 2.5 2.5S14 6 14 6s-2.5-1-2.5-2.5S14 2 14 2z" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

/** Canoe/boat shape — represents shipping/delivery */
export function IconCanoe({ className = 'w-6 h-6', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} role={title ? 'img' : undefined} aria-label={title || undefined}>
      {title && <title>{title}</title>}
      {/* Canoe hull */}
      <path d="M2 16c1-2 4-3 10-3s9 1 10 3c-2 1.5-5 2-10 2s-8-.5-10-2z" />
      {/* Outrigger */}
      <path d="M6 13l-1-3M18 13l1-3" strokeWidth="1" />
      {/* Sail */}
      <path d="M12 4v9" />
      <path d="M12 4c2 1.5 4 4 4 7l-4 2" strokeWidth="1" />
      {/* Wave decoration */}
      <path d="M3 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0" strokeWidth="0.75" opacity="0.4" />
    </svg>
  );
}

/** A person with a plus — represents applying/joining */
export function IconJoinUs({ className = 'w-6 h-6', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} role={title ? 'img' : undefined} aria-label={title || undefined}>
      {title && <title>{title}</title>}
      {/* Person */}
      <circle cx="10" cy="7" r="3" />
      <path d="M5 20c0-3.5 2.5-6 5-6s5 2.5 5 6" />
      {/* Plus sign with organic touch */}
      <path d="M19 8v6M16 11h6" strokeWidth="2" />
    </svg>
  );
}

/** Pandanus leaf / woven mat — represents browse/catalogue */
export function IconWovenMat({ className = 'w-6 h-6', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} role={title ? 'img' : undefined} aria-label={title || undefined}>
      {title && <title>{title}</title>}
      {/* Mat rectangle with rounded organic edges */}
      <rect x="3" y="5" width="18" height="14" rx="2" />
      {/* Woven diagonal lines */}
      <path d="M3 9l18-4M3 13l18-4M3 17l18-4" strokeWidth="0.75" opacity="0.4" />
      <path d="M7 5v14M11 5v14M15 5v14M19 5v14" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

/** Bank transfer / traditional exchange */
export function IconBankTransfer({ className = 'w-6 h-6', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} role={title ? 'img' : undefined} aria-label={title || undefined}>
      {title && <title>{title}</title>}
      {/* Two hands exchanging */}
      <path d="M3 8h10l-3-3" />
      <path d="M3 8l3 3" />
      <path d="M21 16H11l3 3" />
      <path d="M21 16l-3-3" />
      {/* Shell money symbols */}
      <circle cx="17" cy="8" r="2" />
      <circle cx="7" cy="16" r="2" />
      <path d="M16.5 7.5c.3.3.3.7 0 1M6.5 15.5c.3.3.3.7 0 1" strokeWidth="0.75" opacity="0.5" />
    </svg>
  );
}

/** Package/parcel with leaf — represents receiving goods */
export function IconParcelLeaf({ className = 'w-6 h-6', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={!title} role={title ? 'img' : undefined} aria-label={title || undefined}>
      {title && <title>{title}</title>}
      {/* Box shape */}
      <path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" />
      <path d="M4 8l8 4 8-4" />
      <path d="M12 12v8" />
      {/* Leaf on top */}
      <path d="M14 2c1.5 0 3 1.5 3 3s-3 3-3 3-3-1.5-3-3 1.5-3 3-3z" strokeWidth="1" />
      <path d="M14 2v6" strokeWidth="0.75" opacity="0.5" />
    </svg>
  );
}
