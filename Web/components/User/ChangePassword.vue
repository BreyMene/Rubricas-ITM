<script setup lang="ts">
const config = useRuntimeConfig();
const isOpen = ref(false);

const currentPassword = ref('');
const showOTP = ref(false);
const showNewPassword = ref(false);

// Error states
const currentPasswordError = ref('');
const passwordError = ref('');
const secPasswordError = ref('');
const formError = ref('');

// Define the type for the OtpInput component ref
interface OtpInputInstance {
    resetOtp: () => void;
    getOtpValue: () => string;
}

// OTP ref
const otpRef = ref<OtpInputInstance | null>(null);

// Form state
const state = reactive({
    password: '',
    secPasword: ''
});

// Watch for modal close to reset all states
watch(isOpen, (newValue) => {
    if (!newValue) {
        setTimeout(() => {
            // Reset all states when modal is closed
            currentPassword.value = '';
            state.password = '';
            state.secPasword = '';
            showOTP.value = false;
            showNewPassword.value = false;
            currentPasswordError.value = '';
            passwordError.value = '';
            secPasswordError.value = '';
            formError.value = '';
        }, 300);
    }
});

const validateCurrentPassword = () => {
    currentPasswordError.value = '';
    formError.value = '';

    if (!currentPassword.value) {
        currentPasswordError.value = 'La contraseña es requerida';
        return false;
    }

    return true;
};

// Create form validator for new password form
const validateNewPasswordForm = createFormValidator(
    undefined,
    passwordError,
    secPasswordError,
    { isMobile: false, minPasswordLength: 6 }
);

const sendOTP = async () => {
    if (!validateCurrentPassword()) return;

    try {
        const docenteStore = useDocenteStore();
        if (!docenteStore.docente) {
            formError.value = 'No hay usuario autenticado';
            currentPasswordError.value = formError.value;
            return;
        }

        // Verify current password
        const response = await $fetch<{ valid: boolean }>(`${config.public.apiUrl}/verify-password`, {
            method: 'POST',
            body: {
                contraseña: currentPassword.value,
                correo: docenteStore.docente.correo
            },
        });

        if (response.valid) {
            // Send password change OTP
            await $fetch(`${config.public.apiUrl}/send-password-change-code`, {
                method: 'POST',
                body: {
                    correo: docenteStore.docente.correo,
                },
            });
            showOTP.value = true;
        }
    } catch (error: any) {
        formError.value = 'Contraseña incorrecta';
        currentPasswordError.value = formError.value;
    }
};

const verifyOTP = async () => {
    try {
        if (otpRef.value) {
            const code = otpRef.value.getOtpValue();
            if (code.length === 6) {
                const docenteStore = useDocenteStore();
                if (!docenteStore.docente) {
                    formError.value = 'No hay usuario autenticado';
                    return;
                }

                // Validate password change OTP
                await $fetch(`${config.public.apiUrl}/validate-password-change`, {
                    method: "POST",
                    body: {
                        correo: docenteStore.docente.correo,
                        codigo: code,
                    },
                });
                showOTP.value = false;
                showNewPassword.value = true;
            } else {
                formError.value = 'Código incompleto';
            }
        }
    } catch (error) {
        formError.value = 'Código inválido o expirado';
    }
};

const resendOTP = async () => {
    try {
        const docenteStore = useDocenteStore();
        if (!docenteStore.docente) {
            formError.value = 'No hay usuario autenticado';
            return;
        }

        // Resend password change OTP
        await $fetch(`${config.public.apiUrl}/send-password-change-code`, {
            method: 'POST',
            body: {
                correo: docenteStore.docente.correo,
            },
        });
        if (otpRef.value) {
            otpRef.value.resetOtp();
        }
    } catch (error) {
        formError.value = 'Error al reenviar el código';
    }
};

const updatePassword = async () => {
    try {
        const docenteStore = useDocenteStore();
        if (!docenteStore.docente) {
            formError.value = 'No hay usuario autenticado';
            return;
        }

        await $fetch(`${config.public.apiUrl}/change-password`, {
            method: "PUT",
            body: {
                correo: docenteStore.docente.correo,
                contraseña: state.password,
            },
        });
        isOpen.value = false;
    } catch (error) {
        formError.value = 'Error al cambiar la contraseña';
    }
};

