<template>
    <article class="holo-card" :style="{ background: resolvedTheme.palette.surface }">
        <header class="holo-header">
            <span class="holo-chip">{{ especie.nombre_comun }}</span>
            <h3>{{ especie.nombre_cientifico }}</h3>
            <p class="muted">{{ especie.familia }} • {{ especie.via_fotosintesis }}</p>
        </header>
        <div class="holo-stage">
            <RadarGraph class="holo-radar" :values="metrics" :labels="labels" :size="260" :palette="resolvedTheme.palette"
                :hide-header="true" />
            <img v-if="plantMedia.image" class="holo-silhouette" :src="plantMedia.image"
                :alt="`Ilustración de ${especie.nombre_comun}`" />
            <div class="holo-plant">
                <Plant3DScene :plant="especie.nombre_comun" :palette="resolvedTheme.palette" :rotation-speed="0.45"
                    :texture="plantMedia.texture" />
            </div>
        </div>
        <footer class="holo-footer">
            <div class="holo-keywords" v-if="resolvedTheme.keywords.length">
                <span v-for="word in resolvedTheme.keywords" :key="word" class="keyword">{{ word }}</span>
            </div>
            <ul class="metric-list">
                <li v-for="item in metricList" :key="item.key">
                    <span class="metric-label">{{ item.label }}</span>
                    <span class="metric-value">{{ item.display }}</span>
                </li>
            </ul>
        </footer>
    </article>
</template>

<script setup>
import { computed } from 'vue'
import RadarGraph from './RadarGraph.vue'
import Plant3DScene from './Plant3DScene.vue'
import { defaultPlantTheme } from '../data/plantThemes'
import { getPlantMedia } from '../data/plantMedia'

const props = defineProps({
    especie: { type: Object, required: true },
    metrics: { type: Object, default: () => ({}) },
    labels: { type: Object, default: () => ({}) },
    theme: { type: Object, default: () => ({}) }
})

const plantMedia = computed(() => props.especie.media || getPlantMedia(props.especie.nombre_comun || props.especie.nombre_cientifico))

const resolvedTheme = computed(() => ({
    ...defaultPlantTheme,
    ...props.theme,
    palette: { ...defaultPlantTheme.palette, ...(props.theme?.palette || {}) },
    keywords: [...(props.theme?.keywords || defaultPlantTheme.keywords)]
}))

const metricList = computed(() => {
    const orderedKeys = Object.keys(props.metrics || {})
    return orderedKeys.map(key => ({
        key,
        label: props.labels?.[key] || key,
        value: Number(props.metrics?.[key]) || 0,
        display: formatValue(key, props.metrics?.[key])
    }))
})

function formatValue(key, value) {
    if (value == null) return '—'
    const num = Number(value)
    if (!Number.isFinite(num)) return '—'
    if (key.includes('rendimiento')) return `${num.toFixed(1)} g/m²·d`
    if (key.includes('dias')) return `${Math.round(num)} días`
    if (key.includes('ph')) return num.toFixed(1)
    if (key.includes('ec')) return `${num.toFixed(2)} mS/cm`
    if (key.includes('co2')) return `${Math.round(num)} ppm`
    return num.toFixed(2)
}
</script>

<style scoped>
.holo-card {
    position: relative;
    border-radius: 24px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
    overflow: hidden;
    backdrop-filter: blur(18px);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.holo-header h3 {
    margin: 0.25rem 0 0;
    font-weight: 700;
    font-size: 1.4rem;
    color: #ffffff;
}

.holo-header .muted {
    margin: 0;
}

.holo-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: rgba(255, 255, 255, 0.14);
    color: #ffffff;
    border-radius: 999px;
    padding: 0.3rem 0.85rem;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.holo-stage {
    position: relative;
    height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.holo-silhouette {
    position: absolute;
    width: 68%;
    max-width: 220px;
    opacity: 0.32;
    filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.25));
    mix-blend-mode: screen;
    animation: silhouette-float 10s ease-in-out infinite;
}

.holo-stage :deep(.radar-card) {
    background: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
}

.holo-stage :deep(.radar-stage) {
    margin-top: 0;
}

.holo-stage :deep(svg) {
    opacity: 0.75;
}

.holo-plant {
    position: absolute;
    width: 220px;
    height: 220px;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
}

@keyframes silhouette-float {
    0%, 100% {
        transform: translateY(0px) scale(1);
    }
    50% {
        transform: translateY(-6px) scale(1.03);
    }
}

.holo-footer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.holo-keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.keyword {
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    color: #0b1026;
    font-weight: 600;
    font-size: 0.75rem;
}

.metric-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.45rem;
}

.metric-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0.18);
    border-radius: 12px;
    padding: 0.65rem 0.9rem;
    color: #f7f9ff;
    font-size: 0.9rem;
}

.metric-label {
    opacity: 0.8;
}

.metric-value {
    font-weight: 600;
}
</style>
