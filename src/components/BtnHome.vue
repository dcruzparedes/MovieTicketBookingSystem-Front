<template>
  <RouterLink to="/" class="btn-home">
    <i class="pi pi-home" />
    Inicio
  </RouterLink>
</template>

<style scoped>
.btn-home {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--sinopia);
  text-decoration: none;
  font-family: 'Outfit', sans-serif;
  background: rgba(217, 34, 0, 0.07);
  border: 1px solid rgba(217, 34, 0, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.2s;
}

.btn-home:hover {
  background: rgba(217, 34, 0, 0.14);
  border-color: rgba(217, 34, 0, 0.35);
}
</style>
