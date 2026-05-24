type IllustrationProps = {
  className?: string;
};

export function MountainSunIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 80"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mountain" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* sky glow */}
      <rect width="200" height="80" fill="url(#sky)" />

      {/* sun/star */}
      <circle cx="140" cy="22" r="11" fill="var(--highlight)" opacity="0.7" />
      <g stroke="var(--accent-2)" strokeWidth="0.8" strokeLinecap="round" opacity="0.7">
        <path d="M140 6v8" />
        <path d="M140 32v8" />
        <path d="M122 22h8" />
        <path d="M150 22h8" />
        <path d="M127 9l5 5" />
        <path d="M148 30l5 5" />
        <path d="M153 9l-5 5" />
        <path d="M132 30l-5 5" />
      </g>

      {/* mountains */}
      <path
        d="M0 75 L25 50 L45 60 L65 38 L88 52 L110 30 L135 48 L165 35 L200 55 L200 80 L0 80 Z"
        fill="url(#mountain)"
        stroke="var(--accent)"
        strokeWidth="0.8"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M0 75 L25 50 L45 60 L65 38 L88 52 L110 30 L135 48 L165 35 L200 55"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* tiny stars */}
      <circle cx="30" cy="20" r="0.8" fill="var(--accent-2)" />
      <circle cx="60" cy="14" r="1" fill="var(--accent-2)" />
      <circle cx="90" cy="18" r="0.6" fill="var(--accent-2)" />
      <circle cx="175" cy="14" r="0.8" fill="var(--accent-2)" />
    </svg>
  );
}

export function DoveIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 120 60"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" fill="var(--accent)" fillOpacity="0.1">
        <path d="M30 35 Q40 20 60 22 Q80 24 90 32 Q85 38 70 38 Q55 38 40 42 Q30 40 30 35 Z" />
        <path d="M88 30 L98 25 L94 33 Z" />
        <circle cx="35" cy="33" r="1.5" fill="var(--accent)" fillOpacity="0.8" />
      </g>
      <path
        d="M10 50 Q35 45 60 50 Q85 55 110 50"
        stroke="var(--accent)"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.4"
        strokeDasharray="2 3"
        fill="none"
      />
    </svg>
  );
}

export function CrossIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="halo">
          <stop offset="0%" stopColor="var(--highlight)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--highlight)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="40" r="35" fill="url(#halo)" />
      <g stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" fill="none">
        <line x1="60" y1="18" x2="60" y2="62" />
        <line x1="45" y1="32" x2="75" y2="32" />
      </g>
    </svg>
  );
}

export function WheatIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 60"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="var(--accent-2)" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.85">
        <path d="M50 55 L50 12" />
        <path d="M50 15 Q42 12 38 18 Q42 20 50 20" fill="var(--accent-2)" fillOpacity="0.2" />
        <path d="M50 15 Q58 12 62 18 Q58 20 50 20" fill="var(--accent-2)" fillOpacity="0.2" />
        <path d="M50 24 Q40 21 35 28 Q41 30 50 30" fill="var(--accent-2)" fillOpacity="0.2" />
        <path d="M50 24 Q60 21 65 28 Q59 30 50 30" fill="var(--accent-2)" fillOpacity="0.2" />
        <path d="M50 34 Q38 31 32 39 Q40 41 50 41" fill="var(--accent-2)" fillOpacity="0.2" />
        <path d="M50 34 Q62 31 68 39 Q60 41 50 41" fill="var(--accent-2)" fillOpacity="0.2" />
      </g>
    </svg>
  );
}

export function Decoration({ className }: IllustrationProps) {
  return (
    <div className={`divider-fancy ${className ?? ""}`} aria-hidden="true">
      ⋆ ✦ ⋆ ✦ ⋆
    </div>
  );
}
