
var player;

function startApp(event) {
  player = event.target;
  for (var i = 0; i < playlist.length; i++) {
    queueTrack(playlist[i]);
  }
}

var NOW = 1470311130483;

var playlist = [
  {
    "start_timestamp": NOW,
    "youtube_video_id": '6PDmZnG8KsM' // voyage voyage, length:
  },
  {
    "start_timestamp": NOW + 253000,
    "youtube_video_id": 't1TcDHrkQYg' // forever young
  }
];


function currentTimestamp() {
  return (new Date()).getTime();
}

// Expects track in format:
// {
//   "start_timestamp": 1470308544037,
//   "youtube_video_id": '6PDmZnG8KsM' // voyage voyage, length:
// }
function queueTrack(track) {
  var start = track.start_timestamp;
  var now = currentTimestamp();
  var startIn = start - now;
  if (startIn < 0) {
    // It's already started! Play it now!
    player.loadVideoById({
      'videoId': track.youtube_video_id,
      'startSeconds': (-startIn)/1000,
      'suggestedQuality': 'small'
    });
    player.playVideo();
  } else {
    // Queue it up to play
    // TODO can we preload the track?
    window.setTimeout(function() {
      player.loadVideoById({
        'videoId': track.youtube_video_id,
        'startSeconds': 0,
        'suggestedQuality': 'small'
      });
      player.playVideo();
    }, startIn);
  }
}
