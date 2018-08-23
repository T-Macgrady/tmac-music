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
      nextTheme() {
        // debugger
        const themes = ['black', 'blue', 'red', 'green']
        return themes[this.i]
      }
    },
    created() {
      const themes = ['black', 'blue', 'red', 'green']
      let len = themes.length
      // debugger
      while (len--) {
        if (themes[len] === this.theme) {
          // debugger
          this.i = len
          break
        }
      }
      this.touch = {}
      this.body = this.$root.$el.parentElement
      this.setClass(this.body, this.theme)
      this.$on('switch', this.switchTheme.bind(this))
    },
    methods: {
      switchStart(e) {
        // debugger
        console.log('switchStart')
        this.touch.initiated = true
        this.touch.move = false
        const touch = e.touches[0]
        this.touch.startX = touch.screenX
        this.touch.startY = touch.screenY
      },
      switchMove(e) {
        console.log('switchMove')
        console.log(this.touch.initiated)
        // debugger
        if (!this.touch.initiated) return
        console.log('switchMove--【有switchstart】')
        console.log(this.touch.initiated)
        const touch = e.touches[0]
        this.touch.deltaX = touch.screenX - this.touch.startX
        const deltaY = touch.screenY - this.touch.startY
        const absX = Math.abs(this.touch.deltaX)
        const absY = Math.abs(deltaY)
        if (absX < absY) return
        !this.touch.move && (this.touch.move = true)
        console.log('switchMove--【this.touch.moved = true】')
        const width = window.innerWidth
        this.touch.percent = absX / width
        console.log('this.touch.deltaX:' + this.touch.deltaX + '\n' + 'this.deltaY:' + deltaY + '\n' + 'this.touch.percent:' + this.touch.percent)
      },
      switchEnd(e) {
        console.log('switchEnd')
        // debugger
        console.log('this.touch.move:' + this.touch.move + '\n' + 'this.touch.percent:' + this.touch.percent)
        if (!this.touch.move || this.touch.percent < 0.5) return
        console.log('switchEnd--【可以切换】')
        let i = this.i
        // debugger
        this.touch.deltaX > 0 ? i++ : i--
        if (i > 3) {
          this.i = 0
        } else if (i < 0) {
          this.i = 3
        } else {
          this.i = i
        }
        console.log('this.i:' + this.i + ' this.nextTheme:' + this.nextTheme)
        this.touch.initiated = false
        this.touch.move = false
        console.log('this.touch.move:' + this.touch.move)
        this.$emit('switch', this.nextTheme)
      },
      switchTheme(theme) {
        console.log('switch')
        this.setClass(this.body, theme)
        // debugger
        this.setTheme(theme)
      },
      setClass(el, classNmae) {
        // debugger
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
