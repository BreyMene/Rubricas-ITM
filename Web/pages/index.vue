<script setup lang="ts">
const config = useRuntimeConfig();
import { useDocenteStore } from "~/utils/store";
import { useCursoStore } from "~/utils/store";

const loading = ref(true);

// Sample courses data (you can replace this with your actual data)
const courses = ref<Curso[]>([]);

const docenteID = useDocenteStore().getID;
const fetchCourses = async () => {
  loading.value = true;
  try {
    const data = await $fetch<Curso[]>(
      `${config.public.apiUrl}/courses/${docenteID}`,
    );
    courses.value = data;
  } catch (error) {
    console.error("Error fetching courses:", error);
  }finally {
    loading.value = false;
  }
};

onMounted(() => {
  useCursoStore().clearCurso();
  useCursoStore().clearGrupo();
  fetchCourses();
});

// Function to handle course navigation
const navigateToCourse = (course: Curso) => {
  // Using pinia to pass the course data via cookies, to persist the data
  useCursoStore().setCurso(course)
  navigateTo(`/Curso/${course._id}`)
}

function addCourse(c: Curso) {
  courses.value.push(c);
}
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex flex-col md:flex-row gap-6">
      <!-- Main Content Area -->
      <div class="flex-1">
        <div class="mb-6">
          <!-- Cursos Section -->
          <div
            class="mb-6 flex sm:flex-row gap-4 justify-between sm:items-center relative transition-colors duration-150"
          >
            <h2 class="text-2xl font-semibold mb-4 text-Pure-Black dark:text-White-w transition-colors duration-150">Cursos</h2>
            <CreateSubject
              @addCourse="addCourse"
              class="sm:relative sm:ml-auto fixed bottom-6 right-6 z-1 sm:z-auto sm:bottom-0 sm:right-0"
            />
          </div>

          <ClientOnly>
            <div
              v-if="!loading"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-150 ease-out"
            >
              <!-- No Courses Warning -->
              <Transition name="fade-minimal" appear>
                <div
                  v-if="!courses.length"
                  class="col-span-full flex items-center justify-center mt-24 md:mt-0 md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 transition-colors duration-150"
                >
                  <div
                    class="relative w-80 h-52 flex flex-col items-center justify-center transition-colors duration-150"
                  >
                    <!-- Corner decorations -->
                    <div
                      class="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tl-lg transition-colors duration-150"
                    ></div>
                    <div
                      class="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tr-lg transition-colors duration-150"
                    ></div>
                    <div
                      class="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-bl-lg transition-colors duration-150"
                    ></div>
                    <div
                      class="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-br-lg transition-colors duration-150"
                    ></div>

                    <UIcon
                      name="fluent:warning-24-regular"
                      class="text-6xl text-Purple-P dark:text-Muted-Brown mb-4"
                    />
                    <p
                      class="text-xl font-medium text-center text-Pure-Black dark:text-White-w transition-colors duration-150"
                    >
                      NO TIENES<br />NINGUN CURSO
                    </p>
                  </div>
                </div>
              </Transition>

              <!-- Course Cards -->
              <Transition
                v-for="course in courses"
                :key="course._id"
                name="course-item"
                appear
                mode="out-in"
              >
                <UButton
                  @click="navigateToCourse(course)"
                  variant="ghost"
                  class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-6 shadow-lg aspect-square flex flex-col justify-center items-center gap-3 hover:bg-MLight-White dark:hover:bg-Dark-Grey transition-[transform,box-shadow,colors] duration-200 hover:-translate-y-1 outline-none"
                >
                  <UIcon
                    :name="course.icono"
                    class="text-6xl text-Purple-P dark:text-Muted-Brown"
                  />
                  <h3
                    class="text-lg font-medium text-center text-Pure-Black dark:text-White-w transition-colors duration-[0.1s]"
                  >
                    {{ course.nombre }}
                  </h3>
                </UButton>
              </Transition>
            </div>

            <!-- Skeleton Loader -->
            <template #fallback>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <USkeleton
                  v-for="i in 4" 
                  :key="i" 
                  class="w-full h-[148px] aspect-square"
                  :ui="{
                    base: 'animate-pulse',
                    rounded: 'rounded-xl',
                    background: 'bg-gray-200 dark:bg-gray-700',
                  }"
                />
              </div>
            </template>
          </ClientOnly>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Course item transitions */
.course-item-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.course-item-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.course-item-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.course-item-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

/* Minimal fade transition for the no courses warning */
.fade-minimal-enter-active {
  transition: opacity 0.4s ease;
}

.fade-minimal-leave-active {
  transition: opacity 0.2s ease;
}

.fade-minimal-enter-from,
.fade-minimal-leave-to {
  opacity: 0;
}

/* Grid container smooth transitions */
.grid {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>

