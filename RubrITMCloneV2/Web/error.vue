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
    <h1 class="mb-2 text-9xl font-bold">
      {{ error?.statusCode }}
    </h1>
    <p class="mb-10 text-xl sm:text-3xl">{{ error?.statusMessage }}</p>
    <UButton variant="ghost"
      @click="handleError"
      class="px-4 py-2 text-white dark:text-White-w bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray rounded-md text-lg cursor-pointer"
    >
      Volver al Inicio
    </UButton>
  </section>
</template>