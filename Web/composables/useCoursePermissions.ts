import { useRuntimeConfig } from '#app'
import type { Curso, Grupo } from '~/utils/types'

export const useCoursePermissions = () => {
  const config = useRuntimeConfig()
  
  // Cache for courses
  const courseCache = new Map<string, { data: Curso[], timestamp: number }>()
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const fetchCourses = async (docenteID: string) => {
    const now = Date.now()
    const cached = courseCache.get(docenteID)
    
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    const courses = await $fetch<Curso[]>(`${config.public.apiUrl}/courses/${docenteID}`)
    courseCache.set(docenteID, { data: courses, timestamp: now })
    return courses
  }

  const validateCourseAccess = async (courseId: string | string[], docenteID: string) => {
    try {
      // Convert to string if array
      const courseIdStr = Array.isArray(courseId) ? courseId[0] : courseId
      
      const courses = await fetchCourses(docenteID)
      const course = courses.find(c => c._id === courseIdStr)

      if (!course) {
        throw {
          statusCode: 403,
          statusMessage: 'Acceso denegado',
          message: 'No tienes permiso para acceder a este curso.'
        }
      }
      
      // Check if the user is a moderator of this specific course
      const isModerator = course.docentes.some(d => d._id === docenteID && d.moderador)

      return {
        hasAccess: true,
        isModerator,
        course
      }
    } catch (error: any) {
      throw {
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Error',
        message: error.message || 'Ha ocurrido un error al validar el acceso al curso.'
      }
    }
  }

  const validateGroupAccess = async (courseId: string | string[], groupId: string | string[], docenteID: string) => {
    try {
      // Ensure IDs are strings
      const courseIdStr = Array.isArray(courseId) ? courseId[0] : courseId
      const groupIdStr = Array.isArray(groupId) ? groupId[0] : groupId
      
      // First validate course access
      const { course, isModerator } = await validateCourseAccess(courseIdStr, docenteID)

      // Then get the group data
      const group = await $fetch<Grupo>(`${config.public.apiUrl}/groups/${groupIdStr}`)
      
      // Check if the user is the group teacher
      const isGroupTeacher = group.docente._id === docenteID

      return {
        hasAccess: true,
        isModerator,
        isGroupTeacher,
        group,
        course
      }
    } catch (error: any) {
      if (error.statusCode === 404) {
        throw {
          statusCode: 404,
          statusMessage: 'Not Found',
          message: 'El grupo no existe.'
        }
      }
      throw {
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Error',
        message: error.message || 'Ha ocurrido un error al validar el acceso al grupo.'
      }
    }
  }

  const clearCache = () => {
    courseCache.clear()
  }

  return {
    validateCourseAccess,
    validateGroupAccess,
    clearCache
  }
} 