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
      const drawBounds = (x, y) => {
        var gS = this.gridSize;
        var gW = this.gridWidth, gH = this.gridHeight;
        var vX = this.viewportX[0], vY = this.viewportY[0];
        if (x < gS) {
          for (var fy = ((gH / 2) * -1); fy < gH; fy++) {
            for (var i = 0; i < (gW / 2); i++) {
              this.context.fillRect(calc((x - ((x + 1) + i)) - vX), calc((y - vY) + fy), this.blockSize, this.blockSize);
            }
          }
        }
        if ((gS - x) < gW) {
          for (var fy = ((gH / 2) * -1); fy < gH; fy++) {
            for (var i = 0; i < (gW / 2); i++) {
              this.context.fillRect(calc(((gS - x) + (gW / 2)) + i), calc((y - vY) + fy), this.blockSize, this.blockSize);
            }
          }
        }
        if (y < gW) {
          for (var fx = ((gW / 2) * -1); fx < gW; fx++) {
            for (var i = 1; i < (gW / 2); i++) {
              this.context.fillRect(calc((x - vX) + fx), calc((y - (y + i)) - vY), this.blockSize, this.blockSize);
            }
          }
        }
        if ((gS - y) < gH) {
          for (var fx = ((gW / 2) * -1); fx < gW; fx++) {
            for (var i = 0; i < (gW / 2); i++) {
              this.context.fillRect(calc((x - vX) + fx), calc(((gS - y) + (gH / 2)) + i), this.blockSize, this.blockSize);
            }
          }
        }
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
      for (var w = 0; w < this.canvas.width; w += this.blockSize) {
        for (var h = 0; h < this.canvas.height; h += this.blockSize) {
          this.context.strokeRect(w, h, this.blockSize, this.blockSize);
        }
      }
      // Draw bound lines
      this.context.fillStyle = '#ffffff';
      drawBounds(this.headX, this.headY);
      this.context.fillStyle = '#d3d3d3';
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
        for (var b = 0; b < players[p].blocks.length; b++) {
          var blocks = players[p].blocks;
          if (checkViewBounds(blocks[b])) {
            this.context.fillStyle = players[p].color;
            this.context.strokeRect(calc(blocks[b][0] - this.viewportX[0]), calc(blocks[b][1] - this.viewportY[0]), this.blockSize, this.blockSize);
            // If the player is immune, use the rainbow immune image for the blocks
            if (players[p].immunity > 0) {
              this.context.drawImage(this.immuneImage, calc(blocks[b][0] - this.viewportX[0]), calc(blocks[b][1] - this.viewportY[0]));
            } else {
              this.context.fillRect(calc(blocks[b][0] - this.viewportX[0]), calc(blocks[b][1] - this.viewportY[0]), this.blockSize, this.blockSize);
            }
            // Draw the nickname under the head
            if (b === players[p].blocks.length - 1) {
              this.context.fillStyle = '#000000';
              this.context.fillText(players[p].id, calc(blocks[0][0] - this.viewportX[0]) - 20, calc(blocks[0][1] - this.viewportY[0]) + 35);
            }
            this.context.strokeStyle = '#d3d3d3';
          }
        }
      }
      // Call stat boxes
      this.drawStatBoxes();
    }
    drawStatBoxes() {
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
      this.context.fillText('Leaderboard', this.canvas.width - 155, 30);
      // Draw leaders
      var leaders = this.gameState.leaders;
      var x = this.canvas.width - 155, y = 70, yInc = 30;
      for (var l = 0; l < leaders.length; l++) {
        var pos = l + 1;
        this.context.fillStyle = leaders[l].color;
        var leadString = pos + '. ' + leaders[l].id;
        this.context.fillText(leadString, x, y);
        y += yInc;
      }
      // Draw score and position
      this.context.fillStyle = '#ffffff';
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
          if (this.action !== 'RIGHT' || score === 1) {
            this.action = 'LEFT';
          }
          break;
        case 38:
          if (this.action !== 'DOWN' || score === 1) {
            this.action = 'UP';
          }
          break;
        case 39:
          if (this.action !== 'LEFT' || score === 1) {
            this.action = 'RIGHT';
          }
          break;
        case 40:
          if (this.action !== 'UP' || score === 1) {
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
      this.shieldImage.src = '/img/shield.png';
      this.immuneImage = document.createElement('img');
      this.immuneImage.src = '/img/immune.jpg';
      this.canvas = document.getElementById('game-canvas');
      this.context = this.canvas.getContext('2d');
      this.context.strokeStyle = '#d3d3d3';
      this.replayDiv = document.getElementById('replay-div');
      this.replayButton = document.getElementById('replay');
      this.replayButton.addEventListener('click', this.reloadPage);
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
    } else {
      console.log(gameHandler.replayDiv);
      gameHandler.replayDiv.style.display = 'block';
    }
    gameHandler.drawState();
  });
}
