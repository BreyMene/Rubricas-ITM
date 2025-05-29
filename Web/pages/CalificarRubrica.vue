<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import type { Tema, Rubrica } from '~/utils/types'
  import html2pdf from 'html2pdf.js'

  const route = useRoute();
  const config = useRuntimeConfig();
  const toast = useToast();

  const temas = ref<Tema[]>([])
  const rubricName = ref('')
  const studentName = ref('')
  const notaId = ref('')

  const rubricContent = ref<HTMLElement | null>(null)

  // Add computed properties for totals
  const totalPeso = computed(() => {
    return temas.value.reduce((sum, tema) => {
      return sum + tema.criterios.reduce((temaSum, criterio) => temaSum + (criterio.peso || 0), 0);
    }, 0);
  });

  const totalCalificacion = computed(() => {
    return temas.value.reduce((sum, tema) => {
      return sum + tema.criterios.reduce((temaSum, criterio) => temaSum + (criterio.calificacion || 0), 0);
    }, 0);
  });

  const totalAcumulado = computed(() => {
    return temas.value.reduce((sum, tema) => {
      return sum + tema.criterios.reduce((temaSum, criterio) => temaSum + ((criterio.peso || 0) * (criterio.calificacion || 0)), 0);
    }, 0);
  });

  const fetchRubrica = async () => {
    try {
      loadScreen('Cargando rúbrica...', true);
      const cloneId = route.query.clone;
      const nota = route.query.nota;
      const estudiante = route.query.estudiante;
      const grupo = route.query.grupo;

      if (!cloneId || !nota || !estudiante || !grupo) {
        throw new Error('Missing required parameters');
      }

      notaId.value = nota as string;
      studentName.value = estudiante as string;

      // First fetch the rubric template
      const data = await $fetch<Rubrica>(
        `${config.public.apiUrl}/rubrics/${cloneId}`,
      );

      // Then fetch the saved grade data for this student
      try {
        const savedGrade = await $fetch<{ temas: Tema[] }>(
          `${config.public.apiUrl}/grades/${grupo}/notas/${nota}/estudiante/${estudiante}`,
        );
        
        // If we have saved data with temas, use it
        if (savedGrade && savedGrade.temas && savedGrade.temas.length > 0) {
          temas.value = savedGrade.temas;
        } else {
          // Otherwise use the template
          temas.value = data.temas;
        }
      } catch (error) {
        // If there's an error (like 404), use the template
        console.log('Using template for new grade');
        temas.value = data.temas;
      }

      rubricName.value = data.nombre;
    } catch (error) {
      console.error("Error in fetchRubrica:", error);
      toast.add({
        title: 'Error al cargar la rúbrica',
        icon: "fluent:alert-urgent-16-filled",
        timeout: 3000,
        ui: {
          'background': 'bg-Warm-White dark:bg-Medium-Dark',
          'rounded': 'rounded-lg',
          'shadow': 'shadow-lg',
          'ring': 'ring-0',
          'title': 'text-base font-semibold text-Pure-Black dark:text-White-w',
          'description': 'mt-1 text-sm text-gray-500 dark:text-Light-Gray',
          'icon': {
            'base': 'flex-shrink-0 w-5 h-5',
            'color': 'text-Purple-P dark:text-Muted-Brown'
          },
          'progress': {
            'base': 'absolute bottom-0 end-0 start-0 h-1',
            'background': 'bg-Purple-P/60 dark:bg-Muted-Brown/60'
          },
          'closeButton': {
            'base': 'absolute top-2 right-2',
            'icon': 'fluent:add-16-filled',
            'color': 'text-gray-400 hover:text-gray-500 dark:text-Light-Gray dark:hover:text-White-w'
          }
        }
      });
    } finally {
      loadScreen('', false);
    }
  };

  const saveGrade = async () => {
    try {
      loadScreen('Guardando calificación...', true);
      await $fetch(`${config.public.apiUrl}/grades/${route.query.grupo}/notas/${notaId.value}/grade`, {
        method: 'PUT',
        body: {
          temas: temas.value,
          estudiante: route.query.estudiante
        }
      });

      toast.add({
        title: 'Calificación guardada exitosamente',
        icon: "fluent:checkmark-circle-16-filled",
        timeout: 3000,
        ui: {
          'background': 'bg-Warm-White dark:bg-Medium-Dark',
          'rounded': 'rounded-lg',
          'shadow': 'shadow-lg',
          'ring': 'ring-0',
          'title': 'text-base font-semibold text-Pure-Black dark:text-White-w',
          'description': 'mt-1 text-sm text-gray-500 dark:text-Light-Gray',
          'icon': {
            'base': 'flex-shrink-0 w-5 h-5',
            'color': 'text-Purple-P dark:text-Muted-Brown'
          },
          'progress': {
            'base': 'absolute bottom-0 end-0 start-0 h-1',
            'background': 'bg-Purple-P/60 dark:bg-Muted-Brown/60'
          },
          'closeButton': {
            'base': 'absolute top-2 right-2',
            'icon': 'fluent:add-16-filled',
            'color': 'text-gray-400 hover:text-gray-500 dark:text-Light-Gray dark:hover:text-White-w'
          }
        }
      });

      // Navigate back to the grades page
      navigateTo({ path: '/Curso/' + route.query.curso + '/Grupo/' + route.query.grupo + '/calificaciones' });
    } catch (error) {
      console.error("Error saving grade:", error);
      toast.add({
        title: 'Error al guardar la calificación',
        icon: "fluent:alert-urgent-16-filled",
        timeout: 3000,
        ui: {
          'background': 'bg-Warm-White dark:bg-Medium-Dark',
          'rounded': 'rounded-lg',
          'shadow': 'shadow-lg',
          'ring': 'ring-0',
          'title': 'text-base font-semibold text-Pure-Black dark:text-White-w',
          'description': 'mt-1 text-sm text-gray-500 dark:text-Light-Gray',
          'icon': {
            'base': 'flex-shrink-0 w-5 h-5',
            'color': 'text-Purple-P dark:text-Muted-Brown'
          },
          'progress': {
            'base': 'absolute bottom-0 end-0 start-0 h-1',
            'background': 'bg-Purple-P/60 dark:bg-Muted-Brown/60'
          },
          'closeButton': {
            'base': 'absolute top-2 right-2',
            'icon': 'fluent:add-16-filled',
            'color': 'text-gray-400 hover:text-gray-500 dark:text-Light-Gray dark:hover:text-White-w'
          }
        }
      });
    } finally {
      loadScreen('', false);
    }
  };

  const generatePDF = async () => {
    try {
      const element = document.getElementById('pdf-content');
      if (!element) {
        console.error('PDF content element not found');
        return;
      }

      const style = document.createElement('style');
      style.textContent = `
        #pdf-content * {
          outline: none !important;
          border: none !important;
        }
        #pdf-content input, #pdf-content textarea {
          box-shadow: none !important;
        }
        #pdf-content input:focus, #pdf-content textarea:focus {
          box-shadow: none !important;
        }

      `;
      document.head.appendChild(style);

      // Hide buttons and other UI elements before PDF generation
      const buttons = element.querySelectorAll('button');
      buttons.forEach(button => button.style.display = 'none');

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${rubricName.value}-${studentName.value}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true,
          letterRendering: true,
          allowTaint: true,
          scrollY: 0,
          scrollX: 0,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape',
          compress: true
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break'
        }
      };

      await html2pdf().set(opt).from(element).save();

      document.head.removeChild(style);
      buttons.forEach(button => button.style.display = '');
    } catch (error) {
      toast.add({
        title: 'Error al generar el PDF',
        description: 'Por favor, intente nuevamente',
        icon: "fluent:alert-urgent-16-filled",
        timeout: 3000,
        ui: {
          'background': 'bg-Warm-White dark:bg-Medium-Dark',
          'rounded': 'rounded-lg',
          'shadow': 'shadow-lg',
          'ring': 'ring-0',
          'title': 'text-base font-semibold text-Pure-Black dark:text-White-w',
          'description': 'mt-1 text-sm text-gray-500 dark:text-Light-Gray',
          'icon': {
            'base': 'flex-shrink-0 w-5 h-5',
            'color': 'text-Purple-P dark:text-Muted-Brown'
          },
          'progress': {
            'base': 'absolute bottom-0 end-0 start-0 h-1',
            'background': 'bg-Purple-P/60 dark:bg-Muted-Brown/60'
          },
          'closeButton': {
            'base': 'absolute top-2 right-2',
            'icon': 'fluent:add-16-filled',
            'color': 'text-gray-400 hover:text-gray-500 dark:text-Light-Gray dark:hover:text-White-w'
          }
        }
      });
    }
  };

  // Load screen state
  const loadMg = ref('')
  const canLoadScreen = ref(false)

  const loadScreen = (message: string, loadValue: boolean) => {
    loadMg.value = message
    canLoadScreen.value = loadValue
  }

  onMounted(() => {
    fetchRubrica();
  });
