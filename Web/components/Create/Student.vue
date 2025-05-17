<script setup lang="ts">
  const isOpen = ref(false)
  const toast = useToast()
  const config = useRuntimeConfig();
  const route = useRoute();
  const groupId = computed(() => route.params.groupId);

  const estudianteList = ref<Estudiante[]>([])
  const estudianteNombre = ref('');
  const estudianteCorreo = ref('');
  const estudianteNombreError = ref('');
  const estudianteCorreoError = ref('');
  const isEstudianteNombreValid = ref(true);
  const isEstudianteCorreoValid = ref(true);

  const validateEstudianteNombre = () => {
    // Reset error
    estudianteNombreError.value = '';
    isEstudianteNombreValid.value = true;

    if (estudianteNombre.value.trim() === '') {
      isEstudianteNombreValid.value = false;
      return false;
    }

    return true;
  };

  const validateEstudianteCorreo = () => {
    // Reset error
    estudianteCorreoError.value = '';
    isEstudianteCorreoValid.value = true;

    if (estudianteCorreo.value.trim() === '') {
      isEstudianteCorreoValid.value = false;
      return false;
    }

    // Check if it's a valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(estudianteCorreo.value)) {
      estudianteCorreoError.value = 'Email inválido';
      isEstudianteCorreoValid.value = false;
      return false;
    }

    // Check if it ends with the institutional domain
    if (!estudianteCorreo.value.endsWith('@correo.itm.edu.co')) {
      estudianteCorreoError.value = 'Debe usar un correo institucional';
      isEstudianteCorreoValid.value = false;
      return false;
    }

    return true;
  };

  const addEstudiante = () => {
    const isNombreValid = validateEstudianteNombre();
    const isCorreoValid = validateEstudianteCorreo();

    if (!isNombreValid || !isCorreoValid) {
      return;
    }

    // Check if student email already exists in the list
    if (estudianteList.value.some(estudiante => estudiante.correo === estudianteCorreo.value)) {
      estudianteCorreoError.value = 'Correo ya ingresado';
      isEstudianteCorreoValid.value = false;
      return;
    }

    const e: Estudiante = {
      nombre: estudianteNombre.value,
      correo: estudianteCorreo.value,
      promedio: 0,
    };

    estudianteList.value.push(e);
    estudianteNombre.value = '';
    estudianteCorreo.value = '';
  };

  const handleEstudianteDeletion = (correo: string) => {
    estudianteList.value = estudianteList.value.filter(estudiante => estudiante.correo !== correo);
  };

  const handleEditUser = (correo: string, field: string, value: string) => {
    const estudianteIndex = estudianteList.value.findIndex(e => e.correo === correo);
    if (estudianteIndex !== -1) {
        if (field === 'nombre') {
            estudianteList.value[estudianteIndex].nombre = value;
        } else if (field === 'correo') {
            estudianteList.value[estudianteIndex].correo = value;
        }
    }
  };

  const saveChanges = async () => {
    try {
      // Filter out students that already have a name (they're already in the database)
      const newEstudiantes = estudianteList.value
      if (newEstudiantes.length === 0) {
        isOpen.value = false;
        return;
      }
      
      const response = await $fetch<Grupo>(`${config.public.apiUrl}/groups/${groupId.value}/estudiantes`, {
        method: "PUT",
        body: {
          estudiantes: newEstudiantes
        }
      });
    
      useCursoStore().updateGrupoEstudiantes(response.estudiantes);
      isOpen.value = false;
    } catch (error: any) {
      if (error.response?.status === 409){
        const alreadyInCourse = error.response?._data?.alreadyInCourse || [];
        const emailList = alreadyInCourse.join(', ');

        toast.add({
            title: `Algunos estudiantes ya existen`,
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
        estudianteCorreoError.value = 'Ha ocurrido un error al ingresar los estudiantes'
    }
  };

  watch(isOpen, (newValue) => {
    if (!newValue) {
      // Add a delay before resetting the icon
      setTimeout(() => {
        estudianteNombre.value = '';
        estudianteCorreo.value = '';
        estudianteNombreError.value = '';
        estudianteCorreoError.value = '';
        estudianteList.value = [];
        isEstudianteNombreValid.value = true;
        isEstudianteCorreoValid.value = true;
      }, 300);
    }
  });
</script>

<template>
  <div>
    <UButton size="xl" @click="isOpen = true" class="shadow-lg rounded-xl bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray">
            <UIcon name="fluent:add-16-filled" class="text-xl dark:text-White-w"/>
    </UButton>

    <UModal v-model="isOpen" prevent-close :ui="{  width: 'w-full sm:max-w-5xl', height: 'max-h-[700px]',
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
              Agregar Estudiante
            </h3>
            <UButton color="gray" variant="ghost" icon="fluent:dismiss-12-filled" class="-my-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20" @click="isOpen = false" />
          </div>
        </template>
        
        <!-- Modal Content -->
        <div>
          <!-- Form Content -->
          <div class="flex flex-col md:flex-row gap-9">  
            <div class="md:w-2/5 space-y-7 my-auto">

              <!-- Add Student -->
              <div class="relative bg-MLight-White dark:bg-Dark-Grey/50 rounded-xl p-6 sm:p-4 w-full shadow-md">
                <!-- Floating Button -->
                <UButton
                  size="md" variant="ghost"
                  icon="fluent:add-16-filled"
                  @click="addEstudiante"
                  class="absolute right-[-8px] sm:right-[-15px] top-1/2 transform -translate-y-1/2 rounded-full bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray shadow-lg text-White-w dark:text-White-w"
                />

                <!-- Inputs -->
                <div class="space-y-8">
                  <UFormGroup label="Nombre Estudiante" :error="!isEstudianteNombreValid" :hint="estudianteNombreError"
                    :ui="{
                      hint: 'text-red-500 dark:text-red-500 text-sm mt-1'
                    }">
                    <UInput
                      v-model="estudianteNombre"
                      size="sm"
                      placeholder="Ingrese el nombre"
                      class="w-full"
                      @blur="validateEstudianteNombre"
                      @keyup.enter="addEstudiante"
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
                    />
                  </UFormGroup>

                  <UFormGroup label="Correo Estudiante" :error="!isEstudianteCorreoValid" :hint="estudianteCorreoError"
                    :ui="{
                      hint: 'text-red-500 dark:text-red-500 text-sm mt-1'
                    }">
                    <UInput
                      v-model="estudianteCorreo"
                      size="sm"
                      placeholder="ejemplo@correo.itm.edu.co"
                      class="w-full"
                      @blur="validateEstudianteCorreo"
                      @keyup.enter="addEstudiante"
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
                    />
                  </UFormGroup>
                </div>
              </div>

            </div>

            <!-- Right Side - Table -->
            <div class="md:w-2/3 flex flex-col h-full">
              <UtilitiesPeopleTable view="estudiantes" :hideFinalNote="true" :data="estudianteList" @delete-user="handleEstudianteDeletion" @edit-user="handleEditUser" :isModerator="true"/>
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

