<script setup lang="ts">
import type { Estudiante, Nota } from '~/utils/types'
import { useRoute } from 'vue-router'

const route = useRoute();
const props = defineProps<{
    estudiantes: Estudiante[],
    notas: Nota[]
}>();

const showSlideover = ref(false);
const emailSubject = ref('');
const emailBody = ref('');
const selectedStudents = ref<Estudiante[]>([]);
const selectedNota = ref<Nota | undefined>(undefined);
const isSending = ref(false);

// Format students for USelectMenu
const studentOptions = computed(() => 
    props.estudiantes.map(student => ({
        value: student,
        label: student.nombre,
        description: student.correo,
        icon: 'fluent:person-24-filled'
    }))
);

// Format notas for USelectMenu
const notaOptions = computed(() => 
    props.notas.map(nota => ({
        value: nota,
        label: `Nota ${nota.numero}`,
        description: new Date(nota.fecha).toLocaleDateString(),
        icon: 'fluent:document-24-filled'
    }))
);

const openSlideover = () => {
    showSlideover.value = true;
};

const closeSlideover = () => {
    showSlideover.value = false;
    emailSubject.value = '';
    emailBody.value = '';
    selectedStudents.value = [];
    selectedNota.value = undefined;
};

const sendEmails = async () => {
    try {
        isSending.value = true;
        
        // For each selected student, generate their rubric PDF
        for (const student of selectedStudents.value) {
            // Navigate to the grading page to generate PDF
            const url = `/CalificarRubrica?clone=${selectedNota.value?.rubrica}&nota=${selectedNota.value?.numero}&estudiante=${student.correo}&curso=${route.params.id}&grupo=${route.params.groupId}`;
            
            // Open in a new tab to generate PDF
            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
                throw new Error('Could not open grading page');
            }

            // Wait for PDF generation
            await new Promise(resolve => setTimeout(resolve, 2000)); // Give time for PDF to generate
            
            // Close the window
            newWindow.close();
        }

        // Here you would implement the actual email sending logic with the generated PDFs
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        closeSlideover();
        
        // Show success toast
        const toast = useToast();
        toast.add({
            title: 'Emails enviados exitosamente',
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
        console.error("Error sending emails:", error);
        
        // Show error toast
        const toast = useToast();
        toast.add({
            title: 'Error al enviar los emails',
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
    } finally {
        isSending.value = false;
    }
};
</script>

<template>
    <div>
        <!-- Email Button -->
        <UButton
            icon="fluent:mail-24-filled"
            class="rounded-lg shadow-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray dark:text-White-w transition-all duration-300"
            @click="openSlideover"
        >
            Enviar Notas por Email
        </UButton>

        <!-- Slideover -->
        <USlideover prevent-close
            v-model="showSlideover"
            :ui="{
                width: 'w-full sm:max-w-2xl',
                background: 'bg-Warm-White dark:bg-Medium-Dark',
                overlay: { background: 'dark:bg-Light-Gray/15' },
            }"
        >
            <UCard
                :ui="{
                    background: 'bg-Warm-White dark:bg-Medium-Dark',
                    ring: '',
                    divide: '',
                    header: { base: 'border-b border-Purple-P dark:border-Dark-Grey' },
                    base: 'w-full h-full flex flex-col',
                }"
            >
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold leading-6 dark:text-white">
                            Enviar Notas por Email
                        </h3>
                        <UButton
                            color="gray"
                            variant="ghost"
                            icon="fluent:dismiss-12-filled"
                            class="-my-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
                            @click="closeSlideover"
                        />
                    </div>
                </template>

                <div class="flex-1 overflow-y-auto p-4">
                    <div class="space-y-6">
                        <!-- Students Selection -->
                        <div>
                            <label class="block text-sm font-medium text-Pure-Black dark:text-White-w mb-2">
                                Seleccionar Estudiantes
                            </label>
                            <USelectMenu
                                v-model="selectedStudents"
                                :options="studentOptions"
                                multiple
                                searchable
                                searchable-placeholder="Buscar estudiante..."
                                placeholder="Seleccionar estudiantes"
                                class="w-full"
                                :ui="{
                                    ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                                    color: {
                                        gray: {
                                            outline: 'shadow-lg bg-White-w dark:bg-Warm-Dark text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                        }
                                    }
                                }"
                                :ui-menu="{
                                    background: 'bg-White-w dark:bg-Medium-Dark',
                                    shadow: 'shadow-lg',
                                    rounded: 'rounded-lg',
                                    padding: 'p-1',
                                    ring: 'ring-0',
                                    input: 'text-sm placeholder-gray-400 dark:placeholder-gray-500 bg-White-w dark:bg-Warm-Dark text-Pure-Black dark:text-White-w rounded-lg',
                                    option: {
                                        base: 'flex items-center gap-2 cursor-pointer select-none relative py-2 pl-3 pr-9',
                                        active: 'bg-Purple-P/10 dark:bg-Muted-Brown/10',
                                        selected: 'text-Purple-P dark:text-Muted-Brown bg-Purple-P/5 dark:bg-Muted-Brown/5',
                                        disabled: 'cursor-default select-none',
                                        empty: 'text-sm text-gray-900 dark:text-white cursor-default select-none relative py-2 pl-3 pr-9',
                                        icon: {
                                            base: 'flex-shrink-0 h-5 w-5',
                                            active: 'text-Purple-P dark:text-Muted-Brown',
                                            inactive: 'text-gray-400 dark:text-gray-500'
                                        },
                                        selectedIcon: {
                                            wrapper: 'absolute inset-y-0 right-0 flex items-center pr-4',
                                            padding: 'pl-3 pr-9',
                                            base: 'h-5 w-5 text-Purple-P dark:text-Muted-Brown flex-shrink-0'
                                        }
                                    }
                                }"
                                color="gray"
                            >
                                <template #option="{ option }">
                                    <UIcon :name="option.icon" class="text-Purple-P dark:text-Muted-Brown" />
                                    <div class="flex flex-col">
                                        <span>{{ option.label }}</span>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">{{ option.description }}</span>
                                    </div>
                                </template>
                            </USelectMenu>
                        </div>

                        <!-- Nota Selection -->
                        <div>
                            <label class="block text-sm font-medium text-Pure-Black dark:text-White-w mb-2">
                                Seleccionar Nota
                            </label>
                            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                <div v-for="nota in props.notas" :key="nota._id"
                                    class="relative cursor-pointer"
                                    @click="selectedNota = selectedNota?._id === nota._id ? undefined : nota"
                                >
                                    <div class="bg-Warm-White dark:bg-Warm-Dark rounded-lg p-3 border transition-all duration-200"
                                        :class="[
                                            selectedNota?._id === nota._id 
                                                ? 'border-Purple-P dark:border-Muted-Brown shadow-md' 
                                                : 'border-gray-200 dark:border-Light-Gray/45 hover:border-Purple-P/50 dark:hover:border-Muted-Brown/50'
                                        ]"
                                    >
                                        <div class="flex items-center gap-2">
                                            <UIcon 
                                                name="fluent:document-24-filled" 
                                                class="text-Purple-P dark:text-Muted-Brown"
                                            />
                                            <div class="flex-1 min-w-0">
                                                <p class="font-medium text-Pure-Black dark:text-White-w truncate">
                                                    Nota {{ nota.numero }}
                                                </p>
                                                <p class="text-xs text-Light-Gray dark:text-MLight-White/50">
                                                    {{ new Date(nota.fecha).toLocaleDateString() }}
                                                </p>
                                            </div>
                                        </div>
                                        <div v-if="selectedNota?._id === nota._id" 
                                            class="absolute -top-1 -right-1 w-5 h-5 bg-Purple-P dark:bg-Muted-Brown rounded-full flex items-center justify-center"
                                        >
                                            <UIcon 
                                                name="fluent:checkmark-16-filled" 
                                                class="text-white w-3 h-3"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Email Subject -->
                        <div>
                            <label class="block text-sm font-medium text-Pure-Black dark:text-White-w mb-2">
                                Asunto
                            </label>
                            <UInput
                                v-model="emailSubject"
                                placeholder="Asunto del email"
                                class="w-full"
                                :ui="{
                                    ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                                    color: {
                                        gray: {
                                            outline: 'shadow-lg bg-White-w dark:bg-Warm-Dark text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                        }
                                    }
                                }"
                                color="gray"
                            />
                        </div>

                        <!-- Email Body -->
                        <div>
                            <label class="block text-sm font-medium text-Pure-Black dark:text-White-w mb-2">
                                Mensaje
                            </label>
                            <UTextarea
                                v-model="emailBody"
                                placeholder="Escribe tu mensaje aquí..."
                                class="w-full min-h-[200px]"
                                :ui="{
                                    ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                                    color: {
                                        gray: {
                                            outline: 'shadow-lg bg-White-w dark:bg-Warm-Dark text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                        }
                                    }
                                }"
                                color="gray"
                            />
                        </div>

                        <!-- Preview Section -->
                        <div class="bg-White-w dark:bg-Warm-Dark rounded-lg p-4 border border-Purple-P/20 dark:border-Muted-Brown/20">
                            <h4 class="text-sm font-medium text-Pure-Black dark:text-White-w mb-2">
                                Vista Previa
                            </h4>
                            <p class="text-sm text-Light-Gray dark:text-MLight-White/50">
                                Se adjuntarán las notas de los estudiantes seleccionados como PDF.
                            </p>
                        </div>
                    </div>
                </div>

                <template #footer>
                    <div class="flex justify-end gap-3">
                        <UButton
                            variant="link"
                            color="gray"
                            @click="closeSlideover"
                            :disabled="isSending"
                        >
                            Cancelar
                        </UButton>
                        <UButton
                            class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400"
                            :disabled="!selectedStudents.length || !emailSubject || !emailBody || !selectedNota || isSending"
                            :loading="isSending"
                            @click="sendEmails"
                        >
                            Enviar Emails
                        </UButton>
                    </div>
                </template>
            </UCard>
        </USlideover>
    </div>
</template> 