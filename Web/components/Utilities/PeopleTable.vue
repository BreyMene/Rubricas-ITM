<script setup lang="ts">
    const props = defineProps<{
        view: "docentes" | "estudiantes";
        isModerator?: boolean; 
        hideFinalNote?: boolean;
        searchTerm?: string;
        data: DocenteEnCurso[] | Estudiante[]
    }>();

    const toast = useToast()

    // Add new state for editing
    const editingRow = ref<{correo: string, field: string} | null>(null);
    const editValue = ref('');

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

    interface MenuItem {
        label: string;
        icon: string;
        click: () => void;
        disabled?: boolean;
    }

    // Add new emit for edit
    const emits = defineEmits(['delete-user', 'make-moderator', 'edit-user']);

    // Función para eliminar un usuario
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

    // Add edit handlers
    const startEditing = (row: TableRow, field: string) => {
        editingRow.value = { correo: row.correo, field };
        editValue.value = row[field as keyof TableRow] as string;
    };

    const saveEdit = () => {
        if (editingRow.value) {
            // Validate email format if editing email
            if (editingRow.value.field === 'correo') {
                // Check if it's a valid email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(editValue.value)) {
                    toast.add({
                        title: 'Error al editar',
                        description: 'Email inválido',
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
                    return;
                }

                // Check if it ends with the institutional domain
                if (!editValue.value.endsWith('@correo.itm.edu.co')) {
                    toast.add({
                        title: 'Error al editar',
                        description: 'Debe usar un correo institucional',
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
                    return;
                }

                // Check if email already exists in the list
                const emailExists = props.data.some(item => 
                    item.correo === editValue.value && item.correo !== editingRow.value?.correo
                );
                if (emailExists) {
                    toast.add({
                        title: 'Error al editar',
                        description: 'El correo ya existe en la lista',
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
                    return;
                }
            }

            emits('edit-user', editingRow.value.correo, editingRow.value.field, editValue.value);
            editingRow.value = null;
            editValue.value = '';
        }
    };

    const cancelEdit = () => {
        editingRow.value = null;
        editValue.value = '';
    };

    const items = (row: TableRow) => {
        const menuItems: MenuItem[][] = [
            [
                { 
                    label: 'Editar', 
                    icon: 'fluent:compose-12-filled',
                    click: () => startEditing(row, props.view === "docentes" ? "correo" : "nombre")
                }
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
            
            // Count how many moderators there are
            const moderatorCount = props.data.filter(d => (d as DocenteEnCurso).moderador).length;
            
            // Insert moderator option after Edit and before Delete
            menuItems.splice(1, 0, [
                {
                    label: moderatorLabel,
                    icon: moderatorIcon,
                    click: () => makeModerator(row.correo, !!row.moderador),
                    disabled: row.moderador && moderatorCount <= 1
                }
            ]);
        } else {
            // Add edit email option for students
            menuItems[0].push({
                label: 'Editar Correo',
                icon: 'fluent:mail-12-filled',
                click: () => startEditing(row, "correo")
            });
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
            },
        }"
        > 
            <!-- Final Note custom column -->
            <template #finalNote-header>
                <div class="text-center w-full transition-colors duration-150">Nota Final</div>
            </template>
            <template #finalNote-data="{ row }">
                <div class="text-center transition-colors duration-150">
                    {{ row.finalNote }}
                </div>
            </template>

            <!-- Moderator custom column -->
            <template #moderador-header>
                <div class="w-8"></div>
            </template>
            <template #moderador-data="{ row }">
                <div class="flex justify-center w-8 transition-colors duration-150">
                    <UIcon v-if="row.moderador" name="fluent:person-key-20-filled" class="text-Purple-P dark:text-Muted-Brown w-6 h-6 transition-colors duration-[0.1s]" />
                </div>
            </template>

            <!-- Editable columns -->
            <template #nombre-data="{ row }">
                <div v-if="editingRow?.correo === row.correo && editingRow?.field === 'nombre'" class="flex gap-2 items-center transition-colors duration-150">
                    <UInput 
                        v-model="editValue" 
                        class="flex-1 transition-colors duration-150"
                        :ui="{
                            ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                            color: {
                                gray: {
                                outline:
                                    'shadow-md bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown',
                                },
                            },
                        }"
                        color="gray"
                    />
                    <UButton 
                        icon="fluent:checkmark-12-filled" 
                        color="green" 
                        variant="ghost"
                        class="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-150"
                        @click="saveEdit" 
                    />
                    <UButton 
                        icon="fluent:dismiss-12-filled" 
                        color="red" 
                        variant="ghost"
                        class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150"
                        @click="cancelEdit" 
                    />
                </div>
                <div v-else>{{ row.nombre }}</div>
            </template>

            <template #correo-data="{ row }">
                <div v-if="editingRow?.correo === row.correo && editingRow?.field === 'correo'" class="flex gap-2 items-center transition-colors    duration-150">
                    <UInput 
                        v-model="editValue" 
                        class="flex-1 transition-colors duration-150"
                        :ui="{
                            ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                            color: {
                                gray: {
                                outline:
                                    'shadow-md bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown',
                                },
                            },
                        }"
                        color="gray"
                    />
                    <UButton 
                        icon="fluent:checkmark-12-filled" 
                        color="green" 
                        variant="ghost"
                        class="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-150"
                        @click="saveEdit" 
                    />
                    <UButton 
                        icon="fluent:dismiss-12-filled" 
                        color="red" 
                        variant="ghost"
                        class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150"
                        @click="cancelEdit" 
                    />
                </div>
                <div v-else>{{ row.correo }}</div>
            </template>

            <!--  -->
            <template v-if="props.isModerator" #actions-data="{ row }">
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
                <div class="flex flex-col items-center justify-center py-6 gap-3 transition-colors duration-150">
                    <UIcon name="fluent:beach-24-regular" class="text-7xl transition-colors duration-[0.1s]"/>
                    <span v-if="view == 'docentes'" class="italic text-sm transition-colors duration-[0.1s]">No hay docentes!</span>
                    <span v-else class="italic text-sm transition-colors duration-[0.1s]">No hay estudiantes!</span>
                </div>
            </template>

        </UTable>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center px-3 py-3.5 border-t border-Purple-P dark:border-Muted-Brown transition-colors duration-150">
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