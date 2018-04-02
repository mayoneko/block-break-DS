//下画面

var socket = io.connect();
var bar;
var ball;
var boxX, boxY;

function setup() {
    createCanvas((windowWidth - 40) / 2, (windowHeight - 40) / 2);
    rectMode(RADIUS);
    ellipseMode(RADIUS);
    boxX = width;
    boxY = width * 2;
    noStroke();
    var fc = createColor();
    bar = new Bar(getUniqueStr(), fc);
    ball = new Ball(1 / 2, 7 / 8, 1 / 100, (int)(random(200, 340)), bar.id);
    var data = {
        x: 1 / 2,
        y: 7 / 8,
        speed: 1 / 100,
        theta: ball.theta,
        id: bar.id,
        fc: fc
    };
    socket.emit("ballCreate", data);
    var c = color(bar.fColor);
    fill(c);
}

function draw() {
    if (deviceOrientation !== "undefined") {
        var mvX = map(rotationX, -50, 50, 0, boxX);
        bar.turnMove(mvX);
    }
    background(255);
    ball.move(bar.x, bar.y, bar.w, bar.h);
    ball.display();
    bar.display();
}

function touchEnded() {
    var per = (mouseX - bar.x) / boxX;
    bar.touchMove(per);
}

function createColor() {
    var fColor = "#";
    var st = [];
    for (var i = 0; i < 3; i++) {
        do {
            var temp = (int)(random(0, 4));
        } while (st.indexOf(temp) > -1);
        switch (temp) {
            case 0:
                fColor += "ff";
                break;
            case 1:
                fColor += "bf";
                break;
            default:
                fColor += "7f";
                break;
        }
    }
    return fColor;
}

function getUniqueStr(myStrong) {
    var strong = 1000;
    if (myStrong) strong = myStrong;
    return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
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

    touchMove(per) {
        this.x += boxX * per / 10;
    }

    turnMove(mvX) {
        this.x = mvX;
    }

    display() {
        rect(this.x, this.y - (boxY - height), this.w, this.h);
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
                print("hoge");
                break;
            }
            if (tempX - boxX / 60 < 0) {
                tempX += (boxX / 60 - tempX) * 2;
                this.theta = 540 - this.theta;
                this.speed+=boxX/1000;
            }
            if (tempX + boxX / 60 > boxX) {
                tempX -= (tempX + boxX / 60 - boxX) * 2;
                this.theta = 540 - this.theta;
                this.speed+=boxX/1000;
            }
            if (tempY - boxX / 60 < 0) {
                tempY += (boxX / 60 - tempY) * 2;
                this.theta = 360 - this.theta;
                this.speed+=boxX/1000;
            }
            if (tempY + boxX / 60 >= barY - barH && this.y + boxX / 60 < barY - barH) {
                if (tempX - (tempX - this.x) * (tempY - (barY - barH)) / (tempY - this.y) > barX - barW && tempX - (tempX - this.x) * (tempY - (barY - barH)) / (tempY - this.y) < barX + barW) {
                    tempY -= (tempY + boxX / 60 - (barY - barH)) * 2;
                    this.theta = 360 - this.theta;
                    this.speed+=boxX/1000;
                }else if (tempX - (tempX - this.x) * (tempY - (barY - barH)) / (tempY - this.y)+boxX/60 > barX - barW && tempX - (tempX - this.x) * (tempY - (barY - barH)) / (tempY - this.y) < barX - barW) {
                    tempY -= (tempX+boxX/60-(barX-barW))+(tempY+boxX/60-(barY-barH));
                    tempX -= (tempX+boxX/60-(barX-barW))+(tempY+boxX/60-(barY-barH));
                    this.theta = 360 + 270 - this.theta;
                    this.speed+=boxX/1000;
                }else if (tempX - (tempX - this.x) * (tempY - (barY - barH)) / (tempY - this.y)-boxX/60 < barX + barW && tempX - (tempX - this.x) * (tempY - (barY - barH)) / (tempY - this.y) > barX + barW) {
                    tempY -= (tempX-boxX/60-(barX+barW))+(tempY+boxX/60-(barY-barH));
                    tempX += (tempX-boxX/60-(barX+barW))+(tempY+boxX/60-(barY-barH));
                    this.theta = 270 + this.theta;
                    this.speed+=boxX/1000;
                }
            }
            count++;
        } while (tempX - boxX / 60 < 0 || tempX + boxX / 60 > boxX || tempY - boxX / 60 < 0 || ((tempY + boxX / 60 >= barY - barH && this.y + boxX / 60 < barY - barH) && tempX - (tempX - this.x) * (tempY - (barY - barH)) / (tempY - this.y) > barX - barW && tempX - (tempX - this.x) * (tempY - (barY - barH)) / (tempY - this.y) < barX + barW));
        this.x = tempX;
        this.y = tempY;
        while (this.theta > 360) {
            this.theta -= 360;
        }

        // print("X="+this.x+",Y="+this.y);
        if (this.y > boxY) {
            socket.emit("ballDelete", this.id);
        } else {
            var data = {
                x: this.x / boxX,
                y: this.y / boxY,
                speed: this.speed / boxX,
                theta: this.theta,
                id: this.id
            };
            socket.emit("ballDebug", data);
        }
    }

    display() {
        if (this.y - (boxY - height) > 0) {
            ellipse(this.x, this.y - (boxY - height), boxX / 60, boxX / 60);
        } else {
            triangle(this.x, 30, this.x + 15, 45, this.x - 15, 45);
        }
    }
}