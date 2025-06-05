<script setup lang="ts">
  import type { NuxtError  } from '#app';

  const props = defineProps({
    error: Object as () => NuxtError
  });

  const handleError = () => {
    clearError({ redirect: '/' });
  };
</script>

<template>
  <section class="flex min-h-screen flex-col items-center justify-center">
    <h1 class="mb-2 text-4xl font-bold text-Pure-Black dark:text-White-w">
      {{ error?.statusMessage || error?.statusCode }}
    </h1>
    <p class="mb-10 text-xl sm:text-2xl text-Light-Gray dark:text-MLight-White/50">{{ error?.message }}</p>
    <UButton variant="ghost"
      @click="handleError"
      class="px-4 py-2 text-white dark:text-White-w bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray rounded-md text-lg cursor-pointer"
    >
      Volver al Inicio
    </UButton>
  </section>
</template>