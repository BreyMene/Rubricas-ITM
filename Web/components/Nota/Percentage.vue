<script setup lang="ts">
    import type { Nota } from '~/utils/types'

    interface Props {
        nota: Nota
        totalPercentage: number
        onSave: (nota: Nota, newPercentage: number) => Promise<void>
    }

    const props = defineProps<Props>()
    const config = useRuntimeConfig()
    const toast = useToast()

    const isEditing = ref(false)
    const editingValue = ref(0)

    const startEditing = () => {
        isEditing.value = true
        editingValue.value = props.nota.porcentaje
    }

    const cancelEditing = () => {
        isEditing.value = false
        editingValue.value = 0
    }

    const savePercentage = async () => {
        try {
            // Check if the value has actually changed
            if (editingValue.value === props.nota.porcentaje) {
                cancelEditing()
                return
            }

            // Calculate remaining percentage
            const remainingPercentage = 100 - (props.totalPercentage - props.nota.porcentaje)

            // Validate the value
            if (editingValue.value < 0 || editingValue.value > remainingPercentage) {
                toast.add({
                    title: 'Error',
                    description: `El porcentaje debe estar entre 0 y ${remainingPercentage}%`,
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
                return
            }

            await props.onSave(props.nota, editingValue.value)
            cancelEditing()
        } catch (error) {
            console.error("Error updating percentage:", error)
            toast.add({
                title: 'Error al actualizar el porcentaje',
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
</script>

<template>
    <div class="px-2 py-1 bg-Purple-P/10 dark:bg-Muted-Brown/10 rounded-lg">
        <span 
            v-if="!isEditing"
            class="text-sm font-medium text-Purple-P dark:text-Muted-Brown cursor-pointer hover:underline"
            @click="startEditing"
        >
            {{ nota.porcentaje }}%
        </span>
        
        <!-- Edit mode -->
        <div v-else class="flex items-center gap-1">
            <UInput
                v-model="editingValue"
                type="number"
                min="0"
                max="100"
                class="w-16"
                size="xs"
                :ui="{
                    ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                    color: {
                        gray: {
                            outline: 'shadow-md bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown',
                        },
                    },
                }"
                color="gray"
                @keydown.enter="savePercentage"
                @keydown.escape="cancelEditing"
            />
            <span class="text-xs text-Purple-P dark:text-Muted-Brown">%</span>
            <div class="flex gap-1 ml-1">
                <UButton
                    icon="fluent:checkmark-12-filled" 
                    color="green" 
                    variant="ghost"
                    class="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-150"
                    @click="savePercentage"
                />
                <UButton
                    icon="fluent:dismiss-12-filled" 
                    color="red" 
                    variant="ghost"
                    class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150"
                    @click="cancelEditing"
                />
            </div>
        </div>
    </div>
</template>
