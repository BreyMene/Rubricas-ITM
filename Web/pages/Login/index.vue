<script setup lang="ts">
    definePageMeta({
        layout: 'login-nav'
    });

    const state = reactive({
        email: '',
        password: ''
    });

    const state2 = reactive({
        email: '',
        password: '',
        secPasword: ''
    });
    
    const handleLogin = async () => {
        try{
            console.log(state)
        }catch{

        }
    }
</script>

<template>
    <div class="flex justify-center items-center min-h-screen">
        <!-- LogIn -->
        <div class="flex w-full max-w-4xl bg-White-w dark:bg-Warm-Dark/60 rounded-lg shadow-lg overflow-hidden">
            <!-- Sección izquierda con el logo -->
            <div class="w-2/5 bg-Medium-Blue/60 dark:bg-Warm-Dark flex items-center justify-center p-8">
                <div class="flex justify-center w-full">
                    <NuxtImg sizes="50px sm:200px" src="/img/ITMLogo.png" format="webp" densities="x1 x2" class="dark:brightness-0 dark:invert  pointer-events-none select-none" />
                </div>
            </div>
            
            <!-- Sección derecha con el formulario -->
            <div class="w-3/5 px-14 py-8">
                <h2 class="text-2xl font-semibold text-Pure-Black dark:text-White-w mb-8">LOG IN</h2>
                    <div class="mb-6">
                        <UForm :state="state" class="flex flex-col gap-3" @submit="handleLogin">
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
                                <UInput size="sm" v-model="state.password" type="password" class="w-full"
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

                            <div class="flex justify-end">
                                <UButton variant="link" class="w-fit text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w">
                                    ¿Olvidaste tu contraseña?
                                </UButton>
                            </div>

                            <UButton type="submit" class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium">
                                Iniciar Sesión
                            </UButton>
                        </UForm>
                    </div>
                    <div class="mt-5 flex  items-center justify-center">
                        <p class="text-sm">No tienes Cuenta?</p>
                        <UButton variant="link" class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w">
                            Registrate Aqui
                        </UButton>
                    </div>
            </div>
        </div>

        <!-- SignIn -->
        <div class="flex w-full max-w-4xl bg-White-w dark:bg-Warm-Dark/60 rounded-lg shadow-lg overflow-hidden">
            <!-- Sección izquierda con el Formulario -->
            <div class="w-3/5 px-14 py-6">
                <h2 class="text-2xl font-semibold text-Pure-Black dark:text-White-w mb-6 text-right">SIGN IN</h2>
                    <div class="mb-6">
                        <UForm :state="state" class="flex flex-col gap-3" @submit="handleLogin">
                            <UFormGroup label="Email" name="email">
                                <UInput size="sm" v-model="state2.email" placeholder="ejemplo@correo.itm.edu.co" class="w-full"
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
                                <UInput size="sm" v-model="state2.password" type="password" class="w-full"
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

                            <UFormGroup label="Verifica Contraseña" name="password">
                                <UInput size="sm" v-model="state2.secPasword" type="password" class="w-full"
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

                            <UButton type="submit" class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium">
                                Registrarse
                            </UButton>
                        </UForm>
                    </div>
                    <div class="mt-5 flex  items-center justify-center">
                        <p class="text-sm">Ya tienes cuenta?</p>
                        <UButton variant="link" class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w">
                            Inicia Sesión Aqui
                        </UButton>
                    </div>
            </div>

            <!-- Sección derecha con el Logo -->
            <div class="w-2/5">

            </div>
        </div>
    </div>
</template>