</script>

<template>
  <div ref="rubricContent" class="overflow-x-auto lg:overflow-x-clip">
    <div class="container mx-auto p-0 md:p-4 transition-colors duration-150">
        <div class="overflow-x-auto lg:overflow-x-clip">
            <div id="pdf-content" class="min-w-[1200px] lg:min-w-0 bg-White-w dark:bg-Dark-Grey shadow-lg rounded-xl overflow-visible transition-all duration-150">
                <!-- Header with student info -->
                <div class="bg-MLight-White dark:bg-Warm-Dark p-4 rounded-t-xl transition-all duration-150">
                    <h2 class="text-xl font-semibold dark:text-white mb-2">{{ rubricName }}</h2>
                    <p class="text-Light-Gray dark:text-MLight-White/50">Estudiante: {{ studentName }}</p>
                </div>

                <!-- Rubric table header -->
                <div class="sticky top-0 flex bg-MLight-White dark:bg-Warm-Dark font-bold dark:text-White-w p-3 z-10 text-xs lg:text-sm xl:text-base rounded-b-lg transition-all duration-150">
                    <div class="flex-none w-[20%] px-3">Tema</div>
                    <div class="flex-none w-[30%] px-3">Criterio</div>
                    <div class="flex-none w-[10%] px-3">Peso</div>
                    <div class="flex-none w-[10%] px-3">Calificación</div>
                    <div class="flex-none w-[10%] px-3">Acumulado</div>
                    <div class="flex-none w-[20%] px-3">Observaciones</div>
                </div>

                <div v-if="temas.length === 0" class="text-center p-4 text-Light-Gray dark:text-MLight-White/50">
                    No hay temas.
                </div>

                <RubricaTemaCalificacion
                    v-for="(tema, index) in temas"
                    :key="index"
                    :tema="tema"
                    :temaIndex="index"
                />

                <!-- Add totals row -->
                <div v-if="temas.length > 0" class="flex bg-MLight-White dark:bg-Warm-Dark font-bold dark:text-White-w p-3 text-xs lg:text-sm xl:text-base rounded-lg mt-2 transition-all duration-150">
                    <div class="flex-none w-[20%] px-3">Total</div>
                    <div class="flex-none w-[30%] px-3"></div>
                    <div class="flex-none w-[10%] px-3 text-center">{{ totalPeso.toFixed(1) }}</div>
                    <div class="flex-none w-[10%] px-3 text-center">{{ totalCalificacion.toFixed(1) }}</div>
                    <div class="flex-none w-[10%] px-3 text-center">{{ totalAcumulado.toFixed(1) }}</div>
                    <div class="flex-none w-[20%] px-3"></div>
                </div>
            </div>
        </div>

        <!-- Save Grade Button -->
        <div class="flex justify-end p-4 gap-4">
          <UButton
            size="xl"
            class="shadow-lg rounded-xl bg-Purple-P dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition-colors duration-200"
            @click="generatePDF"
          >
            <UIcon name="fluent:document-pdf-24-filled" class="text-xl dark:text-White-w"/>
            <span class="text-white">Descargar PDF</span>
          </UButton>

            <UButton
                size="xl"
                class="shadow-lg rounded-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition-colors duration-200"
                @click="saveGrade"
            >
                <UIcon name="fluent:save-16-filled" class="text-xl dark:text-White-w"/>
                <span class="text-white">Guardar Calificación</span>
            </UButton>
        </div>

        <!-- Load Screen -->
        <UtilitiesLoadingScreen
            :isLoading="canLoadScreen"
            :message="loadMg"
            :fullscreen="true"
        />
    </div>
  </div>
</template> 