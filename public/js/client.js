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
  var userAgent = navigator.userAgent;
  var playerId, playerNick, playerScore, playerDir;
  // Check if user is a mobile device or tablet
  var mobileUsr = userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
  // Needed dom elements
  var body = document.body;
  var canvas = document.getElementById('game-canvas');
  var context = canvas.getContext('2d');
  var joinDiv = document.getElementById('join-div');
  var joinTitle = document.getElementById('join-message');
  var joinButton = document.getElementById('join');
  var nickField = document.getElementById('user-nick');
  // Create image elements
  var burgImage = document.createElement('img');
  burgImage.src = '/img/burger.png';
  var sushiImage = document.createElement('img');
  sushiImage.src = '/img/sushi.gif';
  var cakeImage = document.createElement('img');
  cakeImage.src = '/img/cake.png';
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
  window.onresize = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  // Socket actions
  // Get player's client id
  socket.on('id', function(id) {
    if (!playerId) {
      playerId = id;
    }
  });
  socket.on('received-nick', function(id) {
    if (playerId === id) {
      joinDiv.style.display = 'none';
    }
  });
  // Accept state change from socket
  socket.on('state-change', function(newState) {
    handleStateChange(newState);
  });
  // Calls appropriate functions to handle state change
  function handleStateChange(newState) {
    if (isPlay) {
      gameState = newState;
      setCellDimensions();
      if (setPlayerAtts()) {
        calculateViewport();
      } else {
        promptDeath();
      }
      drawState();
    }
  }
  // Sets the grid width and height in cells given the size
  function setCellDimensions() {
    var width = 0, height = 0;
    for (var w = 0; w < canvas.width; w += blockSize) {
      width++;
    }
    for (var h = 0; h < canvas.height; h += blockSize) {
      height++;
    }
    widthInCells = width;
    heightInCells = height;
  }
  // Sets player attributes, checks if player is alive.
  function setPlayerAtts() {
    var player = gameState.players.filter(function(p) {
      return p.id === playerId;
    });
    if (player.length === 0) {
      return false;
    }
    playerDir = player[0].direction;
    playerScore = player[0].score;
    playerHeadX = player[0].blocks[0][0], playerHeadY = player[0].blocks[0][1];
    return true;
  }
  // Calculates the viewport to display
  function calculateViewport() {
    // Get offset from end of the grid for both x and y
    viewportX = [playerHeadX - (widthInCells / 2), (playerHeadX + widthInCells)];
    viewportY = [playerHeadY - (heightInCells / 2), (playerHeadY + heightInCells)];
  }
  // Quick function to multiply by blocksize
  function calc(num) {
    return num * blockSize;
  }
  // Draws bound areas around the grid
  function drawBounds() {
    var gS = gridSize;
    var x = playerHeadX, y = playerHeadY;
    var vX = viewportX[0], vY = viewportY[0];
    var gW = widthInCells, gH = heightInCells;
    if (x < gS) {
      for (var fy = ((gH / 2) * -1); fy < gH; fy++) {
        for (var i = 0; i < (gW / 2); i++) {
          context.fillRect(calc((x - ((x + 1) + i)) - vX), calc((y - vY) + fy), blockSize, blockSize);
        }
      }
    }
    if ((gS - x) < gW) {
      for (var fy = ((gH / 2) * -1); fy < gH; fy++) {
        for (var i = 0; i < (gW / 2); i++) {
          context.fillRect(calc(((gS - x) + (gW / 2)) + i), calc((y - vY) + fy), blockSize, blockSize);
        }
      }
    }
    if (y < gH) {
      for (var fx = ((gW / 2) * -1); fx < gW; fx++) {
        for (var i = 1; i <= (gW / 2); i++) {
          context.fillRect(calc((x - vX) + fx), calc((y - (y + i)) - vY), blockSize, blockSize);
        }
      }
    }
    if ((gS - y) < gH) {
      for (var fx = ((gW / 2) * -1); fx < gW; fx++) {
        for (var i = 0; i <= (gW / 2); i++) {
          context.fillRect(calc((x - vX) + fx), calc(((gS - y) + (gH / 2)) + i), blockSize, blockSize);
        }
      }
    }
    context.fillStyle = '#ffffff';
  }
  // Checks if given coordinate is within viewport bounds
  function checkViewBounds(coords) {
    var vX = viewportX, vY = viewportY;
    if ((coords[0] >= vX[0] && coords[0] <= vX[1]) &&
        (coords[1] >= vY[0] && coords[1] <= vY[1])) {
      return true;
    } else {
      return false;
    }
  }
  // Draws player nick and score under the head
  function drawPlayerNick(player, headX, headY) {
    var info = player.nick + ' [' + player.score + ']';
    context.fillStyle = '#000000';
    context.fillText(info, calc(headX - viewportX[0]) - 20, calc(headY - viewportY[0]) + 35);
    context.strokeStyle = '#d3d3d3';
  }
  // Draw stat boxes
  function drawStatBoxes() {
    // Set box attributes
    var boardWidth = mobileUsr ? 140 : 190;
    var boardHeight = mobileUsr ? 210 : 260;
    var boardFontSize = mobileUsr ? '15' : '20';
    var playerX = mobileUsr ? 125 : 175;
    context.globalAlpha = 0.8;
    context.fillStyle = '#5A5A5A';
    context.font = boardFontSize + 'px monospace';
    // Draw leaderboard box
    context.fillRect(canvas.width - boardWidth, 10, (boardWidth - 10), boardHeight);
    // Draw stats box
    context.fillRect(10, canvas.height - 50, 285, 30);
    // Draw placeholder leaderboard
    context.fillStyle = '#ffffff';
    context.fillText('Leaderboard', canvas.width - (boardWidth - 20), 30);
    // Draw leaders
    var leaders = gameState.leaders;
    var x = canvas.width - playerX, y = 70, yInc = 30;
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
  }
  // Draws all objects and players in the current state
  function drawState() {
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Call function to draw bound lines
    drawBounds();
    // Draw food particles
    var foodCoords = gameState.foodCoords;
    for (var f = 0; f < foodCoords.length; f++) {
      var coords = foodCoords[f].coords;
      if (checkViewBounds(coords)) {
        var fImg, type = foodCoords[f].foodType;
        var fx = calc(coords[0] - viewportX[0]);
        var fy = calc(coords[1] - viewportY[0]);
        switch(type) {
          case 'burger':
            fImg = burgImage;
            break;
          case 'sushi':
            fImg = sushiImage;
            break;
          case 'cake':
            fImg = cakeImage;
            break;
        }
        context.drawImage(fImg, fx, fy);
      }
    }
    // Draw shields
    var shieldCoords = gameState.shieldCoords;
    for (var s = 0; s < shieldCoords.length; s++) {
      var coords = shieldCoords[s].coords;
      var sx = calc(coords[0] - viewportX[0]);
      var sy = calc(coords[1] - viewportY[0]);
      if (checkViewBounds(coords)) {
        context.drawImage(shieldImage, sx, sy);
      }
    }
    // Draw player blocks
    var players = gameState.players;
    for (var p = 0; p < players.length; p++) {
      for (var b = 0; b < players[p].blocks.length; b++) {
        var blocks = players[p].blocks;
        if (checkViewBounds(blocks[b])) {
          var bx = calc(blocks[b][0] - viewportX[0]);
          var by = calc(blocks[b][1] - viewportY[0]);
          context.fillStyle = players[p].color;
          context.strokeRect(bx, by, blockSize, blockSize);
          // If the player is immune, use the rainbow immune image for the blocks
          if (players[p].immunity > 0) {
            context.drawImage(immuneImage, bx, by);
          } else {
            context.fillRect(bx, by, blockSize, blockSize);
          }
        }
      }
      drawPlayerNick(players[p], blocks[0][0], blocks[0][1]);
    }
    drawStatBoxes();
  }
  // Sends nickname to socket
  function sendNick() {
    var nick = nickField.value;
    if (!nick || (nick.trim() == "")) {
      nick = "Guest" + Math.floor(Math.random() * 10000000);
    }
    socket.emit('nick', nick, playerId);
    isPlay = true;
  }
  // Sends key action to the socket
  function sendAction(e) {
      var key, action = false;
      playerDir = playerDir || false;
      if (e.type === 'click') {
        key = parseInt(this.id);
      } else {
        key = e.keyCode;
      }
      switch (key) {
        case 37:
          if (playerDir !== 'RIGHT' || playerScore === 1) {
            action = 'LEFT';
          }
          break;
        case 38:
          if (playerDir !== 'DOWN' || playerScore === 1) {
            action = 'UP';
          }
          break;
        case 39:
          if (playerDir !== 'LEFT' || playerScore === 1) {
            action = 'RIGHT';
          }
          break;
        case 40:
          if (playerDir !== 'UP' || playerScore === 1) {
            action = 'DOWN';
          }
          break;
      }
      if (action) {
        socket.emit('player-movement', action);
      }
  }
  // Shows reload box
  function promptDeath() {
    joinTitle.innerHTML = 'You died :(';
    joinDiv.style.display = 'block';
  }
  function addMobileInterface() {
    var width = screen.width;
    var halfWidth = Math.floor(width / 2);
    var height = screen.height;
    var halfHeight = Math.floor(height / 2);
    var offset = (blockSize * 3);
    var sideTop = Math.floor(height / 2.5);
    var sideHeight = Math.floor(height / 7);
    // Create invisible divs that will act as touch areas for direction
    var upArea = document.createElement('div');
    upArea.id = "38";
    upArea.className = "dir-area";
    upArea.style.top = "0";
    upArea.style.left = "0";
    upArea.style.width = width + "px";
    upArea.style.height = (halfHeight - offset) + "px";
    var downArea = document.createElement('div');
    downArea.id = "40";
    downArea.className = "dir-area";
    downArea.style.top = halfHeight + "px";
    downArea.style.left = "0";
    downArea.style.width = width + "px";
    downArea.style.height = halfHeight + "px";
    var leftArea = document.createElement('div');
    leftArea.id = "37";
    leftArea.className = "dir-area";
    leftArea.style.top = sideTop + "px";
    leftArea.style.left = "0";
    leftArea.style.width = (halfWidth) + "px";
    leftArea.style.height = sideHeight + "px";
    var rightArea = document.createElement('div');
    rightArea.id = "39";
    rightArea.className = "dir-area";
    rightArea.style.top = sideTop + "px";
    rightArea.style.right = "0";
    rightArea.style.width = (halfWidth - (blockSize * 2)) + "px";
    rightArea.style.height = sideHeight + "px";
    // Add to body
    body.appendChild(upArea);
    body.appendChild(downArea);
    body.appendChild(leftArea);
    body.appendChild(rightArea);
    // Add event listener to each areas
    var dirAreas = document.getElementsByClassName('dir-area');
    for (var d = 0; d < dirAreas.length; d++) {
      dirAreas[d].addEventListener('click', sendAction);
    }
  }
  // Add events
  body.addEventListener('keydown', sendAction);
  joinButton.addEventListener('click', sendNick);
  // Add mobile interface if needed
  if (mobileUsr) {
    addMobileInterface();
  }
}
