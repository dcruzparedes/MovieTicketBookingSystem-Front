<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'
import { getCupones, nuevoCupon, actualizarCupon, eliminarCupon, cambiarEstadoCupon } from '@/services/cuponesService'


interface Cupon{
    id: number
    codigo: string
    tipo: string
    valor: number
    fecha_expiracion: string
    usos_maximos: number
    usos_actuales: number
    activo: boolean
}

const cupones = ref<Cupon[]>([])
const loadError = ref('')

async function getAllCupones(){
  try{
    cupones.value = await getCupones();
  }catch(error){
    loadError.value = error instanceof Error ? error.message : 'Error al cargar los cupones'
  }
}

onMounted(getAllCupones);

const showModal = ref(false)
const editingCupon = ref<Cupon | null>(null)
const isSaving = ref(false)
const formError = ref('')

async function toggleActive(cupon: Cupon, valor: boolean){
  try{
    await cambiarEstadoCupon(cupon.id, valor);
    cupon.activo = valor;
  }catch(error){
    throw new Error(`Error: ${error}`)
  }
}

const nuevoForm = ref({
  codigo: '',
  tipo: 'Porcentaje',
  valor: null as number | null,
  fecha_expiracion: '',
  usos_maximos: null as number | null,
})

function openCreateModal() {
  editingCupon.value = null
  formError.value = ''
  nuevoForm.value = { codigo: '', tipo: 'Porcentaje', valor: null, fecha_expiracion: '', usos_maximos: null }
  showModal.value = true
}

function openEditModal(cupon: Cupon) {
  editingCupon.value = cupon
  formError.value = ''
  nuevoForm.value = {
    codigo: cupon.codigo,
    tipo: cupon.tipo,
    valor: cupon.valor,
    fecha_expiracion: cupon.fecha_expiracion.slice(0, 10),
    usos_maximos: cupon.usos_maximos,
  }
  showModal.value = true
}

function closeModal() {
  if (isSaving.value) return
  showModal.value = false
  editingCupon.value = null
  formError.value = ''
}

async function guardarCupon() {
  if (!nuevoForm.value.codigo || !nuevoForm.value.valor || !nuevoForm.value.fecha_expiracion || !nuevoForm.value.usos_maximos) return;
  isSaving.value = true
  formError.value = ''
  try{
      if (editingCupon.value) {
        const actualizado = await actualizarCupon(editingCupon.value.id, {
          codigo: nuevoForm.value.codigo,
          tipo: nuevoForm.value.tipo,
          valor: Number(nuevoForm.value.valor),
          fecha_expiracion: nuevoForm.value.fecha_expiracion,
          usos_maximos: Number(nuevoForm.value.usos_maximos),
        });
        Object.assign(editingCupon.value, actualizado)
      } else {
        await nuevoCupon({
          codigo: nuevoForm.value.codigo,
          tipo: nuevoForm.value.tipo,
          valor: Number(nuevoForm.value.valor),
          fecha_expiracion: nuevoForm.value.fecha_expiracion,
          usos_maximos: Number(nuevoForm.value.usos_maximos),
          activo: true
        });
        await getAllCupones();
      }
      isSaving.value = false
      closeModal();
  }catch(error){
    formError.value = error instanceof Error ? error.message : 'Error al guardar el cupón'
  }finally{
    isSaving.value = false
  }
}

// ── Confirmación de eliminación ──
const showDeleteConfirm = ref(false)
const deletingCupon = ref<Cupon | null>(null)
const isDeleting = ref(false)
const deleteError = ref('')

function openDeleteConfirm(cupon: Cupon) {
  deletingCupon.value = cupon
  deleteError.value = ''
  showDeleteConfirm.value = true
}

function closeDeleteConfirm() {
  if (isDeleting.value) return
  showDeleteConfirm.value = false
  deletingCupon.value = null
  deleteError.value = ''
}

async function confirmDelete() {
  if (!deletingCupon.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    await eliminarCupon(deletingCupon.value.id)
    cupones.value = cupones.value.filter((c) => c.id !== deletingCupon.value!.id)
    isDeleting.value = false
    closeDeleteConfirm()
  } catch (error) {
    deleteError.value = error instanceof Error
      ? error.message
      : 'No se puede eliminar este cupón porque ya fue usado en algún pago.'
  } finally {
    isDeleting.value = false
  }
}

const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => Math.ceil(cupones.value.length / itemsPerPage))

