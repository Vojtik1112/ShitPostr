import { createRouter, createWebHistory } from 'vue-router'
import Register from './components/Register.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Register,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('./components/Home.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
