
function startRad() {
  console.log("Starting RAD");

  if ("geolocation" in navigator) {
    var watchID = navigator.geolocation.watchPosition(function(position) {
      console.log("Got new geo position", position);
      var geohash = positionToGeohash(position);
      console.log("My geohash", geohash);
      geohashToRadioStation(geohash, function(radio) {
        console.log("My radio station", radio);
        setRadioStation(radio);
      });
    });
  } else {
    console.log("DOGDAMNIT UPGRADE YOUR FSCKING BROWSER");
  }

  // curl 'https://www.googleapis.com/youtube/v3/videos' -G -d 'part=contentDetails' -d 'key=AIzaSyANQfgz4MFR4aRTS_MJS0FjAFG4Nr1ZaG4' -d 'id=t1TcDHrkQYg'
}

// get my 2m square
function positionToGeohash(position) {
  return encodeGeoHash(position.coords.latitude, position.coords.longitude).slice(0,10);
}

function geohashToRadioStation(geohash, callback) {
  fetch('/geohash/' + geohash).then(function(response) {
    response.json().then(function(json) {
      callback(json.radio_id);
    });
  });
}

var currentRadioStation = null;

function setRadioStation(newRadioStation) {
  if (currentRadioStation !== newRadioStation) {
    console.log("New radio station! Setting radio to", newRadioStation);
    currentRadioStation = newRadioStation;

    // TODO obliterate the old radio station
    fetch('/radio/' + newRadioStation).then(function(response) {
      console.log("Got details for new radio station");
      response.json().then(function(json) {
        var loop = json.tracks;
        var epoch = json.channel_epoch;

        var x = loopAndEpochToCurrentlyPlaying(loop, epoch);
        playFrom(loop, x.currentIndex, x.timeIntoCurrentTrack);
      });
    });

  }
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
  playImmediate(currentTrack.youtube_id, timeIntoTrack);
  startQueueing(loop, (currentIndex+1)%loop.length, currentTrack.length_milliseconds - timeIntoTrack);
}

function startQueueing(loop, nextTrackIndex, startIn) {
  console.log("Queueing track", nextTrackIndex, "to start in", startIn);
  var nextTrack = loop[nextTrackIndex % loop.length];
  playFuture(nextTrack.youtube_id, startIn);
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

var divIdCounter = 0;

// create a new player for a single track
function playerFor(videoId, callback) {
  var div = document.createElement("div");
  var id = "player_" +divIdCounter; // ugh
  divIdCounter++;
  div.setAttribute("id", id);
  document.body.appendChild(div);
  return new YT.Player(id, {
    height: '390',
    width: '640',
    videoId: videoId,
    events: {
      'onReady': callback
    }
  });
}
