window.onload = function() {
  // Canvas element and context
  var canvas = document.getElementById('game-canvas');
  var context = canvas.getContext('2d');
  var start = false;
  var gameLoop;
  // Constants
  const FEED_COLOR = '#ff0000';
  const PLAYER_COLOR = '#0000ff';
  const BLOCK_WIDTH = 5;
  const BLOCK_HEIGHT = 5;
  // Generates random position for blocks
  const genRandomPosition = () => {
    var x = Math.floor(Math.random() * (canvas.width - 5));
    var y = Math.floor(Math.random() * (canvas.height - 5));
    return [x, y];
  };
  const handleKey = (e) => {
    var key = e.keyCode;
    // keycode values for arrow keys
    var directions = [37, 38, 39, 40];
    if (directions.indexOf(key) > -1) {
      if (!start) {
        start = true;
        gameLoop = setInterval(updatePlayerPos(playerPos, key), 15);
      }
      else {
        gameLoop = setInterval(updatePlayerPos(playerPos, key), 15);
      }
    }
  };
  const updatePlayerPos = (playerPos, direction) => {
    switch(direction) {
      case 38:
        playerPos[1] -= 2;
        break;
      case 40:
        playerPos[1] += 2;
        break;
      case 37:
        playerPos[0] -= 2;
        break;
      case 39:
        playerPos[0] += 2;
        break;
    }
    context.fillStyle = PLAYER_COLOR;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(playerPos[0], playerPos[1], BLOCK_WIDTH, BLOCK_HEIGHT);
  };
  // Draw feed block
  var feedPos = genRandomPosition();
  context.fillStyle = FEED_COLOR;
  context.fillRect(feedPos[0], feedPos[1], BLOCK_WIDTH, BLOCK_HEIGHT);
  // Draw player block
  var playerPos = genRandomPosition();
  context.fillStyle = PLAYER_COLOR;
  context.fillRect(playerPos[0], playerPos[1], BLOCK_WIDTH, BLOCK_HEIGHT);
  // Add keypress event
  window.addEventListener('keydown', handleKey, false);
}
