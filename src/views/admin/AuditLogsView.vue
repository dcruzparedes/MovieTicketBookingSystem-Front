<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { getAuditLogs } from '@/services/auditLogsService'
import type { AuditLog, AuditLogsFilter, AuditLogsRes } from '@/services/auditLogsService'

const ACCIONES = [
  'USUARIO_ACTIVADO',
  'USUARIO_SUSPENDIDO',
  'ROL_ACTUALIZADO',
  'USUARIO_ELIMINADO',
  'RESERVA_CANCELADA_ADMIN',
]

const resultado = ref<AuditLogsRes | null>(null)
const cargando = ref(false)
const error = ref('')
const currentPage = ref(1)
const itemsPerPage = 20

const filters = ref<AuditLogsFilter>({})

async function fetchLogs() {
  cargando.value = true
  error.value = ''
  try {
    resultado.value = await getAuditLogs({ ...filters.value, page: currentPage.value, limit: itemsPerPage })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar los registros'
  } finally {
    cargando.value = false
  }
}

onMounted(fetchLogs)

watch(filters, () => {
  currentPage.value = 1
  fetchLogs()
}, { deep: true })

watch(currentPage, fetchLogs)

function setPage(page: number) {
  const total = resultado.value?.meta.totalPages ?? 1
  if (page < 1 || page > total) return
  currentPage.value = page
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function badgeClass(accion: string) {
  if (accion === 'USUARIO_SUSPENDIDO' || accion === 'USUARIO_ELIMINADO') return 'badge badge-danger'
  if (accion === 'USUARIO_ACTIVADO') return 'badge badge-success'
  if (accion === 'ROL_ACTUALIZADO') return 'badge badge-info'
  return 'badge badge-neutral'
}

function limpiarFiltros() {
  filters.value = {}
}
</script>

<template>
  <AdminLayout>
    <div class="admin-header animado" style="--delay: 0ms">
      <div class="admin-page-title">Registros de Auditoría</div>
      <button class="btn btn-ghost btn-sm" @click="limpiarFiltros">Limpiar filtros</button>
    </div>

    <div class="card animado" style="--delay: 60ms; margin: 0 28px 14px">
      <div class="card-body">
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <input
            v-model="filters.q"
            type="text"
            placeholder="Buscar por nombre o email..."
            style="background:var(--bg);border:1px solid var(--border2);color:var(--text2);padding:8px 12px;border-radius:var(--radius);font-size:12px;font-family:'Outfit',sans-serif;outline:none;min-width:220px"
          />
          <input
            v-model="filters.fecha_inicio"
            type="date"
            style="background:var(--bg);border:1px solid var(--border2);color:var(--text2);padding:8px 12px;border-radius:var(--radius);font-size:12px;font-family:'Outfit',sans-serif;outline:none"
          />
          <input
            v-model="filters.fecha_final"
            type="date"
            style="background:var(--bg);border:1px solid var(--border2);color:var(--text2);padding:8px 12px;border-radius:var(--radius);font-size:12px;font-family:'Outfit',sans-serif;outline:none"
          />
          <select
            v-model="filters.accion"
            style="background:var(--bg);border:1px solid var(--border2);color:var(--text2);padding:8px 12px;border-radius:var(--radius);font-size:12px;font-family:'Outfit',sans-serif;outline:none"
          >
            <option :value="undefined">Todas las acciones</option>
            <option v-for="a in ACCIONES" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="admin-body">
      <p v-if="error" style="color:var(--sinopia);font-size:13px;margin-bottom:12px">{{ error }}</p>

      <div class="card animado" style="--delay: 120ms">
        <div class="card-body" style="padding:0">
          <table class="tbl">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Acción</th>
                <th>Detalle</th>
                <th>Usuario afectado</th>
                <th>Realizado por</th>
              </tr>
            </thead>
            <TransitionGroup tag="tbody" name="rows" appear>
              <tr v-if="cargando" key="loading">
                <td colspan="5" style="text-align:center;color:var(--text3);padding:32px">Cargando...</td>
              </tr>
              <tr v-else-if="!resultado?.data.length" key="empty">
                <td colspan="5" style="text-align:center;color:var(--text3);padding:32px">Sin registros</td>
              </tr>
              <tr
                v-for="(log, index) in resultado?.data"
                :key="log.id"
                :style="{ '--row-delay': `${index * 30}ms` }"
              >
                <td style="white-space:nowrap;font-size:12px;color:var(--text3)">{{ formatFecha(log.created_at) }}</td>
                <td><span :class="badgeClass(log.accion)">{{ log.accion }}</span></td>
                <td style="color:var(--text3)">{{ log.detalle ?? '—' }}</td>
                <td>
                  <span style="display:block;font-weight:500;color:var(--text)">{{ log.usuarios?.nombre ?? '—' }}</span>
                  <span style="display:block;font-size:11px;color:var(--text3)">{{ log.usuarios?.email ?? '' }}</span>
                </td>
                <td>
                  <span style="font-weight:500;color:var(--text)">{{ log.realizado_por?.nombre ?? '—' }}</span>
                </td>
              </tr>
            </TransitionGroup>
          </table>
        </div>
      </div>

      <div v-if="(resultado?.meta.totalPages ?? 0) > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage === 1" @click="setPage(currentPage - 1)">‹</button>
        <button
          v-for="page in resultado?.meta.totalPages"
          :key="page"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="setPage(page)"
        >{{ page }}</button>
        <button class="page-btn" :disabled="currentPage === resultado?.meta.totalPages" @click="setPage(currentPage + 1)">›</button>
      </div>

      <p v-if="resultado" style="font-size:11px;color:var(--text3);margin-top:10px;padding:0 4px">
        {{ resultado.meta.total }} registro{{ resultado.meta.total !== 1 ? 's' : '' }} en total
      </p>
    </div>
  </AdminLayout>
</template>

<style scoped>
.admin-header { padding: 24px 28px 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.admin-page-title { font-family: 'DM Serif Display', serif; font-size: 26px; color: var(--text); }
.admin-body { padding: 0 28px 28px; }

.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.card-body { padding: 20px; }

.tbl { width: 100%; border-collapse: collapse; }
.tbl th { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border2); }
.tbl td { font-size: 13px; color: var(--text2); padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.tbl tr:last-child td { border-bottom: none; }
.tbl tr:hover td { background: rgba(243, 113, 0, 0.03); }

.badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase; font-family: 'DM Mono', monospace; }
.badge-danger { background: rgba(200, 40, 20, 0.12); color: var(--sinopia); }
.badge-success { background: rgba(34, 160, 80, 0.12); color: var(--success); }
.badge-info { background: rgba(60, 120, 220, 0.12); color: #5b8dee; }
.badge-neutral { background: rgba(150, 150, 150, 0.1); color: var(--text3); }

.btn { border: none; cursor: pointer; font-family: 'Outfit', sans-serif; border-radius: var(--radius); font-weight: 600; font-size: 14px; transition: opacity 0.2s; }
.btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); padding: 6px 14px; }
.btn-ghost:hover { background: var(--bg); }
.btn-sm { font-size: 12px; }

.pagination { display: flex; gap: 5px; margin-top: 16px; padding: 0 4px; align-items: center; }
.page-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border2); background: transparent; color: var(--text2); font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; transition: all 0.2s; }
.page-btn:hover:not(.active) { background: var(--bg); }
.page-btn.active { background: var(--sinopia); color: #fff; border-color: var(--sinopia); font-weight: 700; }
.page-btn:disabled { opacity: 0.35; cursor: default; }

@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.animado { opacity: 0; animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; animation-delay: var(--delay, 0ms); }
.rows-enter-active { animation: slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards; animation-delay: var(--row-delay, 0ms); opacity: 0; }
.rows-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.rows-leave-to { opacity: 0; transform: scale(0.97); }
.rows-move { transition: transform 0.3s ease; }
</style>
