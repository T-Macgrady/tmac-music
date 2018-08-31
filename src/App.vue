<template>
  <div id="app">
    <div 
    @touchstart="switchStart"
    @touchend="switchEnd"
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
        themes: ['black', 'blue', 'red', 'green'],
        index: 0
      }
    },
    computed: {
      // 下一个皮肤样式class
      currentTheme() {
        let index = this.index
        index = (index >= 0 && index <= 3) ? index : 0
        return this.themes[index]
      }
    },
    created() {
      // 根据localstorage初始化i
      let theme = this.theme
      let themes = this.themes
      let len = themes.length
      while (len--) {
        if (themes[len] === theme) {
          this.index = len
          break
        }
      }

      this.touch = {}
      // 根据vuex初始化body皮肤样式class
      this.body = this.$root.$el.parentElement
      this.setClass(this.body, this.currentTheme)
      // 监听自定义的换肤事件，在moveend判断是否触发
      this.$on('switch', this.switchTheme.bind(this))
    },
    methods: {
      switchStart(e) {
        this.touch.initiated = true

        const touch = e.touches[0]
        this.touch.startX = touch.screenX
        this.touch.startY = touch.screenY
      },
      switchEnd(e) {
        // 未初始化/不是水平滑动/滑动未超过半屏返回
        if (!this.touch.initiated) return
        const touch = e.changedTouches[0]
        const deltaX = touch.screenX - this.touch.startX
        const deltaY = touch.screenY - this.touch.startY
        // 不是水平滑动则返回，是则阻止默认点击事件
        if (Math.abs(deltaX) <= Math.abs(deltaY)) return
        e.preventDefault()

        const percent = Math.abs(deltaX / window.innerWidth)
        if (percent < 0.3) return
        let index = this.index
        const len = this.themes.length
        deltaX > 0 ? index++ : index--
        // if (index > len - 1) {
        //   this.index = 0
        // } else if (index < 0) {
        //   this.index = len - 1
        // } else {
        //   this.index = index
        // }
        this.index = index % len >= 0 ? index % len : (len - 1)
        // 触发换肤事件并去除int/move标记
        this.$emit('switch', this.currentTheme)
        this.touch.initiated = false
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
