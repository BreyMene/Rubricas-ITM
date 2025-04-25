<script setup lang="ts">
    import { useCursoStore } from "~/utils/store";

    const config = useRuntimeConfig();
    // Get the route object
    const route = useRoute();

    // Get the course ID from the route parameters
    const courseId = computed(() => route.params.id);

    // obtaining the course sendend by Pinia
    const curso = computed(() => useCursoStore().cursoActivo)

    const docentesCurso = computed<DocenteEnCurso[]>(() => 
        curso.value?.docentes || []
    )

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
        }
    ])

    const groups = ref<Grupo[]>([]);
    const fetchGroups = async () => {
        try {
            const data = await $fetch<Grupo[]>(
            `${config.public.apiUrl}/courses/groups/${courseId.value}`,
            );
            groups.value = data;
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    // Only call the api if Pinia doesn't have any course saved
    const fetchCourses = async () => {
        if (!useCursoStore().cursoActivo) {
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

    onMounted(() => {
        fetchGroups();
        fetchCourses();
    });

    function addGroup(g: Grupo) {
        groups.value.push(g);
    }

    // Controls the Views
    const showGroups = ref(true);

    // Altern between views
    const toggleView = () => {
        showGroups.value = !showGroups.value;

        // Reset search bar
        searchTerm.value = '';
    };

    // Icon State
    const currentIcon = computed(() =>
        showGroups.value ? 'fluent:people-community-12-filled' : 'fluent:book-32-filled'
    );

    // Placeholder text for the search bar
    const placeholderText = computed(() =>
        showGroups.value ? 'Buscar Grupo...' : 'Buscar Docente...'
    );

    // SEARCH BAR  ---------------
    const searchTerm = ref('');

    // Filtered groups based on search
    const filteredGroups = computed(() => {
        console.log(groups);

        if (!searchTerm.value) return groups.value;
        return groups.value.filter(group =>
            group.nombre.toLowerCase().includes(searchTerm.value) ||
            group.docente.correo.toLowerCase().includes(searchTerm.value)
        );
    });

    const handleSearch = (value: string) => {
        searchTerm.value = value;
    };
</script>

<template>
    <div class="container mx-auto p-6">
        <!-- Navigation -->
        <UBreadcrumb :links="items"
        :ui="{
            ol: 'gap-x-3', li: 'gap-x-3',
            active: 'text-Purple-P dark:text-Muted-Brown',
            inactive: 'text-Dark-Grey dark:text-Light-Gray hover:text-Pure-Black hover:dark:text-Warm-White'
        }">
            <template #divider>
                <UIcon name="fluent:chevron-right-12-filled" class="text-gray-500 dark:text-gray-400 w-4 h-4" />
            </template>
        </UBreadcrumb>

        <div class="flex flex-col lg:flex-row gap-16 mt-8">
            <!-- Group Section -->
            <div class="flex-1">
                <!-- Searchbar and Buttons -->
                <div class="mb-6">
                    <div class="mb-6 flex sm:flex-row gap-4 justify-between sm:items-center relative">
                        <transition
                            name="scale"
                            mode="out-in"
                        >
                            <UtilitiesSearchBar
                                :key="placeholderText"
                                :placeholderText="placeholderText"
                                @search="handleSearch"
                            />
                        </transition>

                        <div class="flex items-center gap-4">
                            <!-- Transition para el icono -->
                            <transition
                                name="scale"
                                mode="out-in"
                            >
                                <UIcon
                                    :key="currentIcon"
                                    :name="currentIcon"
                                    class="text-4xl hover:bg-Medium-Blue hover:dark:bg-Muted-Brown cursor-pointer"
                                    @click="toggleView"
                                />
                            </transition>

                            <!-- Transition para los botones de creación -->
                            <transition
                                name="scale"
                                mode="out-in"
                                >
                                <div :key="showGroups ? 'group-btn' : 'teacher-btn'" class="sm:relative fixed bottom-6 right-6 z-10 sm:z-auto sm:bottom-0 sm:right-0">
                                    <CreateGroup @addGroup="addGroup" v-if="showGroups"/>
                                    <CreateTeacher v-else/>
                                </div>
                            </transition>
                        </div>
                    </div>
                </div>

                <!-- Altern Between Groups or Teachers -->
                <!-- Groups -->
                <transition
                    name="slide"
                    mode="out-in"
                >
                    <!-- Grupos -->
                    <div v-if="showGroups" :key="'groups'" class="relative">
                        <!-- No Groups warning -->
                        <div v-if="!groups.length" class="flex items-center justify-center md:mt-24 lg:mt-36 mt-10">
                            <div class="relative w-80 h-52 flex flex-col items-center justify-center">
                                <!-- Corner decorations -->
                                <div class="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tl-lg"></div>
                                <div class="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tr-lg"></div>
                                <div class="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-bl-lg"></div>
                                <div class="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-br-lg"></div>

                                <UIcon name="fluent:warning-24-regular" class="text-6xl text-Purple-P dark:text-Muted-Brown mb-4" />
                                <p class="text-xl font-medium text-center text-Pure-Black dark:text-White-w">NO HAY<br>NINGUN GRUPO</p>
                            </div>
                        </div>

                        <TransitionGroup v-else
                            name="list"
                            tag="div"
                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            <UButton
                            v-for="group in filteredGroups"
                            :key="group._id"
                            variant="ghost"
                            class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-6 shadow-lg aspect-square flex flex-col justify-center items-center gap-2 hover:bg-MLight-White dark:hover:bg-Dark-Grey transition-colors duration-200"
                            @click="$router.push(`/Curso/${courseId}/Grupo/${group._id}`)"
                            >
                                <h3 class="text-lg font-medium text-center text-Pure-Black dark:text-White-w">{{ group.nombre }}</h3>
                                <p class="text-sm text-Medium-Gray dark:text-Light-Gray">Profesor encargado <br> {{ group.docente.correo }}</p>
                            </UButton>
                        </TransitionGroup>
                    </div>

                    <!-- Teachers Table -->
                    <div v-else :key="'teachers'">
                        <UtilitiesPeopleTable view="docentes" :searchTerm="searchTerm" :data="docentesCurso"/>
                    </div>
                </transition>
            </div>

            <!-- Rubric Preview -->
            <div class="w-full lg:w-[500px] h-[280px] bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4 shadow-lg flex flex-col relative z-1">
                <div class="w-full h-full rounded-lg overflow-hidden relative">
                    <NuxtImg
                        src="RubricaTest.PNG"
                        class="w-full h-full object-cover"
                        style="filter: blur(1.5px);"
                    />
                </div>

                <div class="absolute flex items-center justify-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div class="bg-Pure-Black/50 p-2 rounded-md">
                        <span class="text-white text-xl sm:text-2xl font-bold">Rubrica Guia</span>
                    </div>
                </div>

                <UButton size="lg" class="absolute bottom-4 sm:right-4 rounded-lg shadow-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray dark:text-White-w">
                    Modificar
                </UButton>
            </div>
        </div>
    </div>
</template>

<style scoped>
    /* Transition for Icons and Buttons */
    .scale-enter-active,
    .scale-leave-active {
    transition: transform 0.3s ease;
    }

    .scale-enter-from,
    .scale-leave-to {
    transform: scale(0.5);
    opacity: 0;
    }

    .scale-enter-to,
    .scale-leave-from {
    transform: scale(1);
    opacity: 1;
    }

    /* Slide Main Content */
    .slide-enter-active,
    .slide-leave-active {
    transition: all 0.3s ease-out;
    }

    .slide-enter-from {
    transform: translateX(-20px);
    opacity: 0;
    }

    .slide-leave-to {
    transform: translateX(20px);
    opacity: 0;
    }

    /* ------ Group Animations when the searchbar is used */
    .list-move,
    .list-enter-active,
    .list-leave-active {
        transition: all 0.3s ease;
    }

    .list-enter-from,
    .list-leave-to {
        opacity: 0;
        transform: translateY(20px);
    }

    .list-leave-active {
        position: absolute;
        width: calc(33.33% - 16px);
    }

    @media (max-width: 768px) {
        .list-leave-active {
            width: calc(50% - 16px);
        }
    }

    @media (max-width: 640px) {
        .list-leave-active {
            width: calc(100% - 16px);
        }
    }
</style>