var express = require('express');
var app = express();
var mongoose = require('mongoose');
var fs = require('fs');
app.set('view options', { layout: false });

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var multer = require('multer');
var upload = multer({ dest: 'image/' });

var SERVERPATH = '/opt/pitchhike';

mongoose.connect('mongodb://localhost:27017/pitchhike');

mongoose.model('user', new mongoose.Schema({
  userid:       String,
  password:     String,
  name:		String,
  image:	String,
  language:     String,
  native:	String,
  rate:         Number,
  location:	[Number],
  fullname:     String,
  birthday:     String,
  gender:       String,
  hobbies:      String,
  job:          String,
  dream:        String,
  from:         String
}));
User = mongoose.model('user');

mongoose.model('pitch', new mongoose.Schema({
  status:       String,
  student:      String,
  teacher:      String,
  language:	String,
  location:     [Number],
  place:        String,
  placeid:      String,
  placeimg:	String,
  arrive:       Number,
  date:		String,
  time:		Number,
  starttime:    Number
}));
Pitch = mongoose.model('pitch');

mongoose.model('topic', new mongoose.Schema({
  topic:        String
}));
Topic = mongoose.model('topic');


// ログイン
app.get('/login', function(req, res, next){
});

// ユーザ一覧取得
app.get('/getUsers', function(req, res, next){
  User.find({}, function(err, docs){
    var list = [];
    docs.forEach(function(m){
      list.push(m);
    });
    res.send(list);
  });
});

// ピッチ一覧取得
app.get('/getPitchs', function(req, res, next){
  Pitch.find({}, function(err, docs){
    var list = [];
    docs.forEach(function(m){
      list.push(m);
    });
    res.send(list);
  });
});

// ユーザの位置情報を更新
app.get('/updateUserLocation', function(req, res, next){
  User.findOne({ userid:req.param("userid") }, function(err, doc){
    if(doc){
      doc.location = [req.param("lng"),req.param("lat")];
      doc.save(function(err){
      });
      res.send(doc);
    }else{
      res.send(doc);
    }
  });
});

// 最も近い教師をリクエスト
/*
app.get('/requestTeacher', function(req, res, next){
  //User.findOne({ location : { $near : [req.param("lng"), req.param("lat")] }, native:req.param("lang") }, function(err, doc){
    //if(!doc){
      //res.send("null");
    //} else {
      //var teacher = doc.toObject();
      // pitchレコード（ステータス：リクエスト中）を作成
      var pitchRecord = new Pitch();
      pitchRecord.status   = "req";
      pitchRecord.student  = req.param("userid");
      pitchRecord.teacher  = "";
      pitchRecord.language = req.param("lang");
      pitchRecord.location = [req.param("lng"), req.param("lat")];
      pitchRecord.place    = req.param("place");
      pitchRecord.placeid  = req.param("placeid");
      pitchRecord.placeimg = req.param("img");
      pitchRecord.time     = req.param("time");
      pitchRecord.date     = new Date().toISOString();
      pitchRecord.save(function(err){
        res.send(pitchRecord);
      });
    //}
  //});
});
*/

// 最も近い教師をリクエスト
app.post('/requestTeacher', function(req, res, next){
  //User.findOne({ location : { $near : [req.body.lng, req.body.lat] }, native:req.body.lang }, function(err, doc){
    //if(!doc){
      //res.send("null");
    //} else {
      //var teacher = doc.toObject();
      // pitchレコード（ステータス：リクエスト中）を作成
      var pitchRecord = new Pitch();
      pitchRecord.status   = "req";
      pitchRecord.student  = req.body.userid;
      pitchRecord.teacher  = "";
      pitchRecord.language = req.body.lang;
      pitchRecord.location = [req.body.lng, req.body.lat];
      pitchRecord.place    = req.body.place;
      pitchRecord.placeid  = req.body.placeid;
      pitchRecord.placeimg = req.body.img;
      pitchRecord.time     = req.body.time;
      pitchRecord.date     = new Date().toISOString();
      pitchRecord.save(function(err){
        res.send(pitchRecord);
      });
    //}
  //});
});

// 自分の近くで自分の母国語に対するリクエストが無いか確認
app.get('/searchRequest', function(req, res, next){
  //Pitch.find({ language:req.param("lang"), status:"req" },{},{sort:{_id:-1}}, function(err, doc){
  var dt = new Date();
  dt.setMinutes(dt.getMinutes() - 3);
  Pitch.find({ date: {'$gte': dt.toISOString()}, location : { $near : [req.param("lng"), req.param("lat")] }, language:req.param("lang"), status:"req", student:{$ne:req.param("userid")} },{},{sort:{_id:-1}}, function(err, doc){
    if(!doc){
      res.send("null");
    } else {
      res.send(doc[0]);
    }
  });
});

// ユーザ参照
app.get('/getUser', function(req, res, next){
  User.findOne({userid:req.param("userid")}, function(err, doc){
    res.send(doc);
  });
});

// 教師リクエスト状況取得
app.get('/getRequestStatus', function(req, res, next){
  Pitch.findOne({_id:req.param("_id")}, function(err, doc){
    res.send(doc);
  });
});

