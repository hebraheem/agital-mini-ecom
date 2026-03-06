import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productService, type ProductQuery } from '@/api/products'

export const useProductStore = defineStore('product', () => {
  const loading = ref(false)
  const error = ref('')

  // Get all products with optional query params
  async function getProducts(query?: ProductQuery) {
    loading.value = true
    error.value = ''

    try {
      const response = await productService.getProducts(query)
      if (response.success) {
        return response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load products'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get best rated products
  async function topRatedProduct(search = '') {
    loading.value = true
    error.value = ''

    try {
      const response = await productService.getTopRated({ search, toRated: true })
      if (response.success) {
        //  bestRatedProducts.value = response.data
        return response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load best rated products'
    } finally {
      loading.value = false
    }
  }

  // Get single product
  async function getProduct(id: string) {
    loading.value = true
    error.value = ''

    try {
      const response = await productService.getProduct(id)
      if (response.success) {
        return response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load product'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create product
  async function createProduct(formData: FormData) {
    loading.value = true
    error.value = ''

    try {
      const response = await productService.createProduct(formData)
      if (response.success) {
        return response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create product'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update product
  async function updateProduct(id: string, formData: FormData) {
    loading.value = true
    error.value = ''

    try {
      const response = await productService.updateProduct(id, formData)
      if (response.success) {
        //  currentProduct.value = response.data
        return response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update product'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete product
  async function deleteProduct(id: string) {
    loading.value = true
    error.value = ''

    try {
      const response = await productService.deleteProduct(id)
      if (response.success) {
        // currentProduct.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete product'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reset error
  function clearError() {
    error.value = ''
  }

  return {
    loading,
    error,
    getProducts,
    topRatedProduct,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError,
  }
})
