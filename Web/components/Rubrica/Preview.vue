<script setup lang="ts">
  import type { Tema } from '~/utils/types';
  import { useDocenteStore } from "~/utils/store";
  import { useRubricPermissions } from "~/composables/useRubricPermissions";

  const props = defineProps<{
    temas: Tema[];
    previewMode?: boolean;
    rubricaId?: string;
  }>();

  const config = useRuntimeConfig();
  const fullTemas = ref<Tema[]>([]);
  const docenteID = useDocenteStore().getID;
  const { validateRubricAccess } = useRubricPermissions();
  const isLoading = ref(false);
  
  // Cache for rubric data to avoid repeated API calls
  const rubricCache = new Map<string, Tema[]>();
  
  // Debounce timer to prevent rapid API calls
  let hoverTimer: NodeJS.Timeout | null = null;
  const HOVER_DELAY = 300; // 300ms delay before fetching

  // Computed property to show either initial or full data
  const displayTemas = computed(() => {
    return fullTemas.value.length > 0 ? fullTemas.value : props.temas;
  });

  // Function to fetch full rubric data with caching
  const fetchFullRubric = async () => {
    if (!props.rubricaId) return;
    
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

  // Handle hover state with debouncing
  const handleHover = (isHovered: boolean) => {
    // Clear any existing timer
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }

    if (isHovered && props.rubricaId) {
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
    class="w-full h-full overflow-hidden rounded-lg relative transition-all duration-500 ease-out group hover:shadow-lg hover:scale-[1.02]"
    @mouseenter="handleHover(true)"
    @mouseleave="handleHover(false)"
  >
    <!-- Non-blurred overlay for preview instruction -->
    <div 
      class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm group-hover:opacity-0 transition-all duration-500 ease-out pointer-events-none"
    >
      <div class="text-center text-Pure-Black/60 dark:text-White-w/60 transform transition-all duration-500 ease-out group-hover:scale-110">
        <div class="flex items-center justify-center mb-2">
          <UIcon 
            name="i-fluent-clipboard-text-32-regular" 
            class="w-6 h-6 transition-all duration-500 ease-out group-hover:rotate-3 group-hover:scale-110" 
          />
        </div>
        <div class="text-sm font-medium mb-1 transition-all duration-500 ease-out">Vista Previa</div>
        <div class="text-xs transition-all duration-500 ease-out">Pasa el cursor para ver detalles</div>
      </div>
    </div>

    <!-- Blurred Preview -->
    <div class="w-full h-full transition-all duration-500 ease-out p-3 relative"
         :class="{ 'blur-0': !isLoading, 'blur-[1px]': isLoading }">
      <!-- Loading Screen Component -->
      <div 
        v-if="isLoading" 
        class="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-all duration-500 ease-out"
      >
        <UtilitiesLoadingScreen 
          :isLoading="isLoading"
          message="Cargando detalles..."
          :noBackground="true"
          :noSpinnerBackground="true"
          spinnerSize="sm"
        />
      </div>

      <!-- Mini Table Header -->
      <div class="flex text-[8px] font-bold text-Pure-Black dark:text-White-w mb-1 leading-tight transition-all duration-500 ease-out">
        <div class="w-[20%] px-2 py-0.5 text-left">Tema</div>
        <div class="w-[30%] px-2 py-0.5 text-left">Criterio</div>
        <div class="w-[10%] px-2 py-0.5 text-center">Peso</div>
        <div class="w-[10%] px-2 py-0.5 text-center">Cal</div>
        <div class="w-[10%] px-2 py-0.5 text-center">Acum</div>
        <div class="w-[20%] px-2 py-0.5 text-center">Obs</div>
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
                    'bg-White-w dark:bg-Warm-Dark rounded': (displayTemas.slice(0, temaIndex).reduce((sum, t) => sum + t.criterios.length, 0) + cIndex) % 2 === 0,
                    'bg-transparent dark:bg-transparent': (displayTemas.slice(0, temaIndex).reduce((sum, t) => sum + t.criterios.length, 0) + cIndex) % 2 === 1
                  }"
                  :style="{ transitionDelay: `${(temaIndex * tema.criterios.length + cIndex) * 30}ms` }"
                >
                  <!-- Tema name in first column of first criterion, empty otherwise -->
                  <div class="w-[20%] px-2 py-0.5 text-left">
                    <span 
                      class="truncate block transition-all duration-300 ease-out"
                      :class="{
                        'font-medium text-Pure-Black dark:text-White-w': cIndex === 0,
                        'ml-4': cIndex !== 0
                      }"
                    >
                      {{ cIndex === 0 ? tema.nombre : '' }}
                    </span>
                  </div>
                  <div class="w-[30%] px-2 py-0.5 text-left">
                    <span class="truncate text-Pure-Black dark:text-White-w/70 block transition-all duration-300 ease-out hover:text-Pure-Black dark:hover:text-White-w">
                      {{ criterio.criterio }}
                    </span>
                  </div>
                  <div class="w-[10%] px-2 py-0.5 text-center text-Pure-Black dark:text-White-w flex items-center justify-center transition-all duration-300 ease-out hover:font-medium">
                    {{ criterio.peso }}
                  </div>
                  <div class="w-[10%] px-2 py-0.5 text-center text-Pure-Black dark:text-White-w flex items-center justify-center transition-all duration-300 ease-out hover:font-medium">
                    {{ criterio.calificacion }}
                  </div>
                  <div class="w-[10%] px-2 py-0.5 text-center text-Pure-Black dark:text-White-w flex items-center justify-center transition-all duration-300 ease-out hover:font-medium">
                    {{ criterio.acumulado }}
                  </div>
                  <div class="w-[20%] px-2 py-0.5 flex items-center justify-center">
                    <span class="truncate text-Pure-Black dark:text-White-w/70 text-center transition-all duration-300 ease-out hover:text-Pure-Black dark:hover:text-White-w">
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

    <!-- Overlay for hover effect -->
    <div class="absolute inset-0 bg-white/20 dark:bg-black/30 rounded-lg pointer-events-none transition-all duration-500 ease-out group-hover:bg-transparent" />
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
</style>