// 教師リクエスト受諾
app.get('/responseTeacher', function(req, res, next){
  // pitchレコードのステータスをレスポンス有に設定
  Pitch.findOne({ _id:req.param("_id") }, function(err, doc){
    if(!doc){
      res.send("null");
    }else{
      doc.status = "res";
      doc.teacher = req.param("userid");
      doc.save(function(err){
      });
      res.send(doc);
    }
  });
});

// 到着までの時間を更新
app.get('/updateArrive', function(req, res, next){
  Pitch.findOne({ _id:req.param("_id") }, function(err, doc){
    doc.arrive = req.param("arrive");
    doc.save(function(err){
    });
    res.send(doc);
  });
});

// ピッチング成立〜決済〜ルート案内開始
app.get('/createPitching', function(req, res, next){
});

// ピッチングキャンセル
app.get('/cancelPitching', function(req, res, next){
  // pitchレコードのステータスをキャンセルに設定
  Pitch.findOne({ _id:req.param("_id") }, function(err, doc){
    doc.status = "cancel";
    doc.save(function(err){
    });
    res.send(doc);
  });
});

// ピッチング開始
app.get('/startPitching', function(req, res, next){
  // pitchレコードのステータスを更新
  Pitch.findOne({ _id:req.param("_id") }, function(err, doc){
    switch (doc.status) {
      case "res":
        doc.status = "waiting";
        doc.save(function(err){
        });
        res.send(doc);
        break;
      case "waiting":
        doc.status = "start";
        doc.save(function(err){
        });
        res.send(doc);
        break;
      default:
        res.send(doc);
    }
  });
});

// ピッチングスタート時間を更新
app.get('/updatePitchStarttime', function(req, res, next){
  // pitchレコードのスタート時間を設定
  Pitch.findOne({ _id:req.param("_id") }, function(err, doc){
    doc.starttime = req.param("starttime");
    doc.save(function(err){
    });
    res.send(doc);
  });
});

// ピッチング終了
app.get('/finishPitching', function(req, res, next){
  // pitchレコードのステータスを「終了（finish）」に更新
  Pitch.findOne({ _id:req.param("_id") }, function(err, doc){
    if(doc){
      doc.status = "finish";
      doc.save(function(err){
      });
      res.send(doc);
    }else{
      res.send(doc);
    }
  });
});

// トピック取得
app.get('/getTopics', function(req, res, next){
  Topic.find({}, function(err, doc){
    res.send(doc);
  });
});


// ユーザ登録
app.post('/registUser', function(req, res){
  User.findOne({userid:req.body.userid}, function(err, doc){
  console.log("test:" + doc);
  if( doc ){
    console.log("already registord");
    res.send(doc);
  } else {

  //res.setHeader('Content-Type', 'text/plain');
  //console.log(req.body);

  // ユーザレコードを作成
  var userRecord = new User();

  var firstname = "";
  if (req.body.firstname) {
    firstname = req.body.firstname;
  }
  var lastname = "";
  if (req.body.lastname) {
    lastname = req.body.lastname;
  }
  var userid = "";
  if (req.body.userid) {
    userid = req.body.userid;
  }
  var language = "";
  if (req.body.lang) {
    language = req.body.lang;
  }
  var native = "";
  if (req.body.native) {
    native = req.body.native;
  }
  var image = "";
  // 画像を保存
  if (req.body.image){
    //console.log(req.body.image + req.body.oe);
    //image = b64encode(req.body.image);
    image = req.body.image + "&oe=" +  req.body.oe;
    //console.log(image);
  }
  userRecord.userid  = userid;
  userRecord.password  = "";
  userRecord.name   = firstname;
  userRecord.image  = image;
  userRecord.fullname  = firstname + " " + lastname;
  userRecord.language  = language;
  userRecord.native  = native;
  userRecord.rate  = 4;
  userRecord.location  = [];
  userRecord.birthday  = "";
  userRecord.gender  = "";
  userRecord.hobbies  = "";
  userRecord.job  = "";
  userRecord.dream  = "";
  userRecord.from  = "";
  userRecord.save(function(err){
    res.send(userRecord);
  });
  }
  });
});

function b64encode(str) {
   return new Buffer(str).toString('base64');
}

function b64decode(encodedStr) {
    return new Buffer(encodedStr, 'base64').toString();
}

// ユーザ更新
app.get('/updateUser', function(req, res, next){
});

// ユーザの評価更新
app.get('/updateUserRate', function(req, res, next){
  // userレコードのRateを更新
  User.findOne({ userid:req.param("userid") }, function(err, doc){
    if(!('rate' in doc) || !doc.rate){
      // 初評価の場合は3を基準にして計算
      doc.rate = 3;
    }
    doc.rate = (doc.rate + parseInt(req.param("rate"))) / 2;
    doc.save(function(err){
    });
    res.send(doc);
  });
});

// ユーザ削除
app.get('/deleteUser', function(req, res, next){
});

// 画像を取得
app.get('/getImage', function(req, res, next){
  var image = fs.readFileSync(SERVERPATH + '/images/' + req.param("url"));
  // res.send(image, { 'Content-Type': 'image/jpeg' }, 200);
  res.send(image);
});

app.listen(8080);
