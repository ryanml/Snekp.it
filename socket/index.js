'use strict';
exports.socket = function(http) {
  // Require socket.io
  var io = require('socket.io')(http);
  // Require snake.js
  var SnakeActions = require('./snake');
  var snake = new SnakeActions();
  var updateLoop;
  // Socket logic
  io.on('connection', function(socket) {
    // id associate with client connection
    var id = socket.id;
    // Send id to the client and request the nickname
    io.emit('id', id);
    // Add new player on connection, send the client id
    socket.on('nick', function(nick) {
      snake.addPlayer(nick, id);
      io.emit('received-nick');
    });
    // To avoid double interval, clear loop on reload
    if (updateLoop) {
      clearInterval(updateLoop);
    }
    // Every 75ms, update player coordinates and push state change to client
    updateLoop = setInterval(function() {
      snake.updatePositions();
      io.emit('state-change', snake.gameState);
    }, 75);
    // When a player moves, change player direction
    socket.on('player-movement', function(action) {
      snake.updatePlayerDirection(id, action);
    });
    // When a player disconnects, remove their dot
    socket.on('disconnect', function() {
      snake.removePlayer({
        id: id,
        kill: false
      });
    })

  });
}
