<script setup lang="ts">
  import { ref, computed, onMounted, nextTick, onUnmounted, watch } from "vue";
  import { useRoute } from "vue-router";
  import type { RouteLocationNormalizedLoaded } from "vue-router";
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const route: RouteLocationNormalizedLoaded = useRoute();
  const menuRefs = ref<HTMLElement[]>([]);
  const activeX = ref<number>(0);
  const activeWidth = ref<number>(0);
  const readyForAnimation = ref<boolean>(false);
  const isLoading = ref<boolean>(true);

  const routes: string[] = ['/', '/rubricas'];
  const routeNames = computed(() => [
    t('navbar.home'),
    t('navbar.rubrics')
  ]);

  // Determine active index based on current path
  const activeIndex = computed<number>(() => {
    // Check if the current path includes 'rubrica' in any form
    if (route.path.toLowerCase().includes('rubrica')) {
      return routes.indexOf('/rubricas');
    }
    
    const index = routes.indexOf(route.path);
    return index !== -1 ? index : 0;
  });

  // Update indicator dimensions
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

  // Life cycle and events
  onMounted(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateIndicator);
  });

  // Observe changes in the route
  watch(() => route.path, updateIndicator);

  // Watch for language changes
  watch(routeNames, () => {
    // Wait for DOM to update with new text content
    nextTick(() => {
      updateIndicator();
    });
  }, { deep: true });
</script>

<template>
  <nav class="flex justify-center py-3 mt-2 font-semibold mb-8">
    <div class="container mx-auto px-10 sm:px-5 flex items-center justify-between relative">
      <!-- Left Logo -->
      <div>
        <NuxtLink to="/">
          <NuxtImg sizes="50px sm:60px" src="/img/ITMLogo.png" format="webp" densities="x1 x2" class="dark:brightness-0 dark:invert  pointer-events-none select-none" />
        </NuxtLink>
      </div>
      
      <!-- Centered Menu -->
      <div class="relative flex items-center">
        <!-- Animated indicator -->
        <div
          class="absolute top-0 left-0 h-full bg-Dark-Blue rounded-lg dark:bg-Dark-Grey"
          :style="{
            width: activeWidth > 0 ? activeWidth + 'px' : '0',
            transform: `translateX(${activeX}px)`,
            opacity: activeWidth > 0 ? 1 : 0,
            transition: readyForAnimation ? 'all 0.3s ease' : 'none'
          }"
        ></div>

        <!-- Menu -->
        <ul class="flex gap-2 sm:gap-4 relative">
          <li v-for="(route, index) in routes" :key="index" ref="menuRefs">
            <NuxtLink
              :to="route"
              class="text-sm sm:text-base p-1 sm:px-3 sm:py-2 rounded-lg relative z-10 flex items-center transition-colors duration-300"
              :class="{ 
                'text-White-w': activeIndex === index, 
                'text-black dark:text-Light-Gray': activeIndex !== index,
                'bg-Dark-Blue dark:bg-Dark-Grey': activeIndex === index && !activeWidth
              }"
              @click="updateIndicator">
                {{ routeNames[index] }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Right Profile Icon -->
      <div class="flex gap-3 sm:gap-5 items-center min-h-[48px]">
        <div class="w-[30px] h-[30px] flex items-center justify-center">
            <ThemeSelector />
        </div>
        <UserProfile />
      </div>
      
    </div>
  </nav>
</template>