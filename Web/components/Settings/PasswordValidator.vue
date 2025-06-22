<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps({
    password: {
        type: String,
        required: true
    },
    show: {
        type: Boolean,
        default: false
    }
});

const { t } = useI18n()

// Password validation rules
const passwordValidation = computed(() => {
    const password = props.password;
    const rules = [
        {
            id: 'length',
            label: t('passwordValidator.requirement_length'),
            valid: password.length >= 8
        },
        {
            id: 'uppercase',
            label: t('passwordValidator.requirement_uppercase'),
            valid: /[A-Z]/.test(password)
        },
        {
            id: 'lowercase',
            label: t('passwordValidator.requirement_lowercase'),
            valid: /[a-z]/.test(password)
        },
        {
            id: 'number',
            label: t('passwordValidator.requirement_number'),
            valid: /\d/.test(password)
        },
        {
            id: 'special',
            label: t('passwordValidator.requirement_special', { special: '!@#$%^&*()' }),
            valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        }
    ];

    const validCount = rules.filter(rule => rule.valid).length;
    const strength = validCount / rules.length;
    
    let strengthLabel = t('passwordValidator.very_weak');
    let strengthColor = 'red';
    let uiColor: 'red' | 'orange' | 'amber' | 'green' = 'red';
    
    if (strength >= 0.8) {
        strengthLabel = t('passwordValidator.strong');
        strengthColor = 'green';
        uiColor = 'green';
    } else if (strength >= 0.6) {
        strengthLabel = t('passwordValidator.medium');
        strengthColor = 'yellow';
        uiColor = 'amber';
    } else if (strength >= 0.4) {
        strengthLabel = t('passwordValidator.weak');
        strengthColor = 'orange';
        uiColor = 'orange';
    }

    return {
        rules,
        strength: strength * 100,
        strengthLabel,
        strengthColor,
        uiColor,
        isValid: validCount >= 4 // At least 4 out of 5 rules
    };
});

const validatorRef = ref<ComponentPublicInstance | null>(null);

// Click outside to close validator
const handleClickOutside = (event: MouseEvent) => {
    if (validatorRef.value && !validatorRef.value.$el?.contains(event.target as Node)) {
        emit('update:show', false);
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

const emit = defineEmits(['update:show']);
</script>

<template>
    <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
    >
        <div 
            v-if="show" 
            ref="validatorRef"
            class="absolute z-10 left-0 right-0 mt-1 p-3 bg-Warm-White dark:bg-Pure-Black rounded-md shadow-lg"
            @click.stop
        >
            <!-- Strength Bar using NuxtUI Progress -->
            <div class="mb-2">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {{ t('passwordValidator.strength_label') }}
                    </span>
                    <span :class="[
                        'text-xs font-medium',
                        passwordValidation.strengthColor === 'green' ? 'text-green-600 dark:text-green-400' :
                        passwordValidation.strengthColor === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                        passwordValidation.strengthColor === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                        'text-red-600 dark:text-red-400'
                    ]">
                        {{ passwordValidation.strengthLabel }}
                    </span>
                </div>
                <UProgress 
                    :value="passwordValidation.strength" 
                    :color="passwordValidation.uiColor"
                    size="md"
                    class="transition-all duration-300"
                />
            </div>

            <!-- Requirements List -->
            <div class="space-y-1">
                <div 
                    v-for="rule in passwordValidation.rules" 
                    :key="rule.id"
                    class="flex items-center text-xs"
                >
                    <UIcon 
                        :name="rule.valid ? 'heroicons:check-circle-20-solid' : 'heroicons:x-circle-20-solid'"
                        :class="[
                            'w-3 h-3 mr-2',
                            rule.valid ? 'text-green-500' : 'text-red-500'
                        ]"
                    />
                    <span :class="[
                        rule.valid ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    ]">
                        {{ rule.label }}
                    </span>
                </div>
            </div>
        </div>
    </Transition>
</template> 