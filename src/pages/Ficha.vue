<template>
  <section class="container" v-if="data">
    <div style="text-align:center;margin:1rem 0 2rem;">
      <h1
        style="font-size:2.4rem;font-weight:900;background:linear-gradient(135deg,var(--accent1),var(--bg3),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
        {{ data.especie.nombre_cientifico }}
      </h1>
      <div class="muted" style="font-style:italic">{{ data.especie.nombre_comun }}</div>
    </div>
    <div class="grid" style="grid-template-columns: 1fr 1fr;">
      <div class="card">
        <h3 style="color:var(--accent1);margin:0 0 .75rem;">Study Metadata</h3>
        <div class="grid" style="grid-template-columns: 1fr 1fr;">
          <div>
            <div class="muted">Tittle</div>
            <div>{{ data.fuente.titulo }}</div>
          </div>
          <div>
            <div class="muted">Autores</div>
            <div>{{ data.fuente.autores }}</div>
          </div>
          <div>
            <div class="muted">Año</div>
            <div>{{ data.fuente.anio }}</div>
          </div>
          <div>
            <div class="muted">Repositorio</div>
            <div>{{ data.fuente.repositorio }}</div>
          </div>
          <div>
            <div class="muted">DOI</div>
            <div>{{ data.fuente.doi }}</div>
          </div>
        </div>
      </div>
      <div class="card">
        <h3 style="color:var(--accent1);margin:0 0 .75rem;">Condiciones Ambientales</h3>
        <div class="grid" style="grid-template-columns: repeat(3,1fr);">
          <div>
            <div class="muted">CO₂ (ppm)</div>
            <div style="font-weight:700;color:var(--bg3)">{{ data.experimento.env_co2_ppm }}</div>
          </div>
          <div>
            <div class="muted">Temp (°C)</div>
            <div style="font-weight:700;color:var(--bg3)">{{ data.experimento.env_temp_c }}</div>
          </div>
          <div>
            <div class="muted">Fotoperiodo (h)</div>
            <div style="font-weight:700;color:var(--bg3)">{{ data.experimento.env_fotoperiodo_h }}</div>
          </div>
          <div>
            <div class="muted">LED (nm)</div>
            <div>{{ data.experimento.env_led_nm }}</div>
          </div>
          <div>
            <div class="muted">pH</div>
            <div>{{ data.experimento.env_ph }}</div>
          </div>
          <div>
            <div class="muted">EC (mS/cm)</div>
            <div>{{ data.experimento.env_ec_conductividad }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="grid" style="grid-template-columns: 1fr 1fr; margin-top:1rem;">
      <div class="card">
        <h3 style="color:var(--accent1);margin:0 0 .75rem;">Result</h3>
        <div class="grid" style="grid-template-columns: repeat(4,1fr);text-align:center;">
          <div>
            <div class="muted">Performance</div>
            <div style="font-size:1.6rem;font-weight:800;color:var(--accent2)">{{ data.resultado.rendimiento_g_m2_d }}
            </div>
            <div class="muted">g/m²/d</div>
          </div>
          <div>
            <div class="muted">Water/kcal</div>
            <div style="font-size:1.6rem;font-weight:800;color:var(--accent2)">{{ data.resultado.agua_por_kcal_ml ?? '—'
              }}</div>
            <div class="muted">ml</div>
          </div>
          <div>
            <div class="muted">Days</div>
            <div style="font-size:1.6rem;font-weight:800;color:var(--accent2)">{{ data.resultado.dias_cosecha }}</div>
          </div>
          <div>
            <div class="muted">Survival</div>
            <div style="font-size:1.6rem;font-weight:800;color:var(--accent2)">{{ data.resultado.supervivencia_pct }}%
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <h3 style="color:var(--accent1);margin:0 0 .75rem;">Omics</h3>
        <table>
          <thead>
            <tr>
              <th>Access</th>
              <th>Guy</th>
              <th>Rehearsal</th>
              <th>Tissue</th>
              <th>DE Genes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in data.omics" :key="o.omico_id">
              <td><a :href="o.enlace" target="_blank" rel="noopener">{{ o.acceso_genelab }}</a></td>
              <td>{{ o.tipo_omico }}</td>
              <td>{{ o.tipo_ensayo }}</td>
              <td>{{ o.tejido }}</td>
              <td>{{ o.genes_diff_expr }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
  <section class="container" v-else>
    <p>The experiment was not found.</p>
  </section>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { getFichaByExperimento } from '../services/api'
const props = defineProps({ experimentoId: String })
const data = ref(null)
onMounted(async () => { data.value = await getFichaByExperimento(props.experimentoId) })
</script>