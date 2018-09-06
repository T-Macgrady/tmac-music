<template>
  <div class="progress-circle ignore">
    <svg viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" 
        :stroke-dasharray="dashArray"
        :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script>
  export default {
    props: {
      radius: {
        type: Number,
        default: 100
      },
      percent: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        dashArray: Math.PI * 100
      }
    },
    computed: {
      dashOffset() {
        return (1 - this.percent) * this.dashArray
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .progress-circle
    svg
      width: 30px
      height: 30px;
    &.ignore
      position: relative
      circle
        stroke-width: 7px
        transform-origin: center
        &.progress-background
          transform: scale(.94)
          stroke: $color-theme-d
        &.progress-bar
          transform: scale(.94) rotate(-90deg)
          rotate(-90deg)
          stroke: $color-theme
</style>