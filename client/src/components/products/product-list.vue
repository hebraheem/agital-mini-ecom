<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Search Bar -->
    <div class="mb-8">
      <div class="max-w-2xl mx-auto">
        <div class="relative">
          <input
            v-model.trim="productQuery.search"
            type="text"
            placeholder="Search for software..."
            class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            class="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
      <p class="mt-4 text-gray-600">Loading products...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <!-- Products Display -->
    <div v-else>
      <!-- Newest Products Section -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Newest Products</h2>
        <div v-if="newestProducts.length === 0" class="text-center py-8 text-gray-500">
          No products found
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <product-card v-for="product in newestProducts" :key="product.id" :product="product" />
        </div>
      </section>

      <!-- Best Rated Products Section -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Best Rated Products</h2>
        <div v-if="bestRatedProducts.length === 0" class="text-center py-8 text-gray-500">
          No rated products yet
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <product-card v-for="product in bestRatedProducts" :key="product.id" :product="product" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, reactive, ref, watch } from 'vue'
import { useProductStore } from '@/stores/product'
import ProductCard from './product-card.vue'
import type { Product, ProductQuery } from '@/api/products.ts'

const productStore = useProductStore()

const newestProducts = ref<Product[]>([])
const bestRatedProducts = ref<Product[]>([])

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)

const productQuery: ProductQuery = reactive({
  limit: 10,
  page: 1,
  search: '',
})

let searchTimeout: number | undefined = undefined

onMounted(() => {
  loadProducts()
})

watch(productQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    await loadProducts()
  }, 300)
})

async function loadProducts() {
  const [products, topRated] = await Promise.all([
    productStore.getProducts(productQuery),
    productStore.topRatedProduct(productQuery.search),
  ])
  newestProducts.value = products
  bestRatedProducts.value = topRated
}
</script>
