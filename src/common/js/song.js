import { getLyric } from 'api/lyric'
import getPurlUrl from 'api/getPurlUrl'
import { ERR_OK } from 'api/config'
import { Base64 } from 'js-base64'

export default class Song {
  constructor({ id, mid, singer, name, album, duration, image, url }) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }

  // Promise 封装
  getLyric() {
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then(res => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject('no lyric')
        }
      })
    })
  }
}

export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `${musicData.songmid}`
  })
}

export function createSongs(list, type, vm) {
  let songMidList = []
  let songType = []
  let songs = []
  list.forEach((item) => {
    let musicData = null
    type === 'singer' ? ({musicData} = item) : (musicData = type === 'rank' && item.data || item)
    musicData.songtype = musicData.songtype || 0
    musicData.songid && musicData.albummid && musicData.songmid &&
    songMidList.push(musicData.songmid) && songType.push(musicData.songtype) &&
    songs.push(createSong(musicData))
  })
  getPurlUrl(songMidList, songType).then((res) => {
    let noPurl = []
    let noSourse = []
    let standardUrl = null
    res.forEach((item, i) => {
      if (item.purl) {
        songs[i]['url'] = item.purl
        !standardUrl && (standardUrl = item.purl)
      } else if (songs[i]['url']) {
        noPurl.push(i)
      } else {
        noSourse.push(i)
      }
    })
    noPurl.forEach((item, index) => {
      const songmid = songs[item]['url']
      const reg = /\/(\w+)\.m4a/
      // const reg = new RegExp('\\/\\w{18}\\.m4a')
      songs[item]['url'] = standardUrl.replace(reg, `/C400${songmid}.m4a`)
    })
    noSourse.forEach((item, index) => {
      songs.splice(item - index, 1)
    })
    list.zhida && (songs.zhida = list.zhida)
    vm.songs = songs
  }).catch(e => {
    console.log(e)
  })
}

function filterSinger(singer) {
  let ret = []
  if (!singer) return ''
  singer.forEach((item, index) => {
    ret.push(item.name)
  })
  return ret.join('/')
}