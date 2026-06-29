<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import IdiomaForm from '@/components/admin/IdiomaForm.vue'
import { 
  getIdiomas, 
  createIdioma, 
  updateIdioma, 
  deleteIdioma, 
  type Idioma as IdiomaType 
} from '@/services/idiomaService'

interface Idioma extends IdiomaType {}

const idiomas = ref<Idioma[]>([])
const loading = ref(true)
const loadingIds = ref(new Set<string>())
const showModal = ref(false)
const editingIdioma = ref<Idioma | null>(null)

async function loadIdiomas() {
  loading.value = true
  try {
    idiomas.value = await getIdiomas()
  } catch (e) {
    console.error('Error loading idiomas:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadIdiomas)

function openCreateModal() { editingIdioma.value = null; showModal.value = true }
function openEditModal(idioma: Idioma) { editingIdioma.value = idioma; showModal.value = true }
function closeModal() { showModal.value = false; editingIdioma.value = null }

async function onSaved(data: { name: string }) {
  try {
    if (editingIdioma.value) {
      await updateIdioma(editingIdioma.value.id, data.name)
      const index = idiomas.value.findIndex(i => i.id === editingIdioma.value?.id)
      const item = index !== -1 ? idiomas.value[index] : undefined
      if (item) item.nombre = data.name
    } else {
      const newIdioma = await createIdioma(data.name)
      idiomas.value.push(newIdioma)
    }
    closeModal()
  } catch (e) {
    console.error('Error saving idioma:', e)
  }
}

const showDeleteConfirm = ref(false)
const deletingIdioma = ref<Idioma | null>(null)

function openDeleteConfirm(idioma: Idioma) { deletingIdioma.value = idioma; showDeleteConfirm.value = true }
function closeDeleteConfirm() { showDeleteConfirm.value = false; deletingIdioma.value = null }

async function confirmDelete() {
  if (!deletingIdioma.value) return
  const id = deletingIdioma.value.id
  loadingIds.value.add(id)
  try {
    await deleteIdioma(id)
    idiomas.value = idiomas.value.filter((i) => i.id !== id)
  } catch (e) {
    console.error('Error deleting idioma:', e)
  } finally {
    loadingIds.value.delete(id)
    closeDeleteConfirm()
  }
}
</script>

<template>
  <AdminLayout>
    <div class="page-header animado" style="--delay: 0ms">
      <h1 class="page-title">Idiomas</h1>
      <button class="btn btn-primary" @click="openCreateModal">+ Nuevo idioma</button>
    </div>
    <div class="page-body">
      <div v-if="loading" class="loading-state">Cargando idiomas...</div>
      <div v-else class="card animado" style="--delay: 80ms">
        <table class="tbl">
          <thead>
            <tr><th>#</th><th>Nombre</th><th>Acciones</th></tr>
          </thead>
          <TransitionGroup tag="tbody" name="rows" appear>
            <tr v-for="(idioma, index) in idiomas" :key="idioma.id" :style="{ '--row-delay': `${index * 40}ms` }">
              <td class="id-cell">{{ idioma.id }}</td>
              <td><strong>{{ idioma.nombre }}</strong></td>
              <td>
                <div class="action-group">
                  <button class="btn btn-ghost btn-sm" @click="openEditModal(idioma)">Editar</button>
                  <button class="btn btn-danger btn-sm" :disabled="loadingIds.has(idioma.id)" @click="openDeleteConfirm(idioma)">
                    {{ loadingIds.has(idioma.id) ? '...' : 'Eliminar' }}
                  </button>
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </div>
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">{{ editingIdioma ? 'Editar idioma' : 'Nuevo idioma' }}</h2>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <IdiomaForm :key="editingIdioma?.id ?? 'new'" :initial-data="editingIdioma ? { name: editingIdioma.nombre } : undefined" @saved="onSaved" @cancel="closeModal" />
          </div>
        </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="closeDeleteConfirm">
        <div class="modal-box modal-box--sm">
          <div class="modal-header"><h2 class="modal-title">Eliminar idioma</h2><button class="close-btn" @click="closeDeleteConfirm">✕</button></div>
          <div class="modal-body">
            <p class="confirm-text">¿Estás seguro de que deseas eliminar <strong>{{ deletingIdioma?.nombre }}</strong>?</p>
            <div class="confirm-actions"><button class="btn btn-danger" @click="confirmDelete">Sí, eliminar</button><button class="btn btn-ghost" @click="closeDeleteConfirm">Cancelar</button></div>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>
<style scoped>
/* Copied styles from CiudadesView.vue */
.page-header { padding: 24px 28px 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 26px; color: var(--text); font-weight: 400; }
.page-body { padding: 0 28px 28px; }
.loading-state { text-align: center; padding: 40px; color: var(--text2); font-family: 'Outfit', sans-serif; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.tbl { width: 100%; border-collapse: collapse; }
.tbl th { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border2); }
.tbl td { font-size: 13px; color: var(--text2); padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.tbl td strong { color: var(--text); font-weight: 500; }
.tbl tr:hover td { background: rgba(243, 113, 0, 0.03); }
.tbl th:last-child,
.tbl td:last-child {
  text-align: right;
}
.id-cell { color: var(--text3); font-size: 12px; width: 40px; }
.action-group { display: flex; gap: 6px; justify-content: flex-end; }
.btn { border: none; cursor: pointer; font-family: 'Outfit', sans-serif; border-radius: var(--radius); font-weight: 600; font-size: 14px; transition: opacity 0.2s; }
.btn-primary { background: var(--sinopia); color: #fff; padding: 9px 18px; }
.btn-primary:hover { opacity: 0.88; }
.btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); padding: 6px 14px; }
.btn-ghost:hover { background: var(--bg); }
.btn-danger { background: var(--sinopia); color: #fff; padding: 6px 14px; opacity: 0.9; }
.btn-danger:hover { opacity: 1; }
.btn-sm { font-size: 12px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(42, 10, 6, 0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; }
.modal-box { background: var(--surface); border: 1px solid var(--border2); border-radius: 12px; width: 100%; max-width: 440px; max-height: 90vh; overflow-y: auto; }
.modal-box--sm { max-width: 380px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid var(--border); }
.modal-title { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--text); font-weight: 400; }
.close-btn { background: none; border: none; font-size: 16px; color: var(--text3); cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: color 0.2s; font-family: 'Outfit', sans-serif; }
.close-btn:hover { color: var(--text); }
.modal-body { padding: 24px; }
.confirm-text { font-size: 14px; color: var(--text2); line-height: 1.55; margin-bottom: 20px; }
.confirm-text strong { color: var(--text); }
.confirm-actions { display: flex; gap: 10px; }

/* ── Animaciones ── */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.animado {
  opacity: 0;
  animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--delay, 0ms);
}
.rows-enter-active {
  animation: slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--row-delay, 0ms);
  opacity: 0;
}
.rows-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.rows-leave-to { opacity: 0; transform: scale(0.97); }
.rows-move { transition: transform 0.3s ease; }
</style>
