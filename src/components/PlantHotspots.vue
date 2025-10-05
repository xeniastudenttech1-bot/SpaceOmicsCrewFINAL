<template>
    <div class="hotspot-wrap">
        <img :src="img" alt="planta" class="plant-img" ref="imgRef" />
        <button v-for="p in parts" :key="p.id" class="hotspot" :style="pointStyle(p)" @click="$emit('select-part', p)">
            <span class="dot"></span>
            <span class="label">{{ p.label }}</span>
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ img: { type: String, required: true }, parts: { type: Array, default: () => [] } })
const imgRef = ref(null)
function pointStyle(p) { return { left: (p.x * 100) + '%', top: (p.y * 100) + '%' } }
</script>

<style scoped>
.hotspot-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 3/2;
    border-radius: 14px;
    background: rgba(16, 20, 51, .9);
    overflow: hidden;
    margin-top: 1rem;
}

.plant-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.hotspot {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    gap: .4rem;
    background: rgba(198, 185, 255, .10);
    border: 1px solid rgba(198, 185, 255, .35);
    padding: .25rem .5rem;
    border-radius: 999px;
    color: var(--accent1);
    cursor: pointer;
    backdrop-filter: blur(6px);
}

.hotspot .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent1), var(--bg3));
    box-shadow: 0 0 10px var(--bg3);
}

.hotspot .label {
    font-size: .85rem;
}
</style>