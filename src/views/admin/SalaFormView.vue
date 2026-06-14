<script setup lang="ts">
import { useRouter } from 'vue-router'
import SalaForm from '@/components/admin/SalaForm.vue'

const router = useRouter()

function handleSaved(data: unknown) {
  // TODO: POST /api/salas con data
  console.log('Nueva sala:', data)
  router.push('/admin/salas')
}

function goBack() {
  router.back()
}
</script>

<template>
  <AdminLayout>
    <div class="page-header">
      <button class="back-btn" @click="goBack">Volver</button>
      <h1 class="page-title">Nueva sala</h1>
    </div>

    <div class="page-body">
      <div class="card">
        <SalaForm @saved="handleSaved" @cancel="goBack" />
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
</style>
