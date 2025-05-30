<script setup lang="ts">
    import { useCursoStore } from '~/utils/store'
    import type { Estudiante, Rubrica, Nota, Grupo, Curso } from '~/utils/types'

    const route = useRoute();
    const config = useRuntimeConfig();
    const toast = useToast()

    // Load screen state
    const loadMg = ref('')
    const canLoadScreen = ref(false)
    const LoadingNotas = ref(false)

    // Get the course ID from the route parameters
    const courseId = computed(() => route.params.id);
    const groupId = computed(() => route.params.groupId);

    const curso = computed(() => useCursoStore().cursoActivo)
    const grupo = computed(() => useCursoStore().grupoActivo)

    const estudiantesGrupo = computed<Estudiante[]>(() => grupo.value?.estudiantes || []);
    const rubrics = ref<Rubrica[]>([]);
    const notas = ref<Nota[]>([]);
    const deletedRubrics = ref<Set<string>>(new Set());

    // Add modal state for deleted rubric
    const showDeletedRubricModal = ref(false);

    // Only call the api if Pinia doesn't have any course saved
    const fetchCourses = async () => {
        if (!curso.value || curso.value._id !== courseId.value) {
            try {
                const cursoApi = await $fetch<Curso>(
                    `${config.public.apiUrl}/courses/${courseId.value}`
                );
                useCursoStore().setCurso(cursoApi);
            } catch (error) {
                console.error("No se pudo obtener el curso:", error);
                toast.add({
                    title: 'Error al cargar el curso',
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
    }

    // Only call the api if Pinia doesn't have any group saved or if has another group saved
    const fetchGroup = async () => {
        if (!useCursoStore().grupoActivo || useCursoStore().grupoActivo?._id !== groupId.value) {
            try {
                const grupoApi = await $fetch<Grupo>(
                    `${config.public.apiUrl}/groups/${groupId.value}`
                );
                useCursoStore().setGrupo(grupoApi);
            } catch (error) {
                console.error("No se pudo obtener el grupo:", error);
                toast.add({
                    title: 'Error al cargar el grupo',
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
    }

    // Get the active rubric (first one that is active)
    const activeRubric = computed(() => rubrics.value.find(r => r.estado === 'activo') || null);

    // Modal states
    const showNewNotaModal = ref(false);
    const showStudentNotasModal = ref(false);
    const selectedStudent = ref<Estudiante | null>(null);

    // Delete modal
    const isDeleteModalOpen = ref(false);
    const selectedNota = ref<Nota | null>(null);


    // Navigation items
    const items = computed(() => [
        {
            label: 'Inicio',
            icon: 'fluent:home-12-filled',
            to: '/'
        },
        {
            label: `Curso ${curso.value?.nombre}` || 'Curso',
            icon: curso.value?.icono || 'fluent:book-32-filled',
            to: `/Curso/${courseId.value}`
        },
        {
            label: `Grupo ${grupo.value?.nombre}`,
            icon: 'fluent:book-32-filled',
            to: `/Curso/${courseId.value}/Grupo/${groupId.value}`
        },
        {
            label: 'Calificaciones',
            icon: 'fluent:document-edit-16-filled',
            to: `/Curso/${courseId.value}/Grupo/${groupId.value}/Calificaciones`
        }
    ]);

    // Function to open new nota modal
    const openNewNotaModal = () => {
        showNewNotaModal.value = true;
    };

    // Function to close new nota modal
    const closeNewNotaModal = () => {
        showNewNotaModal.value = false;
    };

    // Function to open student notas modal
    const openStudentNotasModal = (student: Estudiante) => {
        selectedStudent.value = student;
        showStudentNotasModal.value = true;
    };

    // Function to close student notas modal
    const closeStudentNotasModal = () => {
        showStudentNotasModal.value = false;
        selectedStudent.value = null;
    };

    // Function to create a new nota
    const createNota = async (rubrica: Rubrica) => {
        try {
            loadScreen('Creando nota...', true);
            const newNota: Nota = {
                _id: '', // Will be set by the backend
                numero: notas.value.length + 1,
                rubrica: rubrica._id,
                fecha: new Date().toISOString()
            };
            
            // Save to backend
            const updatedGroup = await $fetch<Grupo>(
                `${config.public.apiUrl}/grades/${groupId.value}/notas`,
                {
                    method: 'POST',
                    body: newNota
                }
            );

            // Update local state
            if (updatedGroup.notas) {
                notas.value = updatedGroup.notas;
            }
            
            closeNewNotaModal();
            loadScreen('', false);

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
            });
        } catch (error) {
            console.error("Error creating nota:", error);
            loadScreen('', false);
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
            });
        }
    };

    // Function to grade a nota for a student
    const gradeNota = async (nota: Nota) => {
        try {
            loadScreen('Preparando Notas...', true);
            
            if (!nota.rubrica || !nota.numero || !selectedStudent.value?.correo) {
                console.error('Missing required data:', { 
                    rubrica: nota.rubrica, 
                    notaNumero: nota.numero, 
                    estudiante: selectedStudent.value?.correo 
                });
                throw new Error('Missing required data for grading');
            }

            // Navigate to the grading page with the nota and student info
            navigateTo({
                path: '/CalificarRubrica',
                query: {
                    clone: nota.rubrica,
                    nota: nota.numero,
                    estudiante: selectedStudent.value.correo,
                    curso: courseId.value,
                    grupo: groupId.value
                }
            });
            closeStudentNotasModal();
            loadScreen('', false);
        } catch (error) {
            console.error("Error grading nota:", error);
            loadScreen('', false);
            toast.add({
                title: 'Error al preparar la calificación',
                description: 'No se pudo acceder a la página de calificación',
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
    };

    const loadScreen = (message: string, loadValue: boolean) => {
        loadMg.value = message
        canLoadScreen.value = loadValue
    }

    const fetchRubrics = async () => {
        try {
            LoadingNotas.value = true;
            const groupData = await $fetch<Grupo>(
                `${config.public.apiUrl}/groups/${groupId.value}`
            );
            
            // Get the full rubric data for each rubric ID
            const rubricPromises = groupData.rubricas.map(async rubric => {
                try {
                    const rubricData = await $fetch<Rubrica>(`${config.public.apiUrl}/rubrics/${rubric._id}`);
                    return rubricData;
                } catch (error) {
                    return null;
                }
            });
            const rubricResults = await Promise.all(rubricPromises);
            rubrics.value = rubricResults.filter(r => r !== null) as Rubrica[];

            // Also fetch the notas for this group
            if (groupData.notas) {
                notas.value = groupData.notas;
                
                // Check which rubrics in notas are not in the available rubrics
                const availableRubricIds = new Set(rubrics.value.map(r => r._id));
                deletedRubrics.value = new Set(
                    notas.value
                        .map(nota => nota.rubrica)
                        .filter(rubricId => !availableRubricIds.has(rubricId))
                );
            }

            LoadingNotas.value = false;
        } catch (error) {
            console.error("Error fetching rubrics:", error);
            toast.add({
                title: 'Error al cargar las rúbricas',
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
    };

    // Function to handle rubric view click
    const handleRubricView = (rubricId: string) => {
        if (deletedRubrics.value.has(rubricId)) {
            showDeletedRubricModal.value = true;
        } else {
            navigateTo(`/Rubrica/${rubricId}`);
        }
    };

    // Add delete function
    const deleteNota = async () => {
        try {
            loadScreen('Eliminando nota...', true);
            await $fetch(`${config.public.apiUrl}/grades/${groupId.value}/notas/${selectedNota.value?.numero}`, {
                method: 'DELETE'
            });
            
            // Update local state
            notas.value = notas.value.filter(n => n.numero !== selectedNota.value?.numero);
            
            isDeleteModalOpen.value = false;
            selectedNota.value = null;
            loadScreen('', false);

            // Add success toast
            toast.add({
                title: 'Nota eliminada exitosamente',
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
            console.error("Error deleting nota:", error);
            loadScreen('', false);
            // Add error toast
            toast.add({
                title: 'Error al eliminar la nota',
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
    };

    // Add function to open delete modal
    const openDeleteModal = (nota: Nota) => {
        selectedNota.value = nota;
        isDeleteModalOpen.value = true;
    };

    onMounted(async () => {
        try {
            LoadingNotas.value = true;
            await fetchCourses();
            await fetchGroup();
            await fetchRubrics();
        } catch (error) {
            console.error("Error loading initial data:", error);
        } finally {
            LoadingNotas.value = false;
        }
    });
</script>

<template>
    <div class="container mx-auto p-6">
        <!-- Navigation -->
        <UBreadcrumb :links="items" class="overflow-x-auto whitespace-nowrap"
            :ui="{
                ol: 'gap-x-2 flex-wrap text-sm md:text-base',
                li: 'gap-x-2 truncate max-w-[100px] md:max-w-none',
                active: 'text-Purple-P dark:text-Muted-Brown',
                inactive: 'text-Dark-Grey dark:text-Light-Gray hover:text-Pure-Black hover:dark:text-Warm-White'
            }">
            <template #divider>
                <UIcon name="fluent:chevron-right-12-filled" class="text-gray-500 dark:text-gray-400 w-4 h-4" />
            </template>
        </UBreadcrumb>

        <div class="mt-8">
            <!-- Notas List -->
            <div class="mb-2 relative min-h-[200px]">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold dark:text-white">Notas del Grupo</h2>
                    <div class="flex gap-2">
                        <ClientOnly>
                            <GradesEmailNotas :estudiantes="estudiantesGrupo" :notas="notas" />
                            <template #fallback>
                                <USkeleton
                                    class="w-[120px] h-[40px]"
                                    :ui="{
                                        base: 'animate-pulse',
                                        rounded: 'rounded-lg',
                                        background: 'bg-gray-200 dark:bg-gray-700',
                                    }"
                                />
                            </template>
                        </ClientOnly>
                        <UButton
                            icon="fluent:add-24-filled"
                            class="rounded-lg shadow-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray dark:text-White-w transition-all duration-300"
                            @click="openNewNotaModal"
                        >
                            Nueva Nota
                        </UButton>
                    </div>
                </div>
                
                <ClientOnly>
                    <!-- Show notas when loaded and not loading -->
                    <div v-if="!LoadingNotas && notas.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div v-for="nota in notas" :key="nota._id"
                            class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-150 hover:-translate-y-1">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-medium text-Pure-Black dark:text-White-w">
                                        Nota {{ nota.numero }}
                                    </h3>
                                    <p class="text-sm text-Light-Gray dark:text-MLight-White/50 mt-1">
                                        {{ new Date(nota.fecha).toLocaleDateString() }}
                                    </p>
                                    <div class="flex items-center gap-2 mt-2">
                                        <p class="text-sm text-Pure-Black dark:text-White-w">
                                            Rúbrica: {{ rubrics.find(r => r._id === nota.rubrica)?.nombre }}
                                        </p>
                                        <UIcon
                                            v-if="deletedRubrics.has(nota.rubrica)"
                                            name="fluent:warning-24-filled"
                                            class="w-5 h-5 text-red-500 animate-warning"
                                        />
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <UButton
                                        icon="fluent:eye-24-filled"
                                        color="gray"
                                        variant="ghost"
                                        class="hover:bg-Purple-P/10 dark:hover:bg-Muted-Brown/10 transition-colors duration-200"
                                        @click="handleRubricView(nota.rubrica)"
                                    />
                                    <UButton
                                        icon="fluent:delete-12-regular"
                                        color="red"
                                        variant="soft"
                                        class="transition-colors duration-200"
                                        @click="openDeleteModal(nota)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Show empty state when no notas and not loading -->
                    <div v-else-if="!LoadingNotas && !notas.length" class="text-center p-8">
                        <div class="relative w-80 h-52 flex flex-col items-center justify-center mx-auto">
                            <!-- Corner decorations -->
                            <div class="absolute top-0 -left-2 w-8 h-8 border-l-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tl-lg"></div>
                            <div class="absolute top-0 -right-2 w-8 h-8 border-r-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tr-lg"></div>
                            <div class="absolute bottom-0 -left-2 w-8 h-8 border-l-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-bl-lg"></div>
                            <div class="absolute bottom-0 -right-2 w-8 h-8 border-r-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-br-lg"></div>

                            <UIcon name="fluent:document-edit-16-filled" class="text-6xl text-Purple-P dark:text-Muted-Brown mb-4" />
                            <p class="text-xl font-medium text-center text-Pure-Black dark:text-White-w mb-2">NO HAY NOTAS</p>
                            <p class="text-sm text-Light-Gray dark:text-MLight-White/50 text-center">
                                Crea una nueva nota para comenzar a calificar a los estudiantes.
                            </p>
                        </div>
                    </div>

                    <!-- Skeleton Loader when loading -->
                    <template #fallback>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <USkeleton
                                v-for="i in 4" 
                                :key="i" 
                                class="w-full h-[120px]"
                                :ui="{
                                    base: 'animate-pulse',
                                    rounded: 'rounded-xl',
                                    background: 'bg-gray-200 dark:bg-gray-700',
                                }"
                            />
                        </div>
                    </template>
                </ClientOnly>
                
                <!-- Show skeleton when LoadingNotas is true -->
                <div v-if="LoadingNotas" class="flex items-center justify-center absolute inset-0">
                    <UtilitiesLoadingScreen
                        :isLoading="LoadingNotas"
                        message="Cargando Notas"
                        :noBackground="true"
                    />
                </div>
            </div>

            <!-- Students List -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-4 dark:text-white">Estudiantes</h2>
                <ClientOnly>
                    <!-- Show students when loaded and not loading -->
                    <div v-if="!LoadingNotas && estudiantesGrupo.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div v-for="student in estudiantesGrupo" :key="student.correo"
                            class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-150 hover:-translate-y-1">
                            <div class="flex items-center gap-3">
                                <div class="flex-shrink-0 w-12 h-12 rounded-full bg-Purple-P/10 dark:bg-Muted-Brown/10 flex items-center justify-center">
                                    <UIcon name="fluent:person-24-filled" class="text-2xl text-Purple-P dark:text-Muted-Brown" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-medium text-Pure-Black dark:text-White-w truncate">{{ student.nombre }}</h3>
                                    <p class="text-sm text-Light-Gray dark:text-MLight-White/50 truncate">{{ student.correo }}</p>
                                </div>
                                <div class="flex-shrink-0">
                                    <UButton
                                        icon="fluent:document-edit-16-filled"
                                        color="gray"
                                        variant="ghost"
                                        class="hover:bg-Purple-P/10 dark:hover:bg-Muted-Brown/10 transition-colors duration-200"
                                        @click="openStudentNotasModal(student)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Show empty state when no students and not loading -->
                    <div v-else-if="!LoadingNotas && !estudiantesGrupo.length" class="text-center p-8">
                        <div class="relative w-80 h-52 flex flex-col items-center justify-center mx-auto">
                            <!-- Corner decorations -->
                            <div class="absolute top-0 -left-2 w-8 h-8 border-l-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tl-lg"></div>
                            <div class="absolute top-0 -right-2 w-8 h-8 border-r-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tr-lg"></div>
                            <div class="absolute bottom-0 -left-2 w-8 h-8 border-l-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-bl-lg"></div>
                            <div class="absolute bottom-0 -right-2 w-8 h-8 border-r-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-br-lg"></div>

                            <UIcon name="fluent:person-24-filled" class="text-6xl text-Purple-P dark:text-Muted-Brown mb-4" />
                            <p class="text-xl font-medium text-center text-Pure-Black dark:text-White-w mb-2">NO HAY ESTUDIANTES</p>
                            <p class="text-sm text-Light-Gray dark:text-MLight-White/50 text-center">
                                Agrega estudiantes al grupo para poder calificarlos.
                            </p>
                        </div>
                    </div>

                    <!-- Skeleton Loader when loading -->
                    <template #fallback>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <USkeleton
                                v-for="i in 6" 
                                :key="i" 
                                class="w-full h-[80px]"
                                :ui="{
                                    base: 'animate-pulse',
                                    rounded: 'rounded-xl',
                                    background: 'bg-gray-200 dark:bg-gray-700',
                                }"
                            />
                        </div>
                    </template>
                </ClientOnly>
            </div>
        </div>

        <!-- New Nota Modal -->
        <UModal
            v-model="showNewNotaModal"
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
                            @click="closeNewNotaModal"
                        />
                    </div>
                </template>

                <div class="p-4">
                    <div v-if="activeRubric" class="space-y-6">
                        <div class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4">
                            <h4 class="text-lg font-medium text-Pure-Black dark:text-White-w mb-2">
                                Nota {{ notas.length + 1 }}
                            </h4>
                            <p class="text-sm text-Light-Gray dark:text-MLight-White/50">
                                Rúbrica: {{ activeRubric.nombre }}
                            </p>
                            <p class="text-sm text-Light-Gray dark:text-MLight-White/50 mt-2">
                                Se creará una nueva nota utilizando la rúbrica activa. Esta nota estará disponible para todos los estudiantes del grupo.
                            </p>
                        </div>

                        <div class="flex justify-end gap-3">
                            <UButton
                                variant="link" color="black"
                                @click="closeNewNotaModal"
                            >
                                Cancelar
                            </UButton>
                            <UButton
                                class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"
                                @click="createNota(activeRubric)"
                            >
                                Crear Nota
                            </UButton>
                        </div>
                    </div>
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
                                variant="link" color="black"
                                @click="closeNewNotaModal"
                            >
                                Cerrar
                            </UButton>
                        </div>
                    </div>
                </div>
            </UCard>
        </UModal>

        <!-- Student Notas Modal -->
        <UModal
            v-model="showStudentNotasModal"
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
                            Calificar Notas - {{ selectedStudent?.nombre }}
                        </h3>
                        <UButton
                            color="gray"
                            variant="ghost"
                            icon="fluent:dismiss-12-filled"
                            class="-my-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
                            @click="closeStudentNotasModal"
                        />
                    </div>
                </template>

                <div class="p-4">
                    <div v-if="notas.length" class="space-y-4">
                        <div v-for="nota in notas" :key="nota._id"
                            class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-medium text-Pure-Black dark:text-White-w">
                                        Nota {{ nota.numero }}
                                    </h4>
                                    <p class="text-sm text-Light-Gray dark:text-MLight-White/50 mt-1">
                                        {{ new Date(nota.fecha).toLocaleDateString() }}
                                    </p>
                                    <p class="text-sm text-Pure-Black dark:text-White-w mt-2">
                                        Rúbrica: {{ rubrics.find(r => r._id === nota.rubrica)?.nombre }}
                                    </p>
                                </div>
                                <UButton
                                    icon="fluent:edit-24-filled"
                                    class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"
                                    @click="gradeNota(nota)"
                                >
                                    Calificar
                                </UButton>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-center p-8">
                        <UIcon name="fluent:document-edit-16-filled" class="text-6xl text-Purple-P dark:text-Muted-Brown mb-4" />
                        <p class="text-Light-Gray dark:text-MLight-White/50 text-lg">No hay notas registradas</p>
                        <p class="text-Light-Gray dark:text-MLight-White/50 text-sm mt-2">Crea una nota para poder calificar</p>
                    </div>
                </div>
            </UCard>
        </UModal>

        <!-- Add Delete Confirmation Modal -->
        <UModal
            v-model="isDeleteModalOpen"
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
                        <UIcon name="fluent:warning-24-filled" class="text-red-500 text-2xl mr-2" />
                        <h3 class="text-lg font-semibold dark:text-white">Confirmar Eliminación</h3>
                    </div>
                    
                    <p class="mb-6 text-gray-700 dark:text-gray-300">
                        ¿Estás seguro que deseas eliminar la "Nota {{ selectedNota?.numero }}"? Esta acción es irreversible.
                    </p>
                    
                    <div class="flex justify-end gap-3">
                        <UButton 
                            variant="link" 
                            color="gray"
                            @click="isDeleteModalOpen = false"
                        >
                            Cancelar
                        </UButton>
                        <UButton 
                            color="red" 
                            @click="deleteNota"
                        >
                            Eliminar
                        </UButton>
                    </div>
                </div>
            </UCard>
        </UModal>

        <!-- Add Deleted Rubric Modal -->
        <UModal
            v-model="showDeletedRubricModal"
            :ui="{
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
                        <UIcon name="fluent:warning-24-filled" class="text-red-500 text-2xl mr-2" />
                        <h3 class="text-lg font-semibold dark:text-white">Rúbrica Eliminada</h3>
                    </div>
                    
                    <p class="mb-6 text-gray-700 dark:text-gray-300">
                        La rúbrica asociada a esta nota ha sido eliminada. No es posible ver su contenido.
                    </p>
                    
                    <div class="flex justify-end">
                        <UButton 
                            variant="link" 
                            color="gray"
                            @click="showDeletedRubricModal = false"
                        >
                            Cerrar
                        </UButton>
                    </div>
                </div>
            </UCard>
        </UModal>

        <UtilitiesLoadingScreen 
            v-if="!LoadingNotas"
            :isLoading="canLoadScreen"
            :message="loadMg"
        />
    </div>
</template>

<style scoped>
@keyframes warning {
    0%, 85%, 100% { transform: scale(1); }
    87.5% { transform: scale(1.2); }
    90% { transform: scale(1.2) rotate(-5deg); }
    92.5% { transform: scale(1.2) rotate(5deg); }
    95% { transform: scale(1.2) rotate(-5deg); }
    97.5% { transform: scale(1.2) rotate(5deg); }
}

.animate-warning {
    animation: warning 5s ease-in-out infinite;
}
</style> 