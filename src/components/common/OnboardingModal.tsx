import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';
import {
  Compass,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Car,
  X,
  Check,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [slide, setSlide] = useState(0);
  const { t } = useI18n();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const slides = [
    {
      step: '01',
      title: 'Find Top Driving Schools in Vadodara',
      subtitle:
        'Compare government RTO-licensed driving academies across Alkapuri, Gotri, Manjalpur, Akota, and Karelibaug. Transparent ratings and verified dual-control cars.',
      icon: <Compass className="w-8 h-8 text-blue-600" />,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Certified Academies',
    },
    {
      step: '02',
      title: 'Pick Flexible 45-Min Practice Slots',
      subtitle:
        'Learn around your work or college schedule. Book morning 7 AM batches, evening sessions, or weekend test-prep slots with zero double-booking.',
      icon: <CalendarCheck className="w-8 h-8 text-orange-500" />,
      color: 'from-orange-500 to-amber-600',
      badge: 'Zero Double-Booking',
    },
    {
      step: '03',
      title: 'Learn Confidently. You Can Drive.',
      subtitle:
        'Dual-pedal control for peace of mind, doorstep pickup from your society, and dedicated female & male instructors to clear your Baroda RTO test on attempt 1.',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      color: 'from-emerald-600 to-teal-700',
      badge: 'Doorstep Pickup & Safety',
    },
  ];

  const current = slides[slide];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      localStorage.setItem('icd_onboarding_done', 'true');
      onClose();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('icd_onboarding_done', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-6">
        {/* Skip button */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            {current.badge}
          </span>
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white p-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            Skip Intro
          </button>
        </div>

        {/* Visual Icon Badge */}
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
          {current.icon}
        </div>

        {/* Text */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold text-slate-400">
            STEP {current.step} OF 03
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            {current.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            {current.subtitle}
          </p>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center gap-2 pt-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === slide ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer min-h-[44px]"
          >
            <span>{slide === slides.length - 1 ? 'Start Driving' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
