<script setup lang="ts">
  import { useCursoStore } from "~/utils/store";

  const config = useRuntimeConfig();
  // Get the route object
  const route = useRoute();
  const toast = useToast()

  // Get the course ID from the route parameters
  const courseId = computed(() => route.params.id);

  // obtaining the course sendend by Pinia
  const curso = computed(() => useCursoStore().cursoActivo);
  const groups = ref<Grupo[]>([]);

  const docentesCurso = computed<DocenteEnCurso[]>(() => curso.value?.docentes || []);
  const docenteID = useDocenteStore().getID;
  const isModerator = computed(() => curso.value?.docentes.some((d) => d._id == docenteID && d.moderador == true));

  // Controls the Views
  const showGroups = ref(true);

  const items = computed(() => [
    {
      label: "Inicio",
      icon: "fluent:home-12-filled",
      to: "/",
    },
    {
      label: `Curso ${curso.value?.nombre}` || "Curso",
      icon: curso.value?.icono || "fluent:book-32-filled",
      to: `/Curso/${courseId.value}`,
    },
  ]);

  const loading = ref(true);

  const fetchGroups = async () => {
    try {
      loading.value = true;
      const data = await $fetch<Grupo[]>(
        `${config.public.apiUrl}/courses/groups/${courseId.value}`,
      );
      groups.value = data;
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      loading.value = false;
    }
  };

  // Only call the api if Pinia doesn't have any course saved
  const fetchCourses = async () => {
    if (!useCursoStore().cursoActivo) {
      try {
        loading.value = true;
        const cursoApi = await $fetch<Curso>(
          `${config.public.apiUrl}/courses/get/${courseId.value}`,
        );
        useCursoStore().setCurso(cursoApi);
      } catch (error) {
        console.error("No se pudo obtener el curso:", error);
      } finally {
        loading.value = false;
      }
    }
  };

  const rubrics = ref<Rubrica[]>([]);
  const showRubricModal = ref(false);
  const loadingRubrics = ref(true);
  const lastEditedRubric = ref<string | null>(null);

  // Add computed properties for toggle states
  const getRubricState = (rubric: Rubrica) => computed({
    get: () => rubric.estado === 'activo',
    set: (value) => toggleRubricState(rubric._id, rubric.estado)
  });

  // Get the active rubric (first one that is active)
  const activeRubric = computed(() => rubrics.value.find(r => r.estado === 'activo') || null);

  // Get the last edited rubric or first non-active rubric
  const displayRubric = computed(() => {
    if (activeRubric.value) return activeRubric.value;
    if (lastEditedRubric.value) {
      const lastEdited = rubrics.value.find(r => r._id === lastEditedRubric.value);
      if (lastEdited) return lastEdited;
    }
    return rubrics.value[0] || null;
  });


  const fetchRubrics = async () => {
    try {
      loadingRubrics.value = true;
      // Get the course data which includes its rubrics
      const courseData = await $fetch<Curso>(
        `${config.public.apiUrl}/courses/get/${courseId.value}`
      );
      // Get the full rubric data for each rubric ID
      const rubricPromises = (courseData.rubricasGuia || []).map(rubric => 
        $fetch<Rubrica>(`${config.public.apiUrl}/rubrics/${rubric._id}`)
      );
      const rubricData = await Promise.all(rubricPromises);
      rubrics.value = rubricData;
    } catch (error) {
      console.error("Error fetching rubrics:", error);
    } finally {
      loadingRubrics.value = false;
    }
  };

  const toggleRubricState = async (rubricId: string, currentState: string) => {
    try {
      const newState = currentState === 'activo' ? 'inactivo' : 'activo';
      
      // If we're activating a rubric, first deactivate all others
      if (newState === 'activo') {
        // Find all active rubrics except the current one
        const activeRubrics = rubrics.value.filter(r => r.estado === 'activo' && r._id !== rubricId);
        
        // Deactivate all other active rubrics
        for (const rubric of activeRubrics) {
          await $fetch(`${config.public.apiUrl}/rubrics/${rubric._id}`, {
            method: "PUT",
            body: {
              estado: 'inactivo'
            }
          });
        }
      }
      
      // Update the current rubric's state
      await $fetch(`${config.public.apiUrl}/rubrics/${rubricId}`, {
        method: "PUT",
        body: {
          estado: newState
        }
      });
      
      lastEditedRubric.value = rubricId;
      // Refresh the rubrics
      await fetchRubrics();
    } catch (error) {
      console.error("Error toggling rubric state:", error);
    }
  };

  onMounted(() => {
    fetchGroups();
    fetchCourses();
    fetchRubrics();
  });

  function addGroup(g: Grupo) {
    groups.value.push(g);
  }

  const handleUserDeletion = async(correo: string) => {
    try {
      await $fetch(`${config.public.apiUrl}/courses/${courseId.value}/user/${correo}`, {
        method: "DELETE"
      });
      
      //Update the store with the new teachers list
      if (curso.value && curso.value.docentes) {
        const updatedDocentes = curso.value.docentes.filter(
          docente => docente.correo !== correo
        );
        
        useCursoStore().updateCursoDocentes(updatedDocentes);
      }
    } catch (error) {
      console.error("No se pudo eliminar docente", error);
    }
  };

  const handleEditUser = async(correo: string, field: string, newValue: string) => {
    try {
      await $fetch(`${config.public.apiUrl}/courses/${courseId.value}/user/${correo}`, {
        method: "PUT",
        body: {
          field: field,
          value: newValue
        }
      });
      
      // Update the local store
      if (curso.value && curso.value.docentes) {
        const updatedDocentes = curso.value.docentes.map(docente => {
          if (docente.correo === correo) {
            return { ...docente, [field]: newValue };
          }
          return docente;
        });
        useCursoStore().updateCursoDocentes(updatedDocentes);
      }
    } catch (error: any) {
      if (error.data?.error === "teacher email does not exist in the system") {
        toast.add({
            title: 'Error al editar',
            description: 'El correo no existe',
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
    }
  };

  const handleMakeModerator = async(correo: string, mod: boolean) => {
    try {
      await $fetch(`${config.public.apiUrl}/courses/${courseId.value}/moderator/${correo}`, {
        method: "PUT",
        body: {
          moderador: !mod 
        }
      });
      
      // Update the local store
      if (curso.value && curso.value.docentes) {
        const updatedDocentes = curso.value.docentes.map(docente => {
          if (docente.correo === correo) {
            return { ...docente, moderador: !mod };
          }
          return docente;
        });
        useCursoStore().updateCursoDocentes(updatedDocentes);
      }
    } catch (error) {
      console.error("No se pudo actualizar el estado de moderador", error);
    }
  };

  // SWIRCH BETWEEN GROUPS OR DOCENTES LIST------------
  // Altern between views
  const toggleView = () => {
    showGroups.value = !showGroups.value;
    
    // Reset search bar
    searchTerm.value = "";
  };

  // Icon State
  const currentIcon = computed(() =>
    showGroups.value
      ? "fluent:people-community-12-filled"
      : "fluent:book-32-filled",
  );

  // Placeholder text for the search bar
  const placeholderText = computed(() =>
    showGroups.value ? "Buscar Grupo..." : "Buscar Docente...",
  );

  // SEARCH BAR  ---------------
  const searchTerm = ref("");

  // Filtered groups based on search
  const filteredGroups = computed(() => {

    if (!searchTerm.value) return groups.value;
    return groups.value.filter(
      (group) =>
        group.nombre.toLowerCase().includes(searchTerm.value) ||
        group.docente.correo.toLowerCase().includes(searchTerm.value),
    );
  });

  const handleSearch = (value: string) => {
    searchTerm.value = value;
  };

  // LOAD SCREEN
  const loadMg = ref('')
  const canLoadScreen = ref(false)

  const loadScreen = (message: string, loadValue: boolean) => {
    loadMg.value = message
    canLoadScreen.value = loadValue
  }
</script>

<template>
  <div class="container mx-auto p-6">
    <!-- Navigation -->
    <UBreadcrumb
      :links="items"
      :ui="{
        ol: 'gap-x-3',
        li: 'gap-x-3',
        active: 'text-Purple-P dark:text-Muted-Brown',
        inactive:
          'text-Dark-Grey dark:text-Light-Gray hover:text-Pure-Black hover:dark:text-Warm-White',
      }"
    >
      <template #divider>
        <UIcon
          name="fluent:chevron-right-12-filled"
          class="text-gray-500 dark:text-gray-400 w-4 h-4"
        />
      </template>
    </UBreadcrumb>

    <div class="flex flex-col lg:flex-row gap-16 mt-8">
      <!-- Group Section -->
      <div class="flex-1">
        <!-- Searchbar and Buttons -->
        <div class="mb-6">
          <div
            class="mb-6 flex sm:flex-row gap-4 justify-between sm:items-center relative"
          >
            <transition name="scale" mode="out-in">
              <UtilitiesSearchBar
                :key="placeholderText"
                :placeholderText="placeholderText"
                @search="handleSearch"
              />
            </transition>

            <div class="flex items-center gap-4">
              <transition name="scale" mode="out-in">
                <SettingsCourseSettings v-if="showGroups && isModerator" @load-screen="loadScreen"/>
              </transition>

              <!-- Transition para el icono -->
              <transition name="scale" mode="out-in">
                <UIcon
                  :key="currentIcon"
                  :name="currentIcon"
                  class="text-4xl hover:bg-Medium-Blue hover:dark:bg-Muted-Brown cursor-pointer transition-all duration-150 hover:-translate-y-1"
                  @click="toggleView"
                />
              </transition>

              <!-- Transition para los botones de creación -->
              <transition name="scale" mode="out-in">
                <div
                  :key="showGroups ? 'group-btn' : 'teacher-btn'"
                  class="sm:relative fixed bottom-6 right-6 z-10 sm:z-auto sm:bottom-0 sm:right-0 transition-all duration-300"
                >
                  <CreateGroup @addGroup="addGroup" v-if="showGroups" />
                  <CreateTeacher v-else-if="!showGroups && isModerator"/>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Altern Between Groups or Teachers -->
        <!-- Groups -->
        <transition name="slide" mode="out-in">
          <!-- Grupos -->
          <div v-if="showGroups" :key="'groups'" class="relative">
            <ClientOnly>
              <template v-if="!loading">
                <Transition name="fade-minimal" appear>
                  <!-- No Groups warning -->
                  <div
                    v-if="!groups.length"
                    class="flex items-center justify-center md:mt-24 lg:mt-36 mt-10 transition-colors duration-150"
                  >
                    <div
                      class="relative w-80 h-52 flex flex-col items-center justify-center transition-colors duration-150"
                    >
                      <!-- Corner decorations -->
                      <div
                        class="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tl-lg transition-colors duration-150"
                      ></div>
                      <div
                        class="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tr-lg transition-colors duration-150"
                      ></div>
                      <div
                        class="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-bl-lg transition-colors duration-150"
                      ></div>
                      <div
                        class="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-br-lg transition-colors duration-150"
                      ></div>

                      <UIcon
                        name="fluent:warning-24-regular"
                        class="text-6xl text-Purple-P dark:text-Muted-Brown mb-4"
                      />
                      <p
                        class="text-xl font-medium text-center text-Pure-Black dark:text-White-w transition-colors duration-150"
                      >
                        NO HAY<br />NINGUN GRUPO
                      </p>
                    </div>
                  </div>
                </Transition>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Transition
                    v-for="group in filteredGroups"
                    :key="group._id"
                    name="course-item"
                    appear
                  >
                    <UButton
                      variant="ghost"
                      class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-6 md:p-2 shadow-lg aspect-square flex flex-col justify-center items-center gap-2 hover:bg-MLight-White dark:hover:bg-Dark-Grey transition-[transform,box-shadow,colors] duration-200 hover:-translate-y-1 outline-none"
                      @click="$router.push(`/Curso/${courseId}/Grupo/${group._id}`)"
                    >
                      <h3
                        class="text-lg font-semibold text-center text-Pure-Black dark:text-White-w transition-colors duration-[0.1s]"
                      >
                        {{ group.nombre }}
                      </h3>
                      <p class="text-sm text-center w-full text-Medium-Gray dark:text-Light-Gray transition-colors duration-[0.1s]">
                        Profesor encargado <br />
                        <span class="block truncate max-w-full text-Medium-Gray/70 dark:text-Light-Gray/70 transition-colors duration-[0.1s]">{{ group.docente.correo }}</span>
                      </p>
                    </UButton>
                  </Transition>
                </div>
              </template>

              <!-- Skeleton Loader -->
              <template #fallback>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <USkeleton
                    v-for="i in 4" 
                    :key="i" 
                    class="w-full h-[100px] aspect-square"
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

          <!-- Teachers Table -->
          <div v-else :key="'teachers'">
            <UtilitiesPeopleTable
              view="docentes"
              :searchTerm="searchTerm"
              :isModerator="isModerator"
              :data="docentesCurso"
              @delete-user="handleUserDeletion"
              @make-moderator="handleMakeModerator"
              @edit-user="handleEditUser"
            />
          </div>
        </transition>
      </div>

      <!-- Rubric Preview -->
      <div
        class="w-full lg:w-[500px] h-[280px] bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4 shadow-lg flex flex-col relative z-1"
      >
        <div v-if="rubrics.length > 0" class="w-full h-full rounded-lg overflow-hidden relative">
          <NuxtImg
            src="RubricaTest.PNG"
            class="w-full h-full object-cover"
            style="filter: blur(1.5px)"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div class="absolute bottom-4 left-4 right-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex flex-col items-start gap-2">
                <h3 class="text-lg font-semibold text-white truncate">{{ displayRubric?.nombre }}</h3>
                <UToggle v-if="isModerator"
                  v-model="getRubricState(displayRubric).value"
                  on-icon="fluent:checkmark-circle-24-filled"
                  off-icon="fluent:dismiss-circle-24-filled"
                  :ui="{
                    base: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    active: 'bg-green-600 dark:bg-green-400',
                    inactive: 'bg-red-600 dark:bg-red-400',
                  }"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!loadingRubrics" class="w-full h-full rounded-lg overflow-hidden relative flex items-center justify-center">
          <div class="relative w-80 h-52 flex flex-col items-center justify-center transition-colors duration-150">
            <!-- Corner decorations -->
            <div class="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tl-lg transition-colors duration-150"></div>
            <div class="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tr-lg transition-colors duration-150"></div>
            <div class="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-bl-lg transition-colors duration-150"></div>
            <div class="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-br-lg transition-colors duration-150"></div>

            <UIcon
              name="fluent:warning-24-regular"
              class="text-6xl text-Purple-P dark:text-Muted-Brown mb-4"
            />
            <p class="text-xl font-medium text-center text-Pure-Black dark:text-White-w transition-colors duration-150">
              NO HAY<br />NINGUNA RÚBRICA
            </p>
          </div>
        </div>

        <div class="absolute bottom-4 right-4 flex gap-2">
          <UButton
            v-if="rubrics.length > 0"
            size="lg"
            class="rounded-lg shadow-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray dark:text-White-w transition-colors duration-150"
            @click="$router.push(`/Rubrica/${displayRubric?._id}`)"
          >
            Modificar
          </UButton>
          <UButton
            v-if="rubrics.length > 1"
            size="lg"
            class="rounded-lg shadow-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray dark:text-White-w transition-colors duration-150"
            @click="showRubricModal = true"
          >
            Ver más
          </UButton>
        </div>

        <!-- Load screen for rubrics -->
        <UtilitiesLoadingScreen
          :isLoading="loadingRubrics"
          message="Cargando rúbricas..."
          :noBackground="true"
          :noSpinnerBackground="true"
          spinnerSize="sm"
        />
      </div>
    </div>

    <!-- Load Screen -->
    <UtilitiesLoadingScreen
      :isLoading="canLoadScreen"
      :message="loadMg"
      :fullscreen="true"
    />

    <!-- Update the UModal for other rubrics -->
    <UModal
      v-model="showRubricModal"
      prevent-close
      :ui="{
        width: 'max-w-xs sm:max-w-3xl',
        height: 'max-h-[700px]',
        container: 'flex items-center justify-center',
        overlay: { background: 'dark:bg-Light-Gray/15' },
      }"
    >
      <UCard
        :ui="{
          background: 'dark:bg-Medium-Dark',
          ring: '',
          divide: '',
          header: { base: 'border-b border-Purple-P dark:border-Dark-Grey' },
          base: 'w-full',
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 dark:text-white">
              Todas las Rúbricas
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="fluent:dismiss-12-filled"
              class="-my-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
              @click="showRubricModal = false"
            />
          </div>
        </template>

        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="rubric in rubrics"
              :key="rubric._id"
              class="bg-Warm-White dark:bg-Warm-Dark rounded-lg p-4 shadow-md"
            >
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-medium text-Pure-Black dark:text-White-w truncate">{{ rubric.nombre }}</h4>
                <UToggle v-if="isModerator"
                  v-model="getRubricState(rubric).value"
                  on-icon="fluent:checkmark-circle-24-filled"
                  off-icon="fluent:dismiss-circle-24-filled"
                  :ui="{
                    base: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    active: 'bg-green-600 dark:bg-green-400',
                    inactive: 'bg-red-600 dark:bg-red-400',
                  }"
                />
              </div>
              <UButton
                size="sm"
                class="mt-2 w-full bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray dark:text-White-w"
                @click="$router.push(`/Rubrica/${rubric._id}`)"
              >
                Ver detalles
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<style scoped>
/* Course item transitions reutilizadas */
.course-item-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.course-item-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.course-item-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.course-item-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

/* Minimal fade transition for the no groups warning */
.fade-minimal-enter-active {
  transition: opacity 0.4s ease;
}

.fade-minimal-leave-active {
  transition: opacity 0.2s ease;
}

.fade-minimal-enter-from,
.fade-minimal-leave-to {
  opacity: 0;
}

/* Grid container smooth transitions */
.grid {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}


/* Transition for Icons and Buttons */
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.5);
  opacity: 0;
}

.scale-enter-to,
.scale-leave-from {
  transform: scale(1);
  opacity: 1;
}

/* Slide Main Content */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
}

.slide-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* ------ Group Animations when the searchbar is used */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.list-leave-active {
  position: absolute;
  width: calc(33.33% - 16px);
}

@media (max-width: 768px) {
  .list-leave-active {
    width: calc(50% - 16px);
  }
}

@media (max-width: 640px) {
  .list-leave-active {
    width: calc(100% - 16px);
  }
}
</style>

