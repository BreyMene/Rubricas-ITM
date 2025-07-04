<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import type { Tema, Rubrica } from '~/utils/types'
  import { useDocenteStore } from "~/utils/store";
  import { useRubricPermissions } from "~/composables/useRubricPermissions";
  import { useCursoStore } from "~/utils/store";
  import { useI18n } from 'vue-i18n';

  const route = useRoute();
  const config = useRuntimeConfig();
  const toast = useToast();
  const docenteID = useDocenteStore().getID;
  const { t } = useI18n();

  const temas = ref<Tema[]>([])
  const rubricName = ref('')
  const studentName = ref('')
  const notaId = ref('')

  // Add computed properties for totals
  const totalPeso = computed(() => {
    return Number(temas.value.reduce((sum, tema) => {
      return sum + tema.criterios.reduce((temaSum, criterio) => temaSum + (criterio.peso || 0), 0);
    }, 0).toFixed(2));
  });

  const totalCalificacion = computed(() => {
    return Number(temas.value.reduce((sum, tema) => {
      return sum + tema.criterios.reduce((temaSum, criterio) => temaSum + (criterio.calificacion || 0), 0);
    }, 0).toFixed(2));
  });

  const totalAcumulado = computed(() => {
    return Number(temas.value.reduce((sum, tema) => {
      return sum + tema.criterios.reduce((temaSum, criterio) => temaSum + ((criterio.peso || 0) * (criterio.calificacion || 0)), 0);
    }, 0).toFixed(2));
  });

  const { validateGradingAccess } = useRubricPermissions();

  const fetchRubrica = async () => {
    try {
      const cloneId = route.query.clone;
      const nota = route.query.nota;
      const estudiante = route.query.estudiante;
      const grupo = route.query.grupo;
      const curso = route.query.curso;

      if (!cloneId || !nota || !estudiante || !grupo || !curso) {
        showError({
          statusCode: 400,
          statusMessage: t('calificar_rubrica.parameters_missing'),
          message: t('calificar_rubrica.missing_parameters_to_load_rubric')
        });
        return;
      }

      notaId.value = nota as string;
      studentName.value = estudiante as string;

      // Validate access first
      await validateGradingAccess(grupo as string, curso as string, docenteID);

      // Fetch the rubric template
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
        temas.value = data.temas;
      }

      rubricName.value = data.nombre;
    } catch (error: any) {
      showError({
        statusCode: error.statusCode || 500,
        statusMessage: t('calificar_rubrica.error'),
        message: t('calificar_rubrica.error_loading_rubric')
      });
    }
  };

  const saveGrade = async () => {
    try {
      loadScreen(t('calificar_rubrica.saving_grade'), true);
      const updatedGroup = await $fetch<Grupo>(`${config.public.apiUrl}/grades/${route.query.grupo}/notas/${notaId.value}/grade`, {
        method: 'PUT',
        body: {
          temas: temas.value,
          estudiante: route.query.estudiante
        }
      });

      // Update the Pinia store with the new group data
      useCursoStore().setGrupo(updatedGroup);

      toast.add({
        title: t('calificar_rubrica.grade_saved'),
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
        title: t('calificar_rubrica.grade_save_error'),
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
        <!-- Add back button -->
        <div class="mb-4">
            <UButton
                icon="fluent:arrow-left-12-filled"
                variant="ghost"
                color="gray"
                class="dark:text-White-w hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
                @click="$router.back()"
            >
                {{ t('calificar_rubrica.back') }}
            </UButton>
        </div>

        <div class="overflow-x-auto lg:overflow-x-clip">
            <div class="min-w-[1200px] lg:min-w-0 bg-White-w dark:bg-Dark-Grey shadow-lg rounded-xl overflow-visible transition-all duration-150">
                <!-- Header with student info -->
                <div class="bg-MLight-White dark:bg-Warm-Dark p-4 rounded-t-xl transition-all duration-150">
                    <h2 class="text-xl font-semibold dark:text-white mb-2">{{ rubricName }}</h2>
                    <p class="text-Light-Gray dark:text-MLight-White/50">{{ t('calificar_rubrica.student_label') }}: {{ studentName }}</p>
                </div>

                <!-- Rubric table header -->
                <div class="sticky top-0 flex bg-MLight-White dark:bg-Warm-Dark font-bold dark:text-White-w p-3 z-10 text-xs lg:text-sm xl:text-base rounded-b-lg transition-all duration-150">
                    <div class="flex-none w-[20%] px-3">{{ t('calificar_rubrica.tema') }}</div>
                    <div class="flex-none w-[30%] px-3">{{ t('calificar_rubrica.criterio') }}</div>
                    <div class="flex-none w-[10%] px-3">{{ t('calificar_rubrica.peso') }}</div>
                    <div class="flex-none w-[10%] px-3">{{ t('calificar_rubrica.calificacion') }}</div>
                    <div class="flex-none w-[10%] px-3">{{ t('calificar_rubrica.acumulado') }}</div>
                    <div class="flex-none w-[20%] px-3">{{ t('calificar_rubrica.observaciones') }}</div>
                </div>

                <div v-if="temas.length === 0" class="text-center p-4 text-Light-Gray dark:text-MLight-White/50">
                    {{ t('calificar_rubrica.no_temas') }}
                </div>

                <RubricaTemaCalificacion
                    v-for="(tema, index) in temas"
                    :key="index"
                    :tema="tema"
                    :temaIndex="index"
                />

                <!-- Add totals row -->
                <div v-if="temas.length > 0" class="flex bg-MLight-White dark:bg-Warm-Dark font-bold dark:text-White-w p-3 text-xs lg:text-sm xl:text-base rounded-lg mt-2 transition-all duration-150">
                    <div class="flex-none w-[20%] px-3">{{ t('calificar_rubrica.total') }}</div>
                    <div class="flex-none w-[30%] px-3"></div>
                    <div class="flex-none w-[10%] px-3 text-center">{{ totalPeso }}</div>
                    <div class="flex-none w-[10%] px-3 text-center">{{ totalCalificacion }}</div>
                    <div class="flex-none w-[10%] px-3 text-center">{{ totalAcumulado }}</div>
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
                <span class="text-white">{{ t('calificar_rubrica.save_grade') }}</span>
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