<script setup lang="ts">
defineProps<{
  modelValue: boolean
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="loading || disabled"
    class="toggle-wrap"
    :class="{ on: modelValue, loading }"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="thumb">
      <span v-if="loading" class="spinner" />
    </span>
  </button>
</template>

<style scoped>
.toggle-wrap {
  display: inline-flex;
  align-items: center;
  width: 38px;
  height: 22px;
  border-radius: 11px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
  flex-shrink: 0;
  background: rgba(42, 10, 6, 0.15);
}

.toggle-wrap.on {
  background: var(--sinopia);
}

.toggle-wrap.loading {
  opacity: 0.65;
  cursor: not-allowed;
}

.toggle-wrap:disabled {
  cursor: not-allowed;
}

.thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-wrap.on .thumb {
  left: 19px;
}

.spinner {
  width: 8px;
  height: 8px;
  border: 1.5px solid rgba(42, 10, 6, 0.2);
  border-top-color: var(--sinopia);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
