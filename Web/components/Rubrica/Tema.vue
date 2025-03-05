<script setup lang="ts">
    import { defineProps, defineEmits } from 'vue';
    import type { Tema } from '~/utils/types';

    const props = defineProps<{ 
        tema: Tema, 
        temaIndex: number 
    }>();

    const emit = defineEmits(['deleteTema', 'addRow', 'deleteRow']);

    const deleteTema = () => emit('deleteTema', props.temaIndex);
    const addRow = () => emit('addRow', props.temaIndex);
    const deleteRow = (rowIndex: number) => emit('deleteRow', props.temaIndex, rowIndex);
</script>

<template>
    <div class="flex">
        <div class="w-[20%] p-3 flex items-center bg-gray-50">
            <span v-if="!tema.isEditing" class="mr-2">{{ tema.nombre }}</span>
            <UTextarea v-else
                v-model="tema.nombre"
                :rows="1"
                placeholder="Nombre del Tema"
                @keyup.enter="tema.isEditing = false"
                autoresize
                class="mr-2 flex-grow h-fit"
            />
            <div class="flex space-x-2">
                <UButton 
                v-if="!tema.isEditing" 
                icon="i-heroicons-pencil-square" 
                variant="ghost" 
                color="gray"
                size="xs"
                @click="tema.isEditing = true"
                />
                <UButton 
                icon="i-heroicons-trash" 
                variant="ghost" 
                color="red"
                size="xs"
                @click="deleteTema()"
                />
            </div>
        </div>
        <div class="flex flex-col w-[80%]">
            <RubricaCriterio 
                v-for="(row, index) in tema.rows"
                :key="index"
                :row="row"
                :rowIndex="index"
                @deleteRow="deleteRow"
            />
        </div>
    </div>

    <div class="flex">
        <div class="w-[20%] p-3"></div> <!-- Espacio vacío para alinear con 'Tema' -->
        <div class="w-[80%] p-3">
            <UButton 
                icon="i-heroicons-plus" 
                variant="ghost" 
                color="primary"
                @click="addRow()"
            >
                Agregar Criterio
            </UButton>
        </div>
    </div>
</template>