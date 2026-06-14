<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import MovieForm from '@/components/admin/MovieForm.vue'

const router = useRouter()

interface Movie {
  id: number
  title: string
  genre: string
  language: string
  releaseDate: string
  active: boolean
}

const movies = ref<Movie[]>([
  { id: 1, title: 'Alien: Romulus', genre: 'Sci-Fi', language: 'Español / Sub', releaseDate: '2024-08-16', active: true },
  { id: 2, title: 'Wild Robot', genre: 'Animación', language: 'Español', releaseDate: '2024-09-27', active: true },
  { id: 3, title: 'Megalopolis', genre: 'Drama', language: 'Subtitulada', releaseDate: '2024-09-27', active: false },
  { id: 4, title: 'Venom: El Último Baile', genre: 'Acción', language: 'Español', releaseDate: '2024-10-25', active: true },
])

const showModal = ref(false)

function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function onMovieSaved(data: { title: string; genre: string; language: string; releaseDate: string }) {
  movies.value.push({
    id: Date.now(),
    title: data.title,
    genre: data.genre,
    language: data.language,
    releaseDate: data.releaseDate,
    active: true,
  })
  closeModal()
}

function toggleActive(movie: Movie) {
  movie.active = !movie.active
}
</script>

<template>
  <AdminLayout>
    <div class="page-header">
      <h1 class="page-title">Películas</h1>
      <button class="btn btn-primary" @click="openModal">+ Nueva película</button>
    </div>

    <div class="page-body">
      <div class="card">
        <table class="tbl">
          <thead>
            <tr>
              <th>Título</th>
              <th>Género</th>
              <th>Idioma</th>
              <th>Estreno</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="movie in movies" :key="movie.id">
              <td><strong>{{ movie.title }}</strong></td>
              <td>{{ movie.genre }}</td>
              <td>{{ movie.language }}</td>
              <td>{{ movie.releaseDate }}</td>
              <td>
                <button
                  class="toggle"
                  :class="movie.active ? 'on' : 'off'"
                  type="button"
                  @click="toggleActive(movie)"
                />
              </td>
              <td>
                <button
                  class="btn btn-ghost btn-sm"
                  @click="router.push('/admin/peliculas/' + movie.id + '/editar')"
                >
                  Editar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal nueva película -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">Nueva película</h2>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <MovieForm @saved="onMovieSaved" @cancel="closeModal" />
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<style scoped>
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

/* Toggle */
.toggle {
  width: 38px;
  height: 21px;
  border-radius: 11px;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
  border: none;
}

.toggle.on {
  background: var(--sinopia);
}

.toggle.off {
  background: rgba(42, 10, 6, 0.15);
}

.toggle::after {
  content: '';
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 3px;
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle.on::after {
  left: 20px;
}

.toggle.off::after {
  left: 3px;
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
  max-width: 820px;
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
</style>
