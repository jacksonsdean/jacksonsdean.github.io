const GAME_WIDTH = 650;
const GAME_HEIGHT = 650;
const GAME_RESOLUTION = 25;

const THEME_SNAKE = "#38c8a8"
const THEME_FRUIT = "#DE766A"
const THEME_FRUIT_DARK = "#913329"

const START_POSITION:[number,number][] = [[GAME_WIDTH/2, GAME_HEIGHT/2], [GAME_WIDTH/2 + GAME_RESOLUTION, GAME_HEIGHT/2]];


enum MoveDir{
    LEFT, UP, RIGHT, DOWN
}

class SnakeGame{
    private isRunning:boolean;

    private score : number = 0;

    private gameCanvas:HTMLCanvasElement;
    private draw:CanvasRenderingContext2D;
    private playButton:HTMLButtonElement;
    
    private moveDir:MoveDir = MoveDir.LEFT;

    private snake: [number,number][] = START_POSITION;
    private fruit:[number, number] = [0,0];

    private lastMoveDir : MoveDir = MoveDir.LEFT;

    private scoreText : HTMLParagraphElement;
    constructor (){
        this.isRunning = false;
        
        this.playButton = document.getElementById("playButton") as HTMLButtonElement;
        this.playButton.addEventListener("click", (e:Event) => this.togglePlay());
        
        this.gameCanvas = document.getElementById("game")  as HTMLCanvasElement;
        this.gameCanvas.width = GAME_WIDTH;
        this.gameCanvas.height = GAME_HEIGHT;
        this.draw = this.gameCanvas.getContext("2d");
        
        this.scoreText = document.getElementById("score")  as HTMLParagraphElement;

        this.setupKeyboardHandler();

        this.moveFruit();
        this.updateScoreText();

    }

    public togglePlay(){
        this.isRunning = !this.isRunning;
        if(this.isRunning){
            this.run();
            this.playButton.firstElementChild.classList.add("fa-pause");
            this.playButton.firstElementChild.classList.remove("fa-play");
            this.playButton.classList.add("pause");
        }else{
            this.playButton.firstElementChild.classList.remove("fa-pause");
            this.playButton.firstElementChild.classList.add("fa-play");
            this.playButton.classList.remove("pause");
        }
    }

    private addScore(amt:number){
        this.score+=amt;
        this.updateScoreText();
    }
    
    private resetScore(){
        this.score= 0;
        this.updateScoreText();

    }

    private updateScoreText(){
        if(this.score>0)
            this.scoreText.innerHTML = "SCORE:" + this.score.toString();
        else
        this.scoreText.innerHTML ="-";


    }

    private drawSnake(){
        this.draw.fillStyle = THEME_SNAKE;
        this.draw.strokeStyle = "white";
        this.draw.lineWidth = 1;

        for (let index = 0; index < this.snake.length; index++) {
            this.draw.fillRect(this.snake[index][0], this.snake[index][1], GAME_RESOLUTION, GAME_RESOLUTION );
            this.draw.strokeRect(this.snake[index][0], this.snake[index][1], GAME_RESOLUTION, GAME_RESOLUTION );
        }

    }
    private drawFruit(){
        this.draw.fillStyle = THEME_FRUIT;
        this.draw.strokeStyle = "white";
        this.draw.lineWidth = 1;

        this.draw.fillRect(this.fruit[0], this.fruit[1], GAME_RESOLUTION, GAME_RESOLUTION );
        this.draw.strokeRect(this.fruit[0], this.fruit[1], GAME_RESOLUTION, GAME_RESOLUTION );
    }

    private moveFruit(){
        this.fruit = this.getRandomPosition();
        if(this.countOverlappingSnake(this.fruit)>0)
            this.moveFruit();

    }


    private getMoveAmount(){
        let move: [number, number] = [0,0];
        switch (this.moveDir) {
            case MoveDir.LEFT:
                move = [-GAME_RESOLUTION, 0];
                break;
            case MoveDir.UP:
                move = [0,-GAME_RESOLUTION];
                break;
            case MoveDir.RIGHT:
                move = [GAME_RESOLUTION, 0];
                break;
            case MoveDir.DOWN:
                move = [0,GAME_RESOLUTION];
                break;
            default:
                break;
        }
        return move;
    }

    private moveSnake(){
        let move = this.getMoveAmount();
        var lastPos : [number, number] = Object.assign({},this.snake[0]);
        this.snake[0][0]+=move[0];
        this.snake[0][1]+=move[1];

        for (let index = 1; index < this.snake.length; index++) {
            let setPos : [number, number] = lastPos;
            lastPos = this.snake[index];
            this.snake[index] = setPos;
        }
        this.lastMoveDir = this.moveDir;

    }



