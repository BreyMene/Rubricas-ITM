<script setup lang="ts">
    import { useCursoStore } from '~/utils/store'

    // Get the route object
    const route = useRoute();
    const config = useRuntimeConfig();

    // Get the course ID from the route parameters
    const courseId = computed(() => route.params.id);
    const groupId = computed(() => route.params.groupId);

    const curso = computed(() => useCursoStore().cursoActivo)
    const grupo = computed(() => useCursoStore().grupoActivo)
    const docenteID = useDocenteStore().getID;
    const isModerator = computed(() => grupo.value?.docente._id === docenteID);

    const estudiantesGrupo = computed<Estudiante[]>(() => grupo.value?.estudiantes || []);
    
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
        }
    ])

    // Only call the api if Pinia doesn't have any course saved
    const fetchCourses = async () => {
        if (!curso.value || curso.value._id !== courseId.value) {
            try {
                const cursoApi = await $fetch<Curso>(
                    `${config.public.apiUrl}/courses/get/${courseId.value}`
                );
                useCursoStore().setCurso(cursoApi);
            } catch (error) {
                console.error("No se pudo obtener el curso:", error);
            }
        }
    }

    // Only call the api if Pinia doesn't have any group saved or if has another group saved
    const fetchGroup = async () => {
        if (!useCursoStore().grupoActivo || useCursoStore().grupoActivo?._id !== groupId.value) {
            try {
                const grupoApi  = await $fetch<Grupo>(
                    `${config.public.apiUrl}/groups/${groupId.value}`
                );
                useCursoStore().setGrupo(grupoApi);
            } catch (error) {
                console.error("No se pudo obtener el curso:", error);
            }
        }
    }

    // SEARCH BAR ----------
    const searchTerm = ref('');

    const handleSearch = (value: string) => {
        searchTerm.value = value;
    };

    const rubrics = ref<Rubrica[]>([]);
    const showRubricModal = ref(false);
    const loadingRubrics = ref(true);
    const lastEditedRubric = ref<string | null>(null);

    // Add computed properties for toggle states
    const getRubricState = (rubric: Rubrica) => computed({
        get: () => rubric.estado === 'activo',
        set: (value) => toggleRubricState(rubric._id, rubric.estado)
    });

    // Get the active rubric (first one that is active)
    const activeRubric = computed(() => rubrics.value.find(r => r.estado === 'activo') || null);

    // Get the last edited rubric or first non-active rubric
    const displayRubric = computed(() => {
        if (activeRubric.value) return activeRubric.value;
        if (lastEditedRubric.value) {
            const lastEdited = rubrics.value.find(r => r._id === lastEditedRubric.value);
            if (lastEdited) return lastEdited;
        }
        return rubrics.value[0] || null;
    });

    const fetchRubrics = async () => {
        try {
            loadingRubrics.value = true;
            // Get the group data which includes its rubrics
            const groupData = await $fetch<Grupo>(
                `${config.public.apiUrl}/groups/${groupId.value}`
            );
            // Get the full rubric data for each rubric ID
            const rubricPromises = groupData.rubricas.map(rubric => 
                $fetch<Rubrica>(`${config.public.apiUrl}/rubrics/${rubric._id}`)
            );
            const rubricData = await Promise.all(rubricPromises);
            rubrics.value = rubricData;
        } catch (error) {
            console.error("Error fetching rubrics:", error);
        } finally {
            loadingRubrics.value = false;
        }
    };

    const toggleRubricState = async (rubricId: string, currentState: string) => {
        try {
            const newState = currentState === 'activo' ? 'inactivo' : 'activo';
            
            // If we're activating a rubric, first deactivate all others
            if (newState === 'activo') {
                // Find all active rubrics except the current one
                const activeRubrics = rubrics.value.filter(r => r.estado === 'activo' && r._id !== rubricId);
                
                // Deactivate all other active rubrics
                for (const rubric of activeRubrics) {
                    await $fetch(`${config.public.apiUrl}/rubrics/${rubric._id}`, {
                        method: "PUT",
                        body: {
                            estado: 'inactivo'
                        }
                    });
                }
            }
            
            // Update the current rubric's state
            await $fetch(`${config.public.apiUrl}/rubrics/${rubricId}`, {
                method: "PUT",
                body: {
                    estado: newState
                }
            });
            
            lastEditedRubric.value = rubricId;
            // Refresh the rubrics
            await fetchRubrics();
        } catch (error) {
            console.error("Error toggling rubric state:", error);
        }
    };

    onMounted(() => {
        fetchCourses();
        fetchGroup();
        fetchRubrics();
    });

    const handleUserDeletion = async(correo: string) => {
        try {
            await $fetch(`${config.public.apiUrl}/groups/${groupId.value}/user/${correo}`, {
                method: "DELETE"
            });
            
            //Update the store with the filtered students list
            if (grupo.value && grupo.value.estudiantes) {
                const updatedEstudiantes = grupo.value.estudiantes.filter(
                    estudiante => estudiante.correo !== correo
                );
                
                useCursoStore().updateGrupoEstudiantes(updatedEstudiantes);
            }
        } catch (error) {
            console.error("No se pudo eliminar estudiante", error);
        }
    };

    const handleEditUser = async(correo: string, field: string, newValue: string) => {
        try {
            await $fetch(`${config.public.apiUrl}/groups/${groupId.value}/user/${correo}`, {
                method: "PUT",
                body: {
                    field,
                    value: newValue
                }
            });
            
            // Update the local store
            if (grupo.value && grupo.value.estudiantes) {
                const updatedEstudiantes = grupo.value.estudiantes.map(estudiante => {
                    if (estudiante.correo === correo) {
                        return { ...estudiante, [field]: newValue };
                    }
                    return estudiante;
                });
                useCursoStore().updateGrupoEstudiantes(updatedEstudiantes);
            }
        } catch (error) {
            console.error("No se pudo actualizar el estudiante", error);
        }
    };

    // LOAD SCREEN
    const loadMg = ref('')
    const canLoadScreen = ref(false)

    const loadScreen = (message: string, loadValue: boolean) => {
        loadMg.value = message
        canLoadScreen.value = loadValue
    }
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

        <div class="flex flex-col lg:flex-row gap-16 mt-8">
            <div class="flex-1">
                <!-- Searchbar and Buttons -->
                <div class="mb-6">
                    <div class="mb-6 flex sm:flex-row gap-4 justify-between sm:items-center relative">
                        <UtilitiesSearchBar placeholderText="Buscar Estudiante..." @search="handleSearch"/>
                        <div class="flex items-center gap-2">
                            <UtilitiesGroupSettings v-if="isModerator" @load-screen="loadScreen"/>
                            <UButton
                                v-if="isModerator"
                                size="lg"
                                icon="fluent:document-edit-16-filled"
                                class="rounded-lg shadow-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray dark:text-White-w transition-colors duration-150"
                                @click="navigateTo(`/Curso/${courseId}/Grupo/${groupId}/Calificaciones`)"
                            >
                                Calificaciones
                            </UButton>
                            <CreateStudent v-if="isModerator" class="sm:relative fixed bottom-6 right-6 z-10 sm:z-auto sm:bottom-0 sm:right-0"/>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <UtilitiesPeopleTable view="estudiantes" :searchTerm="searchTerm" :data="estudiantesGrupo" @delete-user="handleUserDeletion" :isModerator="isModerator" @edit-user="handleEditUser"/>
            </div>

            <!-- Rubric -->
            <div class="w-full lg:w-[500px] h-[280px] bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4 shadow-lg flex flex-col relative z-1">
                <div v-if="rubrics.length > 0" class="w-full h-full rounded-lg overflow-hidden relative">
                    <NuxtImg
                        src="RubricaTest.PNG"
                        class="w-full h-full object-cover"
                        style="filter: blur(1.5px)"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div class="absolute bottom-4 left-4 right-4">
                        <div class="flex items-center justify-between gap-3">
                        <div class="flex flex-col items-start gap-2">
                            <h3 class="text-lg font-semibold text-white truncate">{{ displayRubric?.nombre }}</h3>
                            <UToggle v-if="isModerator"
                            v-model="getRubricState(displayRubric).value"
                            on-icon="fluent:checkmark-circle-24-filled"
                            off-icon="fluent:dismiss-circle-24-filled"
                            :ui="{
                                base: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                active: 'bg-green-600 dark:bg-green-400',
                                inactive: 'bg-red-600 dark:bg-red-400',
                            }"
                            />
                        </div>
                        </div>
                    </div>
                </div>
                <div v-else-if="!loadingRubrics" class="w-full h-full rounded-lg overflow-hidden relative flex items-center justify-center">
                    <div class="relative w-80 h-52 flex flex-col items-center justify-center transition-colors duration-150">
                        <!-- Corner decorations -->
                        <div class="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tl-lg transition-colors duration-150"></div>
                        <div class="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tr-lg transition-colors duration-150"></div>
                        <div class="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-bl-lg transition-colors duration-150"></div>
                        <div class="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-br-lg transition-colors duration-150"></div>

                        <UIcon
                            name="fluent:warning-24-regular"
                            class="text-6xl text-Purple-P dark:text-Muted-Brown mb-4"
                        />
                        <p class="text-xl font-medium text-center text-Pure-Black dark:text-White-w transition-colors duration-150">
                            NO HAY<br />NINGUNA RÚBRICA
                        </p>
                    </div>
                </div>

                <div class="absolute bottom-4 right-4 flex gap-2">
                    <UButton
                        v-if="rubrics.length > 0"
                        size="lg"
                        class="rounded-lg shadow-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray dark:text-White-w transition-colors duration-150"
                        @click="$router.push(`/Rubrica/${displayRubric?._id}`)"
                    >
                        Modificar
                    </UButton>
                    <UButton
                        v-if="rubrics.length > 1"
                        size="lg"
                        class="rounded-lg shadow-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray dark:text-White-w transition-colors duration-150"
                        @click="showRubricModal = true"
                    >
                        Ver más
                    </UButton>
                </div>

                <!-- Add loading screen -->
                <UtilitiesLoadingScreen
                    :isLoading="loadingRubrics"
                    message="Cargando rúbricas..."
                    :noBackground="true"
                    :noSpinnerBackground="true"
                    spinnerSize="sm"
                />
            </div>
        </div>

        <!-- Load Screen -->
        <UtilitiesLoadingScreen
        :isLoading="canLoadScreen"
        :message="loadMg"
        :fullscreen="true"
        />

        <!-- Add the UModal for other rubrics -->
        <UModal
            v-model="showRubricModal"
            prevent-close
            :ui="{
                width: 'max-w-xs sm:max-w-3xl',
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
                            Todas las Rúbricas
                        </h3>
                        <UButton
                            color="gray"
                            variant="ghost"
                            icon="fluent:dismiss-12-filled"
                            class="-my-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
                            @click="showRubricModal = false"
                        />
                    </div>
                </template>

                <div class="p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            v-for="rubric in rubrics"
                            :key="rubric._id"
                            class="bg-Warm-White dark:bg-Warm-Dark rounded-lg p-4 shadow-md"
                        >
                            <div class="flex items-center justify-between">
                                <h4 class="text-sm font-medium text-Pure-Black dark:text-White-w truncate">{{ rubric.nombre }}</h4>
                                <UToggle
                                    v-model="getRubricState(rubric).value"
                                    on-icon="fluent:checkmark-circle-24-filled"
                                    off-icon="fluent:dismiss-circle-24-filled"
                                    :ui="{
                                        base: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                        active: 'bg-green-600 dark:bg-green-400',
                                        inactive: 'bg-red-600 dark:bg-red-400',
                                    }"
                                />
                            </div>
                            <UButton
                                size="sm"
                                class="mt-2 w-full bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray dark:text-White-w"
                                @click="$router.push(`/Rubrica/${rubric._id}`)"
                            >
                                Ver detalles
                            </UButton>
                        </div>
                    </div>
                </div>
            </UCard>
        </UModal>
    </div>
</template>

