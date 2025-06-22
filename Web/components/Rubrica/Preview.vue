<script setup lang="ts">
  import type { Tema } from '~/utils/types';
  import { useDocenteStore } from "~/utils/store";
  import { useRubricPermissions } from "~/composables/useRubricPermissions";
  import { useI18n } from 'vue-i18n'

  const props = withDefaults(defineProps<{
    temas: Tema[];
    previewMode?: boolean;
    rubricaId?: string;
    isModerator?: boolean;
  }>(), {
    isModerator: true
  });

  const config = useRuntimeConfig();
  const fullTemas = ref<Tema[]>([]);
  const docenteID = useDocenteStore().getID;
  const { validateRubricAccess } = useRubricPermissions();
  const isLoading = ref(false);
  const { t } = useI18n()
  
  // Cache for rubric data to avoid repeated API calls
  const rubricCache = new Map<string, Tema[]>();
  
  // Debounce timer to prevent rapid API calls
  let hoverTimer: NodeJS.Timeout | null = null;
  const HOVER_DELAY = 300; // 300ms delay before fetching

  // Computed property to show either initial or full data
  const displayTemas = computed(() => {
    return fullTemas.value.length > 0 ? fullTemas.value : props.temas;
  });

  // Check if user has access to view rubric content
  const hasAccess = computed(() => {
    return props.isModerator === true;
  });

  // Function to fetch full rubric data with caching
  const fetchFullRubric = async () => {
    // Early return if user doesn't have access
    if (!hasAccess.value || !props.rubricaId) return;
    
    // Check cache first
    if (rubricCache.has(props.rubricaId)) {
      fullTemas.value = rubricCache.get(props.rubricaId)!;
      return;
    }
    
    try {
      isLoading.value = true;
      const { rubrica } = await validateRubricAccess(props.rubricaId, docenteID);
      const temas = rubrica.temas || [];
      
      // Cache the result
      rubricCache.set(props.rubricaId, temas);
      fullTemas.value = temas;
    } catch (error) {
      console.error('Error fetching full rubric:', error);
      // Fallback to initial data on error
      fullTemas.value = props.temas;
    } finally {
      isLoading.value = false;
    }
  };

  // State to track hover and access denial
  const isHovered = ref(false);
  const showAccessDenied = ref(false);

  // Handle hover state with debouncing
  const handleHover = (hovered: boolean) => {
    isHovered.value = hovered;

    if (hovered && !hasAccess.value) {
      // Show access denied message for non-moderators on hover
      showAccessDenied.value = true;
      return;
    }

    if (!hovered) {
      // Hide access denied message when not hovering
      showAccessDenied.value = false;
    }

    // Only proceed with API logic if user has access
    if (!hasAccess.value) return;

    // Clear any existing timer
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }

    if (hovered && props.rubricaId) {
      // Debounce the API call
      hoverTimer = setTimeout(() => {
        fetchFullRubric();
      }, HOVER_DELAY);
    } else {
      // Clear loading state and reset data when unhovering
      isLoading.value = false;
      fullTemas.value = [];
    }
  };

  // Cleanup timer on unmount
  onUnmounted(() => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }
  });
</script>

