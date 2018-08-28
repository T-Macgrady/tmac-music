<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs" :urlReady="urlReady" :rank="true"></music-list>
  </transition>
</template>
<script>
  import MusicList from 'components/musicList/musicList'
  import { mapGetters } from 'vuex'
  import { getTopListDetail } from 'api/rank'
  import { ERR_OK } from 'api/config'
  import { createSongs } from 'common/js/song'

  export default {
    data() {
      return {
        songs: [],
        urlReady: false,
        rank: true
      }
    },
    components: {
      MusicList
    },
    computed: {
      ...mapGetters([
        'topList'
      ]),
      title() {
        return this.topList.topTitle
      },
      bgImage() {
        if (this.songs.length) {
          return this.songs[0].image
        }
        return ''
      }
    },
    created() {
      this._getTopListDetail()
    },
    methods: {
      _getTopListDetail() {
        if (!this.topList.id) {
          this.$router.push('/rank')
          return
        }
        let that = this
        getTopListDetail(this.topList.id).then(res => {
          if (res.code === ERR_OK) {
            this.songs = createSongs(res.songlist, 'rank', that)
          }
        })
      }
    }
  }
</script>
<style scoped lang="stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>