<template> 
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/musicList/musicList'
  import {getSongList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {mapGetters} from 'vuex'
  import {createSongs} from 'common/js/song'

  export default {
    props: {
      id: String
    },
    computed: {
      title() {
        return (this.disc.dissid !== undefined && this.disc.dissid === this.id)
        ? this.disc.dissname
        : this.subDisc.dissname
      },
      bgImage() {
        return (this.disc.dissid !== undefined && this.disc.dissid === this.id)
        ? this.disc.imgurl
        : this.subDisc.imgurl
      },
      ...mapGetters([
        'disc'
      ])
    },
    data() {
      return {
        songs: [],
        subDisc: {
          dissname: '',
          imgurl: ''
        }
      }
    },
    created() {
      this._getSongList()
    },
    methods: {
      _getSongList() {
        let that = this
        getSongList(this.id).then((res) => {
          if (res.code === ERR_OK) {
            createSongs(res.cdlist[0].songlist, 'recommend', that)
            if (this.disc.dissid === undefined || this.disc.id !== this.id) {
              this.subDisc.dissname = res.cdlist[0].dissname
              this.subDisc.imgurl = res.cdlist[0].logo.replace(/\/\w+\?/, '/600?')
            }
          }
        })
      }
    },
    components: {
      MusicList
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
