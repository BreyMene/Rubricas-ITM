<script setup lang="ts">
const config = useRuntimeConfig();
import { useDocenteStore } from "~/utils/store";
import { useCursoStore } from "~/utils/store";


// Sample courses data (you can replace this with your actual data)
const courses = ref<Curso[]>([]);

const docenteID = useDocenteStore().getID;
const fetchCourses = async () => {
  try {
    const data = await $fetch<Curso[]>(
      `${config.public.apiUrl}/courses/${docenteID}`,
    );
    courses.value = data;
  } catch (error) {
    console.error("Error fetching courses:", error);
  }
};

onMounted(() => {
  useCursoStore().clearCurso();
  fetchCourses();
});

// Function to handle course navigation
const navigateToCourse = (course: Curso) => {
  // Using pinia to pass the course data via cookies, to persist the data
  useCursoStore().setCurso(course)
  console.log("Curso",course)
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
            class="mb-6 flex sm:flex-row gap-4 justify-between sm:items-center relative"
          >
            <h2 class="text-2xl font-semibold mb-4">Cursos</h2>
            <CreateSubject
              @addCourse="addCourse"
              class="sm:relative sm:ml-auto fixed bottom-6 right-6 z-1 sm:z-auto sm:bottom-0 sm:right-0"
            />
          </div>

          <!-- No Courses Warning -->
          <div
            v-if="!courses.length"
            class="flex items-center justify-center mt-24 md:mt-0 md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
          >
            <div
              class="relative w-80 h-52 flex flex-col items-center justify-center"
            >
              <!-- Corner decorations -->
              <div
                class="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tl-lg"
              ></div>
              <div
                class="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-Purple-P dark:border-Muted-Brown rounded-tr-lg"
              ></div>
              <div
                class="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-bl-lg"
              ></div>
              <div
                class="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-Purple-P dark:border-Muted-Brown rounded-br-lg"
              ></div>

              <UIcon
                name="fluent:warning-24-regular"
                class="text-6xl text-Purple-P dark:text-Muted-Brown mb-4"
              />
              <p
                class="text-xl font-medium text-center text-Pure-Black dark:text-White-w"
              >
                NO TIENES<br />NINGUN CURSO
              </p>
            </div>
          </div>

          <!-- Course Grid -->
          <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <!-- Course Cards -->
            <UButton
              v-for="course in courses"
              :key="course._id"
              @click="navigateToCourse(course)"
              variant="ghost"
              class="bg-Warm-White dark:bg-Warm-Dark rounded-xl p-6 shadow-lg aspect-square flex flex-col justify-center items-center gap-3 hover:bg-MLight-White dark:hover:bg-Dark-Grey transition-colors duration-200"
            >
              <UIcon
                :name="course.icono"
                class="text-6xl text-Purple-P dark:text-Muted-Brown"
              />
              <h3
                class="text-lg font-medium text-center text-Pure-Black dark:text-White-w"
              >
                {{ course.nombre }}
              </h3>
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

