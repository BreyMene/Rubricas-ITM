<script setup lang="ts">
    const config = useRuntimeConfig();

    const props = defineProps({
        isMobile: {
            type: Boolean,
            default: false
        }
    });

    const loadScreen = ref(false);
    const emit = defineEmits(['toggleForm', "loadScreen"]);

    const state = reactive({
        email: '',
        password: '',
        secPasword: ''
    });

    // To display as a hint, instead of displaying the base error
    const emailError = ref('');
    const passwordError = ref('');
    const secPasswordError = ref('');

    const formError = ref("");
    const showPasswordValidator = ref(false);

    const validate = createFormValidator(
        emailError, 
        passwordError, 
        secPasswordError, 
        {
            isMobile: props.isMobile,
            minPasswordLength: 8
        },
        true // Enable password strength validation
    );

    const handleSignIn = async () => {
        formError.value = "";
        
        // Reset individual error messages
        emailError.value = '';
        passwordError.value = '';
        secPasswordError.value = '';

        // Check if passwords match first
        if (state.password !== state.secPasword) {
            secPasswordError.value = props.isMobile ? "" : "Las contraseñas no coinciden";
            if (props.isMobile) {
                formError.value = "Las contraseñas no coinciden";
            }
            return;
        }

        // Check password strength using the utility function
        const passwordValidation = validatePasswordStrength(state.password);
        if (!passwordValidation.isValid) {
            passwordError.value = props.isMobile ? "" : "La contraseña no cumple con los requisitos mínimos";
            if (props.isMobile) {
                formError.value = "La contraseña no cumple con los requisitos mínimos";
            }
            return;
        }

        try {
            loadScreen.value = true;
            emit("loadScreen", "Creando Cuenta...", loadScreen.value)
            const docente: Docente = await $fetch(`${config.public.apiUrl}/register`, {
                method: 'POST',
                body: {
                    correo: state.email,
                    contraseña: state.password,
                }
            })

            useDocenteStore().setDocente(docente)
            await navigateTo("/")
        } catch (error: any) {
            if (error.statusCode === 401){
                formError.value = "Este correo ya está registrado";
                emailError.value = props.isMobile ? "" : formError.value;
            }else{
                formError.value = "Error al registrar. Intente más tarde";
                emailError.value = props.isMobile ? "" : formError.value;
            }
        }finally {
            loadScreen.value = false;
            emit("loadScreen", "", loadScreen.value)
        }
    }

    const toggleForm = () => {
        emit('toggleForm');
    }

    const show = ref(false)
    const show2 = ref(false)

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
            } else {
                secPasswordError.value = '';
            }
        }
    });
</script>

<template>
    <div :class="[
        isMobile ? 'px-6 py-6 min-h-[450px]' : 'form-container w-3/5 px-14 py-6 absolute top-0 right-0'
    ]">
        <h2 :class="[
            'font-semibold text-Pure-Black dark:text-White-w mb-6',
            isMobile ? 'text-xl text-center' : 'text-2xl text-end'
        ]">
            REGISTRATE
        </h2>
        <div class="mb-6">
            <UForm :state="state" :validate="validate" class="flex flex-col gap-3" @submit="handleSignIn">
                <UFormGroup label="Email" name="email" :error="formError" :hint="emailError"
                    :ui="{  hint: 'text-red-500 dark:text-red-500 text-sm',
                        error: isMobile ? 'text-red-500 dark:text-red-500 text-sm' : 'hidden'
                    }">
                    <UInput size="sm" v-model="state.email" placeholder="ejemplo@correo.itm.edu.co" class="w-full"
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
                    />
                </UFormGroup>

                <UFormGroup label="Contraseña" name="password" :hint="''"
                    :ui="{  hint: 'hidden',
                        error: 'hidden'
                    }"
                    class="relative">
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

                    <SettingsPasswordValidator
                        :password="state.password"
                        v-model:show="showPasswordValidator"
                    />
                </UFormGroup>

                <UFormGroup label="Verifica Contraseña" name="secPasword" :hint="secPasswordError"
                    :ui="{  hint: 'text-red-500 dark:text-red-500 text-sm',
                        error: isMobile ? 'text-red-500 dark:text-red-500 text-sm' : 'hidden'
                    }">
                    <UInput size="sm" v-model="state.secPasword" :type="show2 ? 'text' : 'password'" class="w-full"
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
                                :icon="show2 ? 'fluent:eye-off-16-filled' : 'fluent:eye-16-filled'"
                                :aria-label="show2 ? 'Hide password' : 'Show password'"
                                :aria-pressed="show2"
                                aria-controls="password"
                                @click="show2 = !show2"
                            />
                        </template>
                    </UInput>
                </UFormGroup>

                <UButton type="submit" class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium">
                    Crear Cuenta
                </UButton>
            </UForm>
        </div>
        <div :class="[
            'mt-5 flex items-center justify-center',
            isMobile ? 'flex-wrap' : ''
        ]">
            <p class="text-sm">Ya tienes cuenta?</p>
            <UButton
                variant="link"
                @click="toggleForm"
                class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
            >
                Inicia Sesión Aqui
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