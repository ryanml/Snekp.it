'use strict';
window.onload = function() {
  class GameHandler {
    constructor(id) {
      this.id = id;
      this.viewportX;
      this.viewportY;
      this.headX;
      this.headY;
      this.gridWidth;
      this.gridHeight;
      this.gridSize = 500;
      this.blockSize = 20;
      this.action = false;
      this.gameState = {};
      this.domActions();
    }
    updateGameState(newState) {
      this.gameState = newState;
    }
    checkLife() {
      var player = this.gameState.players.filter(p => p.id === this.id);
      return player.length === 0 ? false : true;
    }
    getScore() {
      var player = this.gameState.players.filter(p => p.id === this.id);
      return player[0].sLength;
    }
    setCellDimensions() {
      var width = 0, height = 0;
      for (var w = 0; w < this.canvas.width; w += this.blockSize) {
        width++;
      }
      for (var h = 0; h < this.canvas.height; h += this.blockSize) {
        height++;
      }
      // Width and height of grid in cells
      this.gridWidth = width;
      this.gridHeight = height;
    }
    calculateViewport() {
      // Get the position of the player's head block
      var player = this.gameState.players.filter(p => p.id === this.id)[0];
      this.headX = player.blocks[0][0], this.headY = player.blocks[0][1];
      // Get offset from end of the grid for both x and y
      this.viewportX = [this.headX - (this.gridWidth / 2), (this.headX + this.gridWidth)];
      this.viewportY = [this.headY - (this.gridHeight / 2), (this.headY + this.gridHeight)];
    }
    drawState() {
      // Helper functions
      const calc = (num) => {
        return num * this.blockSize;
      };
      const checkViewBounds = (coords) => {
        if ((coords[0] >= this.viewportX[0] && coords[0] <= this.viewportX[1]) &&
            (coords[1] >= this.viewportY[0] && coords[1] <= this.viewportY[1])) {
          return true;
        } else {
          return false;
        }
      };
      // Clear old state
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // Draw background grid
      for (var w = 0; w < this.canvas.width; w += 35) {
        for (var h = 0; h < this.canvas.height; h += 35) {
          this.context.strokeRect(w, h, 35, 35);
        }
      }
      // Draw food particles
      var foodCoords = this.gameState.foodCoords;
      for (var f = 0; f < foodCoords.length; f++) {
        var coords = foodCoords[f].coords;
        if (checkViewBounds(coords)) {
          this.context.drawImage(this.foodImage, calc(coords[0] - this.viewportX[0]), calc(coords[1] - this.viewportY[0]));
        }
      }
      // Draw shields
      var shieldCoords = this.gameState.shieldCoords;
      for (var s = 0; s < shieldCoords.length; s++) {
        var coords = shieldCoords[s].coords;
        if (checkViewBounds(coords)) {
          this.context.drawImage(this.shieldImage, calc(coords[0] - this.viewportX[0]), calc(coords[1] - this.viewportY[0]));
        }
      }
      // Draw player blocks
      var players = this.gameState.players;
      for (var p = 0; p < players.length; p++) {
        this.context.fillStyle = players[p].color;
        for (var b = 0; b < players[p].blocks.length; b++) {
          var blocks = players[p].blocks;
          if (checkViewBounds(blocks[b])) {
            // If the player is immune, draw a yellow border around them
            if (players[p].immunity > 0) {
              this.context.strokeStyle = '#ffff00';
            }
            this.context.strokeRect(calc(blocks[b][0] - this.viewportX[0]), calc(blocks[b][1] - this.viewportY[0]), this.blockSize, this.blockSize);
            this.context.fillRect(calc(blocks[b][0] - this.viewportX[0]), calc(blocks[b][1] - this.viewportY[0]), this.blockSize, this.blockSize);
            this.context.strokeStyle = '#d3d3d3';
          }
        }
      }
      // Set box attributes
      this.context.globalAlpha = 0.8;
      this.context.fillStyle = '#5A5A5A';
      this.context.font = '20px monospace';
      // Draw leaderboard box
      this.context.fillRect(this.canvas.width - 170, 10, 160, 260);
      // Draw stats box
      this.context.fillRect(10, this.canvas.height - 50, 285, 30);
      // Draw placeholder leaderboard
      this.context.fillStyle = '#ffffff';
      this.context.fillText('Leaderboard', this.canvas.width - 160, 30);
      this.context.fillText('1.', this.canvas.width - 160, 70);
      this.context.fillText('2.', this.canvas.width - 160, 100);
      this.context.fillText('3.', this.canvas.width - 160, 130);
      this.context.fillText('4.', this.canvas.width - 160, 160);
      this.context.fillText('5.', this.canvas.width - 160, 190);
      // Draw score and position
      this.context.font = '15px monospace';
      var scoreString = 'Score: ' + score;
      var posString = 'Position: (' + this.headX + ',' + this.headY +')';
      this.context.fillText(scoreString, 20, this.canvas.height - 30);
      this.context.fillText(posString, 120, this.canvas.height - 30);
      // Reset opacity and fillstyle
      this.context.globalAlpha = 1.0;
      this.context.fillStyle = '#d3d3d3';
    }
    sendAction(e) {
      var key = e.keyCode;
      switch (key) {
        case 37:
          if (this.action !== 'RIGHT' || score === 0) {
            this.action = 'LEFT';
          }
          break;
        case 38:
          if (this.action !== 'DOWN' || score === 0) {
            this.action = 'UP';
          }
          break;
        case 39:
          if (this.action !== 'LEFT' || score === 0) {
            this.action = 'RIGHT';
          }
          break;
        case 40:
          if (this.action !== 'UP' || score === 0) {
            this.action = 'DOWN';
          }
          break;
      }
      if (this.action) {
        socket.emit('player-movement', this.action);
      }
    }
    domActions() {
      this.foodImage = document.createElement('img');
      this.foodImage.src = '/img/food.png';
      this.shieldImage = document.createElement('img');
      this.shieldImage.src = '/img/health.png';
      this.canvas = document.getElementById('game-canvas');
      this.context = this.canvas.getContext('2d');
      this.context.strokeStyle = '#d3d3d3';
      document.body.addEventListener('keydown', this.sendAction);
    }
    reloadPage() {
      location.reload();
    }
  }
  var score,
      clientId,
      gameHandler,
      headPosition;
  var socket = io();
  var canvas = document.getElementById('game-canvas');
  // Adjust on resize
  window.onresize = () => {
    var width = (window.innerWidth);
    var height = (window.innerHeight);
    canvas.width = width;
    canvas.height = height;
  };
  // Determine proper width/height for canvas
  var width = (window.innerWidth);
  var height = (window.innerHeight);
  canvas.width = width;
  canvas.height = height;
  // Get player's client id
  socket.on('client-id', function(id) {
    if (!clientId) {
      clientId = id;
      gameHandler = new GameHandler(clientId);
    }
  });
  // Action on state change
  socket.on('state-change', function(newState) {
    gameHandler.setCellDimensions();
    gameHandler.updateGameState(newState);
    if (gameHandler.checkLife()) {
      score = gameHandler.getScore();
      gameHandler.calculateViewport();
    }
    gameHandler.drawState();
  });
}
