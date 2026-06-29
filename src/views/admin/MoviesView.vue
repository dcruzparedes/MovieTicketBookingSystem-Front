<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import MovieForm from '@/components/admin/MovieForm.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'
import { deletePelicula } from '@/services/movieService'

const router = useRouter()

const loadingIds = ref(new Set<number>())

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

// ── Delete ────────────────────────────────────────────────────────
const showDeleteConfirm = ref(false)
const deletingMovie = ref<Movie | null>(null)
const deleteLoading = ref(false)
const deleteError = ref('')

function openDeleteConfirm(movie: Movie) {
  deletingMovie.value = movie
  deleteError.value = ''
  showDeleteConfirm.value = true
}

function closeDeleteConfirm() {
  showDeleteConfirm.value = false
  deletingMovie.value = null
}

async function confirmDelete() {
  if (!deletingMovie.value) return
  deleteLoading.value = true
  deleteError.value = ''
  try {
    await deletePelicula(deletingMovie.value.id)
    movies.value = movies.value.filter((m) => m.id !== deletingMovie.value!.id)
    closeDeleteConfirm()
  } catch (e: unknown) {
    deleteError.value = e instanceof Error ? e.message : 'Error al eliminar la película'
  } finally {
    deleteLoading.value = false
  }
}

async function toggleActive(movie: Movie) {
  loadingIds.value.add(movie.id)
  const previous = movie.active
  movie.active = !movie.active // optimistic update
  try {
    // TODO: PATCH /api/peliculas/:id { active: movie.active }
    await new Promise((r) => setTimeout(r, 600))
  } catch {
    movie.active = previous // rollback on error
  } finally {
    loadingIds.value.delete(movie.id)
  }
}
</script>

<template>
  <AdminLayout>
    <div class="page-header animado" style="--delay: 0ms">
      <h1 class="page-title">Películas</h1>
      <button class="btn btn-primary" @click="openModal">+ Nueva película</button>
    </div>

    <div class="page-body">
      <div class="card animado" style="--delay: 80ms">
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
          <TransitionGroup tag="tbody" name="rows" appear>
            <tr v-for="(movie, index) in movies" :key="movie.id" :style="{ '--row-delay': `${index * 40}ms` }">
              <td><strong>{{ movie.title }}</strong></td>
              <td>{{ movie.genre }}</td>
              <td>{{ movie.language }}</td>
              <td>{{ movie.releaseDate }}</td>
              <td>
                <div class="status-cell">
                  <ToggleSwitch
                    :model-value="movie.active"
                    :loading="loadingIds.has(movie.id)"
                    @update:model-value="toggleActive(movie)"
                  />
                  <span class="status-label" :class="movie.active ? 'active' : 'inactive'">
                    {{ movie.active ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </td>
              <td>
                <div class="action-group">
                  <button
                    class="btn btn-ghost btn-sm"
                    @click="router.push('/admin/peliculas/' + movie.id + '/editar')"
                  >
                    Editar
                  </button>
                  <button
                    class="btn btn-danger btn-sm"
                    @click="openDeleteConfirm(movie)"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </TransitionGroup>
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
    <!-- Modal: Confirmar eliminación -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="closeDeleteConfirm">
        <div class="modal-box modal-box--sm">
          <div class="modal-header">
            <h2 class="modal-title">Eliminar película</h2>
            <button class="close-btn" @click="closeDeleteConfirm">✕</button>
          </div>
          <div class="modal-body">
            <p class="confirm-text">
              ¿Estás seguro de que quieres eliminar
              <strong>{{ deletingMovie?.title }}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <p v-if="deleteError" class="delete-error">{{ deleteError }}</p>
            <div class="form-actions">
              <button
                class="btn btn-danger"
                :disabled="deleteLoading"
                @click="confirmDelete"
              >
                {{ deleteLoading ? 'Eliminando…' : 'Sí, eliminar' }}
              </button>
              <button class="btn btn-ghost" @click="closeDeleteConfirm">Cancelar</button>
            </div>
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

.btn-danger {
  background: var(--sinopia);
  color: #fff;
  padding: 6px 14px;
}

.btn-danger:hover:not(:disabled) {
  opacity: 0.88;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-group {
  display: flex;
  gap: 6px;
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

.modal-box--sm {
  max-width: 420px;
}

.confirm-text {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.6;
  margin-bottom: 20px;
}

.confirm-text strong {
  color: var(--text);
}

.delete-error {
  font-size: 13px;
  color: var(--sinopia);
  margin-bottom: 12px;
}

.form-actions {
  display: flex;
  gap: 10px;
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

.rows-enter-active {
  animation: slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--row-delay, 0ms);
  opacity: 0;
}

.rows-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.rows-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.rows-move {
  transition: transform 0.3s ease;
}
</style>
