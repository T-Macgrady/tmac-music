<template>
  <transition name="slide">
    <music-list :songs="songs" :bg-image="bgImage" :title="title"></music-list>
  </transition>
</template>
<script>
  import { getSingerDetail } from 'api/singer'
  import { mapGetters } from 'vuex'
  import { ERR_OK } from 'api/config'
  import { createSongs } from 'common/js/song'
  import Singer from 'common/js/singer'
  import MusicList from 'components/musicList/musicList'

  export default {
    props: {
      id: String
    },
    data() {
      return {
        songs: [],
        subSinger: {
          id: '',
          name: '',
          avatar300: ''
        }
      }
    },
    components: {
      MusicList
    },
    computed: {
      title() {
        return (this.singer.id !== undefined && this.singer.id === this.id)
        ? this.singer.name
        : this.subSinger.name
      },
      bgImage() {
        return (this.singer.id !== undefined && this.singer.id === this.id)
        ? this.singer.avatar300
        : this.subSinger.avatar300
      },
      ...mapGetters(['singer'])
    },
    created() {
      this._getDetail()
    },
    methods: {
      _getDetail() {
        let that = this
        getSingerDetail(this.id).then(res => {
          if (res.code === ERR_OK) {
            createSongs(res.data.list, 'singer', that)
            if (this.singer.id === undefined || this.singer.id !== this.id) {
              this.subSinger = new Singer({
                id: this.id,
                name: res.data.singer_name
              })
            }
          }
        })
      }
    }
  }
</script>
<style lang="stylus" scoped>
  .slide-enter-active
    transition: all .2s
  .slide-leave-active
    transition: all .1s
  .slide-enter
    transform: translate3d(100%, 0, 0)
  .slide-leave-to
    transform: translate3d(-100%, 0, 0)
</style>