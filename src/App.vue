<template>
  <div id="app">
    <div 
    @touchstart.prevent="switchStart"
    @touchmove.prevent="switchMove"
    @touchmove="switchEnd"
    >
      <m-header></m-header>
      <tab></tab>
    </div>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <!--播放器全局组件-->
    <player></player>
  </div>
</template>

<script>
  import MHeader from 'components/mHeader/mHeader'
  import Tab from 'components/tab'
  import Player from 'components/player/player'
  import { mapActions } from 'vuex'
  export default {
    name: 'app',
    data() {
      return {
        i: 0
      }
    },
    computed: {
      // 下一个皮肤样式class
      nextTheme() {
        const themes = ['black', 'blue', 'red', 'green']
        return themes[this.i]
      }
    },
    created() {
      // 根据localstorage初始化i
      const themes = ['black', 'blue', 'red', 'green']
      let len = themes.length
      while (len--) {
        if (themes[len] === this.theme) {
          this.i = len
          break
        }
      }

      this.touch = {}
      // 根据vuex初始化body皮肤样式class
      this.body = this.$root.$el.parentElement
      this.setClass(this.body, this.theme)
      // 监听自定义的换肤事件，在moveend判断是否触发
      this.$on('switch', this.switchTheme.bind(this))
    },
    methods: {
      switchStart(e) {
        // 初始化tuoch的start move状态
        this.touch.initiated = true
        this.touch.moved = false

        const touch = e.touches[0]
        this.touch.startX = touch.screenX
        this.touch.startY = touch.screenY
      },
      switchMove(e) {
        // 未初始化则返回
        if (!this.touch.initiated) return

        const touch = e.touches[0]
        this.touch.deltaX = touch.screenX - this.touch.startX
        const deltaY = touch.screenY - this.touch.startY
        // 不是水平滑动则返回
        if (Math.abs(this.touch.deltaX) < Math.abs(deltaY)) return

        !this.touch.moved && (this.touch.moved = true)
        const width = window.innerWidth
        this.touch.percent = Math.abs(this.touch.deltaX / width)
      },
      switchEnd(e) {
        // 未初始化/不是水平滑动/滑动未超过半屏返回
        if (!this.touch.moved || this.touch.percent < 0.5) return

        let i = this.i
        this.touch.deltaX > 0 ? i++ : i--
        if (i > 3) {
          this.i = 0
        } else if (i < 0) {
          this.i = 3
        } else {
          this.i = i
        }
        // 触发换肤事件并去除int/move标记
        this.$emit('switch', this.nextTheme)
        this.touch.initiated = false
        this.touch.moved = false
      },
      switchTheme(theme) {
        this.setClass(this.body, theme)
        this.setTheme(theme)
      },
      setClass(el, classNmae) {
        el.className = classNmae
      },
      ...mapActions(['setTheme'])
    },
    components: {
      MHeader,
      Tab,
      Player
    }
  }
</script>

<style scoped lang="stylus">
  
</style>
