<template>
    <canvas ref="canvas" class="plant3d-canvas"></canvas>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
    plant: { type: String, required: true },
    palette: { type: Object, default: () => ({}) },
    rotationSpeed: { type: Number, default: 0.4 },
    texture: { type: String, default: '' }
})

const canvas = ref(null)
let ctx = null
let frameId = null
let width = 0
let height = 0
let lastTime = 0
let rotation = 0
let resizeObserver = null
let textureImage = null
let textureAlpha = 0
let targetTextureAlpha = 0

const camera = { z: 6.5, fov: 3.2 }
const light = normalize({ x: -0.45, y: 0.9, z: 0.6 })
const state = { meshes: [], pulses: [] }

const scenePalette = computed(() => ({
    stem: props.palette.point || '#7ef0c8',
    leaf: props.palette.outline || '#a6ffd9',
    accent: props.palette.fillEdge || '#64f0c8',
    highlight: '#ffffff',
    ground: '#0a1020',
    halo: props.palette.glow || 'rgba(126, 240, 200, 0.5)'
}))

function loadTexture(src) {
    if (typeof Image === 'undefined') return
    textureImage = null
    textureAlpha = 0
    targetTextureAlpha = 0
    if (!src) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
        textureImage = img
        targetTextureAlpha = 0.55
    }
    img.onerror = () => {
        textureImage = null
    }
    img.src = src
}

function withAlpha(color, alpha) {
    if (color.startsWith('#')) {
        const hex = color.slice(1)
        const bigint = parseInt(hex, 16)
        const r = (bigint >> 16) & 255
        const g = (bigint >> 8) & 255
        const b = bigint & 255
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
    const match = color.match(/rgba?\(([^)]+)\)/)
    if (!match) return color
    const parts = match[1].split(',').map(p => p.trim())
    if (parts.length < 4) parts.push(alpha)
    else parts[3] = alpha
    return `rgba(${parts.join(', ')})`
}

function normalize(vec) {
    const len = Math.hypot(vec.x, vec.y, vec.z) || 1
    return { x: vec.x / len, y: vec.y / len, z: vec.z / len }
}

function rotateX(v, angle) {
    const s = Math.sin(angle), c = Math.cos(angle)
    return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c }
}

function rotateY(v, angle) {
    const s = Math.sin(angle), c = Math.cos(angle)
    return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c }
}

function rotateZ(v, angle) {
    const s = Math.sin(angle), c = Math.cos(angle)
    return { x: v.x * c - v.y * s, y: v.x * s + v.y * c, z: v.z }
}

function transformVertex(vertex, mesh, globalRotation) {
    let v = { x: vertex.x, y: vertex.y, z: vertex.z }
    if (mesh.scale) {
        v.x *= mesh.scale.x
        v.y *= mesh.scale.y
        v.z *= mesh.scale.z
    }
    v = rotateY(v, globalRotation + (mesh.rotation?.y || 0))
    if (mesh.rotation) {
        if (mesh.rotation.x) v = rotateX(v, mesh.rotation.x)
        if (mesh.rotation.z) v = rotateZ(v, mesh.rotation.z)
    }
    if (mesh.position) {
        v.x += mesh.position.x
        v.y += mesh.position.y
        v.z += mesh.position.z
    }
    return v
}

function project(vertex) {
    const vz = camera.z - vertex.z
    const perspective = camera.fov / (vz || 0.001)
    const scale = Math.min(width, height)
    return {
        x: vertex.x * perspective * scale * 0.35 + width / 2,
        y: -vertex.y * perspective * scale * 0.35 + height * 0.55,
        depth: vz
    }
}

function computeNormal(a, b, c) {
    const u = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
    const v = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z }
    const nx = u.y * v.z - u.z * v.y
    const ny = u.z * v.x - u.x * v.z
    const nz = u.x * v.y - u.y * v.x
    return normalize({ x: nx, y: ny, z: nz })
}

