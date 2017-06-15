var ball;
var bar;
var bloks;

/*
    game status
     0 : not start
     1 : started
    -1 : game over 
*/
var status = 0;

var score = 0;

function setup() {
    createCanvas(400, 600);
    init();
}

function init(){
    ball = new Ball();
    bar = new Bar();
    blocks = new BlockList();
    blocks.init();
    score = 0;
}

function draw() {
  
  if(status == 0){
      drawStartScene();
  }else if(status == 1){
      drawGameScene();
  }else if(status == -1){
      drawEndScene();
  }
}

function drawStartScene(){
    background(240);
    blocks.draw();
    bar.draw();

    strokeWeight(4);
    stroke(255);
    fill(64);
    textSize(54);
    textAlign(CENTER);
    text("Block Breaking", 200, 160);

    noStroke();
    textSize(32);
    text("Click to play", 200, 300);
}

function drawGameScene(){
    //collison
    ball.collisionRect(bar.x, bar.y, bar.w, bar.h);
    blocks.collision(ball);

    //update
    blocks.update();
    bar.update();
    ball.update();
    //edge
    ball.edge();
    bar.edge();

    //draw
    background(240);
    blocks.draw();
    bar.draw();
    ball.draw();

    fill(64);
    textSize(24);
    textAlign(LEFT);
    text("SCORE : " + score, 20, height - 20);

}

function drawEndScene(){
    background(32);
    fill(200);
    textSize(64);
    textAlign(CENTER);
    text("GAME OVER", 200, 200);

    textSize(42);
    text("Score : " + score, 200, 300);

    textSize(32);
    text("Click to replay", 200, 400);
}

function mouseClicked(){
    if(status != 1){
        init();
        status = 1;
    }
}

function Ball(){

    this.pos = createVector(width/2, height/2);
    this.r = 20;

    this.maxSpeed = 8;
    this.vel = createVector(random(0.3, 0.6), 1);;
    this.vel.setMag(this.maxSpeed);

    this.update = function(){
        this.vel.setMag(this.maxSpeed);
        this.pos.add(this.vel);
    };

    this.draw = function(){
        colorMode(RGB);
        noStroke();
        fill(242, 0, 242);
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    };

    this.edge = function(){
        if(this.pos.x - this.r < 0){
            this.vel.x *= -1;
            this.pos.x = this.r;
        }else if(this.pos.x + this.r > width){
            this.vel.x *= -1;
            this.pos.x = width- this.r;
        }

        if(this.pos.y - this.r < 0){
            this.vel.y *= -1;
             this.pos.y = this.r;
        }else if(this.pos.y + this.r > height){
            status = -1;
        }
    }

    this.collisionRect = function(rx, ry, rw, rh){

        var x = this.pos.x;
        var y = this.pos.y;

        var preX = x - this.vel.x;
        var preY = y - this.vel.y;

        var isHit = false;
        
        if(x > rx - this.r && x < rx + rw + this.r && y > ry - this.r && y < ry + rh + this.r){
            
            isHit = true;

            if(preX < rx){
                this.pos.x = rx - this.r;
                this.vel.x *= -random(0.9, 1.1);
            }

            if(preX > rx + rw){
                this.pos.x = rx + rw + this.r;
                this.vel.x *= -random(0.9, 1.1);
            }

            if(preY < ry){
                this.pos.y = ry - this.r;
                this.vel.y *= -random(0.9, 1.1);
            }

            if(preY > ry + rh){
                this.pos.y = ry + rh + this.r;
                this.vel.y *= -random(0.9, 1.1);
            }

        }

        return isHit;
    }
}

function Bar(){
    
    this.w = width / 4;
    this.h = 20;

    this.x = width / 2 - this.w / 2;
    this.y = height - 80;

    this.update = function(){

        this.x = mouseX;
    };

    this.draw = function(){
        colorMode(RGB);
        noStroke();
        fill(242, 242, 0);
        rect(this.x, this.y, this.w, this.h);
    };

    this.edge = function(){
        if(this.x < 0){
            this.x = 0;
        }else if(this.x + this.w > width){
            this.x = width - this.w;
        }
    };

}

function BlockList(){
    //this.list = [];
    this.list = [];
    this.paddingW = 20;

    this.col = 6;
    this.row = 8;

    this.top = 0;
    this.fall = 0.1;

    this.isMoving = false;

    this.hueCounter = 0;

    this.init = function(){

        this.isMoving = false;
        this.hueCounter = 0;

        var w = floor((width - this.paddingW * 2) / this.col);
        var h = floor(height/(3*this.row));
        
        colorMode(HSB);

        for(var j = 0; j < this.row; j++){
            this.list[j] = [];
            for(var i = 0; i < this.col; i++){
                var hue = map(this.hueCounter, 0, this.col*this.row, 0, 360);

                this.list[j].push(new Block(w*i + this.paddingW, h*(this.row - 1 - j), w, h, hue));

                this.hueCounter++;
                if(this.hueCounter > this.col*this.row){
                    this.hueCounter = this.hueCounter % this.col*this.row;
                }
            }
        }
    };

    this.update = function(){

        if(this.list[0].length == 0){
            this.list.splice(0,1);
            this.addRow();
            this.top = this.list[this.list.length - 1][0].y;
            this.isMoving = true;
        }
        
        for(var j = this.list.length - 1; j >= 0 ; j--){
            for(var i = this.list[j].length - 1; i >= 0; i--){
                var block = this.list[j][i];

                block.update();

                if(block.lifespan < 0){
                    this.list[j].splice(i, 1);
                }

                if(this.isMoving){
                    block.move(this.fall);
                }
            }
        }

        if(this.isMoving){
            this.top += this.fall;
            if(this.top >= 0){
                this.isMoving = false;
            }
        }
    };

    this.draw = function(){
        colorMode(HSB);

        for(var j = 0; j < this.list.length; j++){
            for(var i = 0; i < this.list[j].length; i++){
                this.list[j][i].draw();
            }
        }

    };

    this.collision = function(b){

        for(var j = 0; j < this.list.length; j++){
            for(var i = 0; i < this.list[j].length; i++){
                var block = this.list[j][i];

                if(block.isAlive && b.collisionRect(block.x, block.y, block.w, block.h)){
                    block.isAlive = false;
                    score++;
                    b.maxSpeed += 0.1;;
                }
            }
        }
    };

    this.addRow = function(){
        var l = [];
        for(var i = 0; i < this.col; i++){

            var w = floor((width - this.paddingW * 2) / this.col);
            var h = floor(height/(3*this.row));
            var hue = map(this.hueCounter, 0, this.col*this.row, 0, 360);

            l.push(new Block(w*i + this.paddingW, this.top - h, w, h, hue));

            this.hueCounter++;
            if(this.hueCounter > this.col*this.row){
                this.hueCounter = this.hueCounter % (this.col*this.row);
            }
        }

        this.list.push(l);
    };
}

function Block(x, y, w, h, hue){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.hue = hue;

    this.isAlive = true;
    this.lifespan = 80;

    this.padding = 2;

    this.update = function(){
        if(!this.isAlive){
            this.lifespan -= 4;
        }
    };

    this.draw = function(){
        noStroke();
        fill(this.hue,this.lifespan, 100);
        rect(this.x + this.padding, this.y+this.padding, this.w-this.padding*2, this.h-this.padding*2);
    };

    this.move = function(s){
        this.y += s;
    };
}