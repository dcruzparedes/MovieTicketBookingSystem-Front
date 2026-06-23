<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import GeneroForm from '@/components/admin/GeneroForm.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'

interface Genero {
  id: number
  name: string
  active: boolean
}

const generos = ref<Genero[]>([
  { id: 1, name: 'Acción', active: true },
  { id: 2, name: 'Comedia', active: true },
  { id: 3, name: 'Drama', active: true },
  { id: 4, name: 'Terror', active: false },
])

const loadingIds = ref(new Set<number>())
const showModal = ref(false)
const editingGenero = ref<Genero | null>(null)

function openCreateModal() { editingGenero.value = null; showModal.value = true }
function openEditModal(genero: Genero) { editingGenero.value = genero; showModal.value = true }
function closeModal() { showModal.value = false; editingGenero.value = null }

function onSaved(data: { name: string }) {
  if (editingGenero.value) {
    editingGenero.value.name = data.name
  } else {
    generos.value.push({ id: Date.now(), name: data.name, active: true })
  }
  closeModal()
}

const showDeleteConfirm = ref(false)
const deletingGenero = ref<Genero | null>(null)

function openDeleteConfirm(genero: Genero) { deletingGenero.value = genero; showDeleteConfirm.value = true }
function closeDeleteConfirm() { showDeleteConfirm.value = false; deletingGenero.value = null }
function confirmDelete() {
  if (!deletingGenero.value) return
  generos.value = generos.value.filter((g) => g.id !== deletingGenero.value!.id)
  closeDeleteConfirm()
}

async function toggleActive(genero: Genero) {
  loadingIds.value.add(genero.id)
  const previous = genero.active
  genero.active = !genero.active
  try {
    await new Promise((r) => setTimeout(r, 600))
  } catch {
    genero.active = previous
  } finally {
    loadingIds.value.delete(genero.id)
  }
}
</script>

<template>
  <AdminLayout>
    <div class="page-header animado" style="--delay: 0ms">
      <h1 class="page-title">Géneros</h1>
      <button class="btn btn-primary" @click="openCreateModal">+ Nuevo género</button>
    </div>
    <div class="page-body">
      <div class="card animado" style="--delay: 80ms">
        <table class="tbl">
          <thead>
            <tr><th>#</th><th>Nombre</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <TransitionGroup tag="tbody" name="rows" appear>
            <tr v-for="(genero, index) in generos" :key="genero.id" :style="{ '--row-delay': `${index * 40}ms` }">
              <td class="id-cell">{{ genero.id }}</td>
              <td><strong>{{ genero.name }}</strong></td>
              <td>
                <div class="status-cell">
                  <ToggleSwitch :model-value="genero.active" :loading="loadingIds.has(genero.id)" @update:model-value="toggleActive(genero)" />
                  <span class="status-label" :class="genero.active ? 'active' : 'inactive'">{{ genero.active ? 'Activo' : 'Inactivo' }}</span>
                </div>
              </td>
              <td>
                <div class="action-group">
                  <button class="btn btn-ghost btn-sm" @click="openEditModal(genero)">Editar</button>
                  <button class="btn btn-danger btn-sm" @click="openDeleteConfirm(genero)">Eliminar</button>
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
            <h2 class="modal-title">{{ editingGenero ? 'Editar género' : 'Nuevo género' }}</h2>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <GeneroForm :key="editingGenero?.id ?? 'new'" :initial-data="editingGenero ? { name: editingGenero.name } : undefined" @saved="onSaved" @cancel="closeModal" />
          </div>
        </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="closeDeleteConfirm">
        <div class="modal-box modal-box--sm">
          <div class="modal-header"><h2 class="modal-title">Eliminar género</h2><button class="close-btn" @click="closeDeleteConfirm">✕</button></div>
          <div class="modal-body">
            <p class="confirm-text">¿Estás seguro de que deseas eliminar <strong>{{ deletingGenero?.name }}</strong>?</p>
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
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.tbl { width: 100%; border-collapse: collapse; }
.tbl th { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border2); }
.tbl td { font-size: 13px; color: var(--text2); padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.tbl td strong { color: var(--text); font-weight: 500; }
.tbl tr:hover td { background: rgba(243, 113, 0, 0.03); }
.id-cell { color: var(--text3); font-size: 12px; width: 40px; }
.status-cell { display: flex; align-items: center; gap: 8px; }
.status-label { font-size: 12px; font-weight: 500; }
.status-label.active { color: var(--success); }
.status-label.inactive { color: var(--text3); }
.action-group { display: flex; gap: 6px; }
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
