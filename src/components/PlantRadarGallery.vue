<template>
    <section class="gallery">
        <PlantHoloCard v-for="card in cards" :key="card.especie.especie_id" :especie="card.especie"
            :metrics="card.metrics" :labels="labels" :theme="card.theme" />
    </section>
</template>

<script setup>
import { computed } from 'vue'
import PlantHoloCard from './PlantHoloCard.vue'
import { plantThemes, defaultPlantTheme } from '../data/plantThemes'

const props = defineProps({
    species: { type: Array, default: () => [] },
    experiments: { type: Array, default: () => [] },
    results: { type: Array, default: () => [] },
    labels: { type: Object, default: () => ({}) }
})

const cards = computed(() => {
    if (!Array.isArray(props.species)) return []
    return props.species.map(especie => {
        const theme = plantThemes[especie.nombre_comun] || plantThemes[especie.nombre_cientifico] || defaultPlantTheme
        const experiment = props.experiments.find(e => e.especie_id === especie.especie_id) || null
        const result = experiment
            ? props.results.find(r => r.experimento_id === experiment.experimento_id)
            : null
        return {
            especie,
            theme,
            metrics: {
                rendimiento: result?.rendimiento_g_m2_d ?? 0,
                dias: result?.dias_cosecha ?? 0,
                ph: experiment?.env_ph ?? 0,
                ec: experiment?.env_ec_conductividad ?? 0,
                co2: experiment?.env_co2_ppm ?? 0
            }
        }
    })
})
</script>

<style scoped>
.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.8rem;
    margin-top: 1.5rem;
}
</style>
