<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" :style="progStyle" ref="progress"></div>
      <div class="progress-btn-wrapper"
        :style="btnStyle"
        @touchstart.prevent="progressTouchStart"
        @touchmove.prevent="progressTouchMove"
        @touchend="progressTouchEnd"
      >
        <div class="progress-btn" ref="progressBtn"></div>
      </div>
    </div>
  </div>
</template>
<script>
  import { throttle } from 'common/js/util'
  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      },
      audioError: {
        type: Boolean,
        default: false
      },
      songReady: {
        type: Boolean,
        default: false
      },
      fullScreen: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        offsetWidth: 0,
        barWidth: 0
      }
    },
    computed: {
      progressScale() {
        return this.barWidth
        ? this.offsetWidth / this.barWidth : 0
      },
      // 进度条&按钮动画样式
      progStyle() {
        return {
          // width: `${this.offsetWidth}px`
          transform: `scaleX(${this.progressScale})`
        }
      },
      btnStyle() {
        return {
          transform: `translate3d(${this.offsetWidth}px, 0, 0)`
        }
      }
    },
    watch: {
      // 监测父组件随时间变化的percent，设置进度动画样式
      percent(newVal) {
        this.setProgressOffset(newVal)
        // 除去BTN宽度后的进度条长度
        if (this.barWidth) return
        this.getBarWidth()
      }
    },
    created() {
      this.touch = {}
    },
    // 监听横竖屏，获取度条长度
    mounted() {
      this.debounceGetBarWidth = throttle(() => {
        this.getBarWidth()
      }, 50)
      window.addEventListener('resize', this.debounceGetBarWidth)
    },
    methods: {
      getBarWidth() {
        if (!this.fullScreen) return
        this.barWidth = this.$refs.progressBar.clientWidth - this.$refs.progressBtn.offsetWidth
      },
      // 进度条拖动效果
      progressTouchStart(e) {
        if (this.audioError || !this.songReady) return
        this.touch.initiated = true
        this.touch.startX = e.touches[0].pageX
        // 当前移动的位置
        this.touch.left = this.$refs.progress.clientWidth * this.progressScale
      },
      progressTouchMove(e) {
        if (!this.touch.initiated) return
        const deltaX = e.touches[0].pageX - this.touch.startX
        // 设置offsetWidth，最小为0，最大为barWidth
        this.offsetWidth = Math.min(Math.max(0, this.touch.left + deltaX), this.barWidth)
      },
      progressTouchEnd() {
        this.touch.initiated = false
        this._triggerPercent()
      },

      // 向player传递变化的percent 触发percentChange事件
      _triggerPercent() {
        const percent = this.offsetWidth / this.barWidth
        this.$emit('percentChange', percent)
      },

      // 进度条点击效果
      progressClick(e) {
        if (this.audioError || !this.songReady) return
        const rect = this.$refs.progressBar.getBoundingClientRect()
        this.offsetWidth = e.clientX - rect.left
        this._triggerPercent()
      },
      setProgressOffset: function(percent) {
        if (percent >= 0 && !this.touch.initiated) {
          this.offsetWidth = percent * this.barWidth
        }
      }
    }
  }
</script>

<style scoped lang="stylus">
  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        width: 100%
        transform-origin: left
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>