<script setup lang="ts">

    // Props
    const props = defineProps<{
        view: "docentes" | "estudiantes";
        hideFinalNote?: boolean;
    }>();

    // Teachers data
    const teachers = ref<{ email: string }[]>([]);

    teachers.value = [{
            email: 'ejemplo@correo.itm.edu.co'
        },
        {
            email: 'ejemplo@correo.itm.edu.co'
        },
        {
            email: 'ejemplo@correo.itm.edu.co'
        },
        {
            email: 'ejemplo@correo.itm.edu.co'
        },
        {
            email: 'ejemplo@correo.itm.edu.co'
        },
        {
            email: 'ejemplo@correo.itm.edu.co'
        }
    ]

    // Students data
    const students = ref<{ name: string; email: string; finalNote: number }[]>([]);

    students.value = [{
            name: 'Pepito Perez',
            email: 'pepitoperez1245@correo.itm.edu.co',
            finalNote: 3.8
        },{
            name: 'Vanesa Van',
            email: 'vanesavan8456@correo.itm.edu.co',
            finalNote: 4.0
        },{
            name: 'Yo apellido',
            email: 'yoapellido1236@correo.itm.edu.co',
            finalNote: 4.1
        }
    ]

    // Change columns depends of the view
    const columns = computed(() => {
        if (props.view === "docentes") {
            return [{ key: "email", label: "Email" }, { key: "actions" }];
        }
        
        const studentColumns = [
            { key: "name", label: "Nombre" },
            { key: "email", label: "Email" },
            { key: "actions" }
        ];
        
        if (!props.hideFinalNote) {
            studentColumns.splice(2, 0, { key: "finalNote", label: "Nota Final" });
        }
        
        return studentColumns;
    });

    // Get data depends of the view
    const people = computed(() =>
        props.view === "docentes" ? teachers.value : students.value
    );

    // Auxiliary Functions
    interface TableRow {
        email: string;
    }

    const items = (row: TableRow) => [
        [{ label: 'Editar', icon: 'i-heroicons-pencil-square'}],
        [{ label: 'Eliminar', icon: 'i-heroicons-trash'}]
    ];

    const page = ref(1)
    const pageCount = 5

    const rows = computed(() => {
        return people.value.slice((page.value - 1) * pageCount, page.value * pageCount);
    })
</script>

<template>
    <div class="flex-1 min-h-[289px]">
        <UTable :rows="rows" :columns="columns" :ui="{
            divide: 'divide-y divide-Purple-P dark:divide-Muted-Brown',
            th: {
                base: 'text-left text-base py-3 px-4',
                padding: 'px-4 py-3',
            },
            td: {
                base: 'text-base',
                padding: 'p-2',
            }
            }"
            > 
                <template #actions-data="{ row }">
                    <UDropdown :items="items(row)" :ui="{
                        width: 'w-40',
                        rounded: 'rounded-lg',
                        ring: 'ring-0',
                        background: 'bg-White-w dark:bg-Pure-Black',
                        item: {
                            rounded: 'rounded-lg',
                            active: 'dark:bg-Warm-Dark',
                            disabled: 'cursor-text select-text'
                        },
                        divide: 'dark:divide-Light-Gray/20 divide-opacity-50'
                    }">
                        <UButton color="gray" variant="ghost" icon="fluent:more-horizontal-16-filled"/>
                    </UDropdown>
                </template>

                <template #empty-state>
                    <div class="flex flex-col items-center justify-center py-6 gap-3">
                        <UIcon name="fluent:beach-24-regular" class="text-7xl"/>
                        <span v-if="view == 'docentes'" class="italic text-sm">No hay docentes!</span>
                        <span v-else="view == 'estudiantes'" class="italic text-sm">No hay estudiantes!</span>
                    </div>
                </template>

            </UTable>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center px-3 py-3.5 border-t border-Purple-P dark:border-Muted-Brown">
        <UPagination v-model="page" :page-count="pageCount" :total="people.length" 
        :ui="{
            wrapper: 'flex items-center gap-1',
            rounded: '!rounded-full min-w-[32px] justify-center',
            default: {
            activeButton: {
                variant: 'solid',
                class: 'bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Light-Gray',
            },
            inactiveButton: {
                class: 'dark:bg-Warm-Dark  hover:bg-MLight-White hover:dark:bg-Medium-Dark ring-1 ring-Purple-P dark:ring-Muted-Brown',
            }
            },
        }"
        >
            <template #prev="{ onClick, canGoPrev }">
                <UTooltip text="Pagina Anterior">
                    <UButton
                        icon="fluent:caret-left-16-filled"
                        :ui="{ rounded: 'rounded-full' }"
                        class="me-2 bg-White-w dark:bg-Warm-Dark hover:bg-MLight-White hover:dark:bg-Medium-Dark ring-1 ring-Purple-P dark:ring-Muted-Brown text-black dark:text-white disabled:opacity-100 disabled:bg-White-w disabled:dark:bg-Warm-Dark"
                        :disabled="!canGoPrev"
                        @click="onClick"
                    />
                </UTooltip>
            </template>

            <template #next="{ onClick, canGoNext }">
                <UTooltip text="Siguiente Pagina">
                    <UButton
                        icon="fluent:caret-right-16-filled"
                        :ui="{ rounded: 'rounded-full'}"
                        class="ms-2 bg-White-w dark:bg-Warm-Dark hover:bg-MLight-White hover:dark:bg-Medium-Dark ring-1 ring-Purple-P dark:ring-Muted-Brown text-black dark:text-white disabled:opacity-100 disabled:bg-White-w disabled:dark:bg-Warm-Dark"
                        :disabled="!canGoNext"
                        @click="onClick"
                    />
                </UTooltip>
            </template>
        </UPagination>
    </div>
</template>