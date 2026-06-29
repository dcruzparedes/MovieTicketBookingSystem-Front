<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import {
  listarTodosUsuarios,
  adminCrearUsuario,
  actualizarRolUsuario,
  type UsuarioAdmin,
} from '@/services/usuarioService'
import { listarRoles, type Rol } from '@/services/rolService'

// ── Estado ──────────────────────────────────────────────────────
const usuarios = ref<UsuarioAdmin[]>([])
const roles = ref<Rol[]>([])
const loading = ref(false)
const error = ref('')

const meta = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })
const paginaActual = ref(1)
const busqueda = ref('')

// ── Carga de datos ───────────────────────────────────────────────
async function cargarUsuarios(pagina = 1) {
  loading.value = true
  error.value = ''
  try {
    const res = await listarTodosUsuarios({ q: busqueda.value || undefined, page: pagina, limit: 20 })
    usuarios.value = res.data
    meta.value = res.meta
    paginaActual.value = pagina
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al cargar usuarios'
  } finally {
    loading.value = false
  }
}

async function cargarRoles() {
  try {
    roles.value = await listarRoles()
  } catch {
    // roles estáticos como fallback
  }
}

onMounted(() => {
  cargarRoles()
  cargarUsuarios()
})

function buscar() {
  cargarUsuarios(1)
}

// ── Modal: Crear usuario ─────────────────────────────────────────
const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref('')

const createForm = reactive({
  nombre: '',
  email: '',
  password: '',
  telefono: '',
  rolId: 0,
})
const createErrors = reactive({ nombre: '', email: '', password: '', rolId: '' })

function openCreateModal() {
  createForm.nombre = ''
  createForm.email = ''
  createForm.password = ''
  createForm.telefono = ''
  createForm.rolId = roles.value[0]?.id ?? 0
  createErrors.nombre = ''
  createErrors.email = ''
  createErrors.password = ''
  createErrors.rolId = ''
  createError.value = ''
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

function validateCreate(): boolean {
  createErrors.nombre = createForm.nombre.trim() ? '' : 'El nombre es requerido'
  createErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email) ? '' : 'Email inválido'
  createErrors.password = createForm.password.length >= 8 ? '' : 'Mínimo 8 caracteres'
  createErrors.rolId = createForm.rolId ? '' : 'Selecciona un rol'
  return !createErrors.nombre && !createErrors.email && !createErrors.password && !createErrors.rolId
}

async function submitCreate() {
  if (!validateCreate()) return
  createLoading.value = true
  createError.value = ''
  try {
    const nuevo = await adminCrearUsuario({
      nombre: createForm.nombre,
      email: createForm.email,
      password: createForm.password,
      telefono: createForm.telefono || undefined,
      rolId: Number(createForm.rolId),
    })
    usuarios.value.unshift(nuevo)
    meta.value.total++
    closeCreateModal()
  } catch (e: unknown) {
    createError.value = e instanceof Error ? e.message : 'Error al crear usuario'
  } finally {
    createLoading.value = false
  }
}

// ── Modal: Cambiar rol ───────────────────────────────────────────
const showRolModal = ref(false)
const rolLoading = ref(false)
const rolError = ref('')
const editingUsuario = ref<UsuarioAdmin | null>(null)
const nuevoRolId = ref(0)

function openRolModal(u: UsuarioAdmin) {
  editingUsuario.value = u
  nuevoRolId.value = Number(roles.value.find((r) => r.nombre === u.roles.nombre)?.id ?? 0)
  rolError.value = ''
  showRolModal.value = true
}

function closeRolModal() {
  showRolModal.value = false
  editingUsuario.value = null
}

async function submitRol() {
  if (!editingUsuario.value || !nuevoRolId.value) return
  rolLoading.value = true
  rolError.value = ''
  try {
    const actualizado = await actualizarRolUsuario(editingUsuario.value.id, Number(nuevoRolId.value))
    const idx = usuarios.value.findIndex((u) => u.id === editingUsuario.value!.id)
    if (idx !== -1) usuarios.value[idx] = { ...usuarios.value[idx], roles: actualizado.roles }
    closeRolModal()
  } catch (e: unknown) {
    rolError.value = e instanceof Error ? e.message : 'Error al cambiar rol'
  } finally {
    rolLoading.value = false
  }
}

// ── Helpers ──────────────────────────────────────────────────────
function rolLabel(nombre: string) {
  const mapa: Record<string, string> = {
    admin: 'Admin',
    administrador: 'Admin',
    recepcionista: 'Recepcionista',
    usuario: 'Usuario',
    cliente: 'Cliente',
  }
  return mapa[nombre.toLowerCase()] ?? nombre
}

function estadoClass(estado: string) {
  return {
    'badge--activo': estado === 'activo',
    'badge--inactivo': estado === 'inactivo',
    'badge--pendiente': estado === 'pendiente',
    'badge--bloqueado': estado === 'bloqueado',
  }
}
</script>

