<script setup lang="ts">
    const props = defineProps({
        isMobile: {
            type: Boolean,
            default: false
        },
        length: {
            type: Number,
            default: 6
        }
    });

    // Create a simple array to hold the OTP digits
    const otpDigits = ref(Array(props.length).fill(''));
    
    // Function to handle input change and move to next input
    const handleOtpInput = (event: Event, index: number) => {
        const target = event.target as HTMLInputElement;
        const value = target.value;
        
        // Clean input to ensure only one digit
        const cleanValue = value.replace(/\D/g, '').slice(-1);
        
        // Update the state value
        otpDigits.value[index] = cleanValue;
        
        // Move to next input if value is entered and not the last input
        if (cleanValue && index < props.length - 1) {
            const isMobile = target.id.includes('mobile-');
            const nextInputId = isMobile ? `mobile-digit${index + 2}` : `desktop-digit${index + 2}`;
            const nextInput = document.getElementById(nextInputId);
            if (nextInput) {
                nextInput.focus();
            }
        }
    }

    const handleKeyPress = (event: KeyboardEvent) => {
        // Block if the key pressed is not a digit
        // Allow only digits 0-9, Backspace, Tab, and arrow keys for navigation
        const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'];
        
        if (!allowedKeys.includes(event.key)) {
            event.preventDefault();
        }
    }

    const handleKeyDown = (event: KeyboardEvent, index: number) => {
        // Handle backspace
        if (event.key === 'Backspace') {
            handleBackspace(event, index);
        }
        
        // Add arrow key navigation
        else if (event.key === 'ArrowRight' && index < props.length - 1) {
            const target = event.target as HTMLInputElement;
            const isMobile = target.id.includes('mobile-');
            const nextInputId = isMobile ? `mobile-digit${index + 2}` : `desktop-digit${index + 2}`;
            const nextInput = document.getElementById(nextInputId);
            if (nextInput) {
                nextInput.focus();
            }
        } else if (event.key === 'ArrowLeft' && index > 0) {
            const target = event.target as HTMLInputElement;
            const isMobile = target.id.includes('mobile-');
            const prevInputId = isMobile ? `mobile-digit${index}` : `desktop-digit${index}`;
            const prevInput = document.getElementById(prevInputId);
            if (prevInput) {
                prevInput.focus();
            }
        }
    }

    // Function to handle backspace key
    const handleBackspace = (event: KeyboardEvent, index: number) => {
        if (event.key === 'Backspace') {
            const target = event.target as HTMLInputElement;
            const currentValue = otpDigits.value[index];
            
            // If current input has a value, clear it but stay in the same input
            if (currentValue) {
                otpDigits.value[index] = '';
                event.preventDefault(); // Prevent default to avoid double deletion
            } 
            // If current is empty and not the first input, move to previous input
            else if (!currentValue && index > 0) {
                const isMobile = target.id.includes('mobile-');
                const prevInputId = isMobile ? `mobile-digit${index}` : `desktop-digit${index}`;
                const prevInput = document.getElementById(prevInputId);
                if (prevInput) {
                    prevInput.focus();
                }
            }
        }
    }

    // Handle paste functionality
    const handlePaste = (event: ClipboardEvent, index: number) => {
        event.preventDefault();
        const pastedText = event.clipboardData?.getData('text').trim();
        
        if (!pastedText) return;
        
        // Extract only digits from pasted text
        const digits = pastedText.replace(/\D/g, '');
        
        // Update inputs starting from the current index
        for (let i = 0; i < digits.length && (index + i) < props.length; i++) {
            otpDigits.value[index + i] = digits[i];
        }
        
        // Focus the appropriate input after pasting
        const focusIndex = Math.min(index + digits.length, props.length - 1);
        const target = event.target as HTMLElement;
        const isMobile = target.id.includes('mobile-');
        const nextInputId = isMobile ? `mobile-digit${focusIndex + 1}` : `desktop-digit${focusIndex + 1}`;
        const nextInput = document.getElementById(nextInputId);
        
        if (nextInput) {
            nextInput.focus();
        }
    }

    // Method to reset the OTP
    const resetOtp = () => {
        for (let i = 0; i < props.length; i++) {
            otpDigits.value[i] = '';
        }
    }

    // Expose functions to parent component
    defineExpose({
        resetOtp,
        getOtpValue: () => otpDigits.value.join('')
    });
</script>

<template>
    <div class="flex justify-center" :class="props.isMobile ? 'gap-1' : 'gap-2'">
        <template v-for="(_, index) in Array(props.length).fill(0)" :key="index">
            <UInput 
                autoComplete="off"
                :id="props.isMobile ? `mobile-digit${index + 1}` : `desktop-digit${index + 1}`"
                :size="props.isMobile ? 'md' : 'lg'" 
                maxlength="1"
                inputmode="numeric"
                :class="[
                    'font-bold',
                    props.isMobile ? 'w-8 h-10 text-base' : 'w-10 h-10 text-lg'
                ]"
                :ui="{
                    base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 uppercase text-center',
                    form: 'group/form',
                    size: {
                        md: props.isMobile ? 'text-sm' : ''
                    },
                    ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                    color: {
                        gray: {
                            outline: 'shadow-lg bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                        }
                    }
                }"
                color="gray"
                v-model="otpDigits[index]"
                @input="handleOtpInput($event, index)"
                @keypress="handleKeyPress($event)"
                @keydown="handleKeyDown($event, index)"
                @paste="handlePaste($event, index)"
            />
        </template>
    </div>
</template>