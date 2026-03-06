<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <h1>404</h1>
    <p>Page not found</p>
    <button @click="$router.go(-1)" class="btn hover:color-blue">Go Back</button>
  </div>
</template>