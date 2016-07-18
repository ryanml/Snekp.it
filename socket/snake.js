'use strict';
module.exports = class SnakeActions {
  constructor() {
    // Game state object contains players, coordinates of food, and the number of players as attributes.
    this.gameState = {
        players: [],
        leaders: [],
        foodCoords: [],
        shieldCoords: [],
        numPlayers: 0
      }
    // gridSize
    this.gridSize = 100;
    // When a player picks up a shield, they will be immune for 133 state changes.
    // This is about 10 seconds. This can be stacked with multiple shields.
    this.immuneTime = 133;
  }
  addItems() {
    // There must be at least 1000 pieces of food in play at a time
    var foods = this.gameState.foodCoords;
    var neededFood = 0, required = 175;
    // There must be at least 40 shields in play at a time
    var shields = this.gameState.shieldCoords;
    var neededShields = 0, requiredShields = 8;
    if (foods.length < required) {
      neededFood = (required - foods.length);
    }
    if (shields.length < requiredShields) {
      neededShields = (requiredShields - shields.length);
    }
    for (var f = 0; f < neededFood; f++) {
      var coords = this.genRandomCoords();
      this.gameState.foodCoords.push({
        coords: coords
      });
    }
    for (var s = 0; s < neededShields; s++) {
      var coords = this.genRandomCoords();
      this.gameState.shieldCoords.push({
        coords: coords
      });
    }
  }
  addPlayer(nick, id) {
    var coords = this.genRandomCoords();
    this.gameState.players.push({
      id: id,
      nick: nick,
      blocks: [coords],
      sLength: 1,
      immunity: 0,
      direction: false,
      color: this.genRandomColor()
    });
    this.gameState.numPlayers = this.gameState.players.length;
  }
  calcLeaders() {
    // Get array of objects with players' lengths and id
    var players = this.gameState.players.map(p => {
      return {
        nick: p.nick,
        score: p.sLength,
        color: p.color
      };
    });
    // Sort the player objects by score
    var leaders = players.sort((c, p) => {
      return c.score - p.score;
    }).reverse();
    // We would only like at most, 5 leaders at a time.
    var sliceIndex = leaders.length >= 5 ? 5 : leaders.length;
    this.gameState.leaders = leaders.slice(0, sliceIndex);
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
  genRandomCoords() {
    var x, y;
    var noConflict = false;
    const randCoord = () => {
      return Math.floor(Math.random() * (this.gridSize - 1));
    };
    while (!noConflict) {
      var conflicts = 0;
      x = randCoord();
      y = randCoord();
      // Make sure coordinates don't conflict with items or another player
      var players = this.gameState.players;
      var foodCoords = this.gameState.foodCoords;
      var shieldCoords = this.gameState.shieldCoords;
      for (var f = 0; f < foodCoords.length; f++) {
        var coords = foodCoords[f].coords;
        if (x === coords[0] && y === coords[1]) {
          conflicts++;
        }
      }
      for (var s = 0; s < shieldCoords.length; s++) {
        var coords = shieldCoords[s].coords;
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
          p.blocks[0][1] -= 1;
          break;
        case 'DOWN':
          p.blocks[0][1] += 1;
          break;
        case 'LEFT':
          p.blocks[0][0] -= 1;
          break;
        case 'RIGHT':
          p.blocks[0][0] += 1;
          break;
      }
      return p;
    });
    this.checkCollision();
    this.checkConsumption();
    this.addItems();
    this.calcLeaders();
  }
  checkCollision() {
    var casualties = [];
    this.gameState.players.map(p => {
      var x = p.blocks[0][0];
      var y = p.blocks[0][1];
      var players = this.gameState.players;
      var bounds = (this.gridSize - 1);
      // Check if the player has hit a wall
      if ((x > bounds || x < 0) ||
        y > bounds || y < 0) {
        casualties.push({
          id: p.id,
          kill: true,
        });
        return p;
      }
      // Check if a player has collided with themselves
      if (p.immunity === 0) {
        for (var b = 1; b < p.blocks.length; b++) {
          if (x === p.blocks[b][0] && y === p.blocks[b][1]) {
            casualties.push({
              id: p.id,
              kill: true
            });
            return p;
          }
        }
      }
      // Check if a player has collided with another player
      if (p.immunity === 0) {
        for (var l = 0; l < players.length; l++) {
          if (players[l].id !== p.id) {
            for (var o = 0; o < players[l].blocks.length; o++) {
              if (x === players[l].blocks[o][0] && y === players[l].blocks[o][1]) {
                // Add 10 to the other players score
                players[l].sLength += 10;
                // Push the colliding player to the casualties list
                casualties.push({
                  id: p.id,
                  kill: true
                });
                return p;
              }
            }
          }
        }
      }
      // If player immunity is greater than 0, remove one cycle from it
      if (p.immunity > 0) {
        p.immunity--;
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
      var shieldCoords = this.gameState.shieldCoords;
      // Check if the player has eaten food
      for (var f = 0; f < foodCoords.length; f++) {
        var coords = foodCoords[f].coords;
        if (x === coords[0] && y === coords[1]) {
          // Remove food from foods
          foodCoords.splice(f, 1);
          selfConsumed = true;
          break;
        }
      }
      // Check if the player has picked up a shield
      for (var s = 0; s < shieldCoords.length; s++) {
        var coords = shieldCoords[s].coords;
        if (x === coords[0] && y === coords[1]) {
          // Add immune time to player
          p.immunity += this.immuneTime;
          // Remove shield
          shieldCoords.splice(s, 1);
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
