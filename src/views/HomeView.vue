<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import Skeleton from 'primevue/skeleton'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Badge from 'primevue/badge'
import { useReservaStore } from '@/stores/reserva'
const tienda = useReservaStore()
import { getPeliculas, fetchCiudades, fetchGeneros, fetchIdiomas, fetchCines } from '@/services/movieService'

interface Pelicula {
  id: number
  titulo: string
  sinopsis: string | null
  poster_url: string
  id_idioma: string | null
  id_genero: string | null
  fecha_estreno: string | null
  activo: boolean
  dur?: string,
  year?: number,
  generos?: { nombre: string }
  idiomas?: { nombre: string }
  funciones?: { id: number, fecha_hora: string, estado: string, formato: string, asientos_disponibles: number, salas: {id: number, nombre: string, cines: {id: number, nombre: string, ciudades: {nombre: string}}}}[]
}
interface Idioma {
  id: number,
  nombre: string
}
interface Genero {
  id: number,
  nombre: string
}
interface Ciudad {
  id: number,
  nombre: string
}
interface Cine { id: number; nombre: string; direccion: string | null; id_ciudad: number }
interface Funcion { id: number, fecha_hora: string, estado: string, formato: string, asientos_disponibles: number, salas: {id: number, nombre: string, cines: {id: number, nombre: string, ciudades: {nombre: string}}}}

// ── Estado ──
const router = useRouter()
const selectedCityId = ref<string>('1')
const selectedCinemaId = ref<string | null>(null)
const selectedMovie = ref<Pelicula | null>(null)
const cargandoPeliculas = ref(true)
const peliculas = ref<Pelicula[]>([])
const idiomas = ref<Idioma[]>([])
const generos = ref<Genero[]>([])
const ciudades = ref<Ciudad[]>([])
const cines = ref<Cine[]>([])

// Filtros
const searchTitle = ref('')
const selectedGenero = ref('Todos los géneros')
const selectedIdioma = ref('Todos los idiomas')
const selectedCiudad = ref('Todas las ciudades')

setTimeout(() => { cargandoPeliculas.value = false }, 800)

watch(selectedCityId, () => { selectedCinemaId.value = null })

onMounted(async () => {
  try{
    const [response] = await Promise.all([getPeliculas()]);
    const [filtersResponse1] = await Promise.all([fetchCiudades()]);
    const [filtersResponse2] = await Promise.all([fetchIdiomas()]);
    const [filtersResponse3] = await Promise.all([fetchGeneros()]);
    const [cinesRes] = await Promise.all([fetchCines()]);
    peliculas.value = response;
    ciudades.value = filtersResponse1;
    idiomas.value = filtersResponse2;
    generos.value = filtersResponse3;
    cines.value = cinesRes;
  }catch(error){
    throw new Error('Ocurrio un error.')
  }
})

// ── Computed ──

const filteredCinemas = computed(() => {  
    const nombres = new Set(selectedMovie.value?.funciones?.map(f => f.salas.cines.nombre))
    return cines.value.filter(c => nombres.has(c.nombre))
})
const cineActual = computed(() => cines.value.find((c) => String(c.id) === selectedCinemaId.value))

const peliculasFiltradas = computed(() =>
  peliculas.value.filter((p) => {
    const matchTitulo  = searchTitle.value === '' || p.titulo.toLowerCase().includes(searchTitle.value.toLowerCase())
    const matchGenero  = selectedGenero.value === 'Todos los géneros' || p.generos?.nombre.toLowerCase() === selectedGenero.value.toLowerCase()
    const matchIdioma  = selectedIdioma.value === 'Todos los idiomas' || p.idiomas?.nombre.toLowerCase() === selectedIdioma.value.toLowerCase()
    const matchCiudad  = selectedCiudad.value === 'Todas las ciudades' || p.funciones?.some(f => f.salas.cines.ciudades.nombre.toLowerCase().includes(selectedCiudad.value.toLowerCase()))
    return matchTitulo && matchGenero && matchIdioma && matchCiudad
  })
)

