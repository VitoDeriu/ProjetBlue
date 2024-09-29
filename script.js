//canvas
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;
let mousePos;    

//paramètres de la plateforme
let plateformWidth = 60; //500 test 80 normal
let platefromHeight = 10;
let plateform = {
    x : boardWidth/2 - plateformWidth/2,
    y : boardHeight - platefromHeight-5,
   width : plateformWidth,
   height : platefromHeight,
   color : "skyblue"
}

//paramètres de la balle
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 3; //normal 3 test 20
let ballVelocityY = 2; // normal 2 test 10
let ball = {
   x : boardWidth/2,
   y : boardHeight/2,
   width : ballWidth,
   height : ballHeight,
   velocityX : ballVelocityX,
   velocityY : ballVelocityY,
   color : "white"
}

//ball1
let ball1VelocityX = 4;
let ball1VelocityY = -3;
let ball1 = {
    x : boardWidth/2,
    y : boardHeight/2,
   width : ballWidth,
   height : ballHeight,
   velocityX : ball1VelocityX,
   velocityY : ball1VelocityY,
   color : "yellow"
}

//ball2
let ball2VelocityX = 2;
let ball2VelocityY = -1;
let ball2 = {
    x : boardWidth/2,
    y : boardHeight/2,
   width : ballWidth,
   height : ballHeight,
   velocityX : ball2VelocityX,
   velocityY : ball2VelocityY,
   color : "yellow"
}

//paramètre booster
let boosterWidth = 8;
let boosterHeight = 8;
let boosterVelocityY = 0.5;
let booster = {
   x : boardWidth/2,
   y : boardHeight/2,
   width : boosterWidth,
   height : boosterHeight,
   velocityY : boosterVelocityY,
   isActive : false,
   type : 0
}

//blocks
let blocksList = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8;
let blockRaws = 6;
let blockMaxRows = 10;
let blockBreak = 0;
let blockX = 15;
let blockY = 45;
let blockColor = "skyblue";

//divers
let score = 0;
let scoreColor = "skyblue";
let gameOver = false;
let gameWin = false;
let glassBlock = false;
let tripleBall = false;



window.onload = function() {
    //initialisation du board
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //permet d'écrire dans le canvas

    //affichage de la plateforme dans le canvas
    displayPlateform();

    //refresh auto du canvas
    requestAnimationFrame(displayUpdate);

    //listener des touches
    document.addEventListener("mousemove", mouseMovePlateform);
    document.addEventListener("keydown", keyRestart);

    createBlocks();
}

