<script setup lang="ts">
    import { useI18n } from 'vue-i18n'

    const grupo = computed(() => useCursoStore().grupoActivo);
    const toast = useToast()
    const config = useRuntimeConfig();
    const { t } = useI18n()

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
            groupNameError.value = t('groupSettings.group_name_required');
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
                title: t('groupSettings.toast_no_changes_title'),
                description: t('groupSettings.toast_no_changes_desc'),
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
            emit("loadScreen", t('groupSettings.toast_update_success_title'), loadScreen.value)

            const response = await $fetch<Grupo>(`${config.public.apiUrl}/groups/${grupoId.value}/update`, {
                method: 'PUT',
                body: {
                    nombre: groupName.value,
                },
            });
            useCursoStore().setGrupo(response)
            
            toast.add({
                title: t('groupSettings.toast_update_success_title'),
                description: t('groupSettings.toast_update_success_desc', { group: grupo.value?.nombre }),
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
            groupNameError.value = t('groupSettings.toast_update_error');
            if(error.statusCode == 409) groupNameError.value = t('groupSettings.toast_update_conflict');
        } finally{
            loadScreen.value = false
            emit("loadScreen", "", loadScreen.value)
        }
    };
  
const deleteGroup = async () => {
  isDeleting.value = true;
  
  try {
    loadScreen.value = true
    emit("loadScreen", t('groupSettings.toast_delete_success_title'), loadScreen.value)

      await $fetch<Grupo>(`${config.public.apiUrl}/groups/${grupoId.value}/delete`, {
        method: 'DELETE',
      });

    toast.add({
          title: t('groupSettings.toast_delete_success_title'),
          description: t('groupSettings.toast_delete_success_desc', { group: grupo.value?.nombre }),
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
          title: t('groupSettings.toast_delete_fail_title'),
          description: t('groupSettings.toast_delete_fail_desc', { group: grupo.value?.nombre }),
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
                        {{ t('groupSettings.modal_title') }}
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
                        :label="t('groupSettings.group_name_label')" 
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
                            :placeholder="t('groupSettings.group_name_placeholder')" 
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
                    <h4 class="text-red-500 font-medium mb-2">{{ t('groupSettings.danger_zone_title') }}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {{ t('groupSettings.danger_zone_warning') }}
                    </p>
                    <UButton 
                        color="red" 
                        variant="soft" 
                        class="w-auto"
                        @click="isConfirmDeleteOpen = true"
                    >
                        {{ t('groupSettings.delete_group') }}
                    </UButton>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex justify-end mt-4 gap-4">
                    <UButton 
                        variant="link" 
                        color="black" 
                        @click="isOpen = false"
                    >
                        {{ t('groupSettings.cancel') }}
                    </UButton>
                    <UButton 
                        class="dark:text-White-w bg-Dark-Blue dark:bg-Dark-Grey hover:bg-Medium-Blue hover:dark:bg-Medium-Gray"
                        @click="updateGroup"
                    >
                        {{ t('groupSettings.save_changes') }}
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
                    <h3 class="text-lg font-semibold dark:text-white">{{ t('groupSettings.delete_confirm_title') }}</h3>
                </div>
                
                <p class="mb-6 text-gray-700 dark:text-gray-300">
                    {{ t('groupSettings.delete_confirm_message') }}
                </p>
                
                <div class="flex justify-end gap-3">
                    <UButton 
                        variant="link" 
                        color="gray"
                        @click="isConfirmDeleteOpen = false"
                        :disabled="isDeleting"
                    >
                        {{ t('groupSettings.cancel') }}
                    </UButton>
                    <UButton 
                        color="red" 
                        @click="deleteGroup"
                    >
                        {{ t('groupSettings.delete') }}
                    </UButton>
                </div>
            </div>
        </UCard>
    </UModal>
  </div>
</template>