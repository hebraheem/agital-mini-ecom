import apiClient from './axios'

export interface Review {
  id: string
  content: string
  rating: number
  userId: string
  user: {
    id: string
    name: string
  }
  productId: string
  createdAt: string
  updatedAt: string
}

export interface CreateReviewData {
  content: string
  rating: number
  productId: string
}

export interface ReviewQuery {
  page?: number
  limit?: number
  rating?: number
}

export const reviewService = {
  async getReviews(productId: string, query?: ReviewQuery) {
    const response = await apiClient.get(`/reviews/${productId}`, { params: query })
    return response.data
  },

  async createReview(data: CreateReviewData) {
    const response = await apiClient.post('/reviews', data)
    return response.data
  },

  async updateReview(id: string, data: Partial<CreateReviewData>) {
    const response = await apiClient.patch(`/reviews/${id}`, data)
    return response.data
  },

  async deleteReview(id: string) {
    const response = await apiClient.delete(`/reviews/${id}`)
    return response.data
  },
}
