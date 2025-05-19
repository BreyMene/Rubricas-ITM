<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import type {Criterio, Tema, Rubrica} from '~/utils/types'
  import { useDocenteStore } from "~/utils/store";

  const route = useRoute();
  const rubricaId = computed(() => route.params.id);
  const rubricEstado = ref('activo'); // Change this later

  const config = useRuntimeConfig();
  const isOpen = ref(false);
  const isMobile = ref(false);
  const toast = useToast();

  const temas = ref<Tema[]>([])

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
      return sum + tema.criterios.reduce((temaSum, criterio) => temaSum + (criterio.acumulado || 0), 0);
    }, 0);
  });

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

  const fetchRubrica = async () => {
    try {
      const data = await $fetch<Rubrica>(
        `${config.public.apiUrl}/rubrics/${rubricaId.value}`,
      );
      temas.value = data.temas;
    } catch (error) {
      console.error("Error fetching groups:", error);
      groups.value = [];
    }
  };

  onMounted(() => {
    fetchCourses();
    fetchRubrica();
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
        estado: rubricEstado.value,
        temas: temas.value
      }

      const id  = await $fetch<String>(`${config.public.apiUrl}/rubrics/`, {
        method: "POST",
        body: {
          nombre: r.nombre,
          estado: r.estado,
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

        <!-- Add totals row -->
        <div v-if="temas.length > 0" class="flex bg-MLight-White dark:bg-Warm-Dark font-bold dark:text-White-w p-3 text-xs lg:text-sm xl:text-base rounded-lg mt-2">
          <div class="flex-none w-[20%] px-3">Total</div>
          <div class="flex-none w-[30%] px-3"></div>
          <div class="flex-none w-[10%] px-3 text-center">{{ totalPeso.toFixed(1) }}</div>
          <div class="flex-none w-[10%] px-3 text-center">{{ totalCalificacion.toFixed(1) }}</div>
          <div class="flex-none w-[10%] px-3 text-center">{{ totalAcumulado.toFixed(1) }}</div>
          <div class="flex-none w-[20%] px-3"></div>
        </div>
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
        class="shadow-lg rounded-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"
      >
        <UIcon name="fluent:save-16-filled" class="mr-2 text-xl dark:text-White-w"/>
        <span class="text-white">Guardar</span>
      </UButton>
    </div>
  </div>
</template>