const backToPassword = () => {
    showOTP.value = false;
    showNewPassword.value = false;
};

const show = ref(false);
const showConfirm = ref(false);
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
                        
                        <UFormGroup
                            label="Contraseña actual"
                            name="currentPassword"
                            :hint="currentPasswordError"
                            :error="formError"
                            :ui="{
                                hint: 'text-red-500 dark:text-red-500 text-sm',
                                error: 'hidden'
                            }"
                        >
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
                        </UFormGroup>
                        
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

                        <div class="mt-4 text-center">
                            <p class="text-sm">¿No recibiste el código?
                                <UButton
                                    variant="link"
                                    @click="resendOTP"
                                    class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
                                >
                                    Reenviar código
                                </UButton>
                            </p>
                        </div>
                    </div>

                    <!-- New Password Form -->
                    <div v-if="showNewPassword">
                        <div class="flex items-center mb-4">
                            <UIcon name="fluent:key-reset-24-filled" class="text-2xl mr-2 text-Purple-P dark:text-Muted-Brown" />
                            <h3 class="text-lg font-semibold dark:text-white">Nueva Contraseña</h3>
                        </div>
                        
                        <UForm :state="state" :validate="validateNewPasswordForm" class="flex flex-col gap-3" @submit="updatePassword">
                            <UFormGroup label="Contraseña" name="password" :hint="passwordError"
                                :ui="{  hint: 'text-red-500 dark:text-red-500 text-sm',
                                    error: 'hidden'
                                }">
                                <UInput size="sm" v-model="state.password" :type="show ? 'text' : 'password'" class="w-full"
                                    :ui="{
                                        icon: {
                                            trailing: { pointer: '' }
                                        },
                                        ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                                        color: {
                                            gray: {
                                                outline: 'shadow-lg bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                            }
                                        }
                                    }"
                                    color="gray"
                                >
                                    <template #trailing>
                                        <UButton
                                            color="gray"
                                            variant="link"
                                            size="sm"
                                            :icon="show ? 'fluent:eye-off-16-filled' : 'fluent:eye-16-filled'"
                                            :aria-label="show ? 'Hide password' : 'Show password'"
                                            :aria-pressed="show"
                                            aria-controls="password"
                                            @click="show = !show"
                                        />
                                    </template>
                                </UInput>
                            </UFormGroup>

                            <UFormGroup label="Verifica Contraseña" name="secPasword" :hint="secPasswordError"
                                :ui="{  hint: 'text-red-500 dark:text-red-500 text-sm',
                                    error: 'hidden'
                                }">
                                <UInput size="sm" v-model="state.secPasword" :type="showConfirm ? 'text' : 'password'" class="w-full"
                                    :ui="{
                                        icon: {
                                            trailing: { pointer: '' }
                                        },
                                        ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                                        color: {
                                            gray: {
                                                outline: 'shadow-lg bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                            }
                                        }
                                    }"
                                    color="gray"
                                >
                                    <template #trailing>
                                        <UButton
                                            color="gray"
                                            variant="link"
                                            size="sm"
                                            :icon="showConfirm ? 'fluent:eye-off-16-filled' : 'fluent:eye-16-filled'"
                                            :aria-label="showConfirm ? 'Hide password' : 'Show password'"
                                            :aria-pressed="showConfirm"
                                            aria-controls="password"
                                            @click="showConfirm = !showConfirm"
                                        />
                                    </template>
                                </UInput>
                            </UFormGroup>

                            <div class="flex justify-end gap-3 mt-6">
                                <UButton 
                                    variant="link" 
                                    color="gray"
                                    @click="isOpen = false"
                                >
                                    Cancelar
                                </UButton>
                                <UButton type="submit" class="bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium">
                                    Cambiar Contraseña
                                </UButton>
                            </div>
                        </UForm>
                    </div>
                </div>
            </UCard>
        </UModal>
    </div>
</template> 