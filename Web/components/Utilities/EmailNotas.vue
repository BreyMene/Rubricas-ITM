<script setup lang="ts">
import type { Estudiante, Nota, Rubrica } from '~/utils/types'
import { useRoute } from 'vue-router'
import html2pdf from 'html2pdf.js'

const route = useRoute();
const props = defineProps<{
    estudiantes: Estudiante[],
    notas: Nota[]
}>();

const showSlideover = ref(false);
const emailSubject = ref('');
const emailBody = ref('');
const selectedStudents = ref<{ value: Estudiante }[]>([]);
const selectedNota = ref<Nota | undefined>(undefined);
const isSending = ref(false);

// Add refs for input elements
const subjectInput = ref<any>(null);
const bodyTextarea = ref<any>(null);

// Format students for USelectMenu
const studentOptions = computed(() =>
    props.estudiantes.map(student => ({
        value: student,
        label: student.nombre,
        description: student.correo,
        icon: 'fluent:person-24-filled'
    }))
);


const openSlideover = () => {
    showSlideover.value = true;
};

const closeSlideover = () => {
    if(isSending.value) return
    
    showSlideover.value = false;
    emailSubject.value = '';
    emailBody.value = '';
    selectedStudents.value = [];
    selectedNota.value = undefined;
};

const sendEmails = async () => {
    try {
        isSending.value = true;
        const config = useRuntimeConfig();

        if (!selectedNota.value?.numero) {
            throw new Error('No se ha seleccionado una nota');
        }

        // Store nota number and name for later use
        const notaNumero = selectedNota.value.numero;

        // For each selected student, generate their rubric PDF
        const emailPromises = []; // Array to hold email sending promises

        for (const studentOption of selectedStudents.value) {
            try {
                const student = studentOption.value;
                if (!student || !student.correo) {
                    console.error('Invalid student data:', studentOption);
                    continue;
                }

                // Replace placeholders with actual student name
                const personalizedSubject = emailSubject.value.replace(/{studentName}/g, student.nombre);
                const personalizedBody = emailBody.value.replace(/{studentName}/g, student.nombre);

                // First, get the rubric data
                const rubricData = await $fetch<Rubrica>(
                    `${config.public.apiUrl}/grades/${route.params.groupId}/notas/${notaNumero}/estudiante/${student.correo}`
                );

                // Generate PDF using html2pdf
                const element = document.createElement('div');
                element.innerHTML = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #ffffff;">

                        <!-- Header with student info -->
                        <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px 8px 0 0; margin-bottom: 20px; border: 1px solid #ddd; border-bottom: none;">
                            <h2 style="font-size: 20px; font-weight: bold; color: #2a3465; margin-bottom: 8px;">Rúbrica</h2>
                            <p style="font-size: 14px; color: #6b7280;">Estudiante: ${student.nombre}</p>
                        </div>

                        <!-- Rubric table -->
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 0 0 8px 8px; overflow: hidden;">
                            <thead>
                                <tr style="background-color: #f8f9fa;">
                                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; width: 20%; color: #000000;">Tema</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; width: 25%; color: #000000;">Criterio</th>
                                    <th style="padding: 12px; text-align: center; border-bottom: 1px solid #ddd; width: 10%; color: #000000;">Peso</th>
                                    <th style="padding: 12px; text-align: center; border-bottom: 1px solid #ddd; width: 10%; color: #000000;">Calificación</th>
                                    <th style="padding: 12px; text-align: center; border-bottom: 1px solid #ddd; width: 10%; color: #000000;">Acumulado</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; width: 25%; color: #000000;">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rubricData.temas.map(tema => `
                                    ${tema.criterios.map((criterio, index) => `
                                        <tr style="border-bottom: 1px solid #eee;">
                                            ${index === 0 ? `
                                                <td rowspan="${tema.criterios.length}" style="padding: 12px; border-right: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold; color: #000000;">
                                                    ${tema.nombre || ''}
                                                </td>
                                            ` : ''}
                                            <td style="padding: 12px; border-right: 1px solid #eee; color: #000000;">${criterio.criterio || ''}</td>
                                            <td style="padding: 12px; text-align: center; border-right: 1px solid #eee; color: #000000;">${criterio.peso || 0}</td>
                                            <td style="padding: 12px; text-align: center; border-right: 1px solid #eee; color: #000000;">${criterio.calificacion || 0}</td>
                                            <td style="padding: 12px; text-align: center; border-right: 1px solid #eee; color: #000000;">${((criterio.peso || 0) * (criterio.calificacion || 0)).toFixed(2)}</td>
                                            <td style="padding: 12px; color: #000000;">${criterio.observaciones || ''}</td>
                                        </tr>
                                    `).join('')}
                                `).join('')}
                                <!-- Totals row -->
                                <tr style="background-color: #f8f9fa; font-weight: bold;">
                                    <td style="padding: 12px; color: #000000;">Total</td>
                                    <td style="padding: 12px; color: #000000;"></td>
                                    <td style="padding: 12px; text-align: center; color: #000000;">${rubricData.temas.reduce((sum, tema) =>
                                        sum + tema.criterios.reduce((temaSum, criterio) => temaSum + (criterio.peso || 0), 0), 0).toFixed(1)}</td>
                                    <td style="padding: 12px; text-align: center; color: #000000;">${rubricData.temas.reduce((sum, tema) =>
                                        sum + tema.criterios.reduce((temaSum, criterio) => temaSum + (criterio.calificacion || 0), 0), 0).toFixed(1)}</td>
                                    <td style="padding: 12px; text-align: center; color: #000000;">${rubricData.temas.reduce((sum, tema) =>
                                        sum + tema.criterios.reduce((temaSum, criterio) => temaSum + ((criterio.peso || 0) * (criterio.calificacion || 0)), 0), 0).toFixed(1)}</td>
                                    <td style="padding: 12px; color: #000000;"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;

                // Generate PDF with optimized settings for smaller file size
                const opt = {
                    margin: [10, 10, 10, 10],
                    filename: `Rubrica-${student.nombre}.pdf`,
                    image: { type: 'jpeg', quality: 0.7 },
                    html2canvas: {
                        scale: 1.5,
                        useCORS: true,
                        logging: false,
                        letterRendering: false,
                        allowTaint: true,
                        backgroundColor: '#ffffff'
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'landscape',
                        compress: true
                    }
                };

                const pdfBlob = await html2pdf().set(opt).from(element).output('blob');

                // Return a new Promise that resolves when the email is sent
                emailPromises.push(new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(pdfBlob);
                    reader.onloadend = async () => {
                        try {
                            if (!reader.result || typeof reader.result !== 'string') {
                                throw new Error('Failed to read PDF data');
                            }
                            const base64data = reader.result.split(',')[1];

                            // Send email with PDF
                            await $fetch(`${config.public.apiUrl}/grades/${route.params.groupId}/notas/${notaNumero}/send-email`, {
                                method: 'POST',
                                body: {
                                    to: student.correo,
                                    studentName: student.nombre,
                                    rubricName: 'Rubrica',
                                    subject: personalizedSubject,
                                    body: personalizedBody,
                                    pdfBase64: base64data
                                }
                            });
                            resolve(undefined); // Resolve the promise when email is sent successfully
                        } catch (error) {
                            console.error(`Error sending email for ${student.nombre}:`, error);
                            reject(error); // Reject the promise if there's an error
                        }
                    };
                    reader.onerror = reject; // Reject the promise if FileReader encounters an error
                }));
            } catch (error) {
                console.error(`Error processing student ${studentOption.value.nombre}:`, error);
                // Continue with other students even if one fails
            }
        }

        // Wait for all email sending promises to resolve
        await Promise.all(emailPromises);

        isSending.value = false;
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

// Function to handle drag start
const handleDragStart = (event: DragEvent) => {
    if (event.dataTransfer) {
        event.dataTransfer.setData('text/plain', '{studentName}');
        event.dataTransfer.effectAllowed = 'copy';
    }
};

// Function to handle drop
const handleDrop = (event: DragEvent, field: 'subject' | 'body') => {
    event.preventDefault();
    const element = field === 'subject' ? subjectInput.value?.$el : bodyTextarea.value?.$el;
    if (!element) return;
    
    const input = element.querySelector('input, textarea');
    if (!input) return;
    
    // Get the current cursor position
    const cursorPosition = input.selectionStart;
    if (cursorPosition === null) return;
    
    // Get the current text
    const text = field === 'subject' ? emailSubject.value : emailBody.value;
    
    // Insert the placeholder at the cursor position
    const newValue = text.substring(0, cursorPosition) + '{studentName}' + text.substring(cursorPosition);
    
    if (field === 'subject') {
        emailSubject.value = newValue;
    } else {
        emailBody.value = newValue;
    }
    
    // Set cursor position after the inserted text
    nextTick(() => {
        input.focus();
        input.setSelectionRange(cursorPosition + '{studentName}'.length, cursorPosition + '{studentName}'.length);
    });
};

// Function to handle drag over
const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
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
                                ref="subjectInput"
                                v-model="emailSubject"
                                placeholder="Asunto del email"
                                class="w-full"
                                @dragover="handleDragOver"
                                @drop="(e: DragEvent) => handleDrop(e, 'subject')"
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
                                ref="bodyTextarea"
                                v-model="emailBody"
                                placeholder="Escribe tu mensaje aquí..."
                                class="w-full min-h-[200px]"
                                :rows="8"
                                autoresize
                                @dragover="handleDragOver"
                                @drop="(e: DragEvent) => handleDrop(e, 'body')"
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

                        <!-- Placeholder Buttons -->
                        <div class="flex flex-wrap gap-2 mt-4">
                            <UButton
                                size="sm"
                                color="gray"
                                variant="ghost"
                                icon="fluent:person-24-filled"
                                draggable="true"
                                @dragstart="handleDragStart"
                                class="text-Purple-P dark:text-Muted-Brown cursor-move hover:bg-Purple-P/10 dark:hover:bg-Muted-Brown/10"
                            >
                                Arrastrar nombre del estudiante
                            </UButton>
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