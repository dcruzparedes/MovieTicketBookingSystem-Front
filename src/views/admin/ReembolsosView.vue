<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

interface Reembolso {
  id: number
  paymentId: number
  amount: string
  state: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
  createdAt: string
}

const reembolsos = ref<Reembolso[]>([
  { id: 1, paymentId: 101, amount: 'L. 230.00', state: 'PENDIENTE', createdAt: '2026-06-16' },
  { id: 2, paymentId: 102, amount: 'L. 150.00', state: 'APROBADO', createdAt: '2026-06-15' },
  { id: 3, paymentId: 103, amount: 'L. 300.00', state: 'RECHAZADO', createdAt: '2026-06-14' },
])

function updateState(reembolso: Reembolso, newState: Reembolso['state']) {
  reembolso.state = newState
}
</script>

<template>
  <AdminLayout>
    <div class="page-header">
      <h1 class="page-title">Reembolsos</h1>
    </div>
    <div class="page-body">
      <div class="card">
        <table class="tbl">
          <thead>
            <tr><th>#</th><th>Pago ID</th><th>Monto</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="reembolso in reembolsos" :key="reembolso.id">
              <td class="id-cell">{{ reembolso.id }}</td>
              <td>{{ reembolso.paymentId }}</td>
              <td>{{ reembolso.amount }}</td>
              <td>
                <span :class="['status-badge', reembolso.state.toLowerCase()]">
                  {{ reembolso.state }}
                </span>
              </td>
              <td>{{ reembolso.createdAt }}</td>
              <td>
                <div class="action-group" v-if="reembolso.state === 'PENDIENTE'">
                  <button class="btn btn-ghost btn-sm" @click="updateState(reembolso, 'APROBADO')">Aprobar</button>
                  <button class="btn btn-danger btn-sm" @click="updateState(reembolso, 'RECHAZADO')">Rechazar</button>
                </div>
              </td>
            </tr>
          </tbody>
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
.status-badge.aprobado { background: #e6f4ea; color: #1e783c; }
.status-badge.rechazado { background: #fce8e6; color: var(--sinopia); }
</style>
