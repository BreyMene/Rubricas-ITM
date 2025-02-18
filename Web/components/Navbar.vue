<script setup lang="ts">
  import { ref, computed, onMounted, nextTick, onUnmounted, watch } from "vue";
  import { useRoute } from "vue-router";
  import type { RouteLocationNormalizedLoaded } from "vue-router";

  const route: RouteLocationNormalizedLoaded = useRoute();
  const menuRefs = ref<HTMLElement[]>([]);
  const activeX = ref<number>(0);
  const activeWidth = ref<number>(0);
  const readyForAnimation = ref<boolean>(false);
  const isLoading = ref<boolean>(true);

  const routes: string[] = ['/', '/equipos', '/rubricas'];
  const routeNames: string[] = ['Home', 'Equipos', 'Rubricas'];

  // Determinar índice activo basado en la ruta actual
  const activeIndex = computed<number>(() => {
    const index = routes.indexOf(route.path);
    return index !== -1 ? index : 0;
  });

  // Actualizar dimensiones del indicador
  const updateIndicator = (): void => {
    nextTick(() => {
      const el = menuRefs.value[activeIndex.value];
      if (el) {
        activeX.value = el.offsetLeft;
        activeWidth.value = el.offsetWidth;
        if (!readyForAnimation.value) {
          setTimeout(() => {
            readyForAnimation.value = true;
            isLoading.value = false;
          }, 50);
        }
      }
    });
  };

  // Manejador de clic seguro
  const handleClick = (index: number): void => {
    if (!isLoading.value) {
      nextTick(updateIndicator);
    }
  };

  // Ciclo de vida y eventos
  onMounted(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateIndicator);
  });

  // Observar cambios en la ruta
  watch(() => route.path, updateIndicator);
</script>

<template>
  <nav class="flex justify-center py-3 mt-8 font-semibold">
    <div class="flex items-center w-2/5 max-w-5xl justify-between relative">
      <!-- Left Logo -->
      <NuxtLink to="/">
        <NuxtImg width="60px" src="/img/ITMLogoLight.png" format="webp" densities="x1" />
      </NuxtLink>

      <!-- Centered Menu -->
      <div class="relative">
        <!-- Indicador animado -->
        <div
          class="absolute top-0 left-0 h-full bg-Dark-Blue rounded-lg"
          :style="{
            width: activeWidth > 0 ? activeWidth + 'px' : '0',
            transform: `translateX(${activeX}px)`,
            opacity: activeWidth > 0 ? 1 : 0,
            transition: readyForAnimation ? 'all 0.3s ease' : 'none'
          }"
        ></div>

        <!-- Menú -->
        <ul class="flex gap-4 relative">
          <li v-for="(route, index) in routes" :key="index" ref="menuRefs">
            <NuxtLink
              :to="route"
              class="px-3 py-2 rounded-lg relative z-10 flex items-center transition-colors duration-300"
              :class="{ 
                'text-White-w': activeIndex === index, 
                'text-black': activeIndex !== index,
                'bg-Dark-Blue': activeIndex === index && !activeWidth
              }"
              @click="updateIndicator">
                {{ routeNames[index] }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Right Profile Icon -->
      <div class="flex gap-5 items-center min-h-[48px]">
        <div class="w-[30px] h-[30px] flex items-center justify-center">
            <ThemeSelector />
        </div>
        <UIcon name="fluent:person-circle-32-regular" class="text-3xl"/>
      </div>
      
    </div>
  </nav>
</template>