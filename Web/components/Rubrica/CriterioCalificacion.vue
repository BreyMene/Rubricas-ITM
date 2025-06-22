<script setup lang="ts">
    import type { Criterio } from '~/utils/types';
    import { computed } from 'vue';
    import { useToast } from '#imports';
    import { useI18n } from 'vue-i18n'

    const props = defineProps<{
        row: Criterio,
        rowIndex: number
    }>();

    const toast = useToast();
    const { t } = useI18n()

    const validateCalificacion = (value: number | string): number => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        
        // If value is NaN or invalid, return 0
        if (isNaN(numValue)) return 0;
        
        // Clamp value between 0 and 1
        return Math.max(0, Math.min(1, numValue));
    };

    const handleCalificacionInput = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const value = parseFloat(target.value);
        
        if (!isNaN(value)) {
            const validatedValue = validateCalificacion(value);
            if (validatedValue !== value) {
                target.value = validatedValue.toString();
                props.row.calificacion = validatedValue;
                
                // Show toast notification
                toast.add({
                    title: t('rubrica.calificacion'),
                    description: t('rubrica.calificacion_placeholder'),
                    icon: "fluent:alert-urgent-16-filled",
                    timeout: 3000,
                    ui: {
                        'background': 'bg-Warm-White dark:bg-Medium-Dark',
                        'rounded': 'rounded-lg',
                        'shadow': 'shadow-lg',
                        'ring': 'ring-0',
                        'title': 'text-base font-semibold text-Pure-Black dark:text-White-w',
                        'description': 'mt-1 text-sm text-gray-500 dark:text-Light-Gray',
                        'icon': {
                            'base': 'flex-shrink-0 w-5 h-5',
                            'color': 'text-Purple-P dark:text-Muted-Brown'
                        },
                        'progress': {
                            'base': 'absolute bottom-0 end-0 start-0 h-1',
                            'background': 'bg-Purple-P/60 dark:bg-Muted-Brown/60'
                        },
                        'closeButton': {
                            'base': 'absolute top-2 right-2',
                            'icon': 'fluent:add-16-filled',
                            'color': 'text-gray-400 hover:text-gray-500 dark:text-Light-Gray dark:hover:text-White-w'
                        }
                    }
                });
            }
        }
    };

    watch(() => props.row.calificacion, (newValue) => {
        if (newValue !== undefined && newValue !== null) {
            const validatedValue = validateCalificacion(newValue);
            if (validatedValue !== newValue) {
                props.row.calificacion = validatedValue;
            }
        }
    });

    // Compute acumulado based on peso and calificacion
    const acumulado = computed(() => {
        return (props.row.peso || 0) * (props.row.calificacion || 0);
    });
</script>

<template>
    <div class="flex">
      <UInput
        v-model="row.criterio"
        :placeholder="t('rubrica.criterio_placeholder')"
        class="flex-none w-[37%] p-3"
        color="gray"
        disabled
        :ui="{
            ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
            color: {
                gray: {
                    outline: 'shadow-md bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                }
            }
        }"
      />
      <UInput
        type="number"
        v-model="row.peso"
        step="0.1"
        min="0"
        max="5"
        :placeholder="t('rubrica.peso_placeholder')"
        class="flex-none w-[12.4%] p-3 text-center"
        color="gray"
        disabled
        :ui="{
            ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
            color: {
                gray: {
                    outline: 'shadow-md bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                }
            }
        }"
      />
      <UInput
        type="number"
        v-model="row.calificacion"
        step="0.1"
        min="0"
        max="1"
        :placeholder="t('rubrica.calificacion_placeholder')"
        class="flex-none w-[12.4%] p-3 text-center"
        color="gray"
        @input="handleCalificacionInput"
        :ui="{
            ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
            color: {
                gray: {
                    outline: 'shadow-md bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                }
            }
        }"
      />
      <UInput
        :model-value="acumulado.toFixed(1)"
        disabled
        color="gray"
        class="flex-none w-[12.4%] p-3 text-center"
        :ui="{
            ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
            color: {
                gray: {
                    outline: 'shadow-md bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                }
            }
        }"
      />
      <div class="flex flex-grow p-3 items-center">
        <UInput
          v-model="row.observaciones"
          :placeholder="t('rubrica.observaciones_placeholder')"
          class="flex-grow mr-2"
          color="gray"
          :ui="{
              ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
              color: {
                  gray: {
                      outline: 'shadow-md bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                  }
              }
          }"
        />
      </div>
    </div>
</template> 