const funcionesDisponibles = computed(() => {
  const grupos: Record<string, Funcion[]> = {}
  if(!selectedMovie.value?.funciones || !cineActual.value) return;
  selectedMovie.value.funciones
  .filter((f) => f.salas.cines.id === cineActual.value!.id)
  .forEach((f) => {
    const fecha = new Date(f.fecha_hora)
    const fechaStr = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
    const cap = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1)
    if (!grupos[cap]) grupos[cap] = []
    grupos[cap].push(f)
  })
  return grupos
})

// ── Funciones ──
function formatearHora(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function funcionLlena(funcion: Funcion) {
  return funcion.asientos_disponibles === 0
}
function seleccionarPelicula(movie: Pelicula) {
  selectedMovie.value = movie
  selectedCinemaId.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function cleanFilters(){
  searchTitle.value = ''
  selectedGenero.value = 'Todos los géneros' 
  selectedIdioma.value ='Todos los idiomas'
  selectedCiudad.value = 'Todas las ciudades'
}
function limpiarSeleccion() { selectedMovie.value = null; selectedCinemaId.value = null }
function irAAsientos(funcionId: number) {
  let pelicula: Pelicula | undefined;
  let funcion: Funcion | undefined;

  for(const p of peliculas.value){
    funcion = p.funciones?.find(f => f.id === funcionId);
    if(funcion){
      pelicula = p;
      break;
    }
  }
  if(!funcion || !pelicula) return;
  if(funcionLlena(funcion)) return;

  tienda.seleccionarFuncion({
    id: String(funcion.id),
    tituloPelicula: pelicula.titulo ?? '',
    cine: funcion.salas.cines.nombre ?? '',
    sala: funcion.salas.nombre ? `Sala ${funcion.salas.id}` : '',
    fecha: new Date(funcion.fecha_hora).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    }),
    hora: formatearHora(funcion.fecha_hora),
    formato: funcion.formato,
  });

  router.push('/asientos')
}
</script>

