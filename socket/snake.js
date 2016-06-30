module.exports = class SnakeLogic {
  // Creates blank game state object
  constructor() {
    this.gameState = {
      players: [],
      foodCoords: []
    }
    this.gridWidth = 895;
    this.gridHeight = 495;
  }
  addNewFood() {
      var x = Math.floor(Math.random() * this.gridWidth);
      var y = Math.floor(Math.random() * this.gridHeight);
      this.gameState.foodCoords = [x, y];
    }
    // Pushes starting coordinates for new player to gamestat
  addPlayer(id) {
    var x = Math.floor(Math.random() * this.gridWidth);
    var y = Math.floor(Math.random() * this.gridHeight);
    this.gameState.players.push({
      id: id,
      coords: [x, y]
    });
  }
  removePlayer(id) {
    var players = this.gameState.players;
    this.gameState.players = players.filter(p => p.id !== id);
  }
  updatePlayerPos(action, id) {
    this.gameState.players.map(p => {
      if (p.id === id) {
        switch (action) {
          case 'UP':
            p.coords[1] -= 3;
            break;
          case 'DOWN':
            p.coords[1] += 3;
            break;
          case 'LEFT':
            p.coords[0] -= 3;
            break;
          case 'RIGHT':
            p.coords[0] += 3;
            break;
        }
      }
      return p;
    });
  }
}
