
const cubes = [undefined, undefined];

let cubeImg;

function preload() {
  // cube.svg is from https://toio.github.io/toio-spec/docs/ble_motor
  // Used under Creative Commons Attribution-NoDerivatives 4.0 International License.
  cubeImg = loadImage('cube.svg');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  const cvs = createCanvas(windowWidth, windowHeight);
  cvs.mouseClicked(connectCube);
  strokeWeight(2);
  textSize(18);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(0);

  // Jog Status
  const jogStats = [];
  calcJogStatus(jogStats);
  moveCubes(jogStats);

  drawCubeName();
  drawCovers();
  drawText();
}

const calcJogStatus = (jogStats) => {
  ['#00a3bc', '#bfd833'].forEach((c, i) => {
    const centerX = (pow(3, i) * width) / 4;
    const centerY = height / 2;

    // Base colored square size
    const W = (width / 2) * 0.65;

    let x = centerX;
    let y = centerY;

    if (touches.length) {
      touches.forEach((t) => {
        if (i === 0 && t.x < width / 2) {
          x = t.x;
          y = t.y;
        }
        if (i === 1 && t.x > width / 2) {
          x = t.x;
          y = t.y;
        }
      });
    } else {
      if (mouseIsPressed) {
        if (i === 0 && mouseX < width / 2) {
          x = mouseX;
          y = mouseY;
        }
        if (i === 1 && mouseX > width / 2) {
          x = mouseX;
          y = mouseY;
        }
      }
    }

    // Draw Base colored square
    drawBaseUnit(centerX, centerY, W, c);

    // Draw Cursor
    const cursorSize = W / 3;
    line(centerX, centerY, x, y);
    fill(c);
    drawCursor(x, y, cursorSize);
    fill('#00000030');
    drawCursor(x, y, cursorSize);

    const angle = atan2(centerY - y, centerX - x);
    const v = p5.Vector.fromAngle(angle);
    const magnitude = min(100, map(dist(centerX, centerY, x, y), 0, (W * 0.8) / 2, 0, 100));
    v.mult(magnitude / 100);

    jogStats.push({ angle: angle, magnitude: magnitude, vector: v });
  });

  // console.log(jogStats[0], jogStats[1]);
};

const moveCubes = (jogStats) => {
  jogStats.forEach((jogStat, j) => {
    if (jogStat) {
      let left, right;
      const magnitude = jogStat.magnitude;
      const angle = jogStat.angle;
      const v = jogStat.vector;

      if (Math.abs(angle - Math.PI / 2) < Math.PI / 9) {
        // Locked for Forward
        left = Math.round(magnitude);
        right = Math.round(magnitude);
      } else if (Math.abs(angle + Math.PI / 2) < Math.PI / 9) {
        // Locked for Backward
        left = -1 * Math.round(magnitude);
        right = -1 * Math.round(magnitude);
      } else if (Math.abs(angle) < Math.PI / 18) {
        // Locked for turning clockwise
        left = Math.round(0);
        right = Math.round(magnitude);
      } else if (
        Math.abs(angle + Math.PI) < Math.PI / 18 ||
        Math.abs(angle - Math.PI) < Math.PI / 18
      ) {
        // Locked for turning counter-clockwise
        left = Math.round(magnitude);
        right = Math.round(0);
      } else {
        if (Math.cos(angle) >= 0) {
          if (Math.sin(angle) >= 0) {
            right = Math.round(magnitude);
            left = Math.round(magnitude * v.y);
          } else {
            right = -1 * Math.round(magnitude);
            left = Math.round(magnitude * v.y);
          }
        } else {
          if (Math.sin(angle) >= 0) {
            right = Math.round(magnitude * v.y);
            left = Math.round(magnitude);
          } else {
            right = Math.round(magnitude * v.y);
            left = -1 * Math.round(magnitude);
          }
        }
      }
      const dur = 100;
      if (cubes[j]) {
        cubes[j].move(left, right, dur);
      }
    }
  });
};

const drawBaseUnit = (centerX, centerY, size, color) => {
  const circleSize = size * 0.8;
  const sqSize = size;

  push();
  {
    fill(color);

    // Outline square
    square(centerX - sqSize / 2, centerY - sqSize / 2, sqSize);

    // Outline circle
    stroke('#FFFFFF70');
    circle(centerX, centerY, circleSize);

    // N-division lines
    const numLines = 8;
    for (let i = 0; i < numLines; i++) {
      const v = p5.Vector.fromAngle((i * TAU) / numLines);
      v.mult(circleSize / 2);
      v.add(createVector(centerX, centerY));
      line(centerX, centerY, v.x, v.y);
    }
  }
  pop();
};

const drawCursor = (x, y, size) => {
  circle(x, y, size);
};

// Before connection
const drawCubeImage = (index) => {
  const cubeImgWidth = width / 2;
  const cubeImgHeight = (cubeImgWidth / cubeImg.width) * cubeImg.height;
  image(cubeImg, (index * width) / 2, height / 2 - cubeImgHeight / 2, cubeImgWidth, cubeImgHeight);
};

const drawAlphaLayer = (index) => {
  push();
  {
    noStroke();
    fill('#000000A0');
    rect((index * width) / 2, 0, width / 2, height);
  }
  pop();
};

const drawCovers = () => {
  cubes.forEach((cube, ind) => {
    if (cube === undefined) {
      drawAlphaLayer(ind);
      drawCubeImage(ind);
    } else if (cube === false) {
      drawAlphaLayer(ind);
    }
  });
};

const drawCubeName = () => {
  const centerY = height / 2;
  const W = (width / 2) * 0.7;
  push();
  {
    noStroke();
    fill('white');
    cubes.forEach((cube, ind) => {
      if (cube) {
        text(cube.cube.device.name, (ind * width) / 2 + width / 4, centerY - (W / 2) * 1.05);
      }
    });
  }
  pop();
};

const drawText = () => {

  const textJp = '接続ダイアログが表示されない場合は画面を縦向きにしてください。';
  const textEn = 'If the connection dialog does not appear, turn the screen to portrait orientation.';
  const interval = 420;
  const finalText = frameCount % interval < interval/2 ? textJp : textEn;

  push();
  {
    noStroke();
    fill('white');
    textSize(13);
    if(!cubes[0] && !cubes[1] && ( width > height)){
      text(finalText, width/2, 20);
    }
  }
  pop();

}

// Need user action for WebBluetooth
function connectCube() {
  const index = floor(mouseX / (width / 2));
  // console.log(index);

  if (cubes[index] === undefined) {
    P5tCube.connectNewP5tCube().then((cube) => {
      let finalIndex = index;
      if(cubes[index]){
        finalIndex = 1 - finalIndex; // convert index 0/1
      }
      cube.turnLightOn(finalIndex ? '#5cfc00' : '#00aeb1');
      cubes[finalIndex] = cube;
      // console.log(cube);
    });
  }
}
