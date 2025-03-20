<script setup lang="ts">
    const items = [
        [
            {
                label: 'example@gmail.com',
                slot: 'account',
                disabled: true
            }],
            [{
                label: 'Ajustes',
                icon: 'fluent:settings-28-filled'
            }],
            [{
                label: 'Cerrar Sesion',
                icon: 'ph:sign-out-bold'
            }
        ]
    ]
</script>

<template>
    <UDropdown
        :items="items"  class="select-none" 
        :ui="{
            width: 'w-40',
            transition: {
                enterActiveClass: 'transition-all duration-200 ease-out', //time it takes to come out
              enterFromClass: 'transform scale-0 opacity-90 origin-top-right', //scale from 90 to 100, creating the magnification effect
              enterToClass: 'transform scale-100 opacity-100 origin-top-right',
              leaveActiveClass: 'transition-all duration-200 ease-in',
              leaveFromClass: 'transform scale-100 opacity-100 origin-top-right',
              leaveToClass: 'transform scale-92 opacity-0 origin-top-right',
            },
            rounded: 'rounded-2xl',
            ring: 'ring-0',
            background: 'bg-White-w dark:bg-Pure-Black',
            item: {
                rounded: 'rounded-xl',
                active: 'dark:bg-Warm-Dark',
                disabled: 'cursor-text select-text'
            },
            padding: 'p-2',
            divide: 'dark:divide-Dark-Grey divide-opacity-50'
        }"
    >
        <UIcon name="fluent:person-circle-32-regular" class="text-2xl sm:text-3xl"/>

        <!-- Text Above the email -->
        <template #account="{ item }">
            <div class="text-left">
                <p>
                    Conectado como
                </p>
                <p class="truncate font-medium">
                    {{ item.label }}
                </p>
            </div>
        </template>
        
        <!-- Change position of the icons -->
        <template #item="{ item }">
            <span class="truncate">{{ item.label }}</span>
            <UIcon :name="item.icon" class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto" />
        </template>

    </UDropdown>
</template>