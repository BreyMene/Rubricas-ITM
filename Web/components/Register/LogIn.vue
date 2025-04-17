<script setup lang="ts">
    import { useDocenteStore } from '~/utils/store';
    import type { FormSubmitEvent } from '#ui/types';

    const props = defineProps({
        isMobile: {
            type: Boolean,
            default: false
        }
    });

    const emit = defineEmits(['showForgotPassword', 'toggleForm']);

    const state = reactive({
        email: '',
        password: ''
    });

    // To display as a hint, instead of dsiplaying the base error
    const emailError = ref('');
    const passwordError = ref('');

    const validate = createFormValidator(emailError, passwordError, undefined, {
        isMobile: props.isMobile
    });

    const handleLogin = async (event: FormSubmitEvent<any>) => {
        try {
            console.log('Login data:', state);

            const docente: Docente = await $fetch("http://localhost:8000/login", {
                method: 'POST',
                body: {
                    correo: state.email,
                    contraseña: state.password,
                }
            })

            useDocenteStore().setDocente(docente)
            await navigateTo("/")
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const showForgotPassword = () => {
        emit('showForgotPassword');
    }

    const toggleForm = () => {
        emit('toggleForm');
    }

    const show = ref(false)
</script>

<template>
    <div :class="[
        isMobile ? 'px-6 py-8 min-h-[450px]' : 'form-container w-3/5 ml-[40%] px-14 py-8'
    ]">
        <h2 :class="[
            'font-semibold text-Pure-Black dark:text-White-w mb-8',
            isMobile ? 'text-xl text-center' : 'text-2xl'
        ]">
            INICIAR SESION
        </h2>
        <div class="mb-6">
            <UForm :state="state" :validate="validate" class="flex flex-col gap-3" @submit="handleLogin">
                <UFormGroup label="Email" name="email" :hint="emailError"
                    :ui="{  hint: 'text-red-500 dark:text-red-500 text-sm',
                        error: isMobile ? 'text-red-500 dark:text-red-500 text-sm' : 'hidden'
                    }" >
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
                    :ui="{  hint: 'text-red-500 dark:text-red-500',
                        error: isMobile ? '' : 'hidden'
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

                <div class="flex justify-end">
                    <UButton variant="link" class="w-fit text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
                        @click="showForgotPassword">
                        ¿Olvidaste tu contraseña?
                    </UButton>
                </div>

                <UButton type="submit" class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium">
                    Iniciar Sesión
                </UButton>
            </UForm>
        </div>
        <div :class="[
            'mt-5 flex items-center justify-center',
            isMobile ? 'flex-wrap' : ''
        ]">
            <p class="text-sm">No tienes Cuenta?</p>
            <UButton
                variant="link"
                @click="toggleForm"
                class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
            >
                Registrate Aqui
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