function adjustColor(hex, intensity, emissive = 0) {
    const color = hex.replace('#', '')
    const bigint = parseInt(color, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    const mix = Math.min(1, intensity + emissive)
    const to255 = v => Math.round(Math.max(0, Math.min(255, v)))
    return `rgb(${to255(r * mix)}, ${to255(g * mix)}, ${to255(b * mix)})`
}

function createLathe(profile, segments) {
    const verts = []
    const faces = []
    const rows = profile.length
    for (let i = 0; i < segments; i += 1) {
        const theta = (i / segments) * Math.PI * 2
        const cos = Math.cos(theta)
        const sin = Math.sin(theta)
        profile.forEach((p) => {
            verts.push({ x: p.x * cos, y: p.y, z: p.x * sin })
        })
    }
    for (let i = 0; i < segments; i += 1) {
        const next = (i + 1) % segments
        for (let j = 0; j < rows - 1; j += 1) {
            const a = i * rows + j
            const b = next * rows + j
            const c = next * rows + j + 1
            const d = i * rows + j + 1
            faces.push([a, b, d])
            faces.push([b, c, d])
        }
    }
    return { vertices: verts, faces }
}

function createCylinder(radiusTop, radiusBottom, height, segments = 16) {
    const half = height / 2
    const profile = [
        { x: Math.max(0.001, radiusTop), y: half },
        { x: Math.max(0.001, radiusBottom), y: -half }
    ]
    return createLathe(profile, segments)
}

function createCone(radius, height, segments = 16) {
    const half = height / 2
    const profile = [
        { x: 0.001, y: half },
        { x: radius, y: -half }
    ]
    return createLathe(profile, segments)
}

function createSphere(radius, segments = 16, rings = 12) {
    const vertices = []
    const faces = []
    for (let i = 0; i <= rings; i += 1) {
        const theta = (i / rings) * Math.PI
        const y = radius * Math.cos(theta)
        const r = radius * Math.sin(theta)
        for (let j = 0; j < segments; j += 1) {
            const phi = (j / segments) * Math.PI * 2
            vertices.push({ x: r * Math.cos(phi), y, z: r * Math.sin(phi) })
        }
    }
    for (let i = 0; i < rings; i += 1) {
        for (let j = 0; j < segments; j += 1) {
            const nextJ = (j + 1) % segments
            const a = i * segments + j
            const b = i * segments + nextJ
            const c = (i + 1) * segments + nextJ
            const d = (i + 1) * segments + j
            faces.push([a, b, d])
            faces.push([b, c, d])
        }
    }
    return { vertices, faces }
}

function createLeaf(width, height, bend = 0.25, segments = 8) {
    const verts = []
    const faces = []
    for (let i = 0; i <= segments; i += 1) {
        const t = i / segments
        const y = -height / 2 + t * height
        const sway = Math.sin(t * Math.PI) * bend
        const half = width * (1 - t * 0.65)
        verts.push({ x: -half, y, z: sway })
        verts.push({ x: half, y, z: sway })
    }
    for (let i = 0; i < segments; i += 1) {
        const a = i * 2
        const b = a + 1
        const c = a + 2
        const d = a + 3
        faces.push([a, b, d])
        faces.push([a, d, c])
    }
    return { vertices: verts, faces }
}

function addMesh(meshes, geometry, options) {
    meshes.push({
        vertices: geometry.vertices,
        faces: geometry.faces,
        color: options.color,
        emissive: options.emissive || 0,
        opacity: options.opacity ?? 1,
        position: options.position || { x: 0, y: 0, z: 0 },
        rotation: options.rotation || { x: 0, y: 0, z: 0 },
        scale: options.scale || { x: 1, y: 1, z: 1 }
    })
}

function buildPlant() {
    state.meshes = []
    state.pulses = []
    const palette = scenePalette.value
    const meshes = state.meshes

    const base = createCylinder(1.4, 1.6, 0.25, 24)
    addMesh(meshes, base, { color: palette.ground, position: { x: 0, y: -1.6, z: 0 } })

    state.pulses = [0, 0.38, 0.76].map((delay, index) => ({ progress: delay, speed: 0.42 + index * 0.12 }))

    const plant = (props.plant || '').toLowerCase()
    if (plant.includes('arroz')) {
        for (let i = 0; i < 4; i += 1) {
            const stem = createCylinder(0.08, 0.1, 2.6, 14)
            addMesh(meshes, stem, {
                color: palette.stem,
                position: { x: (i - 1.5) * 0.2, y: 0.8, z: 0 },
                rotation: { x: 0, y: 0, z: (i - 1.5) * 0.12 }
            })
        }
        for (let i = 0; i < 14; i += 1) {
            const grain = createSphere(0.12, 10, 8)
            const angle = (i / 14) * Math.PI * 2
            addMesh(meshes, grain, {
                color: palette.accent,
                emissive: 0.6,
                position: {
                    x: Math.cos(angle) * 0.45,
                    y: 1.8 + Math.sin(angle * 2) * 0.15,
                    z: Math.sin(angle) * 0.45
                }
            })
        }
        for (let i = 0; i < 5; i += 1) {
            const leaf = createLeaf(0.6, 1.4, 0.35)
            addMesh(meshes, leaf, {
                color: palette.leaf,
                position: { x: Math.cos((i / 5) * Math.PI * 2) * 0.7, y: -0.2, z: Math.sin((i / 5) * Math.PI * 2) * 0.7 },
                rotation: { x: Math.PI / 3, y: (i / 5) * Math.PI * 2, z: 0 }
            })
        }
    } else if (plant.includes('maíz') || plant.includes('maiz')) {
        const stalk = createCylinder(0.28, 0.36, 3.4, 18)
        addMesh(meshes, stalk, { color: palette.stem, position: { x: 0, y: 1, z: 0 } })
        const cob = createCylinder(0.38, 0.25, 1.1, 16)
        addMesh(meshes, cob, { color: palette.accent, emissive: 0.4, position: { x: 0, y: 2.4, z: 0 } })
        for (let i = 0; i < 4; i += 1) {
            const leaf = createLeaf(0.75, 1.8, 0.4)
            addMesh(meshes, leaf, {
                color: palette.leaf,
                position: { x: 0, y: 0.2, z: 0 },
                rotation: { x: Math.PI / 3.4, y: (i / 4) * Math.PI * 2, z: 0 }
            })
        }
    } else if (plant.includes('tomate')) {
        const stem = createCylinder(0.16, 0.22, 2.2, 14)
        addMesh(meshes, stem, { color: palette.stem, position: { x: 0, y: 0.7, z: 0 } })
        for (let i = 0; i < 6; i += 1) {
            const fruit = createSphere(0.32, 12, 10)
            const angle = (i / 6) * Math.PI * 2
            addMesh(meshes, fruit, {
                color: palette.accent,
                emissive: 0.5,
                position: { x: Math.cos(angle) * 0.7, y: 1.3 + Math.sin(angle) * 0.2, z: Math.sin(angle) * 0.7 }
            })
        }
        for (let i = 0; i < 6; i += 1) {
            const leaf = createLeaf(0.6, 1.3, 0.4)
            addMesh(meshes, leaf, {
                color: palette.leaf,
                position: { x: 0, y: 0.1, z: 0 },
                rotation: { x: Math.PI / 2.2, y: (i / 6) * Math.PI * 2, z: 0 }
            })
        }
        const apex = createSphere(0.24, 10, 8)
        addMesh(meshes, apex, { color: palette.highlight, emissive: 0.3, position: { x: 0, y: 2, z: 0 } })
    } else if (plant.includes('lechuga')) {
        for (let ring = 0; ring < 2; ring += 1) {
            const count = ring ? 6 : 8
            for (let i = 0; i < count; i += 1) {
                const leaf = createLeaf(0.85 - ring * 0.18, 1.4 - ring * 0.2, 0.4)
                addMesh(meshes, leaf, {
                    color: palette.leaf,
                    position: { x: 0, y: -0.3 + ring * 0.15, z: 0 },
                    rotation: { x: Math.PI / (1.8 + ring * 0.4), y: (i / count) * Math.PI * 2, z: 0 }
                })
            }
        }
        const heart = createCylinder(0.25, 0.35, 1.2, 12)
        addMesh(meshes, heart, { color: palette.stem, position: { x: 0, y: 0.1, z: 0 } })
    } else if (plant.includes('frijol')) {
        const stem = createCylinder(0.1, 0.14, 3.1, 14)
        addMesh(meshes, stem, {
            color: palette.stem,
            position: { x: -0.1, y: 1.05, z: 0 },
            rotation: { x: 0, y: 0, z: -0.1 }
        })
        for (let i = 0; i < 4; i += 1) {
            const pod = createCylinder(0.18, 0.22, 0.9, 10)
            addMesh(meshes, pod, {
                color: palette.accent,
                emissive: 0.35,
                position: { x: Math.cos((i / 4) * Math.PI * 2) * 0.6, y: 1.4 + i * 0.05, z: Math.sin((i / 4) * Math.PI * 2) * 0.6 },
                rotation: { x: Math.PI / 5, y: (i / 4) * Math.PI * 2, z: 0 }
            })
        }
        for (let i = 0; i < 5; i += 1) {
            const leaf = createLeaf(0.55, 1.4, 0.35)
            addMesh(meshes, leaf, {
                color: palette.leaf,
                position: { x: 0, y: 0.2, z: 0 },
                rotation: { x: Math.PI / 2.6, y: (i / 5) * Math.PI * 2, z: 0 }
            })
        }
    } else if (plant.includes('pasto') || plant.includes('napier')) {
        for (let i = 0; i < 6; i += 1) {
            const blade = createLeaf(0.7, 2, 0.48)
            addMesh(meshes, blade, {
                color: palette.leaf,
                position: { x: Math.sin(i * 0.8) * 0.3, y: 0, z: Math.cos(i * 0.8) * 0.3 },
                rotation: { x: Math.PI / 3.4, y: (i / 6) * Math.PI * 2, z: 0 }
            })
        }
        for (let i = 0; i < 4; i += 1) {
            const stem = createCylinder(0.08, 0.1, 3.6, 14)
            addMesh(meshes, stem, {
                color: palette.stem,
                position: { x: Math.sin(i * 1.3) * 0.35, y: 1.2, z: Math.cos(i * 1.3) * 0.35 },
                rotation: { x: 0, y: 0, z: (i - 2) * 0.05 }
            })
        }
    } else {
        for (let i = 0; i < 5; i += 1) {
            const blade = createLeaf(0.65, 1.8, 0.45)
            addMesh(meshes, blade, {
                color: palette.leaf,
                position: { x: 0, y: -0.1, z: 0 },
                rotation: { x: Math.PI / 3.2, y: (i / 5) * Math.PI * 2, z: 0 }
            })
        }
        const trunk = createCylinder(0.12, 0.18, 2.6, 14)
        addMesh(meshes, trunk, { color: palette.stem, position: { x: 0, y: 0.7, z: 0 } })
    }
}

function drawBackground() {
    ctx.clearRect(0, 0, width, height)
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, 'rgba(8, 12, 28, 0)')
    gradient.addColorStop(1, 'rgba(8, 12, 28, 0.9)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    const palette = scenePalette.value
    ctx.save()
    ctx.translate(width / 2, height * 0.75)
    for (const pulse of state.pulses) {
        const radius = 80 + pulse.progress * 80
        const opacity = Math.max(0, 0.35 * (1 - pulse.progress))
        const ringGradient = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius)
        ringGradient.addColorStop(0, 'rgba(255,255,255,0)')
        ringGradient.addColorStop(0.8, withAlpha(palette.halo, opacity))
        ringGradient.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.strokeStyle = ringGradient
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(0, 0, radius, 0, Math.PI * 2)
        ctx.stroke()
    }
    ctx.restore()
}

