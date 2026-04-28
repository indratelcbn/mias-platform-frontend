<template>
  <div class="rich-editor" :class="{ 'rich-editor--readonly': !editable }">
    <!-- Toolbar -->
    <div v-if="editable && editor" class="rich-toolbar q-pa-xs row items-center q-gutter-xs">
      <q-btn-group flat>
        <q-btn dense flat icon="format_bold" size="sm" :color="editor.isActive('bold') ? 'primary' : 'grey-8'"
               @click="editor.chain().focus().toggleBold().run()">
          <q-tooltip>Bold (Ctrl+B)</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="format_italic" size="sm" :color="editor.isActive('italic') ? 'primary' : 'grey-8'"
               @click="editor.chain().focus().toggleItalic().run()">
          <q-tooltip>Italic (Ctrl+I)</q-tooltip>
        </q-btn>
      </q-btn-group>

      <q-separator vertical />

      <q-btn-group flat>
        <q-btn dense flat label="H2" size="sm" no-caps
               :color="editor.isActive('heading', { level: 2 }) ? 'primary' : 'grey-8'"
               @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
          <q-tooltip>Heading 2</q-tooltip>
        </q-btn>
        <q-btn dense flat label="H3" size="sm" no-caps
               :color="editor.isActive('heading', { level: 3 }) ? 'primary' : 'grey-8'"
               @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">
          <q-tooltip>Heading 3</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="notes" size="sm"
               :color="editor.isActive('paragraph') ? 'primary' : 'grey-8'"
               @click="editor.chain().focus().setParagraph().run()">
          <q-tooltip>Paragraf</q-tooltip>
        </q-btn>
      </q-btn-group>

      <q-separator vertical />

      <q-btn-group flat>
        <q-btn dense flat icon="format_list_bulleted" size="sm"
               :color="editor.isActive('bulletList') ? 'primary' : 'grey-8'"
               @click="editor.chain().focus().toggleBulletList().run()">
          <q-tooltip>Bullet list</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="format_list_numbered" size="sm"
               :color="editor.isActive('orderedList') ? 'primary' : 'grey-8'"
               @click="editor.chain().focus().toggleOrderedList().run()">
          <q-tooltip>Numbered list</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="format_quote" size="sm"
               :color="editor.isActive('blockquote') ? 'primary' : 'grey-8'"
               @click="editor.chain().focus().toggleBlockquote().run()">
          <q-tooltip>Quote</q-tooltip>
        </q-btn>
      </q-btn-group>

      <q-separator vertical />

      <q-btn-group flat>
        <q-btn dense flat icon="link" size="sm" :color="editor.isActive('link') ? 'primary' : 'grey-8'" @click="setLink">
          <q-tooltip>Link</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="link_off" size="sm" color="grey-8"
               :disable="!editor.isActive('link')"
               @click="editor.chain().focus().unsetLink().run()">
          <q-tooltip>Hapus link</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="image" size="sm" color="grey-8" @click="triggerImage">
          <q-tooltip>Upload gambar</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="horizontal_rule" size="sm" color="grey-8"
               @click="editor.chain().focus().setHorizontalRule().run()">
          <q-tooltip>Divider</q-tooltip>
        </q-btn>
      </q-btn-group>

      <q-separator vertical />

      <q-btn-group flat>
        <q-btn dense flat icon="grid_on" size="sm" color="grey-8" @click="insertTable">
          <q-tooltip>Insert table</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="add_box" size="sm" color="grey-8" :disable="!editor.isActive('table')"
               @click="editor.chain().focus().addColumnAfter().run()">
          <q-tooltip>Tambah kolom</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="library_add" size="sm" color="grey-8" :disable="!editor.isActive('table')"
               @click="editor.chain().focus().addRowAfter().run()">
          <q-tooltip>Tambah baris</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="delete_sweep" size="sm" color="grey-8" :disable="!editor.isActive('table')"
               @click="editor.chain().focus().deleteTable().run()">
          <q-tooltip>Hapus tabel</q-tooltip>
        </q-btn>
      </q-btn-group>

      <q-space />

      <q-btn-group flat>
        <q-btn dense flat icon="undo" size="sm" color="grey-8" :disable="!editor.can().undo()"
               @click="editor.chain().focus().undo().run()">
          <q-tooltip>Undo</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="redo" size="sm" color="grey-8" :disable="!editor.can().redo()"
               @click="editor.chain().focus().redo().run()">
          <q-tooltip>Redo</q-tooltip>
        </q-btn>
      </q-btn-group>
    </div>

    <editor-content :editor="editor" class="rich-editor__content" />

    <input ref="fileInput" type="file" accept="image/*" hidden @change="onImageChosen" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Dialog, Notify } from 'quasar';
