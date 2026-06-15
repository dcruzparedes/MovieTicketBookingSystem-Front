<template>
  <div class="admin-layout">
    <div class="admin-sidebar">
      <div class="admin-logo">Cine <em>Vicenta</em><span>Recepcionista</span></div>
      <div :class="['admin-nav-item', seccionActiva === 'buscar' && 'active']" @click="seccionActiva = 'buscar'">🔍
        Buscar cliente</div>
      <div :class="['admin-nav-item', seccionActiva === 'reservar' && 'active']" @click="seccionActiva = 'reservar'">🎟
        Nueva reserva</div>
      <div :class="['admin-nav-item', seccionActiva === 'cancelar' && 'active']" @click="seccionActiva = 'cancelar'">✕
        Cancelar reserva</div>
      <div style="flex:1"></div>
      <div class="admin-nav-item" @click="enrutador.push('/')">← Salir</div>
    </div>

    <div class="admin-content">

      <!-- ── BUSCAR CLIENTE ── -->
      <div v-if="seccionActiva === 'buscar'">
        <div class="admin-header">
          <div class="admin-page-title">Buscar cliente</div>
        </div>
        <div class="admin-body">

          <!-- Buscador -->
          <div class="card" style="margin-bottom: 14px">
            <div class="card-body">
              <div class="busqueda-row">
                <IconField class="busqueda-input">
                  <InputIcon class="pi pi-search" />
                  <InputText v-model="terminoBusqueda" placeholder="Nombre, correo o teléfono…" fluid
                    @input="buscarClientes" />
                </IconField>
                <Button label="Buscar" @click="buscarClientes" :loading="cargando" />
              </div>
            </div>
          </div>

          <!-- Resultados -->
          <div class="card">
            <div class="card-body" style="padding: 0">
              <DataTable :value="clientes" :loading="cargando" size="small" stripedRows>
                <template #empty>
                  <div class="tabla-vacia">
                    <template v-if="terminoBusqueda">Sin resultados para "{{ terminoBusqueda }}"</template>
                    <template v-else>Ingresa un término de búsqueda</template>
                  </div>
                </template>
                <Column field="nombre" header="Cliente">
                  <template #body="{ data }">
                    <strong>{{ data.nombre }}</strong>
                  </template>
                </Column>
                <Column field="email" header="Correo" />
                <Column field="telefono" header="Teléfono" />
                <Column header="">
                  <template #body="{ data }">
                    <Button label="Reservar" size="small" @click="seleccionarCliente(data)" />
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>

        </div>
      </div>

      <!-- ── NUEVA RESERVA ── -->
      <div v-if="seccionActiva === 'reservar'">
        <div class="admin-header">
          <div class="admin-page-title">Nueva reserva</div>
          <Tag v-if="clienteSeleccionado" :value="clienteSeleccionado.nombre" severity="warn" />
        </div>
        <div class="admin-body">
          <Message v-if="clienteSeleccionado" severity="info" :closable="false" style="margin-bottom: 14px">
            Realizando reserva en nombre de
            <strong>{{ clienteSeleccionado.nombre }}</strong>
            ({{ clienteSeleccionado.email }})
          </Message>
          <Message v-else severity="warn" :closable="false" style="margin-bottom: 14px">
            Primero busca y selecciona un cliente.
          </Message>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px">
            <div class="card">
              <div class="card-body">
                <div class="campo"><label>Película</label>
                  <Select v-model="reservaForm.pelicula" :options="peliculasMock" optionLabel="titulo"
                    placeholder="Seleccionar" fluid />
                </div>
                <div class="campo"><label>Función</label>
                  <Select v-model="reservaForm.funcion" :options="funcionesMock" optionLabel="label"
                    placeholder="Seleccionar" fluid />
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <div class="eyebrow" style="margin-bottom: 12px">Asientos seleccionados</div>
                <div style="display: flex; flex-wrap: wrap; gap: 4px; min-height: 40px">
                  <Tag v-for="codigo in tienda.asientosSeleccionados" :key="codigo" :value="codigo" severity="warn"
                    style="font-family: 'DM Mono', monospace" />
                  <span v-if="!tienda.asientosSeleccionados.length" style="font-size: 12px; color: var(--text3)">
                    Ve a la vista de asientos para seleccionar
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="card" style="margin-top: 14px">
            <div class="card-body" style="display: flex; justify-content: space-between; align-items: center">
              <div>
                <div style="font-size: 13px; color: var(--text2); margin-bottom: 4px">
                  {{ tienda.asientosSeleccionados.length }} asiento(s) seleccionado(s)
                </div>
                <div
                  style="font-size: 18px; font-weight: 700; color: var(--sinopia); font-family: 'DM Mono', monospace">
                  L. {{ tienda.subtotal.toFixed(2) }}
                </div>
              </div>
              <Button label="Confirmar reserva"
                :disabled="!clienteSeleccionado || tienda.asientosSeleccionados.length === 0"
                @click="confirmarReserva" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── CANCELAR RESERVA ── -->
      <div v-if="seccionActiva === 'cancelar'">
        <div class="admin-header">
          <div class="admin-page-title">Cancelar reserva</div>
        </div>
        <div class="admin-body">
          <div class="card" style="margin-bottom: 14px">
            <div class="card-body">
              <div class="busqueda-row">
                <InputText v-model="codigoReserva" placeholder="Código de reserva (ej. RES-2026-00712)"
                  style="font-family: 'DM Mono', monospace; letter-spacing: 1px; flex: 1" fluid />
                <Button label="Buscar" @click="buscarReserva" />
              </div>
            </div>
          </div>

          <div v-if="reservaEncontrada" class="card">
            <div class="card-body">
              <div class="eyebrow" style="margin-bottom: 12px">Reserva encontrada</div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px">
                <div>
                  <div style="font-family: 'DM Serif Display', serif; font-size: 16px; color: var(--text)">
                    {{ reservaEncontrada.pelicula }}
                  </div>
                  <div style="font-size: 13px; color: var(--text3); margin-top: 3px">
                    {{ reservaEncontrada.funcion }} · {{ reservaEncontrada.asientos }}
                  </div>
                  <div style="font-size: 12px; color: var(--text3); margin-top: 2px">
                    {{ reservaEncontrada.cliente }} · {{ reservaEncontrada.codigo }}
                  </div>
                </div>
                <Tag value="Confirmada" severity="success" />
              </div>
              <Message severity="warn" :closable="false" style="margin-bottom: 14px">
                Política: con más de 48h de anticipación se aplica reembolso del 100%.
              </Message>
              <Button label="Cancelar esta reserva" severity="danger" @click="mostrarConfirmCancelacion = true" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Modal confirmación cancelación -->
  <Dialog v-model:visible="mostrarConfirmCancelacion" header="¿Cancelar esta reserva?" :modal="true"
    :style="{ width: '440px' }">
    <Message severity="warn" :closable="false" style="margin-bottom: 12px">
      Política vigente: más de 48h → 100% de reembolso · 24–48h → 50% · menos de 24h → sin reembolso.
    </Message>
    <p style="font-size: 13px; color: var(--text2); line-height: 1.6">
      <strong style="color: var(--text)">{{ reservaEncontrada?.codigo }} — {{ reservaEncontrada?.pelicula
        }}</strong><br />
      Esta acción no se puede deshacer. El reembolso se procesará en 3–5 días hábiles.
    </p>
    <template #footer>
      <Button label="Volver" severity="secondary" outlined @click="mostrarConfirmCancelacion = false" />
      <Button label="Confirmar cancelación" severity="danger" @click="ejecutarCancelacion" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import { useReservaStore } from '@/stores/reserva'

