<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

// Interfaces
interface Pelicula {
  id: number
  titulo: string
  sinopsis: string | null
  poster_url: string | null
  id_idioma: number | null
  id_genero: number | null
  fecha_estreno: string | null
  activo: boolean
  generos?: { nombre: string }
  idiomas?: { nombre: string }
  // Metadata para el prototipo (UI)
  metadata: {
    dur: string
    rating: string
    year: number
    color: string
    accent: string
  }
}

interface Ciudad {
  id: number
  nombre: string
}

interface Cine {
  id: number
  nombre: string
  direccion: string | null
  id_ciudad: number
}

interface Funcion {
  id: number
  id_pelicula: number
  id_sala: number
  id_cine: number
  fecha_hora: string // ISO string
  estado: string
  // Metadata UI
  formato: string
  disponibles: number
}

// --- Mock Data ---
const CIUDADES: Ciudad[] = [
  { id: 1, nombre: 'Puerto Cortés' },
  { id: 2, nombre: 'San Pedro Sula' },
  { id: 3, nombre: 'Tegucigalpa' },
]

const CINES: Cine[] = [
  { id: 1, nombre: 'Cine Vicenta', direccion: 'Barrio El Centro', id_ciudad: 1 },
  { id: 2, nombre: 'Cinemark City SPS', direccion: 'City Center Mall', id_ciudad: 2 },
  { id: 3, nombre: 'Metrocinema Tegus', direccion: 'Multiplaza', id_ciudad: 3 },
]

const MOVIES: Pelicula[] = [
  {
    id: 1,
    titulo: 'Venom: El Último Baile',
    sinopsis: 'Eddie Brock emprende un último viaje junto a Venom.',
    poster_url: null,
    id_idioma: 1,
    id_genero: 1,
    fecha_estreno: '2024-10-25',
    activo: true,
    generos: { nombre: 'Acción' },
    idiomas: { nombre: 'Español' },
    metadata: { dur: '1h 49m', rating: '★★★★', year: 2024, color: '#1A1535', accent: '#7B2FF7' },
  },
  {
    id: 2,
    titulo: 'El Pingüino',
    sinopsis: 'La oscura historia de origen del villano de Gotham.',
    poster_url: null,
    id_idioma: 1,
    id_genero: 2,
    fecha_estreno: '2024-09-19',
    activo: true,
    generos: { nombre: 'Drama' },
    idiomas: { nombre: 'Español' },
    metadata: { dur: '1h 55m', rating: '★★★★', year: 2024, color: '#0D1F2D', accent: '#4A90D9' },
  },
  {
    id: 3,
    titulo: 'Terrifier 3',
    sinopsis: 'El payaso Art regresa en Navidad.',
    poster_url: null,
    id_idioma: 1,
    id_genero: 3,
    fecha_estreno: '2024-10-11',
    activo: true,
    generos: { nombre: 'Terror' },
    idiomas: { nombre: 'Español' },
    metadata: { dur: '2h 5m', rating: '★★★', year: 2024, color: '#2D0A0A', accent: '#CC2200' },
  },
  {
    id: 4,
    titulo: 'Wild Robot',
    sinopsis: 'Una robot aprende a sobrevivir en la naturaleza.',
    poster_url: null,
    id_idioma: 1,
    id_genero: 4,
    fecha_estreno: '2024-09-27',
    activo: true,
    generos: { nombre: 'Animación' },
    idiomas: { nombre: 'Español' },
    metadata: { dur: '1h 42m', rating: '★★★★★', year: 2024, color: '#0A1F10', accent: '#3D9A52' },
  },
  {
    id: 5,
    titulo: 'Megalopolis',
    sinopsis: 'Una utopía épica sobre el futuro de la civilización.',
    poster_url: null,
    id_idioma: 2,
    id_genero: 2,
    fecha_estreno: '2024-09-27',
    activo: true,
    generos: { nombre: 'Drama' },
    idiomas: { nombre: 'Subtitulada' },
    metadata: { dur: '2h 18m', rating: '★★★', year: 2024, color: '#1C1500', accent: '#D4A017' },
  },
  {
    id: 6,
    titulo: 'Alien: Romulus',
    sinopsis: 'Un grupo explora una estación espacial abandonada.',
    poster_url: null,
    id_idioma: 3,
    id_genero: 5,
    fecha_estreno: '2024-08-16',
    activo: true,
    generos: { nombre: 'Sci-Fi' },
    idiomas: { nombre: 'Español / Sub' },
    metadata: { dur: '1h 59m', rating: '★★★★', year: 2024, color: '#0A0F1A', accent: '#2A7AFF' },
  },
]

