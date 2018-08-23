var express = require('express')
var config = require('./config/index')
var axios = require('axios')
var bodyParser = require('body-parser')
// var path = require('path')

var port = process.env.PORT || config.build.port

var app = express()

var apiRoutes = express.Router()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

apiRoutes.get('/getDiscList', function(req, res) {
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
})

app.get('/soso/fcgi-bin/search_for_qq_cp', function(req, res) {
  var url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    }
  }).then((response) => {
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
})

apiRoutes.get('/lyric', function(req, res) {
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    var ret = response.data
    if (typeof ret === 'string') {
      var reg = /^\w+\(({[^\(\)]+})\)$/
      var matches = response.data.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch((e) => {
    console.log(e)
  })
})

apiRoutes.get('/getCdInfo', function (req, res) {
  var url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
  console.log('getCdInfo')
  axios.get(url, {
      headers: {
          referer: 'https://c.y.qq.com/',
          host: 'c.y.qq.com'
      },
      params: req.query
  }).then((response) => {
      var ret = response.data
      // 返回的是JSONP格式的话
      if (typeof ret === 'string') {
          var reg = /^\w+\(({.+})\)$/
          var matches = ret.match(reg)
          if (matches) {
              ret = JSON.parse(matches[1])
          }
      }
      res.json(ret)
  }).catch((e)=> {
      console.log(e)
  })
})

apiRoutes.post('/getPurlUrl', function (req, res) {
  var url = 'http://ustbhuangyi.com/music/api/getPurlUrl'
  var data = req.body
  console.log(data)
  axios({
    url,
    method: 'post',
    headers: {
        referer: 'http://ustbhuangyi.com',
        host: 'ustbhuangyi.com'
    },
    data,
  }).then((response) => {
    var ret = response.data
    console.log(ret)
    res.json(ret)
  }).catch((e)=> {
      console.log(e)
  })
})

app.use('/api', apiRoutes)

// var staticPath = path.posix.join(config.build.assetsPublicPath, config.build.assetsSubDirectory)
app.use(express.static('./dist'))

// app.use(express.static('./dist'))

module.exports = app.listen(port, function(err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:' + port + '\n')
})