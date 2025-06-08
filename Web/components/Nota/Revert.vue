<script setup lang="ts">
import type { Estudiante, Nota } from '~/utils/types'

const props = defineProps<{
    nota: Nota
    student: Estudiante
    groupId: string
}>()

const config = useRuntimeConfig()
const toast = useToast()
const emit = defineEmits<{
    (e: 'loadingChange', isLoading: boolean, message: string): void
    (e: 'reverted'): void
}>()

// Add modal state
const isConfirmModalOpen = ref(false)

const handleRevertRubric = async () => {
    try {
        // Frontend validations
        if (!props.student || !props.student.calificaciones) {
            toast.add({
                title: 'Error al revertir la rúbrica',
                description: 'No se encontró la calificación del estudiante',
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
            return;
        }

        const calificacion = props.student.calificaciones.find(c => c.rubrica.toString() === props.nota.rubrica.toString());
        if (!calificacion) {
            toast.add({
                title: 'Error al revertir la rúbrica',
                description: 'No se encontró la calificación para esta nota',
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
            return;
        }

        emit('loadingChange', true, 'Revirtiendo rúbrica...');
        
        await $fetch(`${config.public.apiUrl}/grades/${props.groupId}/notas/${props.nota.numero}/revert/${props.student.correo}`, {
            method: "POST"
        });

        emit('loadingChange', false, '');
        emit('reverted');
        
        toast.add({
            title: 'Rúbrica revertida exitosamente',
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
        });
    } catch (error) {
        console.error("Error reverting rubric:", error);
        emit('loadingChange', false, '');
        toast.add({
            title: 'Error al revertir la rúbrica',
            description: 'Ocurrió un error al intentar revertir la rúbrica',
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
</script>

<template>
    <div>
        <UButton
            icon="fluent:arrow-reset-24-filled"
            color="gray"
            variant="ghost"
            class="hover:bg-Purple-P/10 dark:hover:bg-Muted-Brown/10 transition-colors duration-200"
            @click="isConfirmModalOpen = true"
        >
            Revertir
        </UButton>

        <!-- Confirmation Modal -->
        <UModal
            v-model="isConfirmModalOpen"
            prevent-close
            :ui="{
                wrapper: 'z-20',
                width: 'w-full sm:max-w-md',
                height: 'max-h-[700px]',
                container: 'flex items-center justify-center',
                overlay: { background: 'dark:bg-Light-Gray/15' },
            }"
        >
            <UCard :ui="{
                background: 'dark:bg-Medium-Dark',
                ring: '',
                divide: '',
                base: 'w-full',
            }">
                <div class="p-4">
                    <div class="flex items-center mb-4">
                        <UIcon name="fluent:warning-24-filled" class="text-yellow-500 text-2xl mr-2" />
                        <h3 class="text-lg font-semibold dark:text-white">Confirmar Reversión</h3>
                    </div>
                    
                    <p class="mb-6 text-gray-700 dark:text-gray-300">
                        ¿Estás seguro que deseas revertir la calificación de la "Nota {{ nota.numero }}" para {{ student.nombre }}? Esta acción restablecerá la calificación a su estado original.
                    </p>
                    
                    <div class="flex justify-end gap-3">
                        <UButton 
                            variant="link" 
                            color="gray"
                            @click="isConfirmModalOpen = false"
                        >
                            Cancelar
                        </UButton>
                        <UButton 
                            color="yellow" 
                            @click="() => {
                                isConfirmModalOpen = false;
                                handleRevertRubric();
                            }"
                        >
                            Revertir
                        </UButton>
                    </div>
                </div>
            </UCard>
        </UModal>
    </div>
</template>
