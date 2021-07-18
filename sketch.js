function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

let cache;
let autoUpdate = false;
let running = false;
let showCounts = false;
let refreshRate = 0.1;
let timer = 0;

let grid;
let cols;
let rows;
let resolutionX = 20;
let resolutionY = 20;
let zoomLevel = 1;

let heightMenu = 68;

function setup() {
  console.log("Made by TechDivers V4(Zoom)");

  createCanvas(resolutionX * Math.floor(windowWidth / resolutionX), resolutionY * Math.floor((windowHeight-heightMenu) / resolutionY));
  cols = (width) / resolutionX;
  rows = Math.floor((height) / resolutionY);
  grid = make2DArray(cols, rows);
  /*
  grid[2][1] = 1;
  grid[1][0] = 1;
  grid[2][2] = 1;
  grid[1][2] = 1;
  grid[0][2] = 1;*/
}

function draw() {
  translate(mouseX, mouseY);
  scale(zoomLevel);
  translate(-mouseX, -mouseY);
  background(33, 33, 33);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * resolutionX;
      let y = j * resolutionY;
      if (grid[i][j] == 1) {
        fill("#A5FFC9");
        strokeWeight(1 / zoomLevel);
        stroke("#466D56");
        rect(x, y, resolutionX, resolutionY);
      }
      let displayNeighbour = countNeighbours(grid, i, j);
      if (showCounts) {
        if (displayNeighbour > 0 || grid[i][j] == 1) {
          strokeWeight(1 / zoomLevel);
          if (grid[i][j] == 1) {
            fill("#8DDAAC");
            stroke("#75B68F");
          } else {
            stroke("#434343");
            fill("#828282");
          }
          textSize(resolutionX / 2);
          textAlign(CENTER, CENTER);
          text(displayNeighbour, x + (resolutionX / 2), y + (resolutionY / 2));
        }
      }
    }
  }
  highlightColor = color("#75B68F");
  highlightColor.setAlpha(50);
  let highlightX = Math.floor(mouseX / resolutionX) * resolutionX;
  let hightlightY = Math.floor(mouseY / resolutionY) * resolutionY;
  if (hightlightY < height) {
    fill(highlightColor);
    rect(highlightX, hightlightY, resolutionX, resolutionY);
  }
  if (autoUpdate || running) {
    if (millis() >= (refreshRate * 1000) + timer) {
      step();
      timer = millis();
    }
  }
}

function countNeighbours(grid, x, y) {
  let neighboursCount = 0;

  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {

      col = (x + i + cols) % cols;
      row = (y + j + rows) % rows;
      neighboursCount += (grid[col][row]) ? 1 : 0;
    }
  }
  let test = grid[x][y] ? 1 : 0;
  return neighboursCount - test;
}

function step() {
  let nextGrid = make2DArray(cols, rows);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {

      let neighboursCount = countNeighbours(grid, x, y);
      let state = (grid[x][y]) ? 1 : 0;
      if (state == 0 && neighboursCount == 3) {
        state = 1;
      } else if (neighboursCount > 3 || neighboursCount < 2) {
        state = 0;
      }
      nextGrid[x][y] = state;
    }
  }
  grid = nextGrid;
}

function fillRandom() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = floor(random(2));
    }
  }
}

let pressing = false;
let paintingArrayCoord = [];
let modifiedGrid = grid;

function mousePressed() {
  if (mouseY >= 0) {
    pressing = true;
    paintingArrayCoord = [];
    modifiedGrid = grid;
  }
}

function mouseDragged() {
  if (pressing) {
    let highlightX = Math.floor(mouseX / resolutionX);
    let highlightY = Math.floor(mouseY / resolutionY);

    modifiedGrid[highlightX][highlightY] = 1;
    let coords = [highlightX, highlightY];

    let indx = (highlightX * rows + highlightY);
    paintingArrayCoord[indx] = coords;
  }
}

function mouseReleased() {
  if (pressing) {
    grid = modifiedGrid;
    pressing = false;
  }
}

function paintCells(coords) {
  for (let i = 0; i <= coords.length; i++) {
    if (coords[i] != null) {
      grid[coords[i][0]][coords[i][1]] = 0;
    }
  }
}

function keyReleased() {
  if (key === 'r') {
    running = false;
  }
}

window.addEventListener("wheel", function(e) {
  if (e.deltaY > 0)
    zoomLevel *= 1.05;
  else
    zoomLevel = max(zoomLevel*0.95,1);
});

function toggle(variable) {
  //I should mb use a find by str name with windows[] but doesn't work
  switch (variable) {
    case 'showCounts':
      if (showCounts) {
        document.getElementById('settings').style.background = "#A41818";
      } else {
        document.getElementById('settings').style.background = "#18A450";
      }
      showCounts = !showCounts;
      break;
    case 'randomFill':
      fillRandom();
      break;
    case 'play':
      if (autoUpdate) {
        document.getElementById('play').style.background = "#A41818";
      } else {
        document.getElementById('play').style.background = "#18A450";
      }
      autoUpdate = !autoUpdate;
      paintingArrayCoord = [];
      break;
    case 'step':
      paintingArrayCoord = [];
      step();
      break;
    case 'cancel':
      paintCells(paintingArrayCoord);
      break;
  }
}