<script setup lang="ts">
  import { useDocenteStore } from "~/utils/store";
  const config = useRuntimeConfig();

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

  const rubricButtons = computed(() => [
  [
      {
        label: "Crear Rubrica",
        to: '/crearRubrica',
      },
      {
        label: "Clonar Rubrica",
        click: () => cloneRubric()
      }
  ],
  ]);

  // Function to handle rubrica selection with explicit type
  const selectRubrica = (rubricaId: string) => {
      selectedRubrica.value = rubricaId;
      isOpen.value = true;
  };

  // SEARCH BAR
  const searchTerm = ref('');

  // Filtered rubricas based on search
  const filteredRubricas = computed(() => {
      if (!searchTerm.value) return rubricas.value;
      return rubricas.value.filter(rubrica =>
          rubrica.nombre.toString().toLowerCase().includes(searchTerm.value)
      );
  });

  const handleSearch = (value: string) => {
      searchTerm.value = value;
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
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const selectCourse = (course: Curso) => {
    selectedRubrica.value = course.rubricaGuia?._id || "";
    selectedCourseId.value = course._id;
  }

  const openRubric = () => {
    navigateTo(`/Rubrica/${selectedRubrica.value}`)
    isOpen.value = false;
  }

  const cloneRubric = () => {
    console.log(selectedRubrica.value)
    navigateTo({path: '/crearRubrica', query: {clone: selectedRubrica.value} })
  }

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
      }, 300);
    }
  });

</script>

<template>
  <div class="container mx-auto p-6 ">
    <div class="flex flex-col md:flex-row gap-6">
      <!-- Main Content Area -->
      <div class="flex-1">
        <div class="mb-6">
            <h2 class="text-2xl font-semibold mb-4">Mis Rubricas</h2>
            <div class="mb-6 flex sm:flex-row gap-4 justify-between sm:items-center relative">
                <UtilitiesSearchBar placeholderText="Buscar Rubrica..." @search="handleSearch"/>

                  <!-- Desktop buttons - visible on SM and above -->
                <div class="hidden sm:flex gap-3">
                  <UButton label="Clonar Rubrica" @click="openCourses = true" size="xl" class="shadow-lg dark:text-White-w rounded-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"/>
                  <UButton to="/crearRubrica" label="Crear Rubrica" size="xl" class="shadow-lg dark:text-White-w rounded-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"/>
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
                    background: 'bg-White-w dark:bg-Pure-Black/60',
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
              <TransitionGroup
                  v-if="!loading"
                  name="list"
                  tag="div"
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 select-none"
              >
                <div v-if="!rubricas.length" class="flex items-center justify-center mt-24 md:mt-0 md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:translate-y-1/2">
                    <div class="relative w-80 h-52 flex flex-col items-center justify-center">
                        <!-- Corner decorations -->
                        <div class="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tl-lg"></div>
                        <div class="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tr-lg"></div>
                        <div class="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-bl-lg"></div>
                        <div class="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-br-lg"></div>

                        <UIcon name="fluent:warning-24-regular" class="text-6xl text-Purple-P dark:text-Muted-Brown mb-4" />
                        <p class="text-xl font-medium text-center text-Pure-Black dark:text-White-w">NO HAY<br>NINGUNA RUBRICA</p>
                    </div>
                </div>

                <UButton v-else variant="ghost"
                  v-for="rubrica in filteredRubricas"
                  :key="rubrica._id"
                  @click="selectRubrica(rubrica._id)"
                  class="w-full lg:w-full h-[280px] bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4 shadow-lg flex flex-col relative z-1 hover:shadow-xl transition-shadow duration-200 cursor-pointer hover:bg-MLight-White dark:hover:bg-Dark-Grey"
                >
                  <div class="w-full h-full rounded-lg overflow-hidden relative">
                    <NuxtImg
                      src="RubricaTest.PNG"
                      class="w-full h-full object-cover"
                      style="filter: blur(1.5px);"
                    />
                  </div>
                  <h3 class="text-Pure-Black dark:text-White-w">{{ rubrica.nombre }}</h3>
                </UButton>
              </TransitionGroup>

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
        v-model="isOpen"
        :ui="{
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
                  <h3 class="text-base font-semibold leading-6 dark:text-White-w">
                      Detalles Rúbrica {{ selectedRubrica }}
                  </h3>
              </div>
            </template>

            <div class="flex-1 overflow-y-auto">
              <!-- Rúbrica details -->
              <div class="space-y-4">
                  <p class="dark:text-White-w">
                      Curso al que pertenece: 
                  </p>
                  <p class="dark:text-White-w">
                      Grupo al que pertenece:
                  </p>
              </div>
            </div>

            <div class="mt-4 flex justify-end">
                <UButton
                    variant="link" color="black"
                    @click="isOpen = false">
                    Cerrar
                </UButton>
                <UButton class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray" @click="openRubric">
                    Ver Rubrica
                </UButton>
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
              Finalizar Rúbrica
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
              <h4 class="text-lg font-medium mb-1 dark:text-white">Seleccionar Curso</h4>
              <h1 class="mb-4 dark:text-white/60">Clonara la ultima rubrica guia</h1>

              <!-- Course Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="course in courses"
                  :key="course._id"
                  class="relative bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4 shadow-md flex flex-col justify-center items-center gap-2 hover:bg-MLight-White dark:hover:bg-Dark-Grey transition-colors duration-200"
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
              Cancelar
            </UButton>
            <UButton
              class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"
              @click="cloneRubric"
            >
              Clonar
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
</template>

<style scoped>
  /* Group Animations when the searchbar is used */
  .list-move,
  .list-enter-active,
  .list-leave-active {
      transition: all 0.3s ease;
  }

  .list-enter-from,
  .list-leave-to {
      opacity: 0;
      transform: translateY(30px);
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