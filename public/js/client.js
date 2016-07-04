'use strict';
window.onload = function() {
    class GameHandler {
        constructor(id) {
            this.id = id;
            this.blockSize = 15;
            this.domActions();
        }
        checkLife(gameState) {
            var player = gameState.players.filter(p => p.id === this.id);
            return player.length === 0 ? false : true;
        }
        putStats(gameState) {
            var player = gameState.players.filter(p => p.id === this.id);
            this.scoreSpan.innerHTML = player[0].score;
            this.highScoreSpan.innerHTML = gameState.highScore;
            this.playerSpan.innerHTML = gameState.numPlayers;
        }
        drawState(gameState) {
            // Clear old state
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // Draw food
            this.context.fillStyle = '#ff0000';
            var foodCoords = gameState.foodCoords;
            this.context.drawImage(this.foodImage, foodCoords[0], foodCoords[1]);
            // Draw players
            var players = gameState.players;
            for (var p = 0; p < players.length; p++) {
                this.context.fillStyle = players[p].color;
                for (var b = 0; b < players[p].blocks.length; b++) {
                  var blocks = players[p].blocks;
                  this.context.fillRect(blocks[b][0], blocks[b][1], this.blockSize, this.blockSize);  
                }            }
        }
        sendAction(e) {
            var key = e.keyCode;
            var action;
            switch (key) {
                case 37:
                    action = 'LEFT';
                    break;
                case 38:
                    action = 'UP';
                    break;
                case 39:
                    action = 'RIGHT';
                    break;
                case 40:
                    action = 'DOWN';
                    break;
            }
            socket.emit('player-movement', action);
        }
        domActions() {
            this.foodImage = document.createElement('img');
            this.foodImage.src = '/img/food.gif';
            this.canvas = document.getElementById('game-canvas');
            this.context = this.canvas.getContext('2d');
            this.scoreSpan = document.getElementById('score');
            this.highScoreSpan = document.getElementById('high-score');
            this.playerSpan = document.getElementById('num-players');
            this.deathPrompt = document.getElementById('death-info');
            this.replayButton = document.getElementById('replay');
            this.replayButton.addEventListener('click', this.reloadPage);
            document.body.addEventListener('keydown', this.sendAction);
        }
        reloadPage() {
            location.reload();
        }
    }
    var clientId;
    var gameHandler;
    var socket = io();
    socket.on('client-id', function(id) {
        if (!clientId) {
            clientId = id;
            gameHandler = new GameHandler(clientId);
        }
    });
    socket.on('state-change', function(newState) {
        if (gameHandler.checkLife(newState)) {
            gameHandler.putStats(newState);
        } else {
            gameHandler.deathPrompt.style.display = 'block';
        }
        gameHandler.drawState(newState);
    });
}