const cuponesPaginados = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return cupones.value.slice(start, end)
})

function setPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}
</script>

<template>
    <AdminLayout>
    <!-- CUPONES -->
    <div id="admin-cupones">
    <div class="admin-header animado" style="--delay: 0ms">
    <div class="admin-page-title">Cupones</div>
    <button class="btn btn-primary btn-sm" @click="openCreateModal">+ Nuevo cupón</button></div>
    <p v-if="loadError" style="color:var(--sinopia);font-size:13px;margin:0 28px 12px;">{{ loadError }}</p>
    <div class="admin-body">
        <div class="card animado" style="--delay: 80ms"><div class="card-body" style="padding:0">
        <table class="tbl">
            <thead><tr><th>Código</th><th>Tipo</th><th>Valor</th><th>Vencimiento</th><th>Usos</th><th>Estado</th><th>Acciones</th></tr></thead>
            <TransitionGroup tag="tbody" name="rows" appear>
                <tr v-for="(cupon, index) in cuponesPaginados" :key="cupon.id" :style="{ '--row-delay': `${index * 40}ms` }">
                    <td><strong style="font-family:'DM Mono',monospace">{{cupon.codigo}}</strong></td><td>{{cupon.tipo}}</td><td>{{cupon.valor}}</td><td>{{cupon.fecha_expiracion}}</td><td>{{cupon.usos_actuales}} / {{cupon.usos_maximos}}</td><td>
                        <ToggleSwitch
                        :model-value="cupon.activo"
                        @update:model-value="(valor) => toggleActive(cupon, valor)"></ToggleSwitch></td>
                    <td>
                        <div style="display:flex;gap:6px">
                            <button class="btn btn-ghost btn-sm" @click="openEditModal(cupon)">Editar</button>
                            <button class="btn btn-danger btn-sm" @click="openDeleteConfirm(cupon)">Eliminar</button>
                        </div>
                    </td>
                </tr>
            </TransitionGroup>
        </table>
        </div>
    </div>
    <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage === 1" @click="setPage(currentPage - 1)">
        ‹
        </button>
        <button
        v-for="page in totalPages"
        :key="page"
        class="page-btn"
        :class="{ active: currentPage === page }"
        @click="setPage(page)"
        >
        {{ page }}
        </button>
        <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="setPage(currentPage + 1)"
        >
        ›
        </button>
    </div>
    </div>
    </div>

    <!-- FORMULARIO CUPÓN -->
    <Teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-box">
    <div class="modal-header">
    <div class="modal-title">{{ editingCupon ? 'Editar cupón' : 'Nuevo cupón' }}</div>
    <button class="close-btn" @click="closeModal">✕</button>
    </div>
    <div class="modal-body">
        <div class="card"><div class="card-body">
        <p v-if="formError" class="field-error" style="margin-bottom:12px">{{ formError }}</p>
        <div class="field">
            <label>Código</label>
            <input v-model="nuevoForm.codigo" placeholder="ej. VERANO50" style="font-family:'DM Mono',monospace;letter-spacing:1px" />
        </div>
        <div class="field-row">
            <div class="field">
                <label>Tipo</label>
                <select v-model="nuevoForm.tipo">
                    <option>Porcentaje</option>
                    <option>Monto fijo</option>
                </select>
            </div>
            <div class="field">
                <label>Valor</label>
                <input v-model.number="nuevoForm.valor" type="number" min="1" placeholder="20" />
            </div>
        </div>
        <div class="field-row">
            <div class="field">
                <label>Vencimiento</label>
                <input v-model="nuevoForm.fecha_expiracion" type="date" />
            </div>
            <div class="field">
                <label>Usos máximos</label>
                <input v-model.number="nuevoForm.usos_maximos" type="number" min="1" placeholder="500" />
            </div>
        </div>
        <div style="display:flex;gap:10px">
            <button class="btn btn-primary" :disabled="isSaving" @click="guardarCupon">{{ isSaving ? 'Guardando…' : 'Guardar cupón' }}</button>
            <button class="btn btn-ghost" :disabled="isSaving" @click="closeModal">Cancelar</button>
        </div>
        </div></div>
    </div>
    </div>
    </div>
    </Teleport>

    <!-- CONFIRMACIÓN DE ELIMINACIÓN -->
    <Teleport to="body">
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="closeDeleteConfirm">
    <div class="modal-box" style="max-width:380px">
    <div class="modal-header">
    <div class="modal-title">Eliminar cupón</div>
    <button class="close-btn" @click="closeDeleteConfirm">✕</button>
    </div>
    <div class="modal-body">
        <p style="font-size:14px;color:var(--text2);line-height:1.55;margin-bottom:16px">
            ¿Estás seguro de que deseas eliminar el cupón <strong style="color:var(--text)">{{ deletingCupon?.codigo }}</strong>? Esta acción no se puede deshacer.
        </p>
        <p v-if="deleteError" class="field-error" style="margin-bottom:12px">{{ deleteError }}</p>
        <div style="display:flex;gap:10px">
            <button class="btn btn-danger" :disabled="isDeleting" @click="confirmDelete">{{ isDeleting ? 'Eliminando…' : 'Sí, eliminar' }}</button>
            <button class="btn btn-ghost" :disabled="isDeleting" @click="closeDeleteConfirm">Cancelar</button>
        </div>
    </div>
    </div>
    </div>
    </Teleport>
    </AdminLayout>
