<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <router-link to="/" class="flex items-center text-xl font-bold text-gray-900">
              agital.soft Shop
            </router-link>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                Home
              </router-link>
              <router-link
                to="/products"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                Products
              </router-link>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <router-link to="/products/create" class="btn btn-primary text-sm">
                Add Product
              </router-link>
              <button @click="handleLogout" class="btn btn-secondary text-sm">Logout</button>
            </template>
            <template v-else>
              <router-link to="/login" class="btn btn-secondary text-sm"> Login </router-link>
              <router-link to="/signup" class="btn btn-primary text-sm"> Sign up </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
