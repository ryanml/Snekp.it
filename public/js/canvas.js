// Snake handler class
window.onload = function() {
class CanvasHandler {
    constructor() {
      this.canvas = document.getElementById('game-canvas');
      this.context = this.canvas.getContext('2d');
      this.boxWidth = 30;
      this.boxHeight = 30;
    }
    drawState(gameState) {
      // Clear old state
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // Draw food
      this.context.fillStyle = '#ff0000';
      var food = gameState.foodCoords;
      this.context.fillRect(food[0], food[1], this.boxWidth, this.boxHeight);
      // Draw players
      this.context.fillStyle = '#0000ff';
      var players = gameState.players;
      for (var p = 0; p < players.length; p++) {
        this.context.fillRect(players[p].coords[0], players[p].coords[1], this.boxWidth, this.boxHeight);
      }
    }
}
// New socket, canvasHandler, keyHandler objects
var socket = io();
var canvasHandler = new CanvasHandler();
document.body.onkeydown = function(e) {
  var key = e.keyCode;
  var action;
  switch(key) {
    case 37:
      action = 'LEFT';
      break;
    case 38:
      action = 'UP';
      break;
    case 39:
      action = 'RIGHT';
      break;
    case 40:
      action = 'DOWN';
      break;
  }
  // Send action to socket
  socket.emit('player-movement', action);
}
// Check for state changes, update state
socket.on('state-change', function(newState) {
  canvasHandler.drawState(newState);
});
}
