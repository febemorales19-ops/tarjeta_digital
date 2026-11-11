import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    alias: '/tarjeta',
                    name: 'dashboard',
                    component: () => import('@/views/TarjetaDigital.vue')
                },
                {
                    path: '/pos',
                    name: 'pos',
                    component: () => import('@/views/PuntoVenta.vue')
                }
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        }
    ]
});

export default router;
