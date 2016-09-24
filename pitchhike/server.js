var express = require('express');
var app = express();
var mongoose = require('mongoose');
var fs = require('fs');
app.set('view options', { layout: false });

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var multer = require('multer');
var upload = multer({ dest: 'images/' });

var SERVERPATH = '/opt/pitchhike';

mongoose.connect('mongodb://localhost:27017/pitchhike');

mongoose.model('user', new mongoose.Schema({
  userid:       String,
  password:     String,
  name:		String,
  image:	String,
  language:     String,
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
  location:     [Number],
  place:        String,
  placeid:      String,
  arrive:       Number,
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
    doc.location = [req.param("lng"),req.param("lat")];
    doc.save(function(err){
    });
    res.send(doc);
  });
});

// 最も近い教師をリクエスト
app.get('/requestTeacher', function(req, res, next){
  User.findOne({ location : { $near : [req.param("lng"), req.param("lat")] }, language:req.param("lang") }, function(err, doc){
    var teacher = doc.toObject();
    // pitchレコード（ステータス：リクエスト中）を作成
    var pitchRecord = new Pitch();
    pitchRecord.status   = "req";
    pitchRecord.student  = req.param("userid");
    pitchRecord.teacher  = teacher.userid;
    pitchRecord.location = [req.param("lng"), req.param("lat")];
    pitchRecord.place    = req.param("place");
    pitchRecord.placeid  = req.param("placeid");
    pitchRecord.save(function(err){
      res.send(pitchRecord);
    });
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
    doc.status = "res";
    doc.teacher = req.param("userid");
    doc.save(function(err){
    });
    res.send(doc);
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
    doc.status = "finish";
    doc.save(function(err){
    });
    res.send(doc);
  });
});

// トピック取得
app.get('/getTopics', function(req, res, next){
  Topic.find({}, function(err, doc){
    res.send(doc);
  });
});

// ユーザ登録
app.post('/registUser', upload.array('files'), function(req, res){
  res.setHeader('Content-Type', 'text/plain');
  console.log(req.body);
  var name = "";
  if (req.body.name) {
    name = req.body.name;
  }
  var userid = "";
  if (req.body.userid) {
    userid = req.body.userid;
  }
  // 画像を保存
  if (req.body.files){
    req.files.forEach(function(elem) {
      console.log(elem.filename);
    });
  }
  res.send(name);
});


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

