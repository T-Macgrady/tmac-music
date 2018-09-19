<template>
  <div class="music-list" :class="theme">
    <!--歌曲列表-->
    <scroll :data="songs"
      @scroll="scroll"
      :listen-scroll="listenScroll" 
      :probe-type="probeType" 
      class="list" 
      :class="theme"
      ref="list"
    >
      <div class="song-list-wrapper" ref="scrollWrapper">
        <song-list
          :songs="songs"
          :rank="rank"
          @select="selectItem"
        >
        </song-list>
      </div>
      <!--加载loading-->
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
    <div class="bg-image"
      :style="bgStyle"
      ref="bgImage"
      @touchstart="bgTouchStart"
      @touchend="bgTouchEnd"
    >
    </div>
    <!--歌曲信息-->
    <h1 class="title" ref="title" v-html="title"></h1>
    <!--返回上一层-->
    <div class="back" ref="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <div class="play-wrapper">
      <div ref="playBtn" v-show="songs.length" class="play ignore border" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
    </div>
    <transition name="tip">
      <div v-show="showTip" ref="tipIcon" class="tip-icon">
        <i class="icon-tape"></i>
        <p class="note">长按换背景</p>
      </div>
    </transition>
  </div>
</template>

<script>
  import Scroll from 'base/scroll'
  import Loading from 'base/loading'
  import SongList from 'base/songList/songList'
  import {prefixStyle, getAnimationEnd} from 'common/js/dom'
  import {mapActions, mapMutations, mapGetters} from 'vuex'
  import {playListMixin, setBgImgMixin} from 'common/js/mixin'
  const animationend = getAnimationEnd()
  const transform = prefixStyle('transform')

  export default {
    mixins: [playListMixin, setBgImgMixin],
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scrollY: 0,
        showTip: false
      }
    },
    computed: {
      // 加载歌手背景图片
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      },
      ...mapGetters(['tipShow'])
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
      this.one = true
      this.hidePlayBtn = true
    },
    updated() {
      if (!this.one) return
      setTimeout(() => {
        if (this.tipShow) {
          this.one = false
          this.showTip = true
          this.$refs.tipIcon.addEventListener(animationend, () => {
            if (this.showTip) {
              this.setTipShow(false)
              this.showTip = false
            }
          }, {once: true})
          setTimeout(() => {
            if (this.showTip) {
              this.setTipShow(false)
              this.showTip = false
            }
          }, 4500)
        }
      }, 500)
    },
    methods: {
      // 当底部出现mini播放器的时候 重新计算高度
      handlePlayList(playlist) {
        const bottom = playlist.length > 0 ? '16vw' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      scroll(pos) {
        this.scrollY = pos.y
      },
      back() {
        this.$router.push(this.$router.history.current.matched[0].path)
      },
      selectItem(item, index) {
        this.selectPlay({
          list: this.songs,
          index
        })
        this.$nextTick(() => {
          this.clearScrollStyle()
          this.clearTipIcon()
        })
      },
      random() {
        this.randomPlay({
          list: this.songs
        })
        this.$nextTick(() => {
          this.clearScrollStyle()
          this.clearTipIcon()
        })
      },
      clearTipIcon() {
        if (this.showTip) {
          this.setTipShow(false)
          this.$refs.tipIcon.style.display = 'none'
        }
      },
      clearScrollStyle() {
        const style = this.$refs.scrollWrapper.style
        style.transform = style.transform.replace('translateZ(0px)', '')
      },
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ]),
      ...mapMutations({
        setTipShow: 'SET_TIPSHOW'
      })
    },
    watch: {
      scrollY(newVal) {
        const imageHeight = Math.min(window.innerWidth, window.innerHeight) * 0.6
        const reservedHeight = window.innerWidth * 40 / 375
        const percent = Math.abs(newVal / imageHeight)
        if (newVal <= 0) {
          this.showTip && (this.showTip = false)
          let scrollImageHeight = Math.max(reservedHeight, newVal + imageHeight)
          this.$refs.bgImage.style.height = `${scrollImageHeight}px`
          // this.$refs.playBtn.style.opacity = Math.max(0, 1 - percent)
          if (this.hidePlayBtn && newVal < (-imageHeight / 12)) {
            this.$refs.playBtn.style.visibility = 'hidden'
            this.hidePlayBtn = false
          }
        } else {
          const scale = 1 + percent
          this.$refs.bgImage.style[transform] = `scale(${scale})`
          this.$refs.bgImage.style.height = imageHeight
          if (!this.hidePlayBtn) {
            this.$refs.playBtn.style.visibility = 'visible'
            this.hidePlayBtn = true
          }
        }
      }
    },
    components: {
      Scroll,
      Loading,
      SongList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .music-list
    position: fixed
    z-index: 2
    top: 0
    left: 0
    bottom: 0
    right: 0
    .back
      position absolute
      top: 0
      left: 6px
      .icon-back
        display: block
        padding: 9px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0.6 * 100vmin
      transform-origin: top
      transform: scale3d(1,1,1)
      background-size: cover
    .tip-icon
      box-sizing: border-box
      position: absolute
      top: 0.9 * 0.6 * 100vmin
      left: 70%
      text-align: center
      font-weight: 900
      color: #ffcd32
      transform-origin: center
      .icon-tape
        font-size: 40px
      .note
        margin-top: 4px
    .play-wrapper
      position: absolute
      top: calc(0.6 * 100vmin - 50px)
      z-index: 1
      width: 100%
      .play
        box-sizing: border-box
        width: 135px
        padding: 7px 0
        margin: 0 auto
        text-align: center
        color: $color-theme
        font-size: 0
        &.ignore.border::before
          border-color: $color-theme
          border-radius: 100px
        .icon-play
          display: inline-block
          vertical-align: middle
          margin-right: 6px
          font-size: $font-size-medium-x
        .text
          display: inline-block
          vertical-align: middle
          font-size: $font-size-small
    .list
      position: absolute
      top: 0.6 * 100vmin
      bottom: 0
      width: 100%
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>