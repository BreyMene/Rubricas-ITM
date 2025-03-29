<script setup lang="ts">
const props = defineProps({
    isMobile: {
        type: Boolean,
        default: false
    },
    email: String 
});

const emit = defineEmits(['backToForgotPassword', 'showResetPassword']);

const otpState = reactive({
    digit1: '',
    digit2: '',
    digit3: '',
    digit4: '',
    digit5: '',
    digit6: ''
});

// Función para verificar el código OTP
const verifyOTP = () => {
    try{
        if(otpState.digit1 && otpState.digit2 && otpState.digit3 && otpState.digit4 && otpState.digit5 && otpState.digit6)
        {
            const code = `${otpState.digit1}${otpState.digit2}${otpState.digit3}${otpState.digit4}${otpState.digit5}${otpState.digit6}`;
            emit('showResetPassword');
            console.log('Verificando código OTP:', code);
        }
        else{
            console.log('No hay codigo');
        }
    }catch(error){
        console.error('Error:', error);
    }
}

// Función para manejar el cambio de input y pasar al siguiente
const handleOtpInput = (event: Event, digit: string, nextDigit: string | null) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const isMobile = target.id.includes('mobile-');
    
    // Clean input to ensure only one digit
    const cleanValue = value.replace(/\D/g, '').slice(-1);
    
    // Update the state value
    otpState[digit as keyof typeof otpState] = cleanValue;
    
    // Move to next input
    if (cleanValue && nextDigit) {
        const nextInputId = isMobile ? `mobile-${nextDigit}` : `desktop-${nextDigit}`;
        const nextInput = document.getElementById(nextInputId);
        if (nextInput) {
            nextInput.focus();
        }
    }
}

// Función para manejar la tecla de eliminar
const handleBackspace = (event: KeyboardEvent, digit: string, prevDigit: string | null) => {
    if (event.key === 'Backspace') {
        const target = event.target as HTMLInputElement;
        const isMobile = target.id.includes('mobile-');
        const currentValue = otpState[digit as keyof typeof otpState];
        
        // If current input has a value, clear it but stay in the same input
        if (currentValue) {
            otpState[digit as keyof typeof otpState] = '';
            event.preventDefault(); // Prevent default to avoid double deletion
        } 
        // If current is empty and there's a previous input, move to it
        else if (!currentValue && prevDigit) {
            const prevInputId = isMobile ? `mobile-${prevDigit}` : `desktop-${prevDigit}`;
            const prevInput = document.getElementById(prevInputId);
            if (prevInput) {
                prevInput.focus();
            }
        }
    }
}

const backToForgotPassword = () => {
    emit('backToForgotPassword');
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
                <div class="flex justify-center" :class="props.isMobile ? 'gap-1' : 'gap-2'">
                    <template v-for="(digit, index) in ['digit1', 'digit2', 'digit3', 'digit4', 'digit5', 'digit6']" :key="digit">
                        <UInput autoComplete="off"
                            :id="props.isMobile ? `mobile-${digit}` : `desktop-${digit}`"
                            :size="props.isMobile ? 'md' : 'lg'" 
                            type="tel" 
                            maxlength="1"
                            inputmode="numeric"
                            :class="[
                                'text-center font-bold',
                                props.isMobile ? 'w-8 h-10 text-base' : 'w-10 h-10 text-lg'
                            ]"
                            :ui="{
                                base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 uppercase',
                                form: 'group/form',
                                size: {
                                    md: props.isMobile ? 'text-base py-1.5 px-1' : ''
                                },
                                ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                                color: {
                                    gray: {
                                        outline: 'shadow-lg bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                    }
                                }
                            }"
                            color="gray"
                            v-model="otpState[digit as keyof typeof otpState]"
                            @input="handleOtpInput($event, digit, index < 5 ? `digit${index + 2}` : null)"
                            @keydown="handleBackspace($event, digit, index > 0 ? `digit${index}` : null)"
                        />
                    </template>
                </div>

                <UButton @click="verifyOTP" class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium">
                    Verificar Código
                </UButton>
            </div>
        </div>
        
        <div class="mt-5 flex flex-col items-center justify-center">
            <p class="text-sm text-center">¿No recibiste el código? 
                <UButton variant="link" class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w">
                    Reenviar código
                </UButton>
            </p>
            <UButton variant="link" @click="backToForgotPassword"
                class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w">
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