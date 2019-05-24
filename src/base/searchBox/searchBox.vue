<template>
  <div class="search-box" :class="theme">
    <i class="icon-search"></i>
    <input ref="query" v-model="query" class="box" :class="theme" :placeholder="placeholder"/>
    <i @click="clear" v-show="query" class="icon-dismiss" :class="theme"></i>
  </div>
</template>

<script>
  import { debounce } from 'common/js/util'

  export default {
    props: {
      placeholder: {
        type: String,
        default: '搜索歌曲、歌手'
      },
      newQuery: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        query: ''
      }
    },
    watch: {
      newQuery(newQuery) {
        if (newQuery) {
          this.query = newQuery
        }
      }
    },
    methods: {
      clear() {
        this.query = ''
      },
      setQuery(query) {
        this.query = query
      },
      blur() {
        this.$refs.query.blur()
      }
    },
    created() {
      this.$watch('query', debounce((newQuery) => {
        this.$emit('query', newQuery)
      }, 200))
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    extend-styles(background, $color-highlight-background)
    border-radius: 6px
    .icon-search
      font-size: 24px
      extend-styles(color, $color-background)
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      // extend-styles(background, $color-highlight-background)
      background: transparent
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      extend-styles(color, $color-background)
</style>