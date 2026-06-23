<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'


interface Reserva{
    id: number
    numero_reserva: string
    id_usuario: number
    id_funcion: number
    estado: string
}

interface Funcion { 
  id: number 
  fecha_hora: string 
  cine: string
  pelicula: string
}

interface Usuario { 
  id: number 
  email: string 
}

const Reservs: Reserva[]=[
    {
        id: 1,
        numero_reserva: "RS-1",
        id_usuario: 1,
        id_funcion: 1,
        estado: "Activa"
    },
    {
        id: 2,
        numero_reserva: "RS-2",
        id_usuario: 1,
        id_funcion: 1,
        estado: "Activa"
    },
    {
        id: 3,
        numero_reserva: "RS-3",
        id_usuario: 1,
        id_funcion: 2,
        estado: "Cancelada"
    },
]

const Funciones: Funcion[]=[
  {
    id: 1,
    fecha_hora: "6/15/2026",
    cine: "Cine Vicenta",
    pelicula: "There Will Be Blood",
  },
  {
    id: 2,
    fecha_hora: "6/17/2026",
    cine: "Cinepolis",
    pelicula: "There Will Be Blood",
  },
]

const Usuarios: Usuario[]=[
  {
    id: 1,
    email: "example.com",
  },
  {
    id: 2,
    email: "example123@unitec.edu",
  },
  {
    id: 3,
    email: "example@gmail.com",
  },
]

const reservas = ref<Reserva[]>(Reservs)

const selectedCine = ref('Todos los cines')
const selectedPelicula = ref('Todas las películas')
const selectedEstado = ref('Ambos')
const fechaDesde = ref('')
const fechaHasta = ref('')

function parseFecha(fecha: string): Date {
    const [mes, dia, anio] = fecha.split('/').map(Number)
    if(mes && dia && anio){
        return new Date(anio, mes - 1, dia)
    }else{
        return new Date(NaN)
    }
}
function fechaISO(fecha: Date) {
    return fecha.toISOString().split('T')[0]
}

const reservasFiltradas = computed(() =>
  reservas.value.filter((r) => {
    const matchCine  = selectedCine.value === 'Todos los cines' || getFuncion(r.id_funcion, 'cine').toLowerCase().includes(selectedCine.value.toLowerCase())
    const matchPelicula  = selectedPelicula.value === 'Todas las películas' || getFuncion(r.id_funcion, 'pelicula').toLowerCase().includes(selectedPelicula.value.toLowerCase())
    const matchEstado  = selectedEstado.value === 'Ambos' || r.estado.toLowerCase().includes(selectedEstado.value.toLowerCase())
    
    const fechaFuncion = parseFecha(getFuncion(r.id_funcion, 'fecha'))
    const fechaFuncionStr = fechaISO(fechaFuncion)

    let matchFecha = true

    if (fechaDesde.value && fechaFuncionStr) {
        matchFecha = matchFecha && fechaFuncionStr >= fechaDesde.value
    }

    if (fechaHasta.value && fechaFuncionStr) {
        matchFecha = matchFecha && fechaFuncionStr <= fechaHasta.value
    }
    return matchCine && matchPelicula && matchEstado && matchFecha
  })
)

function getUsuario(id: number){
    const user = Usuarios.find(u => u.id === id)
    if(user){
        return user.email;
    }else{
        return 'Usuario no existe'
    }
}

function getFuncion(id: number, type: string){
    const fun = Funciones.find(f => f.id === id)
    if(fun){
        switch(type){
            case 'cine':
                return fun.cine;
                break;
             case 'pelicula':
                return fun.pelicula;
                break;
            default:
                return fun.fecha_hora
                break;
        }
    }else{
        return 'Funcion no existe'
    }
}

const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => Math.ceil(reservasFiltradas.value.length / itemsPerPage))

const reservasPaginadas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return reservasFiltradas.value.slice(start, end)
})

function setPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}
</script>

<template>
    <AdminLayout>
    <div id="admin-cacnelacion">
    <div class="admin-header animado" style="--delay: 0ms">
    <div class="admin-page-title">Reportes de Reservas</div>
    <button class="btn btn-primary btn-sm">+ Exportar a CSV</button>
    </div>
    <div class="card animado" style="--delay: 60ms; margin-bottom:14px; margin-right: 28px; margin-left: 28px;">
        <div class="card-body">
            <div style="display:flex;gap:10px;flex-wrap:wrap">
                <input v-model="fechaDesde" type="date" style="background:var(--bg);border:1px solid var(--border2);color:var(--text2);padding:8px 12px;border-radius:var(--radius);font-size:12px;font-family:'Outfit',sans-serif;outline:none" />
                <input v-model="fechaHasta" type="date" style="background:var(--bg);border:1px solid var(--border2);color:var(--text2);padding:8px 12px;border-radius:var(--radius);font-size:12px;font-family:'Outfit',sans-serif;outline:none" />
                <select v-model="selectedCine" style="background:var(--bg);border:1px solid var(--border2);color:var(--text2);padding:8px 12px;border-radius:var(--radius);font-size:12px;font-family:'Outfit',sans-serif;outline:none"><option>Todos los cines</option><option>Cine Vicenta</option><option>Cinepolis</option></select>
                <select v-model="selectedPelicula" style="background:var(--bg);border:1px solid var(--border2);color:var(--text2);padding:8px 12px;border-radius:var(--radius);font-size:12px;font-family:'Outfit',sans-serif;outline:none"><option>Todas las películas</option><option>Alien: Romulus</option><option>There Will Be Blood</option></select>
                <select v-model="selectedEstado" style="background:var(--bg);border:1px solid var(--border2);color:var(--text2);padding:8px 12px;border-radius:var(--radius);font-size:12px;font-family:'Outfit',sans-serif;outline:none"><option>Ambos</option><option>Activa</option><option>Cancelada</option></select>
            </div>
        </div>
    </div>
    <div class="admin-body">
        <div class="card animado" style="--delay: 120ms">
        <div class="card-body" style="padding:0">
        <table class="tbl">
            <thead><tr><th class="id-th">ID</th><th>Numero Reserva</th><th>Usuario</th><th>Fecha de Funcion</th><th>Cine</th><th>Pelicula</th><th>Estado</th></tr></thead>
            <TransitionGroup tag="tbody" name="rows" appear>
                <tr v-for="(reserva, index) in reservasPaginadas" :key="reserva.id" :style="{ '--row-delay': `${index * 40}ms` }">
                    <td><strong style="font-family:'DM Mono',monospace">{{reserva.id}}</strong></td>
                    <td style="font-family:'DM Mono',monospace">{{reserva.numero_reserva}}</td>
                    <td>{{getUsuario(reserva.id_usuario)}}</td>
                    <td>{{getFuncion(reserva.id_funcion, 'fecha')}}</td>
                    <td>{{getFuncion(reserva.id_funcion, 'cine')}}</td>
                    <td>{{getFuncion(reserva.id_funcion, 'pelicula')}}</td>
                    <td>{{reserva.estado}}</td>
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