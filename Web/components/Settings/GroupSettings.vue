<script setup lang="ts">  
  const grupo = computed(() => useCursoStore().grupoActivo);
  const toast = useToast()
  const config = useRuntimeConfig();

  const route = useRoute();
  const courseId = computed(() => route.params.id);
  const grupoId = computed(() => route.params.groupId);

  const isOpen = ref(false);
  const isConfirmDeleteOpen = ref(false);
  const loadScreen = ref(false)
  const emit = defineEmits(["loadScreen"]);

  // Form state
  const groupName = ref('');
  const groupNameError = ref('');
  const isGroupNameValid = ref(true);
  
  // Delete state
  const isDeleting = ref(false);   

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
  
  const updateGroup = async () => {
    if (!validateGroupName()) {
      return;
    }

    const originalName = grupo.value?.nombre;
    if (groupName.value === originalName) {
        toast.add({
            title: 'Sin cambios',
            description: 'No se realizaron cambios en el grupo.',
            icon: "fluent:info-16-filled",
            timeout: 2000,
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
        isOpen.value = false;
        return;
    }
    
    try {
        loadScreen.value = true
        emit("loadScreen", "Actualizando Grupo...", loadScreen.value)

        const response = await $fetch<Grupo>(`${config.public.apiUrl}/groups/${grupoId.value}/update`, {
            method: 'PUT',
            body: {
                nombre: groupName.value,
            },
        });
        useCursoStore().setGrupo(response)
      
        toast.add({
            title: `Actualizacion Exitosa`,
            description: `El grupo "${grupo.value?.nombre}" se actualizo con exito`,
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
        })

        isOpen.value = false;
    } catch (error: any) {
      groupNameError.value = "Error al actualizar el grupo";
      if(error.statusCode == 409) groupNameError.value = "Grupo ya existe"
    } finally{
        loadScreen.value = false
        emit("loadScreen", "", loadScreen.value)
    }
  };
  
  const deleteGroup = async () => {
    isDeleting.value = true;
    
    try {
      loadScreen.value = true
      emit("loadScreen", "Eliminando Grupo...", loadScreen.value)

      await $fetch<Grupo>(`${config.public.apiUrl}/groups/${grupoId.value}/delete`, {
        method: 'DELETE',
      });

      toast.add({
            title: `Eliminacion Exitosa`,
            description: `El grupo "${grupo.value?.nombre}" se elimino con exito`,
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
        })
      navigateTo(`/Curso/${courseId.value}`);
    } catch (error) {
      toast.add({
            title: `Eliminacion Fallida`,
            description: `El grupo "${grupo.value?.nombre}" no se pudo eliminar`,
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
    } finally {
        loadScreen.value = false
        emit("loadScreen", "", loadScreen.value)
        isDeleting.value = false;
    }
  };

  watch(isOpen, (newValue) => {
    if (newValue && grupo.value) {
      groupName.value = grupo.value.nombre;
    } else {
      // Reset form when modal closes
      setTimeout(() => {
        groupName.value = '';
        groupNameError.value = '';
        isGroupNameValid.value = true;
      }, 300);
    }
  });
</script>

<template>
  <div class="inline-flex">
    <UIcon
        name="fluent:settings-24-filled"
        class="text-4xl hover:bg-Medium-Blue hover:dark:bg-Muted-Brown cursor-pointer transition-all duration-150 hover:-translate-y-1"
        @click="isOpen = true"
    />

    <!-- Main Settings Modal -->
    <UModal v-model="isOpen" prevent-close :ui="{  
        wrapper: 'z-10',
        width: 'w-full sm:max-w-3xl', 
        height: 'max-h-[700px]',
        container: 'flex items-center justify-center',
        overlay: {background: 'dark:bg-Light-Gray/15'},
    }">
        <UCard :ui="{
            background: 'dark:bg-Medium-Dark', 
            ring: '',
            divide: '',
            header: { base: 'border-b border-Purple-P dark:border-Dark-Grey'},
            base: 'w-full',
        }">
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold leading-6 dark:text-white">
                        Ajustes del Grupo
                    </h3>
                    <UButton 
                        color="gray" 
                        variant="ghost" 
                        icon="fluent:dismiss-12-filled" 
                        class="-my-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20" 
                        @click="isOpen = false" 
                    />
                </div>
            </template>

            <!-- Modal Content -->
            <div class="py-4">
                <!-- Main Section - Group Name -->
                <div class="mb-8">
                    <UFormGroup 
                        label="Nombre del Grupo" 
                        required 
                        :error="!isGroupNameValid" 
                        :hint="groupNameError"
                        :ui="{
                            hint: 'text-red-500 dark:text-red-500 text-sm mt-1'
                        }"
                    >
                        <UInput 
                            v-model="groupName" 
                            size="md" 
                            placeholder="Ingrese el nombre del grupo" 
                            class="w-full max-w-lg" 
                            @blur="validateGroupName"
                            :ui="{
                                icon: {
                                    trailing: { pointer: '' }
                                },
                                ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                                color: {
                                    gray: {
                                        outline: 'shadow-sm bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                    }
                                }
                            }"
                            color="gray"
                        />
                    </UFormGroup>
                </div>
                
                <!-- Danger Zone -->
                <div class="mt-10 border border-red-500/30 rounded-lg p-4">
                    <h4 class="text-red-500 font-medium mb-2">Zona de Peligro</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Eliminar un grupo es una acción permanente y no puede ser revertida. Se eliminarán todos los datos asociados.
                    </p>
                    <UButton 
                        color="red" 
                        variant="soft" 
                        class="w-auto"
                        @click="isConfirmDeleteOpen = true"
                    >
                        Eliminar Grupo
                    </UButton>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex justify-end mt-4 gap-4">
                    <UButton 
                        variant="link" 
                        color="black" 
                        @click="isOpen = false"
                    >
                        Cancelar
                    </UButton>
                    <UButton 
                        class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"
                        @click="updateGroup"
                    >
                        Guardar Cambios
                    </UButton>
                </div>
            </div>
        </UCard>
    </UModal>
    
    <!-- Delete Confirmation Modal -->
    <UModal v-model="isConfirmDeleteOpen" prevent-close :ui="{
        wrapper: 'z-20',
        width: 'w-full sm:max-w-md',
        container: 'flex items-center justify-center',
        overlay: {background: 'dark:bg-Light-Gray/15'},
    }">
        <UCard :ui="{
            background: 'dark:bg-Medium-Dark',
            ring: '',
            divide: '',
            base: 'w-full',
        }">
            <div class="p-4">
                <div class="flex items-center mb-4">
                    <UIcon name="fluent:warning-24-filled" class="text-red-500 text-2xl mr-2" />
                    <h3 class="text-lg font-semibold dark:text-white">Confirmar Eliminación</h3>
                </div>
                
                <p class="mb-6 text-gray-700 dark:text-gray-300">
                    ¿Estás seguro que deseas eliminar este grupo? Esta acción es irreversible.
                </p>
                
                <div class="flex justify-end gap-3">
                    <UButton 
                        variant="link" 
                        color="gray"
                        @click="isConfirmDeleteOpen = false"
                        :disabled="isDeleting"
                    >
                        Cancelar
                    </UButton>
                    <UButton 
                        color="red" 
                        @click="deleteGroup"
                    >
                        Eliminar
                    </UButton>
                </div>
            </div>
        </UCard>
    </UModal>
  </div>
</template>