<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Already have an account?
        <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </router-link>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSignup">
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {{ error }}
          </div>

          <div>
            <label for="name" class="block text-sm font-medium text-gray-700"> Full name </label>
            <div class="mt-1">
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                class="input"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                class="input"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="formData.password"
                type="password"
                required
                minlength="8"
                class="input"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label for="birthdate" class="block text-sm font-medium text-gray-700">
              Birthdate (optional)
            </label>
            <div class="mt-1">
              <input id="birthdate" v-model="formData.birthdate" type="date" class="input" />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Creating account...' : 'Sign up' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  name: '',
  email: '',
  password: '',
  birthdate: '',
})

const loading = ref(false)
const error = ref('')

async function handleSignup() {
  loading.value = true
  error.value = ''

  try {
    const data: any = {
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
    }

    if (formData.value.birthdate) {
      data.birthdate = formData.value.birthdate
    }

    const success = await authStore.signup(data)
    if (success) {
      router.push('/')
    } else {
      error.value = 'Failed to create account. Please try again.'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
