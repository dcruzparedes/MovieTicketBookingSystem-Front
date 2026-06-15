<template>
  <AdminLayout>
    <div class="dashboard">

      <!-- Header -->
      <div class="dash-header animado" style="--delay: 0ms">
        <div>
          <div class="eyebrow">Panel de control</div>
          <h1 class="dash-titulo">Dashboard</h1>
        </div>
        <div class="dash-fecha">
          <i class="pi pi-calendar" />
          {{ fechaHoy }}
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid animado" style="--delay: 60ms">
        <div v-for="stat in stats" :key="stat.label" class="stat-card">
          <div class="stat-icono" :style="{ background: stat.bg, color: stat.color }">
            <i :class="['pi', stat.icon]" />
          </div>
          <div class="stat-info">
            <div class="stat-val">{{ stat.valor }}</div>
            <div class="stat-lbl">{{ stat.label }}</div>
            <div v-if="stat.delta" class="stat-delta" :style="{ color: stat.deltaColor }">
              <i :class="['pi', stat.deltaIcon]" style="font-size: 10px" />
              {{ stat.delta }}
            </div>
          </div>
        </div>
      </div>

      <!-- Grid principal -->
      <div class="dash-grid">

        <!-- Reservas recientes -->
        <div class="dash-card animado" style="--delay: 120ms">
          <div class="card-header">
            <div class="card-titulo">Reservas recientes</div>
            <RouterLink to="/admin/reportes" class="card-link">
              Ver todas <i class="pi pi-arrow-right" style="font-size: 10px" />
            </RouterLink>
          </div>
          <DataTable :value="reservasRecientes" size="small">
            <Column field="codigo" header="Código">
              <template #body="{ data }">
                <span style="font-family: 'DM Mono', monospace; font-size: 11px; color: var(--sinopia)">
                  {{ data.codigo }}
                </span>
              </template>
            </Column>
            <Column field="cliente" header="Cliente">
              <template #body="{ data }">
                <strong style="font-size: 13px">{{ data.cliente }}</strong>
              </template>
            </Column>
            <Column field="pelicula" header="Película" />
            <Column field="total" header="Total">
              <template #body="{ data }">
                <span style="font-family: 'DM Mono', monospace; color: #1e783c">{{ data.total }}</span>
              </template>
            </Column>
            <Column field="estado" header="Estado">
              <template #body="{ data }">
                <Tag :value="data.estado"
                  :severity="data.estado === 'Confirmada' ? 'success' : data.estado === 'Cancelada' ? 'danger' : 'warn'"
                  style="font-size: 11px" />
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Panel derecho -->
        <div class="dash-right">

          <!-- Funciones de hoy -->
          <div class="dash-card animado" style="--delay: 160ms">
            <div class="card-header">
              <div class="card-titulo">Funciones hoy</div>
              <RouterLink to="/admin/funciones" class="card-link">
                Ver todas <i class="pi pi-arrow-right" style="font-size: 10px" />
              </RouterLink>
            </div>
            <div class="funciones-lista">
              <div v-for="f in funcionesHoy" :key="f.id" class="funcion-item">
                <div class="funcion-hora">{{ f.hora }}</div>
                <div class="funcion-info">
                  <div class="funcion-titulo">{{ f.pelicula }}</div>
                  <div class="funcion-meta">{{ f.sala }} · {{ f.formato }}</div>
                </div>
                <Tag :value="`${f.ocupacion}%`"
                  :severity="f.ocupacion > 80 ? 'danger' : f.ocupacion > 50 ? 'warn' : 'success'"
                  style="font-size: 11px; flex-shrink: 0" />
              </div>
            </div>
          </div>

          <!-- Accesos rápidos -->
          <div class="dash-card animado" style="--delay: 200ms">
            <div class="card-titulo" style="margin-bottom: 14px">Accesos rápidos</div>
            <div class="accesos-grid">
              <RouterLink v-for="acceso in accesosRapidos" :key="acceso.to" :to="acceso.to" class="acceso-btn">
                <i :class="['pi', acceso.icon]" />
                {{ acceso.label }}
              </RouterLink>
            </div>
          </div>

        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import AdminLayout from '@/layouts/AdminLayout.vue'

const fechaHoy = computed(() =>
  new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
)

