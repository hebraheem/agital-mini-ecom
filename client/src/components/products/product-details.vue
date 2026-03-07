<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <button class="mb-2 font-500" @click="$router.back()">Back</button>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <!-- Product Details -->
    <div v-else-if="product">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Images -->
        <div>
          <div v-if="product.images && product.images.length > 0" class="space-y-4">
            <img
              :src="selectedImage.url"
              :alt="selectedImage.alt || product.name"
              class="w-full h-96 object-cover rounded-lg"
            />
            <div v-if="product.images.length > 1" class="grid grid-cols-4 gap-4">
              <img
                v-for="(image, index) in product.images"
                :key="index"
                :src="image.url"
                :alt="image.alt || product.name"
                @click="selectedImage = image"
                class="w-full h-24 object-cover rounded cursor-pointer hover:opacity-75"
                :class="{ 'ring-2 ring-blue-500': selectedImage === image }"
              />
            </div>
          </div>
          <div v-else class="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
            <svg
              class="h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <!-- Product Info -->
        <div>
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ product.name }}</h1>
              <p v-if="product.version" class="text-lg text-gray-500 mt-1">
                Version {{ product.version }}
              </p>
            </div>
            <span
              v-if="product.inStock"
              class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
            >
              In Stock
            </span>
            <span v-else class="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              Out of Stock
            </span>
          </div>

          <div v-if="product.averageRating" class="mt-4 flex items-center">
            <div class="flex items-center">
              <svg
                v-for="i in 5"
                :key="i"
                class="h-5 w-5"
                :class="
                  i <= Math.round(product.averageRating) ? 'text-yellow-400' : 'text-gray-300'
                "
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </div>
            <span class="ml-2 text-sm text-gray-600">
              {{ product.averageRating.toFixed(1) }} ({{ product.reviewCount || 0 }} reviews)
            </span>
          </div>

          <p v-if="product.shortDescription" class="mt-6 text-lg text-gray-700">
            {{ product.shortDescription }}
          </p>

          <div v-if="product.longDescription" class="mt-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p class="text-gray-700 whitespace-pre-line">{{ product.longDescription }}</p>
          </div>

          <div class="mt-8 border-t pt-8">
            <div class="flex items-baseline">
              <span class="text-4xl font-bold text-gray-900">€{{ product.price.reseller }}</span>
              <span
                v-if="product.price.discount > 0"
                class="ml-4 text-xl text-gray-500 line-through"
              >
                €{{ product.price.RRP }}
              </span>
              <span
                v-if="product.price.discount > 0"
                class="ml-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                Save {{ product.price.discount.toFixed(2) }}%
              </span>
            </div>
          </div>

          <div v-if="authStore.isAuthenticated" class="mt-6 flex gap-4">
            <router-link :to="`/products/${product.id}/edit`" class="btn btn-secondary">
              Edit Product
            </router-link>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="mt-12 border-t pt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

        <!-- Add Review Form (for authenticated users) -->
        <div v-if="authStore.isAuthenticated" class="mb-8 bg-gray-50 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
          <form @submit.prevent="submitReview">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div class="flex items-center gap-2">
                <button
                  v-for="i in 5"
                  :key="i"
                  type="button"
                  @click="reviewForm.rating = i"
                  class="focus:outline-none"
                >
                  <svg
                    class="h-8 w-8 transition-colors"
                    :class="i <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div class="mb-4">
              <label for="review-content" class="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                id="review-content"
                v-model="reviewForm.content"
                rows="4"
                required
                class="input"
                placeholder="Share your thoughts about this product..."
              ></textarea>
            </div>
            <button type="submit" :disabled="submittingReview" class="btn btn-primary">
              {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
            </button>
          </form>
        </div>

        <!-- Rating Filter -->
        <div class="mb-6 flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">Filter by rating:</label>
          <div class="flex gap-2">
            <button
              @click="reviewQuery.rating = undefined"
              class="px-3 py-1 rounded text-sm"
              :class="
                !Boolean(reviewQuery.rating)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              "
            >
              All
            </button>
            <button
              v-for="i in 5"
              :key="i"
              @click="reviewQuery.rating = 6 - i"
              class="px-3 py-1 rounded text-sm flex items-center gap-1"
              :class="
                reviewQuery.rating === 6 - i
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              "
            >
              {{ 6 - i }}
              <svg class="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Reviews List -->
        <div v-if="loadingReviews" class="text-center py-8">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
        </div>
        <div
          v-else-if="reviews.length === 0 && !reviewQuery.rating"
          class="text-center py-8 text-gray-500"
        >
          No reviews yet. Be the first to review this product!
        </div>
        <div
          v-else-if="reviews.length === 0 && reviewQuery.rating"
          class="text-center py-8 text-gray-500"
        >
          No reviews for the selected rating!
        </div>
        <div v-else class="space-y-6">
          <div
            v-for="review in reviews"
            :key="review.id"
            class="bg-white p-6 rounded-lg border border-gray-200"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="h-5 w-5"
                  :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>

              <span class="text-sm text-gray-500">{{ formatDate(review.createdAt) }}</span>
            </div>
            <p class="text-sm font-medium text-gray-900">By {{ review.user.name }}</p>
            <p class="text-gray-700">{{ review.content }}</p>
          </div>

          <!-- Pagination for Reviews -->
          <div v-if="totalReviewPages > 1" class="mt-6 bg-white rounded-lg shadow-sm">
            <pagination
              :current-page="currentReviewPage"
              :total-pages="totalReviewPages"
              :total="totalReviews"
              :page-limit="reviewItemsPerPage"
              item-name="reviews"
              @page-change="goToReviewPage"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useReviewStore } from '@/stores/review'
