
function startRad() {
  console.log("Starting RAD");

  // TODO get this from the server
  var epoch = 1470311130483;

  // TODO get this from the server
  var loop = [
    {
      "length_milliseconds": 251000,
      "youtube_video_id": '6PDmZnG8KsM' // voyage voyage
    },
    {
      "length_milliseconds": 253000,
      "youtube_video_id": 't1TcDHrkQYg' // forever young
    }
  ];

  var x = loopAndEpochToCurrentlyPlaying(loop, epoch);

  playFrom(loop, x.currentIndex, x.timeIntoCurrentTrack);
}

// returns current and next 10 tracks in format {start_timestamp, vidid}
function loopAndEpochToCurrentlyPlaying(loop, epoch) {
  var now = currentTimestamp();
  var timeSinceEpoch = now - epoch;
  var loopLen = loopLengthMilliseconds(loop);
  var timeIntoCurrentLoop = timeSinceEpoch % loopLen;

  console.log("Time into current loop", timeIntoCurrentLoop);

  var currentIndex = 0;
  var timeIntoCurrentTrack = timeIntoCurrentLoop;
  while (loop[currentIndex].length_milliseconds < timeIntoCurrentTrack) {
    timeIntoCurrentTrack -= loop[currentIndex].length_milliseconds;
    currentIndex++;
  }

  console.log("Current index", currentIndex);
  console.log("Time into current track", timeIntoCurrentTrack);
  return {currentIndex: currentIndex, timeIntoCurrentTrack: timeIntoCurrentTrack};
}

function loopLengthMilliseconds(loop) {
  var length = 0;
  for (var i = 0; i < loop.length; i++) {
    length += loop[i].length_milliseconds;
  }
  return length;
}


function playFrom(loop, currentIndex, timeIntoTrack) {
  var currentTrack = loop[currentIndex%loop.length];
  playImmediate(currentTrack.youtube_video_id, timeIntoTrack);
  startQueueing(loop, (currentIndex+1)%loop.length, currentTrack.length_milliseconds - timeIntoTrack);
}

function startQueueing(loop, nextTrackIndex, startIn) {
  var nextTrack = loop[nextTrackIndex % loop.length];
  playFuture(nextTrack.youtube_video_id, startIn);
  // when the queued next track starts, queue the next one
  var trackAfterIndex = (nextTrackIndex+1) % loop.length;
  var nextStartIn = nextTrack.length_milliseconds;
  window.setTimeout(function() {
    startQueueing(loop, trackAfterIndex, nextStartIn);
  }, startIn);
}

function currentTimestamp() {
  return (new Date()).getTime();
}

function playImmediate(videoId, positionMs) {
  var player = playerFor(videoId, function() {
    player.seekTo(positionMs/1000);
    player.playVideo();
  });
}

function playFuture(videoId, startIn) {
  var player = playerFor(videoId, function () {
    window.setTimeout(function() {
      player.playVideo();
    }, startIn);
  });
}

// create a new player for a single track
function playerFor(videoId, callback) {
  var div = document.createElement("div");
  div.setAttribute("id", videoId);
  document.body.appendChild(div);
  return new YT.Player(videoId, {
    height: '390',
    width: '640',
    videoId: videoId,
    events: {
      'onReady': callback
    }
  });
}
