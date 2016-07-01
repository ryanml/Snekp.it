window.onload = function() {
  class GameHandler {
    constructor(id) {
      this.id = id;
      this.boxWidth = 30;
      this.boxHeight = 30;
      this.canvas = document.getElementById('game-canvas');
      this.context = this.canvas.getContext('2d');
      this.scoreSpan = document.getElementById('score');
      this.highScoreSpan = document.getElementById('high-score');
      this.playerSpan = document.getElementById('num-players');
      document.body.addEventListener('keydown', this.sendAction);
    }
    putStats(gameState) {
      var player = gameState.players.filter(p => p.id === this.id);
      this.scoreSpan.innerHTML = player[0].score;
      this.highScoreSpan.innerHTML = gameState.highScore;
      this.playerSpan.innerHTML = gameState.numPlayers;
    }
    checkLife(gameState) {
      var player = gameState.players.filter(p => p.id === this.id);
      return player.length === 0 ? false : true;
    }
    sendAction(e) {
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
      socket.emit('player-movement', action);
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
  var clientId;
  var gameHandler;
  var socket = io();
  socket.on('client-id', function(id) {
    if (!clientId) {
      clientId = id;
      gameHandler = new GameHandler(clientId);
    }
  });
  socket.on('state-change', function(newState) {
    if (gameHandler.checkLife(newState)) {
      gameHandler.putStats(newState);
      gameHandler.drawState(newState);
    }
    else {
      alert('You have died. Reload to replay');
    }
  });
}
