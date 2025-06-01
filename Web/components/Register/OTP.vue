<script setup lang="ts">
    const config = useRuntimeConfig();

    // Define the type for the OtpInput component ref
    interface OtpInputInstance {
        resetOtp: () => void;
        getOtpValue: () => string;
    }

    const props = defineProps({
        isMobile: {
            type: Boolean,
            default: false
        },
        email: String,
        otpLength: {
            type: Number,
            default: 6
        }
    });

    const emit = defineEmits(['backToForgotPassword', 'showResetPassword']);

    // Specify the correct type for the ref
    const otpRef = ref<OtpInputInstance | null>(null);
    const formError = ref('');

    // Función para verificar el código OTP
    const verifyOTP = async () => {
        try {
            if (otpRef.value) {
                const code = otpRef.value.getOtpValue();
                if (code.length === props.otpLength) {
                    const response = await $fetch(`${config.public.apiUrl}/validate`, {
                        method: "POST",
                        body: {
                            correo: props.email,
                            codigo: code,
                        },
                    });
                    emit('showResetPassword');
                } else {
                    formError.value = 'Código incompleto';
                }
            } else {
                formError.value = 'Error al obtener el código';
            }
        } catch(error) {
            formError.value = 'Código inválido o expirado';
            // Reset the OTP fields on error
            if (otpRef.value) {
                otpRef.value.resetOtp();
            }
        }
    }

    const backToForgotPassword = () => {
        emit('backToForgotPassword');
    }

    const resendCode = async () => {
        try {
            // Reset the OTP fields
            if (otpRef.value) {
                const response = await $fetch(`${config.public.apiUrl}/recover`, {
                    method: "POST",
                    body: {
                        correo: props.email,
                    },
                });
                otpRef.value.resetOtp();
                formError.value = '';
            }
        } catch (error) {
            formError.value = 'Error al reenviar el código';
        }
    }
</script>

<template>
    <div :class="[
        props.isMobile
            ? 'px-6 py-8 min-h-[450px] flex flex-col justify-center'
            : 'form-container w-full px-48 py-8 mt-[12.5%] absolute left-0 right-0'
    ]">
        <h2 :class="[
            'font-semibold text-Pure-Black dark:text-White-w mb-4',
            props.isMobile ? 'text-xl' : 'text-2xl'
        ]">
            INGRESA EL CÓDIGO DE VERIFICACIÓN
        </h2>

        <p class="text-sm text-gray-600 dark:text-gray-300 mb-8">
            Se ha enviado un código a tu correo electrónico
            <span class="font-bold">{{ props.email }}</span>
        </p>

        <div class="mb-6">
            <div class="flex flex-col gap-3">
                <UtilitiesOTP
                    ref="otpRef"
                    :isMobile="props.isMobile"
                    :length="props.otpLength"
                />

                <!-- Display error message -->
                <div v-if="formError" class="mt-2 mb-0">
                    <p class="text-red-500 text-sm text-center">{{ formError }}</p>
                </div>

                <UButton
                    @click="verifyOTP"
                    class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium"
                >
                    Verificar Código
                </UButton>
            </div>
        </div>

        <div class="mt-5 flex flex-col items-center justify-center">
            <p class="text-sm text-center">¿No recibiste el código?
                <UButton
                    variant="link"
                    @click="resendCode"
                    class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
                >
                    Reenviar código
                </UButton>
            </p>
            <UButton
                variant="link"
                @click="backToForgotPassword"
                class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
            >
                Volver a Recuperación de Contraseña
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