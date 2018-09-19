<template>
  <scroll class="list-view" 
    :data="data" 
    ref="listView"
    :listenScroll="listenScroll"
    :probeType="probeType"
    @scroll="scroll"
  >
    <ul ref="scrollWrapper">
      <li v-for="group in data" class="list-group" :key="group.key" ref="listGroup">
        <h2 class="list-group-title" :class="theme"> {{group.title}} </h2>
        <ul>
          <li @click="selectItem(item)" class="list-group-item" v-for="item in group.items" :key="item.key">
            <img v-lazy="item.avatar150" alt="" class="avatar">
            <span class="name"> {{item.name}} </span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="loading-container" v-show="!data.length">
      <loading></loading>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title" :class="theme"> {{fixedTitle}} </h1>
    </div>
    
    <!--右侧快速定位列表-->
    <div class="list-shortcut" :class="theme" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li class="item" v-for="(item, index) in shortcutList" 
          :data-index="index" 
          :key="item.key"
          :class="{'current' : currentIndex === index}"
        >
          {{item}}
        </li>
      </ul>
    </div>
  </scroll>
</template>
<script>
  import Scroll from 'base/scroll'
  import Loading from 'base/loading'
  import { debounce } from 'common/js/util'
  import { getData } from 'common/js/dom'

  export default {
    created() {
      this.touch = {}
      this.listenScroll = true
      this.listHeight = []
      this.probeType = 3
    },
    data() {
      return {
        scrollY: -1,
        currentIndex: 0,
        diff: -1,
        client: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    computed: {
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      fixedTitle() {
        if (this.scrollY > 0) return
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      },
      anchorHeight() {
        return 18 / 667 * this.client.height
      },
      titleHeight() {
        return 30 / 375 * this.client.width
      }
    },
    mounted() {
      window.addEventListener('resize', debounce(() => {
        // clientWidth/Height校准
        this.client = {
          width: window.innerWidth,
          height: window.innerHeight
        }
        this.calcHeight()
      }, 200))
    },
    components: {
      Scroll,
      Loading
    },
    watch: {
      data() {
        setTimeout(() => {
          this.calcHeight()
        }, 20)
      },

      // 监听scrollY 获取currentIndex
      scrollY(newY) {
        const listHeight = this.listHeight
        // top
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // middle
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          // 向上滚动srcollY的值为负 所以加上负号
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            this.diff = height2 + newY
            return
          }
        }
        // bottom

        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < this.titleHeight) ? newVal - this.titleHeight : 0
        if (this.fixedTop === fixedTop) return
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
      }
    },
    methods: {
      refresh() {
        this.$refs.listView.refresh()
      },
      onShortcutTouchStart(e) {
        // 获取当前触摸的index
        let anchorIndex = getData(e.target, 'index')
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY

        // 向下取整
        let delta = (this.touch.y2 - this.touch.y1) / this.anchorHeight | 0
        // 获取移动的距离
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta
        this._scrollTo(anchorIndex)
      },
      // 监听scroll组件派发的scroll事件 获取滚动时的pos值
      scroll(pos) {
        this.scrollY = pos.y
      },
      _scrollTo(index) {
        if (!index && index !== 0) {
          return
        }

        // 判断index上下限
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        this.scrollY = -this.listHeight[index]
        this.$refs.listView.scrollToElement(this.$refs.listGroup[index], 0)
      },
      // 计算每一个singer list的height
      calcHeight() {
        const list = this.$refs.listGroup
        const length = list.length
        let height = 0
        let listHeight = []
        listHeight.push(height)
        for (let i = 0; i < length; i++) {
          let item = list[i]
          height += item.clientHeight
          listHeight.push(height)
        }
        this.listHeight = listHeight
      },
      selectItem(item) {
        const style = this.$refs.scrollWrapper.style
        style.transform = style.transform.replace('translateZ(0px)', '')
        // this.$refs.scrollWrapper.style.transform = `translate(0, 0)`
        this.$emit('select', item)
      }
    }
  }
</script>
<style lang="stylus">
  .list-view
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        extend-styles(background, $color-highlight-background)
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      // z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: calc(20 / 667 * 100vh) 0
      border-radius: 10px
      text-align: center
      extend-styles(background, $color-background-d)
      font-family: Helvetica
      .item
        padding: calc(3 / 667 * 100vh)
        line-height: 1
        color: $color-text-l
        font-size: calc(12 / 667 * 100vh)
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        extend-styles(background, $color-highlight-background)
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
