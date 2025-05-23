<script setup lang="ts">
const useDocente = useDocenteStore();
const email = ref(useDocente.getCorreo);
const language = ref('Español');
const isConfirmDeleteOpen = ref(false);
const isDeleting = ref(false);

const languages = [
    { value: 'Español', label: 'Español', icon: 'fluent:globe-24-filled' },
    { value: 'English', label: 'English', icon: 'fluent:globe-24-filled' }
];

const updateEmail = async () => {

};

const deleteAccount = async () => {
    isDeleting.value = true;
    
    try {
        await navigateTo('/login');
    } catch (error) {
        console.error('Error deleting account:', error);
    } finally {
        isDeleting.value = false;
        isConfirmDeleteOpen.value = false;
    }
};
</script>

<template>
    <div class="container mx-auto p-6">
        <div class="flex flex-col gap-6">
            <div class="flex-1">
                <div class="max-w-3xl mx-auto bg-White-w dark:bg-Warm-Dark/60 rounded-lg shadow-lg p-8">
                    <h1 class="text-2xl font-bold mb-8 text-Pure-Black dark:text-White-w">Ajustes</h1>
                    
                    <!-- Email Section -->
                    <div class="mb-8 p-6 bg-Warm-White/50 dark:bg-Pure-Black/50 rounded-xl shadow-md">
                        <h2 class="text-xl font-semibold mb-4 text-Pure-Black dark:text-White-w">Correo Electrónico</h2>
                        <div class="flex gap-4">
                            <UInput 
                                v-model="email" 
                                type="email" 
                                placeholder="Tu correo electrónico" 
                                class="flex-1"
                                :ui="{
                                    ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                                    color: {
                                        gray: {
                                            outline: 'shadow-lg bg-White-w dark:bg-Warm-Dark text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                        }
                                    }
                                }"
                                color="gray"
                            />
                            <UButton 
                                @click="updateEmail" 
                                class="bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300"
                            >
                                Actualizar
                            </UButton>
                        </div>
                    </div>

                    <!-- Password Section -->
                    <div class="mb-8 p-6 bg-Warm-White/50 dark:bg-Pure-Black/50 rounded-xl shadow-md">
                        <UserChangePassword />
                    </div>

                    <!-- Language Section -->
                    <div class="mb-8 p-6 bg-Warm-White/50 dark:bg-Pure-Black/50 rounded-xl shadow-md">
                        <h2 class="text-xl font-semibold mb-4 text-Pure-Black dark:text-White-w">Idioma</h2>
                        <USelectMenu 
                            v-model="language" 
                            :options="languages"
                            option-attribute="label"
                            value-attribute="value"
                            class="w-full"
                            :uiMenu="{
                                background: 'bg-White-w dark:bg-Medium-Dark',
                                shadow: 'shadow-lg',
                                rounded: 'rounded-lg',
                                padding: 'p-1',
                                ring: 'ring-1 ring-gray-200 dark:ring-Dark-Grey',
                                option: {
                                    base: 'flex items-center gap-2',
                                    active: 'bg-Medium-Blue/20 dark:bg-Medium-Gray/20',
                                    selected: 'text-Purple-P dark:text-Muted-Brown'
                                }
                            }"
                            :ui="{
                                ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                                color: {
                                    gray: {
                                        outline: 'shadow-lg bg-White-w dark:bg-Warm-Dark text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                    }
                                },
                                option: {
                                    base: 'flex items-center gap-2',
                                    active: 'bg-Medium-Blue/20 dark:bg-Medium-Gray/20',
                                    selected: 'text-Purple-P dark:text-Muted-Brown'
                                },
                                
                            }"
                            color="gray"
                        >
                            <template #option="{ option }">
                                <UIcon :name="option.icon" class="text-Purple-P dark:text-Muted-Brown" />
                                <span>{{ option.label }}</span>
                            </template>
                        </USelectMenu>
                    </div>

                    <!-- Delete Account Section -->
                    <div class="mb-8 p-6 border border-red-500/30 rounded-lg">
                        <div class="flex items-center mb-4">
                            <UIcon name="fluent:warning-24-filled" class="text-red-500 text-2xl mr-2" />
                            <h2 class="text-xl font-semibold text-red-500">Eliminar Cuenta</h2>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Eliminar tu cuenta es una acción permanente y no puede ser revertida. Se eliminarán todos tus datos asociados, incluyendo cursos, grupos y rúbricas.
                        </p>
                        <UButton 
                            @click="isConfirmDeleteOpen = true" 
                            color="red"
                            variant="soft"
                            class="w-full sm:w-auto"
                        >
                            Eliminar Cuenta
                        </UButton>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isConfirmDeleteOpen" prevent-close :ui="{
        width: 'w-full sm:max-w-md',
        height: 'max-h-[700px]',
        container: 'flex items-center justify-center',
        overlay: { background: 'dark:bg-Light-Gray/15' },
    }">
        <UCard :ui="{
            background: 'dark:bg-Medium-Dark',
            ring: '',
            divide: '',
            base: 'w-full',
        }">
            <div class="p-4">
                <div class="flex items-center mb-4">
                    <UIcon name="fluent:warning-24-filled" class="text-red-500 text-2xl mr-2" />
                    <h3 class="text-lg font-semibold dark:text-white">Confirmar Eliminación</h3>
                </div>
                
                <p class="mb-6 text-gray-700 dark:text-gray-300">
                    ¿Estás seguro que deseas eliminar tu cuenta? Esta acción es irreversible y eliminará todos tus datos.
                </p>
                
                <div class="flex justify-end gap-3">
                    <UButton 
                        variant="link" 
                        color="gray"
                        @click="isConfirmDeleteOpen = false"
                        :disabled="isDeleting"
                    >
                        Cancelar
                    </UButton>
                    <UButton 
                        color="red" 
                        @click="deleteAccount"
                    >
                        Eliminar
                    </UButton>
                </div>
            </div>
        </UCard>
    </UModal>
</template> 