const FUNCIONES: Funcion[] = [
  {
    id: 101,
    id_pelicula: 6,
    id_sala: 4,
    id_cine: 1,
    fecha_hora: '2026-06-12T14:00:00Z',
    estado: 'activa',
    formato: '2D · Español',
    disponibles: 68,
  },
  {
    id: 102,
    id_pelicula: 6,
    id_sala: 4,
    id_cine: 1,
    fecha_hora: '2026-06-12T19:15:00Z',
    estado: 'activa',
    formato: '3D · Español',
    disponibles: 91,
  },
  {
    id: 103,
    id_pelicula: 6,
    id_sala: 4,
    id_cine: 1,
    fecha_hora: '2026-06-13T18:00:00Z',
    estado: 'activa',
    formato: '3D · Subtitulada',
    disponibles: 55,
  },
  {
    id: 104,
    id_pelicula: 1,
    id_sala: 4,
    id_cine: 1,
    fecha_hora: '2026-06-12T16:30:00Z',
    estado: 'activa',
    formato: '2D · Subtitulada',
    disponibles: 42,
  },
  {
    id: 105,
    id_pelicula: 1,
    id_sala: 2,
    id_cine: 1,
    fecha_hora: '2026-06-12T21:45:00Z',
    estado: 'activa',
    formato: 'IMAX · Español',
    disponibles: 12,
  },
  // Funciones en SPS
  {
    id: 201,
    id_pelicula: 2,
    id_sala: 1,
    id_cine: 2,
    fecha_hora: '2026-06-12T18:00:00Z',
    estado: 'activa',
    formato: '2D · Español',
    disponibles: 45,
  },
  {
    id: 202,
    id_pelicula: 4,
    id_sala: 1,
    id_cine: 2,
    fecha_hora: '2026-06-12T15:00:00Z',
    estado: 'activa',
    formato: '2D · Español',
    disponibles: 30,
  },
  // Funciones en Tegus
  {
    id: 301,
    id_pelicula: 3,
    id_sala: 1,
    id_cine: 3,
    fecha_hora: '2026-06-12T20:00:00Z',
    estado: 'activa',
    formato: '2D · Español',
    disponibles: 20,
  },
  {
    id: 302,
    id_pelicula: 5,
    id_sala: 1,
    id_cine: 3,
    fecha_hora: '2026-06-12T17:00:00Z',
    estado: 'activa',
    formato: '2D · Subtitulada',
    disponibles: 15,
  },
]

// --- State ---
const router = useRouter()
const searchQuery = ref('')
const debouncedQuery = ref('')
const selectedCityId = ref(1)
const selectedCinemaId = ref<number | null>(null)
const activeGenre = ref('')
const selectedMovie = ref<Pelicula | null>(null)

// --- Logic ---
let searchTimeout: any
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedQuery.value = val
  }, 300)
})

// Resetear cine al cambiar de ciudad
watch(selectedCityId, () => {
  selectedCinemaId.value = null
})

const filteredCinemas = computed(() => {
  return CINES.filter((c) => c.id_ciudad === selectedCityId.value)
})

const filteredMovies = computed(() => {
  let list = MOVIES

  // Filtrar por Ciudad/Cine (Solo mostrar películas con funciones en la ubicación seleccionada)
  const cinemasInCity = filteredCinemas.value.map((c) => c.id)
  const targetCinemaIds = selectedCinemaId.value ? [selectedCinemaId.value] : cinemasInCity

  const movieIdsWithFunctions = FUNCIONES.filter((f) => targetCinemaIds.includes(f.id_cine)).map(
    (f) => f.id_pelicula,
  )

  const uniqueMovieIds = [...new Set(movieIdsWithFunctions)]
  list = list.filter((m) => uniqueMovieIds.includes(m.id))

  // Filtrar por Género
  if (activeGenre.value) {
    list = list.filter((m) => m.generos?.nombre === activeGenre.value)
  }

  // Filtrar por Búsqueda
  if (debouncedQuery.value) {
    const q = debouncedQuery.value.toLowerCase()
    list = list.filter(
      (m) => m.titulo.toLowerCase().includes(q) || m.generos?.nombre.toLowerCase().includes(q),
    )
  }
  return list
})