//boucle de refresh du canvas
function displayUpdate() {

    requestAnimationFrame(displayUpdate)

    if (gameOver){
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //permet d'update la plateforme
    displayPlateform();

    //affichage de la balle
    displayBall(ball);
    if (tripleBall){
        displayBall(ball1); 
        displayBall(ball2);
    }

    //check border collisions
    borderCollsions(ball);
    borderBotCollision(ball);
    borderCollsions(ball1);
    borderCollsions(ball2);

    //si les balles supplémentaires sortent du canvas
    if ((ball1.y >= boardHeight)&&(ball2.y >= boardHeight)){
        tripleBall = false;
        //reset ball
        ball1 = {
            x : boardWidth/2,
            y : boardHeight/2,
            width : ballWidth,
            height : ballHeight,
            velocityX : ball1VelocityX,
            velocityY : ball1VelocityY,
            color : "yellow"
        }
        ball2 = {
            x : boardWidth/2,
            y : boardHeight/2,
            width : ballWidth,
            height : ballHeight,
            velocityX : ball2VelocityX,
            velocityY : ball2VelocityY,
            color : "yellow"
         }
    }

    //check plateform collision
    plateformCollision(ball);
    plateformCollision(ball1);
    plateformCollision(ball2);

    //affichage des blocks
    context.fillStyle = blockColor;
    for(let i = 0 ; i < blocksList.length; i++){
        let block = blocksList[i];
        if (!block.break){
            blockCollision(ball, block)
            blockCollision(ball1, block)
            blockCollision(ball2, block)
        };
        if (blockBreak == 0){ //condition de win, la liste des block est vide donc on a casser tous les blocks
            context.font = "20px sans-serif";
            context.fillStyle = "white"
            context.fillText("You Win ! Press Space to Restart a new game ! ", 30, 400);
            plateform.width = boardWidth*2
            gameWin = true;
            return;
        }
    };

    //si un booster actif apres destruction du block
    if (booster.isActive){
        booster.y += booster.velocityY //fait déscendre le booster
        if(booster.type == 0){
            booster.color = "green"
        }
        if(booster.type == 1){
            booster.color = "blue"
        }
        if(booster.type == 2){
            booster.color = "purple"
        }
        if(booster.type == 3){
            booster.color = "yellow"
        }
        
        context.fillStyle = booster.color
        context.fillRect(booster.x, booster.y, booster.width, booster.height)

        if (topCollision(booster, plateform)){
            console.log("booster plateform collide")
            if(booster.type == 0){
                plateform.width = 150;
                booster.isActive = false;
            }
            if(booster.type == 1){
                plateform.width = 40;
                booster.isActive = false;
            }
            if(booster.type == 2){
                glassBlock = true;
                setBouncing()
            }
            if(booster.type == 3){
                tripleBall = true;
                booster.isActive = false;
            }
        }

        //kill le booster s'il sort du canvas
        if(booster.y >= boardHeight){
            booster.isActive = false
        }
    }

    //affichage score
    context.font = "20px sans-serif";
    context.fillStyle = scoreColor;
    context.fillText(score, 10, 25);
};

function setBouncing(){
    setTimeout(() => { glassBlock = false }, 1*5000);
    booster.isActive=false;
};

function mouseMovePlateform(e){
    mousePos = e.clientX - board.offsetLeft;                //position de la souris dans le canvas
    if (mousePos > 0 && mousePos < board.width){            //on verifie que la souris est dans le canvas
        plateform.x = mousePos - (plateform.width / 2);     // on centre la plateforme sur la souris 
    }
};

function detectCollision(a, b){
    return  a.x <= b.x + b.width &&      //collision right
            a.x + a.width >= b.x &&      //collision left
            a.y <= b.y + b.height &&     //collision bot
            a.y + a.height >= b.y;       //collsion top
};

function topCollision(ball, block) {
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
};

function botCollision(ball, block){
    return detectCollision(ball, block) && ball.y <= (block.y + block.height);
};

function leftCollision(ball, block) {
    return detectCollision(ball, block) && (ball.x + ball.width) <= block.x;
};

function rightCollision(ball, block) {
    return detectCollision(ball, block) && ball.x >= (block.x + block.width);
};

function createBlocks(){
    blocksList = [];
    for (let c = 0; c < blockColumns; c++){
        for(let r = 0; r < blockRaws; r++){
            let block = {
                x : blockX + c*blockWidth + c*10,
                y : blockY + r*blockHeight + r*10,
                width : blockWidth,
                height : blockHeight,
                break : false
            }
            blocksList.push(block);
        }
    }
    blockBreak = blocksList.length;
};

function keyRestart(e) {
    if(gameOver || gameWin){
        if (e.code == "Space"){
            restartGame();
        }
    }
};

function restartGame(){
    gameOver = false;
    gameWin = false;
    plateform = {
        x : boardWidth/2 - plateformWidth/2,
        y : boardHeight - platefromHeight - 5,
        width : plateformWidth,
        height : platefromHeight,
        color : "skyblue"
    }
    ball = {
        x : boardWidth/2,
        y : boardHeight/2,
        width : ballWidth,
        height : ballHeight,
        velocityX : ballVelocityX,
        velocityY : ballVelocityY,
        color : "white"
    }
    booster = {
        x : boardWidth/2,
        y : boardHeight/2,
        width : boosterWidth,
        height : boosterHeight,
        velocityY : boosterVelocityY,
        isActive : false,
        type : 0
    }
    blockBreak = 0
    score = 0 
    tripleBall = false;
    createBlocks()
};

function displayBall(b){
    context.fillStyle = b.color;
    b.x += b.velocityX;
    b.y += b.velocityY;
    context.fillRect(b.x, b.y, b.width, b.height);
};

function displayPlateform(){
    context.fillStyle = plateform.color;
    context.fillRect(plateform.x, plateform.y, plateform.width, plateform.height);
};

function borderCollsions(b){
    //si la balle touche la border top
    if (b.y <=0) {
        b.velocityY *= -1; //on inverse la velocité Y
    }
    //si la balle touche les border gauche ou droite
    else if (b.x <=0 || (b.x + b.width) >= boardWidth){
        b.velocityX *= -1; //on inverse la velocité X
    }
};

function borderBotCollision(b){
    //si la balle touche la border bot on perd
    if (b.y + b.height >= boardHeight){
        context.font = "20px sans-serif";
        context.fillText("Game Over ! Press Space to Restart", 80, 400);
        gameOver = true;
    };
};

function plateformCollision(b){
    //collisions avec la plateforme
    if (leftCollision(b, plateform) || rightCollision(b, plateform)){
        b.velocityY *= -1;
    }
    else if (topCollision(b, plateform)){
        b.velocityY *= -1;
    };
};

function blockCollision(b, block){
    //si collision detruit le block et renvoi la balle
    if (rightCollision(b, block) || leftCollision(b, block)){
        block.break = true;
        if(!glassBlock){
            b.velocityX *= -1;
        }
        else{
            b.velocityX *= 1;
        };
        blockBreak -= 1;
        score += 100;
        if(!booster.isActive){
            //spawn du booster 20% de chance (90% pour test)
            spawnBooster(block);
        }
    }
    //si collision detruit le block et renvoi la balle
    else if(topCollision(b, block) || botCollision(b, block)) {
        block.break = true;
        if(!glassBlock){
            b.velocityY *= -1;
        }
        else{
            b.velocityY *= 1;
        };
        blockBreak -= 1;
        score += 100;
        if(!booster.isActive){
            //spawn du booster 20% de chance (90% pour test)
            spawnBooster(block);
        }
    };
    context.fillRect(block.x, block.y, block.width, block.height);
};

function spawnBooster(block){
    let spawnProb = Math.random();
    console.log("spawnProb : ", spawnProb)
    if (spawnProb >= 0.6){
        booster.isActive = true
        booster.x = block.x + block.width /2
        booster.y = block.y + block.height /2
        booster.type = Math.floor(Math.random()*4) 
        // booster.type = 3;
        console.log("booster type : ", booster.type)
    }
};