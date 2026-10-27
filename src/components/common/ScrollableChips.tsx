import React, { useRef, useEffect } from 'react';

export interface ChipItem<T = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface ScrollableChipsProps<T = string> {
  items: ChipItem<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function ScrollableChips<T = string>({
  items,
  selectedId,
  onSelect,
  className = '',
  size = 'md',
}: ScrollableChipsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeChipRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll selected chip smoothly into view
  useEffect(() => {
    if (activeChipRef.current && containerRef.current) {
      activeChipRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedId]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Scrollable Track */}
      <div
        ref={containerRef}
        className="flex items-center gap-2 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory py-1 px-1 -mx-1"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={String(item.id)}
              ref={isSelected ? activeChipRef : null}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`shrink-0 snap-start inline-flex items-center justify-center gap-1.5 rounded-full font-bold transition-all duration-200 cursor-pointer select-none min-h-[44px] ${
                size === 'sm' ? 'px-3.5 py-2 text-xs' : 'px-4 py-2.5 text-xs sm:text-sm'
              } ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 scale-[1.02]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60'
              }`}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="whitespace-nowrap">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
