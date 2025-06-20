<script setup lang="ts">
    const config = useRuntimeConfig();

    const props = defineProps({
        isMobile: {
            type: Boolean,
            default: false
        },
        email: String,
    });

    const emit = defineEmits(['backToLogin']);

    const state = reactive({
        password: '',
        secPasword: ''
    });

    const passwordError = ref('');
    const secPasswordError = ref('');
    const formError = ref('');
    const showPasswordValidator = ref(false);

    // Watch password field to show/hide validator
    watch(() => state.password, (newPassword) => {
        showPasswordValidator.value = newPassword.length > 0;
        // Clear password error when user starts typing
        if (newPassword.length > 0) {
            passwordError.value = '';
            if (formError.value.includes('contraseña') || formError.value.includes('requisitos')) {
                formError.value = '';
            }
        }
    });

    // Watch confirm password for matching
    watch(() => state.secPasword, (newConfirmPassword) => {
        // Clear errors when user starts typing
        if (newConfirmPassword.length > 0) {
            secPasswordError.value = '';
            if (formError.value.includes('contraseñas no coinciden')) {
                formError.value = '';
            }
        }
        
        // Show real-time validation only if both fields have content
        if (state.password.length > 0 && newConfirmPassword.length > 0) {
            if (state.password !== newConfirmPassword) {
                secPasswordError.value = props.isMobile ? "" : "Las contraseñas no coinciden";
                if (props.isMobile) {
                    formError.value = "Las contraseñas no coinciden";
                }
            } else {
                secPasswordError.value = '';
                if (formError.value.includes('contraseñas no coinciden')) {
                    formError.value = '';
                }
            }
        }
    });

    const validate = createFormValidator(
        undefined, 
        passwordError, 
        secPasswordError, 
        {
            isMobile: props.isMobile,
            minPasswordLength: 8
        },
        true // Enable password strength validation
    );

    const handleChangePassword = async () => {
        // Reset errors
        formError.value = "";
        passwordError.value = '';
        secPasswordError.value = '';

        // Manual validation before submission
        if (!state.password || !state.secPasword) {
            formError.value = "Todos los campos son requeridos";
            return;
        }

        // Check if passwords match
        if (state.password !== state.secPasword) {
            secPasswordError.value = props.isMobile ? "" : "Las contraseñas no coinciden";
            if (props.isMobile) {
                formError.value = "Las contraseñas no coinciden";
            }
            return;
        }

        // Check password strength
        const passwordValidation = validatePasswordStrength(state.password);
        if (!passwordValidation.isValid) {
            passwordError.value = props.isMobile ? "" : "La contraseña no cumple con los requisitos mínimos";
            if (props.isMobile) {
                formError.value = "La contraseña no cumple con los requisitos mínimos";
            }
            return;
        }

        try {
            const response = await $fetch(`${config.public.apiUrl}/change-password`, {
                method: "PUT",
                body: {
                    correo: props.email,
                    contraseña: state.password,
                },
            });
            emit('backToLogin', true);
        } catch (error) {
            console.error('Error:', error);
            formError.value = "Error al cambiar la contraseña. Intente más tarde";
        }
    }

    const backToLogin = () => {
        emit('backToLogin', true);
    }

    const show = ref(false)
    const showConfirmPassword = ref(false)
</script>

<template>
    <div :class="[
        isMobile ? 'px-6 py-6 min-h-[450px] flex flex-col justify-center' : 'form-container w-full px-52 py-8 mt-[12.5%] absolute left-0 right-0'
    ]">
        <h2 :class="[
            'font-semibold text-Pure-Black dark:text-White-w mb-4',
            isMobile ? 'text-xl text-center' : 'text-2xl text-end'
        ]">
            RESTABLECE TU CONTRASEÑA
        </h2>

        <!-- Display general form error for mobile -->
        <div v-if="isMobile && formError" class="mb-4">
            <p class="text-red-500 text-sm text-center">{{ formError }}</p>
        </div>

        <div class="mb-6">
            <UForm :state="state" :validate="validate" class="flex flex-col gap-3" @submit="handleChangePassword">
                <UFormGroup label="Nueva Contraseña" name="password" :hint="''"
                    :ui="{  hint: 'hidden',
                        error: isMobile ? 'text-red-500 dark:text-red-500 text-sm' : 'hidden'
                    }"
                    class="relative">
                    <UInput size="sm" v-model="state.password" :type="show ? 'text' : 'password'" class="w-full"
                        :ui="{
                            icon: {
                                trailing: { pointer: '' }
                            },
                            ring: passwordError ? 'ring-2 ring-red-500 focus:ring-2 focus:ring-red-500' : 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
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

                    <SettingsPasswordValidator
                        :password="state.password"
                        v-model:show="showPasswordValidator"
                    />
                </UFormGroup>

                <UFormGroup label="Confirmar Contraseña" name="secPasword" :hint="secPasswordError"
                    :ui="{  hint: 'text-red-500 dark:text-red-500 text-sm',
                        error: isMobile ? 'text-red-500 dark:text-red-500 text-sm' : 'hidden'
                    }">
                    <UInput size="sm" v-model="state.secPasword" :type="showConfirmPassword ? 'text' : 'password'" class="w-full"
                        :ui="{
                            icon: {
                                trailing: { pointer: '' }
                            },
                            ring: secPasswordError ? 'ring-2 ring-red-500 focus:ring-2 focus:ring-red-500' : 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
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
                                :icon="showConfirmPassword ? 'fluent:eye-off-16-filled' : 'fluent:eye-16-filled'"
                                :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                                :aria-pressed="showConfirmPassword"
                                aria-controls="password"
                                @click="showConfirmPassword = !showConfirmPassword"
                            />
                        </template>
                    </UInput>
                </UFormGroup>

                <UButton type="submit" class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium">
                    Restablecer Contraseña
                </UButton>
            </UForm>
        </div>
        <div :class="[
            'mt-5 flex items-center justify-center',
            isMobile ? 'flex-wrap' : ''
        ]">
            <UButton
                variant="link"
                @click="backToLogin"
                class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
            >
                Volver a Inicio de Sesión
            </UButton>
        </div>
    </div>
</template>

<style scoped>
.form-container {
    position: relative;
    will-change: opacity;
}
</style>