const enrutador = useRouter()
const toast = useToast()
const tienda = useReservaStore()

const seccionActiva = ref<'buscar' | 'reservar' | 'cancelar'>('buscar')

// ── Buscar cliente ──
const terminoBusqueda = ref('')
const cargando = ref(false)
const clienteSeleccionado = ref<{ id: string; nombre: string; email: string; telefono: string } | null>(null)

const CLIENTES_MOCK = [
  { id: '1', nombre: 'Juan Pérez', email: 'juan@correo.com', telefono: '+504 9976 1234' },
  { id: '2', nombre: 'María López', email: 'maria@correo.com', telefono: '+504 9812 5678' },
  { id: '3', nombre: 'Carlos Mejía', email: 'carlos@correo.com', telefono: '+504 9543 9012' },
  { id: '4', nombre: 'Ana García', email: 'ana@correo.com', telefono: '+504 9654 3210' },
  { id: '5', nombre: 'Luis Rodríguez', email: 'luis@correo.com', telefono: '+504 9321 0987' },
]

const clientes = ref<typeof CLIENTES_MOCK>([])

async function buscarClientes() {
  if (!terminoBusqueda.value.trim()) { clientes.value = []; return }
  cargando.value = true
  await new Promise(r => setTimeout(r, 400))
  const q = terminoBusqueda.value.toLowerCase()
  clientes.value = CLIENTES_MOCK.filter(c =>
    c.nombre.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.telefono.includes(q)
  )
  cargando.value = false
}

