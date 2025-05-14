<script setup lang="ts">
    const props = defineProps({
        isMobile: {
            type: Boolean,
            default: false
        }
    });

    const emit = defineEmits(['backToLogin']);

    const passwordError = ref('');
    const secPasswordError = ref('');

    const state = reactive({
        password: '',
        secPasword: ''
    });

    const validate = createFormValidator(undefined, passwordError, secPasswordError, {
        isMobile: props.isMobile,
        minPasswordLength: 6
    });

    const handleSignIn = async () => {
        try {
            if(state.password && state.secPasword){
                emit('backToLogin', true);
            }
            else{
                console.log('No hay Nada');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const backToLogin = () => {
        emit('backToLogin', true);
    }

    const show = ref(false)
    const showConfirmPassword  = ref(false)

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
        <div class="mb-6">
            <UForm :state="state" :validate="validate" class="flex flex-col gap-3" @submit="handleSignIn">
                <UFormGroup label="Nueva Contraseña" name="password" :hint="passwordError"
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

                <UFormGroup label="Confirmar Contraseña" name="secPasword" :hint="secPasswordError"
                    :ui="{  hint: 'text-red-500 dark:text-red-500 text-sm',
                        error: isMobile ? 'text-red-500 dark:text-red-500 text-sm' : 'hidden'
                    }">
                    <UInput size="sm" v-model="state.secPasword" :type="showConfirmPassword  ? 'text' : 'password'" class="w-full"
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
                                :icon="showConfirmPassword  ? 'fluent:eye-off-16-filled' : 'fluent:eye-16-filled'"
                                :aria-label="showConfirmPassword  ? 'Hide password' : 'Show password'"
                                :aria-pressed="showConfirmPassword "
                                aria-controls="password"
                                @click="showConfirmPassword  = !showConfirmPassword "
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