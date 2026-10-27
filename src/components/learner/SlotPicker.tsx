import React, { useState, useEffect } from 'react';
import { TimeSlot } from '../../types';
import { BookingService } from '../../services/bookingService';
import { Calendar, Clock, User, Car, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface SlotPickerProps {
  schoolId: string;
  packageId: string;
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  schoolId,
  packageId,
  selectedSlot,
  onSelectSlot,
}) => {
  const { t } = useI18n();

  // Generate next 14 days from today
  const dates = React.useMemo(() => {
    const list: { dateStr: string; dayName: string; dayNum: number; monthName: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      list.push({ dateStr, dayName, dayNum: d.getDate(), monthName });
    }
    return list;
  }, []);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(dates[0].dateStr);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCurrent = true;
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const generated = await BookingService.getSlotsForDate(
          schoolId,
          packageId,
          selectedDateStr
        );
        if (isCurrent) setSlots(generated);
      } catch (err) {
        console.error('Error fetching slots', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchSlots();
    return () => {
      isCurrent = false;
    };
  }, [schoolId, packageId, selectedDateStr]);

  // Group slots by time of day
  const morningSlots = slots.filter((s) => {
    const hour = new Date(s.starts_at).getUTCHours();
    return hour < 12;
  });
  const afternoonSlots = slots.filter((s) => {
    const hour = new Date(s.starts_at).getUTCHours();
    return hour >= 12 && hour < 16;
  });
  const eveningSlots = slots.filter((s) => {
    const hour = new Date(s.starts_at).getUTCHours();
    return hour >= 16;
  });

  const renderSlotGroup = (groupTitle: string, groupSlots: TimeSlot[]) => {
    if (groupSlots.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {groupTitle}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {groupSlots.map((slot) => {
            const isSelected = selectedSlot?.starts_at === slot.starts_at;
            const isAvailable = slot.available;

            return (
              <button
                key={`${slot.starts_at}-${slot.instructor_id}`}
                disabled={!isAvailable}
                onClick={() => onSelectSlot(slot)}
                className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300 dark:ring-blue-900 cursor-pointer'
                    : isAvailable
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-700/60 cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border-slate-200/60 dark:border-slate-800 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs sm:text-sm tracking-tight">
                    {slot.display_time.split(' - ')[0]}
                  </span>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  ) : !isAvailable ? (
                    <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                      Booked
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </div>

                <div className="mt-2 pt-1 border-t border-current/10 text-[11px] truncate flex items-center justify-between">
                  <span className="truncate">{slot.instructor_name}</span>
                  <span className="opacity-75 text-[10px] shrink-0 ml-1">45m</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Date Strip Header */}
      <div>
        <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2.5">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>{t('pickDate')}</span>
        </label>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
          {dates.map((item) => {
            const isSelected = selectedDateStr === item.dateStr;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDateStr(item.dateStr)}
                className={`shrink-0 flex flex-col items-center justify-center w-16 py-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-[1.02]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                <span className="text-[11px] font-medium uppercase tracking-wider opacity-85">
                  {item.dayName}
                </span>
                <span className="text-lg font-extrabold my-0.5">{item.dayNum}</span>
                <span className="text-[10px] font-medium opacity-75">{item.monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{t('availableSlots')}</span>
          </label>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" /> Booked
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 py-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium">{t('noSlotsAvailable')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderSlotGroup('Morning (7 AM - 12 PM)', morningSlots)}
            {renderSlotGroup('Afternoon (12 PM - 4 PM)', afternoonSlots)}
            {renderSlotGroup('Evening (4 PM - 7 PM)', eveningSlots)}
          </div>
        )}
      </div>
    </div>
  );
};
