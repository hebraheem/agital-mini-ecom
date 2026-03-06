<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">
      {{ isEdit ? 'Edit Product' : 'Create New Product' }}
    </h1>

    <div v-if="loading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="input"
            placeholder="Super-OS 2023"
          />
        </div>

        <div>
          <label for="version" class="block text-sm font-medium text-gray-700 mb-2">Version</label>
          <input
            id="version"
            v-model="formData.version"
            type="text"
            class="input"
            placeholder="2023.04"
          />
        </div>
      </div>

      <div>
        <label for="shortDescription" class="block text-sm font-medium text-gray-700 mb-2">
          Short Description
        </label>
        <input
          id="shortDescription"
          v-model="formData.shortDescription"
          type="text"
          class="input"
          placeholder="This great OS is all you ever need!"
        />
      </div>

      <div>
        <label for="longDescription" class="block text-sm font-medium text-gray-700 mb-2">
          Long Description
        </label>
        <textarea
          id="longDescription"
          v-model="formData.longDescription"
          rows="4"
          class="input"
          placeholder="Super-OS 2023.04 release is super-os that runs on all super-pcs..."
        ></textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="reseller" class="block text-sm font-medium text-gray-700 mb-2">
            Reseller Price (€) *
          </label>
          <input
            id="reseller"
            v-model.number="formData.price.reseller"
            type="number"
            min="0"
            step="0.01"
            required
            class="input"
            placeholder="80"
          />
        </div>

        <div>
          <label for="rrp" class="block text-sm font-medium text-gray-700 mb-2">RRP (€) *</label>
          <input
            id="rrp"
            v-model.number="formData.price.RRP"
            type="number"
            min="0"
            step="0.01"
            required
            class="input"
            placeholder="100"
          />
        </div>

        <div>
          <label for="discount" class="block text-sm font-medium text-gray-700 mb-2">
            Discount (%)
          </label>
          <input
            id="discount"
            v-model.number="formData.price.discount"
            type="number"
            min="0"
            max="100"
            step="0.01"
            class="input"
            placeholder="20"
          />
        </div>
      </div>

      <div>
        <label class="flex items-center">
          <input
            v-model="formData.inStock"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span class="ml-2 text-sm font-medium text-gray-700">In Stock</span>
        </label>
      </div>

      <div>
        <label for="images" class="block text-sm font-medium text-gray-700 mb-2">
          Product Images
        </label>
        <input
          id="images"
          @change="handleFileChange"
          type="file"
          accept="image/*"
          multiple
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p class="mt-2 text-sm text-gray-500">Upload product images (JPG, PNG)</p>

        <div v-if="imagePreview.length > 0" class="mt-4 grid grid-cols-3 gap-4">
          <div v-for="(preview, index) in imagePreview" :key="index" class="relative">
            <img :src="preview" alt="Preview" class="w-full h-32 object-cover rounded" />
            <button
              type="button"
              @click="removeImage(index)"
              class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="flex gap-4 pt-6">
        <button type="submit" :disabled="submitting" class="btn btn-primary disabled:opacity-50">
          {{ submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product' }}
        </button>
        <router-link to="/" class="btn btn-secondary">Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const isEdit = ref(false)
const loading = computed(() => productStore.loading)
const submitting = ref(false)
const error = computed(() => productStore.error)

const formData = ref({
  name: '',
  version: '',
  shortDescription: '',
  longDescription: '',
  price: {
    reseller: 0,
    RRP: 0,
    discount: 0,
  },
  inStock: true,
})

const selectedFiles = ref<File[]>([])
const imagePreview = ref<string[]>([])

onMounted(() => {
  if (route.params.id) {
    isEdit.value = true
    loadProduct()
  }
})

async function loadProduct() {
  try {
    const product = await productStore.getProduct(route.params.id as string)
    if (product) {
      formData.value = {
        name: product.name,
        version: product.version || '',
        shortDescription: product.shortDescription || '',
        longDescription: product.longDescription || '',
        price: product.price,
        inStock: product.inStock,
      }
    }
  } catch (err: any) {
    // Error handled by store
  }
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
    imagePreview.value = []

    selectedFiles.value.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          imagePreview.value.push(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    })
  }
}

function removeImage(index: number) {
  selectedFiles.value.splice(index, 1)
  imagePreview.value.splice(index, 1)
}

async function handleSubmit() {
  submitting.value = true

  try {
    const formDataObj = new FormData()
    formDataObj.append('name', formData.value.name)
    if (formData.value.version) formDataObj.append('version', formData.value.version)
    if (formData.value.shortDescription)
      formDataObj.append('shortDescription', formData.value.shortDescription)
    if (formData.value.longDescription)
      formDataObj.append('longDescription', formData.value.longDescription)
    formDataObj.append('price', JSON.stringify(formData.value.price))
    formDataObj.append('inStock', formData.value.inStock.toString())

    selectedFiles.value.forEach((file) => {
      formDataObj.append('images', file)
    })

    if (isEdit.value) {
      await productStore.updateProduct(route.params.id as string, formDataObj)
      router.push(`/products/${route.params.id}`)
    } else {
      const response = await productStore.createProduct(formDataObj)
      router.push(`/products/${response.id}`)
    }
  } catch (err: any) {
    // Error handled by store
  } finally {
    submitting.value = false
  }
}
</script>
