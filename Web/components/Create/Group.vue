<script setup lang="ts">
  const isOpen = ref(false);
  const emit = defineEmits(['addGroup']);

  const groupName = ref('');
  const addGroup = () => {
    if (groupName.value === "") return;

    // Luego corregir el id, si se pone vacio da error
    const g: Grupo = {
      _id: "a",
      nombre: groupName.value,
      manager: "",
      estudiantes: []
    };
    emit('addGroup', g);
    groupName.value = '';
    isOpen.value = false;
  };
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
              <UFormGroup label="Nombre del Grupo" required>
                <UInput v-model="groupName" size="sm" placeholder="Ingrese el nombre" class="w-full"
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
                  class="absolute right-[-8px] sm:right-[-15px] top-1/2 transform -translate-y-1/2 rounded-full bg-Dark-Blue dark:bg-Muted-Brown hover:bg-Medium-Blue hover:dark:bg-Medium-Gray shadow-lg text-White-w dark:text-White-w"
                />

                <!-- Inputs -->
                <div class="space-y-8">
                  <UFormGroup label="Nombre Estudiante">
                    <UInput
                      size="sm"
                      placeholder="Ingrese el nombre"
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
                    />
                  </UFormGroup>

                  <UFormGroup label="Correo Estudiante">
                    <UInput
                      size="sm"
                      placeholder="ejemplo@correo.itm.edu.co"
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
                    />
                  </UFormGroup>
                </div>
              </div>

            </div>

            <!-- Right Side - Table -->
            <div class="md:w-2/3 flex flex-col h-full">
              <UtilitiesPeopleTable view="docentes" :hideFinalNote="true" :data="[]"/>
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