<template>
  <AdminLayout>
    <!-- Header -->
    <div class="page-header animado" style="--delay: 0ms">
      <div>
        <h1 class="page-title">Usuarios y roles</h1>
        <p class="page-subtitle">Gestión de usuarios y asignación de roles</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">+ Nuevo usuario</button>
    </div>

    <!-- Filtro -->
    <div class="filter-bar animado" style="--delay: 60ms">
      <input
        v-model="busqueda"
        class="search-input"
        type="text"
        placeholder="Buscar por nombre, email o teléfono…"
        @keydown.enter="buscar"
      />
      <button class="btn btn-ghost" @click="buscar">Buscar</button>
    </div>

    <!-- Tabla -->
    <div class="page-body">
      <div class="card animado" style="--delay: 120ms">
        <div v-if="loading" class="empty-state">Cargando…</div>
        <div v-else-if="error" class="empty-state error-text">{{ error }}</div>
        <table v-else class="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="rows" appear>
            <tr v-for="(u, index) in usuarios" :key="u.id" :style="{ '--row-delay': `${index * 30}ms` }">
              <td class="id-cell">{{ u.id }}</td>
              <td><strong>{{ u.nombre }}</strong></td>
              <td class="muted">{{ u.email }}</td>
              <td class="muted">{{ u.telefono ?? '—' }}</td>
              <td><span class="rol-chip">{{ rolLabel(u.roles.nombre) }}</span></td>
              <td><span class="badge" :class="estadoClass(u.estado)">{{ u.estado }}</span></td>
              <td>
                <button class="btn btn-ghost btn-sm" @click="openRolModal(u)">Cambiar rol</button>
              </td>
            </tr>
          </TransitionGroup>
          <tbody v-if="!loading && usuarios.length === 0">
            <tr><td colspan="7" class="empty-state">No se encontraron usuarios</td></tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div v-if="meta.totalPages > 1" class="pagination">
          <button class="btn btn-ghost btn-sm" :disabled="paginaActual <= 1" @click="cargarUsuarios(paginaActual - 1)">← Anterior</button>
          <span class="page-info">Página {{ paginaActual }} de {{ meta.totalPages }} ({{ meta.total }} usuarios)</span>
          <button class="btn btn-ghost btn-sm" :disabled="paginaActual >= meta.totalPages" @click="cargarUsuarios(paginaActual + 1)">Siguiente →</button>
        </div>
      </div>
    </div>

    <!-- Modal: Nuevo usuario -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">Nuevo usuario</h2>
            <button class="close-btn" @click="closeCreateModal">✕</button>
          </div>
          <div class="modal-body">
            <form novalidate @submit.prevent="submitCreate">
              <div class="field">
                <label>Nombre completo</label>
                <input v-model="createForm.nombre" type="text" placeholder="ej. Juan Pérez" :class="{ 'input-error': createErrors.nombre }" autofocus />
                <span v-if="createErrors.nombre" class="field-error">{{ createErrors.nombre }}</span>
              </div>
              <div class="field">
                <label>Email</label>
                <input v-model="createForm.email" type="email" placeholder="juan@correo.com" :class="{ 'input-error': createErrors.email }" />
                <span v-if="createErrors.email" class="field-error">{{ createErrors.email }}</span>
              </div>
              <div class="field">
                <label>Contraseña</label>
                <input v-model="createForm.password" type="password" placeholder="Mínimo 8 caracteres" :class="{ 'input-error': createErrors.password }" />
                <span v-if="createErrors.password" class="field-error">{{ createErrors.password }}</span>
              </div>
              <div class="field">
                <label>Teléfono <span class="optional">(opcional)</span></label>
                <input v-model="createForm.telefono" type="text" placeholder="+50499998888" />
              </div>
              <div class="field">
                <label>Rol</label>
                <select v-model="createForm.rolId" :class="{ 'input-error': createErrors.rolId }">
                  <option disabled :value="0">Selecciona un rol</option>
                  <option v-for="rol in roles" :key="rol.id" :value="rol.id">{{ rolLabel(rol.nombre) }}</option>
                </select>
                <span v-if="createErrors.rolId" class="field-error">{{ createErrors.rolId }}</span>
              </div>
              <p v-if="createError" class="api-error">{{ createError }}</p>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="createLoading">
                  {{ createLoading ? 'Creando…' : 'Crear usuario' }}
                </button>
                <button type="button" class="btn btn-ghost" @click="closeCreateModal">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Cambiar rol -->
    <Teleport to="body">
      <div v-if="showRolModal" class="modal-overlay" @click.self="closeRolModal">
        <div class="modal-box modal-box--sm">
          <div class="modal-header">
            <h2 class="modal-title">Cambiar rol</h2>
            <button class="close-btn" @click="closeRolModal">✕</button>
          </div>
          <div class="modal-body">
            <p class="confirm-text">
              Cambiando rol de <strong>{{ editingUsuario?.nombre }}</strong>
            </p>
            <form novalidate @submit.prevent="submitRol">
              <div class="field">
                <label>Nuevo rol</label>
                <select v-model="nuevoRolId">
                  <option v-for="rol in roles" :key="rol.id" :value="rol.id">{{ rolLabel(rol.nombre) }}</option>
                </select>
              </div>
              <p v-if="rolError" class="api-error">{{ rolError }}</p>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="rolLoading">
                  {{ rolLoading ? 'Guardando…' : 'Guardar' }}
                </button>
                <button type="button" class="btn btn-ghost" @click="closeRolModal">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<style scoped>
