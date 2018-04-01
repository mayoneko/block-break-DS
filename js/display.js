//上画面

var socket = io.connect();
var bars = [];
var balls = [];
var boxX, boxY;
var barY;
var barH;

function setup() {
    createCanvas((windowWidth - 40)/2, (windowHeight - 40)/2);
    frameRate(30);
    rectMode(RADIUS);
    ellipseMode(RADIUS);
    boxX = width;
    boxY = width * 2;
    barY = boxY * 39 / 40;
    barH = boxY / 80;
    noStroke();
    socket.on('ballCreate', ballCreate);
    socket.on('ballDelete', ballDelete);
    socket.on('ballDelete', ballDebug);
}

function draw() {
    background(255);
    for (var id in balls) {
        balls[id].move();
        balls[id].display();
    }
}

function ballCreate(data) {
    balls[data.id] = new Ball(data.x,data.y,data.speed,data.theta,data.id,data.fc);
}

function ballDelete(id) {
    delete balls[id];
}

function ballDebug(data) {
    if(balls.indexOf(data.id)>-1){
        balls[data.id].x=boxX*data.x;
        balls[data.id].y=boxY*data.y;
        balls[data.id].speed=boxX*data.speed;
        balls[data.id].theta=data.theta;
    }else{
        console.log(data.id);
    }
}

class Ball {
    constructor(x, y, speed, theta, id, fc) {
        this.x = boxX * x;
        this.y = boxY * y;
        this.speed = boxX * speed;
        this.theta = theta;
        this.id = id;
        this.fc=fc;
        console.log(this.fc);
    }

    move() {
        var mx = this.speed * cos(radians(this.theta));
        var my = this.speed * sin(radians(this.theta));
        var tempX = this.x;
        var tempY = this.y;
        tempX += mx;
        tempY += my;
        var count = 0;
        do {
            if (count > 3) {
                this.theta += 1;
                mx = this.speed * cos(radians(this.theta));
                my = this.speed * sin(radians(this.theta));
                tempX = this.x;
                tempY = this.y;
                tempX += mx;
                tempY += my;
            }
            if (tempX - boxX / 60 < 0) {
                tempX += (boxX / 60 - tempX) * 2;
                this.theta = 540 - this.theta;
            }
            if (tempX + boxX / 60 > boxX) {
                tempX -= (tempX + boxX / 60 - boxX) * 2;
                this.theta = 540 - this.theta;
            }
            if (tempY - boxX / 60 < 0) {
                tempY += (boxX / 60 - tempY) * 2;
                this.theta = 360 - this.theta;
            }
            if (tempY + boxX / 60 >= barY - barH && this.y + boxX / 60 < barY - barH) {
                tempY -= (tempY + boxX / 60 - (barY - barH)) * 2;
                this.theta = 360 - this.theta;
            }
            count++;
        } while (tempX - boxX / 60 < 0 || tempX + boxX / 60 > boxX || tempY - boxX / 60 < 0);
        this.x = tempX;
        this.y = tempY;
        while (this.theta > 360) {
            this.theta -= 360;
        }
        // print("X="+this.x+",Y="+this.y);
    }

    display() {
        var c=color(this.fc);
        fill(c);
        ellipse(this.x, this.y, boxX / 60, boxX / 60);
    }
}