<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs" :rank="true"></music-list>
  </transition>
</template>
<script>
  import MusicList from 'components/musicList/musicList'
  import { mapGetters } from 'vuex'
  import { getTopListDetail } from 'api/rank'
  import { ERR_OK } from 'api/config'
  import { createSongs } from 'common/js/song'

  export default {
    props: {
      id: String
    },
    data() {
      return {
        songs: [],
        rank: true,
        subTopList: {
          topTitle: '',
          picUrl: ''
        }
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
        return (this.topList.id !== undefined && this.topList.id === this.id)
        ? this.topList.topTitle
        : this.subTopList.topTitle
      },
      bgImage() {
        return (this.topList.id !== undefined && this.topList.id === this.id)
        ? this.topList.picUrl
        : this.subTopList.picUrl
      }
    },
    created() {
      this._getTopListDetail()
    },
    methods: {
      _getTopListDetail() {
        let that = this
        getTopListDetail(this.id).then(res => {
          if (res.code === ERR_OK) {
            createSongs(res.songlist, 'rank', that)
            if (this.topList.id === undefined || this.topList.id !== this.id) {
              this.subTopList.topTitle = res.topinfo.ListName
              this.subTopList.picUrl = res.topinfo.pic_v12
            }
          }
        })
      }
    }
  }
</script>
<style scoped lang="stylus">
  .slide-enter-active
    transition: all .2s
  .slide-leave-active
    transition: all .2s
  .slide-enter
    transform: translate3d(100%, 0, 0)
  .slide-leave-to
    transform: translate3d(-100%, 0, 0)
</style>