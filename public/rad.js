
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

var geoHashToRadioStationCache = {};

function geohashToRadioStation(geohash, callback) {
  if (geohash in geoHashToRadioStationCache) {
    callback(geoHashToRadioStationCache[geohash]);
  } else {
    fetch('/geohash/' + geohash).then(function(response) {
      response.json().then(function(json) {
        var radioId = json.radio_id;
        geoHashToRadioStationCache[geohash] = radioId;
        callback(radioId);
      });
    });
  }
}

var currentRadioStation = null;

function setRadioStation(newRadioStationId) {
  if ((!currentRadioStation)  ||  currentRadioStation.radioId !== newRadioStationId) {
    console.log("New radio station! Setting radio to", newRadioStationId);

    // TODO obliterate the old radio station
    if (currentRadioStation) {
      currentRadioStation.stop();
    }
    currentRadioStation = new RadioStation(newRadioStationId);
  }
}
