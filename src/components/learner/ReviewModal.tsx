import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Booking } from '../../types';
import { ReviewService } from '../../services/reviewService';
import { Star, MessageSquare } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmitted,
}) => {
  const { t } = useI18n();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await ReviewService.addReview({
        booking_id: booking.id,
        school_id: booking.school_id,
        instructor_id: booking.instructor_id,
        learner_id: booking.learner_id,
        learner_name: booking.learner_name || 'Learner',
        rating,
        comment: comment.trim(),
      });
      onSubmitted();
      onClose();
    } catch (err) {
      console.error('Error submitting review', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('leaveReviewTitle')}
      subtitle={`Booking: ${booking.booking_code}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            {t('rateInstructorAndSchool')}
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      active
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              );
            })}
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">
              {rating} / 5
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Your Feedback
          </label>
          <textarea
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('shareExperiencePlaceholder')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
          />
        </div>

        {/* Quick praise chips */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            'Patient instructor',
            'Great clutch tips',
            'Dual-brakes gave peace of mind',
            'Easy reverse parking',
            'On-time pickup',
          ].map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() =>
                setComment((prev) => (prev ? `${prev} ${tag}.` : `${tag}.`))
              }
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-[11px] cursor-pointer"
            >
              + {tag}
            </button>
          ))}
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm font-bold text-white shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {submitting ? t('loading') : t('submitReview')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
