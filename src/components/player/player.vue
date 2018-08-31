<template>
  <transition name="appear">
    <div class="player" v-show="playList.length > 0">
      <transition name="normal"
        @enter="enter"
        @after-enter="afterEnter"
        @leave="leave"
        @after-leave="afterLeave"
      >
        <!--播放页面全屏-->
        <div class="normal-player" :class="theme" v-show="fullScreen" ref="normalPlayer">
          <!--背景 模糊-->
          <div class="background">
            <img :src="currentSong.image" alt="" width="100%" height="100%">
          </div>
          <!--顶部-->
          <div class="top">
            <div class="back" @click="back">
              <i class="icon-back"></i>
            </div>
            <h1 class="title" v-html="currentSong.name"></h1>
            <h2 class="subtitle" v-html="currentSong.singer"></h2>
          </div>
          <!--中间cd部分-->
          <div class="middle" 
            @touchstart.prevent="middleTouchStart"
            @touchmove.prevent="middleTouchMove"
            @touchend="middleTouchEnd"
          >
            <div class="middle-l" :style="opacityStyle">
              <div class="cd-wrapper" :style="animateStyle" ref="cdWrapper">
                <div class="cd" :class="cdCls">
                  <img :src="currentSong.image" alt="" class="image">
                </div>
              </div>
              <div class="playing-lyric-wrapper">
                <div class="playing-lyric">
                  {{playingLyric}}
                </div>
              </div>
              <p v-html="errorTip" v-if="audioError" class="errorTip"></p>
            </div>
            <!--歌词滚动-->
            <scroll class="middle-r" ref="lyriclist" :style="moveStyle" :data="currentLyric && currentLyric.lines">
              <div class="lyric-wrapper">
                <div v-if="currentLyric">
                  <p ref="lyricLine" 
                    class="text" 
                    v-for="(line, index) in currentLyric.lines" 
                    :key="line.key"
                    :class="{'current': currentLineNum === index}"
                  >
                    {{line.txt}}
                  </p>
                </div>
              </div>
            </scroll>
          </div>
          <!--底部按钮控制部分-->
          <div class="bottom">
            <div class="dot-wrapper">
              <span class="dot" :class="{'active' : currentShow === 'cd'}"></span>
              <span class="dot" :class="{'active' : currentShow === 'lyric'}"></span>
            </div>
            <div class="progress-wrapper">
              <span class="time time-l">
                {{format(currentTime)}}
              </span>
              <!--播放进度条-->
              <div class="progress-bar-wrapper">
                <progress-bar :percent="percent" 
                  ref="progressBar" 
                  :audioError="audioError" 
                  :songReady="songReady" 
                  @percentChange="onProgressBarChange">
                </progress-bar>
              </div>
              <span class="time time-r">
                {{format(currentSong.duration)}}
              </span>
            </div>
            <div class="operators">
              <div class="icon i-left" @click="changeMode">
                <i :class="iconMode"></i>
              </div>
              <div class="icon i-left" :class="disableCls">
                <i class="icon-prev" @click="switchSong"></i>
              </div>
              <div class="icon i-center" :class="disableCenCls">
                <i :class="playIcon" @click="togglePlaying"></i>
              </div>
              <div class="icon i-right" :class="disableCls">
                <i class="icon-next" @click="switchSong"></i>
              </div>
              <div class="icon i-right">
                <i 
                  @click="toggleFavorite(currentSong)" 
                  class="icon" 
                  :class="getFavoriteIcon(currentSong)"
                >
                </i>
              </div>
            </div>
          </div>
        </div>
      </transition>
      <!--播放页面小屏 底部-->
      <transition name="mini">
        <div class="mini-player" :class="theme" v-show="!fullScreen" @click="open">
          <div class="icon">
            <img alt="" :src="currentSong.image" width="40" height="40" :class="cdCls">
          </div>
          <div class="text">
            <h2 class="name" v-html="currentSong.name"></h2>
            <p class="desc" v-html="currentSong.singer"></p>
          </div>
          <div class="control">
            <!--阻止冒泡-->
            <progress-circle :radius="radius" :percent="percent">
              <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
            </progress-circle>
          </div>
          <div class="control" @click.stop="showPlayList">
            <i class="icon-playlist"></i>
          </div>
        </div>
      </transition>
      <play-list ref="playList"></play-list>
      <audio ref="audio" 
        @seeking="seeking" 
        @playing="ready" 
        @error="error"
        @timeupdate="updateTime"
        @ended="ended"
      >
      </audio>
    </div>
  </transition>
