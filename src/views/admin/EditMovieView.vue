<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import MovieForm from '@/components/admin/MovieForm.vue'

const route = useRoute()
const router = useRouter()

// Mock hasta conectar con API — mismos datos que MoviesView
const movies = [
  { id: 1, title: 'Alien: Romulus', genre: 'Sci-Fi', language: 'Español', releaseDate: '2024-08-16', synopsis: 'Un grupo explora una estación espacial abandonada y se enfrenta a la forma de vida más aterradora del universo.' },
  { id: 2, title: 'Wild Robot', genre: 'Animación', language: 'Español', releaseDate: '2024-09-27', synopsis: 'Una robot aprende a sobrevivir en la naturaleza y a cuidar de una cría de ganso.' },
  { id: 3, title: 'Megalopolis', genre: 'Drama', language: 'Subtitulada', releaseDate: '2024-09-27', synopsis: 'Una utopía épica sobre el futuro de la civilización.' },
  { id: 4, title: 'Venom: El Último Baile', genre: 'Acción', language: 'Español', releaseDate: '2024-10-25', synopsis: 'Eddie Brock emprende un último viaje junto a Venom.' },
]

const movieId = computed(() => Number(route.params.id))
const movie = computed(() => movies.find((m) => m.id === movieId.value) ?? null)

function onSaved(data: { title: string; genre: string; language: string; releaseDate: string; synopsis: string; poster: File | null }) {
  // TODO: PUT /api/peliculas/:id con data
  console.log('PUT /api/peliculas/' + movieId.value, data)
  router.push('/admin/peliculas')
}

function goBack() {
  router.back()
}
</script>

<template>
  <AdminLayout>
    <div class="page-header animado" style="--delay: 0ms">
      <button class="back-btn" @click="goBack">Volver</button>
      <h1 class="page-title">Editar película</h1>
    </div>

    <div class="page-body">
      <!-- Movie not found -->
      <div v-if="!movie" class="not-found animado" style="--delay: 80ms">
        <p class="not-found-text">No se encontró la película con ID {{ movieId }}.</p>
        <button class="btn btn-ghost" @click="goBack">Volver a la lista</button>
      </div>

      <!-- Form precargado -->
      <div v-else class="card animado" style="--delay: 80ms">
        <MovieForm
          :initial-data="{
            title: movie.title,
            genre: movie.genre,
            language: movie.language,
            releaseDate: movie.releaseDate,
            synopsis: movie.synopsis,
          }"
          @saved="onSaved"
          @cancel="goBack"
        />
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.page-header {
  padding: 24px 28px 0;
  margin-bottom: 20px;
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
  margin-bottom: 8px;
  transition: color 0.2s;
}

.back-btn::before {
  content: '←';
}

.back-btn:hover {
  color: var(--text2);
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
  padding: 24px;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding: 40px 0;
}

.not-found-text {
  font-size: 14px;
  color: var(--text2);
}

.btn {
  border: none;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  border-radius: var(--radius);
  font-weight: 600;
  padding: 10px 20px;
  font-size: 13px;
  transition: opacity 0.2s;
}

.btn-ghost {
  background: transparent;
  color: var(--text2);
  border: 1px solid var(--border2);
}

.btn-ghost:hover {
  background: var(--bg);
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
