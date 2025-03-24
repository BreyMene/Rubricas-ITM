<script setup lang="ts">
    const props = defineProps({
        isMobile: {
            type: Boolean,
            default: false
        }
    });

    const emit = defineEmits(['toggleForm']);

    const state = reactive({
        email: '',
        password: '',
        secPasword: ''
    });

    const handleSignIn = async () => {
        try {
            console.log('Sign-in data:', state);
            // Add your sign in logic here
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const toggleForm = () => {
        emit('toggleForm');
    }

    const show = ref(false)
    const show2 = ref(false)

</script>

<template>
    <div :class="[
        isMobile ? 'px-6 py-6 min-h-[450px]' : 'form-container w-3/5 px-14 py-6 absolute top-0 right-0'
    ]">
        <h2 :class="[
            'font-semibold text-Pure-Black dark:text-White-w mb-6',
            isMobile ? 'text-xl text-center' : 'text-2xl text-end'
        ]">
            REGISTRATE
        </h2>
        <div class="mb-6">
            <UForm :state="state" class="flex flex-col gap-3" @submit="handleSignIn">
                <UFormGroup label="Email" name="email">
                    <UInput size="sm" v-model="state.email" placeholder="ejemplo@correo.itm.edu.co" class="w-full"
                        :ui="{
                            icon: {
                                trailing: { pointer: '' }
                            },
                            ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                            color: {
                                gray: {
                                    outline: 'shadow-lg bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                }
                            }
                        }"
                        color="gray"
                    />
                </UFormGroup>

                <UFormGroup label="Contraseña" name="password">
                    <UInput size="sm" v-model="state.password" :type="show ? 'text' : 'password'" class="w-full"
                        :ui="{
                            icon: {
                                trailing: { pointer: '' }
                            },
                            ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                            color: {
                                gray: {
                                    outline: 'shadow-lg bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                }
                            }
                        }"
                        color="gray"
                    >   
                        <template #trailing>
                            <UButton
                                color="gray"
                                variant="link"
                                size="sm"
                                :icon="show ? 'fluent:eye-off-16-filled' : 'fluent:eye-16-filled'"
                                :aria-label="show ? 'Hide password' : 'Show password'"
                                :aria-pressed="show"
                                aria-controls="password"
                                @click="show = !show"
                            />
                        </template>
                    </UInput>
                </UFormGroup>

                <UFormGroup label="Verifica Contraseña" name="secPasword">
                    <UInput size="sm" v-model="state.secPasword" :type="show2 ? 'text' : 'password'" class="w-full"
                        :ui="{
                            icon: {
                                trailing: { pointer: '' }
                            },
                            ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
                            color: {
                                gray: {
                                    outline: 'shadow-lg bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown'
                                }
                            }
                        }"
                        color="gray"
                    >
                        <template #trailing>
                            <UButton
                                color="gray"
                                variant="link"
                                size="sm"
                                :icon="show2 ? 'fluent:eye-off-16-filled' : 'fluent:eye-16-filled'"
                                :aria-label="show2 ? 'Hide password' : 'Show password'"
                                :aria-pressed="show2"
                                aria-controls="password"
                                @click="show2 = !show2"
                            />
                        </template>
                    </UInput>
                </UFormGroup>

                <UButton type="submit" class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium">
                    Crear Cuenta
                </UButton>
            </UForm>
        </div>
        <div :class="[
            'mt-5 flex items-center justify-center',
            isMobile ? 'flex-wrap' : ''
        ]">
            <p class="text-sm">Ya tienes cuenta?</p>
            <UButton 
                variant="link" 
                @click="toggleForm"
                class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
            >
                Inicia Sesión Aqui
            </UButton>
        </div>
    </div>
</template>

<style scoped>
.form-container {
    position: relative;
    will-change: opacity;
}
</style>