</template>

<style scoped>
.status-label {
  font-size: 12px;
  font-weight: 500;
}

.status-label.active {
  color: var(--success);
}

.status-label.inactive {
  color: var(--text3);
}

.admin-header { padding: 24px 28px 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; overflow-y: auto;}
.admin-page-title { font-family: 'DM Serif Display', serif; font-size: 26px; color: var(--text); }
.admin-body { padding: 0 28px 28px; }
.page-header {
  padding: 24px 28px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-family: 'DM Serif Display', serif;
  font-size: 26px;
  color: var(--text);
  font-weight: 400;
}

.page-body {
  padding: 0 28px 28px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

/* Table */
.tbl {
  width: 100%;
  border-collapse: collapse;
}

.tbl th {
  font-size: 11px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border2);
}

.tbl td {
  font-size: 13px;
  color: var(--text2);
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.tbl td strong {
  color: var(--text);
  font-weight: 500;
}

.tbl tr:last-child td {
  border-bottom: none;
}

.tbl tr:hover td {
  background: rgba(243, 113, 0, 0.03);
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-size: 12px;
  font-weight: 500;
}

.status-label.active {
  color: var(--success);
}

.status-label.inactive {
  color: var(--text3);
}

/* Buttons */
.btn {
  border: none;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 14px;
  transition: opacity 0.2s;
}

.btn-primary {
  background: var(--sinopia);
  color: #fff;
  padding: 9px 18px;
}

.btn-primary:hover {
  opacity: 0.88;
}

.btn-ghost {
  background: transparent;
  color: var(--text2);
  border: 1px solid var(--border2);
  padding: 6px 14px;
}

.btn-ghost:hover {
  background: var(--bg);
}

.btn-danger {
  background: var(--sinopia);
  color: #fff;
  padding: 6px 14px;
  opacity: 0.9;
}

.btn-danger:hover {
  opacity: 1;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  font-size: 12px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(42, 10, 6, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.modal-box {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-family: 'DM Serif Display', serif;
  font-size: 20px;
  color: var(--text);
  font-weight: 400;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--text3);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.2s;
  font-family: 'Outfit', sans-serif;
}

.close-btn:hover {
  color: var(--text);
}

.modal-body {
  padding: 24px;
}

.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
.card-body { padding: 20px; }

.field { margin-bottom: 16px; }
.field label { display: block; font-size: 12px; color: var(--text2); margin-bottom: 5px; font-weight: 500; }
.field input, .field select, .field textarea {
  width: 100%; background: var(--bg); border: 1px solid var(--border2);
  color: var(--text); padding: 10px 13px; border-radius: var(--radius);
  font-size: 14px; font-family: 'Outfit', sans-serif; outline: none;
}
.field input:focus, .field select:focus { border-color: var(--tangelo); }
.field input::placeholder, .field textarea::placeholder { color: var(--text3); }
.field select option { background: #fff; }
.field textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field-error { font-size: 11px; color: var(--sinopia); margin-top: 4px; }
.field-success { font-size: 11px; color: var(--success); margin-top: 4px; }

.pagination {
  display: flex;
  gap: 5px;
  margin-top: 16px;
  padding: 0 14px;
  align-items: center;
}

.page-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text2);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
}

.page-btn:hover:not(.active) {
  background: var(--bg);
}

.page-btn.active {
  background: var(--sinopia);
  color: #fff;
  border-color: var(--sinopia);
  font-weight: 700;
}

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