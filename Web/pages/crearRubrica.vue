<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import type {Criterio, Tema, Rubrica} from '~/utils/types'
  import { useDocenteStore } from "~/utils/store";

  const config = useRuntimeConfig();
  const isOpen = ref(false);
  const isMobile = ref(false);
  const toast = useToast();

  const temas = ref<Tema[]>([])

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

  const fetchGroups = async () => {
    try {
      const data = await $fetch<{_id: string, nombre: string}[]>(
        `${config.public.apiUrl}/groups/user/${docenteID}`,
      );
      groups.value = data;
    } catch (error) {
      console.error("Error fetching groups:", error);
      groups.value = [];
    }
  };

  onMounted(() => {
    fetchCourses();
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

  const validateRubricName = () => {
    rubricNameError.value = "";

    if (rubricName.value.trim() === "") {
      rubricNameError.value = "Se requiere un nombre";
      return false;
    }

    return true;
  };

  const CreateRubric = async() => {
    if (!validateRubricName()) {
      return;
    }

    if (selectedGroups.value.length === 0 && !isGuideRubric.value) {
      toast.add({
        title: 'Debe seleccionar al menos un grupo o marcar como rúbrica guía',
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

    try{
      const r: Rubrica = {
        _id: "a",
        nombre: rubricName.value,
        temas: temas.value
      }

      const id  = await $fetch<String>(`${config.public.apiUrl}/rubrics/`, {
        method: "POST",
        body: {
          nombre: r.nombre,
          temas: r.temas
        },
      });
      console.log(id)

      await $fetch(`${config.public.apiUrl}/rubrics/${id}/group`, {
        method: "PUT",
        body: {
          ids: selectedGroups.value,
        },
      });

      isOpen.value = false;
    }catch(error: any){

    }
  }

  // Function to handle course selection
  const selectCourse = (course: Curso) => {
    selectedCourseId.value = course._id;
    selectedCourseName.value = course.nombre;
    fetchGroups();
    showGroups.value = true;
  }

  // Function to go back to course selection
  const goBackToCourses = () => {
    showGroups.value = false;
    selectedCourseId.value = '';
    selectedCourseName.value = '';
    selectedGroups.value = [];
    isGuideRubric.value = false;
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
</script>

<!-- pages/rubricas.vue -->
<template>
  <div class="container mx-auto p-0 md:p-4">
    <div class="overflow-x-auto lg:overflow-x-clip">
      <div class="min-w-[1200px] lg:min-w-0 bg-White-w dark:bg-Dark-Grey shadow-lg rounded-xl overflow-visible">
        <div class="sticky top-0 flex bg-MLight-White dark:bg-Warm-Dark font-bold dark:text-White-w p-3 z-10 text-xs lg:text-sm xl:text-base rounded-lg">
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

        <RubricaTema
          v-for="(tema, index) in temas"
          :key="index"
          :tema="tema"
          :temaIndex="index"
          @deleteTema="deleteTema"
          @addRow="addRow"
          @deleteRow="deleteRow"
        />
      </div>
    </div>

    <div class="flex justify-end p-4">
      <UButton
        icon="fluent:add-16-filled"
        size="lg"
        class="rounded-xl shadow-lg bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray dark:text-White-w"
        @click="addTema"
      >
        Agregar Tema
      </UButton>
    </div>

    <!-- Finish Rubric Button -->
    <div class="flex justify-end p-4">
      <UButton
        size="xl"
        @click="isOpen = true"
        class="shadow-lg rounded-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"
      >
        <UIcon name="fluent:checkmark-24-filled" class="mr-2 text-xl dark:text-White-w"/>
        <span class="text-white">Finalizar Rúbrica</span>
      </UButton>
    </div>
  </div>

  <div>
    <!-- Finish Rubric Modal -->
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
              Finalizar Rúbrica
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
            <!-- Rubric Name Input -->
            <div class="bg-MLight-White dark:bg-Dark-Grey/50 rounded-xl p-4 shadow-md mx-0 sm:mx-36">
              <UFormGroup label="Nombre de la Rúbrica" required :error="!!rubricNameError" :hint="rubricNameError"
                :ui="{
                  hint: 'text-red-500 dark:text-red-500 text-sm mt-1'
                }">
                <UInput
                  v-model="rubricName"
                  size="sm"
                  placeholder="Ingrese el nombre de la rúbrica"
                  class="w-full"
                  :ui="{
                    icon: { trailing: { pointer: '' } },
                    ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                    color: {
                      gray: {
                        outline: 'shadow-lg bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                      }
                    }
                  }"
                  color="gray"
                  @blur="validateRubricName"
                />
              </UFormGroup>
            </div>

            <!-- Course Selection View -->
            <div v-if="!showGroups" class="bg-MLight-White dark:bg-Dark-Grey/50 rounded-xl p-6 shadow-md">
              <h4 class="text-lg font-medium mb-4 dark:text-white">Seleccionar Curso</h4>

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
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Group List -->
                <div class="space-y-3">
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
                        base: 'w-5 h-5 checked:bg-Medium-Blue dark:checked:bg-Muted-Brown transition-colors duration-200',
                        icon: 'text-white',
                        rounded: 'rounded',
                        background: 'bg-Light-Gray dark:bg-Light-Gray/30',
                        label: 'text-Pure-Black dark:text-White-w font-medium'
                      }"
                    />
                  </div>
                </div>
                <UDivider label="Ó" :orientation="isMobile ? 'horizontal' : 'vertical'" size="md"
                  :ui="{
                    label: 'text-Medium-Blue dark:text-Muted-Brown',
                    border: {
                      base: 'rounded border-Medium-Blue dark:border-Muted-Brown'
                    }
                  }"/>
                <!-- Guide Rubric Checkbox -->
                <div class="flex flex-col justify-start">
                  <UCheckbox
                    v-model="isGuideRubric"
                    label="Hacer rúbrica guía del curso"
                    :ui="{
                      container: 'flex items-center gap-2',
                      base: 'w-5 h-5 checked:bg-Medium-Blue dark:checked:bg-Muted-Brown transition-colors duration-200',
                      icon: 'text-white',
                      rounded: 'rounded',
                      background: 'bg-Light-Gray dark:bg-Light-Gray/50',
                      label: 'text-Pure-Black dark:text-White-w font-medium'
                    }"
                  />
                </div>
              </div>

              <div v-if="groups.length === 0" class="text-center p-8 text-Light-Gray dark:text-MLight-White/50">
                No hay grupos disponibles para este curso.
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
              Cancelar
            </UButton>
            <UButton
              class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"
              @click="CreateRubric"
            >
              Finalizar
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>