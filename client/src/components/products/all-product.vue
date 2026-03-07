<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Search Bar -->
    <div class="mb-8 flex justify-between w-full">
      <div class="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 w-full">
        <!-- Search -->
        <div class="w-2/3 md:max-w-xl">
          <div class="relative">
            <input
              v-model.trim="productQuery.search"
              type="text"
              placeholder="Search for software..."
              class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <svg
              class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
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

        <!-- Stock Filter -->
        <div class="flex items-center gap-4">
          <p class="text-sm text-nowrap font-medium text-gray-700 mb-1">Stock Status</p>
          <select
            v-model="productQuery.inStock"
            id="stock-filter"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option :value="undefined">All</option>
            <option :value="true">In Stock</option>
            <option :value="false">Out of Stock</option>
          </select>
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
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Products List</h2>
        <div v-if="newestProducts.length === 0" class="text-center py-8 text-gray-500">
          No products found
        </div>
        <div v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <product-card v-for="product in newestProducts" :key="product.id" :product="product" />
          </div>

          <!-- Pagination -->
          <div class="mt-8 bg-white rounded-lg shadow-sm">
            <pagination
              :current-page="currentPage"
              :total-pages="totalPages"
              :total="totalProducts"
              :page-limit="itemsPerPage"
              item-name="products"
              @page-change="goToPage"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, reactive, ref, watch } from 'vue'
import { useProductStore } from '@/stores/product'
import ProductCard from './product-card.vue'
import Pagination from '@/components/pagination.vue'
import type { Product, ProductQuery } from '@/api/products.ts'

const productStore = useProductStore()

const newestProducts = ref<Product[]>([])

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)
const totalProducts = computed(() => productStore.totalProducts)
const currentPage = computed(() => productStore.currentPage)
const totalPages = computed(() => productStore.totalPages)
const itemsPerPage = computed(() => productStore.itemsPerPage)

const productQuery: ProductQuery = reactive({
  limit: 12,
  page: 1,
  search: '',
  inStock: undefined,
})

let searchTimeout: number | undefined = undefined

onMounted(() => {
  loadProducts()
})

async function loadProducts() {
  newestProducts.value = await productStore.getProducts(productQuery)
}

function goToPage(page: number) {
  productQuery.page = page
  loadProducts()
}

// Watch only search and inStock changes, not page
watch(
  () => [productQuery.search, productQuery.inStock],
  () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      productQuery.page = 1
      await loadProducts()
    }, 300)
  },
)
</script>
