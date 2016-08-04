var fs = require("fs"),
    json;

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

exports.find = function(key) {

  tracks = getConfig('../the_pusher_office.json');


  // current_time = new Date().getTime()
  // var current_tracks = tracks.filter(function(a) {
  //   return a.key == key
  // })[0]

  return tracks

}