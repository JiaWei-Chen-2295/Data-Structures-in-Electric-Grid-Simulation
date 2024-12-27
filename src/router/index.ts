import { createRouter, createWebHistory } from 'vue-router'
import MainView from "@/views/MainView.vue";
import TeamView from "@/views/TeamView.vue";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
      {
        path: '/',
        name: 'main',
        component: MainView
      },
    {
      path: '/team',
      name: 'team',
      component: TeamView
    }

]
})

export default router
