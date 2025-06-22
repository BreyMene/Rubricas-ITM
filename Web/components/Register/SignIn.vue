<script setup lang="ts">
    import { useI18n } from 'vue-i18n';

    const config = useRuntimeConfig();
    const { t } = useI18n();

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
            secPasswordError.value = props.isMobile ? "" : t('signIn.form.passwords_do_not_match');
            if (props.isMobile) {
                formError.value = t('signIn.form.passwords_do_not_match');
            }
            return;
        }

        // Check password strength using the utility function
        const passwordValidation = validatePasswordStrength(state.password);
        if (!passwordValidation.isValid) {
            passwordError.value = props.isMobile ? "" : t('signIn.form.password_requirements');
            if (props.isMobile) {
                formError.value = t('signIn.form.password_requirements');
            }
            return;
        }

        try {
            loadScreen.value = true;
            emit("loadScreen", t('signIn.loading'), loadScreen.value)
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
                formError.value = t('signIn.form.email_already_registered');
                emailError.value = props.isMobile ? "" : formError.value;
            }else{
                formError.value = t('signIn.form.registration_error');
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
            const passwordErrorMessages = [
                t('signIn.form.password_requirements'),
                'contraseña', // Keep as fallback for existing errors
                'requisitos'  // Keep as fallback for existing errors
            ];
            
            if (passwordErrorMessages.some(msg => formError.value.includes(msg))) {
                formError.value = '';
            }
        }
    });

    // Watch confirm password for matching
    watch(() => state.secPasword, (newConfirmPassword) => {
        // Clear errors when user starts typing
        if (newConfirmPassword.length > 0) {
            secPasswordError.value = '';
            const mismatchErrorMessages = [
                t('signIn.form.passwords_do_not_match'),
                'contraseñas no coinciden' // Keep as fallback for existing errors
            ];
            
            if (mismatchErrorMessages.some(msg => formError.value.includes(msg))) {
                formError.value = '';
            }
        }
        
        // Show real-time validation only if both fields have content
        if (state.password.length > 0 && newConfirmPassword.length > 0) {
            if (state.password !== newConfirmPassword) {
                secPasswordError.value = props.isMobile ? "" : t('signIn.form.passwords_do_not_match');
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
            {{ t('signIn.title') }}
        </h2>
        <div class="mb-6">
            <UForm :state="state" :validate="validate" class="flex flex-col gap-3" @submit="handleSignIn">
                <UFormGroup :label="t('signIn.form.email_label')" name="email" :error="formError" :hint="emailError"
                    :ui="{  hint: 'text-red-500 dark:text-red-500 text-sm',
                        error: isMobile ? 'text-red-500 dark:text-red-500 text-sm' : 'hidden'
                    }">
                    <UInput size="sm" v-model="state.email" :placeholder="t('signIn.form.email_placeholder', { atSign: '@' })" class="w-full"
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

                <UFormGroup :label="t('signIn.form.password_label')" name="password" :hint="''"
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
                                :aria-label="show ? t('signIn.form.hide_password') : t('signIn.form.show_password')"
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

                <UFormGroup :label="t('signIn.form.confirm_password_label')" name="secPasword" :hint="secPasswordError"
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
                                :aria-label="show2 ? t('signIn.form.hide_password') : t('signIn.form.show_password')"
                                :aria-pressed="show2"
                                aria-controls="password"
                                @click="show2 = !show2"
                            />
                        </template>
                    </UInput>
                </UFormGroup>

                <UButton type="submit" class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium">
                    {{ t('signIn.form.submit_button') }}
                </UButton>
            </UForm>
        </div>
        <div :class="[
            'mt-5 flex items-center justify-center',
            isMobile ? 'flex-wrap' : ''
        ]">
            <p class="text-sm">{{ t('signIn.already_have_account') }}</p>
            <UButton
                variant="link"
                @click="toggleForm"
                class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
            >
                {{ t('signIn.login_here') }}
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