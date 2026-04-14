<template>
  <div class="login-page flex flex-center">
    <q-card flat bordered class="login-card rounded-2xl q-pa-xl shadow-card" style="width: 100%; max-width: 420px">
      <!-- Header -->
      <div class="text-center q-mb-xl">
        <img src="/LOGO MIAS.png" style="width: 80px; height: 80px; object-fit: contain;" />
        <h1 class="text-h6 text-weight-bold text-primary q-mt-sm q-mb-xs">
          Login Admin
        </h1>
        <p class="text-caption text-grey-6">Masjid Imam Asy Syafi'i Depok</p>
      </div>

      <!-- Form -->
      <q-form @submit="handleLogin" class="q-gutter-md">
        <q-input
          v-model="form.username"
          outlined
          label="Username"
          autofocus
          :rules="[v => !!v || 'Username harus diisi']"
        >
          <template #prepend><q-icon name="person" color="primary" /></template>
        </q-input>

        <q-input
          v-model="form.password"
          outlined
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          :rules="[v => !!v || 'Password harus diisi']"
        >
          <template #prepend><q-icon name="lock" color="primary" /></template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-btn
          type="submit"
          unelevated
          color="primary"
          :label="authStore.loading ? 'Masuk...' : 'Masuk'"
          :loading="authStore.loading"
          no-caps
          class="full-width q-py-sm q-mt-md"
          style="border-radius: 10px; font-size: 16px; font-weight: 600"
          icon="login"
        />
      </q-form>

      <div class="text-center q-mt-lg">
        <router-link to="/" class="text-caption text-grey-6 text-decoration-none">
          ← Kembali ke Website
        </router-link>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { Notify } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();

const showPassword = ref(false);
const form = reactive({ username: '', password: '' });

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// Inject script secara dinamis agar site key terbaca dari import.meta.env
onMounted(() => {
  if (!document.getElementById('recaptcha-script')) {
    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
});

const getRecaptchaToken = () => {
  return new Promise((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action: 'login' })
        .then(resolve)
        .catch(reject);
    });
  });
};

const handleLogin = async () => {
  try {
    const recaptchaToken = await getRecaptchaToken();
    const ok = await authStore.login({ ...form, recaptchaToken });
    if (ok) {
      router.push({ name: 'admin-dashboard' });
    }
  } catch {
    Notify.create({ type: 'negative', message: 'Gagal mendapatkan token reCAPTCHA. Periksa koneksi Anda.' });
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1cdf57 0%, #053717 100%);
}

.login-card {
  background: white;
}

.body--dark .login-card {
  background: #1e1e1e;
}
</style>
