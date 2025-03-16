<script setup lang="ts">
    import type { Criterio } from '~/utils/types';

    const props = defineProps<{
        row: Criterio,
        rowIndex: number
    }>();

    const emit = defineEmits(['deleteRow']);

    const deleteRow = () => emit('deleteRow', props.rowIndex);
</script>

<template>
    <div class="flex">
      <UInput
        v-model="row.criterio"
        placeholder="Criterio"
        class="flex-none w-[37%] p-3"
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
        type="number"
        v-model="row.peso"
        step="0.1"
        placeholder="Peso"
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
        type="number"
        v-model="row.calificacion"
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
        type="number"
        v-model="row.acumulado"
        placeholder="Acumulado"
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
      <div class="flex flex-grow p-3 items-center">
        <UInput
          v-model="row.observaciones"
          placeholder="Observaciones"
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
        <UButton
          icon="fluent:delete-12-regular"
          variant="ghost"
          color="red"
          size="xs"
          @click="deleteRow"
        />
      </div>
    </div>
</template>
