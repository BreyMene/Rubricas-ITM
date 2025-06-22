<script setup lang="ts">
    import type { Estudiante, Nota } from '~/utils/types'
    import { useI18n } from 'vue-i18n'

    interface Props {
        nota: Nota
        estudiantes: Estudiante[]
    }

    const props = defineProps<Props>()

    const containerRef = ref<HTMLDivElement | null>(null)
    const statusBars = ref<Array<{ status: string; estudiante?: Estudiante }>>([])
    const resizeObserver = ref<ResizeObserver | null>(null)

    const barWidth = 8
    const barGap = 2

    const { t } = useI18n()

    const updateStatusBars = () => {
    if (!containerRef.value) return

    const containerWidth = containerRef.value.offsetWidth
    const totalBarWidth = barWidth + barGap * 2
    const maxBars = Math.floor(containerWidth / totalBarWidth)

    // Create status data array with student information
    const statusData = props.estudiantes.map(estudiante => ({
            status: estudiante.calificaciones?.some(cal => cal.rubrica === props.nota.rubrica)
            ? 'graded'
            : 'pending',
            estudiante
        }))

        if (statusData.length === 0) {
            statusBars.value = []
            return
        }

        // If we have more students than can fit, take the most recent ones
        if (statusData.length > maxBars) {
            statusBars.value = statusData.slice(-maxBars)
        } else {
            statusBars.value = statusData
        }
    }

    watch(() => props.estudiantes, updateStatusBars, { deep: true })

    onMounted(() => {
        updateStatusBars()
        resizeObserver.value = new ResizeObserver(updateStatusBars)
        if (containerRef.value) resizeObserver.value.observe(containerRef.value)
    })

    onUnmounted(() => {
        if (resizeObserver.value && containerRef.value) {
            resizeObserver.value.unobserve(containerRef.value)
            resizeObserver.value.disconnect()
        }
    })

    const hoveredIndex = ref<number | null>(null)
</script>

<template>
  <div class="mt-2">
    <UDivider
      :ui="{
        border: {
          base: 'rounded border-Purple-P/20 dark:border-Muted-Brown/20'
        }
      }"
    />
    <div class="flex items-center gap-2 mt-2">
      <UIcon 
        name="fluent:document-checkmark-16-filled" 
        class="text-Purple-P dark:text-Muted-Brown"
      />
      <span class="text-sm font-medium text-Pure-Black dark:text-White-w">
        {{ t('analytics.grading_progress.title') }}
      </span>
    </div>

    <div
      ref="containerRef"
      class="relative flex h-4 w-full items-center overflow-visible mt-1"
    >
      <div
        v-for="(bar, index) in statusBars"
        :key="index"
        class="relative flex-shrink-0 h-4 transition-all duration-200 hover:scale-110"
        :style="{
          width: `${barWidth}px`,
          marginLeft: index === 0 ? '0px' : `${barGap}px`,
          marginRight: index === statusBars.length - 1 ? '0px' : `${barGap}px`,
          borderTopLeftRadius: index === 0 ? '4px' : '0px',
          borderBottomLeftRadius: index === 0 ? '4px' : '0px',
          borderTopRightRadius: index === statusBars.length - 1 ? '4px' : '0px',
          borderBottomRightRadius: index === statusBars.length - 1 ? '4px' : '0px',
        }"
        :class="{
          'bg-green-600 dark:bg-green-400 hover:bg-green-500 dark:hover:bg-green-300': bar.status === 'graded',
          'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600': bar.status === 'pending',
        }"
        @mouseover="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
      >
        <div
          v-if="index === hoveredIndex"
          class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-Warm-White dark:bg-Medium-Dark px-3 py-2 text-xs text-Pure-Black dark:text-White-w shadow-lg border border-Purple-P/20 dark:border-Muted-Brown/20 z-20 transition-all duration-200 animate-fade-in"
        >
          <div class="font-medium flex items-center gap-2">
            <UIcon 
              name="fluent:person-20-filled"
              class="text-Purple-P dark:text-Muted-Brown"
            />
            {{ bar.estudiante?.nombre }}
          </div>
          <div class="text-Light-Gray dark:text-MLight-White/50 mt-1 flex items-center gap-1">
            <UIcon 
              :name="bar.status === 'graded' ? 'fluent:checkmark-circle-16-filled' : 'fluent:clock-16-filled'"
              :class="bar.status === 'graded' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'"
              class="w-3.5 h-3.5"
            />
            {{ bar.status === 'graded' ? t('analytics.grading_progress.graded') : t('analytics.grading_progress.pending') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
   