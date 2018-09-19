<template>
  <transition name="slide">
    <div class="user-center" :class="theme">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches 
          @switch="switchItem" 
          :switches="switches" 
          :currentIndex="currentIndex"
        >
        </switches>
      </div>
      <div ref="playBtn" class="play-btn ignore border" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <scroll ref="favoriteList" class="list-scroll" v-if="currentIndex===0" :data="favoriteList">
          <div class="list-inner" ref="scrollWrapper">
            <song-list :songs="favoriteList" @select="selectSong"></song-list>
          </div>
        </scroll>
        <scroll ref="playList" class="list-scroll" v-if="currentIndex===1" :data="playHistory">
          <div class="list-inner" ref="scrollWrapper">
            <song-list :songs="playHistory" @select="selectSong"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultDesc"></no-result>
      </div>
    </div>
  </transition>
</template>

<script>
  import Switches from 'base/switches/switches'
  import Scroll from 'base/scroll'
  import SongList from 'base/songList/songList'
  import NoResult from 'base/noResult/noResult'
  import Song from 'common/js/song'
  import { mapGetters, mapActions } from 'vuex'
  import { playListMixin } from 'common/js/mixin'

  export default {
    mixins: [playListMixin],
    data() {
      return {
        currentIndex: 0,
        switches: [
          {
            name: '我喜欢的'
          },
          {
            name: '最近听的'
          }
        ]
      }
    },
    computed: {
      noResult() {
        if (this.currentIndex === 0) {
          return !this.favoriteList.length
        } else {
          return !this.playHistory.length
        }
      },
      noResultDesc() {
        if (this.currentIndex === 0) {
          return '暂无收藏歌曲'
        } else {
          return '你还没有听过歌曲'
        }
      },
      ...mapGetters([
        'favoriteList',
        'playHistory'
      ])
    },
    methods: {
      handlePlayList(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.listWrapper.style.bottom = bottom
        this.$refs.favoriteList && this.$refs.favoriteList.refresh()
        this.$refs.playList && this.$refs.playList.refresh()
      },
      switchItem(index) {
        this.currentIndex = index
      },
      selectSong(song) {
        this.insertSong(new Song(song))
        this.$nextTick(() => {
          const style = this.$refs.scrollWrapper.style
          style.transform = style.transform.replace('translateZ(0px)', '')
        })
      },
      back() {
        this.$router.back()
      },
      random() {
        let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
        if (list.length === 0) {
          return
        }
        // 封装list
        list = list.map((song) => {
          return new Song(song)
        })
        this.randomPlay({
          list
        })
        this.$nextTick(() => {
          const style = this.$refs.scrollWrapper.style
          style.transform = style.transform.replace('translateZ(0px)', '')
        })
      },
      ...mapActions([
        'insertSong',
        'randomPlay'
      ])
    },
    components: {
      Switches,
      Scroll,
      SongList,
      NoResult
    }
  }
</script>

<style scoped lang="stylus">
  .slide-enter-active
    transition: all .2s
  .slide-leave-active
    transition: all .1s
  .slide-enter
    transform: translate3d(100%, 0, 0)
  .slide-leave-to
    transform: translate3d(-100%, 0, 0)
  .user-center
    position: absolute
    z-index: 1
    z-index: 2
    top: 0
    bottom: 0
    width: 100%
    .back
      position absolute
      top: 0
      left: 6px
      .icon-back
        display: block
        padding: 15px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      color: $color-text-l
      font-size: 0
      &.ignore.border::before
        border-color: $color-text-l
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
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner    
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>