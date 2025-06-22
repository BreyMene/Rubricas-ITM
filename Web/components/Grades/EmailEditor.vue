<script setup lang="ts">
  import { Editor, EditorContent } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'
  import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
  import { Node } from '@tiptap/core'
  import Underline from '@tiptap/extension-underline'
  import TextAlign from '@tiptap/extension-text-align'
  import { Color } from '@tiptap/extension-color'
  import TextStyle from '@tiptap/extension-text-style'
  import Highlight from '@tiptap/extension-highlight'
  import { useI18n } from 'vue-i18n'

  const props = defineProps<{
    modelValue: string
    placeholder?: string
    type?: 'subject' | 'body'
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
  }>()

  const { t } = useI18n()
  const editor = ref<Editor>()

  // Map of badge types to their display labels
  const badgeLabels: Record<string, string> = {
    studentName: t('email_editor.badge_labels.studentName'),
    courseName: t('email_editor.badge_labels.courseName'),
    groupName: t('email_editor.badge_labels.groupName'),
    teacherName: t('email_editor.badge_labels.teacherName'),
    rubricName: t('email_editor.badge_labels.rubricName')
  }

  // Custom extension for badges
  const BadgeExtension = Node.create({
    name: 'badge',
    group: 'inline',
    inline: true,
    selectable: true,
    atom: true,
    content: 'text*',

    addAttributes() {
        return {
        type: {
            default: 'studentName',
            parseHTML: (element: HTMLElement) => element.getAttribute('data-type'),
            renderHTML: (attributes: { type: string }) => {
            return {
                'data-type': attributes.type,
                class: 'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-Purple-P/10 dark:bg-Muted-Brown/10 text-Purple-P dark:text-Muted-Brown'
            }
            }
        }
        }
    },

    parseHTML() {
        return [
        {
            tag: 'span[data-type]',
            getAttrs: (element: HTMLElement) => {
            if (typeof element === 'string') return {}
            return {
                type: element.getAttribute('data-type')
            }
            }
        }
        ]
    },

    renderHTML({ HTMLAttributes, node }) {
        return ['span', HTMLAttributes, node.textContent || '']
    }
  })

  onMounted(() => {
    editor.value = new Editor({
        content: props.modelValue,
        extensions: [
        StarterKit,
        BadgeExtension,
        ...(props.type === 'body' ? [
            Underline,
            TextStyle,
            Color,
            TextAlign.configure({
            types: ['heading', 'paragraph'],
            }),
            Highlight,
        ] : [])
        ],
        editorProps: {
        attributes: {
            class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none'
        }
        },
        onUpdate: ({ editor }) => {
        emit('update:modelValue', editor.getHTML())
        }
    })
  })

  onBeforeUnmount(() => {
    if (editor.value) {
        editor.value.destroy()
    }
  })

  watch(() => props.modelValue, (newValue) => {
    if (editor.value && editor.value.getHTML() !== newValue) {
        editor.value.commands.setContent(newValue, false)
    }
  })

  // Function to insert a badge
  const insertBadge = (type: string) => {
    if (!editor.value) return
    
    editor.value.chain()
        .focus()
        .insertContent({
        type: 'badge',
        attrs: { type },
        content: [
            { type: 'text', text: badgeLabels[type] || type }
        ]
        })
        .run()
  }

  // Function to insert badge at specific position
  const insertBadgeAtPosition = (type: string, position: number) => {
    if (!editor.value) return
    
    editor.value.chain()
        .setTextSelection(position)
        .insertContent({
        type: 'badge',
        attrs: { type },
        content: [
            { type: 'text', text: badgeLabels[type] || type }
        ]
        })
        .run()
  }

  // Handle drop event for badges
  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const badgeType = event.dataTransfer?.getData('application/x-badge');
    
    if (badgeType && editor.value) {
        // Get the editor view from the editor instance
        const view = editor.value.view;
        
        // Calculate the position from the drop coordinates
        const coords = { left: event.clientX, top: event.clientY };
        const pos = view.posAtCoords(coords);
        
        if (pos) {
            // Insert the badge at the calculated position
            insertBadgeAtPosition(badgeType, pos.pos);
        } else {
            // Fallback to regular insert if position calculation fails
            insertBadge(badgeType);
        }
    }
  };

  // Handle dragover to allow dropping
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  };

  // Expose the insertBadge method to parent components
  defineExpose({
    insertBadge
  })
</script>

