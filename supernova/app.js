'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const app = express()
const request = require('sync-request')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(awsServerlessExpressMiddleware.eventContext())


/**
*  Sample API
*/
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
})

app.get('/users', (req, res) => {
    res.json(users)
})

app.get('/users/:userId', (req, res) => {
    const user = getUser(req.params.userId)

    if (!user) return res.status(404).json({})

    return res.json(user)
})

app.post('/users', (req, res) => {
    const user = {
        id: ++userIdCounter,
        name: req.body.name
    }
    users.push(user)
    res.status(201).json(user)
})

app.put('/users/:userId', (req, res) => {
    const user = getUser(req.params.userId)

    if (!user) return res.status(404).json({})

    user.name = req.body.name
    res.json(user)
})

app.delete('/users/:userId', (req, res) => {
    const userIndex = getUserIndex(req.params.userId)

    if(userIndex === -1) return res.status(404).json({})

    users.splice(userIndex, 1)
    res.json(users)
})

const getUser = (userId) => users.find(u => u.id === parseInt(userId))
const getUserIndex = (userId) => users.findIndex(u => u.id === parseInt(userId))

// Ephemeral in-memory data store
const users = [{
    id: 1,
    name: 'Joe'
}, {
    id: 2,
    name: 'Jane'
}]
let userIdCounter = users.length
/**
*  Sample API
*/

// ユーザ一覧取得
app.get('/getUsers', function(req, res, next){
  var url = 'http://54.64.118.109/getUsers'
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// ピッチ一覧取得
app.get('/getPitchs', function(req, res, next){
  var url = 'http://54.64.118.109/getPitchs'
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// ユーザの位置情報を更新
app.get('/updateUserLocation', function(req, res, next){
  var url = 'http://54.64.118.109/updateUserLocation'+'?lat='+req.param('lat')+'&lng='+req.param('lng')+'&userid='+req.param('userid')
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// 自分の近くで自分の母国語に対するリクエストが無いか確認
app.get('/searchRequest', function(req, res, next){
  var url = 'http://54.64.118.109/searchRequest'+'?lat='+req.param('lat')+'&lng='+req.param('lng')+'&lang='+req.param('lang')+'&userid='+req.param('userid')
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// ユーザ参照
app.get('/getUser', function(req, res, next){
  var url = 'http://54.64.118.109/getUser'+'?userid='+req.param('userid')
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// 教師リクエスト状況取得
app.get('/getRequestStatus', function(req, res, next){
  var url = 'http://54.64.118.109/getRequestStatus'+'?_id='+req.param('_id')
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// 教師リクエスト受諾
app.get('/responseTeacher', function(req, res, next){
  var url = 'http://54.64.118.109/responseTeacher'+'?_id='+req.param('_id')+'&userid='+req.param('userid')
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// 到着までの時間を更新
app.get('/updateArrive', function(req, res, next){
  var url = 'http://54.64.118.109/responseTeacher'+'?_id='+req.param('_id')+'&arrive='+req.param('arrive')
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// ピッチング成立〜決済〜ルート案内開始
app.get('/createPitching', function(req, res, next){
});

// ピッチングキャンセル
app.get('/cancelPitching', function(req, res, next){
  var url = 'http://54.64.118.109/cancelPitching'+'?_id='+req.param('_id')
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// ピッチング開始
app.get('/startPitching', function(req, res, next){
  var url = 'http://54.64.118.109/startPitching'+'?_id='+req.param('_id')
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// ピッチングスタート時間を更新
app.get('/updatePitchStarttime', function(req, res, next){
  var url = 'http://54.64.118.109/updatePitchStarttime'+'?_id='+req.param('_id')+'&starttime='+req.param('starttime')
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// ピッチング終了
app.get('/finishPitching', function(req, res, next){
  var url = 'http://54.64.118.109/finishPitching'+'?_id='+req.param('_id')
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// トピック取得
app.get('/getTopics', function(req, res, next){
  var url = 'http://54.64.118.109/getTopics'
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// ユーザ更新
app.get('/updateUser', function(req, res, next){
});

// ユーザの評価更新
app.get('/updateUserRate', function(req, res, next){
  var url = 'http://54.64.118.109/updateUserRate'+'?userid='+req.param('userid')+'&rate='+req.param('rate')
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// ユーザ削除
app.get('/deleteUser', function(req, res, next){
});

// 画像を取得
app.get('/getImage', function(req, res, next){
  var url = 'http://54.64.118.109/updateUserRate'+'?url='+req.param('url')
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// 最も近い教師をリクエスト
app.post('/requestTeacher', function(req, res, next){
  var url = 'http://54.64.118.109/requestTeacher'
  var result = request('POST', url, {
    json:{
      userid: req.param('userid'),
      lang: req.param('lang'),
      lng: req.param('lng'),
      lat: req.param('lat'),
      place: req.param('place'),
      placeid: req.param('placeid'),
      img: req.param('img'),
      time: req.param('time')
    }
  });
  res.json(JSON.parse(result.getBody('utf8'))||'{}')
});


// ユーザ登録
app.post('/registUser', function(req, res){
  var url = 'http://54.64.118.109/registUser'
  var result = request('POST', url, {
    json:{
      userid: req.param('userid'),
      firstname: req.param('firstname'),
      lastname: req.param('lastname'),
      lang: req.param('lang'),
      image: req.param('image'),
      oe: req.param('oe')
    }
  });
  res.json(JSON.parse(result.getBody('utf8'))||'{}')
});

// The aws-serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)

// Export your express server so you can import it in the lambda function.
module.exports = app
