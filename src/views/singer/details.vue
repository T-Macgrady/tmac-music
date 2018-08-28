<template>
  <transition name="slide">
    <music-list :songs="songs" :urlReady="urlReady" :bg-image="bgImage" :title="title"></music-list>
  </transition>
</template>
<script>
  import { mapGetters } from 'vuex'
  import { getSingerDetail } from 'api/singer'
  import { ERR_OK } from 'api/config'
  import { createSongs } from 'common/js/song'
  import MusicList from 'components/musicList/musicList'
  export default {
    data() {
      return {
        songs: [],
        urlReady: false
      }
    },
    components: {
      MusicList
    },
    computed: {
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'
      ])
    },
    created() {
      this._getDetail()
    },
    methods: {
      _getDetail() {
        // 刷新当前页回退到singer
        if (!this.singer.id) {
          this.$router.push('/singer')
        }
        let that = this
        getSingerDetail(this.singer.id).then(res => {
          if (res.code === ERR_OK) {
            this.songs = createSongs(res.data.list, 'singer', that)
          }
        })
      }
    }
  }
</script>
<style lang="stylus" scoped>
  .slide-enter-active,.slide-leave-active
    transition: all 0.3s
  .slide-enter,.slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>