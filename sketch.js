let flakes, font, textArr, pName;

function preload() {
  font = loadFont("fonts/Pacifico-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth - 10, windowHeight - 10);
  noStroke();

  let str = getURLParams();
  if (str.name) {
    pName = str.name.replace(/%20/g, " ");
    textArr = font.textToPoints(pName, 200, height / 2, 100, {
      sampleFactor: 0.25,
    });
  }

  flakes = [];
  for (let i = 0; i < 180; i++) {
    let flake = new Flake();
    flake.pointsArr = flake.createPoints();
    flakes.push(flake);
  }
}

function draw() {
  background(20);
  stroke(255);
  strokeWeight(1);

  if (textArr) {
    textArr.forEach((p) => point(p.x, p.y));
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
    this.size = random(10, 25);
    this.pointsArr = [];
  }

  createPoints() {
    let points = [];
    for (let i = 0; i < this.size; i += random(2, 5)) {
      points.push({
        x: i,
        y: 0,
        s: random(0, 4),
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
