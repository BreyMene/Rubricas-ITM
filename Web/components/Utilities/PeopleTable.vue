<script setup lang="ts">
    const props = defineProps<{
        view: "docentes" | "estudiantes";
        hideFinalNote?: boolean;
        searchTerm?: string;
        data: DocenteEnCurso[] | Estudiante[]
    }>();

    // Change columns depends of the view
    const columns = computed(() => {
        if (props.view === "docentes") {
            return [{ key: "correo", label: "Correo" }, { key: "actions" }];
        }
        
        const studentColumns = [
            { key: "nombre", label: "Nombre" },
            { key: "correo", label: "Correo" },
            { key: "actions" }
        ];
        
        if (!props.hideFinalNote) {
            studentColumns.splice(2, 0, { key: "promedio", label: "Nota Final" });
        }
        
        return studentColumns;
    });

    // Auxiliary Functions
    interface TableRow {
        correo: string;
    }

    // Función para eliminar un usuario
    const emits = defineEmits(['delete-user']);

    const deleteUser = (correo: string) => {
        emits('delete-user', correo);
    };

    const items = (row: TableRow) => [
        [
            { label: 'Editar', icon: 'fluent:compose-12-filled'}
        ],
        [
            {
                label: 'Eliminar',
                icon: 'fluent:delete-12-regular',
                click: () => deleteUser(row.correo)
            }
        ]
    ];

    // Filtered people with proper type checking
    const filteredPeople = computed(() => {
        if (!props.searchTerm) return props.data;
        
        const searchLower = props.searchTerm.toLowerCase();
        return props.data.filter(person => {
            if (props.view === "docentes") {
                return (person as DocenteEnCurso).correo.toLowerCase().includes(searchLower);
            } else {
                // Type guard to ensure we're working with a Student
                const studentPerson = person as Estudiante;
                return (
                    studentPerson.nombre.toLowerCase().includes(searchLower) ||
                    studentPerson.correo.toLowerCase().includes(searchLower)
                );
            }
        });
    });

    const page = ref(1)
    const pageCount = 5

    const rows = computed(() => {
        return filteredPeople.value.slice((page.value - 1) * pageCount, page.value * pageCount);
    });

    const totalItems = computed(() => filteredPeople.value.length);
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
                base: 'text-left text-base px-4',
                padding: 'p-2',
            }
        }"
        > 
            <template #finalNote-header>
                <div class="text-center w-full">Nota Final</div>
            </template>
            <template #finalNote-data="{ row }">
                <div class="text-center">
                    {{ row.finalNote }}
                </div>
            </template>

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
                    <span v-else class="italic text-sm">No hay estudiantes!</span>
                </div>
            </template>

        </UTable>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center px-3 py-3.5 border-t border-Purple-P dark:border-Muted-Brown">
        <UPagination v-model="page" :page-count="pageCount" :total="totalItems" 
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
                <UTooltip>
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
                <UTooltip>
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