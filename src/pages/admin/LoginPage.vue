<template>
  <div class="login-page flex flex-center">
    <q-card flat bordered class="login-card rounded-2xl q-pa-xl shadow-card" style="width: 100%; max-width: 420px">
      <!-- Header -->
      <div class="text-center q-mb-xl">
        <q-icon name="mosque" color="primary" size="56px" />
        <h1 class="text-h6 text-weight-bold text-primary q-mt-sm q-mb-xs">
          Admin Panel
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
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const showPassword = ref(false);
const form = reactive({ username: '', password: '' });

const handleLogin = async () => {
  const ok = await authStore.login(form);
  if (ok) {
    router.push({ name: 'admin-dashboard' });
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.login-card {
  background: white;
}

.body--dark .login-card {
  background: #1e1e1e;
}
</style>
