<script setup lang="ts">
    import type { Tema } from '~/utils/types';
    import { useI18n } from 'vue-i18n'

    const props = defineProps<{ 
        tema: Tema, 
        temaIndex: number,
        isModerator?: boolean
    }>();

    const emit = defineEmits(['deleteTema', 'addRow', 'deleteRow']);

    const { t } = useI18n()

    const deleteTema = () => emit('deleteTema', props.temaIndex);
    const addRow = () => emit('addRow', props.temaIndex);
    const deleteRow = (rowIndex: number) => emit('deleteRow', props.temaIndex, rowIndex);
</script>

<template>
    <div class="flex">
        <div class="w-[20%] p-3 flex items-center bg-MLight-White/50 rounded-lg dark:bg-Warm-Dark/30">
            <UTextarea
                v-model="tema.nombre"
                :rows="1"
                :placeholder="t('rubrica.tema_placeholder')"
                autoresize
                class="mr-2 flex-grow h-fit"
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
            <div class="flex space-x-2">
                <UButton 
                v-if="isModerator"
                icon="fluent:delete-12-regular" 
                variant="ghost" 
                color="red"
                size="xs"
                @click="deleteTema()"
                />
            </div>
        </div>
        <div class="flex flex-col w-[80%]">
            <RubricaCriterio 
                v-for="(row, index) in tema.criterios"
                :key="index"
                :row="row"
                :rowIndex="index"
                :isModerator="isModerator"
                @deleteRow="deleteRow"
            />
        </div>
    </div>

    <div class="flex">
        <div class="w-[20%] p-3"></div> <!-- Espacio vacío para alinear con 'Tema' -->
        <div class="w-[80%] p-3">
            <UButton 
                v-if="isModerator"
                icon="fluent:add-16-filled" 
                variant="ghost" 
                @click="addRow()"
                class="hover:bg-Light-Gray hover:text-White-w hover:dark:bg-Medium-Gray text-Pure-Black/55 dark:text-White-w"
            >
                {{ t('rubrica.add_criterio') }}
            </UButton>
        </div>
    </div>
</template>