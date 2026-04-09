import { onMounted, onBeforeUnmount } from 'vue';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 menit
const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

/**
 * Auto-logout setelah 30 menit tanpa aktivitas.
 * @param {Function} onTimeout - callback yang dipanggil saat timeout (untuk logout)
 */
export function useInactivityTimer(onTimeout) {
  let timer = null;

  function resetTimer() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      onTimeout();
    }, INACTIVITY_TIMEOUT);
  }

  onMounted(() => {
    EVENTS.forEach((evt) => {
      window.addEventListener(evt, resetTimer, { passive: true });
    });
    resetTimer();
  });

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer);
    EVENTS.forEach((evt) => {
      window.removeEventListener(evt, resetTimer);
    });
  });

  return { resetTimer };
}
