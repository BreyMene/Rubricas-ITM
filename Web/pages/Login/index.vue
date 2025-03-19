<script setup lang="ts">
    definePageMeta({
        layout: 'login-nav'
    });

    const isLogin = ref(true);
    const isAnimating = ref(false);

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
        try {
            if (isLogin.value) {
                console.log('Login data:', state);
            } else {
                console.log('Sign-in data:', state2);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const resetFormFields = () => {
        // Resetear los campos del formulario Login
        state.email = '';
        state.password = '';
        
        // Resetear los campos del formulario Sign In
        state2.email = '';
        state2.password = '';
        state2.secPasword = '';
    }

    const toggleForm = async () => {
        if (isAnimating.value) return;
        isAnimating.value = true;
        isLogin.value = !isLogin.value;
        setTimeout(() => {
            resetFormFields();
            isAnimating.value = false;
        }, 750);
    }
</script>

<template>
    <div class="flex justify-center items-center min-h-screen">
        <!-- Main container with fixed width -->
        <div class="relative w-full max-w-4xl bg-White-w dark:bg-Warm-Dark/60 rounded-lg shadow-lg overflow-hidden">
            <!-- Logo Section -->
            <div 
                class="absolute h-full bg-[#a9b3de] dark:bg-Warm-Dark transition-transform z-10"
                :class="[
                    'w-2/5',
                    {'left-0': isLogin && !isAnimating},
                    {'right-0': !isLogin && !isAnimating},
                    {'animate-to-right': isAnimating && !isLogin},
                    {'animate-to-left': isAnimating && isLogin}
                ]"
            >
                <div class="flex items-center justify-center h-full p-8">
                    <NuxtImg 
                        sizes="50px sm:200px" 
                        src="/img/ITMLogo.png" 
                        format="webp" 
                        densities="x1 x2" 
                        class="dark:brightness-0 dark:invert pointer-events-none select-none" 
                    />
                </div>
            </div>

            <!-- Login Form -->
            <div v-show="isLogin" 
                class="form-container transition-opacity duration-500 ease-in-out w-3/5 ml-[40%] px-14 py-8"
                :class="{'opacity-0': isAnimating, 'opacity-100': !isAnimating || !isLogin}">
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
                <div class="mt-5 flex items-center justify-center">
                    <p class="text-sm">No tienes Cuenta?</p>
                    <UButton 
                        variant="link" 
                        @click="toggleForm"
                        class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
                    >
                        Registrate Aqui
                    </UButton>
                </div>
            </div>

            <!-- Sign In Form -->
            <div v-show="!isLogin" 
                class="form-container transition-opacity duration-500 ease-in-out w-3/5 px-14 py-6 absolute top-0 right-0"
                :class="{'opacity-0': isAnimating, 'opacity-100': !isAnimating || isLogin}">
                <h2 class="text-2xl font-semibold text-Pure-Black dark:text-White-w mb-6">SIGN IN</h2>
                <div class="mb-6">
                    <UForm :state="state2" class="flex flex-col gap-3" @submit="handleLogin">
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
                <div class="mt-5 flex items-center justify-center">
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
        </div>
    </div>
</template>

<style scoped>
@keyframes toRight {
    0% {
        left: 0;
        width: 40%;
        right: auto;
    }
    40% {
        left: 0;
        width: 100%;
        right: 0;
    }
    80% {
        left: 60%;
        width: 40%;
        right: 0;
    }
    100% {
        left: auto;
        right: 0;
        width: 40%;
    }
}

@keyframes toLeft {
    0% {
        right: 0;
        left: auto;
        width: 40%;
    }
    40% {
        right: 0;
        left: auto;
        width: 100%;
    }
    80% {
        right: 60%;
        left: 0;
        width: 40%;
    }
    100% {
        right: auto;
        left: 0;
        width: 40%;
    }
}

.animate-to-right {
    animation: toRight 1s ease-in-out forwards;
}

.animate-to-left {
    animation: toLeft 1s ease-in-out forwards;
}

.form-container {
    position: relative;
    will-change: opacity;
}
</style>