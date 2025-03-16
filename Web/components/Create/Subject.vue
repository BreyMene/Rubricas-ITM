<script setup lang="ts">
  const isOpen = ref(false)
  const empty = ref('');
  const emit = defineEmits(['addCourse']);

  const courseName = ref('');
  const addCourse = () => {
    if (courseName.value === "") return;

    const c: Curso = {
      nombre: courseName.value,
      grupos: []
    };
    emit('addCourse', c);
    courseName.value = '';
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

              <!-- Top Image Circle -->
              <div class=" mx-auto w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-Light-Gray dark:bg-Dark-Grey flex items-center justify-center">
                <UIcon name="fluent:image-32-regular" class="text-4xl text-gray-400 dark:text-Light-Gray"/>
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

