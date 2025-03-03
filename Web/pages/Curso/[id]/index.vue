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

    const groups = ref([
        { id: 'A', name: 'Grupo A', manager: 'Juan Apellido' },
        { id: 'B', name: 'Grupo B', manager: 'Nose' },
        { id: 'C', name: 'Grupo C', manager: 'Nombre' },
        { id: 'D', name: 'Grupo D', manager: 'Pepito'}
    ]);

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
                            <UIcon name="fluent:people-community-12-filled" class="text-4xl hover:bg-Medium-Blue hover:dark:bg-Muted-Brown"/>
                            <CreateGroup class="sm:relative fixed bottom-6 right-6 z-10 sm:z-auto sm:bottom-0 sm:right-0"/>
                        </div>
                    </div>
                </div>

                <!-- Groups -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <UButton 
                    v-for="group in groups" 
                    :key="group.id"
                    variant="ghost"
                    class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-6 shadow-lg aspect-square flex flex-col justify-center items-center gap-2 hover:bg-MLight-White dark:hover:bg-Dark-Grey transition-colors duration-200"
                    @click="$router.push(`/Curso/${courseId}/Grupo/${group.id}`)"
                    >
                    <h3 class="text-lg font-medium text-center text-Pure-Black dark:text-White-w">{{ group.name }}</h3>
                    <p class="text-sm text-Medium-Gray dark:text-Light-Gray">Profesor encargado <br> {{ group.manager }}</p>
                    </UButton>
                </div>
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

