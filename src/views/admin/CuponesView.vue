<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'


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

const Cups: Cupon[]=[
    {
        id: 1,
        codigo: "CP-1",
        tipo: "Monto fijo",
        valor: 34,
        fecha_expiracion: "5/23/2026",
        usos_maximos: 4,
        usos_actuales: 0,
        activo: true
    },
    {
        id: 2,
        codigo: "CP-2",
        tipo: "Monto fijo",
        valor: 34,
        fecha_expiracion: "5/23/2026",
        usos_maximos: 6,
        usos_actuales: 0,
        activo: true
    },
    {
        id: 3,
        codigo: "CP-3",
        tipo: "Monto fijo",
        valor: 34,
        fecha_expiracion: "5/23/2026",
        usos_maximos: 2,
        usos_actuales: 0,
        activo: true
    }
]

const cupones = ref<Cupon[]>(Cups)

const showModal = ref(false)

function toggleActive(cupon: Cupon, valor: boolean){
    cupon.activo=valor
}

const nuevoForm = ref({
  codigo: '',
  tipo: 'Porcentaje',
  valor: null as number | null,
  fecha_expiracion: '',
  usos_maximos: null as number | null,
})

function agregarCupon() {
  if (!nuevoForm.value.codigo || !nuevoForm.value.valor || !nuevoForm.value.fecha_expiracion || !nuevoForm.value.usos_maximos) return

  cupones.value.push({
    id: Date.now(),
    codigo: nuevoForm.value.codigo,
    tipo: nuevoForm.value.tipo,
    valor: nuevoForm.value.valor,
    fecha_expiracion: nuevoForm.value.fecha_expiracion,
    usos_maximos: nuevoForm.value.usos_maximos,
    usos_actuales: 0,
    activo: true,
  })

  nuevoForm.value = { codigo: '', tipo: 'Porcentaje', valor: null, fecha_expiracion: '', usos_maximos: null }
  showModal.value = false
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
    <button class="btn btn-primary btn-sm" @click="showModal = true">+ Nuevo cupón</button></div>
    <div class="admin-body">
        <div class="card animado" style="--delay: 80ms"><div class="card-body" style="padding:0">
        <table class="tbl">
            <thead><tr><th>Código</th><th>Tipo</th><th>Valor</th><th>Vencimiento</th><th>Usos</th><th>Estado</th></tr></thead>
            <TransitionGroup tag="tbody" name="rows" appear>
                <tr v-for="(cupon, index) in cuponesPaginados" :key="cupon.id" :style="{ '--row-delay': `${index * 40}ms` }">
                    <td><strong style="font-family:'DM Mono',monospace">{{cupon.codigo}}</strong></td><td>{{cupon.tipo}}</td><td>{{cupon.valor}}</td><td>{{cupon.fecha_expiracion}}</td><td>{{cupon.usos_actuales}} / {{cupon.usos_maximos}}</td><td>
                        <ToggleSwitch 
                        :model-value="cupon.activo" 
                        @update:model-value="(valor) => toggleActive(cupon, valor)"></ToggleSwitch></td>
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
    <div v-if="showModal" class="modal-overlay">
    <div class="modal-box">
    <div class="modal-header">
    <div class="modal-title">Nuevo cupon</div>
    <button class="close-btn"  @click="showModal = false">✕</button>
    </div>
    <div class="modal-body">
        <div class="card"><div class="card-body">
        <div class="field">
            <label>Código</label>
            <input v-model="nuevoForm.codigo" placeholder="ej. VERANO50" style="font-family:'DM Mono',monospace;letter-spacing:1px" />
        </div>
        <div class="field-row">
            <div class="field">
                <label>Tipo</label>
                <select>
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
            <button class="btn btn-primary"  @click="agregarCupon">Guardar cupón</button>
            <button class="btn btn-ghost" @click="showModal = false">Cancelar</button>
        </div>
        </div></div>
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