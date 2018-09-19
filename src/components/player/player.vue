<template>
  <div class="player" v-show="playList.length > 0">
    <transition name="normal"
      :duration="{ enter: 1600, leave: 400 }"
    >
      <!--播放页面全屏-->
      <div class="normal-player" :class="theme" v-show="fullScreen" ref="normalPlayer">
        <!--背景 模糊-->
        <div class="background ignore">
          <img :src="currentSong.image" class="bgImage" :class="theme" ref="background" alt="" width="100%" height="100%">
        </div>
        <!--顶部-->
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
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
                :fullScreen="fullScreen" 
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
        <!--中间cd部分-->
        <div class="middle" 
          @touchstart="middleTouchStart"
          @touchmove="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <div class="middle-l" :style="opacityStyle">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd"
                :class="cdCls"
                @touchstart="bgTouchStart"
                @touchend="bgTouchEnd"
                @click="togglePlaying"
              >
                <div class="playBtn" v-show="!playing">
                  <i class="icon-play"></i>
                </div>
                <img :src="currentSong.image" alt="" class="image ignore">
              </div>
            </div>
            <div class="text-wrapper">
              <div class="text">
                <div class="playing-lyric">
                  {{playingLyric}}
                </div>
                <p v-html="errorTip" v-if="audioError || manualPlay" class="errorTip">
                </p>
              </div>
            </div>
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
      </div>
    </transition>
    <!--播放页面小屏 底部-->
    <transition name="mini">
      <div class="mini-player ignore" :class="theme" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img alt="" :src="currentSong.image" ref="img" :class="cdCls">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <!--阻止冒泡-->
          <progress-circle :percent="percent" :radius="radius">
            <i @click.stop="togglePlaying" class="icon-mini" ref="iconMini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlayList">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <play-list ref="playList"></play-list>
    <audio ref="audio" 
      id="audio"
      @seeking="seeking" 
      @playing="ready" 
      @error="error"
      @timeupdate="updateTime"
      @ended="ended"
    >
    </audio>
  </div>
