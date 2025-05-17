<script setup lang="ts">
const isOpen = ref(false);

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showOTP = ref(false);
const showNewPassword = ref(false);

// Watch for modal close to reset all states
watch(isOpen, (newValue) => {
    if (!newValue) {
        setTimeout(() => {
            // Reset all states when modal is closed
            currentPassword.value = '';
            newPassword.value = '';
            confirmPassword.value = '';
            showOTP.value = false;
            showNewPassword.value = false;
        }, 300);
    }
});

const sendOTP = async () => {
    // TODO: Implement OTP sending logic
    console.log('Sending OTP...');
    showOTP.value = true;
};

const verifyOTP = () => {
    // TODO: Implement OTP verification
    showOTP.value = false;
    showNewPassword.value = true;
};

const updatePassword = async () => {
    if (newPassword.value !== confirmPassword.value) {
        alert('Las contraseñas no coinciden');
        return;
    }
    // TODO: Implement password update logic
    console.log('Updating password');
    isOpen.value = false;
};

const backToPassword = () => {
    showOTP.value = false;
    showNewPassword.value = false;
};
</script>

<template>
    <div>
        <UButton 
            @click="isOpen = true" 
            class="bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300"
        >
            Cambiar Contraseña
        </UButton>

        <UModal 
            v-model="isOpen"
            prevent-close 
            :ui="{
                width: 'w-full sm:max-w-md',
                height: 'max-h-[700px]',
                container: 'flex items-center justify-center',
                overlay: { background: 'dark:bg-Light-Gray/15' },
            }"
        >
            <UCard :ui="{
                background: 'dark:bg-Medium-Dark',
                ring: '',
                divide: '',
                header: { base: 'p-1 pb-0' },
                base: 'w-full',
            }">
                <template #header>
                    <div class="flex justify-end">
                        <UButton
                            color="gray"
                            variant="ghost"
                            icon="fluent:dismiss-12-filled"
                            class="-m-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
                            @click="isOpen = false"
                        />
                    </div>
                </template>

                <div class="pt-0 px-4 pb-4">
                    <!-- Initial Password Form -->
                    <div v-if="!showOTP && !showNewPassword">
                        <div class="flex items-center mb-4">
                            <UIcon name="fluent:lock-closed-24-filled" class="text-2xl mr-2 text-Purple-P dark:text-Muted-Brown" />
                            <h3 class="text-lg font-semibold dark:text-white">Cambiar Contraseña</h3>
                        </div>
                        
                        <p class="mb-6 text-gray-700 dark:text-gray-300">
                            Para cambiar tu contraseña, primero necesitamos verificar tu identidad.
                        </p>
                        
                        <UInput 
                            v-model="currentPassword" 
                            type="password" 
                            placeholder="Contraseña actual"
                            class="mb-4"
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
                        
                        <div class="flex justify-end gap-3">
                            <UButton 
                                variant="link" 
                                color="gray"
                                @click="isOpen = false"
                            >
                                Cancelar
                            </UButton>
                            <UButton 
                                @click="sendOTP"
                                class="bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300"
                            >
                                Continuar
                            </UButton>
                        </div>
                    </div>

                    <!-- OTP Verification -->
                    <div v-if="showOTP">
                        <div class="flex items-center mb-4">
                            <UIcon name="fluent:key-24-filled" class="text-2xl mr-2 text-Purple-P dark:text-Muted-Brown" />
                            <h3 class="text-lg font-semibold dark:text-white">Verificación</h3>
                        </div>
                        
                        <p class="mb-6 text-gray-700 dark:text-gray-300">
                            Se ha enviado un código de verificación a tu correo electrónico.
                        </p>
                        
                        <UtilitiesOTP 
                            ref="otpRef"
                            :length="6"
                        />
                        
                        <div class="flex justify-end gap-3 mt-6">
                            <UButton 
                                variant="link" 
                                color="gray"
                                @click="backToPassword"
                            >
                                Volver
                            </UButton>
                            <UButton 
                                @click="verifyOTP"
                                class="bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300"
                            >
                                Verificar
                            </UButton>
                        </div>
                    </div>

                    <!-- New Password Form -->
                    <div v-if="showNewPassword">
                        <div class="flex items-center mb-4">
                            <UIcon name="fluent:key-reset-24-filled" class="text-2xl mr-2 text-Purple-P dark:text-Muted-Brown" />
                            <h3 class="text-lg font-semibold dark:text-white">Nueva Contraseña</h3>
                        </div>
                        
                        <div class="space-y-4">
                            <UInput 
                                v-model="newPassword" 
                                type="password" 
                                placeholder="Nueva contraseña"
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
                            <UInput 
                                v-model="confirmPassword" 
                                type="password" 
                                placeholder="Confirmar nueva contraseña"
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
                        </div>
                        
                        <div class="flex justify-end gap-3 mt-6">
                            <UButton 
                                variant="link" 
                                color="gray"
                                @click="backToPassword"
                            >
                                Volver
                            </UButton>
                            <UButton 
                                @click="updatePassword"
                                class="bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300"
                            >
                                Cambiar Contraseña
                            </UButton>
                        </div>
                    </div>
                </div>
            </UCard>
        </UModal>
    </div>
</template> 