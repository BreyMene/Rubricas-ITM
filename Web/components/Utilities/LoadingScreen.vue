<script setup lang="ts">
defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Cargando...'
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  // Option to remove transparent background
  noBackground: {
    type: Boolean,
    default: false
  },
  // Option to remove spinner background
  noSpinnerBackground: {
    type: Boolean,
    default: false
  },
  spinnerSize: {
    type: String as PropType<'sm' | 'md' | 'lg'>,
    default: 'md'
  }
});

const spinnerSizes: Record<string, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4'
}
</script>

<template>
  <Transition name="fade" mode="out-in">
    <div 
      v-if="isLoading" 
      :class="[
        fullscreen ? 'fixed inset-0' : 'absolute inset-0', 
        noBackground ? '' : 'bg-Pure-Black/50 dark:bg-Medium-Gray/50',
        'flex items-center justify-center z-50 transition-opacity duration-300'
      ]"
    >
      <div
        :class="[
          'rounded-lg flex flex-col items-center gap-3',
          noSpinnerBackground
            ? 'bg-none shadow-none p-0'
            : 'bg-Warm-White dark:bg-Pure-Black shadow-lg p-4'
        ]"
      >
  
        <div
          :class="[
            'animate-spin rounded-full border-t-Purple-P border-b-Purple-P dark:border-t-Muted-Brown dark:border-b-Muted-Brown',
            spinnerSizes[spinnerSize]
          ]"
        />
        <p v-if="message" class="text-Pure-Black dark:text-White-w font-medium text-sm">{{ message }}</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>