</template>
<script>
  import { mapGetters, mapMutations, mapActions } from 'vuex'
  import ProgressBar from 'base/progressBar/progressBar'
  import ProgressCircle from 'base/progressCircle/progressCircle'
  import { debounce } from 'common/js/util'
  import { playMode } from 'common/js/config'
  import Lyric from 'common/js/lyric-parse'
  import Scroll from 'base/scroll'
  import PlayList from 'base/playList/playList'
  import { playerMixin, setBgImgMixin } from 'common/js/mixin'

  export default {
    mixins: [playerMixin, setBgImgMixin],
    data() {
      return {
        songReady: false,
        currentTime: 0,
        currentLyric: null,
        currentLineNum: 0,
        currentShow: 'cd',
        playingLyric: '',
        manualPlay: false,
        time: 0,
        opacity: 1,
        offsetWidth: 0,
        cdAnim: {
          state: 'off',
          mode: 'in'
        },
        audioError: false,
        errorTip: '',
        useDisCls: true,
        bgOpacity: true,
        client: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        touch: {
          initiated: false
        }
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      PlayList
    },
    created() {
      this.radius = 32
    },
    mounted() {
      this.setCdAnimStyle()
      // 切换横竖屏/resize时需reset项目
      window.addEventListener('resize', debounce(() => {
        // clientWidth/Height校准
        this.client = {
          width: window.innerWidth,
          height: window.innerHeight
        }
        // cd&lyric位置校准
        this.middleReset()
        // cd动画位置校准
        this.setCdAnimStyle()
      }, 200))
    },
    computed: {
      // 计算CD&歌词切换touchEnd后的动画样式
      moveStyle() {
        return this.touch.initiated
        ? {
          transitionDuration: `${this.time}ms`,
          transform: `translate3d(${this.offsetWidth}px,0,0)`
        } : {
          transitionDuration: `${this.time}ms`,
          transform: `translate(${this.offsetWidth}px,0)`
        }
      },
      opacityStyle() {
        return this.opacity !== 1 ? {
          transitionDuration: `${this.time}ms`,
          opacity: this.opacity
        } : {}
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
      bgImage () {
        return this.currentSong.image
      },
      offsetN() {
        return Math.floor((437 / 667 * this.client.height) / (32 / 375 * this.client.width) / 2) - 1
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
        audio.src = this.currentSong.url
        try {
          audio.play().catch(e => {
            // uc浏览器等无法自动播放处理
            if (e.code !== 9) {
              this.manualPlay = true
              // 相当于进入暂停状态,等待点击
              this.songReady = true
              this.setPlayingState(false)

              this.errorTip = '该浏览器不支持自动播放,请点击按钮播放 ^-^'
            }
          })
        } catch (e) {
          console.log(e)
        }
        this.getLyric()
      },
      // 歌曲播放/暂停
      playing(newPlaying) {
        if (!this.songReady || this.manualPlay) return
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      },
      fullScreen: function(newVal) {
        if (newVal) {
          setTimeout(() => {
            this.$refs.progressBar.setProgressOffset(this.percent)
          }, 20)
        }
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
        this.manualPlay && (this.manualPlay = false)
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
        // 测试音频返回
        if (this.currentSong.id === undefined) return
        // 不支持自动播放时模拟暂停状态，songReady应为false
        this.manualPlay && (this.songReady = false)

        if (this.songReady) {
          // 保证音词同步
          this.lyricPlay()
        } else {
          this.handleFlag()
          this.endTime = this.currentSong.duration - 10
          // 音量渐强
          this.$nextTick(() => {
            this.changeVolume('start')
            this.$nextTick(() => {
              this.savePlayHistory(this.currentSong)
            })
          })
          setTimeout(() => {
            this.$refs.background.style.opacity = 1
          }, 1000)
        }
      },
      handleFlag() {
        this.songReady = true
        this.errorTip && (this.errorTip = '')
        this.manualPlay && (this.manualPlay = false)
      },
      error(e) {
        if (this.currentSong.id === undefined) return
        this.handleError()
      },
      seeking() {
        if (this.currentSong.id === undefined) return
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
        this.errorTip = '网络异常或播放源受限TnT,请检查网络或切换歌曲'
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
          !this.manualPlay && this[method].apply(null, rest)
        } else {
          this.unwatch = this.$watch(function () {
            return this[data]
          }, function (newValue, oldValue) {
            if (newValue === oldValue) return
            !this.manualPlay && this[method].apply(null, rest)
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
        if (lineNum > this.offsetN) {
          let lineEl = this.$refs.lyricLine[lineNum - this.offsetN]
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
        if (this.currentSong.id === undefined) return
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
        if (!this.songReady || this.manualPlay) {
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
            this.$refs.background.style.opacity = 0.5
          } else {
            index++
          }
          const remainder = index % len
          const currIndex = remainder >= 0 ? remainder : len - 1
          this.setCurrentIndex(currIndex)
          !this.playing && this.togglePlaying()
        }
      },
      ended() {
        if (this.currentSong.id === undefined) return
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
        this.manualPlay && this.$refs.audio.play()
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
        e.preventDefault()
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
      middleReset() {
        if (this.currentShow === 'cd') {
          this.offsetWidth = 0
          this.opacity = 1
        } else {
          this.offsetWidth = -window.innerWidth
          this.opacity = 0
        }
      },

      // vue transition 动画钩子
      // enter(el, done) {
      //   this.cdAnim.mode = 'in'
      //   this.cdAnim.state = 'on'
      //   this.$refs.cdWrapper.addEventListener(animationend, done, {once: true})
      // },
      // afterEnter() {
      //   this.cdAnim.state = 'off'
      // },
      // leave(el, done) {
      //   this.cdAnim.mode = 'out'
      //   this.cdAnim.state = 'on'
      //   this.$refs.cdWrapper.addEventListener(animationend, done, {once: true})
      // },
      // afterLeave() {
      //   this.cdAnim.state = 'off'
      // },

      // 获取动画起始位置
      _getPosAndScale() {
        const clientWidth = this.client.width
        const clientHeight = this.client.height
        // 左下角小图片初始位置
        const targetWidth = 40 / 375 * clientWidth
        const paddingLeft = 20 / 375 * clientWidth
        const paddingBottom = 10 / 375 * clientWidth
        // 中间大图片距离顶部位置
        const paddingTop = 80 / 667 * clientHeight
        // 中间图片宽度
        const width = 300 / 667 * clientWidth
        const scale = targetWidth / width
        const x = -(clientWidth / 2 - paddingLeft)
        const y = clientHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      getKeyframes(start, end, name) {
        this.cdAnim = {...this.cdAnim, ...this._getPosAndScale()}
        const pre = ['-webkit-', '-ms-', '-o-', '-moz-', '']
        const ret = pre.map(item => {
          return `@${item}keyframes ${name}{` +
            `${start}{transform: translate3d(${this.cdAnim.x}px, ${this.cdAnim.y}px, 0) scale(${this.cdAnim.scale});}` +
            `60%{transform: translate3d(0, 0, 0) scale(1.15);}` +
            `${end}{transform: translate3d(0, 0, 0) scale(1);}` +
          `}\n`
        })
        return ret.join('')
      },
      setCdAnimStyle() {
        let innerHTML = this.getKeyframes('0%', '100%', 'cd-animation')
        innerHTML += this.getKeyframes('100%', '0%', 'cd-animation-reverse')
        document.querySelector('#cdanim').innerHTML = innerHTML
      },
      showPlayList() {
        this.$refs.playList.show()
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN'
      }),
      ...mapActions([
        'savePlayHistory',
        'setBgImgUrl'
      ])
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  .player
    position: relative
    z-index: 3
    &.appear-enter-active
      transition: all .4s
    &.appear-enter
      opacity: 0
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      extend-styles(background, $color-background-op1)
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        opacity: .5
        .bgImage
          transition: opacity 1s
        &.ignore
          filter: blur(15px)
      .top
        position: relative
        margin-bottom: calc(20 / 667 * 100vh)
        .back
          position absolute
          top: 0
          left: 6px
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: calc(40 / 667 * 100vh)
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: calc(20 / 667 * 100vh)
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: absolute
        width: 100%
        top: calc(80 / 667 * 100vh)
        bottom: calc(150 / 667 * 100vh)
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 100%
          .cd-wrapper
            margin: 0 auto
            height: calc(300 / 667 * 100vh)
            min-height: 70%
            max-height: 90%
            width: @height
            .cd
              position: relative
              z-index: 3
              width: 100%
              height: 100%
              box-sizing: border-box
              border: calc(44 / 667 * 100vh) solid rgb(22, 22, 22)
              box-shadow: 0px 0px 0px 1.49925vh rgba(188,176,176,.09)
              border-radius: 50%
              .playBtn
                position: absolute
                width: calc(50 / 667 * 100vh)
                height: @width
                left: 50%
                top: 50%
                transform: translate(-50%,-50%)
                z-index: 1
                .icon-play
                  font-size: calc(50 / 667 * 100vh)
                  color: rgba(255, 255, 255, .7)
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
                &.ignore
                  box-shadow 0px 0px 10px 4px rgba(1, 1, 1, 0.89)
          .text-wrapper
            position: relative
            width: 100%
            height: calc(137 / 667 * 100vh)
            .text
              width: 80%
              position: absolute
              top: calc(50% - 25px)
              left: 10%
              // overflow: hidden
              text-align: center
              .playing-lyric
                height: 20px
                line-height: 20px
                font-size: $font-size-medium
                color: $color-text-l
              .errorTip
                height: 20px;
                line-height: 20px;
                margin-top: 10px;
                color: #ec971f;
                font-size: $font-size-medium;
        .middle-r
          position: relative
          z-index: 4
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            position: relative
            width: 80%
            margin: 0 auto
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: calc(25 / 667 * 100vh)
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: calc(8 / 667 * 100vh)
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
          padding: calc(10 / 667 * 100vh) 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: calc(30 / 667 * 100vh)
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
              font-size: calc(30 / 667 * 100vh)
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: calc(40 / 667 * 100vh)
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active
        transition: all .4s ease-out
        .background
          transition: all 1s .5s
        .middle
          .cd-wrapper
            animation: cd-animation .4s
        .top
          transition: all .4s cubic-bezier(0.86, 0.18, 0.82, 1.32) 1.2s
      &.normal-enter
        opacity: .3
        .top
          transform: translate3d(0, -100px, 0)
        .background
          opacity: .2
      &.normal-leave-active
        transition: all .35s ease-in
        .middle
          .cd-wrapper
            animation: cd-animation-reverse .4s
        // .top
        //   transition: all .2s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-leave-to
        opacity: 0
        // .top
        //   transform: translate3d(0, -100px, 0)
    .mini-player
      &.ignore
        display: flex
        align-items: center
        position: fixed
        left: 0
        bottom: 0
        width: 100%
        height: 60px
        extend-styles(background, $color-background-d)
        &.mini-enter-active, &.mini-leave-active
          transition: all 0.4s
        &.mini-enter, &.mini-leave-to
          opacity: 0
        .icon
          flex: 0 0 40px
          width: 40px
          padding: 0 10px 0 20px
          img
            width: 100%
            height: 100%
            border-radius: 50%
            position: relative
            z-index: 2
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
            font-size: 30px
            position: absolute
            left: 1px
            top: 3px

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
  @keyframes bg-opacity
    50%
      opacity: .2
    100%
      opacity: 1

  // @keyframes cd-animation
  //   0%
  //     transform: translate3d(-167.5px, 492.7px, 0) scale(0.237)
  //   60%
  //     transform: translate3d(0, 0, 0) scale(1.25)
  //   100%
  //     transform: translate3d(0, 0, 0) scale(1)
</style>