<template>
  <div class="home-screen">
    <NavBar @logo-click="limpiarSeleccion" @home-click="limpiarSeleccion" />

    <div class="content">
      <Transition name="fade" mode="out-in">

        <!-- ── HERO cartelera ── -->
        <header v-if="!selectedMovie" key="hero-cartelera" class="hero">
          <div class="hero-inner">
            <div class="hero-eyebrow animado" style="--delay: 0ms">Cartelera semanal</div>
            <h1 class="animado" style="--delay: 80ms">Esta noche<br />en <em>pantalla</em></h1>
            <div class="search-bar animado" style="--delay: 160ms">
              <IconField class="search-field">
                <InputIcon class="pi pi-search" />
                <InputText v-model="searchTitle" placeholder="Buscar película…" fluid />
              </IconField>
              <select v-model="selectedCiudad" class="select-native">
                <option>Todas las ciudades</option>
                <option v-for="c in ciudades">{{ c.nombre }}</option>
              </select>
              <select v-model="selectedIdioma" class="select-native">
                <option>Todos los idiomas</option>
                <option v-for="i in idiomas">{{ i.nombre }}</option>
              </select>
              <select v-model="selectedGenero" class="select-native">
                <option>Todos los géneros</option>
                <option v-for="g in generos">{{ g.nombre }}</option>
              </select>
              <button @click='cleanFilters' 
              class="select-native">Quitar Filtros</button>
            </div>
          </div>
        </header>

        <!-- ── DETAIL HERO ── -->
        <header v-else key="hero-detalle" class="detail-hero">
          <div class="detail-inner">
            <div class="detail-left">
              <button class="back-btn animado" style="--delay: 0ms" @click="limpiarSeleccion">Cartelera</button>
              <img
                class="detail-poster animado"
                style="--delay: 60ms"
                :src="selectedMovie.poster_url"
                :alt="selectedMovie.titulo"
              />
            </div>
            <div class="detail-info">
              <div class="detail-chips animado" style="--delay: 80ms">
                <span class="badge badge-orange">{{ selectedMovie.generos?.nombre }}</span>
              </div>
              <h1 class="detail-title animado" style="--delay: 130ms">{{ selectedMovie.titulo }}</h1>
              <p class="detail-tagline animado" style="--delay: 170ms">En cartelera {{ cineActual?.nombre }}</p>
              <p class="detail-desc animado" style="--delay: 200ms">{{ selectedMovie.sinopsis }}</p>
              <div class="detail-stats animado" style="--delay: 240ms">
                <div class="dstat"><div class="dstat-val">{{ selectedMovie.dur }}</div><div class="dstat-lbl">Duración</div></div>
                <div class="dstat"><div class="dstat-val">{{ selectedMovie.year }}</div><div class="dstat-lbl">Año</div></div>
                <div class="dstat"><div v-for="idioma in selectedMovie.idiomas" class="dstat-val">{{ idioma }}</div><div class="dstat-lbl">Idioma</div></div>
              </div>
            </div>
          </div>
        </header>

      </Transition>

      <main class="page">
        <Transition name="fade" mode="out-in">

          <!-- ── CARTELERA ── -->
          <div v-if="!selectedMovie" key="cartelera">
            <div class="eyebrow animado" style="--delay: 240ms">En cartelera ahora</div>

            <!-- Skeletons -->
            <div v-if="cargandoPeliculas" class="movies-grid">
              <div v-for="i in 6" :key="i" class="movie-card-skeleton">
                <Skeleton height="320px" border-radius="8px 8px 0 0" />
                <div style="padding: 10px 12px 14px; display:flex; flex-direction:column; gap:6px">
                  <Skeleton height="14px" width="85%" />
                  <Skeleton height="10px" width="50%" />
                </div>
              </div>
            </div>

            <!-- Cards con entrada escalonada -->
            <TransitionGroup v-else name="cards" tag="div" class="movies-grid" appear>
              <div
                v-for="(movie, index) in peliculasFiltradas"
                :key="movie.id"
                class="movie-card"
                :style="{ '--card-delay': `${280 + index * 60}ms` }"
                @click="seleccionarPelicula(movie)"
              >
                <div
                  class="movie-poster"
                  :style="{ backgroundImage: `url(${movie.poster_url})` }"
                >
                  <div class="movie-poster-fade" />
                  <div class="movie-genre">{{ movie.generos?.nombre }}</div>
                </div>
                <div class="movie-info">
                  <div class="movie-title">{{ movie.titulo }}</div>
                  <div class="movie-meta">{{ movie.year }} · {{ movie.dur }}</div>
                </div>
              </div>
              <div v-if="peliculasFiltradas.length === 0" key="empty" class="empty-state">
                No se encontraron resultados.
              </div>
            </TransitionGroup>
          </div>

          <!-- ── SELECCIÓN DE CINE ── -->
          <div v-else-if="!selectedCinemaId" key="cines" class="cine-selection">
            <div class="eyebrow animado" style="--delay: 0ms">Disponible en</div>
            <div
              v-for="(cine, index) in filteredCinemas"
              :key="cine.id"
              class="cine-item animado"
              :style="{ '--delay': `${60 + index * 70}ms` }"
              @click="selectedCinemaId = String(cine.id)"
            >
              <div>
                <div class="cine-item-name">{{ cine.nombre }}</div>
                <div class="cine-item-meta">
                  {{ cine.direccion }}
                </div>
              </div>
              <span class="cine-item-arrow">›</span>
            </div>
          </div>

          <!-- ── FUNCIONES ── -->
          <div v-else key="funciones" class="funciones-container">
            <button class="back-btn animado" style="--delay: 0ms" @click="selectedCinemaId = null">Cambiar cine</button>
            <div class="eyebrow animado" style="--delay: 50ms">Funciones en {{ cineActual?.nombre }}</div>

            <div v-if="Object.keys(funcionesDisponibles || '').length === 0" class="empty-showtimes animado" style="--delay: 80ms">
              No hay funciones programadas para esta película en el cine seleccionado.
            </div>

            <div
              v-for="(times, date, gi) in funcionesDisponibles"
              :key="date"
              class="date-group animado"
              :style="{ '--delay': `${80 + (gi as number) * 80}ms` }"
            >
              <div class="funcion-day">{{ date }}</div>
              <div class="funciones-row">
                <button
                  v-for="(s, si) in times"
                  :key="s.id"
                  class="funcion-btn animado"
                  :class="{ 'funcion-btn-llena': funcionLlena(s) }"
                  :style="{ '--delay': `${100 + (gi as number) * 80 + si * 50}ms` }"
                  :disabled="funcionLlena(s)"
                  @click="irAAsientos(s.id)"
                >
                  <div class="funcion-time">{{ formatearHora(s.fecha_hora) }}</div>
                  <div class="funcion-format">{{ s.formato }}</div>
                  <div v-if="funcionLlena(s)" class="funcion-avail llena">Función Llena</div>
                </button>
              </div>
            </div>
          </div>

        </Transition>
      </main>
    </div>
  </div>
