<template>
    <section class="container">
        <h1
            style="font-size:2rem;font-weight:900;background:linear-gradient(135deg,var(--accent1),var(--bg3),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
            Species repository
        </h1>
        <div class="grid" style="grid-template-columns: 320px 1fr; align-items:start;">
            <div class="card">
                <h3 style="margin-top:0;color:var(--accent1)">Filters</h3>
                <div class="muted">cultivation system</div>
                <select v-model="filtros.sistema_cultivo_id" class="select">
                    <option :value="null">All</option>
                    <option v-for="s in filtrosOpts.sistemas" :key="s.sistema_cultivo_id" :value="s.sistema_cultivo_id">
                        {{ s.nombre }}</option>
                </select>
                <div class="grid" style="grid-template-columns:1fr 1fr;gap:.6rem;margin-top:.8rem;">
                    <div>
                        <div class="muted">year since</div><input type="number" v-model.number="filtros.anio_desde"
                            class="input">
                    </div>
                    <div>
                        <div class="muted">year until</div><input type="number" v-model.number="filtros.anio_hasta"
                            class="input">
                    </div>
                </div>
                <div class="grid" style="grid-template-columns:1fr 1fr;gap:.6rem;margin-top:.8rem;">
                    <div>
                        <div class="muted">pH min</div><input type="number" step="0.1" v-model.number="filtros.ph_min"
                            class="input">
                    </div>
                    <div>
                        <div class="muted">pH max</div><input type="number" step="0.1" v-model.number="filtros.ph_max"
                            class="input">
                    </div>
                </div>
                <button class="btn btn-primary" style="margin-top:.8rem" @click="buscar">Apply filters</button>
            </div>
            <div>
                <div class="card" v-if="especie">
                    <div style="display:flex;gap:1rem;align-items:center;">
                        <div class="pill">{{ especie.nombre_cientifico }}</div>
                        <div class="muted">{{ especie.nombre_comun }} • {{ especie.familia }} • {{
                            especie.via_fotosintesis }}</div>
                    </div>
                </div>
                <div class="card" style="margin-top:1rem;overflow:auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>System</th>
                                <th>pH</th>
                                <th>EC</th>
                                <th>Rend</th>
                                <th>Days</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="r in rows" :key="r.experimento_id">
                                <td>{{ r.anio ?? '—' }}</td>
                                <td>{{ 'Sistema ' + r.sistema_cultivo_id }}</td>
                                <td>{{ r.env_ph }}</td>
                                <td>{{ r.env_ec_conductividad }}</td>
                                <td>{{ r.rendimiento ?? '—' }}</td>
                                <td>{{ r.dias_cosecha ?? '—' }}</td>
                                <td><router-link class="btn btn-secondary" :to="`/experimento/${r.experimento_id}`">Ver
                                    result</router-link></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getEspecies, getRepoFiltersByEspecie, getRepoExperimentos } from '../services/api'
const props = defineProps({ especieId: String })
const especie = ref(null)
const filtrosOpts = ref({ sistemas: [], anio_min: null, anio_max: null, ph_min: null, ph_max: null, ec_min: null, ec_max: null })
const filtros = ref({ sistema_cultivo_id: null, anio_desde: null, anio_hasta: null, ph_min: null, ph_max: null })
const rows = ref([])
async function load() {
    const especies = await getEspecies()
    especie.value = especies.find(e => String(e.especie_id) === String(props.especieId))
    filtrosOpts.value = await getRepoFiltersByEspecie(props.especieId)
    filtros.value.anio_desde = filtrosOpts.value.anio_min
    filtros.value.anio_hasta = filtrosOpts.value.anio_max
    rows.value = await getRepoExperimentos(props.especieId, filtros.value)
}
async function buscar() { rows.value = await getRepoExperimentos(props.especieId, filtros.value) }
onMounted(load)
</script>

<style scoped>
.select,
.input {
    width: 100%;
    padding: .6rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, .05);
    border: 1px solid rgba(255, 255, 255, .15);
    color: var(--text)
}
</style>