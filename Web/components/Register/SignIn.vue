<script setup lang="ts">
    import type { FormError, FormSubmitEvent } from '#ui/types';    

    const props = defineProps({
        isMobile: {
            type: Boolean,
            default: false
        }
    });

    const emit = defineEmits(['toggleForm']);

    const state = reactive({
        email: '',
        password: '',
        secPasword: ''
    });

    // To display as a hint, instead of displaying the base error
    const emailError = ref('');
    const passwordError = ref('');
    const secPasswordError = ref('');

    const validate = (state: any): FormError[] => {
        const errors = [];
        
        emailError.value = '';
        passwordError.value = '';
        secPasswordError.value = '';

        // Email validation
        if (!state.email) {
            errors.push({ path: 'email', message: ' ' });
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(state.email)) {
            const message = 'Email inválido';
            if(!props.isMobile){
                errors.push({ path: 'email', message: ' ' });
                emailError.value = message;
            }else{
                errors.push({ path: 'email', message });
                emailError.value = '';
            }
        } else if (!state.email.endsWith('@correo.itm.edu.co')) {
            const message = 'Debe usar un correo institucional';
            if(!props.isMobile){
                errors.push({ path: 'email', message: ' ' });
                emailError.value = message;
            }else{
                errors.push({ path: 'email', message });
                emailError.value = '';
            }
        }
        
        // Password validation
        if (!state.password) {
            errors.push({ path: 'password', message: ' ' });
        } else if (state.password.length < 6) {
            const message = 'Minimo 6 caracteres';
            if(!props.isMobile){
                errors.push({ path: 'password', message: ' ' });
                passwordError.value = message;
            }else{
                errors.push({ path: 'password', message });
                passwordError.value = '';
            }
        }
        
        // Second password validation
        if (!state.secPasword) {
            errors.push({ path: 'secPasword', message: ' ' });
        } else if (state.password !== state.secPasword) {
            const message = 'Las contraseñas no coinciden';
            if(!props.isMobile){
                errors.push({ path: 'secPasword', message: ' ' });
                secPasswordError.value = message;
            }else{
                errors.push({ path: 'secPasword', message });
                secPasswordError.value = '';
            }
        }
        
        return errors;
    };

    const handleSignIn = async (event: FormSubmitEvent<any>) => {
        try {
            console.log('Sign-in data:', state);

            const docente: Docente = {
                email: state.email
            }
            useDocenteStore().setDocente(docente)
            await navigateTo("/")
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const toggleForm = () => {
        emit('toggleForm');
    }

    const show = ref(false)
    const show2 = ref(false)

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
                <UFormGroup label="Email" name="email" :hint="emailError"
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

                <UFormGroup label="Contraseña" name="password" :hint="passwordError"
                    :ui="{  hint: 'text-red-500 dark:text-red-500 text-sm',
                        error: isMobile ? 'text-red-500 dark:text-red-500 text-sm' : 'hidden' 
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