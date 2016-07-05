'use strict';
module.exports = class SnakeActions {
  constructor() {
    // Game state object contains players, coordinates of food, and high score as attributes.
    this.gameState = {
        players: [],
        foodCoords: [],
        highScore: 0,
        numPlayers: 0
    }
    // Constant values for grid and block size
    this.gridWidth = 1080;
    this.gridHeight = 540;
    this.blockSize = 15;
  }
  genRandomCoord(limit) {
    return Math.floor(
      Math.ceil(
        (Math.random() * (limit - this.blockSize)) / this.blockSize
      ) * this.blockSize
    );
  }
  addPlayer(id) {
    var x = this.genRandomCoord(this.gridWidth);
    var y = this.genRandomCoord(this.gridHeight);
    this.gameState.players.push({
      id: id,
      blocks: [[x, y]],
      score: 0,
      direction: false,
      color: this.genRandomColor()
    });
    this.gameState.numPlayers = this.gameState.players.length;
  }
  genRandomColor() {
    var chars = 'ABCDEF0123456789';
    var unique = false;
    var hex;
    while (!unique) {
      hex = '#';
      for (var c = 0; c < 6; c++) {
        hex += chars[Math.floor(Math.random() * chars.length)];
      }
      // Check if color already exists among players
      var colorPlayer = this.gameState.players.filter(p => p.color === hex);
      if (colorPlayer.length === 0) {
        unique = true
      }
    }
    return hex;
  }
  removePlayer(id) {
    var players = this.gameState.players;
    this.gameState.players = players.filter(p => p.id !== id);
    this.gameState.numPlayers = this.gameState.players.length;
  }
  addFood() {
    var x = this.genRandomCoord(this.gridWidth);
    var y = this.genRandomCoord(this.gridHeight);
    this.gameState.foodCoords = [x, y];
  }
  updatePlayerDirection(id, action) {
    var players = this.gameState.players;
    this.gameState.players = players.map(p => {
      if (p.id == id) {
        p.direction = action;
      }
      return p;
    });
  }
  updatePositions() {
    this.gameState.players.map(p => {
      switch (p.direction) {
        case 'UP':
          p.blocks[0][1] -= this.blockSize;
          break;
        case 'DOWN':
          p.blocks[0][1] += this.blockSize;
          break;
        case 'LEFT':
          p.blocks[0][0] -= this.blockSize;
          break;
        case 'RIGHT':
          p.blocks[0][0] += this.blockSize;
          break;
      }
      return p;
    });
    this.checkCollision();
    this.checkConsumption();
  }
  checkCollision() {
    var casualties = [];
    this.gameState.players.map(p => {
      var x = p.blocks[0][0];
      var y = p.blocks[0][1];
      var players = this.gameState.players;
      var horBounds = (this.gridWidth - this.blockSize);
      var verBounds = (this.gridHeight - this.blockSize);
      // Check if the player has hit a wall
      if ((x > horBounds || x < 0) ||
        y > verBounds || y < 0) {
        casualties.push(p.id);
        return p;
      }
      // Check if a player has collided with themselves
      for (var b = 1; b < p.blocks.length; b++) {
        if (x === p.blocks[b][0] && y === p.blocks[b][1]) {
          casualties.push(p.id);
          return p;
        }
      }
      // Check if a player has collided with another player
      for (var l = 0; l < players.length; l++) {
        if (players[l].id !== p.id) {
          for (var o = 0; o < players[l].blocks.length; o++) {
            if (x === players[l].blocks[o][0] && y === players[l].blocks[o][1]) {
              casualties.push(p.id);
              return p;
            }
          }
        }
      }
      return p;
    });
    casualties.map(id => this.removePlayer(id));
  }
  checkConsumption() {
    var foodCoords = this.gameState.foodCoords;
    var consumed = false;
    this.gameState.players.map(p => {
      var x = p.blocks[0][0];
      var y = p.blocks[0][1];
      if (x === foodCoords[0] && y === foodCoords[1]) {
        // Add new block
        var tail = [x, y];
        p.blocks.push([p.blocks[0][0], p.blocks[0][1]]);
        // Increment score, set consumed to true
        p.score++;
        // Update high score
        if (p.score > this.gameState.highScore) {
          this.gameState.highScore = p.score;
        }
        consumed = true;
      }
      else {
        var tail = p.blocks.pop();
        tail[0] = x;
        tail[1] = y;
      }
      p.blocks.unshift(tail);
      return p;
    });
    if (consumed) {
      this.addFood();
    }
  }
}
