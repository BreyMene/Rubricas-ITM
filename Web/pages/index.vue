<script setup lang="ts">
    
    /*const notifications = [
        "Acabas de entrar al curso 'nombre'",
        "Acabas de modificar la rubrica del curso 'nombre'",
        "Tu rubrica 'nombre' a sido actualizada"
    ];*/

    // Sample courses data (you can replace this with your actual data)
    const courses = [
      { id: 1, name: 'Nombre del Curso 1' },
      { id: 2, name: 'Nombre del Curso 2' },
      { id: 3, name: 'Nombre del Curso 3' },
      { id: 4, name: 'Nombre del Curso 4' },
      { id: 5, name: 'Nombre del Curso 5' },
      { id: 6, name: 'Nombre del Curso 6' },
    ];
    
    // Function to handle course navigation
    const navigateToCourse = (courseId: number) => {
      // Navigate to the dynamic Curso/[id] page
      navigateTo(`/Curso/${courseId}`);
    };
</script>

<template>
    <div class="container mx-auto p-6">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Main Content Area -->
        <div class="flex-1">
          <div class="mb-6">
            <!-- Cursos Section -->            
            <div class="mb-6 flex sm:flex-row gap-4 justify-between sm:items-center relative">
                <h2 class="text-2xl font-semibold mb-4">Cursos</h2>
                <CreateSubject class="sm:relative sm:ml-auto fixed bottom-6 right-6 z-1 sm:z-auto sm:bottom-0 sm:right-0"/>
            </div>
  
            <!-- Course Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Course Cards -->
              <UButton 
                v-for="course in courses" 
                :key="course.id"
                @click="navigateToCourse(course.id)"
                variant="ghost"
                class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-6 shadow-lg aspect-square flex flex-col justify-center items-center gap-3 hover:bg-MLight-White dark:hover:bg-Dark-Grey transition-colors duration-200"
              >
                <UIcon name="fluent:book-32-filled" class="text-6xl text-Purple-P dark:text-Muted-Brown" />
                <h3 class="text-lg font-medium text-center text-Pure-Black dark:text-White-w">{{ course.name }}</h3>
              </UButton>
            </div>
          </div>
        </div>
  
        <!-- Notifications Sidebar 
        <div class="w-full md:w-80 shrink-0 mt-16 mx-auto md:mx-0">
          <div class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-4 shadow-lg">
            <h2 class="text-xl font-semibold mb-4">Notificaciones</h2>
            <div class="space-y-3">
              <div v-for="(notification, index) in notifications" :key="index" 
                   class="text-sm text-gray-600 dark:text-gray-300 p-2 border-b border-Light-Gray dark:border-Dark-Grey last:border-0">
                {{ notification }}
              </div>
            </div>
          </div>
        </div> -->
      </div>
    </div>
  </template>