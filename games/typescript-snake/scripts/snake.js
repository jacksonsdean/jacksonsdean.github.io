var GAME_WIDTH = 650;
var GAME_HEIGHT = 650;
var GAME_RESOLUTION = 25;
var THEME_SNAKE = "#38c8a8";
var THEME_FRUIT = "#DE766A";
var THEME_FRUIT_DARK = "#913329";
var START_POSITION = [[GAME_WIDTH / 2, GAME_HEIGHT / 2], [GAME_WIDTH / 2 + GAME_RESOLUTION, GAME_HEIGHT / 2]];
var MoveDir;
(function (MoveDir) {
    MoveDir[MoveDir["LEFT"] = 0] = "LEFT";
    MoveDir[MoveDir["UP"] = 1] = "UP";
    MoveDir[MoveDir["RIGHT"] = 2] = "RIGHT";
    MoveDir[MoveDir["DOWN"] = 3] = "DOWN";
})(MoveDir || (MoveDir = {}));
var SnakeGame = /** @class */ (function () {
    function SnakeGame() {
        var _this = this;
        this.score = 0;
        this.moveDir = MoveDir.LEFT;
        this.snake = START_POSITION;
        this.fruit = [0, 0];
        this.lastMoveDir = MoveDir.LEFT;
        this.handleInput = function (input) {
            // LEFT
            if ((input.key == "a" || input.key == "ArrowLeft") && _this.lastMoveDir != MoveDir.RIGHT) {
                input.preventDefault();
                _this.moveDir = MoveDir.LEFT;
                if (!_this.isRunning)
                    _this.run();
            }
            // UP
            else if ((input.key == "w" || input.key == "ArrowUp") && _this.lastMoveDir != MoveDir.DOWN) {
                input.preventDefault();
                _this.moveDir = MoveDir.UP;
                if (!_this.isRunning)
                    _this.run();
            }
            // RIGHT
            else if ((input.key == "d" || input.key == "ArrowRight") && _this.lastMoveDir != MoveDir.LEFT) {
                input.preventDefault();
                _this.moveDir = MoveDir.RIGHT;
                if (!_this.isRunning)
                    _this.run();
            }
            // DOWN
            else if ((input.key == "s" || input.key == "ArrowDown" && _this.lastMoveDir != MoveDir.UP)) {
                input.preventDefault();
                _this.moveDir = MoveDir.DOWN;
                if (!_this.isRunning)
                    _this.run();
            }
        };
        this.stop = false;
        this.frameCount = 0;
        this.fps = 0;
        this.fpsInterval = 100;
        this.startTime = 0;
        this.elapsed = 0;
        this.then = 0;
        this.loop = function () {
            if (!_this.isRunning)
                return;
            requestAnimationFrame(_this.loop);
            var now = Date.now();
            _this.elapsed = now - _this.then;
            // if enough time has elapsed, draw the next frame
            if (_this.elapsed > _this.fpsInterval) {
                _this.then = now - (_this.elapsed % _this.fpsInterval);
                _this.fixedUpdate();
            }
        };
        this.isRunning = false;
        this.playButton = document.getElementById("playButton");
        this.playButton.addEventListener("click", function (e) { return _this.togglePlay(); });
        this.gameCanvas = document.getElementById("game");
        this.gameCanvas.width = GAME_WIDTH;
        this.gameCanvas.height = GAME_HEIGHT;
        this.draw = this.gameCanvas.getContext("2d");
        this.scoreText = document.getElementById("score");
        this.setupKeyboardHandler();
        this.moveFruit();
        this.updateScoreText();
    }
    SnakeGame.prototype.togglePlay = function () {
        this.isRunning = !this.isRunning;
        if (this.isRunning) {
            this.run();
            this.playButton.firstElementChild.classList.add("fa-pause");
            this.playButton.firstElementChild.classList.remove("fa-play");
            this.playButton.classList.add("pause");
        }
        else {
            this.playButton.firstElementChild.classList.remove("fa-pause");
            this.playButton.firstElementChild.classList.add("fa-play");
            this.playButton.classList.remove("pause");
        }
    };
    SnakeGame.prototype.addScore = function (amt) {
        this.score += amt;
        this.updateScoreText();
    };
    SnakeGame.prototype.resetScore = function () {
        this.score = 0;
        this.updateScoreText();
    };
    SnakeGame.prototype.updateScoreText = function () {
        if (this.score > 0)
            this.scoreText.innerHTML = "SCORE:" + this.score.toString();
        else
            this.scoreText.innerHTML = "-";
    };
    SnakeGame.prototype.drawSnake = function () {
        this.draw.fillStyle = THEME_SNAKE;
        this.draw.strokeStyle = "white";
        this.draw.lineWidth = 1;
        for (var index = 0; index < this.snake.length; index++) {
            this.draw.fillRect(this.snake[index][0], this.snake[index][1], GAME_RESOLUTION, GAME_RESOLUTION);
            this.draw.strokeRect(this.snake[index][0], this.snake[index][1], GAME_RESOLUTION, GAME_RESOLUTION);
        }
    };
    SnakeGame.prototype.drawFruit = function () {
        this.draw.fillStyle = THEME_FRUIT;
        this.draw.strokeStyle = "white";
        this.draw.lineWidth = 1;
        this.draw.fillRect(this.fruit[0], this.fruit[1], GAME_RESOLUTION, GAME_RESOLUTION);
        this.draw.strokeRect(this.fruit[0], this.fruit[1], GAME_RESOLUTION, GAME_RESOLUTION);
    };
    SnakeGame.prototype.moveFruit = function () {
        this.fruit = this.getRandomPosition();
        if (this.countOverlappingSnake(this.fruit) > 0)
            this.moveFruit();
    };
    SnakeGame.prototype.getMoveAmount = function () {
        var move = [0, 0];
        switch (this.moveDir) {
            case MoveDir.LEFT:
                move = [-GAME_RESOLUTION, 0];
                break;
            case MoveDir.UP:
                move = [0, -GAME_RESOLUTION];
                break;
            case MoveDir.RIGHT:
                move = [GAME_RESOLUTION, 0];
                break;
            case MoveDir.DOWN:
                move = [0, GAME_RESOLUTION];
                break;
            default:
                break;
        }
        return move;
    };
    SnakeGame.prototype.moveSnake = function () {
        var move = this.getMoveAmount();
        var lastPos = Object.assign({}, this.snake[0]);
        this.snake[0][0] += move[0];
        this.snake[0][1] += move[1];
        for (var index = 1; index < this.snake.length; index++) {
            var setPos = lastPos;
            lastPos = this.snake[index];
            this.snake[index] = setPos;
        }
        this.lastMoveDir = this.moveDir;
    };
    SnakeGame.prototype.getRandomPosition = function () {
        var x = Math.round(Math.random() * (GAME_WIDTH - GAME_RESOLUTION) / GAME_RESOLUTION) * GAME_RESOLUTION;
        var y = Math.round(Math.random() * (GAME_HEIGHT - GAME_RESOLUTION) / GAME_RESOLUTION) * GAME_RESOLUTION;
        console.log([x, y]);
        return [x, y];
    };
    SnakeGame.prototype.run = function () {
        console.log("RUN");
        this.isRunning = true;
        this.loop();
    };
    SnakeGame.prototype.lose = function () {
        var _this = this;
        this.isRunning = false;
        setTimeout(function () {
            _this.isRunning = true;
            _this.togglePlay();
            _this.snake = [[GAME_WIDTH / 2, GAME_HEIGHT / 2], [GAME_WIDTH / 2 + GAME_RESOLUTION, GAME_HEIGHT / 2]];
            _this.moveFruit();
            _this.clear();
            _this.resetScore();
        }, 1000);
    };
    SnakeGame.prototype.fixedUpdate = function () {
        this.clear();
        this.moveSnake();
        this.checkPositions();
        this.drawSnake();
        this.drawFruit();
    };
    SnakeGame.prototype.countOverlappingSnake = function (pos) {
        var count = 0;
        for (var index = 0; index < this.snake.length; index++) {
            if (this.snake[index][0] == pos[0] && this.snake[index][1] == pos[1]) {
                count++;
            }
        }
        return count;
    };
    SnakeGame.prototype.checkPositions = function () {
        // off screen or hit self
        if (this.snake[0][0] < 0 ||
            this.snake[0][1] < 0 ||
            this.snake[0][0] > GAME_WIDTH - GAME_RESOLUTION ||
            this.snake[0][1] > GAME_HEIGHT - GAME_RESOLUTION ||
            this.countOverlappingSnake(this.snake[0]) > 1) {
            this.lose();
        }
        else if (this.fruit[0] == this.snake[0][0] && this.fruit[1] == this.snake[0][1]) {
            this.eatFruit();
        }
    };
    SnakeGame.prototype.eatFruit = function () {
        var newVal = Object.assign({}, this.snake[this.snake.length - 1]);
        var move = this.getMoveAmount();
        newVal[0] -= move[0];
        newVal[1] -= move[1];
        this.snake.push(newVal);
        this.moveFruit();
        this.addScore(10);
    };
    SnakeGame.prototype.clear = function () {
        this.draw.fillStyle = "white";
        this.draw.strokeStyle = "white";
        this.draw.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.draw.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    };
    SnakeGame.prototype.setupKeyboardHandler = function () {
        document.addEventListener('keydown', this.handleInput);
    };
    return SnakeGame;
}());
function main() {
    var game = new SnakeGame();
}
main();