import { useAuthStore } from '@/stores/auth'
import Pagination from '@/components/pagination.vue'
import type { Product } from '@/api/products.ts'
import type { Review, ReviewQuery } from '@/api/reviews.ts'
import { formatDate } from '@/utils.ts'

const route = useRoute()

const productStore = useProductStore()
const reviewStore = useReviewStore()
const authStore = useAuthStore()

const product = ref<Product | null>(null)
const selectedImage = ref<any>(null)
const reviews = ref<Review[]>([])
const submittingReview = ref(false)
const reviewForm = ref({
  rating: 1,
  content: '',
})

const loading = computed(() => productStore.loading)
const loadingReviews = computed(() => reviewStore.loading)
const error = computed(() => productStore.error)
const totalReviews = computed(() => reviewStore.totalReviews)
const currentReviewPage = computed(() => reviewStore.currentPage)
const totalReviewPages = computed(() => reviewStore.totalPages)
const reviewItemsPerPage = computed(() => reviewStore.itemsPerPage)

const reviewQuery: ReviewQuery = reactive({
  limit: 10,
  page: 1,
  rating: undefined,
})

onMounted(async () => {
  await loadData()
})

// Watch only rating filter changes, not page
watch(
  () => reviewQuery.rating,
  async () => {
    reviewQuery.page = 1 // Reset to first page when filter changes
    reviews.value = await reviewStore.getReviews(route.params.id as string, reviewQuery)
  },
)

function goToReviewPage(page: number) {
  reviewQuery.page = page
  loadReviews()
}

async function loadReviews() {
  reviews.value = await reviewStore.getReviews(route.params.id as string, reviewQuery)
}

async function loadData() {
  const [review, products] = await Promise.all([
    reviewStore.getReviews(route.params.id as string, reviewQuery),
    productStore.getProduct(route.params.id as string),
  ])
  product.value = products
  const productData = product.value
  if (productData && productData.images && productData.images.length > 0) {
    selectedImage.value = productData.images[0]
  }
  reviews.value = review
}

async function submitReview() {
  submittingReview.value = true

  try {
    await reviewStore.createReview({
      content: reviewForm.value.content,
      rating: reviewForm.value.rating,
      productId: route.params.id as string,
    })

    reviewForm.value = { rating: 1, content: '' }
    await loadData()
  } catch (err: any) {
    alert(err.message || 'Failed to submit review')
  } finally {
    submittingReview.value = false
  }
}
</script>
