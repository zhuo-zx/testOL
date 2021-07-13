import VueRouter from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import("@/components/Home"),
    children: [
      {
        path: '/LayerType',
        name: 'LayerType',
        component: () => import("@/components/LayerType/index"),
      },
      {
        path: '/MapControl',
        name: 'MapControl',
        component: () => import("@/components/MapControl"),
      },
      {
        path: '/MapInteraction',
        name: 'MapInteraction',
        component: () => import("@/components/MapInteraction"),
      },
      {
        path: '/PopupOverlay',
        name: 'PopupOverlay',
        component: () => import("@/components/PopupOverlay"),
      },
      {
        path: '/PointImage',
        name: 'PointImage',
        component: () => import("@/components/PointImage"),
      },
      {
        path: '/TrailAnimate',
        name: 'TrailAnimate',
        component: () => import("@/components/TrailAnimate"),
      },
      {
        path: '/MoveAnimate',
        name: 'MoveAnimate',
        component: () => import("@/components/MoveAnimate"),
      }
    ]
  },
  {
    path: '*',
    redirect: '/'
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach((to, from, next) => {
  if(from.name === null && to.path !== '/') {
    next({
      name: 'Home'
    })
  } else {
    next();
  }
});

export default router;