<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'


interface Pago{
    id: number
    cliente: string
    metodo: string
    fecha: string
    monto_final: number
    estado: string
}

const Pagos: Pago[]=[
    {
        id: 1,
        cliente: "example.com",
        metodo: 'Tarjeta',
        fecha: '6/15/2026',
        monto_final: 230,
        estado: "Activo"
    },
    {
        id: 2,
        cliente: "example123@gmail.com",
        metodo: 'Tarjeta',
        fecha: '6/15/2026',
        monto_final: 230,
        estado: "Activo"
    },
    {
        id: 3,
        cliente: "example@gmail.com",
        metodo: 'Transferencia',
        fecha: '6/15/2026',
        monto_final: 230,
        estado: "Reembolsado"
    },
    {
        id: 4,
        cliente: "example@gmail.com",
        metodo: 'Tarjeta',
        fecha: '6/15/2026',
        monto_final: 230,
        estado: "Activo"
    },
    {
        id: 5,
        cliente: "example@gmail.com",
        metodo: 'Transferencia',
        fecha: '6/15/2026',
        monto_final: 230,
        estado: "Reembolsado"
    },
]

const pagos = ref<Pago[]>(Pagos)

const pagosP = computed(() =>
  pagos.value
    .filter(p => p.estado === 'Activo')
    .reduce((acc, p) => acc + p.monto_final, 0)
)

const pagosR = computed(() =>
  pagos.value
    .filter(p => p.estado === 'Reembolsado')
    .reduce((acc, p) => acc + p.monto_final, 0)
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
    <div class="admin-header">
    <div class="admin-page-title">Reportes de Pagos</div>
    </div>
    <div class="admin-body">
        <div class="card">
        <div class="card-body" style="padding:0">
        <table class="tbl">
            <thead><tr><th>ID</th><th>Cliente</th><th>Metodo</th><th>Fecha</th><th>Monto</th><th>Estado</th></tr></thead>
            <tbody>
                <tr v-for="pago in pagosPaginados">
                    <td><strong style="font-family:'DM Mono',monospace">{{pago.id}}</strong></td>
                    <td>{{pago.cliente}}</td>
                    <td>{{pago.metodo}}</td>
                    <td>{{pago.fecha}}</td>
                    <td>{{pago.monto_final}}</td>
                    <td>{{pago.estado}}</td>
                </tr>
            </tbody>
        </table>
        <div style="border-top:1px solid var(--border2);padding:12px 14px;display:flex;justify-content:flex-end;gap:28px">
            <div style="font-size:12px;color:var(--text2)">Pagos: <strong style="color:#1e783c;font-family:'DM Mono',monospace">+ L. {{pagosP}}</strong></div>
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

<style>
.status-label {
  font-size: 12px;
  font-weight: 500;
}

.status-label.active {
  color: #1e783c;
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
  color: #1e783c;
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
</style>