'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const app = express()
const http = require('http');
const async = require('async');

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
  console.log('--- a');
  var url = 'http://54.64.118.109/getUsers'
  var response = ''

  async.waterfall([
    function(callback) {
      http.get(url, function(res){
        console.log('--- b');
          var body = '';
          res.setEncoding('utf8');

          res.on('data', function(chunk){
            console.log('--- c');
              body += chunk;
          });

          res.on('end', function(res){
            console.log('--- d');
              console.log(body);
              req.write(body);
              req.end();
          });
      }).on('error', function(e){
        console.log('--- e');
          console.log(e.message); //エラー時
      });

      console.log('1');
      setTimeout(function() {
        console.log('1 done');
        callback(null, 1);
      }, 1000);
    },
    function(arg1, callback) { // arg1 === 1
      console.log('2');
      setTimeout(function() {
        console.log('2 done');
        callback(null, 1, 2);
      }, 50);
    },
    function(arg1, arg2, callback) { // arg1 === 1, arg2 === 2
      console.log('3');
      setTimeout(function() {
        console.log('3 done');
        callback(null, 1, 2, 3);
      }, 10);
    }
  ], function(err, arg1, arg2, arg3) { // arg1 === 1, arg2 === 2, arg3 === 3
    if (err) {
      throw err;
    }
    console.log('all done.');
    console.log(arg1, arg2, arg3);
  });


});



// The aws-serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)

// Export your express server so you can import it in the lambda function.
module.exports = app
