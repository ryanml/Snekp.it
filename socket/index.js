exports.socket = function(http) {
  // Require socket.io
  var io = require('socket.io')(http);
  // Require snake.js
  var SnakeActions = require('./snake');
  var snake = new SnakeActions();
  var updateLoop;
  // Socket logic
  io.on('connection', function(socket) {
    // Id associate with client connection
    var id = socket.id;
    // Add food if it isn't there
    if (snake.gameState.foodCoords.length === 0) {
      snake.addFood();
    }
    // Add new player on connection, send the client id
    snake.addPlayer(id);
    // To avoid double interval, clear loop on reload
    if (updateLoop) {
      clearInterval(updateLoop);
    }
    // Every 100ms, update player coordinates and push state change to client
    updateLoop = setInterval(function() {
      snake.updateGame();
      io.emit('state-change', snake.gameState);
    }, 100);
    // When a player moves, change player direction
    socket.on('player-movement', function(action) {
      snake.updatePlayerDirection(id, action);
    });
    // When a player disconnects, remove their dot
    socket.on('disconnect', function() {
      snake.removePlayer(id);
    })

  });
}
