<template>
    <div class="card radar-card" :style="cardStyle">
        <div v-if="!hideHeader" class="radar-header">
            <h3>{{ title }}</h3>
            <p class="muted">{{ subtitle }}</p>
        </div>
        <div class="radar-stage" :style="{ width: `${size}px`, height: `${size}px` }">
            <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" role="img">
                <defs>
                    <radialGradient :id="gradientId">
                        <stop offset="0%" :stop-color="palette.fillCenter" :stop-opacity="palette.fillCenterOpacity" />
                        <stop offset="100%" :stop-color="palette.fillEdge" :stop-opacity="palette.fillEdgeOpacity" />
                    </radialGradient>
                    <radialGradient :id="sweepGradient" fx="0.15" fy="0.15">
                        <stop offset="0%" :stop-color="palette.sweepInner" :stop-opacity="palette.sweepInnerOpacity" />
                        <stop offset="35%" :stop-color="palette.sweepEdge" :stop-opacity="palette.sweepEdgeOpacity" />
                        <stop offset="100%" :stop-color="palette.sweepFade" :stop-opacity="palette.sweepFadeOpacity" />
                    </radialGradient>
                </defs>
                <g :transform="`translate(${center},${center})`">
                    <g v-for="r in rings" :key="r" class="ring">
                        <polygon :points="polygonPoints(r)" fill="none" />
                    </g>
                    <g class="sweep">
                        <path :d="sweepPath" :fill="`url(#${sweepGradient})`">
                            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="12s"
                                repeatCount="indefinite" />
                        </path>
                    </g>
                    <g v-for="(k, i) in keys" :key="k" class="axis">
                        <line :x1="0" :y1="0" :x2="axisPoint(i).x" :y2="axisPoint(i).y" />
                        <text :x="labelPoint(i).x" :y="labelPoint(i).y" dy="4" font-size="12">{{ labels[k] || k }}</text>
                    </g>
                    <polygon class="data-fill" :points="polygonPointsString" :fill="`url(#${gradientId})`" />
                    <polyline class="data-outline" :points="polygonPointsString" />
                    <g v-for="(p, i) in vertexPoints" :key="`pt-${i}`" class="data-point">
                        <circle :cx="p.x" :cy="p.y" r="4" />
                    </g>
                </g>
            </svg>
        </div>
    </div>
</template>

<script>
import { computed, defineComponent } from 'vue'

const defaultPalette = {
    surface: 'linear-gradient(135deg, rgba(15, 17, 35, 0.8), rgba(33, 23, 64, 0.65))',
    grid: 'rgba(255, 255, 255, 0.14)',
    axis: 'rgba(255, 255, 255, 0.22)',
    text: 'var(--text)',
    outline: '#F5D0FF',
    point: '#B799FF',
    pointStroke: '#ffffff',
    fillCenter: '#ffffff',
    fillCenterOpacity: 0.18,
    fillEdge: '#B799FF',
    fillEdgeOpacity: 0.65,
    sweepInner: '#ffffff',
    sweepInnerOpacity: 0,
    sweepEdge: '#B799FF',
    sweepEdgeOpacity: 0.45,
    sweepFade: '#1B0D35',
    sweepFadeOpacity: 0,
    glow: 'rgba(183, 153, 255, 0.7)'
}