</template>
<script>
  import { mapGetters, mapMutations, mapActions } from 'vuex'
  import ProgressBar from 'base/progressBar/progressBar'
  import ProgressCircle from 'base/progressCircle/progressCircle'
  import { getAnimationEnd } from 'common/js/dom.js'
  import { playMode } from 'common/js/config'
  import Lyric from 'common/js/lyric-parse'
  import Scroll from 'base/scroll'
  import PlayList from 'base/playList/playList'
  import { playerMixin } from 'common/js/mixin'

  const animationend = getAnimationEnd()
  export default {
    mixins: [playerMixin],
    data() {
      return {
        songReady: false,
        currentTime: 0,
        radius: 32,
        currentLyric: null,
        currentLineNum: 0,
        currentShow: 'cd',
        playingLyric: '',
        time: 0,
        opacity: 1,
        offsetWidth: null,
        cdAnim: {
          state: 'off',
          mode: 'in'
        },
        audioError: false,
        errorTip: '',
        useDisCls: true
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      PlayList
    },
    created() {
      this.touch = {}
      this.cdAnimStyle = document.querySelector('#cdanim')
      this.cdAnimStyle.innerHTML = this.getKeyframes()
    },
    computed: {
      // 计算CD&歌词切换touchEnd后的动画样式
      moveStyle() {
        return {
          transitionDuration: `${this.time}ms`,
          transform: `translate3d(${this.offsetWidth}px,0,0)`
        }
      },
      opacityStyle() {
        return this.opacity !== 1 ? {
          transitionDuration: `${this.time}ms`,
          opacity: this.opacity
        } : {}
      },

      // 切换player全屏动画样式
      animateStyle() {
        return this.cdAnim.state === 'on'
          ? (this.cdAnim.mode === 'in'
            ? {
              animation: `cd-animation 0.4s`
            }
            : {
              animation: `cd-animation 0.4s reverse`
            })
          : {}
      },

      // 跟踪播放状态切换图标样式
      cdCls() {
        return this.playing ? 'play' : 'pause'
      },
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      disableCls() {
        return this.useDisCls ? (this.songReady ? '' : 'disable') : ''
      },
      disableCenCls() {
        return (this.songReady && !this.audioError) ? '' : 'disable'
      },
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      iconMode() {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      },
      ...mapGetters([
        'fullScreen',
        'playing',
        'currentIndex'
      ])
    },
    watch: {
      // 切换歌曲时处理
      currentSong(newSong, oldSong) {
        // 列表没有歌曲/重复时 return
        if (!newSong.id || !newSong.url || newSong.id === oldSong.id) return
        // 重置player相关标记
        this.resetFlag(newSong)
        // 获取并播放歌曲&歌词
        const audio = this.$refs.audio
        audio.src = newSong.url
        audio.play()
        this.getLyric()
      },
      // 歌曲播放/暂停
      playing(newPlaying) {
        if (!this.songReady) return
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      },
      fullScreen: function(newVal) {
        newVal && setTimeout(() => {
          this.$refs.lyriclist.refresh()
          this.$refs.progressBar.setProgressOffset(this.percent)
        }, 20)
      }
    },
    methods: {
      resetFlag(newSong) {
        // 重置audioError/errorTip
        if (this.audioError) {
          this.audioError = false
          this.errorTip = ''
        }
        this.songReady && (this.songReady = false)
        // 清除音量变化的interval/尾部标记
        this.clearIntl()
        this.musicEnd && (this.musicEnd = false)
        // 防止切歌时进度条闪动
        this.currentTime = 0
        // 防止歌词切换跳动
        this.currentLyric && this.currentLyric.stop()

        this.watch && this.unwatch && this.unwatch()
      },

      // 已加载足够数据可开始播放，切换至play状态
      ready() {
        if (this.songReady) {
          this.lyricPlay()
        } else {
          this.handleFlag()
          this.savePlayHistory(this.currentSong)
          this.endTime = this.currentSong.duration - 10
          this.$nextTick(() => {
            this.changeVolume('start')
          })
        }
      },
      handleFlag() {
        this.songReady = true
        this.errorTip && (this.errorTip = '')
        // 防止异常情况audio未切至播放状态
        setTimeout(() => {
          this.playing && this.$refs.audio.paused && this.$refs.audio.play()
          !this.songReady && (this.songReady = true)
        }, 3000)
      },
      error(e) {
        this.handleError()
      },
      seeking() {
        this.currentLyric && this.currentLyric.stop()
      },
      handleError(e) {
        this.songReady = true
        this.audioError = true
        this.clearLyric()
        if (this.currentShow === 'lyric') {
          this.time = 300
          this.opacity = 1
          this.offsetWidth = 0
          this.currentShow === 'lyric'
        }
        // 弹出error-tip
        this.errorTip = '网络异常或播放源受限TnT,请切换歌曲'
      },
      changeVolume(type, delta = 0.2, floor = 0, limit = 1, time = 1) {
        const duration = time * 1000
        this.startEnd = time * Math.floor((limit - 0.2) / delta)
        let audio = this.$refs.audio
        this.clearIntl()
        if (type === 'start') {
          audio.volume = 0.2
        } else {
          delta = -delta
        }
        this.interval = setInterval(() => {
          let vol = audio.volume + delta
          if (vol < floor || vol > limit) {
            this.clearIntl()
            return
          }
          audio.volume = vol
        }, duration)
      },
      clearIntl() {
        if (this.interval) {
          clearInterval(this.interval)
          this.interval = null
        }
      },

      // 解析歌词 使用lyric-parser库
      getLyric() {
        if (this.audioError) return
        this.currentSong.getLyric().then(lyric => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          this.setWatcher('songReady', 'lyricPlay')
        }).catch(() => {
          this.clearLyric()
        })
      },
      lyricPlay() {
        const currentTime = this.currentTime * 1000
        this.currentLyric && this.currentLyric.play(currentTime)
      },
      setWatcher(data, method, ...rest) {
        if (this[data]) {
          this[method].apply(null, rest)
        } else {
          this.unwatch = this.$watch(function () {
            return this[data]
          }, function (newValue, oldValue) {
            if (newValue === oldValue) return
            this[method].apply(null, rest)
            this.unwatch()
          })
        }
      },
      handleLyric({lineNum, txt, lyric}) {
        if (lyric !== this.currentLyric) {
          lyric.destroy()
          return
        }
        this.currentLineNum = lineNum
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyriclist.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyriclist.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      clearLyric() {
        if (this.currentLyric) {
          this.currentLyric.stop()
          this.currentLyric = null
          this.currentLineNum = 0
          this.playingLyric = ''
        }
      },

      // 监听progressBar派发的事件
      onProgressBarChange(percent) {
        if (this.musicEnd) {
          this.$refs.audio.volume = 1
          this.musicEnd = false
          this.clearIntl()
        }
        const currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime
        !this.playing && this.togglePlaying()
        // 点击或滑动 歌曲进度条 歌词滚动到对应的位置
        this.currentLyric && this.currentLyric.seek(currentTime * 1000)
      },
      updateTime(e) {
        this.currentTime = e.target.currentTime
        if (this.currentTime <= this.endTime || !this.musicEnd) return
        this.changeVolume('end', 0.2, 0.1)
        this.musicEnd = true
      },

      // 格式化时间
      format(interval) {
        interval = interval | 0
        const minute = interval / 60 | 0
        const second = this._pad(interval % 60)
        return `${minute}:${second}`
      },
      _pad(num, n = 2) {
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },

      // 歌曲前进后退
      switchSong(e) {
        if (!this.songReady) {
          return
        }
        if (this.playList.length === 1) {
          this.loop()
          return
        } else {
          let index = this.currentIndex
          let len = this.playList.length
          if (e) {
            e.currentTarget.className === 'icon-prev' ? index-- : index++
          } else {
            index++
          }
          // if (index < 0) {
          //   index = len - 1
          // } else if (index > len - 1) {
          //   index = 0
          // }
          const remainder = index % len
          const currIndex = remainder >= 0 ? remainder : len - 1
          console.log(currIndex)
          this.setCurrentIndex(currIndex)
          !this.playing && this.togglePlaying()
        }
      },
      ended() {
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.switchSong(false)
        }
      },
      loop() {
        const audio = this.$refs.audio
        audio.volume = 1
        audio.currentTime = 0
        audio.play()
        // 循环播放 歌词回到开始的时候
        this.currentLyric && this.currentLyric.seek(0)
      },
      back() {
        this.setFullScreen(false)
      },
      open() {
        this.setFullScreen(true)
      },

      // 设置playing状态 watch playing的变化 实现播放暂停
      togglePlaying() {
        if (!this.songReady || this.audioError) {
          return
        }
        this.setPlayingState(!this.playing)
        // 歌词随着歌曲播放暂停而滚动或暂停滚动
        this.currentLyric && this.currentLyric.togglePlay()
      },

      // 歌词&CD滑动切换
      middleTouchStart(e) {
        this.touch.initiated = true
        // 用来判断是否是一次移动
        this.touch.moved = false
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove(e) {
        // 没有touchstart 返回
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY
        // y轴距离大于x轴距离 => 纵向滚动 => 返回
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        !this.touch.moved && (this.touch.moved = true)
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        this.time = 0
        // 滚动的距离  最大是0
        this.offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(this.offsetWidth / window.innerWidth)
        this.opacity = 1 - this.touch.percent
      },
      middleTouchEnd(e) {
        if (!this.touch.moved) {
          return
        }
        this.time = 300
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            this.offsetWidth = -window.innerWidth
            this.opacity = 0
            this.currentShow = 'lyric'
          } else {
            this.offsetWidth = 0
            this.opacity = 1
          }
        } else {
          if (this.touch.percent < 0.9) {
            this.offsetWidth = 0
            this.currentShow = 'cd'
            this.opacity = 1
          } else {
            this.offsetWidth = -window.innerWidth
            this.opacity = 0
          }
        }
        this.touch.initiated = false
      },

      // vue transition 动画钩子
      enter(el, done) {
        this.cdAnim.mode = 'in'
        this.cdAnim.state = 'on'
        this.$refs.cdWrapper.addEventListener(animationend, done)
      },
      afterEnter() {
        this.cdAnim.state = 'off'
      },
      leave(el, done) {
        this.cdAnim.mode = 'out'
        this.cdAnim.state = 'on'
        this.$refs.cdWrapper.addEventListener(animationend, done)
      },
      afterLeave() {
        this.cdAnim.state = 'off'
      },

      // 获取动画起始位置
      _getPosAndScale() {
        // 左下角小图片初始位置
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        // 中间大图片距离顶部位置
        const paddingTop = 80
        // 中间图片宽度
        const width = window.innerWidth * 0.8
        // 缩放尺度
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      getKeyframes() {
        this.cdAnim = {...this.cdAnim, ...this._getPosAndScale()}
        const pre = ['-webkit-', '-ms-', '-o-', '-moz-', '-khtml-', '']
        const ret = pre.map(item => {
          return `@${item}keyframes cd-animation{
            0%{
              transform: translate3d(${this.cdAnim.x}px, ${this.cdAnim.y}px, 0) scale(${this.cdAnim.scale});
            }
            60%{
              transform: translate3d(0, 0, 0) scale(1.25);
            }
            100%{
              transform: translate3d(0, 0, 0) scale(1);
            }
          }\n`
        })
        return ret.join('')
      },
      showPlayList() {
        this.$refs.playList.show()
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN'
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  .player
    &.appear-enter-active
      transition: all 0.4s
    &.appear-enter
      opacity: 0
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      extend-styles(background, $color-background)
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
          .errorTip
            height: 20px;
            line-height: 20px;
            margin-top: 9px;
            text-align: center;
            color: #ec971f;
            font-size: 14px;
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s ease-in-out
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0.3
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      extend-styles(background, $color-highlight-background)
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>