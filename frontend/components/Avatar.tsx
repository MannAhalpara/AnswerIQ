const AVATAR_COLORS = [
  'bg-gray-200',
  'bg-blue-100',
  'bg-green-100',
  'bg-yellow-100',
  'bg-pink-100',
  'bg-purple-100',
];

const INITIALS_COLORS = [
  'text-gray-600',
  'text-blue-600',
  'text-green-600',
  'text-yellow-600',
  'text-pink-600',
  'text-purple-600',
];

interface AvatarProps {
  name: string;
  seed?: number;
  size?: 'sm' | 'md';
}

export default function Avatar({ name, seed = 0, size = 'sm' }: AvatarProps) {
  const idx = seed % AVATAR_COLORS.length;
  const initial = name.charAt(0).toUpperCase();
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  return (
    <div
      className={`${sizeClass} rounded-full ${AVATAR_COLORS[idx]} ${INITIALS_COLORS[idx]} flex items-center justify-center font-semibold shrink-0`}
    >
      {initial}
    </div>
  );
}
