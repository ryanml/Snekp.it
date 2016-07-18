window.onload = function() {
  'use strict';
  // Need variables
  var gameState;
  var socket = io();
  var gridSize = 100;
  var blockSize = 20;
  var isPlay = false;
  var viewportX, viewportY;
  var playerHeadX, playerHeadY;
  var widthInCells, heightInCells;
  var playerId, playerNick, playerScore, playerAction;
  // Needed dom elements
  var body = document.body;
  var canvas = document.getElementById('game-canvas');
  var context = canvas.getContext('2d');
  var joinDiv = document.getElementById('join-div');
  var joinTitle = document.getElementById('join-message');
  var joinButton = document.getElementById('join');
  var nickField = document.getElementById('user-nick');
  // Create image elements
  var foodImage = document.createElement('img');
  foodImage.src = '/img/food.png';
  var shieldImage = document.createElement('img');
  shieldImage.src = '/img/shield.png';
  var immuneImage = document.createElement('img');
  immuneImage.src = '/img/immune.jpg';
  // Set canvas width
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Canvas attributes
  canvas.setAttribute("tabindex", 0);
  joinTitle.innerHTML = 'Snekp.it';
  // Add listener to readjust width and height on resize
  window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  // Socket actions
  // Get player's client id
  socket.on('id', function(id) {
    if (!playerId) {
      playerId = id;
    }
  });
  socket.on('received-nick', function() {
    isPlay = true;
    joinDiv.style.display = 'none';
  });
  // Accept state change from socket
  socket.on('state-change', function(newState) {
    handleStateChange(newState);
  });
  // Calls appropriate functions to handle state change
  const handleStateChange = (newState) => {
    if (isPlay) {
      gameState = newState;
      setCellDimensions();
      if (checkLife()) {
        setPlayerScore();
        setPlayerPos();
        calculateViewport();
      } else {
        promptDeath();
      }
      drawState();
    }
  };
  // Sets the grid width and height in cells given the size
  const setCellDimensions = () => {
    var width = 0, height = 0;
    for (var w = 0; w < canvas.width; w += blockSize) {
      width++;
    }
    for (var h = 0; h < canvas.height; h += blockSize) {
      height++;
    }
    widthInCells = width;
    heightInCells = height;
  };
  // Checks if player is alive
  const checkLife = () => {
    var player = gameState.players.filter(p => p.id === playerId);
    return player.length === 0 ? false : true;
  };
    // Sets the player score
  const setPlayerScore = () => {
    var player = gameState.players.filter(p => p.id === playerId);
    playerScore = player[0].sLength;
  };
  // Sets the player position
  const setPlayerPos = () => {
    var player = gameState.players.filter(p => p.id === playerId)[0];
    playerHeadX = player.blocks[0][0], playerHeadY = player.blocks[0][1];
  };
  // Calculates the viewport to display
  const calculateViewport = () => {
    // Get offset from end of the grid for both x and y
    viewportX = [playerHeadX - (widthInCells / 2), (playerHeadX + widthInCells)];
    viewportY = [playerHeadY - (heightInCells / 2), (playerHeadY + heightInCells)];
  };
  // Quick function to multiply by blocksize
  const calc = (num) => {
    return num * blockSize;
  };
  // Draws bound areas around the grid
  const drawBounds = () => {
    var gS = gridSize;
    var x = playerHeadX, y = playerHeadY;
    var vX = viewportX[0], vY = viewportY[0];
    var gW = widthInCells, gH = heightInCells;
    context.strokeStyle = '#aaaaaa';
    if (x < gS) {
      for (var fy = ((gH / 2) * -1); fy < gH; fy++) {
        for (var i = 0; i < (gW / 2); i++) {
          context.strokeRect(calc((x - ((x + 1) + i)) - vX), calc((y - vY) + fy), blockSize, blockSize);
          context.fillRect(calc((x - ((x + 1) + i)) - vX), calc((y - vY) + fy), blockSize, blockSize);
        }
      }
    }
    if ((gS - x) < gW) {
      for (var fy = ((gH / 2) * -1); fy < gH; fy++) {
        for (var i = 0; i < (gW / 2); i++) {
          context.strokeRect(calc(((gS - x) + (gW / 2)) + i), calc((y - vY) + fy), blockSize, blockSize);
          context.fillRect(calc(((gS - x) + (gW / 2)) + i), calc((y - vY) + fy), blockSize, blockSize);
        }
      }
    }
    if (y < gH) {
      for (var fx = ((gW / 2) * -1); fx < gW; fx++) {
        for (var i = 1; i < (gW / 2); i++) {
          context.strokeRect(calc((x - vX) + fx), calc((y - (y + i)) - vY), blockSize, blockSize);
          context.fillRect(calc((x - vX) + fx), calc((y - (y + i)) - vY), blockSize, blockSize);
        }
      }
    }
    if ((gS - y) < gH) {
      for (var fx = ((gW / 2) * -1); fx < gW; fx++) {
        for (var i = 0; i < (gW / 2); i++) {
          context.strokeRect(calc((x - vX) + fx), calc(((gS - y) + (gH / 2)) + i), blockSize, blockSize);
          context.fillRect(calc((x - vX) + fx), calc(((gS - y) + (gH / 2)) + i), blockSize, blockSize);
        }
      }
    }
    context.strokeStyle = '#d3d3d3';
    context.fillStyle = '#ffffff';
  };
  // Checks if given coordinate is within viewport bounds
  const checkViewBounds = (coords) => {
    if ((coords[0] >= viewportX[0] && coords[0] <= viewportX[1]) && (coords[1] >= viewportY[0] && coords[1] <= viewportY[1])) {
      return true;
    } else {
      return false;
    }
  };
  // Draws player nick under head
  const drawPlayerNick = (nick, headX, headY) => {
    // Draw the nickname under the head
    context.fillStyle = '#000000';
    context.fillText(nick, calc(headX - viewportX[0]) - 20, calc(headY - viewportY[0]) + 35);
    context.strokeStyle = '#d3d3d3';
  };
  // Draw stat boxes
  const drawStatBoxes = () => {
    // Set box attributes
    context.globalAlpha = 0.8;
    context.fillStyle = '#5A5A5A';
    context.font = '20px monospace';
    // Draw leaderboard box
    context.fillRect(canvas.width - 190, 10, 180, 260);
    // Draw stats box
    context.fillRect(10, canvas.height - 50, 285, 30);
    // Draw placeholder leaderboard
    context.fillStyle = '#ffffff';
    context.fillText('Leaderboard', canvas.width - 170, 30);
    // Draw leaders
    var leaders = gameState.leaders;
    var x = canvas.width - 175,
      y = 70,
      yInc = 30;
    for (var l = 0; l < leaders.length; l++) {
      var pos = l + 1;
      var pNick = leaders[l].nick
      if (pNick.length > 10) {
        pNick = pNick.slice(0, 7) + '...';
      }
      var leadString = pos + '. ' + pNick;
      context.fillText(leadString, x, y);
      y += yInc;
    }
    // Draw score and position
    var scoreString = 'Score: ' + playerScore;
    var posString = 'Position: (' + playerHeadX + ',' + playerHeadY + ')';
    context.fillStyle = '#ffffff';
    context.font = '15px monospace';
    context.fillText(scoreString, 20, canvas.height - 30);
    context.fillText(posString, 120, canvas.height - 30);
    // Reset opacity and fillstyle
    context.globalAlpha = 1.0;
    context.fillStyle = '#d3d3d3';
  };
  // Draws all objects and players in the current state
  const drawState = () => {
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Call function to draw bound lines
    drawBounds();
    // Draw food particles
    var foodCoords = gameState.foodCoords;
    for (var f = 0; f < foodCoords.length; f++) {
      var coords = foodCoords[f].coords;
      if (checkViewBounds(coords)) {
        context.drawImage(foodImage, calc(coords[0] - viewportX[0]), calc(coords[1] - viewportY[0]));
      }
    }
    // Draw shields
    var shieldCoords = gameState.shieldCoords;
    for (var s = 0; s < shieldCoords.length; s++) {
      var coords = shieldCoords[s].coords;
      if (checkViewBounds(coords)) {
        context.drawImage(shieldImage, calc(coords[0] - viewportX[0]), calc(coords[1] - viewportY[0]));
      }
    }
    // Draw player blocks
    var players = gameState.players;
    for (var p = 0; p < players.length; p++) {
      for (var b = 0; b < players[p].blocks.length; b++) {
        var blocks = players[p].blocks;
        if (checkViewBounds(blocks[b])) {
          context.fillStyle = players[p].color;
          context.strokeRect(calc(blocks[b][0] - viewportX[0]), calc(blocks[b][1] - viewportY[0]), blockSize, blockSize);
          // If the player is immune, use the rainbow immune image for the blocks
          if (players[p].immunity > 0) {
            context.drawImage(immuneImage, calc(blocks[b][0] - viewportX[0]), calc(blocks[b][1] - viewportY[0]));
          } else {
            context.fillRect(calc(blocks[b][0] - viewportX[0]), calc(blocks[b][1] - viewportY[0]), blockSize, blockSize);
          }
        }
      }
      drawPlayerNick(players[p].nick, blocks[0][0], blocks[0][1]);
    }
    drawStatBoxes();
  };
  // Sends nickname to socket
  const sendNick = (e) => {
    var nick = nickField.value;
    if (!nick) {
      alert('You must enter a nickname.');
      return false;
    }
    socket.emit('nick', nick);
  };
  // Sends key action to the socket
  const sendAction = (e) => {
      var key = e.keyCode;
      switch (key) {
        case 37:
          if (playerAction !== 'RIGHT' || playerScore === 1) {
            playerAction = 'LEFT';
          }
          break;
        case 38:
          if (playerAction !== 'DOWN' || playerScore === 1) {
            playerAction = 'UP';
          }
          break;
        case 39:
          if (playerAction !== 'LEFT' || playerScore === 1) {
            playerAction = 'RIGHT';
          }
          break;
        case 40:
          if (playerAction !== 'UP' || playerScore === 1) {
            playerAction = 'DOWN';
          }
          break;
      }
      if (playerAction) {
        socket.emit('player-movement', playerAction);
      }
    }
    // Shows reload box
  const promptDeath = () => {
    joinTitle.innerHTML = 'You died :(';
    joinDiv.style.display = 'block';
  };
  // Add events
  body.addEventListener('keydown', sendAction);
  joinButton.addEventListener('click', sendNick);
}
