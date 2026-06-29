<template>
  <AdminLayout subtitle="Recepcionista">
    <template #nav>
      <button type="button" :class="['nav-item', { active: seccionActiva === 'buscar' }]"
        @click="seccionActiva = 'buscar'">
        <i class="pi pi-search nav-icon" />
        Buscar cliente
      </button>
      <button type="button" :class="['nav-item', { active: seccionActiva === 'reservar' }]"
        @click="seccionActiva = 'reservar'">
        <i class="pi pi-ticket nav-icon" />
        Nueva reserva
      </button>
      <button type="button" :class="['nav-item', { active: seccionActiva === 'cancelar' }]"
        @click="seccionActiva = 'cancelar'">
        <i class="pi pi-times-circle nav-icon" />
        Cancelar reserva
      </button>
    </template>

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

          <div class="card">
            <div class="card-body">
              <div class="campo"><label>Película</label>
                <Select v-model="peliculaSeleccionada" :options="peliculasConFunciones" optionLabel="titulo"
                  :loading="cargandoPeliculas" placeholder="Seleccionar" fluid
                  @update:model-value="funcionSeleccionada = null" />
              </div>
              <div class="campo"><label>Función</label>
                <Select v-model="funcionSeleccionada" :options="funcionesDisponibles" optionLabel="label"
                  option-disabled="llena" :disabled="!peliculaSeleccionada" placeholder="Seleccionar" fluid />
                <span v-if="peliculaSeleccionada && !funcionesDisponibles.length"
                  style="font-size: 12px; color: var(--text3)">
                  Esta película no tiene funciones activas.
                </span>
              </div>
            </div>
          </div>

          <div class="card" style="margin-top: 14px">
            <div class="card-body" style="display: flex; justify-content: space-between; align-items: center">
              <span style="font-size: 12px; color: var(--text3)">
                Vas a continuar al mapa de asientos para esta función.
              </span>
              <Button label="Continuar a selección de asientos" icon="pi pi-arrow-right" icon-pos="right"
                :disabled="!clienteSeleccionado || !funcionSeleccionada" @click="continuarAAsientos" />
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
                <InputText v-model="codigoReserva" placeholder="Código de reserva (ej. RES-000001)"
                  style="font-family: 'DM Mono', monospace; letter-spacing: 1px; flex: 1" fluid
                  @keyup.enter="buscarReserva" />
                <Button label="Buscar" @click="buscarReserva" :loading="cargandoReserva" />
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
                <Tag :value="reservaEncontrada.estado" :severity="severidadEstado" />
              </div>
              <Message v-if="yaNoSePuedeCancelar" severity="info" :closable="false" style="margin-bottom: 14px">
                Esta reserva ya está {{ estadoNormalizado }} y no se puede cancelar desde aquí.
              </Message>
              <Message v-else severity="warn" :closable="false" style="margin-bottom: 14px">
                Política: con más de 48h de anticipación se aplica reembolso del 100%.
              </Message>
              <Button
                label="Cancelar esta reserva"
                severity="danger"
                :disabled="yaNoSePuedeCancelar"
                @click="mostrarConfirmCancelacion = true"
              />
            </div>
          </div>
        </div>
      </div>

  </AdminLayout>

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
import { ref, computed, onMounted } from 'vue'
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
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useReservaStore } from '@/stores/reserva'
import { isApiError } from '@/services/api'
import { buscarClientes as buscarClientesApi, type ClienteBackend } from '@/services/usuarioService'
import { getReservas, cancelReserva, type Funcion } from '@/services/reservaService'
import { getPeliculas } from '@/services/movieService'

// ── Forma de los datos que devuelve GET /peliculas (películas con sus funciones embebidas) ──
interface FuncionEmbebida {
  id: number
  fecha_hora: string
  estado: string
  formato: string
  asientos_disponibles: number
  salas: { id: number; nombre: string; cines: { nombre: string } }
}
interface PeliculaConFunciones {
  id: number
  titulo: string
  activo: boolean
  funciones?: FuncionEmbebida[]
}

const toast = useToast()
const tienda = useReservaStore()
const router = useRouter()

const seccionActiva = ref<'buscar' | 'reservar' | 'cancelar'>('buscar')

// ── Buscar cliente ──
const terminoBusqueda = ref('')
const cargando = ref(false)
const clienteSeleccionado = ref<ClienteBackend | null>(null)
const clientes = ref<ClienteBackend[]>([])

let debounceBusqueda: ReturnType<typeof setTimeout> | null = null

function buscarClientes() {
  if (debounceBusqueda) clearTimeout(debounceBusqueda)
  if (!terminoBusqueda.value.trim()) {
    clientes.value = []
    return
  }
  debounceBusqueda = setTimeout(ejecutarBusquedaClientes, 300)
}

async function ejecutarBusquedaClientes() {
  cargando.value = true
  try {
    clientes.value = await buscarClientesApi(terminoBusqueda.value.trim())
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error al buscar',
      detail: isApiError(error) ? error.message : 'No se pudo completar la búsqueda',
      life: 4000,
    })
  } finally {
    cargando.value = false
  }
}

function seleccionarCliente(cliente: ClienteBackend) {
  clienteSeleccionado.value = cliente
  seccionActiva.value = 'reservar'
}