function render(delta) {
    drawBackground()
    const faces = []
    state.meshes.forEach(mesh => {
        const transformed = mesh.vertices.map(v => transformVertex(v, mesh, rotation))
        mesh.faces.forEach(face => {
            const a = transformed[face[0]]
            const b = transformed[face[1]]
            const c = transformed[face[2]]
            const normal = computeNormal(a, b, c)
            if (normal.z >= 0) return
            const center = {
                x: (a.x + b.x + c.x) / 3,
                y: (a.y + b.y + c.y) / 3,
                z: (a.z + b.z + c.z) / 3
            }
            const projA = project(a)
            const projB = project(b)
            const projC = project(c)
            const intensity = Math.max(0.18, -(normal.x * light.x + normal.y * light.y + normal.z * light.z))
            faces.push({
                points: [projA, projB, projC],
                color: adjustColor(mesh.color, intensity, mesh.emissive),
                opacity: mesh.opacity,
                depth: camera.z - center.z
            })
        })
    })
    faces.sort((a, b) => b.depth - a.depth)
    faces.forEach(face => {
        ctx.globalAlpha = face.opacity
        ctx.fillStyle = face.color
        ctx.beginPath()
        face.points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y)
            else ctx.lineTo(p.x, p.y)
        })
        ctx.closePath()
        ctx.fill()
    })

    if (textureImage) {
        const easing = delta ? Math.min(1, delta * 6) : 0.18
        textureAlpha += (targetTextureAlpha - textureAlpha) * easing
        const alpha = Math.max(0, Math.min(textureAlpha, 0.65))
        if (alpha > 0.01) {
            ctx.save()
            ctx.translate(width / 2, height * 0.5)
            ctx.rotate(rotation * 0.18)
            const size = Math.min(width, height) * 0.58
            ctx.globalAlpha = alpha
            ctx.drawImage(textureImage, -size / 2, -size / 2, size, size)
            ctx.globalCompositeOperation = 'lighter'
            ctx.globalAlpha = alpha * 0.6
            ctx.fillStyle = withAlpha(scenePalette.value.halo, 0.4)
            ctx.beginPath()
            ctx.ellipse(0, size * 0.1, size * 0.65, size * 0.25, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
        }
    }
    ctx.globalAlpha = 1
}

