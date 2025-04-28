<script setup lang="ts">
    const props = defineProps<{
        view: "docentes" | "estudiantes";
        hideFinalNote?: boolean;
        searchTerm?: string;
        data: DocenteEnCurso[] | Estudiante[]
    }>();

    const toast = useToast()

    // Change columns depends of the view
    const columns = computed(() => {
        if (props.view === "docentes") {
            return [
                { key: "correo", label: "Correo", sortable: true },
                { key: "moderador", label: "", sortable: false },
                { key: "actions" }
                ];
        }
        
        const studentColumns = [
            { key: "nombre", label: "Nombre", sortable: true },
            { key: "correo", label: "Correo", sortable: true },
            { key: "actions" }
        ];
        
        if (!props.hideFinalNote) {
            studentColumns.splice(2, 0, { key: "promedio", label: "Nota Final", sortable: true });
        }
        
        return studentColumns;
    });

    // Auxiliary Functions
    interface TableRow {
        correo: string;
        moderador?: boolean;
    }

    // Función para eliminar un usuario
    const emits = defineEmits(['delete-user', 'make-moderator']);

    const deleteUser = (correo: string) => {
        const userType = props.view === "docentes" ? "docente" : "estudiante";
        toast.add({
            title: `Se elimino el ${userType} ${correo}`,
            icon: "fluent:alert-urgent-16-filled",
            timeout: 2000,

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
        })
        emits('delete-user', correo);
    };

    const makeModerator = (correo: string, mod: boolean) => {
        emits('make-moderator', correo, mod);
    }

    const items = (row: TableRow) => {
        const menuItems = [
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
        
        // Add moderator option only for docentes view
        if (props.view === "docentes") {
            const moderatorLabel = row.moderador ? 'Quitar moderador' : 'Hacer moderador';
            const moderatorIcon = row.moderador ? 'fluent:person-delete-20-filled' : 'fluent:person-key-20-filled';
            
            // Insert moderator option after Edit and before Delete
            menuItems.splice(1, 0, [
                {
                    label: moderatorLabel,
                    icon: moderatorIcon,
                    click: () => makeModerator(row.correo, !!row.moderador)
                }
            ]);
        }
        
        return menuItems;
    };

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
            <!-- Final Note custom column -->
            <template #finalNote-header>
                <div class="text-center w-full">Nota Final</div>
            </template>
            <template #finalNote-data="{ row }">
                <div class="text-center">
                    {{ row.finalNote }}
                </div>
            </template>

            <!-- Moderator custom column -->
            <template #moderador-header>
                <div class="w-8"></div>
            </template>
            <template #moderador-data="{ row }">
                <div class="flex justify-center w-8">
                    <UIcon v-if="row.moderador" name="fluent:person-key-20-filled" class="text-Purple-P dark:text-Muted-Brown w-6 h-6" />
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