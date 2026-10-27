import React from 'react';
import { Check } from 'lucide-react';

interface InstructorAvatarProps {
  name: string;
  gender?: 'male' | 'female';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showVerified?: boolean;
  className?: string;
}

export const InstructorAvatar: React.FC<InstructorAvatarProps> = ({
  name,
  gender = 'male',
  size = 'md',
  showVerified = true,
  className = '',
}) => {
  // Compute clean initials (up to 2 letters)
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
  }[size];

  // Palette based on gender & name hash
  const bgGradient =
    gender === 'female'
      ? 'from-rose-500 via-pink-600 to-purple-600 text-white'
      : 'from-blue-600 via-indigo-600 to-slate-800 text-white';

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`${sizeClasses} rounded-2xl bg-gradient-to-tr ${bgGradient} flex items-center justify-center font-extrabold tracking-wider shadow-sm ring-2 ring-white dark:ring-slate-900 select-none`}
      >
        {initials || 'TR'}
      </div>

      {showVerified && (
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
      )}
    </div>
  );
};