const filteredFunctions = computed(() => {
  if (!selectedMovie.value) return []

  // Si hay un cine seleccionado, solo mostramos funciones de ese cine
  // Si no, mostramos funciones de todos los cines de la ciudad seleccionada
  const cinemasInCity = filteredCinemas.value.map((c) => c.id)
  const targetCinemaIds = selectedCinemaId.value ? [selectedCinemaId.value] : cinemasInCity

  return FUNCIONES.filter(
    (f) => f.id_pelicula === selectedMovie.value!.id && targetCinemaIds.includes(f.id_cine),
  )
})

const functionsByDate = computed(() => {
  const groups: Record<string, Funcion[]> = {}
  filteredFunctions.value.forEach((f) => {
    const date = new Date(f.fecha_hora)
    const dateStr = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    })
    const capitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

    if (!groups[capitalized]) groups[capitalized] = []
    groups[capitalized].push(f)
  })
  return groups
})

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function selectMovie(movie: Pelicula) {
  selectedMovie.value = movie
  selectedCinemaId.value = null // Reset cine al cambiar de película
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function selectCinema(cinemaId: number) {
  selectedCinemaId.value = cinemaId
}

function clearSelection() {
  selectedMovie.value = null
  selectedCinemaId.value = null
}

function goToSeats(funcionId: number) {
  router.push({ path: '/asientos', query: { funcion: funcionId } })
  console.log('Navegando a asientos para función:', funcionId)
}

function selectGenre(genre: string) {
  activeGenre.value = genre
}

const currentCinema = computed(() => CINES.find((c) => c.id === selectedCinemaId.value))
</script>

<template>
  <div class="home-screen">
    <!-- Nav -->
    <NavBar @logo-click="clearSelection" @home-click="clearSelection" />

    <div class="content">
      <!-- HERO (Solo se muestra en la cartelera principal) -->
      <header v-if="!selectedMovie" class="hero">
        <div class="hero-inner">
          <div class="hero-eyebrow">Cartelera semanal</div>
          <h1>Esta noche<br />en <em>pantalla</em></h1>
          <div class="search-bar">
            <input v-model="searchQuery" placeholder="Buscar película o género…" />
            <select v-model="selectedCityId">
              <option v-for="c in CIUDADES" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>
            <select v-model="selectedCinemaId">
              <option :value="null">Todos los cines</option>
              <option v-for="c in filteredCinemas" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>
            <button>Buscar</button>
          </div>
        </div>
      </header>

      <!-- DETAIL HERO (Se muestra cuando hay una película seleccionada) -->
      <header v-else class="detail-hero">
        <div class="detail-inner">
          <div class="detail-left">
            <button class="back-btn" @click="clearSelection">Volver a Cartelera</button>
            <div
              class="detail-poster"
              :style="{
                background: selectedMovie.metadata.color,
                color: selectedMovie.metadata.accent,
              }"
            >
              {{ selectedMovie.titulo }}
            </div>
          </div>
          <div class="detail-info">
            <div class="detail-chips">
              <span class="badge badge-orange">{{ selectedMovie.generos?.nombre }}</span>
              <span class="badge badge-gray">PG-13</span>
            </div>
            <h1 class="detail-title">{{ selectedMovie.titulo }}</h1>
            <p class="detail-tagline">
              En cartelera · {{ currentCinema?.nombre || 'Varios cines' }}
            </p>
            <p class="detail-desc">{{ selectedMovie.sinopsis }}</p>
            <div class="detail-stats">
              <div class="dstat">
                <div class="dstat-val">{{ selectedMovie.metadata.dur }}</div>
                <div class="dstat-lbl">Duración</div>
              </div>
              <div class="dstat">
                <div class="dstat-val">{{ selectedMovie.metadata.rating }}</div>
                <div class="dstat-lbl">Rating</div>
              </div>
              <div class="dstat">
                <div class="dstat-val">{{ selectedMovie.metadata.year }}</div>
                <div class="dstat-lbl">Año</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="page">
        <!-- VISTA: CARTELERA -->
        <div v-if="!selectedMovie">
          <div class="filter-pills">
            <button class="pill" :class="{ active: activeGenre === '' }" @click="selectGenre('')">
              Todos
            </button>
            <button
              v-for="g in ['Acción', 'Drama', 'Terror', 'Animación', 'Sci-Fi']"
              :key="g"
              class="pill"
              :class="{ active: activeGenre === g }"
              @click="selectGenre(g)"
            >
              {{ g }}
            </button>
          </div>

          <div class="eyebrow">En cartelera ahora</div>
          <div class="movies-grid">
            <div
              v-for="movie in filteredMovies"
              :key="movie.id"
              class="movie-card"
              @click="selectMovie(movie)"
            >
              <div class="movie-poster" :style="{ background: movie.metadata.color }">
                <div class="movie-poster-fade"></div>
                <div class="movie-genre">{{ movie.generos?.nombre }}</div>
                <div class="movie-title-overlay">{{ movie.titulo }}</div>
              </div>
              <div class="movie-info">
                <div class="movie-times">19:15 · 21:45</div>
              </div>
            </div>
            <div v-if="filteredMovies.length === 0" class="empty-state">
              No se encontraron resultados.
            </div>
          </div>
        </div>

        <!-- VISTA: SELECCIÓN DE CINE -->
        <div v-else-if="!selectedCinemaId" class="cine-selection">
          <div class="eyebrow">Disponible en</div>
          <div
            v-for="cine in filteredCinemas"
            :key="cine.id"
            class="cine-item"
            @click="selectCinema(cine.id)"
          >
            <div>
              <div class="cine-item-name">{{ cine.nombre }}</div>
              <div class="cine-item-meta">
                {{ CIUDADES.find((c) => c.id === cine.id_ciudad)?.nombre }} · {{ cine.direccion }}
              </div>
            </div>
            <span class="cine-item-arrow">›</span>
          </div>
        </div>

        <!-- VISTA: FUNCIONES DISPONIBLES -->
        <div v-else class="funciones-container">
          <button class="back-btn" @click="selectedCinemaId = null">Cambiar cine</button>
          <div class="eyebrow">Funciones en {{ currentCinema?.nombre }}</div>

          <div v-if="Object.keys(functionsByDate).length === 0" class="empty-showtimes">
            No hay funciones programadas para esta película en el cine seleccionado.
          </div>

          <div v-for="(times, date) in functionsByDate" :key="date" class="date-group">
            <div class="funcion-day">{{ date }}</div>
            <div class="funciones-row">
              <button v-for="s in times" :key="s.id" class="funcion-btn" @click="goToSeats(s.id)">
                <div class="funcion-time">{{ formatTime(s.fecha_hora) }}</div>
                <div class="funcion-format">{{ s.formato }}</div>
                <div class="funcion-avail" :class="{ low: s.disponibles < 20 }">
                  ● {{ s.disponibles }} disponibles
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.home-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Content */
.content {
  flex: 1;
}

