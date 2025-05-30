<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import type { Tema, Rubrica } from '~/utils/types'

  const route = useRoute();
  const config = useRuntimeConfig();
  const toast = useToast();

  const temas = ref<Tema[]>([])
  const rubricName = ref('')
  const studentName = ref('')
  const notaId = ref('')


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
      const curso = route.query.curso;

      if (!cloneId || !nota || !estudiante || !grupo || !curso) {
        throw new Error('Missing required parameters');
      }

      notaId.value = nota as string;
      studentName.value = estudiante as string;

      // First fetch the rubric template
      try {
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
        // If the rubric is not found, throw an error to trigger the error page
        throw createError({
          statusCode: 404,
          statusMessage: 'Rúbrica no encontrada',
          message: 'La rúbrica ha sido eliminada o no está disponible.',
          fatal: true
        });
      }
    } catch (error) {
      console.error("Error in fetchRubrica:", error);
      // Let the error page handle the display
      throw error;
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
    <div class="container mx-auto p-0 md:p-4 transition-colors duration-150">
        <div class="overflow-x-auto lg:overflow-x-clip">
            <div class="min-w-[1200px] lg:min-w-0 bg-White-w dark:bg-Dark-Grey shadow-lg rounded-xl overflow-visible transition-all duration-150">
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
</template>