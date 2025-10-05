
# Space Omics (frontend Vue 3 + Vite)

**Cómo ejecutar**
```bash
npm install
npm run dev
```

**Páginas**
- `/` Inicio + grid de especies (desde `especie`).
- `/comparador` Tabla de KPIs (join `experimento` + `resultado` + `especie`).
- `/investigacion/:experimentoId` Ficha completa del estudio (joins `experimento` + `resultado` + `especie` + `fuente_estudio` + `conjunto_omico`).
- `/mapeo` Resumen del esquema y campos mostrados.

**Sustituir por backend real**
- Reemplaza `src/services/api.js` por llamadas HTTP a tu backend. 
- El contrato actual usa los mismos nombres de campos que el SQL para minimizar el mapeo.
