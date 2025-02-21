<script setup lang="ts">
  import { ref, computed } from "vue";

  const colorMode = useColorMode();

  // Variable para almacenar el tema seleccionado
  const selectedTheme = ref<string>(colorMode.preference);

  // Opciones del dropdown con evento de selección
  const themeOptions = computed(() => [
  [
      {
      label: "Light",
      icon: "fluent:brightness-high-16-regular",
      value: "light",
      click: () => changeTheme("light"),
      },
      {
      label: "Dark",
      icon: "fluent:weather-moon-28-filled",
      value: "dark",
      click: () => changeTheme("dark"),
      },
      {
      label: "System",
      icon: "fluent:desktop-28-regular",
      value: "system",
      click: () => changeTheme("system"),
      },
  ],
  ]);

  // Computed para definir el icono del botón principal
  const selectedIcon = computed(() => {
    if (selectedTheme.value === "light") return "fluent:brightness-high-16-regular";
    if (selectedTheme.value === "dark") return "fluent:weather-moon-28-filled";
    
    // If system theme, check the actual value instead of showing desktop icon
      return colorMode.value === "dark" 
          ? "fluent:weather-moon-28-filled" 
          : "fluent:brightness-high-16-regular";
  });

  // Función para cambiar el tema seleccionado
  const changeTheme = (theme: string) => {
    selectedTheme.value = theme;
    colorMode.preference = theme; 
  };
</script>

<template>
  <ClientOnly>
    <UDropdown 
      :items="themeOptions" 
      class="select-none" 
      :ui="{
            width: 'w-40',
            transition: {
                enterActiveClass: 'transition duration-300 ease-out'
            },
            rounded: 'rounded-2xl',
            ring: 'ring-0',
            background: 'bg-White-w dark:bg-Pure-Black',
            item: {
                rounded: 'rounded-2xl',
                active: 'dark:bg-Warm-Dark',
            },
            padding: 'p-2',
        }"
      >
        <UIcon :name="selectedIcon" class="text-3xl cursor-pointer" />
        
        <template #item="{ item, active }">
          <div class="flex items-center justify-between w-full px-3 py-1.5" :class="{ 'bg-gray-200 dark:bg-[#383332]': active }">
            <div class="flex items-center gap-2">
              <UIcon :name="item.icon" class="text-xl" />
              <span class="text-sm">{{ item.label }}</span>
            </div>
    
            <UIcon 
              v-if="selectedTheme === item.value" 
              name="fluent:checkmark-12-filled" 
              class="text-xl"
            />
          </div>
        </template>
        
      </UDropdown>

      <template #fallback>
            <USkeleton
                class="w-full h-full"
                :ui="{
                    base: 'animate-pulse',
                    rounded: 'rounded-full',
                    background: 'bg-gray-200 dark:bg-gray-800',
                }"
            />
      </template>
      
    </ClientOnly>
  </template>