<script setup lang="ts">

    // Get the route object
    const route = useRoute();

    // Get the course ID from the route parameters
    const courseId = computed(() => route.params.id);

    const groupId = computed(() => route.params.id);

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
            to: `/Curso/${groupId.value}`
        }
    ]

</script>

<template>
    <div class="container mx-auto p-6">
        <!-- Return Button and Curso id -->
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
        
        <div class="mt-6 sm:mt-10 flex sm:flex-row gap-4 sm:items-center relative">

            <UtilitiesSearchBar placeholderText="Buscar Grupo..."/>

            <UIcon name="fluent:people-community-12-filled" class="text-4xl hover:bg-Medium-Blue hover:dark:bg-Muted-Brown"/>

            <CreateGroup class="sm:relative fixed bottom-6 right-6 z-1 sm:z-auto sm:bottom-0 sm:right-0"/>
        </div>
    </div>
</template>

