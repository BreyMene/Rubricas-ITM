<script setup lang="ts">
    definePageMeta({
        layout: 'login-nav'
    });

    const isLogin = ref(true);
    const isAnimating = ref(false);
    const isForgotPassword = ref(false);
    const isReturningFromForgot = ref(false);

    const state = reactive({
        email: '',
        password: ''
    });

    const state2 = reactive({
        email: '',
        password: '',
        secPasword: ''
    });

    const forgotPasswordState = reactive({
        email: ''
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

        forgotPasswordState.email = '';
    }

    const toggleForm = async () => {
        if (isAnimating.value) return;
        isAnimating.value = true;
        isLogin.value = !isLogin.value;
        isForgotPassword.value = false;
        isReturningFromForgot.value = false;

        setTimeout(() => {
            resetFormFields();
            isAnimating.value = false;
        }, 750);
    }

    const showForgotPassword = () => {
        if (isAnimating.value) return;  
        isAnimating.value = true;
        isForgotPassword.value = true;
        isLogin.value = false;
        isReturningFromForgot.value = false;
        
        setTimeout(() => {
            resetFormFields();
            isAnimating.value = false;
        }, 750);
    }

    const backToLogin = () => {
        if (isAnimating.value) return;
        isAnimating.value = true;
        isReturningFromForgot.value = true;

        setTimeout(() => {
            isForgotPassword.value = false;
            isLogin.value = true;
            
            setTimeout(() => {
                resetFormFields();
                isAnimating.value = false;
                isReturningFromForgot.value = false;
            }, 550);
        }, 350);
    }
</script>

<template>
    <div class="flex justify-center items-center min-h-screen p-4">
        <!-- Main container with responsive width -->
        <div class="relative w-full max-w-4xl bg-White-w dark:bg-Warm-Dark/60 rounded-lg shadow-lg overflow-hidden">

            <!-- Desktop Layout -->
            <div class="hidden md:block">
                <!-- Logo Section for Desktop -->
                <div 
                    v-if="!isForgotPassword"
                    class="absolute bg-[#a9b3de] dark:bg-Warm-Dark transition-transform z-10"
                    :class="[
                        'w-2/5', 'h-full',
                        {'left-0': isLogin && !isAnimating},
                        {'right-0': !isLogin && !isAnimating},
                        {'animate-to-right': isAnimating && !isLogin && !isReturningFromForgot},
                        {'animate-to-left': isAnimating && isLogin && !isReturningFromForgot}
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

                <!-- Logo Section for Forgot Password Desktop -->
                <div 
                    v-if="isForgotPassword || isAnimating && (isForgotPassword || isReturningFromForgot)"
                    class="absolute bg-[#a9b3de] dark:bg-Warm-Dark transition-transform z-10"
                    :class="[
                        {'w-full h-1/4 top-0': !isAnimating && isForgotPassword},
                        {'animate-to-expand': isAnimating && isForgotPassword && !isReturningFromForgot},
                        {'animate-to-top': isAnimating && isReturningFromForgot}
                    ]"
                >
                    <div class="flex items-center justify-center h-full p-8">
                        <NuxtImg 
                            sizes="50px sm:200px" 
                            src="/img/ITMLogo.png" 
                            format="webp" 
                            densities="x1 x2" 
                            class="dark:brightness-0 dark:invert pointer-events-none select-none transition-all duration-500"
                            :class="[
                                {'w-[200px]': !isForgotPassword || isReturningFromForgot},
                                {'w-[150px]': isForgotPassword && !isReturningFromForgot && !isAnimating},
                                {'logo-shrink': isAnimating && isForgotPassword && !isReturningFromForgot},
                                {'logo-grow': isAnimating && isReturningFromForgot}
                            ]"
                        />
                    </div>
                </div>

                <!-- Login Form Desktop -->
                <transition name="fade" mode="out-in">
                    <div v-if="isLogin && !isForgotPassword" 
                        class="form-container w-3/5 ml-[40%] px-14 py-8">
                        <h2 class="text-2xl font-semibold text-Pure-Black dark:text-White-w mb-8">INICIAR SESION</h2>
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
                                    <UButton variant="link" class="w-fit text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
                                        @click="showForgotPassword">
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

                    <!-- Sign In Form Desktop -->
                    <div v-else-if="!isLogin && !isForgotPassword"  
                        class="form-container w-3/5 px-14 py-6 absolute top-0 right-0">
                        <h2 class="text-2xl text-end font-semibold text-Pure-Black dark:text-White-w mb-6">REGISTRATE</h2>
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
                                    Crear Cuenta
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

                    <!-- Olvido Contraseña Desktop -->
                    <div v-else-if="isForgotPassword"
                        class="form-container w-full px-60 py-8 mt-[12.5%] absolute left-0 right-0" :class="{'faster-transition-out': isReturningFromForgot}">
                        <h2 class="text-2xl font-semibold text-Pure-Black dark:text-White-w mb-8">RECUPERAR CONTRASEÑA</h2>
                        <div class="mb-6">
                            <UForm :state="forgotPasswordState" class="flex flex-col gap-3">
                                <UFormGroup label="Email" name="email">
                                    <UInput size="sm" v-model="forgotPasswordState.email" placeholder="ejemplo@correo.itm.edu.co"
                                        class="w-full"
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

                                <UButton class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium">
                                    Enviar Instrucciones
                                </UButton>
                            </UForm>
                        </div>
                        <div class="mt-5 flex items-center justify-center">
                            <UButton variant="link" @click="backToLogin"
                                class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w">
                                Volver a Iniciar Sesión
                            </UButton>
                        </div>
                    </div>
                </transition>
            </div>

            <!-- Mobile Layout -->
            <div class="md:hidden flex flex-col">
                <!-- Logo Section for Mobile -->
                <div class="w-full bg-[#a9b3de] dark:bg-Warm-Dark py-4 flex justify-center items-center">
                    <NuxtImg 
                        sizes="120px" 
                        src="/img/ITMLogo.png" 
                        format="webp" 
                        densities="x1 x2" 
                        class="dark:brightness-0 dark:invert pointer-events-none select-none w-32" 
                    />
                </div>

                <transition name="fade" mode="out-in">
                    <!-- Login Form Mobile -->
                    <div v-if="isLogin && !isForgotPassword" 
                        class="px-6 py-8 min-h-[450px]">
                        <h2 class="text-xl font-semibold text-Pure-Black dark:text-White-w mb-6 text-center">INICIAR SESION</h2>
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
                                    <UButton variant="link" class="w-fit text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
                                        @click="showForgotPassword">
                                        ¿Olvidaste tu contraseña?
                                    </UButton>
                                </div>
    
                                <UButton type="submit" class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium">
                                    Iniciar Sesión
                                </UButton>
                            </UForm>
                        </div>
                        <div class="mt-5 flex items-center justify-center flex-wrap">
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
    
                    <!-- Sign In Form Mobile -->
                    <div v-else-if="!isLogin && !isForgotPassword"
                        class="px-6 py-6 min-h-[450px]">
                        <h2 class="text-xl font-semibold text-Pure-Black dark:text-White-w mb-6 text-center">REGISTRATE</h2>
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
                                    Crear Cuenta
                                </UButton>
                            </UForm>
                        </div>
                        <div class="mt-5 flex items-center justify-center flex-wrap">
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
    
                    <!-- Olvido Contraseña Mobile -->
                    <div v-else-if="isForgotPassword"
                        class="px-6 py-8 min-h-[450px] flex flex-col justify-center"
                        :class="{'faster-transition-out': isReturningFromForgot}">
                        <h2 class="text-xl font-semibold text-Pure-Black dark:text-White-w mb-6 text-center">RECUPERAR CONTRASEÑA</h2>
                        <div class="mb-6">
                            <UForm :state="forgotPasswordState" class="flex flex-col gap-3">
                                <UFormGroup label="Email" name="email">
                                    <UInput size="sm" v-model="forgotPasswordState.email" placeholder="ejemplo@correo.itm.edu.co"
                                        class="w-full"
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
    
                                <UButton class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium">
                                    Enviar Instrucciones
                                </UButton>
                            </UForm>
                        </div>
                        <div class="mt-5 flex items-center justify-center">
                            <UButton variant="link" @click="backToLogin"
                                class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w">
                                Volver a Iniciar Sesión
                            </UButton>
                        </div>
                    </div>
                </transition>

            </div>
        </div>
    </div>
