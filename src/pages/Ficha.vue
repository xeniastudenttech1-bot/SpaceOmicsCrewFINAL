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

    <!-- 🆕 BLOQUE: Estadístico + Planta -->
    <div class="card" style="margin-top:1rem;">
      <h3 style="color:var(--accent1);margin:0 0 .75rem;">Statistic & Plant</h3>
      <div class="stat-plant">
        <figure class="stat-plant__item">
          <img
            :src="estadisticoUrl"
            :alt="`Statistic for ${data.especie.nombre_cientifico}`"
            loading="lazy"
          />
     
        </figure>

        <figure class="stat-plant__item">
          <img
            :src="plantaUrl"
            :alt="`Plant image: ${data.especie.nombre_cientifico}`"
            loading="lazy"
          />
        
        </figure>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: 1fr 1fr; margin-top:1rem;">
      <div class="card">
        <h3 style="color:var(--accent1);margin:0 0 .75rem;">Result</h3>
        <div class="grid" style="grid-template-columns: repeat(4,1fr);text-align:center;">
          <div>
            <div class="muted">Performance</div>
            <div style="font-size:1.6rem;font-weight:800;color:var(--accent2)">{{ data.resultado.rendimiento_g_m2_d }}</div>
            <div class="muted">g/m²/d</div>
          </div>
          <div>
            <div class="muted">Water/kcal</div>
            <div style="font-size:1.6rem;font-weight:800;color:var(--accent2)">{{ data.resultado.agua_por_kcal_ml ?? '—' }}</div>
            <div class="muted">ml</div>
          </div>
          <div>
            <div class="muted">Days</div>
            <div style="font-size:1.6rem;font-weight:800;color:var(--accent2)">{{ data.resultado.dias_cosecha }}</div>
          </div>
          <div>
            <div class="muted">Survival</div>
            <div style="font-size:1.6rem;font-weight:800;color:var(--accent2)">{{ data.resultado.supervivencia_pct }}%</div>
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
import { onMounted, ref, computed } from 'vue'
import { getFichaByExperimento } from '../services/api'

const props = defineProps({ experimentoId: String })
const data = ref(null)

onMounted(async () => {
  data.value = await getFichaByExperimento(props.experimentoId)
})

/**
 * Convención recomendada (archivos en /public):
 *  - /estadistico/<especie_id>.png   → imagen estadística por planta
 *  - /planta/<especie_id>.png        → imagen pública de la planta
 *
 * Si /planta/<id>.png no existe, hacemos fallback a data.especie.imagen_url
 * (que en tu JSON apunta a /src/assets/...).
 */

const estadisticoUrl = computed(() => {
  const id = data.value?.especie?.especie_id
  return id ? `/stadistic/${id}.png` : ''
})

/** Detecta si vamos a usar la versión pública /planta/<id>.png */
const usesPublicPlant = computed(() => {
  const id = data.value?.especie?.especie_id
  // Si quieres forzar siempre public/, deja `true`.
  return Boolean(id)
})

/** Resuelve la imagen de planta:
 *  1) intenta /planta/<id>.png (public/)
 *  2) si no, usa imagen_url del JSON (src/assets)
 */
const plantaUrl = computed(() => {
  const id = data.value?.especie?.especie_id
  const imgFromJson = data.value?.especie?.imagen_url

  // Preferimos public/ por simplicidad de despliegue
  if (id) return `/plants/${id}.jpeg`

  // Fallback a /src/assets (compatibilidad con tu mock actual)
  if (imgFromJson && imgFromJson.startsWith('/src')) {
    try {
      // Convierte '/src/assets/...svg' a ruta importable relativa al archivo
      const relative = '..' + imgFromJson.replace('/src', '')
      return new URL(relative, import.meta.url).href
    } catch {
      return imgFromJson
    }
  }
  return imgFromJson || ''
})
</script>

<style scoped>
/* Bloque gráfico lado a lado */
.stat-plant {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  align-items: center;
}

.stat-plant__item {
  margin: 0;
  text-align: center;
}

.stat-plant__item img {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  border: 1px solid rgba(198, 185, 255, 0.2);
  box-shadow: 0 12px 38px rgba(122, 90, 248, 0.15);
  background: radial-gradient(120% 120% at 20% 30%, rgba(198,185,255,0.08), rgba(127,184,166,0.06) 40%, transparent 70%);
}

@media (max-width: 900px) {
  .stat-plant {
    grid-template-columns: 1fr;
  }
}
</style>