    private getRandomPosition() : [number,number]{
        var x = Math.round(Math.random()*(GAME_WIDTH  - GAME_RESOLUTION) / GAME_RESOLUTION) * GAME_RESOLUTION;
        var y = Math.round(Math.random()*(GAME_HEIGHT - GAME_RESOLUTION) / GAME_RESOLUTION) * GAME_RESOLUTION;

        console.log([x,y]);
        return[x, y];
    }

  

    public run(){
        console.log("RUN");
        this.isRunning = true;
        this.loop();
    }

    private lose(){
        this.isRunning = false;
        setTimeout(()=>{
            this.isRunning = true;
            this.togglePlay();
            this.snake =   [[GAME_WIDTH/2, GAME_HEIGHT/2], [GAME_WIDTH/2 + GAME_RESOLUTION, GAME_HEIGHT/2]];
            this.moveFruit();
            this.clear();
            this.resetScore();
        },1000);

        
    }

    private fixedUpdate(){
        this.clear();
        this.moveSnake();
        this.checkPositions();
        this.drawSnake();
        this.drawFruit();
    }

    private countOverlappingSnake(pos :[number, number]) :number{
        let count = 0;
        for (let index = 0; index < this.snake.length; index++) {
            if(this.snake[index][0] == pos[0] && this.snake[index][1] == pos[1]){
                count++;
            }
        }
        return count;
    }


    private checkPositions(){
        // off screen or hit self
        if( this.snake[0][0]    < 0 ||
            this.snake[0][1]    < 0 ||
            this.snake[0][0]    >  GAME_WIDTH  - GAME_RESOLUTION ||
            this.snake[0][1]    >  GAME_HEIGHT - GAME_RESOLUTION || 
            this.countOverlappingSnake(this.snake[0])>1)
        {
                this.lose();
        }
        else if(this.fruit[0] == this.snake[0][0] && this.fruit[1] == this.snake[0][1]){
            this.eatFruit();
        }
    }

    private eatFruit(){
        let newVal = Object.assign({}, this.snake[this.snake.length-1]);
        var move = this.getMoveAmount();
        newVal[0]-=move[0]; 
        newVal[1]-=move[1]; 
       
        this.snake.push(newVal);
        this.moveFruit();
        this.addScore(10);

    }

    private clear() {
        this.draw.fillStyle = "white";
        this.draw.strokeStyle = "white";
        this.draw.fillRect(0,0, GAME_WIDTH, GAME_HEIGHT);
        this.draw.strokeRect(0,0, GAME_WIDTH, GAME_HEIGHT);
    }

    private setupKeyboardHandler(){
        document.addEventListener('keydown', this.handleInput);
    }

    private handleInput = (input:KeyboardEvent) =>{
        // LEFT
        if      ((input.key == "a" || input.key=="ArrowLeft") && this.lastMoveDir !=MoveDir.RIGHT) {
            input.preventDefault();
            this.moveDir = MoveDir.LEFT;
            if(!this.isRunning) this.run();
        }
        // UP
        else if ((input.key == "w"|| input.key=="ArrowUp")&& this.lastMoveDir !=MoveDir.DOWN) {
            input.preventDefault();
            this.moveDir = MoveDir.UP;
            if(!this.isRunning) this.run();

            
        }
        // RIGHT
        else if ((input.key == "d"|| input.key=="ArrowRight")&& this.lastMoveDir !=MoveDir.LEFT) {
            input.preventDefault();
            this.moveDir = MoveDir.RIGHT;
            if(!this.isRunning) this.run();

            
        }
        
        // DOWN
        else if ((input.key == "s"|| input.key=="ArrowDown"&& this.lastMoveDir !=MoveDir.UP)) {
            input.preventDefault();
            this.moveDir = MoveDir.DOWN;
            if(!this.isRunning) this.run();

        }
    }
    
    stop:boolean = false;
    frameCount:number = 0;
    fps:number = 0;
    fpsInterval:number = 100;
    startTime:number= 0;
    elapsed:number =0;
    then:number = 0;

    private loop = ()=> {
        if(! this.isRunning) return;
        requestAnimationFrame(this.loop);
        let now  = Date.now();
        this.elapsed =  now - this.then;
        // if enough time has elapsed, draw the next frame
        if (this.elapsed > this.fpsInterval) {
            this.then = now - (this.elapsed % this.fpsInterval);
            this.fixedUpdate();
        }

    }

    
}


function main() : void{
    let game = new SnakeGame();
}

main();
