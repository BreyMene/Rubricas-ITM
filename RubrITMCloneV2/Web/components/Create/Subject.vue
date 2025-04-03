<script setup lang="ts">
  import type { iconOptions } from '~/utils/iconList';

  const isOpen = ref(false)
  const empty = ref('');
  const emit = defineEmits(['addCourse']);

  const courseName = ref('');

  // For display purposes only
  const displayIcon = ref('fluent:image-32-regular');
  // This will be the actual icon used when creating a course
  const selectedIcon = ref('fluent:book-16-regular');
  const hasSelectedCustomIcon = ref(false); // Track if user has selected a custom icon

  // Button ref for popover placement
  const iconButtonRef = ref(null);

  // Popover state
  const isPopoverOpen = ref(false);

  // TO CHECK IF THE POPOVER IS ON MOBILE
    const isMobile = ref(false)
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth < 768
    }

    // Watch for screen resizes
    onMounted(() => {
      checkScreenSize() // Check on initial load
      window.addEventListener('resize', checkScreenSize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', checkScreenSize)
    })

  const addCourse = () => {
    if (courseName.value === "") return;

    // Use the selected icon or the default if user didn't select one
    const iconToUse = hasSelectedCustomIcon.value ? selectedIcon.value : 'fluent:book-16-regular';

    // Luego corregir el id, si se pone vacio da error
    const c: Curso = {
      id: "a", 
      icon: iconToUse,
      nombre: courseName.value,
      docentes: [], 
      grupos: []
    };
    emit('addCourse', c);
    courseName.value = '';
    isOpen.value = false;
  };

  const selectIcon = (icon: string) => {
    displayIcon.value = icon;
    selectedIcon.value = icon;
    hasSelectedCustomIcon.value = true;
    isPopoverOpen.value = false;
  };

  // Add a watch to reset the icon when the modal is closed
  watch(isOpen, (newValue) => {
    if (!newValue) {
      // Add a delay before resetting the icon
      setTimeout(() => {
        displayIcon.value = 'fluent:image-32-regular'; // Reset display to placeholder
        hasSelectedCustomIcon.value = false; // Reset custom icon flag
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
              Crear Curso
            </h3>
            <UButton color="gray" variant="ghost" icon="fluent:dismiss-12-filled" class="-my-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20" @click="isOpen = false" />
          </div>
        </template>

        <!-- Modal Content -->
        <div>
          <!-- Form Content -->
          <div class="flex flex-col md:flex-row gap-9">
            <div class="md:w-2/5 space-y-7">

              <!-- Icon Selection Button with UPopover -->
              <div class="flex justify-center">
                <UPopover v-model="isPopoverOpen" overlay :popper="{ placement: isMobile ? 'bottom' : 'auto-end' }" >
                  <UButton
                    ref="iconButtonRef"
                    class="mx-auto w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-Light-Gray dark:border-Light-Gray/30 hover:bg-Medium-Blue/20 dark:hover:bg-Light-Gray/25 flex items-center justify-center hover:border-Purple-P dark:hover:border-Muted-Brown"
                    variant="ghost"
                  >
                    <UIcon 
                      :name="displayIcon" 
                      class="text-5xl" 
                      :class="[hasSelectedCustomIcon ? 'text-Purple-P dark:text-Muted-Brown' : 'text-gray-400 dark:text-Light-Gray']"
                    />
                    <span class="sr-only">Select course icon</span>
                  </UButton>
                  
                  <template #panel="{ close }">
                    <div class="p-4 bg-white dark:bg-Medium-Dark rounded-lg shadow-lg">
                      <div class="flex justify-between mb-4">
                        <h3 class="text-base font-semibold dark:text-white">Seleccionar icono</h3>
                        <UButton color="gray" variant="ghost" icon="fluent:dismiss-12-filled" class="-m-1 p-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20" @click="close" />
                      </div>
                      
                      <div class="max-h-[300px] overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-4">
                        <UButton
                          v-for="icon in iconOptions"
                          :key="icon"
                          variant="ghost"
                          class="p-4 h-14 w-14 rounded-lg flex items-center justify-center hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
                          @click="selectIcon(icon)"
                        >
                          <UIcon :name="icon" class="text-2xl text-gray-700 dark:text-Light-Gray" />
                        </UButton>
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>

              <!-- Left Side - Two Inputs -->
              <UFormGroup label="Nombre del curso" required>
                <UInput v-model="courseName" size="sm" placeholder="Ingrese el nombre" class="w-full"
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
              <UFormGroup label="Agregar Docente">
                <UInput size="sm" placeholder="ejemplo@correo.itm.edu.co" class="w-full"
                v-model="empty"
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
                  >
                  <template #trailing>
                    <UButton
                      v-show="empty !== ''"
                      color="gray"
                      variant="link"
                      icon="fluent:add-16-filled"
                      :padded="false"
                      @click="empty = ''"
                    />
                </template>
                </UInput>
              </UFormGroup>
            </div>

            <!-- Right Side - Table -->
            <div class="md:w-2/3 flex flex-col h-full">
              <UtilitiesPeopleTable view="docentes"/>
            </div>
          </div>

          <div class="flex justify-end mt-2 gap-4">
            <UButton variant="link" color="black" @click="isOpen = false">
              Cancelar
            </UButton>
            <UButton class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray" @click="addCourse">
              Crear
            </UButton>
          </div>

        </div>

      </UCard>
    </UModal>
  </div>
</template>