// ── Nueva reserva ──
const peliculasConFunciones = ref<PeliculaConFunciones[]>([])
const cargandoPeliculas = ref(false)
const peliculaSeleccionada = ref<PeliculaConFunciones | null>(null)
const funcionSeleccionada = ref<(FuncionEmbebida & { label: string; llena: boolean }) | null>(null)

onMounted(async () => {
  cargandoPeliculas.value = true
  try {
    const data = await getPeliculas()
    peliculasConFunciones.value = (data as PeliculaConFunciones[]).filter((p) => p.activo)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error al cargar películas',
      detail: isApiError(error) ? error.message : 'No se pudo cargar la cartelera',
      life: 4000,
    })
  } finally {
    cargandoPeliculas.value = false
  }
})

const funcionesDisponibles = computed(() => {
  const funciones = peliculaSeleccionada.value?.funciones ?? []
  return funciones
    .filter((f) => f.estado.toLowerCase() !== 'cancelada')
    .map((f) => {
      const llena = f.asientos_disponibles === 0
      const label = formatearFuncionEmbebida(f) + (llena ? ' — Función Llena' : '')
      return { ...f, label, llena }
    })
})

function formatearFuncionEmbebida(funcion: FuncionEmbebida) {
  const fecha = new Date(funcion.fecha_hora)
  const fechaStr = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
  const horaStr = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${fechaStr} · ${horaStr} · ${funcion.formato} · ${funcion.salas.nombre}`
}

function continuarAAsientos() {
  if (!clienteSeleccionado.value || !peliculaSeleccionada.value || !funcionSeleccionada.value) return
  if (funcionSeleccionada.value.llena) return

  const funcion = funcionSeleccionada.value
  tienda.establecerClienteReserva(clienteSeleccionado.value.id)
  tienda.seleccionarFuncion({
    id: String(funcion.id),
    tituloPelicula: peliculaSeleccionada.value.titulo,
    cine: funcion.salas.cines.nombre,
    sala: funcion.salas.nombre,
    fecha: new Date(funcion.fecha_hora).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    }),
    hora: new Date(funcion.fecha_hora).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    formato: funcion.formato,
  })
  router.push('/asientos')
}

// ── Cancelar reserva ──
const codigoReserva = ref('')
const cargandoReserva = ref(false)
const mostrarConfirmCancelacion = ref(false)
const reservaEncontrada = ref<{
  id: number
  codigo: string
  pelicula: string
  funcion: string
  asientos: string
  cliente: string
  estado: string
} | null>(null)

// El backend mezcla casing para este campo ('activa', 'Cancelada', 'pagada'),
// así que se normaliza antes de comparar.
const estadoNormalizado = computed(() =>
  reservaEncontrada.value ? reservaEncontrada.value.estado.toLowerCase() : '',
)

// Una reserva 'pagada' sí se puede cancelar (genera reembolso); solo una
// reserva ya 'cancelada' no tiene nada más que hacer.
const yaNoSePuedeCancelar = computed(() => estadoNormalizado.value === 'cancelada')

const severidadEstado = computed(() => {
  if (estadoNormalizado.value === 'cancelada') return 'danger'
  if (estadoNormalizado.value === 'pagada') return 'success'
  return 'info'
})

function formatearFuncion(funcion: Funcion) {
  const fecha = new Date(funcion.fecha_hora).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  const hora = new Date(funcion.fecha_hora).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${fecha} · ${hora} · ${funcion.salas.nombre}`
}

async function buscarReserva() {
  const codigo = codigoReserva.value.trim().toUpperCase()
  if (!codigo) return

  cargandoReserva.value = true
  reservaEncontrada.value = null
  try {
    const { data } = await getReservas({ numero_reserva: codigo })
    const reserva = data[0]
    if (!reserva) {
      toast.add({ severity: 'error', summary: 'No encontrada', detail: 'Código de reserva inválido', life: 3000 })
      return
    }
    reservaEncontrada.value = {
      id: reserva.id,
      codigo: reserva.numero_reserva,
      pelicula: reserva.funciones.peliculas.titulo,
      funcion: formatearFuncion(reserva.funciones),
      asientos: reserva.reservaAsientos.map((ra) => ra.asientosfuncion.asientos.codigo).join(', '),
      cliente: reserva.usuarios?.nombre ?? 'N/D',
      estado: reserva.estado,
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error al buscar',
      detail: isApiError(error) ? error.message : 'No se pudo buscar la reserva',
      life: 4000,
    })
  } finally {
    cargandoReserva.value = false
  }
}

async function ejecutarCancelacion() {
  if (!reservaEncontrada.value) return
  try {
    const respuesta = await cancelReserva(reservaEncontrada.value.id)
    mostrarConfirmCancelacion.value = false
    const detalle = respuesta.reembolso
      ? `Reembolso de L. ${respuesta.reembolso.monto.toFixed(2)} (${respuesta.reembolso.porcentaje}%) se procesará en 3–5 días hábiles`
      : 'La reserva no tenía un pago registrado, no se generó reembolso'
    toast.add({
      severity: 'success',
      summary: 'Reserva cancelada',
      detail: detalle,
      life: 5000,
    })
    reservaEncontrada.value = null
    codigoReserva.value = ''
  } catch (error) {
    mostrarConfirmCancelacion.value = false
    toast.add({
      severity: 'error',
      summary: 'No se pudo cancelar',
      detail: isApiError(error) ? error.message : 'Intenta de nuevo.',
      life: 4000,
    })
  }
}
</script>

<style scoped>
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
