<script setup lang="ts">
    import type { Criterio } from '~/utils/types';
    import { computed } from 'vue';

    const props = defineProps<{
        row: Criterio,
        rowIndex: number,
        isModerator?: boolean
    }>();

    const emit = defineEmits(['deleteRow']);

    const deleteRow = () => emit('deleteRow', props.rowIndex);

    const validatePeso = (value: number | string): number => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        
        // If value is NaN or invalid, return 0
        if (isNaN(numValue)) return 0;
        
        // Clamp value between 0 and 5
        return Math.max(0, Math.min(5, numValue));
    };

    const handlePesoInput = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const value = parseFloat(target.value);
        
        if (!isNaN(value)) {
            const validatedValue = validatePeso(value);
            if (validatedValue !== value) {
                target.value = validatedValue.toString();
                props.row.peso = validatedValue;
            }
        }
    };

    // Watch for changes in peso and validate
    watch(() => props.row.peso, (newValue) => {
        if (newValue !== undefined && newValue !== null) {
            const validatedValue = validatePeso(newValue);
            if (validatedValue !== newValue) {
                props.row.peso = validatedValue;
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
        placeholder="Criterio"
        class="flex-none w-[37%] p-3"
        color="gray"
        :disabled="!isModerator"
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
        placeholder="Peso"
        class="flex-none w-[12.4%] p-3 text-center"
        color="gray"
        :disabled="!isModerator"
        @input="handlePesoInput"
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
        disabled
        placeholder="Calificación"
        class="flex-none w-[12.4%] p-3 text-center"
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
          placeholder="Observaciones"
          class="flex-grow mr-2"
          color="gray"
          :disabled="!isModerator"
          :ui="{
              ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
              color: {
                  gray: {
                      outline: 'shadow-md bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                  }
              }
          }"
        />
        <UButton
          v-if="isModerator"
          icon="fluent:delete-12-regular"
          variant="ghost"
          color="red"
          size="xs"
          @click="deleteRow"
        />
      </div>
    </div>
</template>