<script setup lang="ts">
    // Get the route object
    const route = useRoute();

    // Get the course ID from the route parameters
    const courseId = computed(() => route.params.id);

    const items = [
        {
            label: 'Inicio',
            icon: 'fluent:home-12-filled',
            to: '/'
        },
        {
            label: `Curso ${courseId.value}`,
            icon: 'fluent:book-32-filled',
            to: `/Curso/${courseId.value}`
        }
    ]

    const groups = ref<Grupo[]>([
        { id: 'A', nombre: 'Grupo A', manager: 'Juan Apellido', estudiantes: [] },
        { id: 'B', nombre: 'Grupo B', manager: 'Nose', estudiantes: [] },
        { id: 'C', nombre: 'Grupo C', manager: 'Nombre', estudiantes: [] },
        { id: 'D', nombre: 'Grupo D', manager: 'Pepito', estudiantes: []}
    ]);

    // Controls the Views 
    const showGroups = ref(true);
    
    // Altern between views
    const toggleView = () => {
        showGroups.value = !showGroups.value;
    };

    // Icon State
    const currentIcon = computed(() => 
        showGroups.value ? 'fluent:people-community-12-filled' : 'fluent:book-32-filled'
    );
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
                        <UtilitiesSearchBar placeholderText="Buscar Grupo..."/>
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
                                    <CreateGroup v-if="showGroups"/>
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
                    <div v-if="showGroups" :key="'groups'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <UButton 
                        v-for="group in groups" 
                        :key="group.id"
                        variant="ghost"
                        class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-6 shadow-lg aspect-square flex flex-col justify-center items-center gap-2 hover:bg-MLight-White dark:hover:bg-Dark-Grey transition-colors duration-200"
                        @click="$router.push(`/Curso/${courseId}/Grupo/${group.id}`)"
                        >
                        <h3 class="text-lg font-medium text-center text-Pure-Black dark:text-White-w">{{ group.nombre }}</h3>
                        <p class="text-sm text-Medium-Gray dark:text-Light-Gray">Profesor encargado <br> {{ group.manager }}</p>
                        </UButton>
                    </div>

                    <!-- Teachers Table -->
                    <div v-else :key="'teachers'">
                        <UtilitiesPeopleTable view="docentes"/>
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
    /* Transición de escala para iconos y botones */
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

    /* Transición de deslizamiento para el contenido principal */
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
</style>