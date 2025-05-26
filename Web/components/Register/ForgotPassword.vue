<script setup lang="ts">
const config = useRuntimeConfig();

const props = defineProps({
    isMobile: {
        type: Boolean,
        default: false
    },
    isReturningFromForgot: {
        type: Boolean,
        default: false
    }
});

const emailError = ref("");

const emit = defineEmits(['backToLogin', 'showOTPForm']);

const forgotPasswordState = reactive({
    email: ''
});

const validate = createFormValidator(emailError, undefined, undefined, {
  isMobile: props.isMobile,
});

const handleResetPassword = async () => {
    try {
        if(forgotPasswordState.email) {
            const response = await $fetch(`${config.public.apiUrl}/recover`, {
                method: "POST",
                body: {
                    correo: forgotPasswordState.email,
                },
            });
            emit('showOTPForm', forgotPasswordState.email);
        }
        else {
            console.log('No hay email ingresado');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

const backToLogin = () => {
    emit('backToLogin');
}
</script>

<template>
    <div :class="[
        props.isMobile
            ? 'px-6 py-8 min-h-[450px] flex flex-col justify-center'
            : 'form-container w-full px-60 py-8 mt-[12.5%] absolute left-0 right-0',
        {'faster-transition-out': props.isReturningFromForgot}
    ]">
        <h2 :class="[
            'font-semibold text-Pure-Black dark:text-White-w mb-8',
            props.isMobile ? 'text-xl text-center' : 'text-2xl'
        ]">
            RECUPERAR CONTRASEÑA
        </h2>
        <div class="mb-6">
            <UForm :state="forgotPasswordState" :validate="validate" @submit="handleResetPassword" class="flex flex-col gap-3">
                <UFormGroup label="Email" name="email" :hint="emailError"
                :ui="{
                    hint: 'text-red-500 dark:text-red-500 text-sm',
                    error: isMobile
                    ? 'text-red-500 dark:text-red-500 text-sm'
                    : 'hidden',
                }">
                    <UInput size="sm" v-model="forgotPasswordState.email" placeholder="ejemplo@correo.itm.edu.co"
                        class="w-full"
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

                <UButton type="submit" class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium">
                    Enviar Codigo
                </UButton>
            </UForm>
        </div>
        <div class="mt-5 flex items-center justify-center">
            <UButton variant="link" @click="backToLogin"
                class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w">
                Volver a Iniciar Sesión
            </UButton>
        </div>
    </div>
</template>

<style scoped>
.form-container {
    position: relative;
    will-change: opacity;
}

.faster-transition-out {
    transition: opacity 0.2s ease !important;
}
</style>