</template>

<style scoped>
.home-screen { min-height: 100vh; display: flex; flex-direction: column; }
.content { flex: 1; }

/* ── Animaciones ── */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animado {
  opacity: 0;
  animation: slideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--delay, 0ms);
}
.cards-enter-active {
  animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--card-delay, 0ms);
  opacity: 0;
}
.cards-leave-active { transition: opacity .15s ease, transform .15s ease; }
.cards-leave-to { opacity: 0; transform: scale(.97); }
.cards-move { transition: transform .3s ease; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease, transform .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(8px); }

/* ── Hero ── */
.hero {
  background: var(--rosewood);
  padding: 28px 24px 22px;
  border-bottom: 1px solid var(--border);
}
.hero-inner { max-width: 980px; margin: 0 auto; }
.hero-eyebrow {
  font-size: 10px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase;
  color: rgba(250,240,236,.45); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
}
.hero-eyebrow::after { content: ''; flex: 1; height: .5px; background: rgba(250,240,236,.15); max-width: 60px; }
.hero h1 {
  font-family: 'DM Serif Display', serif; font-size: 38px;
  color: #faf0ec; line-height: 1.05; margin-bottom: 16px;
}
.hero h1 em { font-style: italic; color: var(--tangelo); }

.search-bar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.search-field { flex: 1; min-width: 200px; }
.select-native {
  background: rgba(250,240,236,.08); border: 1px solid rgba(250,240,236,.15);
  color: rgba(250,240,236,.7); padding: 10px 12px; border-radius: var(--radius);
  font-size: 12px; font-family: 'Outfit', sans-serif; outline: none; cursor: pointer;
  transition: border-color .2s;
}
.select-native:focus { border-color: var(--tangelo); }
.select-native option { background: var(--text); color: #fff; }

/* ── Detail hero ── */
.detail-hero { background: var(--surface); padding: 26px 24px; border-bottom: 1px solid var(--border); }
.detail-inner { max-width: 980px; margin: 0 auto; display: flex; gap: 28px; align-items: flex-start; }
.detail-left { display: flex; flex-direction: column; gap: 12px; }
.detail-poster {
  width: 160px; aspect-ratio: 2/3; object-fit: cover;
  border-radius: var(--radius); border: 1px solid var(--border2);
  display: block;
}
.detail-info { flex: 1; }
.detail-title { font-family: 'DM Serif Display', serif; font-size: 36px; color: var(--text); line-height: 1; margin-top: 4px; }
.detail-tagline { font-size: 13px; color: var(--text3); margin: 6px 0 12px; }
.detail-desc { font-size: 14px; color: var(--text2); line-height: 1.7; max-width: 540px; }
.detail-chips { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 4px; }
.detail-stats { display: flex; gap: 24px; margin-top: 16px; }
.dstat-val { font-size: 18px; font-weight: 600; color: var(--text); }
.dstat-lbl { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }

/* ── Page ── */
.page { max-width: 980px; margin: 0 auto; padding: 28px 24px; }
.eyebrow { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }

/* ── Grid ── */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 16px;
}
.movie-card {
  cursor: pointer; border-radius: var(--radius); overflow: hidden;
  background: var(--surface); border: 1px solid var(--border);
  transition: transform .2s, border-color .2s, box-shadow .2s;
}
.movie-card:hover {
  transform: translateY(-4px);
  border-color: var(--border2);
  box-shadow: 0 8px 24px rgba(42,10,6,.1);
}
.movie-card-skeleton { border-radius: var(--radius); overflow: hidden; background: var(--surface); border: 1px solid var(--border); }
.movie-poster {
  width: 100%; aspect-ratio: 2/3;
  background-size: cover; background-position: center;
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: 10px; position: relative; overflow: hidden;
}
.movie-poster-fade {
  position: absolute; bottom: 0; left: 0; right: 0; height: 50%;
  background: linear-gradient(transparent, rgba(42,10,6,.7));
}
.movie-genre {
  position: relative; z-index: 1; font-size: 9px; font-weight: 600;
  letter-spacing: 1.5px; text-transform: uppercase; color: var(--orange);
}
.movie-info { padding: 10px 12px 14px; border-top: 1px solid var(--border); }
.movie-title { font-size: 13px; font-weight: 600; color: var(--text); line-height: 1.3; margin-bottom: 4px; }
.movie-meta { font-size: 11px; color: var(--text3); font-family: 'DM Mono', monospace; }
.empty-state { grid-column: 1/-1; padding: 60px 0; text-align: center; color: var(--text3); font-size: 14px; }

