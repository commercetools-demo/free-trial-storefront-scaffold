import { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const BagIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const HeartIcon = ({ filled, ...props }: P & { filled?: boolean }) => (
  <svg {...base(props)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const UserIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const SearchIcon = (props: P) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const MenuIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);

export const ChevronDown = (props: P) => (
  <svg {...base(props)} width={16} height={16}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const CheckIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const ArrowRight = (props: P) => (
  <svg {...base(props)}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export const TruckIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

export const SparkleIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);
