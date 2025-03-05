<!-- pages/rubricas.vue -->
<template>
    <div class="container mx-auto p-4">
      <div class="bg-white shadow-lg rounded-lg overflow-visible">
        <div class="sticky top-0 flex bg-gray-100 font-bold text-gray-700 p-3 border-b z-10">
          <div class="flex-none w-[20%] px-3">Tema</div>
          <div class="flex-none w-[30%] px-3">Criterio</div>
          <div class="flex-none w-[10%] px-3">Peso</div>
          <div class="flex-none w-[10%] px-3">Calificación</div>
          <div class="flex-none w-[10%] px-3">Acumulado</div>
          <div class="flex-none w-[20%] px-3">Observaciones</div>
        </div>
  
        <div v-if="temas.length === 0" class="text-center p-4 text-gray-500">
          No hay temas. 
        </div>
  
        <div v-for="(tema, temaIndex) in temas" :key="temaIndex" class="border-b">
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
                    @click="deleteTema(temaIndex)"
                  />
                </div>
            </div>
            
            <div class="flex flex-col w-[80%]">
              <div v-for="(row, index) in tema.rows" class="flex">
                  <UInput 
                    v-model="row.criterio" 
                    placeholder="Criterio"
                    class="flex-none w-[37%] p-3"
                  />
                  <UInput 
                    type="number" 
                    v-model="row.peso" 
                    step="0.1"
                    placeholder="Peso"
                    class="flex-none w-[12.4%] p-3 text-center"
                  />
                  <UInput 
                    type="number" 
                    v-model="row.calificacion" 
                    placeholder="Calificación"
                    class="flex-none w-[12.4%] p-3 text-center"
                  />
                  <UInput 
                    type="number" 
                    v-model="row.acumulado" 
                    placeholder="Acumulado"
                    class="flex-none w-[12.4%] p-3 text-center"
                  />
                  <div class="flex flex-grow p-3 items-center">
                    <UInput 
                      v-model="row.observaciones" 
                      placeholder="Observaciones"
                      class="flex-grow mr-2"
                    />
                    <UButton 
                      icon="i-heroicons-trash" 
                      variant="ghost" 
                      color="red"
                      size="xs"
                      @click="deleteRow(temaIndex, 0)"
                    />
                </div>
              </div>
            </div>
          </div>

        <div class="flex">
          <div class="w-[20%] p-3"></div> <!-- Espacio vacío para alinear con 'Tema' -->
          <div class="w-[80%] p-3">
            <UButton 
              icon="i-heroicons-plus" 
              variant="ghost" 
              color="primary"
              @click="addRow(temaIndex)"
            >
              Agregar Criterio
            </UButton>
          </div>
        </div>

        </div>
      </div>

      <div class="flex justify-end p-4">
        <UButton 
          icon="i-heroicons-plus" 
          color="primary"
          size="lg"
          class="shadow-lg"
          @click="addTema"
        >
          Agregar Tema
        </UButton>
      </div>
    </div>

  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  interface RubricaRow {
    criterio: string
    peso: number
    calificacion: number
    acumulado: number
    observaciones: string
  }
  
  interface Tema {
    nombre: string
    isEditing: boolean
    rows: RubricaRow[]
  }
  
  const temas = ref<Tema[]>([])
  
  function addTema() {
    temas.value.push({
      nombre: '',
      isEditing: true,
      rows: []
    })
  }
  
  function addRow(temaIndex: number) {
    temas.value[temaIndex].rows.push({
      criterio: '',
      peso: 0,
      calificacion: 0,
      acumulado: 0,
      observaciones: ''
    })
  }
  
  function deleteTema(temaIndex: number) {
    temas.value.splice(temaIndex, 1)
  }
  
  function deleteRow(temaIndex: number, rowIndex: number) {
    temas.value[temaIndex].rows.splice(rowIndex, 1)
  }
  </script>