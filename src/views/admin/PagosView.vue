<script setup lang="ts">
import { watch, ref, computed, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { getPaymentHistory } from '@/services/pagosService'


interface PaymentHistoy {
    pagos: Pago[],
    reembolsos: Reembolso[]
}

interface Pago{
  id: number,
  metodo: string,
  monto_final: number,
  estado: 'Completado' | 'Reembolsado',
  referencia_externa: string,
  created_at: string,
  reservas: reservas
}

interface Reembolso {
    id: number,
    id_pago: number         
    monto: number,
    estado: 'Pendiente' | 'Aprobado' | 'Rechazado',
    fecha_procesado: string,
    created_at: string
}

interface reservas {
    usuarios: usuarios
}

interface usuarios {
    email: string
}

interface PaymentHistoryFiltersFilter {
    estado_pagos?: string,
    estado_reembolsos?: string,
    fecha_limite_pagos?: Date,
    fecha_limite_reembolsos?: Date
}

const paymenHistory = ref<PaymentHistoy>()
const pagos = ref<Pago[]>([])

async function getPagos() {
  try{
    paymenHistory.value = await getPaymentHistory({...filters.value});
    pagos.value = paymenHistory.value.pagos
  }catch(error){
    throw new Error(`Error: ${error}`);
  }
}

onMounted(getPagos)

const filters = ref<PaymentHistoryFiltersFilter>({})

watch(
  filters,
  () => {
    getPagos();    
  },
  {deep: true}
)

function formatFecha(fechaISO: string): string {
  return new Date(fechaISO).toLocaleDateString('es-HN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

const pagosP = computed(() =>
  pagos.value
    .filter(p => p.estado === 'Completado')
    .reduce((acc, p) => acc + Number(p.monto_final), 0)
)

const pagosR = computed(() =>
  pagos.value
    .filter(p => p.estado === 'Reembolsado')
    .reduce((acc, p) => acc + Number(p.monto_final), 0)
)

const pagosN = computed(() => pagosP.value - pagosR.value)

const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => Math.ceil(pagos.value.length / itemsPerPage))

const pagosPaginados = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return pagos.value.slice(start, end)
})

function setPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}
</script>

<template>
    <AdminLayout>
    <div id="admin-pagos">
    <div class="admin-header animado" style="--delay: 0ms">
    <div class="admin-page-title">Reportes de Pagos</div>
    </div>
    <div class="card animado" style="--delay: 60ms; margin-bottom:14px; margin-right: 28px; margin-left: 28px;">
        <div class="card-body">
            <div style="display:flex;gap:10px;flex-wrap:wrap">
                <input v-model="filters.fecha_limite_pagos" type="date" style="background:var(--bg);border:1px solid var(--border2);color:var(--text2);padding:8px 12px;border-radius:var(--radius);font-size:12px;font-family:'Outfit',sans-serif;outline:none" />
                <select v-model="filters.estado_pagos" style="background:var(--bg);border:1px solid var(--border2);color:var(--text2);padding:8px 12px;border-radius:var(--radius);font-size:12px;font-family:'Outfit',sans-serif;outline:none"><option :value="undefined">Ambos</option><option>Completado</option><option>Reembolsado</option></select>
            </div>
        </div>
    </div>
    <div class="admin-body">
        <div class="card animado" style="--delay: 80ms">
        <div class="card-body" style="padding:0">
        <table class="tbl">
            <thead><tr><th>ID</th><th>Cliente</th><th>Metodo</th><th>Fecha</th><th>Monto</th><th>Estado</th></tr></thead>
            <TransitionGroup tag="tbody" name="rows" appear>
                <tr v-for="(pago, index) in pagosPaginados" :key="pago.id" :style="{ '--row-delay': `${index * 40}ms` }">
                    <td><strong style="font-family:'DM Mono',monospace">{{pago.id}}</strong></td>
                    <td>{{pago.reservas.usuarios.email}}</td>
                    <td>{{pago.metodo}}</td>
                    <td>{{formatFecha(pago.created_at)}}</td>
                    <td>{{pago.monto_final}}</td>
                    <td>{{pago.estado}}</td>
                </tr>
            </TransitionGroup>
        </table>
        <div style="border-top:1px solid var(--border2);padding:12px 14px;display:flex;justify-content:flex-end;gap:28px">
            <div style="font-size:12px;color:var(--text2)">Pagos: <strong style="color:var(--success);font-family:'DM Mono',monospace">+ L. {{pagosP}}</strong></div>
            <div style="font-size:12px;color:var(--text2)">Reembolsos: <strong style="color:var(--sinopia);font-family:'DM Mono',monospace">− L. {{pagosR}}</strong></div>
            <div style="font-size:12px;color:var(--text2)">Neto: <strong style="color:var(--darkred);font-family:'DM Mono',monospace">L. {{pagosN}}</strong></div>
        </div>
        </div>
    </div>
        <!-- Paginación -->
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

.id-th {
  width: 150px;
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