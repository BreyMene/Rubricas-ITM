<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import type {Criterio, Tema, Rubrica} from '~/utils/types'
  import { useDocenteStore } from "~/utils/store";
  import { useRubricPermissions } from "~/composables/useRubricPermissions";
  import { useI18n } from 'vue-i18n';

  const route = useRoute();
  const rubricaId = computed(() => {
    const id = route.params.id;
    return Array.isArray(id) ? id[0] : id;
  });
  const rubricEstado = ref('borrador'); // Default state
  
  const config = useRuntimeConfig();
  const isOpen = ref(false);
  const isMobile = ref(false);
  const toast = useToast();
  const { t } = useI18n();
  
  // Change isModerator from computed to ref
  const isModerator = ref(false);

  const temas = ref<Tema[]>([])

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

  // Add validation for peso and acumulado
  const validateTotals = (showToast: boolean) => {
    if (totalPeso.value > 5) {
      // Only show toast if showToast is true
      if (showToast) {
        toast.add({
          title: t('rubrica_index.total_cannot_exceed_5'),
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
      return false;
    }
    return true;
  };

  const rubricName = ref('')
  const rubricNameError = ref('')

  const courses = ref<Curso[]>([]);
  const docenteID = useDocenteStore().getID;
  const groups = ref<{_id: string, nombre: string}[]>([]);
  const selectedGroups = ref<string[]>([]);
  const isGuideRubric = ref(false);

  const selectedCourseId = ref<string>('');
  const selectedCourseName = ref<string>('');
  const showGroups = ref(false);

  const { validateRubricAccess } = useRubricPermissions();


  const checkIfMobile = () => {
    isMobile.value = window.innerWidth <= 768;
  };

  const fetchCourses = async () => {
    try {
      const data = await $fetch<Curso[]>(
        `${config.public.apiUrl}/courses/${docenteID}`,
      );
      courses.value = data;
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchRubrica = async () => {
    try {
      const { canModerate, rubrica } = await validateRubricAccess(rubricaId.value, docenteID);
      
      isModerator.value = canModerate;
      temas.value = rubrica.temas;
      rubricEstado.value = rubrica.estado;
    } catch (error: any) {
      showError({
        statusCode: error.statusCode || 500,
        statusMessage: t('rubrica_index.error_loading_rubric'),
        message: t('rubrica_index.error'),
      });
    }
  };

  onMounted(async () => {
    await fetchCourses();
    await fetchRubrica();
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', checkIfMobile);
  });

  function addTema() {
    const rb: Criterio = {
      criterio: "",
      peso: 0,
      calificacion: 0,
      acumulado: 0,
      observaciones: "",
    }
    temas.value.push({
      nombre: '',
      criterios: [rb]
    })
  }

  function addRow(temaIndex: number) {
    const rb: Criterio = {
      criterio: "",
      peso: 0,
      calificacion: 0,
      acumulado: 0,
      observaciones: "",
    }
    temas.value[temaIndex].criterios.push(rb)
  }

  function deleteTema(temaIndex: number) {
    temas.value.splice(temaIndex, 1)
  }

  function deleteRow(temaIndex: number, rowIndex: number) {
    temas.value[temaIndex].criterios.splice(rowIndex, 1)
  }

  watch(isOpen, (newValue) => {
    if (!newValue) {
      // Add a delay before resetting the icon
      setTimeout(() => {
        rubricName.value = '';
        rubricNameError.value = '';
        showGroups.value = false;
        selectedCourseId.value = '';
        selectedCourseName.value = '';
        selectedGroups.value = [];
        isGuideRubric.value = false;
      }, 300);
    }
  });

  watch([totalPeso], () => {
    validateTotals(true);
  });

  const selectCourse = async (course: Curso) => {
    selectedCourseId.value = course._id;
    selectedCourseName.value = course.nombre;
    isModerator.value = course.docentes.some((d)=> d._id == docenteID && d.moderador == true);
    
    try {
      const data = await $fetch<{_id: string, nombre: string}[]>(
        `${config.public.apiUrl}/groups/course/${course._id}/user/${docenteID}`,
      );
      groups.value = data;
    } catch (error) {
      groups.value = [];
    }
    
    showGroups.value = true;
  }

  const goBackToCourses = () => {
    showGroups.value = false;
    selectedCourseId.value = '';
    selectedCourseName.value = '';
    selectedGroups.value = [];
    isGuideRubric.value = false;
  }

  const saveRubric = async () => {
    if (!validateTotals(true)) {
      return;
    }

    try {
      await $fetch(`${config.public.apiUrl}/rubrics/${rubricaId.value}`, {
        method: "PUT",
        body: {
          temas: temas.value
        },
      });

      toast.add({
        title: t('rubrica_index.changes_saved_successfully'),
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
    } catch (error) {
      toast.add({
        title: t('rubrica_index.error_saving_changes'),
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

  const assignRubric = async () => {
    if (selectedGroups.value.length === 0 && !isGuideRubric.value) {
      toast.add({
        title: t('rubrica_index.must_select_at_least_one_group_or_mark_as_guide_rubric'),
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
      return;
    }

    try {
      // Update rubric state to active
      await $fetch(`${config.public.apiUrl}/rubrics/${rubricaId.value}`, {
        method: "PUT",
        body: {
          estado: 'activo'
        },
      });

      if (selectedGroups.value.length > 0) {
        await $fetch(`${config.public.apiUrl}/rubrics/${rubricaId.value}/group`, {
          method: "PUT",
          body: {
            ids: selectedGroups.value,
          },
        });
      }

      if(isGuideRubric.value){
        await $fetch(`${config.public.apiUrl}/rubrics/${rubricaId.value}/course/${selectedCourseId.value}`, {
          method: "PUT",
        });
      }

      isOpen.value = false;
      await navigateTo('/rubricas');
    } catch (error) {
      toast.add({
        title: t('rubrica_index.error_assigning_rubric'),
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
</script>

<!-- pages/rubricas.vue -->
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
        {{ t('rubrica_index.back') }}
      </UButton>
    </div>

    <div class="overflow-x-auto lg:overflow-x-clip">
      <div class="min-w-[1200px] lg:min-w-0 bg-White-w dark:bg-Dark-Grey shadow-lg rounded-xl overflow-visible transition-all duration-150">
        <div class="sticky top-0 flex bg-MLight-White dark:bg-Warm-Dark font-bold dark:text-White-w p-3 z-10 text-xs lg:text-sm xl:text-base rounded-lg transition-all duration-150">
          <div class="flex-none w-[20%] px-3">{{ t('rubrica_index.tema') }}</div>
          <div class="flex-none w-[30%] px-3">{{ t('rubrica_index.criterio') }}</div>
          <div class="flex-none w-[10%] px-3">{{ t('rubrica_index.peso') }}</div>
          <div class="flex-none w-[10%] px-3">{{ t('rubrica_index.calificacion') }}</div>
          <div class="flex-none w-[10%] px-3">{{ t('rubrica_index.acumulado') }}</div>
          <div class="flex-none w-[20%] px-3">{{ t('rubrica_index.observaciones') }}</div>
        </div>

        <div v-if="temas.length === 0" class="text-center p-4 text-Light-Gray dark:text-MLight-White/50">
          {{ t('rubrica_index.no_temas') }}
        </div>

        <RubricaTema
          v-for="(tema, index) in temas"
          :key="index"
          :tema="tema"
          :temaIndex="index"
          :isModerator="isModerator"
          @deleteTema="deleteTema"
          @addRow="addRow"
          @deleteRow="deleteRow"
        />

        <!-- Add totals row -->
        <div v-if="temas.length > 0" class="flex bg-MLight-White dark:bg-Warm-Dark font-bold dark:text-White-w p-3 text-xs lg:text-sm xl:text-base rounded-lg mt-2 transition-all duration-150">
          <div class="flex-none w-[20%] px-3">{{ t('rubrica_index.total') }}</div>
          <div class="flex-none w-[30%] px-3"></div>
          <div class="flex-none w-[10%] px-3 text-center">{{ totalPeso }}</div>
          <div class="flex-none w-[10%] px-3 text-center">{{ totalCalificacion }}</div>
          <div class="flex-none w-[10%] px-3 text-center">{{ totalAcumulado }}</div>
          <div class="flex-none w-[20%] px-3"></div>
        </div>
      </div>
    </div>

    <div class="flex justify-end p-4">
      <UButton
        v-if="isModerator"
        icon="fluent:add-16-filled"
        size="lg"
        class="rounded-xl shadow-lg bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray dark:text-White-w transition-colors duration-200"
        @click="addTema"
      >
        {{ t('rubrica_index.add_tema') }}
      </UButton>
    </div>

    <!-- Finish Rubric Button -->
    <div class="flex justify-end p-4 gap-4">
      <UButton
        v-if="isModerator"
        size="xl"
        class="shadow-lg rounded-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition-colors duration-200"
        @click="saveRubric"
      >
        <UIcon name="fluent:save-16-filled" class="text-xl dark:text-White-w"/>
        <span class="text-white">{{ t('rubrica_index.save') }}</span>
      </UButton>
      <UButton
        v-if="isModerator && rubricEstado === 'borrador'"
        size="xl"
        @click="isOpen = true"
        class="shadow-lg rounded-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition-colors duration-150"
      >
        <UIcon name="fluent:checkmark-24-filled" class="mr-2 text-xl dark:text-White-w"/>
        <span class="text-white">{{ t('rubrica_index.assign_rubric') }}</span>
      </UButton>
    </div>
  </div>

  <!-- Assign Rubric Modal -->
  <UModal
    v-model="isOpen"
    prevent-close
    :ui="{
      width: 'w-full sm:max-w-3xl',
      height: 'max-h-[700px]',
      container: 'flex items-center justify-center',
      overlay: {background: 'dark:bg-Light-Gray/15'},
    }"
  >
    <UCard
      :ui="{
        background: 'dark:bg-Medium-Dark',
        ring: '',
        divide: '',
        header: { base: 'border-b border-Purple-P dark:border-Dark-Grey'},
        base: 'w-full',
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 dark:text-white">
            {{ t('rubrica_index.assign_rubric') }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="fluent:dismiss-12-filled"
            class="-my-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
            @click="isOpen=false"
          />
        </div>
      </template>

      <!-- Modal Content -->
      <div class="p-4">
        <div class="flex flex-col gap-6">
          <!-- Course Selection View -->
          <div v-if="!showGroups" class="bg-MLight-White dark:bg-Dark-Grey/50 rounded-xl p-6 shadow-md">
            <h4 class="text-lg font-medium mb-4 dark:text-white">{{ t('rubrica_index.select_course') }}</h4>

            <!-- Course Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="course in courses"
                :key="course._id"
                class="relative bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4 shadow-md flex flex-col justify-center items-center gap-2 hover:bg-MLight-White dark:hover:bg-Dark-Grey transition-colors duration-200"
                @click="selectCourse(course)"
              >
                <!-- Course Content -->
                <div class="w-full h-full flex flex-col items-center cursor-pointer">
                  <UIcon
                    :name="course.icono"
                    class="text-4xl text-Purple-P dark:text-Muted-Brown"
                  />
                  <h3 class="text-md font-medium text-center text-Pure-Black dark:text-White-w mt-2">
                    {{ course.nombre }}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <!-- Group Selection View -->
          <div v-else class="bg-MLight-White dark:bg-Dark-Grey/50 rounded-xl p-6 shadow-md">
            <div class="flex items-center mb-4">
              <UButton
                icon="fluent:arrow-left-12-filled"
                variant="ghost"
                color="gray"
                class="mr-2 dark:text-White-w hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
                @click="goBackToCourses"
              />
              <h4 class="text-lg font-medium dark:text-white">{{ selectedCourseName }}</h4>
            </div>

            <!-- Groups as checkbox list with guide rubric checkbox -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <!-- Group List -->
              <div :class="isModerator ? 'space-y-3' : 'space-y-3 md:col-span-3'">
                <div
                  v-for="group in groups"
                  :key="group._id"
                  class="flex items-center gap-3 px-2"
                >
                  <UCheckbox
                    v-model="selectedGroups"
                    :value="group._id"
                    :label="group.nombre"
                    :ui="{
                      container: 'flex items-center gap-2',
                      base: 'w-5 h-5 checked:bg-Medium-Blue focus:checked:bg-Medium-Blue hover:checked:bg-Medium-Blue/60 dark:checked:bg-Muted-Brown hover:dark:checked:bg-Muted-Brown/60 transition-colors duration-200',
                      icon: 'text-white',
                      rounded: 'rounded',
                      background: 'bg-Light-Gray dark:bg-Light-Gray/30',
                      label: 'text-Pure-Black dark:text-White-w font-medium'
                    }"
                  />
                </div>
                <div v-if="groups.length === 0" class="text-center text-Light-Gray dark:text-MLight-White/50">
                  {{ t('rubrica_index.no_groups') }}
                </div>
              </div>

              <!-- Only show divider and guide rubric checkbox if user is moderator -->
              <template v-if="isModerator">
                <UDivider
                  :label="t('rubrica_index.or')"
                  :orientation="isMobile ? 'horizontal' : 'vertical'"
                  size="md"
                  :ui="{
                    label: 'text-Medium-Blue dark:text-Muted-Brown',
                    border: {
                      base: 'rounded border-Medium-Blue dark:border-Muted-Brown'
                    }
                  }"
                />
                <!-- Guide Rubric Checkbox -->
                <div class="flex flex-col justify-start">
                  <UCheckbox
                    v-model="isGuideRubric"
                    :label="t('rubrica_index.make_guide_rubric')"
                    :ui="{
                      container: 'flex items-center gap-2',
                      base: 'w-5 h-5 checked:bg-Medium-Blue focus:checked:bg-Medium-Blue hover:checked:bg-Medium-Blue/60 dark:checked:bg-Muted-Brown hover:dark:checked:bg-Muted-Brown/60 transition-colors duration-200',
                      icon: 'text-white',
                      rounded: 'rounded',
                      background: 'bg-Light-Gray dark:bg-Light-Gray/50',
                      label: 'text-Pure-Black dark:text-White-w font-medium'
                    }"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Footer Buttons -->
        <div class="flex justify-end mt-6 gap-4">
          <UButton
            variant="link"
            color="black"
            @click="isOpen = false"
          >
            {{ t('rubrica_index.cancel') }}
          </UButton>
          <UButton
            class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"
            @click="assignRubric"
          >
            {{ t('rubrica_index.assign') }}
          </UButton>
        </div>
      </div>
    </UCard>
  </UModal>
</template>