export default defineComponent({
    name: 'RadarGraph',
    props: {
        size: { type: Number, default: 360 },
        values: { type: Object, default: () => ({}) },
        labels: { type: Object, default: () => ({}) },
        palette: { type: Object, default: () => ({}) },
        title: { type: String, default: 'Main attributes' },
        subtitle: { type: String, default: 'Automatically updates with the selected plant.' },
        hideHeader: { type: Boolean, default: false }
    },
    setup(props) {
        const gradientId = `radar-grad-${Math.random().toString(36).slice(2, 8)}`
        const sweepGradient = `radar-sweep-${Math.random().toString(36).slice(2, 8)}`
        const palette = computed(() => ({ ...defaultPalette, ...(props.palette || {}) }))
        const cardStyle = computed(() => ({
            background: palette.value.surface,
            color: palette.value.text,
            '--radar-surface': palette.value.surface,
            '--radar-grid': palette.value.grid,
            '--radar-axis': palette.value.axis,
            '--radar-text': palette.value.text,
            '--radar-outline': palette.value.outline,
            '--radar-point': palette.value.point,
            '--radar-point-stroke': palette.value.pointStroke || '#ffffff',
            '--radar-glow': palette.value.glow
        }))
        const keys = computed(() => {
            const valueKeys = Object.keys(props.values || {})
            if (valueKeys.length) return valueKeys
            return Object.keys(props.labels || {})
        })
        const center = computed(() => props.size / 2)
        const radius = computed(() => props.size * 0.35)
        const rings = computed(() => [0.25, 0.5, 0.75, 1])

        function angle(i) {
            return (Math.PI * 2 * (i / (keys.value.length || 1))) - Math.PI / 2
        }
        function axisPoint(i) {
            const a = angle(i); return { x: Math.cos(a) * radius.value, y: Math.sin(a) * radius.value }
        }
        function labelPoint(i) {
            const a = angle(i); return { x: Math.cos(a) * (radius.value + 22), y: Math.sin(a) * (radius.value + 22) }
        }
        function toPoint(k, i) {
            const v = Number(props.values[k]) || 0
            const max = Math.max(1, ...Object.values(props.values).map(n => Number(n) || 0))
            const r = radius.value * (v / max)
            const a = angle(i)
            return { x: Math.cos(a) * r, y: Math.sin(a) * r }
        }
        const vertexPoints = computed(() => keys.value.map((k, i) => toPoint(k, i)))
        const polygonPointsString = computed(() => vertexPoints.value.map(p => `${p.x},${p.y}`).join(' '))
        function polygonPoints(scale) {
            return keys.value.map((_, i) => {
                const a = angle(i); const r = radius.value * scale
                return `${Math.cos(a) * r},${Math.sin(a) * r}`
            }).join(' ')
        }
        const sweepPath = computed(() => {
            const width = Math.PI / 6
            const base = -Math.PI / 2
            const start = base - width / 2
            const end = base + width / 2
            const r = radius.value
            const x1 = Math.cos(start) * r
            const y1 = Math.sin(start) * r
            const x2 = Math.cos(end) * r
            const y2 = Math.sin(end) * r
            return `M0 0 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
        })

        return {
            size: props.size,
            labels: props.labels,
            title: props.title,
            subtitle: props.subtitle,
            hideHeader: props.hideHeader,
            keys,
            center,
            rings,
            axisPoint,
            labelPoint,
            polygonPoints,
            polygonPointsString,
            vertexPoints,
            gradientId,
            sweepGradient,
            sweepPath,
            palette,
            cardStyle
        }
    }
})
</script>

<style scoped>
.radar-card {
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: var(--radar-surface, linear-gradient(135deg, rgba(15, 17, 35, 0.8), rgba(33, 23, 64, 0.65)));
    color: var(--radar-text, var(--text));
}

.radar-header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.radar-header h3 {
    margin: 0;
    font-weight: 700;
}

.radar-stage {
    position: relative;
    margin-top: 0.75rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.radar-stage svg {
    overflow: visible;
    filter: drop-shadow(0 12px 30px rgba(0, 0, 0, 0.35));
}

.ring polygon {
    stroke: var(--radar-grid);
    stroke-width: 1;
}

.axis line {
    stroke: var(--radar-axis);
    stroke-width: 1;
}

.axis text {
    fill: var(--radar-text);
    text-anchor: middle;
    font-weight: 500;
    letter-spacing: 0.2px;
}

.sweep path {
    transform-origin: 0 0;
    opacity: 0.65;
}

.data-fill {
    stroke: var(--radar-outline);
    stroke-width: 2;
    fill-opacity: 0.4;
    transition: all 0.6s ease;
}

.data-outline {
    stroke: var(--radar-outline);
    stroke-width: 2;
    fill: none;
    stroke-linejoin: round;
    opacity: 0.85;
}

.data-point circle {
    fill: var(--radar-point);
    stroke: var(--radar-point-stroke);
    stroke-width: 1.5;
    filter: drop-shadow(0 0 6px var(--radar-glow));
    transition: transform 0.3s ease;
}

.data-point circle:hover {
    transform: scale(1.2);
}
</style>
