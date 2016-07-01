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
      coords: [x, y],
      score: 0,
      direction: false
    });
  }
  removePlayer(id) {
    var players = this.gameState.players;
    this.gameState.players = players.filter(p => p.id !== id);
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
          p.coords[1] -= this.blockSize;
          break;
        case 'DOWN':
          p.coords[1] += this.blockSize;
          break;
        case 'LEFT':
          p.coords[0] -= this.blockSize;
          break;
        case 'RIGHT':
          p.coords[0] += this.blockSize;
          break;
      }
      return p;
    });
    this.checkBounds();
    this.checkConsumption();
  }
  checkBounds() {
    var casualties = [];
    this.gameState.players.map(p => {
      var x = p.coords[0];
      var y = p.coords[1];
      if ((x > this.gridWidth || x < 0) ||
        y > this.gridHeight || y < 0) {
        casualties.push(p.id);
      }
      return p;
    });
    casualties.map(id => this.removePlayer(id));
  }
  checkConsumption() {
    var foodCoords = this.gameState.foodCoords;
    var consumed = false;
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
