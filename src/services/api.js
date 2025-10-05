import mock from '../data/mock.json'

export async function getEspecies() { return mock.especies }
export async function getExperimentos() { return mock.experimentos }
export async function getResultados() { return mock.resultado }
export async function getFuentes() { return mock.fuente_estudio }
export async function getOmicos() { return mock.conjunto_omico }

export async function getKPIComparadorRows() {
  const [exp, res, esp] = await Promise.all([getExperimentos(), getResultados(), getEspecies()])
  return exp.map(e => {
    const r = res.find(x => x.experimento_id === e.experimento_id)
    const s = esp.find(x => x.especie_id === e.especie_id)
    return {
      experimento_id: e.experimento_id,
      especie_cientifico: s?.nombre_cientifico || '—',
      especie_comun: s?.nombre_comun || '—',
      rendimiento: r?.rendimiento_g_m2_d ?? null,
      dias_cosecha: r?.dias_cosecha ?? null,
      ph: e.env_ph ?? null,
      ec: e.env_ec_conductividad ?? null
    }
  })
}

export async function getFichaByExperimento(id) {
  const [exp, res, esp, fuentes, om] = await Promise.all([getExperimentos(), getResultados(), getEspecies(), getFuentes(), getOmicos()])
  const ex = exp.find(x => String(x.experimento_id) === String(id))
  if (!ex) return null
  const r = res.find(x => x.experimento_id === ex.experimento_id) || {}
  const s = esp.find(x => x.especie_id === ex.especie_id) || {}
  const f = fuentes.find(x => x.fuente_id === ex.fuente_id) || {}
  const omics = om.filter(o => o.experimento_id === ex.experimento_id)
  return { experimento: ex, resultado: r, especie: s, fuente: f, omics }
}

export async function getRepoFiltersByEspecie(especieId) {
  const [exp, fuentes] = await Promise.all([getExperimentos(), getFuentes()])
  const subset = exp.filter(e => e.especie_id === Number(especieId))
  if (!subset.length) {
    return { sistemas: [], anio_min: null, anio_max: null, ph_min: null, ph_max: null, ec_min: null, ec_max: null }
  }
  const systems = Array.from(new Set(subset.map(s => s.sistema_cultivo_id))).map(id => ({ sistema_cultivo_id: id, nombre: 'Sistema ' + id }))
  const anios = subset
    .map(e => fuentes.find(f => f.fuente_id === e.fuente_id)?.anio)
    .filter(n => Number.isFinite(n))
  const phValues = subset.map(e => Number(e.env_ph)).filter(n => Number.isFinite(n))
  const ecValues = subset.map(e => Number(e.env_ec_conductividad)).filter(n => Number.isFinite(n))
  const safeMin = arr => (arr.length ? Math.min(...arr) : null)
  const safeMax = arr => (arr.length ? Math.max(...arr) : null)
  return {
    sistemas: systems,
    anio_min: safeMin(anios),
    anio_max: safeMax(anios),
    ph_min: safeMin(phValues),
    ph_max: safeMax(phValues),
    ec_min: safeMin(ecValues),
    ec_max: safeMax(ecValues)
  }
}

export async function getRepoExperimentos(especieId, params = {}) {
  const [exp, res, fuentes] = await Promise.all([getExperimentos(), getResultados(), getFuentes()])
  let subset = exp.filter(e => e.especie_id === Number(especieId))
  if (params.sistema_cultivo_id) subset = subset.filter(e => e.sistema_cultivo_id === Number(params.sistema_cultivo_id))
  if (params.anio_desde) subset = subset.filter(e => (fuentes.find(f => f.fuente_id === e.fuente_id)?.anio || 0) >= Number(params.anio_desde))
  if (params.anio_hasta) subset = subset.filter(e => (fuentes.find(f => f.fuente_id === e.fuente_id)?.anio || 0) <= Number(params.anio_hasta))
  if (params.ph_min != null) subset = subset.filter(e => e.env_ph >= Number(params.ph_min))
  if (params.ph_max != null) subset = subset.filter(e => e.env_ph <= Number(params.ph_max))
  const rows = subset.map(e => {
    const r = res.find(x => x.experimento_id === e.experimento_id)
    const anio = fuentes.find(f => f.fuente_id === e.fuente_id)?.anio
    return { ...e, anio, rendimiento: r?.rendimiento_g_m2_d ?? null, dias_cosecha: r?.dias_cosecha ?? null }
  })
  return rows.sort((a, b) => (b.anio || 0) - (a.anio || 0))
}