/* ── Cines ── */
.cine-item {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 14px 18px; margin-bottom: 8px; display: flex; justify-content: space-between;
  align-items: center; cursor: pointer; transition: border-color .2s;
}
.cine-item:hover { border-color: var(--border2); }
.cine-item-name { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
.cine-item-meta { font-size: 12px; color: var(--text3); }
.cine-item-arrow { color: var(--text3); font-size: 18px; }

/* ── Funciones ── */
.funciones-container { padding-top: 4px; }
.funcion-day { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 2px; margin: 20px 0 10px; }
.funciones-row { display: flex; gap: 10px; flex-wrap: wrap; }
.funcion-btn {
  background: var(--surface); border: 1px solid var(--border2); border-radius: var(--radius);
  padding: 10px 16px; cursor: pointer; font-family: 'Outfit', sans-serif; text-align: left; transition: all .2s;
}
.funcion-btn:hover { border-color: var(--tangelo); background: rgba(243,80,10,.04); }
.funcion-btn:disabled,
.funcion-btn.funcion-btn-llena {
  opacity: .5;
  cursor: not-allowed;
  background: var(--bg);
}
.funcion-btn.funcion-btn-llena:hover { border-color: var(--border2); background: var(--bg); }
.funcion-time { font-size: 16px; font-weight: 600; color: var(--text); font-family: 'DM Mono', monospace; }
.funcion-format { font-size: 11px; color: var(--text3); margin-top: 2px; }
.funcion-avail { font-size: 11px; color: #1e783c; margin-top: 6px; display: flex; align-items: center; gap: 5px; }
.funcion-avail.low { color: var(--orange); }
.funcion-avail.llena { color: var(--text3); font-weight: 600; }
.empty-showtimes { padding: 40px 0; color: var(--text3); font-size: 14px; }

/* ── Badges ── */
.badge { display: inline-block; padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 500; }
.badge-orange { background: rgba(243,113,0,.12); color: var(--orange); }
.badge-gray { background: rgba(42,10,6,.07); color: var(--text2); }

/* ── Back btn ── */
.back-btn {
  display: inline-flex; align-items: center; gap: 5px;
  background: none; border: none; color: var(--text3); font-size: 13px;
  cursor: pointer; font-family: 'Outfit', sans-serif; padding: 8px 0; margin-bottom: 12px; transition: color .2s;
}
.back-btn::before { content: '←'; }
.back-btn:hover { color: var(--text2); }
</style>