<template>
  <div class="relative" :class="{'body-editor': type === 'body'}">
    <!-- Toolbar - Only show for body editor -->
    <div v-if="type === 'body'" class="flex flex-wrap justify-center gap-1 p-2 bg-White-w dark:bg-Warm-Dark rounded-t-lg">
      <UButton
        size="xs"
        color="gray"
        variant="ghost"
        :icon="editor?.isActive('bold') ? 'fluent:text-bold-24-filled' : 'fluent:text-bold-24-regular'"
        @click="editor?.chain().focus().toggleBold().run()"
        :class="[
          editor?.isActive('bold') ? 'bg-Purple-P/10 dark:bg-Muted-Brown/10' : '',
          'hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20'
        ]"
      />
      <UButton
        size="xs"
        color="gray"
        variant="ghost"
        :icon="editor?.isActive('italic') ? 'fluent:text-italic-24-filled' : 'fluent:text-italic-24-regular'"
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="[
          editor?.isActive('italic') ? 'bg-Purple-P/10 dark:bg-Muted-Brown/10' : '',
          'hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20'
        ]"
      />
      <UButton
        size="xs"
        color="gray"
        variant="ghost"
        :icon="editor?.isActive('underline') ? 'fluent:text-underline-24-filled' : 'fluent:text-underline-24-regular'"
        @click="editor?.chain().focus().toggleUnderline().run()"
        :class="[
          editor?.isActive('underline') ? 'bg-Purple-P/10 dark:bg-Muted-Brown/10' : '',
          'hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20'
        ]"
      />
      <UDivider orientation="vertical" class="mx-1" />
      <UButton
        size="xs"
        color="gray"
        variant="ghost"
        icon="fluent:text-align-left-24-regular"
        @click="editor?.chain().focus().setTextAlign('left').run()"
        :class="[
          editor?.isActive({ textAlign: 'left' }) ? 'bg-Purple-P/10 dark:bg-Muted-Brown/10' : '',
          'hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20'
        ]"
      />
      <UButton
        size="xs"
        color="gray"
        variant="ghost"
        icon="fluent:text-align-center-24-regular"
        @click="editor?.chain().focus().setTextAlign('center').run()"
        :class="[
          editor?.isActive({ textAlign: 'center' }) ? 'bg-Purple-P/10 dark:bg-Muted-Brown/10' : '',
          'hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20'
        ]"
      />
      <UButton
        size="xs"
        color="gray"
        variant="ghost"
        icon="fluent:text-align-right-24-regular"
        @click="editor?.chain().focus().setTextAlign('right').run()"
        :class="[
          editor?.isActive({ textAlign: 'right' }) ? 'bg-Purple-P/10 dark:bg-Muted-Brown/10' : '',
          'hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20'
        ]"
      />
      <UDivider orientation="vertical" class="mx-1" />
      <UButton
        size="xs"
        color="gray"
        variant="ghost"
        icon="fluent:text-bullet-list-24-regular"
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="[
          editor?.isActive('bulletList') ? 'bg-Purple-P/10 dark:bg-Muted-Brown/10' : '',
          'hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20'
        ]"
      />
      <UButton
        size="xs"
        color="gray"
        variant="ghost"
        icon="fluent:text-number-list-24-regular"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="[
          editor?.isActive('orderedList') ? 'bg-Purple-P/10 dark:bg-Muted-Brown/10' : '',
          'hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20'
        ]"
      />
      <UButton
        size="xs"
        color="gray"
        variant="ghost"
        icon="fluent:code-24-regular"
        @click="editor?.chain().focus().toggleCode().run()"
        :class="[
          editor?.isActive('code') ? 'bg-Purple-P/10 dark:bg-Muted-Brown/10' : '',
          'hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20'
        ]"
      />
      <UButton
        size="xs"
        color="gray"
        variant="ghost"
        icon="fluent:highlight-24-regular"
        @click="editor?.chain().focus().toggleHighlight().run()"
        :class="[
          editor?.isActive('highlight') ? 'bg-Purple-P/10 dark:bg-Muted-Brown/10' : '',
          'hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20'
        ]"
      />
      <UDivider orientation="vertical" class="mx-1" />
      <UButton
        size="xs"
        color="gray"
        variant="ghost"
        icon="fluent:arrow-undo-24-regular"
        @click="editor?.chain().focus().undo().run()"
        :disabled="!editor?.can().undo()"
        class="hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
      />
      <UButton
        size="xs"
        color="gray"
        variant="ghost"
        icon="fluent:arrow-redo-24-regular"
        @click="editor?.chain().focus().redo().run()"
        :disabled="!editor?.can().redo()"
        class="hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
      />
    </div>
    <!-- Editor -->
    <EditorContent
      :editor="editor"
      :class="[
        'w-full rounded-lg bg-White-w dark:bg-Warm-Dark px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-Purple-P dark:focus:border-Muted-Brown overflow-y-auto',
        type === 'body' ? 'rounded-t-none min-h-[200px] max-h-[200px]' : 'min-h-[40px] max-h-[60px]'
      ]"
      @drop="handleDrop"
      @dragover="handleDragOver"
    />
  </div>
</template>

<style>
.ProseMirror {
  min-height: 40px;
  outline: none;
}

.ProseMirror p {
  margin: 0;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

/* Text alignment classes */
.ProseMirror .text-left {
  text-align: left;
}

.ProseMirror .text-center {
  text-align: center;
}

.ProseMirror .text-right {
  text-align: right;
}
</style>