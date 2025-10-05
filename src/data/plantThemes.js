export const plantThemes = {
  Arroz: {
    palette: {
      surface: 'linear-gradient(160deg, rgba(9, 20, 40, 0.85), rgba(16, 48, 72, 0.88))',
      grid: 'rgba(102, 227, 255, 0.28)',
      axis: 'rgba(92, 190, 255, 0.35)',
      outline: '#7ef0ff',
      point: '#a6f8ff',
      fillCenter: '#ffffff',
      fillCenterOpacity: 0.25,
      fillEdge: '#6ddcff',
      fillEdgeOpacity: 0.72,
      sweepEdge: '#42c2ff',
      sweepEdgeOpacity: 0.6,
      sweepFade: '#061f33',
      sweepFadeOpacity: 0.15,
      text: '#e0f8ff',
      glow: 'rgba(90, 219, 255, 0.55)'
    },
    keywords: ['Campos inundados', 'Alta densidad', 'Sensado hídrico']
  },
  'Maíz': {
    palette: {
      surface: 'linear-gradient(150deg, rgba(30, 14, 46, 0.86), rgba(73, 32, 95, 0.82))',
      grid: 'rgba(255, 221, 126, 0.25)',
      axis: 'rgba(255, 187, 92, 0.35)',
      outline: '#ffd470',
      point: '#ffe5a8',
      fillCenter: '#fff7d6',
      fillCenterOpacity: 0.32,
      fillEdge: '#ffb347',
      fillEdgeOpacity: 0.8,
      sweepEdge: '#ff9f1c',
      sweepEdgeOpacity: 0.6,
      sweepFade: '#250d2f',
      sweepFadeOpacity: 0.2,
      text: '#ffeeda',
      glow: 'rgba(255, 196, 92, 0.5)'
    },
    keywords: ['Fotosíntesis C4', 'Fibras estructuradas', 'Resiliencia térmica']
  },
  Tomate: {
    palette: {
      surface: 'linear-gradient(160deg, rgba(42, 10, 28, 0.88), rgba(88, 19, 46, 0.8))',
      grid: 'rgba(255, 143, 163, 0.28)',
      axis: 'rgba(255, 110, 132, 0.38)',
      outline: '#ff8f9f',
      point: '#ffd1d8',
      fillCenter: '#ffe4ea',
      fillCenterOpacity: 0.3,
      fillEdge: '#ff476f',
      fillEdgeOpacity: 0.78,
      sweepEdge: '#ff5f8f',
      sweepEdgeOpacity: 0.65,
      sweepFade: '#2e0a1d',
      sweepFadeOpacity: 0.24,
      text: '#ffe5ec',
      glow: 'rgba(255, 127, 155, 0.55)'
    },
    keywords: ['Cultivo de invernadero', 'Maduración dirigida', 'Alta transpiración']
  },
  Lechuga: {
    palette: {
      surface: 'linear-gradient(145deg, rgba(8, 38, 22, 0.9), rgba(29, 83, 52, 0.82))',
      grid: 'rgba(170, 255, 173, 0.32)',
      axis: 'rgba(125, 255, 154, 0.42)',
      outline: '#8dffb0',
      point: '#d3ffdf',
      fillCenter: '#f2fff7',
      fillCenterOpacity: 0.3,
      fillEdge: '#69ffa1',
      fillEdgeOpacity: 0.75,
      sweepEdge: '#4ef38d',
      sweepEdgeOpacity: 0.6,
      sweepFade: '#0b301c',
      sweepFadeOpacity: 0.2,
      text: '#dcffe9',
      glow: 'rgba(116, 255, 169, 0.5)'
    },
    keywords: ['Hidroponía', 'Ciclo rápido', 'Hojas crispadas']
  },
  Frijol: {
    palette: {
      surface: 'linear-gradient(155deg, rgba(18, 24, 9, 0.88), rgba(52, 41, 15, 0.82))',
      grid: 'rgba(231, 199, 150, 0.28)',
      axis: 'rgba(198, 153, 92, 0.38)',
      outline: '#d9b678',
      point: '#f0debc',
      fillCenter: '#fff1da',
      fillCenterOpacity: 0.26,
      fillEdge: '#d1984a',
      fillEdgeOpacity: 0.74,
      sweepEdge: '#b57f2f',
      sweepEdgeOpacity: 0.58,
      sweepFade: '#201607',
      sweepFadeOpacity: 0.18,
      text: '#f3e6d1',
      glow: 'rgba(205, 168, 108, 0.5)'
    },
    keywords: ['Fijación de nitrógeno', 'Vainas robustas', 'Plasticidad hídrica']
  },
  'Pasto Napier': {
    palette: {
      surface: 'linear-gradient(140deg, rgba(5, 26, 8, 0.9), rgba(14, 58, 23, 0.84))',
      grid: 'rgba(144, 255, 202, 0.3)',
      axis: 'rgba(102, 235, 177, 0.38)',
      outline: '#6cf5c0',
      point: '#c0ffe6',
      fillCenter: '#eafff5',
      fillCenterOpacity: 0.28,
      fillEdge: '#58f0b8',
      fillEdgeOpacity: 0.76,
      sweepEdge: '#37d4a1',
      sweepEdgeOpacity: 0.58,
      sweepFade: '#062515',
      sweepFadeOpacity: 0.18,
      text: '#d7fff1',
      glow: 'rgba(92, 255, 190, 0.52)'
    },
    keywords: ['Forraje tropical', 'Crecimiento vigoroso', 'Uso intensivo de agua']
  }
}

export const defaultPlantTheme = {
  palette: {
    surface: 'linear-gradient(150deg, rgba(18, 14, 43, 0.9), rgba(32, 22, 64, 0.82))',
    grid: 'rgba(255, 255, 255, 0.18)',
    axis: 'rgba(255, 255, 255, 0.28)',
    outline: '#b399ff',
    point: '#d9c8ff',
    fillCenter: '#ffffff',
    fillCenterOpacity: 0.18,
    fillEdge: '#b799ff',
    fillEdgeOpacity: 0.65,
    sweepEdge: '#b799ff',
    sweepEdgeOpacity: 0.45,
    sweepFade: '#1B0D35',
    sweepFadeOpacity: 0,
    text: 'var(--text)',
    glow: 'rgba(183, 153, 255, 0.55)'
  },
  keywords: []
}
