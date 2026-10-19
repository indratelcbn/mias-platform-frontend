<template>
  <span class="arabic-aware" :style="baseStyle">
    <span
      v-for="(seg, i) in segments"
      :key="i"
      :class="{ 'arabic-text': seg.arabic }"
    >{{ seg.text }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: { type: String, default: '' },
  // Ukuran dasar teks non-Arab (opsional)
  baseFontSize: { type: String, default: '' },
});

const baseStyle = computed(() =>
  props.baseFontSize ? { fontSize: props.baseFontSize } : {}
);

// Deteksi karakter Arab (termasuk huruf + harakat)
const isArabicChar = (ch) =>
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(ch);

// Pecah teks menjadi segmen Arab dan non-Arab.
// Spasi & tanda baca "menempel" pada segmen berjalan agar tidak terpecah berlebihan.
const segments = computed(() => {
  const text = props.text || '';
  if (!text) return [];
  const result = [];
  let cur = '';
  let curArabic = null;

  for (const ch of text) {
    const isSpace = /\s/.test(ch);
    const a = isArabicChar(ch);

    if (curArabic === null) {
      curArabic = isSpace ? false : a;
      cur = ch;
      continue;
    }

    // Spasi mengikuti tipe segmen yang sedang berjalan
    if (isSpace || a === curArabic) {
      cur += ch;
    } else {
      result.push({ text: cur, arabic: curArabic });
      cur = ch;
      curArabic = a;
    }
  }
  if (cur) result.push({ text: cur, arabic: curArabic });
  return result;
});
</script>

<style scoped>
.arabic-aware {
  white-space: pre-line;
  word-break: break-word;
}
</style>
