const iconPaths: Record<string, string> = {
  employees: '/employees_icon.svg',
  present: '/present_icon.svg',
  absent: '/absent_icon.svg',
  search: '/search_icon.svg',
  user: '/user_icon.svg',
  clock: '/clock_icon.svg',
  fingerprint: '/fingerprint_icon.svg',
  profile: '/profile_icon.svg',
  working: '/working_icon.svg',
};

interface IconProps {
  name: keyof typeof iconPaths;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, className = 'w-5 h-5', alt, style }: IconProps) {
  return (
    <img
      src={iconPaths[name]}
      alt={alt ?? name}
      className={className}
      style={style}
      draggable={false}
    />
  );
}
