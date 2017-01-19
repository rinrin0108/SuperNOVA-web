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
  var url = 'http://54.64.118.109/updateUserLocation?lat='+req.param('lat')+'&lng='+req.param('lng')+'&userid='+req.param('userid')
  var result = request('GET', url).getBody('utf8')
  res.json(JSON.parse(result||"{}"))
});

// The aws-serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)

// Export your express server so you can import it in the lambda function.
module.exports = app
