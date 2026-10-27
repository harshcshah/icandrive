/**
 * Reviews, Ratings, and Feedback Service
 *
 * NOTE FOR SUPABASE MIGRATION:
 * Replace with:
 *   await supabase.from('reviews').insert(review);
 *   -- Database trigger handles updating schools.rating and schools.review_count
 */
import { Storage } from './storage';
import { Review, School } from '../types';

export const ReviewService = {
  async getReviewsForSchool(schoolId: string): Promise<Review[]> {
    const reviews = Storage.get<Review[]>(Storage.KEYS.REVIEWS, []);
    return reviews.filter((r) => r.school_id === schoolId && !r.is_flagged);
  },

  async addReview(reviewData: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const reviews = Storage.get<Review[]>(Storage.KEYS.REVIEWS, []);
    const newReview: Review = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    reviews.unshift(newReview);
    Storage.set(Storage.KEYS.REVIEWS, reviews);

    // Recompute school rating & review_count
    const schools = Storage.get<School[]>(Storage.KEYS.SCHOOLS, []);
    const schoolIdx = schools.findIndex((s) => s.id === reviewData.school_id);
    if (schoolIdx !== -1) {
      const schoolReviews = reviews.filter(
        (r) => r.school_id === reviewData.school_id && !r.is_flagged
      );
      const totalScore = schoolReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = Number((totalScore / schoolReviews.length).toFixed(2));
      schools[schoolIdx].rating = avg;
      schools[schoolIdx].review_count = schoolReviews.length;
      Storage.set(Storage.KEYS.SCHOOLS, schools);
    }

    return newReview;
  },

  async replyToReview(reviewId: string, replyText: string): Promise<Review> {
    const reviews = Storage.get<Review[]>(Storage.KEYS.REVIEWS, []);
    const idx = reviews.findIndex((r) => r.id === reviewId);
    if (idx === -1) throw new Error('Review not found');

    reviews[idx].school_reply = replyText;
    reviews[idx].school_replied_at = new Date().toISOString();
    Storage.set(Storage.KEYS.REVIEWS, reviews);
    return reviews[idx];
  },

  async flagReview(reviewId: string, reason: string): Promise<Review> {
    const reviews = Storage.get<Review[]>(Storage.KEYS.REVIEWS, []);
    const idx = reviews.findIndex((r) => r.id === reviewId);
    if (idx === -1) throw new Error('Review not found');

    reviews[idx].is_flagged = true;
    reviews[idx].flag_reason = reason;
    Storage.set(Storage.KEYS.REVIEWS, reviews);
    return reviews[idx];
  },

  async getAllReviewsForAdmin(): Promise<Review[]> {
    return Storage.get<Review[]>(Storage.KEYS.REVIEWS, []);
  },
};