<template>
  <div 
    class="w-full h-full overflow-hidden rounded-lg relative transition-all duration-500 ease-out group hover:shadow-lg hover:shadow-Purple-P/20 dark:hover:shadow-Muted-Brown/10 hover:scale-[1.02] bg-MLight-White/50 dark:bg-Warm-Dark/30"
    @mouseenter="handleHover(true)"
    @mouseleave="handleHover(false)"
  >
    
    <!-- Access Denied Overlay (shown on hover for non-moderators) -->
    <div 
      v-if="showAccessDenied"
      class="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-black/90 backdrop-blur-sm z-20 transition-all duration-500 ease-out"
    >
      <div class="text-center text-Pure-Black/70 dark:text-White-w/60 transform transition-all duration-500 ease-out group-hover:scale-110">
        <div class="flex items-center justify-center mb-2">
          <UIcon 
            name="i-fluent-shield-prohibited-20-regular" 
            class="w-6 h-6 transition-all duration-500 ease-out group-hover:rotate-3 group-hover:scale-110 text-red-500 dark:text-red-400" 
          />
        </div>
        <div class="text-sm font-medium mb-1 transition-all duration-500 ease-out text-red-600 dark:text-red-400">{{ t('rubrica.preview_access_denied') }}</div>
        <div class="text-xs transition-all duration-500 ease-out">{{ t('rubrica.preview_no_permission') }}</div>
      </div>
    </div>

    <!-- Preview instruction overlay (default state for everyone) -->
    <div 
      class="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-black/80 backdrop-blur-sm transition-all duration-500 ease-out pointer-events-none"
      :class="{ 
        'opacity-0': (hasAccess && isHovered && !isLoading) || showAccessDenied,
        'opacity-100': !isHovered || !hasAccess 
      }"
    >
      <div class="text-center text-Pure-Black/70 dark:text-White-w/60 transform transition-all duration-500 ease-out group-hover:scale-110">
        <div class="flex items-center justify-center mb-2">
          <UIcon 
            name="i-fluent-clipboard-text-32-regular" 
            class="w-6 h-6 transition-all duration-500 ease-out group-hover:rotate-3 group-hover:scale-110 text-Purple-P dark:text-Muted-Brown" 
          />
        </div>
        <div class="text-sm font-medium mb-1 transition-all duration-500 ease-out text-Purple-P dark:text-Muted-Brown">{{ t('rubrica.preview_title') }}</div>
        <div class="text-xs transition-all duration-500 ease-out">{{ t('rubrica.preview_instruction') }}</div>
      </div>
    </div>

    <!-- Rubric content (only visible to moderators on hover) -->
    <div 
      v-if="hasAccess"
      class="w-full h-full transition-all duration-500 ease-out p-3 relative"
      :class="{ 'blur-0': !isLoading, 'blur-[1px]': isLoading }"
    >
      <!-- Loading Screen Component -->
      <div 
        v-if="isLoading" 
        class="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-all duration-500 ease-out"
      >
        <UtilitiesLoadingScreen 
          :isLoading="isLoading"
          :message="t('rubrica.preview_loading')"
          :noBackground="true"
          :noSpinnerBackground="true"
          spinnerSize="sm"
        />
      </div>

      <!-- Mini Table Header -->
      <div class="hidden group-hover:flex text-[8px] font-bold text-Pure-Black dark:text-White-w mb-1 leading-tight transition-all duration-500 ease-out bg-Warm-White dark:bg-Warm-Dark rounded-lg shadow-sm">
        <div class="w-[20%] px-2 py-0.5 text-left">{{ t('rubrica.preview_table_tema') }}</div>
        <div class="w-[30%] px-2 py-0.5 text-left">{{ t('rubrica.preview_table_criterio') }}</div>
        <div class="w-[10%] px-2 py-0.5 text-center">{{ t('rubrica.preview_table_peso') }}</div>
        <div class="w-[10%] px-2 py-0.5 text-center">{{ t('rubrica.preview_table_cal') }}</div>
        <div class="w-[10%] px-2 py-0.5 text-center">{{ t('rubrica.preview_table_acum') }}</div>
        <div class="w-[20%] px-2 py-0.5 text-center">{{ t('rubrica.preview_table_obs') }}</div>
      </div>

      <!-- Real content -->
      <div class="hidden group-hover:block max-h-[calc(100%-20px)] overflow-y-auto relative">
        <template v-if="!isLoading">
          <template v-for="(tema, temaIndex) in displayTemas" :key="temaIndex">
            <div class="mb-1">
              <template v-for="(criterio, cIndex) in tema.criterios" :key="cIndex">
                <div 
                  class="flex text-[8px] leading-tight transition-all duration-300 ease-out hover:bg-opacity-80"
                  :class="{
                    'bg-Warm-White dark:bg-Pure-Black/50 rounded-lg hover:bg-MLight-White dark:hover:bg-Dark-Grey': (displayTemas.slice(0, temaIndex).reduce((sum, t) => sum + t.criterios.length, 0) + cIndex) % 2 === 0,
                    'bg-transparent dark:bg-transparent hover:bg-MLight-White/50 dark:hover:bg-Dark-Grey/50': (displayTemas.slice(0, temaIndex).reduce((sum, t) => sum + t.criterios.length, 0) + cIndex) % 2 === 1
                  }"
                  :style="{ transitionDelay: `${(temaIndex * tema.criterios.length + cIndex) * 30}ms` }"
                >
                  <!-- Tema name in first column of first criterion, empty otherwise -->
                  <div class="w-[20%] px-2 py-0.5 text-left">
                    <span 
                      class="truncate block transition-all duration-300 ease-out"
                      :class="{
                        'font-medium text-Pure-Black dark:text-White-w': cIndex === 0,
                        'ml-4 text-Pure-Black/70 dark:text-White-w/70': cIndex !== 0
                      }"
                    >
                      {{ cIndex === 0 ? tema.nombre : '' }}
                    </span>
                  </div>
                  <div class="w-[30%] px-2 py-0.5 text-left">
                    <span class="truncate text-Pure-Black/70 dark:text-White-w/70 block transition-all duration-300 ease-out hover:text-Pure-Black dark:hover:text-White-w">
                      {{ criterio.criterio }}
                    </span>
                  </div>
                  <div class="w-[10%] px-2 py-0.5 text-center text-Pure-Black/70 dark:text-White-w/70 flex items-center justify-center transition-all duration-300 ease-out hover:text-Purple-P dark:hover:text-Muted-Brown hover:font-medium">
                    {{ criterio.peso }}
                  </div>
                  <div class="w-[10%] px-2 py-0.5 text-center text-Pure-Black/70 dark:text-White-w/70 flex items-center justify-center transition-all duration-300 ease-out hover:text-Purple-P dark:hover:text-Muted-Brown hover:font-medium">
                    {{ criterio.calificacion }}
                  </div>
                  <div class="w-[10%] px-2 py-0.5 text-center text-Pure-Black/70 dark:text-White-w/70 flex items-center justify-center transition-all duration-300 ease-out hover:text-Purple-P dark:hover:text-Muted-Brown hover:font-medium">
                    {{ criterio.acumulado }}
                  </div>
                  <div class="w-[20%] px-2 py-0.5 flex items-center justify-center">
                    <span class="truncate text-Pure-Black/70 dark:text-White-w/70 text-center transition-all duration-300 ease-out hover:text-Pure-Black dark:hover:text-White-w">
                      {{ criterio.observaciones }}
                    </span>
                  </div>
                </div>
              </template>
            </div>
          </template>
        </template>
      </div>
    </div>

    <!-- Overlay for hover effect (for all users) -->
    <div class="absolute inset-0 bg-gradient-to-br from-Purple-P/10 to-Muted-Brown/10 dark:from-Purple-P/10 dark:to-Muted-Brown/10 rounded-lg pointer-events-none transition-all duration-500 ease-out group-hover:opacity-0" />
  </div>
</template>

<style scoped>
/* Smooth scrollbar styling */
.max-h-\[calc\(100\%-20px\)\]::-webkit-scrollbar {
  width: 4px;
}

.max-h-\[calc\(100\%-20px\)\]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-\[calc\(100\%-20px\)\]::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  transition: background 0.3s ease;
}

.max-h-\[calc\(100\%-20px\)\]::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

/* Dark mode scrollbar */
.dark .max-h-\[calc\(100\%-20px\)\]::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark .max-h-\[calc\(100\%-20px\)\]::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* Custom gradient animation */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>