<script setup lang="ts">
import { useCursoStore } from "~/utils/store";
import { useI18n } from 'vue-i18n'
import { iconOptions } from '~/utils/iconList'

const curso = computed(() => useCursoStore().cursoActivo);
const toast = useToast()
const config = useRuntimeConfig();
const { t } = useI18n()

const route = useRoute();
const courseId = computed(() => route.params.id);

const isOpen = ref(false);
const isConfirmDeleteOpen = ref(false);
const loadScreen = ref(false)
const emit = defineEmits(["loadScreen"]);

// Form state
const courseName = ref('');
const courseNameError = ref('');
const isCourseNameValid = ref(true);

// Delete state
const isDeleting = ref(false);   

// Icon selection state
const displayIcon = ref("");
const selectedIcon = ref("");
const hasSelectedCustomIcon = ref(false);

// Popover state
const isPopoverOpen = ref(false);
const iconButtonRef = ref(null);

// TO CHECK IF THE POPOVER IS ON MOBILE
const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

// Watch for screen resizes
onMounted(() => {
  checkScreenSize(); // Check on initial load
  window.addEventListener("resize", checkScreenSize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

const validateCourseName = () => {
  // Reset error
  courseNameError.value = '';
  isCourseNameValid.value = true;

  // Check if course name is empty
  if (courseName.value.trim() === '') {
    courseNameError.value = t('courseSettings.course_name_required');
    isCourseNameValid.value = false;
    return false;
  }

  return true;
};

const selectIcon = (icon: string) => {
  displayIcon.value = icon;
  selectedIcon.value = icon;
  hasSelectedCustomIcon.value = true;
  isPopoverOpen.value = false;
};

const updateCourse = async () => {
  if (!validateCourseName()) {
    return;
  }

  const originalName = curso.value?.nombre;
  const originalIcon = curso.value?.icono;
  if (courseName.value === originalName && displayIcon.value === originalIcon) {
    toast.add({
      title: t('courseSettings.toast_no_changes_title'),
      description: t('courseSettings.toast_no_changes_desc'),
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
    emit("loadScreen", t('courseSettings.toast_update_success_title'), loadScreen.value)

    const response = await $fetch<Curso>(`${config.public.apiUrl}/courses/${courseId.value}`, {
      method: 'PUT',
      body: {
        nombre: courseName.value,
        icono: displayIcon.value,
      },
    });
    useCursoStore().setCurso(response)
  
    toast.add({
      title: t('courseSettings.toast_update_success_title'),
      description: t('courseSettings.toast_update_success_desc', { course: curso.value?.nombre }),
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
  } catch (error) {
    courseNameError.value = t('courseSettings.toast_update_error');
  } finally{
    loadScreen.value = false
    emit("loadScreen", "", loadScreen.value)

  }
};

const deleteCourse = async () => {
  isDeleting.value = true;
  
  try {
    loadScreen.value = true
    emit("loadScreen", t('courseSettings.toast_delete_success_title'), loadScreen.value)

    await $fetch<Curso>(`${config.public.apiUrl}/courses/${courseId.value}`, {
      method: 'DELETE',
    });

    toast.add({
      title: t('courseSettings.toast_delete_success_title'),
      description: t('courseSettings.toast_delete_success_desc', { course: curso.value?.nombre }),
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
    navigateTo('/');
  } catch (error) {
    toast.add({
      title: t('courseSettings.toast_delete_fail_title'),
      description: t('courseSettings.toast_delete_fail_desc', { course: curso.value?.nombre }),
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
  if (newValue && curso.value) {
    courseName.value = curso.value.nombre;
    displayIcon.value = curso.value.icono;
    selectedIcon.value = curso.value.icono;
    hasSelectedCustomIcon.value = false;
  } else {
    // Reset form when modal closes
    setTimeout(() => {
      courseName.value = '';
      courseNameError.value = '';
      isCourseNameValid.value = true;
      hasSelectedCustomIcon.value = false;
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
                        {{ t('courseSettings.modal_title') }}
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
                <!-- Main Section - Icons and Course Name -->
                <div class="mb-8 grid grid-cols-1 md:grid-cols-5 gap-6">
                    <!-- Icon Section - Takes up 2/5 of the space -->
                    <div class="md:col-span-2 flex flex-col items-center justify-center">
                        <h4 class="mb-3 font-medium dark:text-White-w text-center">{{ t('courseSettings.icon_section_title') }}</h4>
                        <!-- Icon Selection Button with UPopover -->
                        <UPopover
                            v-model="isPopoverOpen"
                            overlay
                            :popper="{ placement: isMobile ? 'bottom' : 'auto-end' }"
                            :ui="{
                                ring: 'ring-0',
                                overlay: { background: 'dark:bg-Light-Gray/15' },
                            }"
                        >
                            <UButton
                                ref="iconButtonRef"
                                class="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-Light-Gray dark:border-Light-Gray/30 hover:bg-Medium-Blue/20 dark:hover:bg-Light-Gray/25 flex items-center justify-center hover:border-Purple-P dark:hover:border-Muted-Brown mx-auto"
                                variant="ghost"
                            >
                                <UIcon
                                    :name="displayIcon || 'fluent:image-32-regular'"
                                    class="text-4xl"
                                    :class="[
                                        displayIcon
                                            ? 'text-Purple-P dark:text-Muted-Brown'
                                            : 'text-gray-400 dark:text-Light-Gray',
                                    ]"
                                />
                                <span class="sr-only">{{ t('courseSettings.icon_select_sr') }}</span>
                            </UButton>

                            <template #panel="{ close }">
                                <div
                                    class="p-4 bg-white dark:bg-Medium-Dark rounded-lg shadow-lg"
                                >
                                    <div class="flex justify-between mb-4">
                                        <h3 class="text-base font-semibold dark:text-white">
                                            {{ t('courseSettings.icon_select_title') }}
                                        </h3>
                                        <UButton
                                            color="gray"
                                            variant="ghost"
                                            icon="fluent:dismiss-12-filled"
                                            class="-m-1 p-1 hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
                                            @click="close"
                                        />
                                    </div>

                                    <div
                                        class="max-h-[300px] overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-4"
                                    >
                                        <UButton
                                            v-for="icon in iconOptions"
                                            :key="icon"
                                            variant="ghost"
                                            class="p-4 h-14 w-14 rounded-lg flex items-center justify-center hover:bg-Medium-Blue/20 dark:hover:bg-Medium-Gray/20"
                                            @click="selectIcon(icon)"
                                        >
                                            <UIcon
                                                :name="icon"
                                                class="text-2xl text-gray-700 dark:text-Light-Gray"
                                            />
                                        </UButton>
                                    </div>
                                </div>
                            </template>
                        </UPopover>
                        
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                            {{ t('courseSettings.icon_section_hint') }}
                        </p>
                    </div>
                    
                    <!-- Course Name Section - Takes up 3/5 of the space -->
                    <div class="md:col-span-3 flex flex-col justify-center">
                        <UFormGroup 
                            :label="t('courseSettings.course_name_label')" 
                            required 
                            :error="!isCourseNameValid" 
                            :hint="courseNameError"
                            :ui="{
                                hint: 'text-red-500 dark:text-red-500 text-sm mt-1'
                            }"
                        >
                            <UInput 
                                v-model="courseName" 
                                size="md" 
                                :placeholder="t('courseSettings.course_name_placeholder')" 
                                class="w-full max-w-lg" 
                                @blur="validateCourseName"
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
                </div>
                
                <!-- Danger Zone -->
                <div class="mt-10 border border-red-500/30 rounded-lg p-4">
                    <h4 class="text-red-500 font-medium mb-2">{{ t('courseSettings.danger_zone_title') }}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {{ t('courseSettings.danger_zone_warning') }}
                    </p>
                    <UButton 
                        color="red" 
                        variant="soft" 
                        class="w-auto"
                        @click="isConfirmDeleteOpen = true"
                    >
                        {{ t('courseSettings.delete_course') }}
                    </UButton>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex justify-end mt-4 gap-4">
                    <UButton 
                        variant="link" 
                        color="black" 
                        @click="isOpen = false"
                    >
                        {{ t('courseSettings.cancel') }}
                    </UButton>
                    <UButton 
                        class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"
                        @click="updateCourse"
                    >
                        {{ t('courseSettings.save_changes') }}
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
                    <h3 class="text-lg font-semibold dark:text-white">{{ t('courseSettings.delete_confirm_title') }}</h3>
                </div>
                
                <p class="mb-6 text-gray-700 dark:text-gray-300">
                    {{ t('courseSettings.delete_confirm_message') }}
                </p>
                
                <div class="flex justify-end gap-3">
                    <UButton 
                        variant="link" 
                        color="gray"
                        @click="isConfirmDeleteOpen = false"
                        :disabled="isDeleting"
                    >
                        {{ t('courseSettings.cancel') }}
                    </UButton>
                    <UButton 
                        color="red" 
                        @click="deleteCourse"
                    >
                        {{ t('courseSettings.delete') }}
                    </UButton>
                </div>
            </div>
        </UCard>
    </UModal>
  </div>
</template>