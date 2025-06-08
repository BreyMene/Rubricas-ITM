<script setup lang="ts">
    import type { Rubrica, Nota } from '~/utils/types'

    // Props
    interface Props {
        activeRubric: Rubrica | null
        notas: Nota[]
        groupId: string
        isLoading?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        isLoading: false
    })

    // Emits
    const emit = defineEmits<{
        notaCreated: [nota: Nota]
        loadingChange: [isLoading: boolean, message: string]
        error: [message: string]
    }>()

    // Composables
    const config = useRuntimeConfig()
    const toast = useToast()

    // State
    const showModal = ref(false)
    const notaPercentage = ref(0)

    // Methods for percentage validation
    const validatePercentage = (value: number | string): number => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        
        // If value is NaN or invalid, return 0
        if (isNaN(numValue)) return 0;
        
        // Clamp value between 0 and remaining percentage
        return Math.max(0, Math.min(remainingPercentage.value, numValue));
    };

    const handlePercentageInput = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const value = parseFloat(target.value);
        
        if (!isNaN(value)) {
            const validatedValue = validatePercentage(value);
            if (validatedValue !== value) {
                target.value = validatedValue.toString();
                notaPercentage.value = validatedValue;
                
                // Show toast notification
                toast.add({
                    title: 'Valor no válido',
                    description: `El valor debe estar entre 0 y ${remainingPercentage.value}%`,
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

    // Watch for percentage changes
    watch(notaPercentage, (newValue) => {
        if (newValue !== undefined && newValue !== null) {
            const validatedValue = validatePercentage(newValue);
            if (validatedValue !== newValue) {
                notaPercentage.value = validatedValue;
            }
        }
    });

    // Computed properties
    const nextNotaNumber = computed(() => props.notas.length + 1)

    const totalPercentage = computed(() => {
        return props.notas.reduce((sum, nota) => sum + nota.porcentaje, 0)
    })

    const remainingPercentage = computed(() => {
        return 100 - totalPercentage.value
    })

    // Methods
    const openModal = () => {
        showModal.value = true
    }

    const closeModal = () => {
        showModal.value = false
    }

    const handleCreateNota = async () => {
        if (!props.activeRubric) {
            emit('error', 'No hay rúbrica activa disponible')
            return
    }

    try {
        emit('loadingChange', true, 'Creando nota...')
        
        // Validate percentage
        if (totalPercentage.value + notaPercentage.value > 100) {
            toast.add({
                title: 'Error al crear la nota',
                description: `El porcentaje total no puede exceder 100%. Porcentaje actual: ${totalPercentage.value}%`,
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
        })
        emit('loadingChange', false, '')
            return
        }

        const newNota: Nota = {
            _id: '', // Will be set by the backend
            numero: nextNotaNumber.value,
            rubrica: props.activeRubric._id,
            fecha: new Date().toISOString(),
            porcentaje: notaPercentage.value
        }
        
        // Save to backend
        const updatedGroup = await $fetch<any>(
            `${config.public.apiUrl}/grades/${props.groupId}/notas`,
            {
                method: 'POST',
                body: newNota
            }
        )

        // Emit the updated notas
        emit('notaCreated', updatedGroup.notas[updatedGroup.notas.length - 1])
        
        closeModal()
        emit('loadingChange', false, '')

        // Add success toast
        toast.add({
            title: 'Nota creada exitosamente',
            icon: "fluent:checkmark-circle-16-filled",
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
        })
    } catch (error) {
        console.error("Error creating nota:", error)
        emit('loadingChange', false, '')
        emit('error', 'Error al crear la nota')
        
        // Add error toast
        toast.add({
            title: 'Error al crear la nota',
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
            })
        }
    }

    // Watch for modal close to reset percentage
    watch(showModal, (newValue) => {
        if (!newValue) {
            // Add a delay before resetting the value
            setTimeout(() => {
            notaPercentage.value = 0
            }, 300)
        }
    })
</script>

<template>
    <div>
      <UButton
        icon="fluent:add-24-filled"
        class="rounded-lg shadow-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray dark:text-White-w transition-all duration-300"
        @click="openModal"
      >
        Nueva Nota
      </UButton>
  
      <!-- Nueva Nota Modal -->
      <UModal
        v-model="showModal"
        :ui="{
          width: 'w-full sm:max-w-3xl',
          height: 'max-h-[700px]',
          container: 'flex items-center justify-center',
          overlay: { background: 'dark:bg-Light-Gray/15' },
        }"
      >
        <UCard
          :ui="{
            background: 'dark:bg-Medium-Dark',
            ring: '',
            divide: '',
            header: { base: 'border-b border-Purple-P dark:border-Dark-Grey' },
            base: 'w-full',
          }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold leading-6 dark:text-white">
                Nueva Nota
              </h3>
              <UButton
                color="gray"
                variant="ghost"
                icon="fluent:dismiss-12-filled"
                class="-my-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
                @click="closeModal"
              />
            </div>
          </template>
  
          <div class="p-4">
            <div v-if="activeRubric" class="space-y-6">
              <div class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4">
                <h4 class="text-lg font-medium text-Pure-Black dark:text-White-w mb-2">
                  Nota {{ nextNotaNumber }}
                </h4>
                <p class="text-sm text-Light-Gray dark:text-MLight-White/50">
                  Rúbrica: {{ activeRubric.nombre }}
                </p>
                <div class="mt-4">
                  <label class="block text-sm font-medium text-Pure-Black dark:text-White-w mb-2">
                    Porcentaje de la nota
                  </label>
                  <div class="flex items-center gap-2">
                    <UInput
                      v-model="notaPercentage"
                      type="number"
                      min="0"
                      :max="remainingPercentage"
                      step="0.1"
                      class="w-32"
                      @input="handlePercentageInput"
                      :ui="{
                        ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                        color: {
                          gray: {
                            outline:
                              'shadow-md bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown',
                          },
                        },
                      }"
                      color="gray"
                    />
                    <span class="text-sm text-Light-Gray dark:text-MLight-White/50">%</span>
                  </div>
                </div>

                <!-- Percentage Information Card -->
                <div class="mt-4 bg-Purple-P/10 dark:bg-Muted-Brown/10 rounded-lg p-4 border border-Purple-P/20 dark:border-Muted-Brown/20">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-Purple-P dark:text-Muted-Brown">Porcentaje Total Actual</span>
                    <span class="text-lg font-bold text-Purple-P dark:text-Muted-Brown">{{ totalPercentage }}%</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-Purple-P dark:text-Muted-Brown">Porcentaje Disponible</span>
                    <span class="text-lg font-bold text-Purple-P dark:text-Muted-Brown">{{ remainingPercentage }}%</span>
                  </div>
                </div>

                <p class="text-sm text-Light-Gray dark:text-MLight-White/50 mt-4">
                  Se creará una nueva nota utilizando la rúbrica activa. Esta nota estará disponible para todos los estudiantes del grupo.
                </p>
              </div>
  
              <div class="flex justify-end gap-3">
                <UButton
                  variant="link" 
                  color="black"
                  @click="closeModal"
                >
                  Cancelar
                </UButton>
                <UButton
                  class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray disabled:dark:bg-Medium-Gray disabled:bg-Light-Gray"
                  :disabled="notaPercentage <= 0 || notaPercentage > remainingPercentage"
                  @click="handleCreateNota"
                >
                  Crear Nota
                </UButton>
              </div>
            </div>
            
            <!-- No Active Rubric State -->
            <div v-else class="text-center p-8">
              <div class="relative w-80 h-52 flex flex-col items-center justify-center mx-auto">
                <!-- Corner decorations -->
                <div class="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tl-lg"></div>
                <div class="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tr-lg"></div>
                <div class="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-bl-lg"></div>
                <div class="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-br-lg"></div>
  
                <UIcon name="fluent:warning-24-regular" class="text-6xl text-Purple-P dark:text-Muted-Brown mb-4" />
                <p class="text-xl font-medium text-center text-Pure-Black dark:text-White-w mb-2">NO HAY RÚBRICA ACTIVA</p>
                <p class="text-sm text-Light-Gray dark:text-MLight-White/50 text-center">
                  Para crear una nota, primero debes activar una rúbrica en el grupo.
                </p>
              </div>
  
              <div class="flex justify-end mt-6">
                <UButton
                  variant="link" 
                  color="black"
                  @click="closeModal"
                >
                  Cerrar
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </UModal>
    </div>
  </template>