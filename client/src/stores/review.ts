import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reviewService, type CreateReviewData, type ReviewQuery } from '@/api/reviews'

export const useReviewStore = defineStore('review', () => {
  const loading = ref(false)
  const error = ref('')

  // Pagination metadata
  const totalReviews = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const itemsPerPage = ref(10)

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
        // Update pagination metadata if available
        if (response.meta) {
          totalReviews.value = response.meta.totalItems
          currentPage.value = response.meta.currentPage
          totalPages.value = response.meta.totalPages
          itemsPerPage.value = response.meta.itemsPerPage
        }
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
      await reviewService.deleteReview(id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete review'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Clear error
  function clearError() {
    error.value = ''
  }

  return {
    loading,
    error,
    totalReviews,
    currentPage,
    totalPages,
    itemsPerPage,
    getReviews,
    createReview,
    updateReview,
    deleteReview,
    clearError,
  }
})
