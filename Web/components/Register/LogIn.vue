<script setup lang="ts">
const config = useRuntimeConfig();
import { useDocenteStore } from "~/utils/store";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const loadScreen = ref(false);

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["showForgotPassword", "toggleForm", "loadScreen"]);

const state = reactive({
  email: "",
  password: "",
});

// To display as a hint, instead of dsiplaying the base error
const emailError = ref("");
const passwordError = ref("");
const formError = ref("");

const validate = createFormValidator(emailError, passwordError, undefined, {
  isMobile: props.isMobile,
});

const handleLogin = async () => {
  formError.value = "";
  
  try {
    loadScreen.value = true;
    emit("loadScreen", t('login.loading'), loadScreen.value)
    const docente = await $fetch<Docente>(`${config.public.apiUrl}/login`, {
      method: "POST",
      body: {
        correo: state.email,
        contraseña: state.password,
      },
    });

    useDocenteStore().setDocente(docente);
    await navigateTo("/");
  } catch (error) {
    formError.value = t('login.form.invalid_credentials');
    emailError.value = props.isMobile ? "" : formError.value;
  } finally {
    loadScreen.value = false;
    emit("loadScreen", "", loadScreen.value)
  }
};

const showForgotPassword = () => {
  emit("showForgotPassword");
};

const toggleForm = () => {
  emit("toggleForm");
};

const show = ref(false);
</script>

<template>
  <div
    :class="[
      isMobile
        ? 'px-6 py-8 min-h-[450px]'
        : 'form-container w-3/5 ml-[40%] px-14 py-8',
    ]"
  >
    <h2
      :class="[
        'font-semibold text-Pure-Black dark:text-White-w mb-8',
        isMobile ? 'text-xl text-center' : 'text-2xl',
      ]"
    >
      {{ t('login.title') }}
    </h2>
    <div class="mb-6">
      <UForm
        :state="state"
        :validate="validate"
        class="flex flex-col gap-3"
        @submit="handleLogin"
      >
        <UFormGroup
          :label="t('login.form.email_label')"
          name="email"
          :hint="emailError"
          :error="formError"
          :ui="{
            hint: 'text-red-500 dark:text-red-500 text-sm',
            error: isMobile
              ? 'text-red-500 dark:text-red-500 text-sm'
              : 'hidden',
          }"
        >
          <UInput
            size="sm"
            v-model="state.email"
            :placeholder="t('login.form.email_placeholder', { atSign: '@' })"
            class="w-full"
            :ui="{
              icon: {
                trailing: { pointer: '' },
              },
              ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
              color: {
                gray: {
                  outline:
                    'shadow-lg bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown',
                },
              },
            }"
            color="gray"
          />
        </UFormGroup>

        <UFormGroup
          :label="t('login.form.password_label')"
          name="password"
          :hint="passwordError"
          :error="formError"
          :ui="{ hint: 'text-red-500 dark:text-red-500', error: 'hidden' }"
        >
          <UInput
            size="sm"
            v-model="state.password"
            :type="show ? 'text' : 'password'"
            class="w-full"
            :ui="{
              icon: {
                trailing: { pointer: '' },
              },
              ring: 'focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown focus:ring-offset-2',
              color: {
                gray: {
                  outline:
                    'shadow-lg bg-Warm-White dark:bg-Pure-Black text-gray-900 dark:text-white ring-0 focus:ring-2 focus:ring-Purple-P dark:focus:ring-Muted-Brown',
                },
              },
            }"
            color="gray"
          >
            <template #trailing>
              <UButton
                color="gray"
                variant="link"
                size="sm"
                :icon="
                  show ? 'fluent:eye-off-16-filled' : 'fluent:eye-16-filled'
                "
                :aria-label="show ? t('login.form.hide_password') : t('login.form.show_password')"
                :aria-pressed="show"
                aria-controls="password"
                @click="show = !show"
              />
            </template>
          </UInput>
        </UFormGroup>

        <div class="flex justify-end">
          <UButton
            variant="link"
            class="w-fit text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
            @click="showForgotPassword"
          >
            {{ t('login.form.forgot_password') }}
          </UButton>
        </div>

        <UButton
          type="submit"
          class="justify-center mt-6 bg-Dark-Blue dark:bg-Muted-Brown text-White-w dark:text-White-w py-3 rounded-md hover:bg-Medium-Blue hover:dark:bg-Medium-Gray transition duration-300 font-medium"
        >
          {{ t('login.form.submit_button') }}
        </UButton>
      </UForm>
    </div>
    <div
      :class="[
        'mt-5 flex items-center justify-center',
        isMobile ? 'flex-wrap' : '',
      ]"
    >
      <p class="text-sm">{{ t('login.no_account') }}</p>
      <UButton
        variant="link"
        @click="toggleForm"
        class="text-Dark-Blue dark:text-White-w hover:text-Dark-Blue hover:dark:text-White-w"
      >
        {{ t('login.register_here') }}
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

