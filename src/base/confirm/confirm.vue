<template>
  <transition name="confirm-fade" :class="theme">
    <div class="confirm" :class="theme" v-show="showFlag" @click.stop>
      <div class="confirm-wrapper">
        <div class="confirm-content" :class="theme">
          <p class="text">{{text}}</p>
          <div class="operate">
            <div @click="cancel" class="operate-btn left border-topright" :class="theme">{{cancelBtnText}}</div>
            <div @click="confirm" class="operate-btn right border-top" :class="theme">{{confirmBtnText}}</div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    props: {
      text: {
        type: String,
        default: ''
      },
      confirmBtnText: {
        type: String,
        default: '确定'
      },
      cancelBtnText: {
        type: String,
        default: '取消'
      }
    },
    data() {
      return {
        showFlag: false
      }
    },
    methods: {
      show() {
        this.showFlag = true
      },
      hide() {
        this.showFlag = false
      },
      cancel() {
        this.hide()
        this.$emit('cancel')
      },
      confirm() {
        this.hide()
        this.$emit('confirm')
      }
    }
  }
</script>

<style scoped lang="stylus">
  .confirm
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 998
    extend-styles(background-color, $color-background-d)
    &.confirm-fade-enter-active
      animation: confirm-fadein 0.3s
      .confirm-content
        animation: confirm-zoom 0.3s
    .confirm-wrapper
      position: absolute
      top: 50%
      left: 50%
      transform: translate(-50%, -50%)
      z-index: 999
      .confirm-content
        width: 270px
        border-radius: 13px
        extend-styles(background, $color-highlight-background)
        .text
          padding: 19px 15px
          line-height: 22px
          text-align: center
          font-size: $font-size-large
          color: $color-text-l
        .operate
          display: flex
          align-items: center
          text-align: center
          font-size: $font-size-large
          .operate-btn
            flex: 1
            line-height: 22px
            padding: 10px 0
            color: $color-text-d
            &.left
              &.border-topright
                extend-styles-pseudo(border-color, $color-background-d, before)
                extend-styles-pseudo(border-color, $color-background-d, after)
            &.right
              &.border-top
                extend-styles-pseudo(border-color, $color-background-d, before)
            // &.black
            //   background: $color-background-d-black svg(square param(--color #383838))
            // &.red
            //   background: $color-background-d-red svg(square param(--color #c1684c))
            // &.blue
            //   background: $color-background-d-blue svg(square param(--color #5346a1))
            // &.green
            //   background: $color-background-d-green svg(square param(--color #36a366))
            // // extend-styles(border-top, $color-background-d, 1px, solid)
            // color: $color-text-d
            // &.left
              // extend-styles(border-right, $color-background-d, 1px, solid)

  // @svg square
  //   @rect
  //     fill: var(--color, black)
  //     width: 100%
      // height: 100%

  @keyframes confirm-fadein
    0%
      opacity: 0
    100%
      opacity: 1

  @keyframes confirm-zoom
    0%
      transform: scale(0)
    50%
      transform: scale(1.1)
    100%
      transform: scale(1)
</style>