module.exports = class SnakeActions {
  constructor() {
    // Game state object contains players, coordinates of food, and high score as attributes.
    this.gameState = {
      players: [],
      foodCoords: [],
      highScore: 0
    }
    // Constant values for grid and block size
    this.gridWidth = 1050;
    this.gridHeight = 750;
    this.blockSize = 30;
    // Function generates a random block coordinate within grid bounds
    this.genRandomCoord = (limit) => {
      return Math.floor(
        Math.ceil(
          (Math.random() * (limit - this.blockSize)) / this.blockSize
        ) * this.blockSize
      );
    };
    // Adds new food
    this.addFood = () => {
      var x = this.genRandomCoord(this.gridWidth);
      var y = this.genRandomCoord(this.gridHeight);
      this.gameState.foodCoords = [x, y];
    };
  }
  // Pushes a new player object to gamestate
  addPlayer(id) {
    var x = this.genRandomCoord(this.gridWidth);
    var y = this.genRandomCoord(this.gridHeight);
    this.gameState.players.push({
      id: id,
      coords: [x, y],
      score: 0,
      direction: false
    });
  }
  // Removes player object from gamestate
  removePlayer(id) {
    var players = this.gameState.players;
    this.gameState.players = players.filter(p => p.id !== id);
  }
  // Updates the direction attribute for a player object
  updatePlayerDirection(id, action) {
    var players = this.gameState.players;
    this.gameState.players = players.map(p => {
      if (p.id == id) {
        p.direction = action;
      }
      return p;
    });
  }
  // Given each player object's direction, updates coordinates appropriately
  updateGame() {
    var foodCoords = this.gameState.foodCoords;
    var consumed = false;
    var collision = false;
    this.gameState.players.map(p => {
      switch (p.direction) {
        case 'UP':
          p.coords[1] -= 30;
          break;
        case 'DOWN':
          p.coords[1] += 30;
          break;
        case 'LEFT':
          p.coords[0] -= 30;
          break;
        case 'RIGHT':
          p.coords[0] += 30;
          break;
      }
      return p;
    });
    this.gameState.players.map(p => {
      if (p.coords[0] === foodCoords[0] &&
          p.coords[1] === foodCoords[1]) {
        // Increment score, set consumed to true
        p.score += 1;
        consumed = true;
      }
      return p;
    });
    if (consumed) {
      this.addFood();
    }
  }
}
