import { useDocenteStore } from '~/utils/store'

export default defineNuxtRouteMiddleware((to) => {
  // Skip auth check for login page
  if (to.path === '/login') return

  const docenteStore = useDocenteStore()
  const isAuthenticated = docenteStore.docente !== null

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return navigateTo('/login')
  }
})