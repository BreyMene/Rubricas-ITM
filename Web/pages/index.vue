<script setup lang="ts">
    const notifications = [
        "Acabas de entrar al curso 'nombre'",
        "Acabas de modificar la rubrica del curso 'nombre'",
        "Tu rubrica 'nombre' a sido actualizada"
    ];

    // Ref for the search input
    const searchQuery = ref('');
</script>

<template>
    <div class="container mx-auto p-6">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Main Content Area -->
        <div class="flex-1">
          <!-- Cursos Section -->
          <div class="mb-6">
            <h2 class="text-2xl font-semibold mb-4">Cursos</h2>
            
            <!-- Search Bar -->
            <div class="mb-6">
              <UInput
                v-model="searchQuery"
                icon="fluent:search-12-filled"
                placeholder="Buscar curso..."
                size="lg"
                class="max-w-md"
                :ui="{
                    icon: {
                        trailing: { pointer: '' }
                    },
                    base: 'relative block w-full',
                    ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                    rounded: 'rounded-lg',
                    color: {
                        gray: {
                            outline: 'shadow-xl bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                        }
                    }
                }"
                color="gray"
              >
                    <template #trailing>
                        <UButton
                        v-show="searchQuery !== ''"
                        color="gray"
                        variant="link"
                        icon="fluent:dismiss-12-filled"
                        :padded="false"
                        @click="searchQuery = ''"
                        />
                    </template>
                </UInput>
            </div>
  
            <!-- Course Grid -->
            <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Course Cards -->
              <div v-for="i in 6" :key="i" 
                class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-6 shadow-xl aspect-square flex flex-col justify-center items-center">
                <h3 class="text-lg font-medium text-center">Nombre del Curso {{ i }}</h3>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Notifications Sidebar -->
        <div class="w-80 shrink-0 mt-16">
          <div class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4 shadow-xm">
            <h2 class="text-xl font-semibold mb-4">Notificaciones</h2>
            <div class="space-y-3">
              <div v-for="(notification, index) in notifications" :key="index" 
                   class="text-sm text-gray-600 dark:text-gray-300 p-2 border-b border-Light-Gray dark:border-Dark-Grey last:border-0">
                {{ notification }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>