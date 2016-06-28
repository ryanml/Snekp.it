var express = require('express');
var http = require('http');
var path = require('path');
var app = express();

// Set port to 3000
app.set('port', 3000);

// Public folder
app.use(express.static(path.join(__dirname, 'public')));

// Apply index route to app
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Set server to listen designated port
http.createServer(app).listen(app.get('port'), function() {
  console.log('Listening on port ' + app.get('port'));
});
