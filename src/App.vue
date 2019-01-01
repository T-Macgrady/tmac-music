<template>
  <div id="app">
    <div class="bgColor" :class="theme">
      <transition name="opacity">
        <div v-show="bgOpacity" class="bgImg ignore" :class="theme" :style="bgImgStyle"></div>
      </transition>
    </div>
    <div 
    class="header"
    :class="theme"
    @touchstart="switchStart"
    @touchend="switchEnd"
    >
      <m-header></m-header>
      <tab></tab>
      <transition name="tip">
        <div v-show="tipIcon" ref="tipIcon" class="tip-icon">
          <i class="icon-slide"></i>
          <p class="note">滑动换肤</p>
        </div>
      </transition>
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
  import { mapActions, mapGetters } from 'vuex'
  import { getAnimationEnd } from 'common/js/dom'

const animationend = getAnimationEnd()
  export default {
    name: 'app',
    data() {
      return {
        themes: ['black', 'blue', 'red', 'green'],
        index: 0,
        bgOpacity: false,
        tipIcon: false
      }
    },
    computed: {
      // 下一个皮肤样式class
      currentTheme() {
        let index = this.index
        index = (index >= 0 && index <= 3) ? index : 0
        return this.themes[index]
      },
      bgImgStyle() {
        return {
          backgroundImage: `url(${this.bgImgUrl})`
        }
      },
      ...mapGetters(['bgImgUrl'])
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
    },
    mounted() {
      this.bgOpacity = true
      setTimeout(() => {
        this.tipIcon = true
        this.$refs.tipIcon.addEventListener(animationend, () => {
          this.tipIcon && (this.tipIcon = false)
        }, {once: true})
        setTimeout(() => {
          this.tipIcon && (this.tipIcon = false)
        }, 4500)
      }, 1000)
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
        this.index = index % len >= 0 ? index % len : (len - 1)
        // 触发换肤事件并去除int/move标记
        this.setTheme(this.currentTheme)
        this.touch.initiated = false
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

<style lang="stylus" scoped>
  #app
    overflow: hidden
    .bgColor
      position: absolute
      z-index: -1
      overflow: hidden
      left: 0
      top: 0
      width: 100%
      height: 100vh
      extend-styles(background, $color-background-op1)
      .bgImg::after
        position: absolute
        left: 0
        right: 0
        content: " "
        width: 100%
        height: 100%
      .bgImg
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        background-repeat: no-repeat
        background-size: cover
        background-position: center
        // opacity: .6
        transform-origin: center
        // transform: scale(1.5)
        extend-styles-pseudo(background-color, $color-background-d, after)
        &.ignore
          // filter: blur(15px)
        &.opacity-enter-active
          animation: opacity 2.5s
    .header
      extend-styles(background, $color-background-d)

  @keyframes opacity
    20%
      // opacity: .6
      transform: scale(1.5)
    60%
      transform: scale(3)
      opacity: 1
    100%
      // opacity: .6
      transform: scale(1.5)
</style>
