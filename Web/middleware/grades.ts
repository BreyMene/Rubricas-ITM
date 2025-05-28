export default defineNuxtRouteMiddleware((to, from) => {
    // Get the course and group IDs from the route
    const courseId = to.params.id;
    const groupId = to.params.groupId;

    // If we're navigating to the grades pages
    if (to.path.includes('/Calificaciones')) {
        // Ensure we have both IDs
        if (!courseId || !groupId) {
            return navigateTo('/');
        }
    }
}); 