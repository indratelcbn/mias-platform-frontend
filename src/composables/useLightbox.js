import { ref } from 'vue';

// Singleton state – shared across all components
const visible = ref(false);
const src = ref('');
const caption = ref('');

export function useLightbox() {
  function open(imgSrc, imgCaption = '') {
    if (!imgSrc) return;
    src.value = imgSrc;
    caption.value = imgCaption;
    visible.value = true;
  }

  function close() {
    visible.value = false;
  }

  return { visible, src, caption, open, close };
}