import { api } from 'src/boot/axios';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Tulis isi artikel di sini…' },
  editable: { type: Boolean, default: true },
  minHeight: { type: String, default: '420px' },
});
const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);

const editor = useEditor({
  content: props.modelValue || '',
  editable: props.editable,
  extensions: [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener nofollow', target: '_blank' } }),
    Image.configure({ inline: false, allowBase64: false }),
    Placeholder.configure({ placeholder: props.placeholder }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
  ],
  onUpdate({ editor: ed }) {
    const html = ed.getHTML();
    emit('update:modelValue', html === '<p></p>' ? '' : html);
  },
});

watch(() => props.modelValue, (val) => {
  if (!editor.value) return;
  if (val === editor.value.getHTML()) return;
  editor.value.commands.setContent(val || '', false);
});

watch(() => props.editable, (val) => {
  editor.value?.setEditable(val);
});

onBeforeUnmount(() => editor.value?.destroy());
onMounted(() => {
  // ensure min height applied via CSS var
  if (fileInput.value) fileInput.value.value = '';
});

const setLink = () => {
  const previous = editor.value.getAttributes('link').href;
  Dialog.create({
    title: 'Tambah / Edit Link',
    prompt: { model: previous || '', type: 'url', label: 'URL (https://…)' },
    cancel: true,
  }).onOk((url) => {
    if (!url) {
      editor.value.chain().focus().unsetLink().run();
      return;
    }
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  });
};

const insertTable = () => {
  editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
};

const triggerImage = () => fileInput.value?.click();

const onImageChosen = async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  try {
    const fd = new FormData();
    fd.append('image', file);
    const { data } = await api.post('/artikel/upload-image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const url = data.url;
    editor.value.chain().focus().setImage({ src: url, alt: file.name }).run();
  } catch (err) {
    Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal upload gambar.' });
  }
};
</script>

<style scoped>
.rich-editor {
  border: 1px solid #d0d4d9;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}
.rich-toolbar {
  background: #f6f8fa;
  border-bottom: 1px solid #e3e6ea;
  flex-wrap: wrap;
}
.rich-editor__content {
  padding: 14px 18px;
  min-height: v-bind(minHeight);
  max-height: 65vh;
  overflow-y: auto;
}
</style>

<style>
/* TipTap content styling (global so prose renders inside ProseMirror root) */
.rich-editor__content .ProseMirror {
  outline: none;
  min-height: inherit;
  font-size: 15px;
  line-height: 1.7;
  color: #1f2933;
}
.rich-editor__content .ProseMirror p { margin: 0 0 0.9em; }
.rich-editor__content .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin: 1.4em 0 0.5em; color: #1B7A4A; }
.rich-editor__content .ProseMirror h3 { font-size: 1.2rem; font-weight: 700; margin: 1.2em 0 0.4em; color: #1B7A4A; }
.rich-editor__content .ProseMirror ul,
.rich-editor__content .ProseMirror ol { padding-left: 1.4em; margin: 0 0 1em; }
.rich-editor__content .ProseMirror li { margin-bottom: 0.3em; }
.rich-editor__content .ProseMirror blockquote {
  border-left: 4px solid #1B7A4A;
  margin: 1em 0;
  padding: 0.4em 1em;
  background: #f1faf3;
  color: #2c3e50;
  font-style: italic;
  border-radius: 4px;
}
.rich-editor__content .ProseMirror a { color: #1B7A4A; text-decoration: underline; }
.rich-editor__content .ProseMirror img { max-width: 100%; height: auto; border-radius: 8px; margin: 0.6em 0; }
.rich-editor__content .ProseMirror hr { border: none; border-top: 1px solid #d4d8de; margin: 1.4em 0; }
.rich-editor__content .ProseMirror table {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
  table-layout: fixed;
  overflow: hidden;
}
.rich-editor__content .ProseMirror table td,
.rich-editor__content .ProseMirror table th {
  border: 1px solid #d4d8de;
  padding: 6px 10px;
  vertical-align: top;
}
.rich-editor__content .ProseMirror table th { background: #f1faf3; font-weight: 700; }
.rich-editor__content .ProseMirror p.is-editor-empty:first-child::before {
  color: #9aa1aa;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