function animate(timestamp) {
    if (!ctx) return
    const delta = lastTime ? (timestamp - lastTime) / 1000 : 0
    lastTime = timestamp
    rotation += delta * props.rotationSpeed
    state.pulses.forEach(pulse => {
        const speed = pulse.speed ?? 0.5
        pulse.progress += delta * speed
        if (pulse.progress > 1.2) pulse.progress = 0
    })
    render(delta)
    frameId = requestAnimationFrame(animate)
}

function resize() {
    if (!canvas.value) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = canvas.value.clientWidth
    height = canvas.value.clientHeight
    canvas.value.width = width * dpr
    canvas.value.height = height * dpr
    if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.scale(dpr, dpr)
    }
}

onMounted(() => {
    if (!canvas.value) return
    ctx = canvas.value.getContext('2d')
    resize()
    buildPlant()
    loadTexture(props.texture)
    lastTime = 0
    rotation = 0
    animate(0)
    if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
            if (ctx) ctx.setTransform(1, 0, 0, 1, 0, 0)
            resize()
        })
        resizeObserver.observe(canvas.value)
    } else {
        window.addEventListener('resize', resize)
    }
})

onBeforeUnmount(() => {
    if (frameId) cancelAnimationFrame(frameId)
    if (resizeObserver && canvas.value) resizeObserver.disconnect()
    else window.removeEventListener('resize', resize)
})

watch(() => [props.plant, props.palette], () => {
    if (!ctx) return
    buildPlant()
}, { deep: true })

watch(() => props.texture, value => {
    loadTexture(value)
}, { immediate: true })
</script>

<style scoped>
.plant3d-canvas {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 60%, rgba(40, 80, 120, 0.25), rgba(6, 10, 24, 0.95));
    filter: drop-shadow(0 25px 45px rgba(0, 0, 0, 0.45));
}
</style>
