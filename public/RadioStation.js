// A simple object representing a radio station
// when created it starts playing
// it stops playing, and removes itself, on stop()

function RadioStation(radioId) {
  console.log("Created new RadioStation:", radioId);

  this.div = document.createElement("div");
  this.div.setAttribute("id", "station_" +radioId);
  document.body.appendChild(this.div);

  this.radioId = radioId;

  this.divIdCounter = 0;

  var that = this;

  fetch('/radio/' + radioId).then(function(response) {
    console.log("Got details for new radio station");
    response.json().then(function(json) {
      that.loop = json.tracks;
      that.epoch = json.channel_epoch;

      var x = that.loopAndEpochToCurrentlyPlaying();
      that.playFrom(x.currentIndex, x.timeIntoCurrentTrack);
    });
  });
}

RadioStation.prototype.stop = function() {
  console.log("TODO STOP"); // TODO
};

// returns current and next 10 tracks in format {start_timestamp, vidid}
RadioStation.prototype.loopAndEpochToCurrentlyPlaying = function() {
  var now = currentTimestamp();
  var timeSinceEpoch = now - this.epoch;
  var loopLen = loopLengthMilliseconds(this.loop);
  var timeIntoCurrentLoop = timeSinceEpoch % loopLen;

  console.log("Time into current loop", timeIntoCurrentLoop);

  var currentIndex = 0;
  var timeIntoCurrentTrack = timeIntoCurrentLoop;
  while (this.loop[currentIndex].length_milliseconds < timeIntoCurrentTrack) {
    timeIntoCurrentTrack -= this.loop[currentIndex].length_milliseconds;
    currentIndex++;
  }

  console.log("Current index", currentIndex);
  console.log("Time into current track", timeIntoCurrentTrack);
  return {currentIndex: currentIndex, timeIntoCurrentTrack: timeIntoCurrentTrack};
};

RadioStation.prototype.playFrom = function (currentIndex, timeIntoTrack) {
  var currentTrack = this.loop[currentIndex%this.loop.length];
  this.playImmediate(currentTrack.youtube_id, timeIntoTrack);
  this.startQueueing((currentIndex+1)%this.loop.length, currentTrack.length_milliseconds - timeIntoTrack);
};

RadioStation.prototype.startQueueing = function (nextTrackIndex, startIn) {
  console.log("Queueing track", nextTrackIndex, "to start in", startIn);

  var nextTrack = this.loop[nextTrackIndex % this.loop.length];

  this.playFuture(nextTrack.youtube_id, startIn);

  // when the queued next track starts, queue the next one
  var trackAfterIndex = (nextTrackIndex+1) % this.loop.length;
  var nextStartIn = nextTrack.length_milliseconds;

  var that = this;

  window.setTimeout(function() {
    that.startQueueing(trackAfterIndex, nextStartIn);
  }, startIn);
};

RadioStation.prototype.playImmediate = function (videoId, positionMs) {
  var player = this.playerFor(videoId, function() {
    player.seekTo(positionMs/1000);
    player.playVideo();
  });
};

RadioStation.prototype.playFuture = function (videoId, startIn) {
  var player = this.playerFor(videoId, function () {
    window.setTimeout(function() {
      player.playVideo();
    }, startIn);
  });
};

// create a new player for a single track
RadioStation.prototype.playerFor = function (videoId, callback) {
  var playerDiv = document.createElement("div");
  var id = "player_" + this.divIdCounter; // ugh
  this.divIdCounter++;
  playerDiv.setAttribute("id", id);
  this.div.appendChild(playerDiv);
  return new YT.Player(id, {
    height: '390',
    width: '640',
    videoId: videoId,
    events: {
      'onReady': callback
    }
  });
};

function loopLengthMilliseconds(loop) {
  var length = 0;
  for (var i = 0; i < loop.length; i++) {
    length += loop[i].length_milliseconds;
  }
  return length;
}

function currentTimestamp() {
  return (new Date()).getTime();
}
