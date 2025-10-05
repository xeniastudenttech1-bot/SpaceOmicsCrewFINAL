<template>
  <section class="container" style="padding-top:1rem;">
    <h1
      style="font-size:2rem;font-weight:900;background:linear-gradient(135deg,var(--accent1),var(--bg3),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
      KPI Comparator by Species
    </h1>
    <div class="card" style="margin-top:1rem;overflow:auto;">
      <table>
        <thead>
          <tr>
            <th>Specie</th>
            <th>Performance</th>
            <th>Days</th>
            <th>pH</th>
            <th>EC</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.experimento_id">
            <td><strong style="color:var(--accent1)">{{ r.especie_cientifico }}</strong>
              <div class="muted">{{ r.especie_comun }}</div>
            </td>
            <td>{{ r.rendimiento ?? '—' }}</td>
            <td>{{ r.dias_cosecha ?? '—' }}</td>
            <td>{{ r.ph ?? '—' }}</td>
            <td>{{ r.ec ?? '—' }}</td>
            <td><router-link class="btn btn-secondary" :to="`/experimento/${r.experimento_id}`">See file</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { getKPIComparadorRows } from '../services/api'
const rows = ref([])
onMounted(async () => { rows.value = await getKPIComparadorRows() })
</script>