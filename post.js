var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('server');
var fs = require('fs');
var multer = require('multer');
const path = require('path');
const ejs = require('ejs');
const {
  result
} = require('lodash');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
var filename = path.basename(__filename);
const account = "admin";
const password = "admin123456";
var logflag = 0;
var date; //資料庫用
var showdate; //前端用
var dateselect = [];
var herfselect1 = [];
var contentselect1 = [];
var herfselect2 = [];
var contentselect2 = [];
var smog = [];
var touchtime = [];

//---------------change DB path------------------
const file = 'test.db';
//-----------------------------------------------
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);

app.use('/public', express.static('public'));
//----------------change file path---------------
app.use('/test_photo', express.static('test_photo'));
app.use('/test_photo_1', express.static('test_photo_1'));
//-----------------------------------------------
var urlencodedParser = bodyParser.urlencoded({
  extended: false
})
app.use(multer({
  dest: '/tmp/'
}).array('image'));

app.get('/', function (req, res) {
  logflag = 0;
  res.sendFile(__dirname + "/" + "login.html");
  console.log("登入畫面 Login Page");
})

app.post('/login', urlencodedParser, function (req, res) {
  logflag = 0;
  res.sendFile(__dirname + "/" + "login.html");
  console.log("登入畫面 Login Page");
})

app.post('/choose', urlencodedParser, function (req, res) {
  if ((account == req.body.account && password == req.body.password) || logflag == 1) {
    logflag = 0;
    res.sendFile(__dirname + "/" + "choose.html");
    console.log("登入成功 Login Success");
  } else {
    logflag = 0;
    res.sendFile(__dirname + "/" + "loginfail.html");
    console.log("登入失敗 Login fail");
  }
})

app.post('/upload', urlencodedParser, function (req, res) {
  logflag = 1;
  res.sendFile(__dirname + "/" + "upload.html");
  console.log("上傳畫面 Update Page");
})

app.post('/history', urlencodedParser, function (req, res) {
  logflag = 1;
  res.sendFile(__dirname + "/" + "history.html");
  console.log("歷史畫面 History Page");
})

app.post('/upload/success', urlencodedParser, function (req, res) {
  console.log(req.files[0]); // 上傳的資料訊息
  logflag = 1;
  var newname = req.body.newname;
  //req.file[0].originalname = newname;
  var des_file = req.files[0].originalname;
  var extension1 = req.files[0].originalname.split('.').pop();
  console.log(extension1);
  //----------save picture path in here-------------
  var down_file = 'C:/load_picture/' + req.body.newname + "." + extension1;
  //------------------------------------------------
  fs.readFile(req.files[0].path, function (err, data) {
    fs.writeFile(down_file, data, function (err) {
      if (err) {
        console.log(err);
        console.log("上傳失敗 Upload fail");
      } else {
        logflag = 1;
        res.sendFile(__dirname + "/" + "success.html");
      }
      console.log(down_file);
      console.log("上傳成功 Upload Success");

    });
  });
})

app.get('/history/viewhistory', function (req, res) {
  var a = req.query.datetext.split('/');
  date = a[2] + '-' + a[0] + '-' + a[1];
  showdate = a[0] + '-' + a[1] + '-' + a[2];
  console.log(date);
  logflag = 1;
  var sql01 = "select rowid AS id, type1, date1, herf, content from tbl1 where date1 = " + "'" + date + "'" + "and type1 = 'known'"
  var sql02 = "select rowid AS id, type1, date1, herf, content from tbl1 where date1 = " + "'" + date + "'" + "and type1 = 'unknown'"
  var sql03 = "select rowid AS id, date1, smog, time1 from tbl2 where date1 = " + "'" + date + "'"
  db.serialize(() => {
    db.all(sql01, (err, rows) => {
      db.serialize(() => {
        db.all(sql02, (err, rows) => {
          db.serialize(() => {
            db.all(sql03, (err, rows) => {
        
              if (err) {
                console.error(err.message);
              }
              rows.forEach(function (row) {
                smog.push(row.smog);
                touchtime.push(row.time1);
              });

              res.render(__dirname + "/" + "viewhistory.ejs", {
                searchdate: showdate,
                content1: contentselect1,
                content2: contentselect2,
                picture1: herfselect1, 
                picture2: herfselect2,
                smog: smog,
                touchtime: touchtime
              });

              console.log(contentselect1, contentselect2,herfselect1,herfselect2,smog);
              contentselect2 = [];
              herfselect2 = [];
              contentselect1 = [];
              herfselect1 = [];
              smog = [];
              touchtime = [];
              console.log("查看歷史畫面 View History Page");
            });
          });
          if (err) {
            console.error(err.message);
          }
          rows.forEach(function (row) {
            herfselect2.push(row.herf);
            contentselect2.push(row.content);
          });
        });
      });
      if (err) {
        console.error(err.message);
      }
      rows.forEach(function (row) {
        herfselect1.push(row.herf);
        contentselect1.push(row.content);
      });
    });
  });
});

//db.close(); //資料庫關閉*/
var server = app.listen(8081, function () {

  var host = server.address().address;
  var port = server.address().port;

})