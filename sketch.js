let flakes = [],
  fr = 0,
  frameRateCalc = false,
  frameRateFactor = 1,
  font,
  textArr,
  numFlakes = 300,
  dropIndexCounter = 0,
  dropFreq = 20,
  loopPos = 1,
  loopSpeed,
  pauseDuration = 90,
  dropSpeed = 0.4,
  sampleScale = 0.2,
  lines = [],
  evalFrames = 5;

function preload() {
  font = loadFont("fonts/Pacifico-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setUpSketch();
}

function draw() {
  background(15, 15, 25);
  stroke(255);
  strokeWeight(1);
  if (frameCount > 30 && lines) {
    lines.forEach((line) => {
      line.update();
    });
  }

  for (let i = 0; i < flakes.length; i++) {
    flakes[i].update();
    flakes[i].draw();
  }

  loopPos += loopSpeed;
  if (frameCount <= evalFrames) {
    fr += frameRate();
  } else if (!frameRateCalc) {
    frameRateFactor = min(fr / evalFrames / 30, 1);
    frameRateCalc = true;
    numFlakes = numFlakes * frameRateFactor;
    if (frameRateFactor < 1) {
      setUpSketch();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setUpSketch();
}

function setUpSketch() {
  lines = [];
  sampleScale = map(width, 1000, 500, 0.2, 0.5, true);
  noStroke();
  let params = getURLParams();
  let numLines = 0;
  if (params.to) {
    numLines++;
  }
  if (params.message) {
    numLines++;
  }
  if (params.from) {
    numLines++;
  }

  let maxHeight = height / numLines;
  let previousY = 0;
  let delay = 0;
  if (params.to) {
    let words = new Words(
      params.to,
      previousY + maxHeight * 0.66,
      loopPos,
      maxHeight,
      delay,
      pauseDuration
    );
    words.setUpWords();
    lines.push(words);
    previousY += maxHeight;
  }
  if (params.message) {
    delay += 60;
    let words = new Words(
      params.message,
      previousY + maxHeight * 0.66,
      loopPos,
      maxHeight,
      delay,
      pauseDuration
    );
    words.setUpWords();
    lines.push(words);
    previousY += maxHeight;
  }
  if (params.from) {
    delay += 60;
    let words = new Words(
      params.from,
      previousY + maxHeight * 0.66,
      loopPos,
      maxHeight,
      delay,
      pauseDuration
    );
    lines.push(words);
  }

  let longestLine = lines.reduce((acc, curr) => {
    if (curr.textArr.length > acc) {
      return curr.textArr.length;
    }
    return acc;
  }, 1);

  loopSpeed = floor(longestLine / 200);
  flakes = makeFlakes(floor(numFlakes * frameRateFactor));
}

class Flake {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.a = random(PI);
    this.spin = random(-0.02, 0.02) * 3;
    this.size = random(
      Math.sqrt((width * height) / 2000),
      Math.sqrt((width * height) / 500)
    );
    this.pointsArr = [];
  }

  createPoints() {
    let points = [];
    for (let i = 0; i < this.size; i += random(width / 500, width / 150)) {
      points.push({
        x: i,
        y: 0,
        s: random(0, 1 + Math.sqrt(width / 300)),
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

class Words {
  constructor(message, y, loopPos, maxHeight, startdelay, pauseDuration) {
    this.message = decodeURIComponent(message);
    this.y = y;
    this.textArr = [];
    this.wordsSize = 1;
    this.offset = 0;
    this.maxHeight = maxHeight;
    this.loopPos = loopPos;
    this.newSetUp = false;
    this.startdelay = startdelay;
    this.pauseDuration = pauseDuration;
    this.dropIndexCounter = 0;
    this.setUpWords();
  }

  setUpWords() {
    textAlign(CENTER, CENTER);
    textSize(this.wordsSize);
    while (textWidth(this.message) + width * 0.2 <= width) {
      textSize(this.wordsSize++);
      if (this.wordsSize >= this.maxHeight) {
        break;
      }
    }
    this.offset = width - textWidth(this.message);
    this.textArr = font.textToPoints(
      this.message,
      this.offset / 2,
      this.y,
      this.wordsSize,
      {
        sampleFactor: sampleScale * frameRateFactor,
      }
    );
    this.textArr.forEach((el) => {
      el.dropIndex = floor(random(this.textArr.length));
      el.speed = 1;
    });
  }

  drawPoints(length) {
    for (let i = 0; i < length; i++) {
      strokeWeight(random(width * 0.0003, width * 0.003));
      point(this.textArr[i].x, this.textArr[i].y);
    }
  }

  fallPoints(dropIndexCounter) {
    let restart = true;
    this.textArr.forEach((p) => {
      if (p.y < height + 100) {
        restart = false;
      }
      if (dropIndexCounter > p.dropIndex) {
        p.speed += dropSpeed;
        p.y += p.speed;
      }
    });
    this.drawPoints(this.textArr.length);
    if (restart) {
      this.newSetUp = true;
    }
  }

  update() {
    if (this.startdelay <= 0 && this.loopPos <= this.textArr.length) {
      // draw the text
      this.drawPoints(this.loopPos);
    } else if (
      this.startdelay <= 0 &&
      this.loopPos < this.textArr.length + this.pauseDuration
    ) {
      // 'pause' with the text drawn
      this.drawPoints(this.textArr.length);
    } else if (
      this.startdelay <= 0 &&
      this.loopPos >= this.textArr.length + this.pauseDuration &&
      !this.newSetUp
    ) {
      // draw the points falling
      this.fallPoints(this.dropIndexCounter);
      this.dropIndexCounter += dropFreq;
    } else {
      // start the loop again and reset variables
      this.setUpWords();
      this.loopPos = 1;
      this.dropIndexCounter = 0;
      this.newSetUp = false;
    }
    this.loopPos += loopSpeed;
    this.startdelay--;
  }
}
