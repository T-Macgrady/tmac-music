import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Recommend = resolve => {
  import('views/recommend').then(module => {
    resolve(module)
  })
}

const Singer = resolve => {
  import('views/singer').then(module => {
    resolve(module)
  })
}

const Search = resolve => {
  import('views/search').then(module => {
    resolve(module)
  })
}

const Rank = resolve => {
  import('views/rank').then(module => {
    resolve(module)
  })
}

const SingerDetail = resolve => {
  import('views/singer/details').then(module => {
    resolve(module)
  })
}

const RecommendDetail = resolve => {
  import('views/recommend/details').then(module => {
    resolve(module)
  })
}

const RankDetail = resolve => {
  import('views/rank/details').then(module => {
    resolve(module)
  })
}

const UserCenter = resolve => {
  import('components/userCenter/userCenter').then(module => {
    resolve(module)
  })
}

let router = new Router({
  routes: [{
    path: '/',
    redirect: '/recommend',
    name: '主页'
  }, {
    path: '/recommend',
    component: Recommend,
    name: 'recommend',
    children: [{
      path: '/recommend/:id',
      component: RecommendDetail,
      props: true
    }]
  }, {
    path: '/singer',
    component: Singer,
    name: 'singer',
    children: [{
      path: '/singer/:id',
      component: SingerDetail,
      props: true
    }]
  }, {
    path: '/search',
    component: Search,
    name: 'search',
    children: [{
      path: '/search/:id',
      component: SingerDetail
    }]

  }, {
    path: '/rank',
    component: Rank,
    name: 'rank',
    children: [{
      path: '/rank/:id',
      component: RankDetail,
      props: true
    }]
  }, {
    path: '/user',
    component: UserCenter
  }],
  scrollBehavior(to, from, savedPosition) {
    return {
      x: 0,
      y: 0
    }
  }
})

router.beforeEach((to, from, next) => {
  if (to.name === undefined) {
    // const delay = to.path === '/user' ? 50 : 200
    setTimeout(() => {
      document.querySelector('.bgColor').style.zIndex = '1'
    }, 50)
  }
  next()
  // if (from.path === '/' && to.params.id !== undefined) {
  //   const names = {
  //     singer: 'SET_SINGER',
  //     recommend: 'SET_DISC',
  //     rank: 'SET_TOP_LIST'
  //   }
  //   const target = to.path.match(/^\/(\w+)\//)[1]
  //   Object.keys(names).some(name => {
  //     if (target === name) {
  //       store.commit(names[name], to.params.id)
  //       return true
  //     }
  //   })
  // }
})
router.afterEach((to, from, next) => {
  if (from.name === undefined) {
    setTimeout(() => {
      document.querySelector('.bgColor').style.zIndex = '-1'
    }, 150)
  }
})
export default router