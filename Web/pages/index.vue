<script setup lang="ts">

    // Sample courses data (you can replace this with your actual data)
    const courses = ref<Curso[]>([]);

    // Function to handle course navigation
    const navigateToCourse = (courseId: number) => {
      // Navigate to the dynamic Curso/[id] page
      navigateTo(`/Curso/${courseId}`);
    };

    function addCourse(c: Curso) {
      courses.value.push(c)
    }
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
                <CreateSubject @addCourse="addCourse" class="sm:relative sm:ml-auto fixed bottom-6 right-6 z-1 sm:z-auto sm:bottom-0 sm:right-0"/>
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
                <h3 class="text-lg font-medium text-center text-Pure-Black dark:text-White-w">{{ course.nombre }}</h3>
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>