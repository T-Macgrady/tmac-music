/*
* @Author: Lizhhmac
* @Date:   2018-08-19 13:49:50
* @Last Modified by:   Lizhhmac
* @Last Modified time: 2018-08-21 17:11:21
*/
import axios from 'axios'

export default function getPurlUrl(songmid, songtype) {
  const url = '/api/getPurlUrl'
  return axios.post(url, {
    comm: {
      format: 'json',
      g_tk: 5381,
      inCharset: 'utf-8',
      needNewCode: 1,
      notice: 0,
      outCharset: 'utf-8',
      platform: 'h5',
      uin: 0
    },
    url_mid: {
      method: 'CgiGetVkey',
      module: 'vkey.GetVkeyServer',
      param: {
        guid: '5913099792',
        loginflag: 0,
        platform: '23',
        uin: '0',
        songmid,
        songtype
      }
    }
  }).then(res => {
    return res.data.code === 0
    ? Promise.resolve(res.data.url_mid.data.midurlinfo)
    : Promise.reject('netWork error')
  })
}

// function getSongType(songmid) {
//   const length = songmid.length
//   return Array.apply(null, {length}).map(item => 0)
// }