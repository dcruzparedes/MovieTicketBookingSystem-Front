<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'


interface Politica{
    id: number
    horas_antes_minimo: number
    horas_antes_maximo: number
    porcentaje_reembolso: number
}

const Polis: Politica[]=[
    {
        id: 1,
        horas_antes_maximo: 3,
        horas_antes_minimo: 4,
        porcentaje_reembolso: 50
    },
    {
        id: 2,
        horas_antes_maximo: 3,
        horas_antes_minimo: 4,
        porcentaje_reembolso: 50
    },
    {
        id: 3,
        horas_antes_maximo: 3,
        horas_antes_minimo: 4,
        porcentaje_reembolso: 50
    },
]

const politicas = ref<Politica[]>(Polis)

const showModal = ref(false)
const editModal = ref(false)

const nuevoForm = ref({
    id: null as number | null,
    horas_antes_minimo: null as number | null,
    horas_antes_maximo: null as number | null,
    porcentaje_reembolso: null as number | null,
})

function agregarPolitica() {
  if (!nuevoForm.value.horas_antes_maximo || !nuevoForm.value.horas_antes_minimo || !nuevoForm.value.porcentaje_reembolso) return

  politicas.value.push({
    id: Date.now(),
    horas_antes_maximo: nuevoForm.value.horas_antes_maximo,
    horas_antes_minimo: nuevoForm.value.horas_antes_minimo,
    porcentaje_reembolso: nuevoForm.value.porcentaje_reembolso,
  })

  nuevoForm.value = { id: null, horas_antes_maximo: null, horas_antes_minimo: null, porcentaje_reembolso: null }
  showModal.value = false
}

function editarPolitica() {
    if (!nuevoForm.value.id || !nuevoForm.value.horas_antes_maximo || !nuevoForm.value.horas_antes_minimo || !nuevoForm.value.porcentaje_reembolso) return

    const pol = politicas.value.find(pol => pol.id === nuevoForm.value.id)

    if(pol){
        pol.horas_antes_maximo=nuevoForm.value.horas_antes_maximo
        pol.horas_antes_minimo=nuevoForm.value.horas_antes_minimo
        pol.porcentaje_reembolso=nuevoForm.value.porcentaje_reembolso
    }

    nuevoForm.value = { id: null, horas_antes_maximo: null, horas_antes_minimo: null, porcentaje_reembolso: null }
    editModal.value = false
}

</script>

<template>
    <AdminLayout>
    <div id="admin-cupones">
    <div class="admin-header animado" style="--delay: 0ms">
    <div class="admin-page-title">Políticas de Cancelación</div>
    <button class="btn btn-primary btn-sm" @click="showModal = true">+ Nueva Política</button></div>
    <div class="admin-body">
        <div class="card animado" style="--delay: 80ms"><div class="card-body" style="padding:0">
        <table class="tbl">
            <thead><tr><th class="id-th">ID</th><th>Horas Antes Maximo</th><th>Horas Antes Minimo</th><th>Porcentaje de Reembolso</th><th>Acciones</th></tr></thead>
            <TransitionGroup tag="tbody" name="rows" appear>
                <tr v-for="(politica, index) in politicas" :key="politica.id" :style="{ '--row-delay': `${index * 40}ms` }">
                    <td><strong style="font-family:'DM Mono',monospace">{{politica.id}}</strong></td>
                    <td>{{politica.horas_antes_maximo}}</td>
                    <td>{{politica.horas_antes_minimo}}</td>
                    <td>{{politica.porcentaje_reembolso}}%</td>
                    <td><button
                    class="btn btn-ghost btn-sm"
                    @click="editModal=true; nuevoForm.id=politica.id;"
                    >Editar</button>
                    </td>
                </tr>
            </TransitionGroup>
        </table>
        </div></div>
    </div>
    </div>

    <Teleport to="body">
    <div v-if="showModal" class="modal-overlay">
    <div class="modal-box">
    <div class="modal-header">
    <div class="modal-title">Nueva Política</div>
    <button class="close-btn"  @click="showModal = false">✕</button>
    </div>
    <div class="modal-body">
        <div class="card"><div class="card-body">
        <div class="field-row">
            <div class="field">
                <label>Horas Antes Maximo</label>
                <input v-model.number="nuevoForm.horas_antes_maximo" type="number" min="1" placeholder="10" />
            </div>
            <div class="field">
                <label>Horas Antes Minimo</label>
                <input v-model.number="nuevoForm.horas_antes_minimo" type="number" min="1" placeholder="5" />
            </div>
        </div>
        <div class="field-row">
            <div class="field">
                <label>Porcentaje de Reembolso</label>
                <input v-model.number="nuevoForm.porcentaje_reembolso" type="number" min="10" placeholder="50"/>
            </div>
        </div>
        <div style="display:flex;gap:10px">
            <button class="btn btn-primary"  @click="agregarPolitica">Guardar política</button>
            <button class="btn btn-ghost" @click="showModal = false">Cancelar</button>
        </div>
        </div></div>
    </div>
    </div>
    </div>

    <div v-if="editModal" class="modal-overlay">
    <div class="modal-box">
    <div class="modal-header">
    <div class="modal-title">Editar Política</div>
    <button class="close-btn"  @click="editModal = false">✕</button>
    </div>
    <div class="modal-body">
        <div class="card"><div class="card-body">
        <div class="field-row">
            <div class="field">
                <label>Horas Antes Maximo</label>
                <input v-model.number="nuevoForm.horas_antes_maximo" type="number" min="1" placeholder="10" />
            </div>
            <div class="field">
                <label>Horas Antes Minimo</label>
                <input v-model.number="nuevoForm.horas_antes_minimo" type="number" min="1" placeholder="5" />
            </div>
        </div>
        <div class="field-row">
            <div class="field">
                <label>Porcentaje de Reembolso</label>
                <input v-model.number="nuevoForm.porcentaje_reembolso" type="number" min="10" placeholder="50"/>
            </div>
        </div>
        <div style="display:flex;gap:10px">
            <button class="btn btn-primary"  @click="editarPolitica">Editar política</button>
            <button class="btn btn-ghost" @click="editModal = false">Cancelar</button>
        </div>
        </div></div>
    </div>
    </div>
    </div>
    </Teleport>
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

.field { margin-bottom: 16px; }
.field label { display: block; font-size: 12px; color: var(--text2); margin-bottom: 5px; font-weight: 500; }
.field input, .field select, .field textarea {
  width: 100%; background: var(--bg); border: 1px solid var(--border2);
  color: var(--text); padding: 10px 13px; border-radius: var(--radius);
  font-size: 14px; font-family: 'Outfit', sans-serif; outline: none;
}
.field input:focus, .field select:focus { border-color: var(--tangelo); }
.field input::placeholder, .field textarea::placeholder { color: var(--text3); }
.field select option { background: #fff; }
.field textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field-error { font-size: 11px; color: var(--sinopia); margin-top: 4px; }
.field-success { font-size: 11px; color: var(--success); margin-top: 4px; }

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