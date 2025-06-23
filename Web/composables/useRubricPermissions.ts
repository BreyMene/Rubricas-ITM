import { useRuntimeConfig } from '#app'
import type { Rubrica, Curso, Grupo } from '~/utils/types'

export const useRubricPermissions = () => {
  const config = useRuntimeConfig()
  
  // Cache for courses and rubrics
  const courseCache = ref<Curso[]>([])
  const rubricCache = ref<Map<string, Rubrica>>(new Map())
  const lastFetch = ref<number>(0)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const fetchGroups = async (courses: Curso[]) => {
    try {
      for (const course of courses) {
        if (course.grupos && course.grupos.length > 0) {
          const gruposApi = await $fetch<Grupo[]>(
            `${config.public.apiUrl}/courses/groups/${course._id}`
          );
          course.grupos = gruposApi;
        }
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }

  const fetchCourses = async (docenteID: string, forceRefresh = false) => {
    const now = Date.now()
    if (!forceRefresh && courseCache.value.length > 0 && (now - lastFetch.value) < CACHE_DURATION) {
      return courseCache.value
    }

    const courses = await $fetch<Curso[]>(`${config.public.apiUrl}/courses/${docenteID}`)
    
    // Fetch full group data for permission validation
    await fetchGroups(courses)
    
    courseCache.value = courses
    lastFetch.value = now
    return courses
  }

  const fetchRubric = async (rubricaId: string) => {
    if (rubricCache.value.has(rubricaId)) {
      return rubricCache.value.get(rubricaId)!
    }

    const rubrica = await $fetch<Rubrica>(`${config.public.apiUrl}/rubrics/${rubricaId}`)
    rubricCache.value.set(rubricaId, rubrica)
    return rubrica
  }

  const validateRubricAccess = async (rubricaId: string, docenteID: string) => {
    try {
      const data = await fetchRubric(rubricaId)
      const isCreator = data.docente === docenteID

      if (data.estado === 'borrador' && isCreator) {
        return { 
          hasAccess: true, 
          canModerate: true,
          rubrica: data
        }
      }

      // Fetch courses with full group data
      const courses = await fetchCourses(docenteID)
      
      const courseWithRubric = courses.find(c => 
        c.rubricasGuia?.some(r => r._id === rubricaId)
      )
      
      const groupWithRubric = courses
        .flatMap(c => c.grupos || [])
        .find(g => g.rubricas?.some((r: any) =>
          typeof r === 'string' ? r === rubricaId : r._id === rubricaId
      ));

      if (!courseWithRubric && !groupWithRubric && !isCreator) {
        throw {
          statusCode: 403,
          statusMessage: 'Acceso denegado',
          message: 'No tienes permiso para acceder a esta rúbrica.'
        }
      }

      let canModerate = false
      
      if (courseWithRubric) {
        // For course rubrics, check if user is a moderator in that course
        canModerate = courseWithRubric.docentes.some(d => d._id === docenteID && d.moderador === true)
      } else if (groupWithRubric) {
        // For group rubrics, check if user is the owner of the group
        canModerate = groupWithRubric.docente._id === docenteID
        
        // If user is not the group owner, deny access
        if (!canModerate) {
          throw {
            statusCode: 403,
            statusMessage: 'Acceso denegado',
            message: 'No tienes permiso para acceder a esta rúbrica.'
          }
        }
      } else if (isCreator) {
        canModerate = true
      }

      return {
        hasAccess: true,
        canModerate,
        rubrica: data
      }
    } catch (error: any) {
      throw {
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Error',
        message: error.message || 'Ha ocurrido un error al cargar la rúbrica.'
      }
    }
  }

  const validateGradingAccess = async (grupo: string, curso: string, docenteID: string) => {
    try {
      // Use cached courses if available (with full group data)
      const courses = await fetchCourses(docenteID)
      
      const courseWithGroup = courses.find(c => 
        c.grupos?.some(g => g._id === grupo)
      )

      if (!courseWithGroup) {
        throw {
          statusCode: 403,
          statusMessage: 'Acceso denegado',
          message: 'No tienes permiso para calificar en este grupo.'
        }
      }

      const group = courseWithGroup.grupos?.find(g => g._id === grupo)
      if (!group) {
        throw {
          statusCode: 403,
          statusMessage: 'Acceso denegado',
          message: 'No tienes permiso para calificar en este grupo.'
        }
      }

      const hasAccess = group.docente._id === docenteID || 
                       courseWithGroup.docentes.some(d => d._id === docenteID && d.moderador)
      
      if (!hasAccess) {
        throw {
          statusCode: 403,
          statusMessage: 'Acceso denegado',
          message: 'No tienes permiso para calificar en este grupo.'
        }
      }

      return { hasAccess: true }
    } catch (error: any) {
      throw {
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Error',
        message: error.message || 'Ha ocurrido un error al validar el acceso.'
      }
    }
  }

  // Method to clear cache if needed
  const clearCache = () => {
    courseCache.value = []
    rubricCache.value.clear()
    lastFetch.value = 0
  }

  return {
    validateRubricAccess,
    validateGradingAccess,
    clearCache
  }
}