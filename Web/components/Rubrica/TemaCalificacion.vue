<script setup lang="ts">
    import type { Tema } from '~/utils/types';
    import { useI18n } from 'vue-i18n'

    const props = defineProps<{ 
        tema: Tema, 
        temaIndex: number 
    }>();

    const { t } = useI18n()
</script>

<template>
    <div class="flex mb-4">
        <div class="w-[20%] p-3 flex items-center bg-MLight-White/50 rounded-lg dark:bg-Warm-Dark/30">
            <UTextarea
                v-model="tema.nombre"
                :rows="1"
                :placeholder="t('rubrica.tema_placeholder')"
                autoresize
                class="mr-2 flex-grow h-fit"
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
        </div>
        <div class="flex flex-col w-[80%]">
            <RubricaCriterioCalificacion 
                v-for="(row, index) in tema.criterios"
                :key="index"
                :row="row"
                :rowIndex="index"
            />
        </div>
    </div>
</template> 