exports.socket = function(http) {
  // Require socket.io
  var io = require('socket.io')(http);
  // Require snake.js
  var SnakeLogic = require('./snake');
  var snake = new SnakeLogic();
  // Socket logic
  io.on('connection', function(socket) {
    // Add new player on connection
    snake.addPlayer(socket.id);
    io.emit('state-change', snake.gameState);
    // Draw initial food if it isn't there yet
    if (snake.gameState.foodCoords.length === 0) {
      snake.addNewFood();
      io.emit('state-change', snake.gameState);
    }
    // When a player moves, update position
    socket.on('player-movement', function(action) {
      snake.updatePlayerPos(action, socket.id);
      io.emit('state-change', snake.gameState);
    });
    // When a player disconnects, remove their dot
    socket.on('disconnect', function() {
      snake.removePlayer(socket.id);
      io.emit('state-change', snake.gameState);
    })

  });
}
