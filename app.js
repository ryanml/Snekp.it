'use strict';
var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var socket = require('./socket')

// Set port to 3000
app.set('port', 3000);

// Public folder
app.use(express.static(path.join(__dirname, 'public')));

// Apply index route to app
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Initialize socket module
socket.socket(http);

// Set server to listen designated port
http.listen(app.get('port'), '0.0.0.0', function() {
  console.log('Listening on port ' + app.get('port'));
});
