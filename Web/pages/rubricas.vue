<script setup lang="ts">
  import { useDocenteStore } from "~/utils/store";
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const config = useRuntimeConfig();
  const toast = useToast();

  const rubricas = ref<Rubrica[]>([]);
  const docenteID = useDocenteStore().getID;
  const courses = ref<Curso[]>([]);
  const loading = ref(true);

  // Modal state
  const isOpen = ref(false)
  const openCourses = ref(false)

  const selectedRubrica = ref<string | null>(null);
  const selectedCourseId = ref<string>('');
  const selectedRubricaName = ref<string>('');
  const selectedRubricaState = ref<string>('');
  const selectedRubricaCourse = ref<string>('');
  const selectedRubricaGroup = ref<string>('');
  const isDeleteModalOpen = ref(false);

  const rubricButtons = computed(() => [
  [
      {
        label: t('pages.rubricas.create_rubric'),
        to: '/crearRubrica',
      },
      {
        label: t('pages.rubricas.clone_rubric'),
        click: () => cloneRubric()
      }
  ],
  ]);

  // Add computed property for state display
  const getStateDisplay = (state: string) => {
    switch (state) {
      case 'borrador':
        return t('pages.rubricas.state_draft');
      case 'activo':
        return t('pages.rubricas.state_active');
      case 'inactivo':
        return t('pages.rubricas.state_inactive');
      default:
        return state;
    }
  };

  // Function to handle rubrica selection with explicit type
  const selectRubrica = (rubricaId: string, rubricaNomb: string, estado: string) => {
      selectedRubrica.value = rubricaId;
      selectedRubricaName.value = rubricaNomb;
      selectedRubricaState.value = estado;
      
      const course = courses.value.find(c => c.rubricasGuia?.some(r => r._id === rubricaId || r === rubricaId));
      const group = courses.value
      .flatMap(c => c.grupos || [])
      .find(g => g.rubricas?.includes(rubricaId));

      selectedRubricaCourse.value = course?.nombre || t('pages.rubricas.not_assigned_course');
      selectedRubricaGroup.value = group?.nombre || t('pages.rubricas.not_assigned_group');
      
      isOpen.value = true;
  };

  // SEARCH BAR
  const searchTerm = ref('');
  const selectedState = ref('all');

  // State filter options with better styling
  const stateOptions = computed(() => [
    { 
      label: t('pages.rubricas.filter_all_states'), 
      value: 'all',
      icon: 'fluent:filter-24-regular'
    },
    { 
      label: t('pages.rubricas.filter_active'), 
      value: 'activo',
      icon: 'fluent:checkmark-circle-24-filled'
    },
    { 
      label: t('pages.rubricas.filter_drafts'), 
      value: 'borrador',
      icon: 'fluent:drafts-16-filled'
    },
    { 
      label: t('pages.rubricas.filter_inactive'), 
      value: 'inactivo',
      icon: 'fluent:dismiss-circle-24-filled'
    }
  ]);

  // Get current filter option
  const currentStateOption = computed(() => 
    stateOptions.value.find(option => option.value === selectedState.value) || stateOptions.value[0]
  );

  // Filtered rubricas based on search and state
  const filteredRubricas = computed(() => {
      let filtered = rubricas.value;
      
      // Apply state filter
      if (selectedState.value !== 'all') {
          filtered = filtered.filter(rubrica => rubrica.estado === selectedState.value);
      }
      
      // Apply search filter
      if (searchTerm.value) {
          filtered = filtered.filter(rubrica =>
              rubrica.nombre.toString().toLowerCase().includes(searchTerm.value.toLowerCase())
          );
      }
      
      return filtered;
  });

  const handleSearch = (value: string) => {
      searchTerm.value = value;
  };

  const handleStateFilter = (state: string) => {
      selectedState.value = state;
  };

  const fetchRubrics = async () => {
    try {
      loading.value = true;
      const data = await $fetch<Rubrica[]>(
        `${config.public.apiUrl}/rubrics/user/${docenteID}`,
      );
      rubricas.value = data;
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
    finally {
      loading.value = false;
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await $fetch<Curso[]>(
        `${config.public.apiUrl}/courses/${docenteID}`,
      );
      courses.value = data;
      // After fetching courses, fetch groups for each course
      await fetchGroups();
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      for (const course of courses.value) {
        const gruposApi = await $fetch<Grupo[]>(
          `${config.public.apiUrl}/courses/groups/${course._id}`
        );
        course.grupos = gruposApi;
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const selectCourse = async (course: Curso) => {
    try {
      const activeRubric = await $fetch<Rubrica>(
        `${config.public.apiUrl}/rubrics/course/${course._id}/active`
      );
      selectedRubrica.value = activeRubric._id;
      selectedCourseId.value = course._id;
    } catch (error) {
      console.error("Error getting active guide rubric:", error);
      selectedRubrica.value = course.rubricasGuia?.[0]?._id || "";
      selectedCourseId.value = course._id;
    }
  }

  const openRubric = () => {
    navigateTo(`/Rubrica/${selectedRubrica.value}`);
    isOpen.value = false;
  }

  const cloneRubric = () => {
    navigateTo({path: '/crearRubrica', query: {clone: selectedRubrica.value} })
  }

  const deleteRubric = async () => {
    try {
      await $fetch(`${config.public.apiUrl}/rubrics/${selectedRubrica.value}`, {
        method: 'DELETE'
      });
      await fetchRubrics();
      isOpen.value = false;
      isDeleteModalOpen.value = false;
      
      // Add success toast
      toast.add({
        title: t('pages.rubricas.toast_delete_success'),
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
      console.error("Error deleting rubric:", error);
      // Add error toast
      toast.add({
        title: t('pages.rubricas.toast_delete_error'),
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

  onMounted(() => {
    fetchCourses();
    fetchRubrics();
  });

  watch(openCourses, (newValue) => {
    if (!newValue) {
      // Add a delay before resetting the icon
      setTimeout(() => {
        selectedCourseId.value = "";
        selectedRubrica.value = "";
        selectedRubricaName.value = "";
      }, 300);
    }
  });

</script>

<template>
  <div class="container mx-auto p-6 ">
    <div class="flex flex-col md:flex-row gap-6">
      <!-- Main Content Area -->
      <div class="flex-1">
        <div class="mb-6 transition-colors duration-150">
            <h2 class="text-2xl font-semibold mb-4 text-Pure-Black dark:text-White-w transition-colors duration-150">{{ t('pages.rubricas.my_rubrics_title') }}</h2>
            <div class="mb-6 flex flex-col sm:flex-row gap-4 justify-between sm:items-center relative">
                <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <UtilitiesSearchBar :placeholderText="t('pages.rubricas.search_placeholder')" @search="handleSearch"/>
                    
                    <!-- Enhanced State Filter -->
                    <UDropdown 
                      :items="[[
                        ...stateOptions.map(option => ({
                          label: option.label,
                          icon: option.icon,
                          click: () => handleStateFilter(option.value),
                          active: selectedState === option.value,
                          class: option.value === 'activo' ? 'text-green-600 dark:text-green-400' :
                                 option.value === 'borrador' ? 'text-yellow-600 dark:text-yellow-400' :
                                 option.value === 'inactivo' ? 'text-red-600 dark:text-red-400' : 
                                 'text-gray-600 dark:text-gray-400'
                        }))
                      ]]"
                      :ui="{
                        width: 'w-64',
                        transition: {
                          enterActiveClass: 'transition-all duration-200 ease-out',
                          enterFromClass: 'transform scale-95 opacity-0',
                          enterToClass: 'transform scale-100 opacity-100',
                          leaveActiveClass: 'transition-all duration-150 ease-in',
                          leaveFromClass: 'transform scale-100 opacity-100',
                          leaveToClass: 'transform scale-95 opacity-0',
                        },
                        rounded: 'rounded-xl',
                        ring: 'ring-0',
                        background: 'bg-Warm-White dark:bg-Warm-Dark',
                        shadow: 'shadow-lg',
                        item: {
                          rounded: 'rounded-lg',
                          padding: 'px-3 py-2',
                          active: 'bg-Purple-P/10 dark:bg-Muted-Brown/20',
                          base: 'flex items-center gap-3 w-full'
                        },
                        padding: 'p-2',
                      }"
                    >
                      <UButton
                        :icon="currentStateOption.icon"
                        :label="currentStateOption.label"
                        trailing-icon="heroicons:chevron-down-20-solid"
                        variant="soft"
                        size="md"
                        :class="[
                          'justify-between w-fit rounded-xl transition-all duration-150',
                          'bg-Warm-White dark:bg-Warm-Dark hover:bg-MLight-White dark:hover:bg-Dark-Grey',
                          'text-Pure-Black dark:text-White-w',
                          currentStateOption.value === 'activo' ? 'text-green-600 dark:text-green-400' :
                          currentStateOption.value === 'borrador' ? 'text-yellow-600 dark:text-yellow-400' :
                          currentStateOption.value === 'inactivo' ? 'text-red-600 dark:text-red-400' : 
                          'text-gray-600 dark:text-gray-400'
                        ]"
                      />
                    </UDropdown>
                </div>

                <!-- Desktop buttons - visible on SM and above -->
                <div class="hidden sm:flex gap-3">
                  <UButton :label="t('pages.rubricas.clone_rubric')" @click="openCourses = true" size="xl" class="shadow-lg dark:text-White-w rounded-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"/>
                  <UButton :to="'/crearRubrica'" :label="t('pages.rubricas.create_rubric')" size="xl" class="shadow-lg dark:text-White-w rounded-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"/>
                </div>

                <!-- Mobile dropdown menu - visible on XS only -->
                <UDropdown :items="rubricButtons" :ui="{
                    width: 'w-40',
                    transition: {
                      enterActiveClass: 'transition-all duration-200 ease-out',
                      enterFromClass: 'transform scale-0 opacity-90 origin-bottom-right',
                      enterToClass: 'transform scale-100 opacity-100 origin-bottom-right',
                      leaveActiveClass: 'transition-all duration-200 ease-in',
                      leaveFromClass: 'transform scale-100 opacity-100 origin-bottom-right',
                      leaveToClass: 'transform scale-92 opacity-0 origin-bottom-right',
                    },
                    rounded: 'rounded-2xl',
                    ring: 'ring-0',
                    background: 'bg-White-w dark:bg-Pure-Black',
                    item: {
                        rounded: 'rounded-xl',
                        active: 'dark:bg-Muted-Brown/60',
                    },
                    padding: 'p-2',
                }"
                class="sm:hidden fixed bottom-6 right-6 z-10">
                  <UButton icon="material-symbols:add" size="xl"
                    class="rounded-full shadow-lg dark:text-White-w bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"/>
                </UDropdown>
            </div>

          <!-- Rubrics Grid -->
          <div class="relative">
            <ClientOnly>
                <!-- Grid Container with fixed height to prevent layout shifts -->
                <div class="min-h-[400px] relative transition-colors duration-150">
                  <div 
                    v-if="!loading"
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 select-none transition-all duration-500 ease-out"
                  >
                    <!-- No Results State -->
                    <div v-if="!filteredRubricas.length && rubricas.length > 0" class="col-span-full flex items-center justify-center py-20">
                      <div class="relative w-80 h-52 flex flex-col items-center justify-center">
                        <!-- Corner decorations -->
                        <div class="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tl-lg transition-colors duration-150"></div>
                        <div class="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tr-lg transition-colors duration-150"></div>
                        <div class="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-bl-lg transition-colors duration-150"></div>
                        <div class="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-br-lg transition-colors duration-150"></div>

                        <UIcon name="fluent:filter-24-regular" class="text-6xl text-Purple-P dark:text-Muted-Brown mb-4 transition-colors duration-[0.1s]" />
                        <p class="text-xl font-medium text-center text-Pure-Black dark:text-White-w mb-2 transition-colors duration-150">{{ t('pages.rubricas.no_results_found_line1') }}<br>{{ t('pages.rubricas.no_results_found_line2') }}</p>
                      </div>
                    </div>

                    <!-- Empty State (no rubricas at all) -->
                    <div v-else-if="!rubricas.length" class="col-span-full flex items-center justify-center py-20">
                      <div class="relative w-80 h-52 flex flex-col items-center justify-center">
                        <!-- Corner decorations -->
                        <div class="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tl-lg"></div>
                        <div class="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tr-lg"></div>
                        <div class="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-bl-lg"></div>
                        <div class="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-br-lg"></div>

                        <UIcon name="fluent:warning-24-regular" class="text-6xl text-Purple-P dark:text-Muted-Brown mb-4" />
                        <p class="text-xl font-medium text-center text-Pure-Black dark:text-White-w">{{ t('pages.rubricas.empty_state_line1') }}<br>{{ t('pages.rubricas.empty_state_line2') }}</p>
                      </div>
                    </div>
                    
                    <!-- Rubric Cards with individual transitions -->
                    <Transition
                      v-for="rubrica in filteredRubricas"
                      :key="`${rubrica._id}-${selectedState}-${searchTerm}`"
                      name="rubric-item"
                      appear
                      mode="out-in"
                    >
                      <UButton
                        variant="ghost"
                        @click="selectRubrica(rubrica._id, rubrica.nombre, rubrica.estado)"
                        class="w-full h-[280px] bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4 shadow-lg flex flex-col hover:shadow-xl transition-[transform,box-shadow] duration-200 cursor-pointer hover:bg-MLight-White dark:hover:bg-Dark-Grey hover:-translate-y-1 outline-none"
                      >
                        <div class="w-full h-full rounded-lg overflow-hidden relative">
                          <RubricaPreview 
                            :temas="rubrica.temas || []" 
                            :previewMode="true"
                            :rubricaId="rubrica._id"
                          />
                          <!-- State Circle -->
                          <UChip
                            v-if="rubrica.estado"
                            :color="rubrica.estado === 'activo' ? 'green' : rubrica.estado === 'inactivo' ? 'red' : 'yellow'"
                            size="xl"
                            position="top-right"
                            class="absolute top-4 right-4 transition-colors duration-150"
                          />
                        </div>
                        <h3 class="text-Pure-Black dark:text-White-w flex justify-between items-center">{{ rubrica.nombre }}</h3>
                      </UButton>
                    </Transition>
                  </div>
                </div>

              <!-- Skeleton Loader -->
              <template #fallback>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <USkeleton
                  v-for="i in 4" 
                  :key="i" 
                  class="w-full h-[148px] aspect-square"
                  :ui="{
                    base: 'animate-pulse',
                    rounded: 'rounded-xl',
                    background: 'bg-gray-200 dark:bg-gray-700',
                  }"
                />
              </div>
              </template>
            </ClientOnly>

          </div>
        </div>
      </div>
    </div>

    <!-- Modal For the Information of the Rubric -->
    <UModal
        v-model="isOpen" :prevent-close="isDeleteModalOpen"
        :ui="{
            wrapper: 'z-10',
            container: 'flex items-center justify-center',
            overlay: { background: 'dark:bg-Light-Gray/15' }
        }"
        >
        <UCard :ui="{
          background: 'dark:bg-Medium-Dark', ring: '',
          divide: '',
          header: { base: 'border-b border-Purple-P dark:border-Dark-Grey'},
          base: 'w-full',
        }">
            <template #header>
              <div class="flex items-center justify-between">
                  <h3 class="flex gap-1 text-base font-medium leading-6 dark:text-White-w">
                      {{ t('pages.rubricas.details_modal_title') }} <p class="font-bold text-Medium-Blue dark:text-Muted-Brown">{{ selectedRubricaName }}</p>
                  </h3>
              </div>
            </template>

            <div class="flex-1 overflow-y-auto">
              <!-- Rúbrica details -->
              <div class="space-y-4">
                  <div class="flex items-center gap-2">
                    <p class="dark:text-White-w">{{ t('pages.rubricas.details_modal_state') }}</p>
                    <span class="px-3 py-1 text-white rounded-full text-sm font-medium"
                      :class="{
                        'bg-green-500': selectedRubricaState === 'activo',
                        'bg-red-500': selectedRubricaState === 'inactivo',
                        'bg-yellow-600': selectedRubricaState === 'borrador'
                      }"
                    >
                      {{ getStateDisplay(selectedRubricaState) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <p class="dark:text-White-w">{{ t('pages.rubricas.details_modal_course') }}</p>
                    <span class="text-Medium-Blue dark:text-Muted-Brown">{{ selectedRubricaCourse }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <p class="dark:text-White-w">{{ t('pages.rubricas.details_modal_group') }}</p>
                    <span class="text-Medium-Blue dark:text-Muted-Brown">{{ selectedRubricaGroup }}</span>
                  </div>
              </div>
            </div>

            <div class="mt-4 flex justify-between">
                <UButton
                    color="red"
                    variant="soft"
                    @click="isDeleteModalOpen = true">
                    <UIcon name="fluent:delete-12-regular" />
                </UButton>
                <div class="flex gap-2">
                    <UButton
                        variant="link" color="black"
                        @click="isOpen = false">
                        {{ t('pages.rubricas.button_close') }}
                    </UButton>
                    <UButton class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray" @click="openRubric">
                        {{ t('pages.rubricas.button_view_rubric') }}
                    </UButton>
                </div>
            </div>
        </UCard>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal
        v-model="isDeleteModalOpen"
        prevent-close
        :ui="{
            wrapper: 'z-20',
            width: 'w-full sm:max-w-md',
            height: 'max-h-[700px]',
            container: 'flex items-center justify-center',
            overlay: { background: 'dark:bg-Light-Gray/15' },
        }"
        >
        <UCard :ui="{
          background: 'dark:bg-Medium-Dark',
          ring: '',
          divide: '',
          base: 'w-full',
        }">
            <div class="p-4">
                <div class="flex items-center mb-4">
                    <UIcon name="fluent:warning-24-filled" class="text-red-500 text-2xl mr-2" />
                    <h3 class="text-lg font-semibold dark:text-white">{{ t('pages.rubricas.delete_modal_title') }}</h3>
                </div>
                
                <p class="mb-6 text-gray-700 dark:text-gray-300">
                    {{ t('pages.rubricas.delete_modal_desc', { name: selectedRubricaName }) }}
                </p>
                
                <div class="flex justify-end gap-3">
                    <UButton 
                        variant="link" 
                        color="gray"
                        @click="isDeleteModalOpen = false"
                    >
                        {{ t('pages.rubricas.button_cancel') }}
                    </UButton>
                    <UButton 
                        color="red" 
                        @click="deleteRubric"
                    >
                        {{ t('pages.rubricas.button_delete') }}
                    </UButton>
                </div>
            </div>
        </UCard>
    </UModal>
  </div>

  <!-- Open Courses Modal -->
  <UModal
      v-model="openCourses"
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
              {{ t('pages.rubricas.finish_rubric_modal_title') }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="fluent:dismiss-12-filled"
              class="-my-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
              @click="openCourses=false"
            />
          </div>
        </template>

        <!-- Modal Content -->
        <div class="p-4">
          <div class="flex flex-col gap-6">
            <!-- Course Selection View -->
            <div class="bg-MLight-White dark:bg-Dark-Grey/50 rounded-xl p-6 shadow-md">
              <h4 class="text-lg font-medium mb-1 dark:text-white">{{ t('pages.rubricas.select_course_title') }}</h4>
              <h1 class="mb-4 dark:text-white/60">{{ t('pages.rubricas.clone_last_guide_rubric') }}</h1>

              <!-- Course Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="course in courses"
                  :key="course._id"
                  class="relative bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4 shadow-md flex flex-col justify-center items-center gap-2 hover:bg-MLight-White dark:hover:bg-Dark-Grey"
                  :class="course._id == selectedCourseId ? 'ring-4 dark:ring-White-w ring-Medium-Gray' : 'ring-0' "
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
          </div>

          <!-- Footer Buttons -->
          <div class="flex justify-end mt-6 gap-4">
            <UButton
              variant="link"
              color="black"
              @click="openCourses = false"
            >
              {{ t('pages.rubricas.button_cancel') }}
            </UButton>
            <UButton
              class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"
              @click="cloneRubric"
            >
              {{ t('pages.rubricas.button_clone') }}
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
</template>

<style scoped>
  /* Simplified transitions */
  .rubric-item-enter-active {
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .rubric-item-leave-active {
    transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
  }

  .rubric-item-enter-from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }

  .rubric-item-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }

  /* Enhanced hover effects */
  .rubric-card {
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .rubric-card:hover {
    transform: translateY(-4px) scale(1.02);
  }

  /* Grid container smooth transitions */
  .grid {
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
</style>