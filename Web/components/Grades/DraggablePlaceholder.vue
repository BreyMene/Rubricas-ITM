<script setup lang="ts">
    interface Props {
        icon: string;
        label: string;
        type: string;
    }

    const props = defineProps<Props>();

    const handleDragStart = (event: DragEvent) => {
    if (event.dataTransfer) {
        event.dataTransfer.setData('application/x-badge', props.type);
        event.dataTransfer.effectAllowed = 'copy';

        // Detect dark mode
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const bg = isDark ? '#807467' : '#523a72';
        const color = isDark ? '#fff' : '#fff';

        // Create a styled drag image
        const dragEl = document.createElement('div');
        dragEl.innerText = props.label;
        dragEl.style.padding = '6px 16px';
        dragEl.style.background = bg;
        dragEl.style.color = color;
        dragEl.style.borderRadius = '9999px';
        dragEl.style.fontWeight = 'bold';
        dragEl.style.fontSize = '14px';
        dragEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        dragEl.style.position = 'absolute';
        dragEl.style.top = '-1000px';
        dragEl.style.left = '-1000px';
        document.body.appendChild(dragEl);
        event.dataTransfer.setDragImage(dragEl, dragEl.offsetWidth / 2, dragEl.offsetHeight / 2);
        setTimeout(() => document.body.removeChild(dragEl), 0);
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