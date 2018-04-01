//上画面

var socket = io.connect();
var bars = [];
var balls = [];
var boxX, boxY;

function setup() {
    createCanvas(windowWidth - 40, windowHeight - 40);
    rectMode(RADIUS);
    ellipseMode(RADIUS);
    boxX = width;
    boxY = width * 2;
    noStroke();
    socket.on('racketCreate', autoCreate);
    socket.on('ballCreate', ballCreate);
    socket.on('ballDelete', ballDelete);
}

function draw() {
    background(255);
    for (var id in balls) {
        var c = color(bars[id].fColor);
        fill(c);
        balls[id].move(bars[id].x, bars[id].y, bars[id].w, bars[id].h);
        balls[id].display();
    }
}

function autoCreate(id, fColor) {
    bars[id] = new Bar(id, fColor);
}


function ballCreate(x, y, speed, theta, id) {
    balls[id] = new Ball(x, y, speed, theta, id);
}

function ballDelete(id) {
    delete balls[id];
}

class Bar {
    constructor(id, fColor) {
        this.x = boxX / 2;
        this.y = boxY * 39 / 40;
        this.w = boxX / 8;
        this.h = boxY / 80;
        this.id = id;
        this.fColor = fColor;
    }
}

class Ball {
    constructor(x, y, speed, theta, id) {
        this.x = boxX * x;
        this.y = boxY * y;
        this.speed = boxX * speed;
        this.theta = theta;
        this.id = id;
    }

    move(barX, barY, barW, barH) {
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
                tempX += (tempX + boxX / 60 - boxX) * 2;
                this.theta = 540 - this.theta;
            }
            if (tempY - boxX / 60 < 0) {
                tempY += (boxX / 60 - tempY) * 2;
                this.theta = 360 - this.theta;
            }
            if (tempY + boxX / 60 >= barY - barH && this.y + boxX / 60 < barY - barH) {
                tempY += (tempY + boxX / 60 - barH) * 2;
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
        ellipse(this.x, this.y, boxX / 60, boxX / 60);
    }
}