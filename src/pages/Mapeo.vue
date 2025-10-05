<template>
  <section class="container">
    <h1
      style="font-size:2rem;font-weight:900;background:linear-gradient(135deg,var(--accent1),var(--bg3),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
      Mapeo de Datos (Esquema)
    </h1>
    <div class="grid grid-3" style="margin-top:1rem;">
      <div v-for="t in tables" :key="t.name" class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="font-weight:700;color:var(--accent1)">{{ t.name }}</div>
          <span class="pill">{{ t.desc }}</span>
        </div>
        <ul style="margin:.75rem 0 0; padding-left:1rem;">
          <li v-for="f in t.fields" :key="f.name" style="margin:.25rem 0;">
            <strong>{{ f.name }}</strong> <span class="muted">— {{ f.type }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
<script setup>
const tables = [
  {
    name: 'especie', desc: 'Taxonomía', fields: [
      { name: 'especie_id', type: 'INT PK' },
      { name: 'nombre_cientifico', type: 'VARCHAR' },
      { name: 'nombre_comun', type: 'VARCHAR' },
      { name: 'familia', type: 'VARCHAR' },
      { name: 'parte_comestible', type: 'VARCHAR' },
      { name: 'via_fotosintesis', type: 'ENUM(C3,C4,CAM)' },
      { name: 'imagen_url', type: 'VARCHAR (frontend)' }
    ]
  },
  {
    name: 'experimento', desc: 'Ambientales', fields: [
      { name: 'experimento_id', type: 'INT PK' },
      { name: 'especie_id', type: 'FK especie' },
      { name: 'sistema_cultivo_id', type: 'FK sistema_cultivo' },
      { name: 'fuente_id', type: 'FK fuente_estudio' },
      { name: 'env_co2_ppm', type: 'DECIMAL' },
      { name: 'env_temp_c', type: 'DECIMAL' },
      { name: 'env_fotoperiodo_h', type: 'DECIMAL' },
      { name: 'env_led_nm', type: 'VARCHAR' },
      { name: 'env_ph', type: 'DECIMAL' },
      { name: 'env_ec_conductividad', type: 'DECIMAL' }
    ]
  },
  {
    name: 'resultado', desc: 'KPIs', fields: [
      { name: 'resultado_id', type: 'INT PK' },
      { name: 'experimento_id', type: 'FK experimento' },
      { name: 'rendimiento_g_m2_d', type: 'DECIMAL' },
      { name: 'agua_por_kcal_ml', type: 'DECIMAL' },
      { name: 'dias_cosecha', type: 'INT' },
      { name: 'supervivencia_pct', type: 'DECIMAL' }
    ]
  },
  {
    name: 'fuente_estudio', desc: 'Publicación', fields: [
      { name: 'fuente_id', type: 'INT PK' },
      { name: 'doi', type: 'VARCHAR' },
      { name: 'url', type: 'VARCHAR' },
      { name: 'titulo', type: 'VARCHAR' },
      { name: 'anio', type: 'YEAR' },
      { name: 'repositorio', type: 'VARCHAR' },
      { name: 'autores', type: 'TEXT' }
    ]
  },
  {
    name: 'conjunto_omico', desc: 'Ómicas', fields: [
      { name: 'omico_id', type: 'INT PK' },
      { name: 'experimento_id', type: 'FK experimento' },
      { name: 'acceso_genelab', type: 'VARCHAR' },
      { name: 'tipo_omico', type: 'ENUM' },
      { name: 'tipo_ensayo', type: 'VARCHAR' },
      { name: 'tejido', type: 'VARCHAR' },
      { name: 'genes_diff_expr', type: 'INT' },
      { name: 'enlace', type: 'VARCHAR' }
    ]
  },
]
</script>