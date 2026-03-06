<template>
  <router-link
    :to="`/products/${product.id}`"
    class="card hover:shadow-lg transition-shadow duration-200"
  >
    <div class="aspect-w-16 aspect-h-9 bg-gray-200">
      <img
        v-if="product.images && product.images.length > 0"
        :src="product.images[0]!.url"
        :alt="product.images[0]!.alt || product.name"
        class="w-full h-48 object-cover"
      />
      <div v-else class="w-full h-48 flex items-center justify-center bg-gray-100">
        <svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
    <div class="p-4">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 line-clamp-1">{{ product.name }}</h3>
          <p v-if="product.version" class="text-sm text-gray-500">v{{ product.version }}</p>
        </div>
        <span
          v-if="product.inStock"
          class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
        >
          In Stock
        </span>
        <span
          v-else
          class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800"
        >
          Out of Stock
        </span>
      </div>

      <p v-if="product.shortDescription" class="mt-2 text-sm text-gray-600 line-clamp-2">
        {{ product.shortDescription }}
      </p>

      <div class="mt-4 flex items-center justify-between">
        <div>
          <div class="flex items-center">
            <span class="text-2xl font-bold text-gray-900">€{{ product.price.reseller }}</span>
            <span v-if="product.price.discount > 0" class="ml-2 text-sm text-gray-500 line-through">
              €{{ product.price.RRP }}
            </span>
          </div>
          <div v-if="product.price.discount > 0" class="text-sm text-green-600">
            Save {{ product.price.discount.toFixed(2) }}%
          </div>
        </div>

        <div v-if="product.averageRating" class="flex items-center">
          <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
          <span class="ml-1 text-sm text-gray-600">{{ product.averageRating.toFixed(1) }}</span>
          <span v-if="product.reviewCount" class="ml-1 text-sm text-gray-500"
            >({{ product.reviewCount }})</span
          >
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import type { Product } from '@/api/products'

defineProps<{
  product: Product
}>()
</script>