function seleccionarCliente(cliente: typeof CLIENTES_MOCK[0]) {
  clienteSeleccionado.value = cliente
  seccionActiva.value = 'reservar'
}

// ── Nueva reserva ──
const peliculasMock = [
  { id: '1', titulo: 'Alien: Romulus' },
  { id: '2', titulo: 'Wild Robot' },
  { id: '3', titulo: 'Venom' },
]
const funcionesMock = [
  { id: '1', label: 'Vie 12 Jun · 19:15 · 3D · Sala 4' },
  { id: '2', label: 'Vie 12 Jun · 21:45 · IMAX · Sala 2' },
]
const reservaForm = ref({ pelicula: null, funcion: null })

function confirmarReserva() {
  toast.add({
    severity: 'success',
    summary: 'Reserva confirmada',
    detail: `Reserva creada para ${clienteSeleccionado.value?.nombre}`,
    life: 4000,
  })
  seccionActiva.value = 'buscar'
  clienteSeleccionado.value = null
  tienda.limpiarSeleccion()
}

// ── Cancelar reserva ──
const codigoReserva = ref('')
const mostrarConfirmCancelacion = ref(false)
const reservaEncontrada = ref<{
  codigo: string; pelicula: string; funcion: string; asientos: string; cliente: string
} | null>(null)

const RESERVAS_MOCK: Record<string, typeof reservaEncontrada.value> = {
  'RES-2026-00712': {
    codigo: 'RES-2026-00712',
    pelicula: 'Alien: Romulus',
    funcion: 'Sáb 7 Jun · 20:00 · Sala 4',
    asientos: 'C4, C5',
    cliente: 'Juan Pérez',
  },
}

function buscarReserva() {
  const codigo = codigoReserva.value.trim().toUpperCase()
  reservaEncontrada.value = RESERVAS_MOCK[codigo] ?? null
  if (!reservaEncontrada.value) {
    toast.add({ severity: 'error', summary: 'No encontrada', detail: 'Código de reserva inválido', life: 3000 })
  }
}

function ejecutarCancelacion() {
  mostrarConfirmCancelacion.value = false
  reservaEncontrada.value = null
  codigoReserva.value = ''
  toast.add({ severity: 'success', summary: 'Reserva cancelada', detail: 'El reembolso se procesará en 3–5 días hábiles', life: 4000 })
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 218px;
  background: var(--rosewood);
  flex-shrink: 0;
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.admin-logo {
  font-family: 'DM Serif Display', serif;
  font-size: 18px;
  color: #faf0ec;
  padding: 0 8px 14px;
  border-bottom: 1px solid rgba(250, 240, 236, .12);
  margin-bottom: 12px;
}

.admin-logo em {
  font-style: italic;
  color: var(--tangelo);
}

.admin-logo span {
  font-size: 9px;
  color: rgba(250, 240, 236, .35);
  display: block;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-top: 2px;
}

.admin-nav-item {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: rgba(250, 240, 236, .55);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all .2s;
}

.admin-nav-item:hover {
  background: rgba(250, 240, 236, .08);
  color: rgba(250, 240, 236, .85);
}

.admin-nav-item.active {
  background: rgba(243, 113, 0, .25);
  color: #faf0ec;
  font-weight: 500;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg);
}

.admin-header {
  padding: 24px 28px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.admin-page-title {
  font-family: 'DM Serif Display', serif;
  font-size: 26px;
  color: var(--text);
}

.admin-body {
  padding: 0 28px 28px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.card-body {
  padding: 20px;
}

.eyebrow {
  font-size: 11px;
  font-weight: 600;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.busqueda-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.busqueda-input {
  flex: 1;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 14px;
}

.campo label {
  font-size: 12px;
  color: var(--text2);
  font-weight: 500;
}

.tabla-vacia {
  padding: 32px;
  text-align: center;
  font-size: 13px;
  color: var(--text3);
}
</style>
