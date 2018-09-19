/*
* @Author: Lizhhmac
* @Date:   2018-09-12 18:13:52
* @Last Modified by:   Lizhhmac
* @Last Modified time: 2018-09-19 17:26:24
*/
import { oneRun } from 'common/js/util'
export default function testAudioPlay() {
  let audio = document.querySelector('#audio')
  audio.src = '/static/test.m4a'
  try {
    audio.play().catch(e => {
      console.log(e)
      document.addEventListener('click', oneRun(() => {
        audio.play().catch(e => {
          console.log(e)
        })
      }), {once: true})
    })
  // uc浏览器audio.play()返回的不是promise,用try catch绑定click事件
  } catch (e) {
    console.log(e)
    // uc浏览器不支持{once:true}(ˉ▽ˉ；)...,用oneRun代替
    document.addEventListener('click', oneRun(() => {
      audio.play()
    }), {once: true})
  }
}