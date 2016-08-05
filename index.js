var express = require('express')
var app = express()
var mustacheExpress = require('mustache-express');
var sassMiddleware = require('node-sass-middleware');
var autoprefixer = require('express-autoprefixer');
var fs = require("fs");
var json;

var RadioChannel = require('./models/radioChannel')

app.set('views', __dirname + '/public');
app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('view cache', false);
app.use(autoprefixer({ browsers: 'last 30 versions', cascade: false }))

app.use(sassMiddleware({
  /* Options */
  src: __dirname + '/assets_src/sass',
  dest: __dirname + '/public',
  debug: true,
  response: true,
  outputStyle: 'compressed'
}));

function readJsonFileSync(filepath, encoding){
  if (typeof (encoding) == 'undefined'){
      encoding = 'utf8';
  }
  var file = fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}

function getConfig(file){
  var filepath = __dirname + '/' + file;
  return readJsonFileSync(filepath);
}

app.use(express.static('public'));


app.get('/', function(req, res) {
  res.render('player');
});

app.get('/geohash/:geohash', function(req, res) {
  // FIXME
  var geohash = req.params.geohash;
  var break_one;
  console.log("Asked for geohash: ", geohash);
  channels = getConfig('/channels.json');


  // res.json(tracks['channels']);

  var a = 0,
      b = channels['channels'].length,
      c = 0,
      break_one = false,
      matched_channel;

  for(; a < b; a++) {
    for(c = 0, d = channels['channels'][a]['geohash_points'].length; c < d; c++) {
      console.log(channels['channels'][a]['geohash_points'][c]);
      if (channels['channels'][a]['geohash_points'][c] == geohash) {
        matched_channel = channels['channels'][a];
        break_one = true;
        break;
      } else {
        continue;
      }
    }

    if(break_one == true) {break;}
  }

  res.json(matched_channel);
});

app.get('/radio/:radio_id', function(req, res, next) {

  var channel_name = req.params.radio_id;

  console.log("Ashed for radio: ", channel_name);

  var channel_tracks = RadioChannel.find(channel_name),
      channel_running_length = 0;


  var returnable_channel_tracks = {
    "tracks": []
  }

  for(var i = 0, x = channel_tracks['tracks'].length; i < x; i++) {
    returnable_channel_tracks.tracks.push(channel_tracks['tracks'][i]);

    channel_running_length += channel_tracks['tracks'][i].length_milliseconds;
  }

  returnable_channel_tracks["channel_length"] = channel_running_length;
  returnable_channel_tracks["channel_epoch"] = 1470311130483;

  res.json(returnable_channel_tracks);
});


var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Listening on port %d', port)
});
