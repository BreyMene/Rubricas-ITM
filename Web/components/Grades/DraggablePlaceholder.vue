<script setup lang="ts">
interface Props {
    icon: string;
    label: string;
    placeholder: string;
}

const props = defineProps<Props>();

// Function to handle drag start
const handleDragStart = (event: DragEvent) => {
    if (event.dataTransfer) {
        event.dataTransfer.setData('text/plain', props.placeholder);
        event.dataTransfer.effectAllowed = 'copy';
    }
};
</script>

<template>
    <UButton
        size="sm"
        color="gray"
        variant="ghost"
        :icon="icon"
        draggable="true"
        @dragstart="handleDragStart"
        class="text-Purple-P dark:text-Muted-Brown cursor-move hover:bg-Purple-P/10 dark:hover:bg-Muted-Brown/10 group relative"
    >
        {{ label }}
        <UIcon
            name="fluent:arrow-move-24-filled"
            class="absolute -right-1 -top-1 w-3 h-3 text-Purple-P dark:text-Muted-Brown opacity-0 group-hover:opacity-100 transition-opacity"
        />
    </UButton>
</template> 