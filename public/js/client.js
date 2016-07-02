'use strict';
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
      this.deathPrompt = document.getElementById('death-prompt');
      this.replayButton = document.getElementById('replay');
      document.body.addEventListener('keydown', this.sendAction);
      this.replayButton.addEventListener('click', this.reloadPage);
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
    drawState(gameState) {
      // Clear old state
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // Draw food
      this.context.fillStyle = '#ff0000';
      var food = gameState.foodCoords;
      this.context.fillRect(food[0], food[1], this.boxWidth, this.boxHeight);
      // Draw players
      var players = gameState.players;
      for (var p = 0; p < players.length; p++) {
        this.context.fillStyle = players[p].color;
        this.context.fillRect(players[p].coords[0], players[p].coords[1], this.boxWidth, this.boxHeight);
      }
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
    reloadPage(e) {
      location.reload();
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
    }
    else {
      gameHandler.deathPrompt.style.display = 'block';
    }
    gameHandler.drawState(newState);
  });
}