.hero {
  background: var(--surface);
  padding: 28px 24px 22px;
  border-bottom: 1px solid var(--border);
}
.hero-inner {
  max-width: 980px;
  margin: 0 auto;
}
.hero-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--text3);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.hero-eyebrow::after {
  content: '';
  flex: 1;
  height: 0.5px;
  background: var(--border);
  max-width: 60px;
}
.hero h1 {
  font-family: 'DM Serif Display', serif;
  font-size: 38px;
  color: var(--text);
  line-height: 1.05;
  margin-bottom: 16px;
}
.hero h1 em {
  font-style: italic;
  color: var(--tangelo);
}

.search-bar {
  display: flex;
  gap: 8px;
}
.search-bar input {
  flex: 1;
  background: var(--bg);
  border: 1px solid var(--border2);
  color: var(--text);
  padding: 10px 14px;
  border-radius: var(--radius);
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  outline: none;
}
.search-bar select {
  background: var(--bg);
  border: 1px solid var(--border2);
  color: var(--text2);
  padding: 10px 12px;
  border-radius: var(--radius);
  font-size: 12px;
  font-family: 'Outfit', sans-serif;
  outline: none;
}
.search-bar button {
  background: var(--sinopia);
  border: none;
  color: #fff;
  padding: 10px 18px;
  border-radius: var(--radius);
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

/* Page */
.page {
  max-width: 980px;
  margin: 0 auto;
  padding: 28px 24px;
}

.eyebrow {
  font-size: 11px;
  font-weight: 600;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.filter-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.pill {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border2);
  color: var(--text2);
  background: transparent;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
}
.pill.active {
  background: var(--rosewood);
  border-color: var(--rosewood);
  color: #faf0ec;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
  gap: 12px;
}
.movie-card {
  cursor: pointer;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  transition:
    transform 0.2s,
    border-color 0.2s;
}
.movie-card:hover {
  transform: translateY(-3px);
  border-color: var(--border2);
}
.movie-poster {
  width: 100%;
  aspect-ratio: 2/3;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 10px;
  position: relative;
  overflow: hidden;
  font-family: 'DM Serif Display', serif;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  text-align: center;
  align-items: center;
}
.movie-poster-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65%;
  background: linear-gradient(transparent, rgba(42, 10, 6, 0.88));
}
.movie-genre {
  position: relative;
  z-index: 1;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--orange);
  margin-bottom: 3px;
}
.movie-title-overlay {
  position: relative;
  z-index: 1;
  font-family: 'DM Serif Display', serif;
  font-size: 13px;
  color: #faf0ec;
  line-height: 1.2;
}
.movie-info {
  padding: 8px 12px 12px;
  border-top: 1px solid var(--border);
}
.movie-times {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: var(--text3);
}

