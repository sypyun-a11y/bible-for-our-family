import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const SunIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4M5.6 18.4 7 17m10-10 1.4-1.4" />
  </svg>
);

export const BookIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2V5z" />
    <path d="M4 5a2 2 0 0 0 2 2h13" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3v4m8-4v4" />
  </svg>
);

export const BookmarkIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 4h12v17l-6-3.5L6 21V4z" />
  </svg>
);

export const StarFilledIcon = (p: IconProps) => (
  <svg {...base} {...p} fill="currentColor" strokeWidth={1}>
    <path d="m12 3 2.6 5.7 6.2.7-4.6 4.3 1.3 6.1L12 16.9 6.5 19.8l1.3-6.1L3.2 9.4l6.2-.7L12 3z" />
  </svg>
);

export const StarIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m12 3 2.6 5.7 6.2.7-4.6 4.3 1.3 6.1L12 16.9 6.5 19.8l1.3-6.1L3.2 9.4l6.2-.7L12 3z" />
  </svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m14 6-6 6 6 6" />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m10 6 6 6-6 6" />
  </svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const SettingsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14" />
  </svg>
);

export const TextSizeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 6V4h8v2M8 4v16M6 20h4" />
    <path d="M14 12v-1h6v1M17 11v9M15.5 20h3" />
  </svg>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M19 12H5m0 0 7-7m-7 7 7 7" />
  </svg>
);

export const FlameIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3s4 4 4 8a4 4 0 1 1-8 0c0-1 .5-2 1-3 0 2 1 3 2 3 0-2-1-3 1-8z" fill="currentColor" fillOpacity=".15" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m5 13 4 4L19 7" />
  </svg>
);
