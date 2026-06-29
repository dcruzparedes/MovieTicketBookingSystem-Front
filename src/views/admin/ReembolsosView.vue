<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { getPaymentHistory, cambiarEstadoPago, cambiarEstadoReembolso } from '@/services/pagosService'
import { deleteReserva } from '@/services/reservaService'

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
  id: number
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
const reembolsos = ref<Reembolso[]>([])
const pagos = ref<Pago[]>([])
const estadoReembolso = ref()
const estadoPago = ref()

async function getReembolsos() {
  try{
    paymenHistory.value = await getPaymentHistory({...filters.value});
    reembolsos.value = paymenHistory.value?.reembolsos
    pagos.value = paymenHistory.value.pagos
  }catch(error){
    throw new Error(`Error: ${error}`);
  }
}

onMounted(getReembolsos)

const filters = ref<PaymentHistoryFiltersFilter>({})

watch(
  filters,
  () => {
    getReembolsos();    
  },
  {deep: true}
)

function formatFecha(fechaISO: string): string {
  return new Date(fechaISO).toLocaleDateString('es-HN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function getReservaID(id_pago: number){
  if(!id_pago) return;
  const pago = pagos.value.find(p => p.id === id_pago)
  return pago?.reservas.id
}

async function updateState(reembolso: Reembolso, newState: Reembolso['estado']) {
  try{
    if(newState === 'Aprobado'){
      const id_reserva = getReservaID(reembolso.id_pago)
      if (id_reserva === undefined) {
        throw new Error(`No se encontró la reserva asociada al pago.`)
      }
      await deleteReserva(id_reserva)
      await cambiarEstadoReembolso(reembolso.id, newState)
    }else if(newState === 'Rechazado'){
      await cambiarEstadoReembolso(reembolso.id, newState)
      await cambiarEstadoPago(reembolso.id_pago, 'Completado')
    }
  }catch(error){
    throw new Error(`Error: ${error}`)
  }
  reembolso.estado = newState
}
</script>

<template>
  <AdminLayout>
    <div class="page-header animado" style="--delay: 0ms">
      <h1 class="page-title">Reembolsos</h1>
    </div>
    <div class="card animado" style="--delay: 60ms; margin-bottom:14px; margin-right: 28px; margin-left: 28px;">
        <div class="card-body">
            <div style="display:flex;gap:10px;flex-wrap:wrap">
                <input v-model="filters.fecha_limite_reembolsos" type="date" style="background:var(--bg);border:1px solid var(--border2);color:var(--text2);padding:8px 12px;border-radius:var(--radius);font-size:12px;font-family:'Outfit',sans-serif;outline:none" />
                <select v-model="filters.estado_reembolsos" style="background:var(--bg);border:1px solid var(--border2);color:var(--text2);padding:8px 12px;border-radius:var(--radius);font-size:12px;font-family:'Outfit',sans-serif;outline:none"><option :value="undefined">Todos</option><option>Pendiente</option><option>Aprobado</option><option>Rechazado</option></select>
            </div>
        </div>
    </div>
    <div class="page-body">
      <div class="card animado" style="--delay: 80ms">
        <table class="tbl">
          <thead>
            <tr><th>#</th><th>Pago ID</th><th>Monto</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr>
          </thead>
          <TransitionGroup tag="tbody" name="rows" appear>
            <tr v-for="(reembolso, index) in reembolsos" :key="reembolso.id" :style="{ '--row-delay': `${index * 40}ms` }">
              <td class="id-cell">{{ reembolso.id }}</td>
              <td>{{ reembolso.id_pago }}</td>
              <td>{{ reembolso.monto }}</td>
              <td>
                <span :class="['status-badge', reembolso.estado.toLowerCase()]">
                  {{ reembolso.estado }}
                </span>
              </td>
              <td>{{ formatFecha(reembolso.created_at) }}</td>
              <td>
                <div class="action-group" v-if="reembolso.estado === 'Pendiente'">
                  <button class="btn btn-ghost btn-sm" @click="updateState(reembolso, 'Aprobado')">Aprobar</button>
                  <button class="btn btn-danger btn-sm" @click="updateState(reembolso, 'Rechazado')">Rechazar</button>
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </div>
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
.tbl tr:hover td { background: rgba(243, 113, 0, 0.03); }
.id-cell { color: var(--text3); font-size: 12px; width: 40px; }
.action-group { display: flex; gap: 6px; }
.btn { border: none; cursor: pointer; font-family: 'Outfit', sans-serif; border-radius: var(--radius); font-weight: 600; font-size: 14px; transition: opacity 0.2s; }
.btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); padding: 6px 14px; }
.btn-ghost:hover { background: var(--bg); }
.btn-danger { background: var(--sinopia); color: #fff; padding: 6px 14px; opacity: 0.9; }
.btn-danger:hover { opacity: 1; }
.btn-sm { font-size: 12px; }
.status-badge { font-size: 11px; padding: 4px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
.status-badge.pendiente { background: var(--bg); color: var(--text3); }
.status-badge.aprobado { background: rgba(30, 120, 60, 0.1); color: var(--success); }
.status-badge.rechazado { background: var(--red-bg); color: var(--sinopia); }

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
