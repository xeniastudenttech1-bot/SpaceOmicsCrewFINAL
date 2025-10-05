import { resolveAsset, resolvePlantAsset } from '../utils/assets'

const catalog = [
  {
    keys: ['arroz', 'oryza sativa'],
    image: 'images/plants/arroz.svg'
  },
  {
    keys: ['maiz', 'maíz', 'zea mays'],
    image: 'images/plants/maiz.svg'
  },
  {
    keys: ['tomate', 'solanum lycopersicum'],
    image: 'images/plants/tomate.svg'
  },
  {
    keys: ['lechuga', 'lactuca sativa'],
    image: 'images/plants/lechuga.svg'
  },
  {
    keys: ['frijol', 'phaseolus vulgaris'],
    image: 'images/plants/frijol.svg'
  },
  {
    keys: ['pasto napier', 'cenchrus purpureus', 'napier'],
    image: 'images/plants/pasto-napier.svg'
  }
]

function flattenKeys(entry) {
  return entry.keys.map(key => key.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''))
}

export function getPlantMedia(name) {
  const normalized = name ? name.toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') : ''
  const record = catalog.find(entry => flattenKeys(entry).some(key => normalized.includes(key))) || null

  const fallback = resolveAsset('placeholder-plant.svg')
  const image = record ? resolveAsset(record.image, { fallback }) : resolvePlantAsset(name, { fallback })

  return {
    image,
    texture: image,
    hasMatch: Boolean(record)
  }
}

export function ensureEspecieMedia(especie) {
  if (!especie) return especie
  const media = getPlantMedia(especie.nombre_comun || especie.nombre_cientifico)
  return {
    ...especie,
    imagen_asset: especie.imagen_asset || media.image || resolveAsset(especie.imagen_url, { fallback: media.image }),
    media
  }
}
