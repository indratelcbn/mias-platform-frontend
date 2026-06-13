import { useAuthStore } from 'src/stores/auth';
import { Notify } from 'quasar';

/**
 * Returns a guard function. Call it before any write operation.
 * If the current user is VIEWER, shows a notification and returns true (blocked).
 *
 * Usage:
 *   const isViewer = useViewerGuard();
 *   if (isViewer()) return;
 *   // proceed with write operation
 */
export function useViewerGuard() {
  const authStore = useAuthStore();

  return () => {
    if (authStore.isViewer) {
      Notify.create({
        type: 'negative',
        icon: 'block',
        message: 'Anda tidak bisa melakukan tindakan ini. Role Viewer tidak sesuai.',
        position: 'top',
        timeout: 4000,
      });
      return true; // blocked
    }
    return false; // allowed
  };
}
