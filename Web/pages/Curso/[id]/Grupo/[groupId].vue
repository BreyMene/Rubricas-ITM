<script setup lang="ts">

    // Get the route object
    const route = useRoute();

    // Get the course ID from the route parameters
    const courseId = computed(() => route.params.id);

    const groupId = computed(() => route.params.groupId);

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
        },
        {
            label: `Grupo ${groupId.value}`,
            icon: 'fluent:book-32-filled',
            to: `/Curso/${courseId.value}/Grupo/${groupId.value}`
        }
    ]

    // SEARCH BAR ----------
    const searchTerm = ref('');

    const handleSearch = (value: string) => {
        searchTerm.value = value;
    };

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
                        <CreateStudent class="sm:relative fixed bottom-6 right-6 z-10 sm:z-auto sm:bottom-0 sm:right-0"/>
                    </div>
                </div>

                <!-- Content -->
                <UtilitiesPeopleTable view="estudiantes" :searchTerm="searchTerm" :data="[]"/>
            </div>

            <!-- Rubric -->
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

