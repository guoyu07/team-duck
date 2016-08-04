var express = require('express')
var app = express()
var mustacheExpress = require('mustache-express');

var RadioChannel = require('./models/radioChannel')

app.set('views', __dirname + '/public');
app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('view cache', false);

app.use(express.static('public'));


app.get('/', function(req, res) {
  res.render('home');
});

app.get('/radio/:radio_id', function(req, res, next) {

  // This should be replaced with some logic to determine the 
  var channel_name = 'the_pusher_office',
      channel_tracks = RadioChannel.find(channel_name),
      channel_running_length = 0;


  var returnable_channel_tracks = {
    "tracks": []
  }

  for(var i = 0, x = channel_tracks['tracks'].length; i < x; i++) {
    returnable_channel_tracks.tracks.push(channel_tracks['tracks'][i]);

    channel_running_length += channel_tracks['tracks'][i].length;
  }


  returnable_channel_tracks["channel_length"] = channel_running_length;
  returnable_channel_tracks["channel_epoch"] = 1470311130483


  var channel_content = {
    "tracks": [
      {
        "start_timestamp": new Date().getTime(),
        "length": "something",
        "epoch": "this_is_epoch",
        "youtube_url": "https://www.youtube.com/watch?v=6PDmZnG8KsM"
      }
    ]
  }

  res.json(returnable_channel_tracks);
});


var port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('Listening on port %d', port)
});