.page-header { padding: 24px 28px 0; display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 26px; color: var(--text); font-weight: 400; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: var(--text3); margin: 0; }
.filter-bar { padding: 0 28px 16px; display: flex; gap: 10px; }
.search-input { flex: 1; background: var(--surface); border: 1px solid var(--border2); color: var(--text); padding: 9px 13px; border-radius: var(--radius); font-size: 14px; font-family: 'Outfit', sans-serif; outline: none; transition: border-color 0.2s; }
.search-input:focus { border-color: var(--tangelo); }
.page-body { padding: 0 28px 28px; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.tbl { width: 100%; border-collapse: collapse; }
.tbl th { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border2); }
.tbl td { font-size: 13px; color: var(--text2); padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.tbl td strong { color: var(--text); font-weight: 500; }
.tbl tr:hover td { background: rgba(243, 113, 0, 0.03); }
.id-cell { color: var(--text3); font-size: 12px; width: 60px; }
.muted { color: var(--text3); font-size: 12px; }
.rol-chip { background: rgba(243, 113, 0, 0.1); color: var(--tangelo); font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; text-transform: capitalize; }
.badge { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; text-transform: capitalize; }
.badge--activo { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
.badge--inactivo { background: rgba(100, 116, 139, 0.12); color: var(--text3); }
.badge--pendiente { background: rgba(234, 179, 8, 0.12); color: #b45309; }
.badge--bloqueado { background: rgba(239, 68, 68, 0.12); color: #dc2626; }
.empty-state { padding: 40px; text-align: center; color: var(--text3); font-size: 14px; }
.error-text { color: var(--sinopia); }
.pagination { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid var(--border); }
.page-info { font-size: 12px; color: var(--text3); }

/* Botones */
.btn { border: none; cursor: pointer; font-family: 'Outfit', sans-serif; border-radius: var(--radius); font-weight: 600; font-size: 14px; transition: opacity 0.2s; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--sinopia); color: #fff; padding: 9px 18px; }
.btn-primary:hover:not(:disabled) { opacity: 0.88; }
.btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); padding: 6px 14px; }
.btn-ghost:hover:not(:disabled) { background: var(--bg); }
.btn-danger { background: var(--sinopia); color: #fff; padding: 6px 14px; opacity: 0.9; }
.btn-danger:hover { opacity: 1; }
.btn-sm { font-size: 12px; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(42, 10, 6, 0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; }
.modal-box { background: var(--surface); border: 1px solid var(--border2); border-radius: 12px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
.modal-box--sm { max-width: 380px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid var(--border); }
.modal-title { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--text); font-weight: 400; margin: 0; }
.close-btn { background: none; border: none; font-size: 16px; color: var(--text3); cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: color 0.2s; font-family: 'Outfit', sans-serif; }
.close-btn:hover { color: var(--text); }
.modal-body { padding: 24px; }

/* Form */
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 12px; color: var(--text2); margin-bottom: 5px; font-weight: 500; }
.field input, .field select {
  width: 100%; background: var(--bg); border: 1px solid var(--border2); color: var(--text);
  padding: 10px 13px; border-radius: var(--radius); font-size: 14px; font-family: 'Outfit', sans-serif;
  outline: none; transition: border-color 0.2s; box-sizing: border-box;
}
.field input:focus, .field select:focus { border-color: var(--tangelo); }
.field input.input-error, .field select.input-error { border-color: var(--sinopia); }
.field-error { display: block; font-size: 11px; color: var(--sinopia); margin-top: 4px; }
.optional { font-weight: 400; color: var(--text3); }
.api-error { font-size: 13px; color: var(--sinopia); margin-bottom: 12px; }
.form-actions { display: flex; gap: 10px; margin-top: 4px; }
.confirm-text { font-size: 14px; color: var(--text2); margin-bottom: 16px; line-height: 1.5; }
.confirm-text strong { color: var(--text); }

/* Animaciones */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.animado { opacity: 0; animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; animation-delay: var(--delay, 0ms); }
.rows-enter-active { animation: slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards; animation-delay: var(--row-delay, 0ms); opacity: 0; }
.rows-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.rows-leave-to { opacity: 0; transform: scale(0.97); }
.rows-move { transition: transform 0.3s ease; }
</style>
