import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Comparador from './pages/Comparador.vue'
import Ficha from './pages/Ficha.vue'
import Mapeo from './pages/Mapeo.vue'
import Repositorio from './pages/Repositorio.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/comparador', component: Comparador },
  { path: '/repositorio/:especieId', component: Repositorio, props: true },
  { path: '/experimento/:experimentoId', component: Ficha, props: true },
  { path: '/mapeo', component: Mapeo },
]

export default createRouter({ history: createWebHashHistory(), routes })
