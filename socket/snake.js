'use strict';
module.exports = class SnakeActions {
  constructor() {
    // Game state object contains players, coordinates of food, and the number of players as attributes.
    this.gameState = {
        players: [],
        foodCoords: [],
        numPlayers: 0
      }
      // Constant values for grid and block size
    this.gridWidth = 1080;
    this.gridHeight = 540;
    this.blockSize = 15;
  }
  addFood() {
    // There must be at least four pieces of food in play at a time
    var foods = this.gameState.foodCoords;
    var neededFood = 0, required = 4;
    if (foods.length < required) {
      neededFood = (required - foods.length);
    }
    for (var f = 0; f < neededFood; f++) {
      var coords = this.genRandomCoords([this.gridWidth, this.gridHeight]);
      this.gameState.foodCoords.push({
        coords: coords
      });
    }
  }
  addPlayer(id) {
    var coords = this.genRandomCoords([this.gridWidth, this.gridHeight]);
    this.gameState.players.push({
      id: id,
      blocks: [coords],
      sLength: 1,
      direction: false,
      color: this.genRandomColor()
    });
    this.gameState.numPlayers = this.gameState.players.length;
  }
  removePlayer(deathObj) {
    var players = this.gameState.players;
    var deadPlayer = players.filter(p => p.id === deathObj.id)[0];
    this.gameState.players = players.filter(p => p.id !== deathObj.id);
    this.gameState.numPlayers = this.gameState.players.length;
    // If the player was killed, add food in their wake
    if (deathObj.kill) {
      // For every other block, add food at that coordinate
      for (var b = 1; b < deadPlayer.blocks.length; b += 2) {
        var block = deadPlayer.blocks[b];
        this.gameState.foodCoords.push({
          coords: [block[0], block[1]],
        });
      }
    }
  }
  genRandomCoords(limits) {
    var noConflict = false;
    var x, y;
    const randCoord = (bound) => {
      return Math.floor(
        Math.ceil(
          (Math.random() * (bound - this.blockSize)) / this.blockSize
        ) * this.blockSize
      );
    };
    while (!noConflict) {
      var conflicts = 0;
      x = randCoord(limits[0]);
      y = randCoord(limits[1]);
      // Make sure coordinates aren't where food or another player is
      var players = this.gameState.players;
      var foodCoords = this.gameState.foodCoords;
      for (var f = 0; f < foodCoords.length; f++) {
        var coords = foodCoords[f].coords;
        if (x === coords[0] && y === coords[1]) {
          conflicts++;
        }
      }
      for (var p = 0; p < players.length; p++) {
        for (var b = 0; b < players[p].blocks.length; b++) {
          var block = players[p].blocks[b];
          if (x === block[0] && y === block[1]) {
            conflicts++;
          }
        }
      }
      if (conflicts === 0) {
        noConflict = true;
      }
    }
    return [x, y];
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
    this.addFood();
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
        casualties.push({
          id: p.id,
          kill: true,
        });
        return p;
      }
      // Check if a player has collided with themselves
      for (var b = 1; b < p.blocks.length; b++) {
        if (x === p.blocks[b][0] && y === p.blocks[b][1]) {
          casualties.push({
            id: p.id,
            kill: true
          });
          return p;
        }
      }
      // Check if a player has collided with another player
      for (var l = 0; l < players.length; l++) {
        if (players[l].id !== p.id) {
          for (var o = 0; o < players[l].blocks.length; o++) {
            if (x === players[l].blocks[o][0] && y === players[l].blocks[o][1]) {
              casualties.push({
                id: p.id,
                kill: true
              });
              return p;
            }
          }
        }
      }
      return p;
    });
    casualties.map(deathObj => this.removePlayer(deathObj));
  }
  checkConsumption() {
    var foodCoords = this.gameState.foodCoords;
    this.gameState.players.map(p => {
      var x = p.blocks[0][0];
      var y = p.blocks[0][1];
      var selfConsumed = false;
      var foodCoords = this.gameState.foodCoords;
      for (var f = 0; f < foodCoords.length; f++) {
        var coords = foodCoords[f].coords;
        if (x === coords[0] && y === coords[1]) {
          // Remove food from foods
          foodCoords.splice(f, 1);
          selfConsumed = true;
          break;
        }
      }
      if (selfConsumed) {
        // Add new block
        var tail = [x, y];
        // If our length is 1, push a block to the array so we have something to pop off
        if (p.sLength === 1) {
          p.blocks.push([p.blocks[0][0], p.blocks[0][1]]);
        }
        // Increment sLength
        p.sLength++;
      } else {
        var tail = p.blocks.pop();
        tail[0] = x;
        tail[1] = y;
      }
      p.blocks.unshift(tail);
      return p;
    });
  }
}
