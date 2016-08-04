var express = require('express')
var app = express()
var mustacheExpress = require('mustache-express');

app.set('views', __dirname + '/public');
app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('view cache', false);

app.use(express.static('public'));


app.get('/', function(req, res) {
  res.render('home');
});


var port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('Listening on port %d', port)
});
