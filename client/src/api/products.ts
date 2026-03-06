import apiClient from './axios'

export interface Product {
  id: string
  name: string
  version?: string
  shortDescription?: string
  longDescription?: string
  images: Array<{ url: string; alt?: string }>
  price: { reseller: number; RRP: number; discount: number }
  inStock: boolean
  createdAt: string
  updatedAt: string
  averageRating?: number
  reviewCount?: number
}

export interface ProductQuery {
  search?: string
  inStock?: boolean
  page?: number
  limit?: number
  toRated?: boolean
}

export const productService = {
  async getProducts(query?: ProductQuery) {
    const response = await apiClient.get('/products', { params: query })
    return response.data
  },
  async getTopRated(query?: ProductQuery) {
    const response = await apiClient.get('/products/top-rated', { params: query })
    return response.data
  },

  async getProduct(id: string) {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  async createProduct(formData: FormData) {
    const response = await apiClient.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async updateProduct(id: string, formData: FormData) {
    const response = await apiClient.patch(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteProduct(id: string) {
    const response = await apiClient.delete(`/products/${id}`)
    return response.data
  },
}