const stats = [
  { label: 'Reservas hoy', valor: '47', icon: 'pi-ticket', bg: 'rgba(243,80,10,.1)', color: 'var(--tangelo)', delta: '+12% vs ayer', deltaColor: '#1e783c', deltaIcon: 'pi-arrow-up' },
  { label: 'Ingresos hoy', valor: 'L. 5,640', icon: 'pi-wallet', bg: 'rgba(30,120,60,.1)', color: '#1e783c', delta: '+8% vs ayer', deltaColor: '#1e783c', deltaIcon: 'pi-arrow-up' },
  { label: 'Películas activas', valor: '6', icon: 'pi-film', bg: 'rgba(90,0,6,.08)', color: 'var(--rosewood)', delta: null, deltaColor: '', deltaIcon: '' },
  { label: 'Funciones hoy', valor: '12', icon: 'pi-calendar', bg: 'rgba(217,34,0,.08)', color: 'var(--sinopia)', delta: '3 casi llenas', deltaColor: 'var(--orange)', deltaIcon: 'pi-exclamation-triangle' },
]

const reservasRecientes = [
  { codigo: 'RES-2026-00847', cliente: 'Juan Pérez', pelicula: 'Fight Club', total: 'L. 240', estado: 'Confirmada' },
  { codigo: 'RES-2026-00846', cliente: 'María López', pelicula: 'Pulp Fiction', total: 'L. 120', estado: 'Confirmada' },
  { codigo: 'RES-2026-00845', cliente: 'Carlos Mejía', pelicula: 'There Will Be Blood', total: 'L. 360', estado: 'Cancelada' },
  { codigo: 'RES-2026-00844', cliente: 'Ana García', pelicula: 'Fight Club', total: 'L. 240', estado: 'Confirmada' },
  { codigo: 'RES-2026-00843', cliente: 'Luis Rodríguez', pelicula: 'Megalopolis', total: 'L. 180', estado: 'Pendiente' },
]

const funcionesHoy = [
  { id: 1, hora: '14:00', pelicula: 'There Will Be Blood', sala: 'Sala 4', formato: '2D', ocupacion: 72 },
  { id: 2, hora: '16:30', pelicula: 'Pulp Fiction', sala: 'Sala 2', formato: '2D', ocupacion: 45 },
  { id: 3, hora: '19:15', pelicula: 'Fight Club', sala: 'Sala 4', formato: '3D', ocupacion: 88 },
  { id: 4, hora: '21:45', pelicula: 'Chainsaw Man', sala: 'Sala 1', formato: 'IMAX', ocupacion: 23 },
]

const accesosRapidos = [
  { to: '/admin/peliculas/nueva', icon: 'pi-plus-circle', label: 'Nueva película' },
  { to: '/admin/funciones/nueva', icon: 'pi-calendar-plus', label: 'Nueva función' },
  { to: '/admin/cupones', icon: 'pi-tag', label: 'Cupones' },
  { to: '/admin/clientes', icon: 'pi-users', label: 'Clientes' },
  { to: '/admin/reportes', icon: 'pi-chart-bar', label: 'Reportes' },
  { to: '/admin/pagos', icon: 'pi-wallet', label: 'Pagos' },
]
</script>

<style scoped>
.dashboard {
  padding: 28px;
}

.eyebrow {
  font-size: 11px;
  font-weight: 600;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.dash-titulo {
  font-family: 'DM Serif Display', serif;
  font-size: 28px;
  color: var(--text);
}

.dash-fecha {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text3);
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 8px 14px;
  border-radius: 20px;
  text-transform: capitalize;
}

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 22px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.stat-icono {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.stat-val {
  font-family: 'DM Mono', monospace;
  font-size: 22px;
  font-weight: 500;
  color: var(--text);
  line-height: 1;
  margin-bottom: 3px;
}

.stat-lbl {
  font-size: 11px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.stat-delta {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 3px;
}

/* ── Grid ── */
.dash-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
}

.dash-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dash-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-titulo {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.card-link {
  font-size: 12px;
  color: var(--sinopia);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: opacity .2s;
}

.card-link:hover {
  opacity: .75;
}

/* ── Funciones ── */
.funciones-lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.funcion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.funcion-hora {
  font-family: 'DM Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  flex-shrink: 0;
  width: 44px;
}

.funcion-info {
  flex: 1;
  min-width: 0;
}

.funcion-titulo {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.funcion-meta {
  font-size: 11px;
  color: var(--text3);
  margin-top: 2px;
}

/* ── Accesos rápidos ── */
.accesos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.acceso-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 12px;
  font-weight: 500;
  color: var(--text2);
  text-decoration: none;
  transition: all .2s;
  font-family: 'Outfit', sans-serif;
}

.acceso-btn:hover {
  border-color: var(--tangelo);
  color: var(--tangelo);
  background: rgba(243, 80, 10, .04);
}

.acceso-btn .pi {
  font-size: 13px;
}

/* ── Animaciones ── */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animado {
  opacity: 0;
  animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--delay, 0ms);
}
</style>
