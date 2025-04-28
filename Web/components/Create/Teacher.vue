<script setup lang="ts">
  const isOpen = ref(false)
  const toast = useToast()

  const config = useRuntimeConfig();
  const route = useRoute();
  const courseId = computed(() => route.params.id);

  const docenteList = ref<DocenteEnCurso[]>([])
  const docenteInput = ref("");
  const isDocenteInputValid = ref(true);
  const docenteInputError = ref("");

  const validateDocenteInput = () => {
    // Reset error
    docenteInputError.value = "";
    isDocenteInputValid.value = true;

    if (docenteInput.value.trim() === "") {
      return false;
    }

    // Check if it's a valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(docenteInput.value)) {
      docenteInputError.value = "Email inválido";
      isDocenteInputValid.value = false;
      return false;
    }

    // Check if it ends with the institutional domain
    if (!docenteInput.value.endsWith("@correo.itm.edu.co")) {
      docenteInputError.value = "Debe usar un correo institucional";
      isDocenteInputValid.value = false;
      return false;
    }

    return true;
  };

  const addDocente = () => {
    if (!validateDocenteInput()) {
      return;
    }

    if (docenteList.value.some(docente => docente.correo === docenteInput.value)) {
      docenteInputError.value = "Correo ya ingresado";
      isDocenteInputValid.value = false;
      return;
    }

    const d: DocenteEnCurso = {
      _id: "",
      correo: docenteInput.value,
      moderador: false
    };
    docenteList.value.push(d);
    docenteInput.value = "";
    docenteInputError.value = "";
    isDocenteInputValid.value = true;
  }

  const handleUserDeletion = (correo: string) => {
    docenteList.value = docenteList.value.filter(docente => docente.correo !== correo);
  };

  const handleMakeModerator = (correo: string, mod: boolean) => {
    const docenteIndex = docenteList.value.findIndex(docente => docente.correo === correo);
    if (docenteIndex !== -1) {
      docenteList.value[docenteIndex].moderador = !mod;
    }
  };

  const saveChanges = async () => {
    try {
      // Filter out docentes that already have an _id (they're already in the database)
      const newDocentes = docenteList.value.filter(d => !d._id || d._id === "");
      
      if (newDocentes.length === 0) {
        isOpen.value = false;
        return;
      }
      
      const response = await $fetch<Curso>(`${config.public.apiUrl}/courses/${courseId.value}/docentes`, {
        method: "PUT",
        body: {
          docentes: newDocentes
        }
      });
      
      useCursoStore().updateCursoDocentes(response.docentes);
      isOpen.value = false;
    } catch (error: any) {
      if (error.response?.status === 409){
        const alreadyInCourse = error.response?._data?.alreadyInCourse || [];
        const emailList = alreadyInCourse.join(', ');

        toast.add({
            title: `Algunos docentes ya existen`,
            description: `${emailList}`,
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
        })
      }
      else
        docenteInputError.value = 'Ha ocurrido un error al ingresar los docentes'
    }
  };

  watch(isOpen, (newValue) => {
    if (!newValue) {
      // Add a delay before resetting the icon
      setTimeout(() => {
        docenteInput.value = "";
        docenteInputError.value = "";
        docenteList.value = []
      }, 300);
    }
  });
</script>

<template>
  <div>
    <UButton size="xl" @click="isOpen = true" class="shadow-lg rounded-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray">
            <UIcon name="fluent:add-16-filled" class="text-xl dark:text-White-w"/>
    </UButton>

    <UModal v-model="isOpen" prevent-close :ui="{  width: 'w-full sm:max-w-3xl', height: 'max-h-[700px]',
        container: 'flex items-center justify-center',
        overlay: {background: 'dark:bg-Light-Gray/15',}}">

      <UCard :ui="{
          background: 'dark:bg-Medium-Dark', ring: '',
          divide: '',
          header: { base: 'border-b border-Purple-P dark:border-Dark-Grey'},
          base: 'w-full',
        }">

        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 dark:text-white">
              Agregar Docente
            </h3>
            <UButton color="gray" variant="ghost" icon="fluent:dismiss-12-filled" class="-my-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20" @click="isOpen = false" />
          </div>
        </template>
        
        <!-- Modal Content -->
        <div>
          <!-- Form Content -->
          <div class="flex flex-col md:flex-row gap-9">  
            <div class="md:w-2/5 space-y-7 my-auto">
              <UFormGroup label="Agregar Docente" :error="!isDocenteInputValid" :hint="docenteInputError"
                :ui="{
                  hint: 'text-red-500 dark:text-red-500 text-sm mt-1'
                }">
                <UInput
                  size="sm"
                  placeholder="ejemplo@correo.itm.edu.co"
                  class="w-full"
                  v-model="docenteInput"
                  @keyup.enter="addDocente"
                  @blur="validateDocenteInput"
                  :ui="{
                    icon: {
                      trailing: { pointer: '' },
                    },
                    ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                    color: {
                      gray: {
                        outline:
                          'shadow-lg bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown',
                      },
                    },
                  }"
                  color="gray"
                >
                  <template #trailing>
                    <UButton
                      v-show="docenteInput !== ''"
                      color="gray"
                      variant="link"
                      icon="fluent:add-16-filled"
                      :padded="false"
                      @click="addDocente"
                    />
                  </template>
                </UInput>
              </UFormGroup>
            </div>

            <!-- Right Side - Table -->
            <div class="md:w-2/3 flex flex-col h-full">
              <UtilitiesPeopleTable view="docentes" :data="docenteList" @delete-user="handleUserDeletion" @make-moderator="handleMakeModerator"/>
            </div>
          </div>

          <div class="flex justify-end mt-2 gap-4">
            <UButton variant="link" color="black" @click="isOpen = false">
              Cancelar
            </UButton>
            <UButton class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray" @click="saveChanges">
              Terminar
            </UButton>
          </div>

        </div>

      </UCard>
    </UModal>
  </div>
</template>

