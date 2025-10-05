<template>
  <div class="home-page">
    <HeroIntro
      :video="heroVideo"
      :poster="heroPoster"
      :mascot="heroMascot"
      :logo="logoSpace"
      @explore="scrollToMain"
    />

    <section ref="mainSection" class="container main-section">
      <div style="text-align:center;margin-bottom:1rem;">
        <h1
          style="font-size:3rem;font-weight:900;background:linear-gradient(135deg,var(--accent1),var(--bg3),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
          Plant Resilience Repository
        </h1>
        <p class="muted">Discover how plants adapt to extreme conditions on space missions.</p>
      </div>
      <PlantCarousel :especies="especies" @select="onSelect" @verRepositorio="verRepo" />

      <div v-if="seleccion" class="grid main-highlight">
        <div class="card">
          <h2 style="margin-top:0;color:var(--accent1)">{{ seleccion.nombre_cientifico }}</h2>
          <div class="muted">{{ seleccion.nombre_comun }} • {{ seleccion.familia }} • {{ seleccion.via_fotosintesis }}
          </div>
          <div style="display:flex;gap:1rem;align-items:center;margin-top:1rem;flex-wrap:wrap;">
            <router-link class="btn btn-primary" :to="`/repositorio/${seleccion.especie_id}`">Open
              repository</router-link>
            <button class="btn btn-secondary" @click="irAFichaPrimera">View First Experiment</button>
          </div>

          <PlantHotspots v-if="seleccionImagen" :img="seleccionImagen" :parts="hotspotParts" />
        </div>

        <RadarGraph :values="radarValues" :labels="radarLabels" :size="360" :palette="seleccionPalette" />
      </div>

      <section v-if="galleryReady" class="gallery-section">
        <h2>Interactive radial maps by crop</h2>
        <p class="muted">View each species with its 3D hologram and dynamic radar.</p>
        <PlantRadarGallery :species="especies" :experiments="experimentos" :results="resultados" :labels="radarLabels" />
      </section>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import PlantCarousel from '../components/PlantCarousel.vue'
import RadarGraph from '../components/RadarGraph.vue'
import PlantHotspots from '../components/PlantHotspots.vue'
import PlantRadarGallery from '../components/PlantRadarGallery.vue'
import HeroIntro from '../components/HeroIntro.vue'
import { getEspecies, getExperimentos, getResultados } from '../services/api'
import { plantThemes, defaultPlantTheme } from '../data/plantThemes'
import { ensureEspecieMedia } from '../data/plantMedia'
import { resolveAsset } from '../utils/assets'

const especies = ref([])
const seleccion = ref(null)
const radarValues = ref({})
const experimentos = ref([])
const resultados = ref([])
const radarLabels = {
  rendimiento: 'Performance (g/m²/d)',
  dias: 'Days to harvest',
  ph: 'pH',
  ec: 'EC (mS/cm)',
  co2: 'CO₂ (ppm)'
}

const hotspotParts = ref([
  { id: 'sheet', label: 'sheet', x: 0.7, y: 0.35 },
  { id: 'tallo', label: 'stem', x: 0.5, y: 0.55 },
  { id: 'raiz', label: 'root', x: 0.5, y: 0.85 },
  { id: 'fruto', label: 'Fruit', x: 0.45, y: 0.25 }
])

const mainSection = ref(null)

const heroPoster = resolveAsset('images/galaxy-poster.svg')
const heroVideo = resolveAsset('images/galaxy.mp4', { fallback: heroPoster })
const heroMascot = resolveAsset('images/mascot-astro.svg')
const logoSpace = resolveAsset('images/logo-space.svg')

const seleccionPalette = computed(() => {
  if (!seleccion.value) return defaultPlantTheme.palette
  return (plantThemes[seleccion.value.nombre_comun] || plantThemes[seleccion.value.nombre_cientifico] || defaultPlantTheme).palette
})

const seleccionImagen = computed(() => {
  if (!seleccion.value) return null
  return (
    seleccion.value.imagen_asset ||
    resolveAsset(seleccion.value.imagen_url, { fallback: resolveAsset('placeholder-plant.svg') })
  )
})

const galleryReady = computed(() => especies.value.length && experimentos.value.length && resultados.value.length)

function onSelect(esp) {
  seleccion.value = esp
  cargarRadar(esp.especie_id)
}

function cargarRadar(especieId) {
  const e = experimentos.value.find(x => x.especie_id === especieId)
  const r = e ? resultados.value.find(x => x.experimento_id === e.experimento_id) : null
  radarValues.value = {
    rendimiento: r?.rendimiento_g_m2_d || 0,
    dias: r?.dias_cosecha || 0,
    ph: e?.env_ph || 0,
    ec: e?.env_ec_conductividad || 0,
    co2: e?.env_co2_ppm || 0
  }
}

function verRepo(esp) { window.location.hash = `#/repositorio/${esp.especie_id}` }
async function irAFichaPrimera() {
  if (!seleccion.value) return
  if (!experimentos.value.length) experimentos.value = await getExperimentos()
  const e = experimentos.value.find(x => x.especie_id === seleccion.value.especie_id)
  if (e) window.location.hash = `#/experimento/${e.experimento_id}`
}

function scrollToMain() {
  if (mainSection.value) {
    mainSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(async () => {
  const [esp, exp, res] = await Promise.all([getEspecies(), getExperimentos(), getResultados()])
  especies.value = esp.map(ensureEspecieMedia)
  experimentos.value = exp
  resultados.value = res
  if (esp.length) {
    seleccion.value = especies.value[0]
    cargarRadar(especies.value[0].especie_id)
  }
})
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.main-section {
  padding-top: 1rem;
  margin-top: -3rem;
  scroll-margin-top: 6rem;
}

.main-highlight {
  grid-template-columns: 1.1fr .9fr;
  margin-top: 1rem;
}

.gallery-section {
  margin-top: 3rem;
}

.gallery-section h2 {
  margin-bottom: 0.35rem;
  color: var(--accent1);
  font-weight: 800;
}

.gallery-section p {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

@media (max-width: 960px) {
  .main-section {
    margin-top: 0;
  }

  .main-highlight {
    grid-template-columns: 1fr;
  }
}
</style>