</template>

<style scoped>
    /* Animaciones solo para desktop */
    @media (min-width: 768px) {
        /* Animaciones de Login a SignIn */
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

        /* Animaciones de LogIn a ForgotPassword */
        @keyframes toExpand {
            0% {
                left: 0;
                width: 40%;
                height: 100%;
                top: 0;
            }
            40% {
                left: 0;
                width: 100%;
                height: 100%;
                top: 0;
            }
            80% {
                left: 0;
                width: 100%;
                height: 25%;
                top: 0;
            }
            100% {
                left: 0;
                width: 100%;
                height: 25%;
                top: 0;
            }
        }

        @keyframes toTop {
            0% {
                top: 0;
                width: 100%;
                height: 25%;
                left: 0;
            }
            40% {
                top: 0;
                width: 100%;
                height: 100%;
                left: 0;
            }
            80% {
                top: 0;
                width: 40%;
                height: 100%;
                left: 0;
            }
            100% {
                top: auto;
                width: 40%;
                height: 100%;
                left: 0;
            }
        }


        .animate-to-expand {
            animation: toExpand 1s ease-in-out forwards;
        }

        .animate-to-top {
            animation: toTop 1s ease-in-out forwards;
        }

        @keyframes logoShrink {
            0% {
                width: 200px;
            }
            100% {
                width: 150px;
            }
        }

        @keyframes logoGrow {
            0% {
                width: 150px;
            }
            100% {
                width: 200px;
            }
        }

        .logo-shrink {
            animation: logoShrink 1s ease-in-out forwards;
        }

        .logo-grow {
            animation: logoGrow 1s ease-in-out forwards;
        }
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.5s ease;
    }

    .faster-transition-out {
        transition: opacity 0.2s ease !important;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>