.empty-state {
  grid-column: 1 / -1;
  padding: 60px 0;
  text-align: center;
  color: var(--text3);
  font-size: 14px;
}

/* Detail Hero */
.detail-hero {
  background: var(--surface);
  padding: 26px 24px;
  border-bottom: 1px solid var(--border);
}
.detail-inner {
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  gap: 28px;
  align-items: flex-start;
}
.detail-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.detail-poster {
  width: 140px;
  aspect-ratio: 2 / 3;
  flex-shrink: 0;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Serif Display', serif;
  font-size: 16px;
  padding: 16px;
  text-align: center;
  font-style: italic;
}
.detail-info {
  flex: 1;
}
.detail-title {
  font-family: 'DM Serif Display', serif;
  font-size: 36px;
  color: var(--text);
  line-height: 1;
  margin-top: 4px;
}
.detail-tagline {
  font-size: 13px;
  color: var(--text3);
  margin: 6px 0 12px;
}
.detail-desc {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.7;
  max-width: 540px;
}
.detail-chips {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.detail-stats {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}
.dstat-val {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}
.dstat-lbl {
  font-size: 10px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 2px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: var(--text3);
  font-size: 13px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  padding: 8px 0;
  margin-bottom: 4px;
  transition: color 0.2s;
}
.back-btn::before {
  content: '←';
}
.back-btn:hover {
  color: var(--text2);
}

/* Cine Selection */
.cine-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 18px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.2s;
}
.cine-item:hover {
  border-color: var(--border2);
}
.cine-item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
}
.cine-item-meta {
  font-size: 12px;
  color: var(--text3);
}
.cine-item-arrow {
  color: var(--text3);
  font-size: 18px;
}

/* Funciones */
.funciones-container {
  padding-top: 4px;
}
.funcion-day {
  font-size: 11px;
  font-weight: 600;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 20px 0 10px;
}
.funciones-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.funcion-btn {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  padding: 10px 16px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  text-align: left;
  transition: all 0.2s;
}
.funcion-btn:hover {
  border-color: var(--tangelo);
  background: rgba(243, 80, 10, 0.04);
}
.funcion-time {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  font-family: 'DM Mono', monospace;
}
.funcion-format {
  font-size: 11px;
  color: var(--text3);
  margin-top: 2px;
}
.funcion-avail {
  font-size: 11px;
  color: #1e783c;
  margin-top: 4px;
}
.funcion-avail.low {
  color: var(--orange);
}

/* Badges */
.badge {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}
.badge-orange {
  background: rgba(243, 113, 0, 0.12);
  color: var(--orange);
}
.badge-gray {
  background: rgba(42, 10, 6, 0.07);
  color: var(--text2);
}

.empty-showtimes {
  padding: 40px 0;
  color: var(--text3);
  font-size: 14px;
}
</style>
