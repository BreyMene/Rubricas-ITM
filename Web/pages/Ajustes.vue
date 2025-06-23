<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const toast = useToast();

const useDocente = useDocenteStore();
const email = ref(useDocente.getCorreo);
const originalEmail = ref(useDocente.getCorreo);
const isConfirmDeleteOpen = ref(false);
const isDeleting = ref(false);
const showEmailOTP = ref(false);
const isEmailModalOpen = ref(false);

// Email OTP states
const emailError = ref('');
const emailFormError = ref('');

// Define the type for the OtpInput component ref
interface OtpInputInstance {
    resetOtp: () => void;
    getOtpValue: () => string;
}

// Email OTP ref
const emailOtpRef = ref<OtpInputInstance | null>(null);

const { locale, t } = useI18n()
const language = ref(locale.value)

const languages = [
    { value: 'es', label: 'Español', icon: 'fluent:globe-24-filled' },
    { value: 'en', label: 'English', icon: 'fluent:globe-24-filled' }
];

const config = useRuntimeConfig();

watch(language, (lang) => {
  locale.value = lang
})

// Watch for modal close to reset all states
watch(isEmailModalOpen, (newValue) => {
    if (!newValue) {
        setTimeout(() => {
            // Reset all states when modal is closed
            email.value = originalEmail.value;
            showEmailOTP.value = false;
            emailError.value = '';
            emailFormError.value = '';
        }, 300);
    }
});

const validateEmail = () => {
    emailError.value = '';
    emailFormError.value = '';

    if (!email.value) {
        emailError.value = t('ajustes.email_required');
        return false;
    }

    if (!email.value.endsWith('@correo.itm.edu.co')) {
        emailError.value = t('ajustes.email_must_be_institutional');
        return false;
    }

    if (email.value === originalEmail.value) {
        emailError.value = t('ajustes.email_new_must_be_different');
        return false;
    }

    return true;
};

const updateEmail = async () => {
    if (!validateEmail()) return;

    try {
        const docenteStore = useDocenteStore();
        if (!docenteStore.docente) {
            emailFormError.value = t('ajustes.no_authenticated_user');
            emailError.value = emailFormError.value;
            return;
        }

        // Send email change OTP to the original email
        await $fetch(`${config.public.apiUrl}/send-email-change-code`, {
            method: 'POST',
            body: {
                correo: originalEmail.value,
            },
        });
        
        isEmailModalOpen.value = true;
        showEmailOTP.value = true;
    } catch (error: any) {
        emailFormError.value = t('ajustes.otp_error_sending');
        emailError.value = emailFormError.value;
    }
};

const verifyEmailOTP = async () => {
    try {
        if (emailOtpRef.value) {
            const code = emailOtpRef.value.getOtpValue();
            if (code.length === 6) {
                const docenteStore = useDocenteStore();
                if (!docenteStore.docente) {
                    emailFormError.value = t('ajustes.no_authenticated_user');
                    return;
                }

                // Validate email change OTP (with original email)
                await $fetch(`${config.public.apiUrl}/validate-email-change`, {
                    method: "POST",
                    body: {
                        correo: originalEmail.value,
                        codigo: code,
                    },
                });

                // If OTP is valid, proceed with email change
                await $fetch(`${config.public.apiUrl}/change-email`, {
                    method: "PUT",
                    body: {
                        correoActual: originalEmail.value,
                        correoNuevo: email.value,
                    },
                });
                
                // Update the original email reference
                originalEmail.value = email.value;
                // Update the store
                docenteStore.docente.correo = email.value;

                // Show success toast
                toast.add({
                  title: t('ajustes.otp_success'),
                  icon: "fluent:checkmark-circle-16-filled",
                  timeout: 3000,
                  ui: {
                    'background': 'bg-Warm-White dark:bg-Medium-Dark',
                    'rounded': 'rounded-lg',
                    'shadow': 'shadow-lg',
                    'ring': 'ring-0',
                    'title': 'text-base font-semibold text-Pure-Black dark:text-White-w',
                    'description': 'mt-1 text-sm text-gray-500 dark:text-Light-Gray',
                    'icon': {
                      'base': 'flex-shrink-0 w-5 h-5',
                      'color': 'text-Purple-P dark:text-Muted-Brown'
                    },
                    'progress': {
                      'base': 'absolute bottom-0 end-0 start-0 h-1',
                      'background': 'bg-Purple-P/60 dark:bg-Muted-Brown/60'
                    },
                    'closeButton': {
                      'base': 'absolute top-2 right-2',
                      'icon': 'fluent:add-16-filled',
                      'color': 'text-gray-400 hover:text-gray-500 dark:text-Light-Gray dark:hover:text-White-w'
                    }
                  }
                });

                isEmailModalOpen.value = false;
            } else {
                emailFormError.value = t('ajustes.otp_incomplete');
            }
        }
    } catch (error) {
        emailFormError.value = t('ajustes.otp_invalid');
    }
};

