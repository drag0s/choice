var express = require('express');
var router = express.Router();
const execFile = require('child_process').execFile;

global.child;
var id = 1;
global.song = '';
var infoSongs = '';
var maxInfoSong = 1000;


const killChild = function() {
  if (global.child) child.kill();
}

const startChild = function() {
  global.child = execFile('mpsyt', ['//'+global.song, ', 1, 1-'], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stdout);
  });
  // child.stdout.on('data', function (data) {
  //   if (maxInfoSong > 0) {
  //     infoSongs += data;
  //     --maxInfoSong;
  //   }
  // });
}

const globalMessage = function(msg) {
    console.log("Sending " + msg + " to all the clients");
    global.wsServer.connections.forEach(function(conn) {
      conn.sendUTF("new msg is " + msg);
    })
}

const getInfo = function() {
  var infoChild = execFile('mpsyt', ['//'+global.song, ', 1'], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stdout);
  });
  infoChild.stdout.on('data', function (data) {
    if (maxInfoSong > 0) {
      infoSongs += data;
      --maxInfoSong;
    }
  });
}

const nextFunction = function() {
  ++id;
  global.child.stdin.write(">");
  console.log("Skipping song");
}




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/globalmsg/:msg', function(req, res, next) {
  globalMessage(req.params.msg);
  res.status(200).send("MSGS sended");
})

router.get('/next', function(req, res, next) {
  ++id;
  global.child.stdin.write(">");
  res.status(200).send("Switching to next song");
});

router.get('/songlist', function(req, res, next){
  console.log(infoSongs);
  res.status(200).send(infoSongs);
})

router.get('/start/:keyword', function(req, res, next) {
  killChild();
  getInfo();
  id = 1;
  global.song = req.params.keyword;
  startChild();
  res.status(200).send("Playing " + global.song);
});

router.get('/stop', function(req, res, next) {
  killChild();
  res.status(200).send("Stopping music");
});

module.exports = router;
