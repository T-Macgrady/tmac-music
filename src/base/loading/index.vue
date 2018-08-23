<template>
  <div class="loading">
    <img width="64" height="64" src="./loading.gif">
    <p class="desc">{{title}}</p>
  </div>
</template>
<script>
  export default {
    props: {
      title: {
        type: String,
        default: '正在加载中...'
      }
    }
  }
</script>
<style lang="stylus" scoped>
  .loading
    width: 100%
    text-align: center
    .desc
      line-height: 20px
      font-size $font-size-small
      color: $color-text-l
</style>