const resendEmailOTP = async () => {
    try {
        const docenteStore = useDocenteStore();
        if (!docenteStore.docente) {
            emailFormError.value = t('ajustes.no_authenticated_user');
            return;
        }

        // Resend email change OTP to the original email
        await $fetch(`${config.public.apiUrl}/send-email-change-code`, {
            method: 'POST',
            body: {
                correo: originalEmail.value,
            },
        });
        
        if (emailOtpRef.value) {
            emailOtpRef.value.resetOtp();
        }
    } catch (error) {
        emailFormError.value = t('ajustes.otp_error_resending');
    }
};

const deleteAccount = async () => {
    isDeleting.value = true;
    
    try {
        await navigateTo('/login');
    } catch (error) {
        console.error('Error deleting account:', error);
    } finally {
        isDeleting.value = false;
        isConfirmDeleteOpen.value = false;
    }
};
</script>

<template>
    <div class="container mx-auto p-6">
        <div class="flex flex-col gap-6">
            <div class="flex-1">
                <div class="max-w-3xl mx-auto bg-White-w dark:bg-Warm-Dark/60 rounded-lg shadow-lg p-8 transition-colors duration-150">
                    <h1 class="text-2xl font-bold mb-8 text-Pure-Black dark:text-White-w transition-colors duration-150">{{ t('ajustes.settings') }}</h1>
                    
                    <!-- Email Section -->
                    <div class="mb-8 p-6 bg-Warm-White/50 dark:bg-Pure-Black/50 rounded-xl shadow-md transition-all duration-150 hover:shadow-lg">
                        <h2 class="text-xl font-semibold mb-4 text-Pure-Black dark:text-White-w transition-colors duration-150">{{ t('ajustes.email_section') }}</h2>
                        <div class="flex gap-4 items-start">
                            <div class="flex-1">
                                <UInput 
                                    v-model="email" 
                                    type="email" 
                                    :placeholder="t('ajustes.email_placeholder')" 
                                    class="transition-all duration-150"
                                    :ui="{
                                        ring: emailError ? 'ring-2 ring-red-500 focus:ring-2 focus:ring-red-500' : 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                                        color: {
                                            gray: {
                                                outline: 'shadow-lg bg-White-w dark:bg-Warm-Dark text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                            }
                                        }
                                    }"
                                    color="gray"
                                />
                            </div>
                            <UButton 
                                @click="updateEmail" 
                                class="bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-150 shrink-0"
                            >
                            {{ t('ajustes.update') }}
                            </UButton>
                        </div>
                        <div v-if="emailError" class="mt-2">
                            <p class="text-red-500 text-sm">{{ emailError }}</p>
                        </div>
                    </div>

                    <!-- Password Section -->
                    <div class="mb-8 p-6 bg-Warm-White/50 dark:bg-Pure-Black/50 rounded-xl shadow-md">
                        <UserChangePassword />
                    </div>

                    <!-- Language Section -->
                    <div class="mb-8 p-6 bg-Warm-White/50 dark:bg-Pure-Black/50 rounded-xl shadow-md transition-all duration-150 hover:shadow-lg">
                        <h2 class="text-xl font-semibold mb-4 text-Pure-Black dark:text-White-w transition-colors duration-150">{{ t('ajustes.language_section') }}</h2>
                        <USelectMenu 
                            v-model="language" 
                            :options="languages"
                            option-attribute="label"
                            value-attribute="value"
                            class="w-full"
                            :uiMenu="{
                                background: 'bg-White-w dark:bg-Medium-Dark',
                                shadow: 'shadow-lg',
                                rounded: 'rounded-lg',
                                padding: 'p-1',
                                ring: 'ring-1 ring-gray-200 dark:ring-Dark-Grey',
                                option: {
                                    base: 'flex items-center gap-2',
                                    active: 'bg-Medium-Blue/20 dark:bg-Medium-Gray/20',
                                    selected: 'text-Purple-P dark:text-Muted-Brown'
                                }
                            }"
                            :ui="{
                                ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                                color: {
                                    gray: {
                                        outline: 'shadow-lg bg-White-w dark:bg-Warm-Dark text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                    }
                                },
                                option: {
                                    base: 'flex items-center gap-2',
                                    active: 'bg-Medium-Blue/20 dark:bg-Medium-Gray/20',
                                    selected: 'text-Purple-P dark:text-Muted-Brown'
                                },
                                
                            }"
                            color="gray"
                        >
                            <template #option="{ option }">
                                <UIcon :name="option.icon" class="text-Purple-P dark:text-Muted-Brown" />
                                <span>{{ option.label }}</span>
                            </template>
                        </USelectMenu>
                    </div>

                    <!-- Delete Account Section -->
                    <div class="mb-8 p-6 border border-red-500/30 rounded-lg transition-all duration-150 hover:border-red-500/50 hover:shadow-lg">
                        <div class="flex items-center mb-4">
                            <UIcon name="fluent:warning-24-filled" class="text-red-500 text-2xl mr-2 transition-transform duration-150 hover:scale-110" />
                            <h2 class="text-xl font-semibold text-red-500 transition-colors duration-150">{{ t('ajustes.delete_account_section') }}</h2>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {{ t('ajustes.delete_account_warning') }}
                        </p>
                        <UButton 
                            @click="isConfirmDeleteOpen = true" 
                            color="red"
                            variant="soft"
                            class="w-full sm:w-auto"
                        >
                            {{ t('ajustes.confirm_deletion') }}
                        </UButton>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Email OTP Verification Modal -->
    <UModal 
        v-model="isEmailModalOpen"
        prevent-close 
        :ui="{
            width: 'w-full sm:max-w-md',
            height: 'max-h-[700px]',
            container: 'flex items-center justify-center',
            overlay: { background: 'dark:bg-Light-Gray/15' },
        }"
    >
        <UCard :ui="{
            background: 'dark:bg-Medium-Dark',
            ring: '',
            divide: '',
            header: { base: 'p-1 pb-0' },
            base: 'w-full',
        }">
            <template #header>
                <div class="flex justify-end">
                    <UButton
                        color="gray"
                        variant="ghost"
                        icon="fluent:dismiss-12-filled"
                        class="-m-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
                        @click="isEmailModalOpen = false"
                    />
                </div>
            </template>

            <div class="pt-0 px-4 pb-4">
                <!-- Email OTP Verification -->
                <div v-if="showEmailOTP">
                    <div class="flex items-center mb-4">
                        <UIcon name="fluent:mail-24-filled" class="text-2xl mr-2 text-Purple-P dark:text-Muted-Brown" />
                        <h3 class="text-lg font-semibold dark:text-white">{{ t('ajustes.email_verification') }}</h3>
                    </div>
                    
                    <p class="mb-6 text-gray-700 dark:text-gray-300">
                        {{ t('ajustes.email_verification_sent') }} <span class="font-semibold">{{ originalEmail }}</span>
                    </p>
                    
                    <UtilitiesOTP 
                        ref="emailOtpRef"
                        :length="6"
                    />

                    <!-- Display general form error -->
                    <div v-if="emailFormError" class="mt-2 mb-0">
                        <p class="text-red-500 text-sm text-center">{{ emailFormError }}</p>
                    </div>
                    
                    <div class="flex justify-end gap-3 mt-6">
                        <UButton 
                            variant="link" 
                            color="gray"
                            @click="isEmailModalOpen = false"
                        >
                            {{ t('ajustes.cancel') }}
                        </UButton>
                        <UButton 
                            @click="verifyEmailOTP"
                            class="bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300"
                        >
                            {{ t('ajustes.verify') }}
                        </UButton>
                    </div>

                    <div class="mt-4 text-center">
                        <p class="text-sm">{{ t('ajustes.code_not_received') }}
                            <UButton
                                variant="link"
                                @click="resendEmailOTP"
                                class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
                            >
                                {{ t('ajustes.resend_code') }}
                            </UButton>
                        </p>
                    </div>
                </div>
            </div>
        </UCard>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isConfirmDeleteOpen" prevent-close :ui="{
        width: 'w-full sm:max-w-md',
        height: 'max-h-[700px]',
        container: 'flex items-center justify-center',
        overlay: { background: 'dark:bg-Light-Gray/15' },
    }">
        <UCard :ui="{
            background: 'dark:bg-Medium-Dark',
            ring: '',
            divide: '',
            base: 'w-full',
        }">
            <div class="p-4">
                <div class="flex items-center mb-4">
                    <UIcon name="fluent:warning-24-filled" class="text-red-500 text-2xl mr-2" />
                    <h3 class="text-lg font-semibold dark:text-white">Confirmar Eliminación</h3>
                </div>
                
                <p class="mb-6 text-gray-700 dark:text-gray-300">
                    {{ t('ajustes.confirm_deletion_message') }}
                </p>
                
                <div class="flex justify-end gap-3">
                    <UButton 
                        variant="link" 
                        color="gray"
                        @click="isConfirmDeleteOpen = false"
                        :disabled="isDeleting"
                    >
                        {{ t('ajustes.cancel') }}
                    </UButton>
                    <UButton 
                        color="red" 
                        @click="deleteAccount"
                    >
                        {{ t('ajustes.delete') }}
                    </UButton>
                </div>
            </div>
        </UCard>
    </UModal>
</template>