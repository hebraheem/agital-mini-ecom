import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reviewService, type Review, type CreateReviewData, type ReviewQuery } from '@/api/reviews'

export const useReviewStore = defineStore('review', () => {
  // const reviews = ref<Review[]>([])
  const loading = ref(false)
  const error = ref('')
  // const filterRating = ref<number | null>(null)

  // Get reviews for a product
  async function getReviews(productId: string, query?: ReviewQuery) {
    loading.value = true
    error.value = ''

    try {
      const reviewQuery: ReviewQuery = { limit: 50, ...query }
      if (query?.rating) {
        reviewQuery.rating = query.rating
      }

      const response = await reviewService.getReviews(productId, reviewQuery)
      if (response.success || response.data) {
        // reviews.value = response.data || []
        return response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load reviews'
      console.error('Failed to load reviews:', err)
    } finally {
      loading.value = false
    }
  }

  // Create a review
  async function createReview(data: CreateReviewData) {
    loading.value = true
    error.value = ''

    try {
      const response = await reviewService.createReview(data)
      if (response.success) {
        return response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to submit review'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update a review
  async function updateReview(id: string, data: Partial<CreateReviewData>) {
    loading.value = true
    error.value = ''

    try {
      const response = await reviewService.updateReview(id, data)
      if (response.success) {
        return response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update review'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete a review
  async function deleteReview(id: string) {
    loading.value = true
    error.value = ''

    try {
      const response = await reviewService.deleteReview(id)
      if (response.success) {
        // reviews.value = reviews.value.filter((r) => r.id !== id)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete review'
      throw err
    } finally {
      loading.value = false
    }
  }

  // // Set rating filter
  // function setRatingFilter(rating: number | null) {
  //   //filterRating.value = rating
  // }

  // Clear error
  function clearError() {
    error.value = ''
  }

  // // Reset reviews
  // function resetReviews() {
  //  // reviews.value = []
  //   filterRating.value = null
  // }

  return {
    // reviews,
    loading,
    error,
    // filterRating,
    getReviews,
    createReview,
    updateReview,
    deleteReview,
    // setRatingFilter,
    clearError,
    // resetReviews,
  }
})
