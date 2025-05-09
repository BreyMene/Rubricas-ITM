<script setup lang="ts">
defineProps({
  isLoading: {
    type: Boolean,
    required: true
  },
  message: {
    type: String,
    default: 'Cargando...'
  }
});
</script>

<template>
  <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-Warm-White dark:bg-Pure-Black p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-Purple-P dark:border-Muted-Brown"></div>
      <p class="text-Pure-Black dark:text-White-w font-medium">{{ message }}</p>
    </div>
  </div>
</template>