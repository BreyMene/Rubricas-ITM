<script setup lang="ts">
    import { useI18n } from 'vue-i18n'

    const { t } = useI18n()
    // Ref for the search input
    const searchQuery = ref('');

    defineProps<{ 
        placeholderText?: string 
    }>();

    const emit = defineEmits(['search']);

    // Watch for changes in searchQuery and emit the value
    watch(searchQuery, (newValue) => {
        emit('search', newValue.toLowerCase());
    });
</script>

<template>
    <UInput
        v-model="searchQuery"
        icon="fluent:search-12-filled"
        :placeholder="placeholderText || t('search_bar.placeholder') "
        size="lg"
        class="w-auto sm:w-96"
        :ui="{
            icon: {
                trailing: { pointer: '' }
            },
            base: 'relative block w-full',
            ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
            rounded: 'rounded-lg',
            color: {
                gray: {
                    outline: 'shadow-lg bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                }
            }
        }"
        color="gray">
            <template #trailing>
                <UButton
                v-show="searchQuery !== ''"
                color="gray"
                variant="link"
                icon="fluent:dismiss-12-filled"
                :padded="false"
                @click="searchQuery = ''"
                />
            </template>
    </UInput>
</template>