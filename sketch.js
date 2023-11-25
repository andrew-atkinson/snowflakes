let flakes = [],
  font,
  textArr,
  numFlakes = 300,
  dropIndexCounter = 0,
  dropFreq = 20,
  loopPos = 1,
  loopSpeed,
  newSetUp = false,
  pauseDuration = 90,
  dropSpeed = 0.4,
  sampleScale = 0.2;

function preload() {
  font = loadFont("fonts/Pacifico-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  sampleScale = map(width, 1000, 500, 0.2, 0.5, true);
  noStroke();
  textArr = setUpText();
  loopSpeed = textArr.length/200;
  flakes = makeFlakes(numFlakes);
}

function draw() {
  background(15, 15, 25);
  stroke(255);
  strokeWeight(1);
  loopPos += loopSpeed;
  if (textArr) {
    if (loopPos <= textArr.length) {
      // draw the text
      drawPoints(loopPos, textArr);
    } else if (loopPos < textArr.length + pauseDuration) {
      // 'pause' with the text drawn
      drawPoints(textArr.length, textArr);
    } else if (loopPos >= textArr.length + pauseDuration && !newSetUp) {
      // draw the points falling
      fallPoints(textArr, dropIndexCounter);
      dropIndexCounter += dropFreq;
    } else {
      // start the loop again and reset variables
      textArr = setUpText();
      loopPos = 1;
      dropIndexCounter = 0;
      newSetUp = false;
    }
  }

  for (let i = 0; i < flakes.length; i++) {
    flakes[i].update();
    flakes[i].draw();
  }
}

class Flake {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.a = random(PI);
    this.spin = random(-0.02, 0.02) * 3;
    this.size = random(width/100, width/30);
    this.pointsArr = [];
  }

  createPoints() {
    let points = [];
    for (let i = 0; i < this.size; i += random(width/500, width/150)) {
      points.push({
        x: i,
        y: 0,
        s: random(0, 1+ width/500),
        c: color(random(200, 255), random(200, 255), 255, 120),
      });
    }
    return points;
  }

  update() {
    if (this.y > height) {
      this.y = random(-50, -10);
    }
    this.y += this.size / 30;
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.a + this.spin);
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < this.pointsArr.length; j++) {
        this.pointsArr[j].c.setAlpha(
          random(this.pointsArr[j].s, this.pointsArr[j].s * 65)
        );
        stroke(this.pointsArr[j].c);
        strokeWeight(this.pointsArr[j].s);
        point(this.pointsArr[j].x, this.pointsArr[j].y);
      }
      rotate(PI / 3);
    }
    pop();
    this.a += this.spin;
  }
}

function makeFlakes(num) {
  let arr = [];
  for (let i = 0; i < num; i++) {
    let flake = new Flake();
    flake.pointsArr = flake.createPoints();
    arr.push(flake);
  }
  return arr;
}

function drawPoints(loopPos, points) {
  for (let i = 0; i < loopPos; i++) {
    strokeWeight(random(width * 0.0003, width * 0.003));
    point(points[i].x, points[i].y);
  }
}

function fallPoints(points, dropIndexCounter) {
  let restart = true;
  points.forEach((p) => {
    if (p.y < height + 100) {
      restart = false;
    }
    if (dropIndexCounter > p.dropIndex) {
      p.speed += dropSpeed;
      p.y += p.speed;
    }
  });
  drawPoints(textArr.length, points);
  if (restart) {
    newSetUp = true;
  }
}

function setUpText() {
  let textArr = ["what?"];
  let str = getURLParams();
  if (str.message) {
    let wordsSize = 1;
    let words = decodeURIComponent(str.message);
    textAlign(CENTER, CENTER);
    textSize(wordsSize);
    while (textWidth(words) + width * 0.2 <= width) {
      textSize(wordsSize++);
      if (wordsSize >= height * 0.8) {
        break;
      }
    }
    let offset = width - textWidth(words);
    textArr = font.textToPoints(
      words,
      offset / 2,
      height / 2 + wordsSize / 3,
      wordsSize,
      {
        sampleFactor: sampleScale,
      }
    );
    textArr.forEach((el) => {
      el.dropIndex = floor(random(textArr.length));
      el.speed = 1;
    });
  }
  return textArr;
}
