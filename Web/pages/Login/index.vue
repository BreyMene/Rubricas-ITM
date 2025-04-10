<script setup lang="ts">
    definePageMeta({
        layout: 'login-nav'
    });

    const isLogin = ref(true);
    const isAnimating = ref(false);
    const isForgotPassword = ref(false);
    const isReturningFromForgot = ref(false);
    const isOTPForm = ref(false);
    const otpEmail = ref('');
    const isResetPass = ref(false);

    // Para hacer el backToLogin mas rapido en ResetPassword
    const isLeavingFromReset = ref(false);

    const toggleForm = async () => {
        if (isAnimating.value) return;
        isAnimating.value = true;
        isLogin.value = !isLogin.value;
        isForgotPassword.value = false;
        isReturningFromForgot.value = false;
        isOTPForm.value = false;
        isResetPass.value = false;

        setTimeout(() => {
            isAnimating.value = false;
        }, 750);
    }

    const showForgotPassword = () => {
        if (isAnimating.value) return;  
        isAnimating.value = true;
        isForgotPassword.value = true;
        isLogin.value = false;
        isReturningFromForgot.value = false;
        isOTPForm.value = false;
        
        setTimeout(() => {
            isAnimating.value = false;
        }, 750);
    }

    const backToLogin = (fromReset = false) => {
        if (isAnimating.value) return;
        isAnimating.value = true;
        isReturningFromForgot.value = true;
        isOTPForm.value = false;
        
        if (fromReset) {
            isLeavingFromReset.value = true;
        }

        setTimeout(() => {
            isForgotPassword.value = false;
            isLogin.value = true;
            isResetPass.value = false;
            
            setTimeout(() => {
                isAnimating.value = false;
                isReturningFromForgot.value = false;
                isLeavingFromReset.value = false;
            }, 550);
        }, 350);
    }

    const showOTPForm = (email: string) => {
        if (isAnimating.value) return;
        otpEmail.value = email;
        setTimeout(() => {
            isOTPForm.value = true;
        }, 100);
    }

    const showResetPassword = () => {
        if (isAnimating.value) return;

        setTimeout(() => {
            isOTPForm.value = false;
            isResetPass.value = true;
        }, 100);
    }

    const backToForgotPassword = () => {
        if (isAnimating.value) return;
        setTimeout(() => {
            isOTPForm.value = false;
            console.log(isOTPForm)
        }, 100);
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
                <transition name="fade" mode="out-in" :class="{ 'faster-transition-out': isLeavingFromReset }">
                    <RegisterLogIn
                        v-if="isLogin && !isForgotPassword"
                        @show-forgot-password="showForgotPassword"
                        @toggle-form="toggleForm"
                    />

                    <!-- Sign In Form Desktop -->
                    <RegisterSignIn 
                        v-else-if="!isLogin && !isForgotPassword"
                        @toggle-form="toggleForm"
                    />

                    <!-- Olvido Contraseña Desktop -->
                    <RegisterForgotPassword 
                        v-else-if="isForgotPassword && !isOTPForm && !isResetPass"
                        :is-returning-from-forgot="isReturningFromForgot"
                        @back-to-login="backToLogin"
                        @show-o-t-p-form="showOTPForm"
                    />

                    <!-- OPT para olvidar contraseña -->
                    <RegisterOTP 
                        v-else-if="isForgotPassword && isOTPForm && !isResetPass"
                        :email="otpEmail"
                        :otpLength="6"
                        @back-to-forgot-password="backToForgotPassword"
                        @show-reset-password = 'showResetPassword'
                    />

                    <RegisterResetPassword 
                        v-else-if="isForgotPassword && !isOTPForm && isResetPass"
                        @back-to-login="backToLogin"
                    />
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
                    <RegisterLogIn
                        v-if="isLogin && !isForgotPassword"
                        :is-mobile="true"
                        @show-forgot-password="showForgotPassword"
                        @toggle-form="toggleForm"
                    />
    
                    <!-- Sign In Form Mobile -->
                    <RegisterSignIn 
                        v-else-if="!isLogin && !isForgotPassword"
                        :is-mobile="true"
                        @toggle-form="toggleForm"
                    />
    
                    <!-- Olvido Contraseña Mobile -->
                    <RegisterForgotPassword 
                        v-else-if="isForgotPassword && !isOTPForm && !isResetPass"
                        :is-mobile="true"
                        :is-returning-from-forgot="isReturningFromForgot"
                        @back-to-login="backToLogin"
                        @show-o-t-p-form="showOTPForm"
                    />

                    <!-- OPT para olvidar contraseña -->
                    <RegisterOTP 
                        v-else-if="isForgotPassword && isOTPForm && !isResetPass"
                        :is-mobile="true"
                        :email="otpEmail"
                        :otpLength="6"
                        @back-to-forgot-password="backToForgotPassword"
                        @show-reset-password = 'showResetPassword'
                    />

                    <RegisterResetPassword 
                        v-else-if="isForgotPassword && !isOTPForm && isResetPass"
                        :is-mobile="true"
                        @back-to-login="backToLogin"
                    />
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