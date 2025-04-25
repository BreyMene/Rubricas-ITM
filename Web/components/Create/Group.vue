<script setup lang="ts">
  const config = useRuntimeConfig();
  const route = useRoute();
  import { useDocenteStore } from "~/utils/store";

  const isOpen = ref(false);
  const emit = defineEmits(['addGroup']);

  const estudianteList = ref<Estudiante[]>([])
  const estudianteNombre = ref('');
  const estudianteCorreo = ref('');
  const estudianteNombreError = ref('');
  const estudianteCorreoError = ref('');
  const isEstudianteNombreValid = ref(true);
  const isEstudianteCorreoValid = ref(true);

  const groupName = ref('');
  const groupNameError = ref('');
  const isGroupNameValid = ref(true);

  const validateGroupName = () => {
    // Reset error
    groupNameError.value = '';
    isGroupNameValid.value = true;

    // Check if group name is empty
    if (groupName.value.trim() === '') {
      groupNameError.value = 'Se requiere un nombre';
      isGroupNameValid.value = false;
      return false;
    }

    return true;
  };

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

  const addGroup = async() => {
    if (!validateGroupName()) {
      return;
    }

    // Luego corregir el id, si se pone vacio da error
    const d: Docente = {
      _id: useDocenteStore().getID,
      correo: "",
    }
    const g: Grupo = {
      _id: "a",
      nombre: groupName.value,
      docente: d,
      estudiantes: estudianteList.value
    };

    const cursoId = computed(() => route.params.id);
    const grupo = await $fetch<Grupo>(`${config.public.apiUrl}/groups`, {
      method: "POST",
      body: {
        cursoId: cursoId.value,
        nombre: g.nombre,
        docente: g.docente._id,
        estudiantes: g.estudiantes,
      },
    });

    if (!grupo) {
      groupNameError.value = "Error al crear grupo";
      return;
    }

    emit("addGroup", grupo);
    groupName.value = '';
    estudianteList.value = [];
    isOpen.value = false;
  };

  const handleEstudianteDeletion = (correo: string) => {
    estudianteList.value = estudianteList.value.filter(estudiante => estudiante.correo !== correo);
  };

  // Reset all fields when modal is closed
  watch(isOpen, (newValue) => {
    if (!newValue) {
      // Add a delay before resetting
      setTimeout(() => {
        groupName.value = '';
        groupNameError.value = '';
        estudianteNombre.value = '';
        estudianteCorreo.value = '';
        estudianteNombreError.value = '';
        estudianteCorreoError.value = '';
        estudianteList.value = [];
        isGroupNameValid.value = true;
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
              Crear Grupo
            </h3>
            <UButton color="gray" variant="ghost" icon="fluent:dismiss-12-filled" class="-my-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20" @click="isOpen = false" />
          </div>
        </template>

        <!-- Modal Content -->
        <div>
          <!-- Form Content -->
          <div class="flex flex-col md:flex-row gap-9">
            <div class="md:w-2/5 space-y-7 my-auto">
              <!-- Left Side - Two Inputs -->
              <UFormGroup label="Nombre del Grupo" required :error="!isGroupNameValid" :hint="groupNameError"
                :ui="{
                  hint: 'text-red-500 dark:text-red-500 text-sm mt-1'
                }">
                <UInput v-model="groupName" size="sm" placeholder="Ingrese el nombre" class="w-full" @blur="validateGroupName"
                  :ui="{
                    icon: {
                          trailing: { pointer: '' }
                    },
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
                      size="sm"
                      v-model="estudianteNombre"
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
                      size="sm"
                      v-model="estudianteCorreo"
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
              <UtilitiesPeopleTable view="estudiantes" :hideFinalNote="true" :data="estudianteList" @delete-user="handleEstudianteDeletion"/>
            </div>
          </div>

          <div class="flex justify-end mt-2 gap-4">
            <UButton variant="link" color="black" @click="isOpen = false">
              Cancelar
            </UButton>
            <UButton class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray" @click="addGroup">
              Crear
            </UButton>
          </div>

        </div>

      </UCard>
    </UModal>
  </div>
</template>

