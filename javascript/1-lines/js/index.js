
// global variables
var rhino = null;
var model = {
  // saved lines
  lines: [],
  // new line
  from: null,
  to: null
};

// wait for the rhino3dm web assembly to load asynchronously
rhino3dm().then(function(m) {
  rhino = m; // global
  run();
});

// initialise
function run() {
  let canvas = getCanvas();
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
}

/* * * * * * * * * * * * * * * *  interaction   * * * * * * * * * * * * * * * */

// handles mouse down events
function onMouseDown(evt) {
  let [x,y] = getXY(evt);
  if (model.from === null) {
    model.from = [x, y, 0];
  } else {
    line = new rhino.Line(model.from, [x, y, 0]);
    model.lines.push(line);
    // clear
    model.from = null;
    model.to = null;
  }
  draw();
}

// handles mouse move events
function onMouseMove(evt) {
  // if the first click has been set, have the second point follow the mouse
  // until it is clicked
  if (model.from !== null) {
    let [x,y] = getXY(evt);
    model.to = [x, y, 0];
    draw();
  }
}

/* * * * * * * * * * * * * * * * *  helpers   * * * * * * * * * * * * * * * * */

// gets the canvas
function getCanvas() {
  return document.getElementById('canvas');
}

// gets the [x, y] location of the mouse on the canvas
function getXY(evt) {
  let canvas = getCanvas();
  let rect = canvas.getBoundingClientRect();
  let x = evt.clientX - rect.left;
  let y = evt.clientY - rect.top;
  return [x,y];
}

/* * * * * * * * * * * * * * * * *  drawing   * * * * * * * * * * * * * * * * */

// clears the canvas and draws the model
function draw() {
  // get canvas' 2d context
  let canvas = getCanvas();
  let ctx = canvas.getContext('2d');

  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let lines = model.lines;

  // create a new line on the fly from model.from and model.to
  if (model.from !== null && model.to !== null) {
    lines = model.lines.concat([new rhino.Line(model.from, model.to)]);
  }

  // draw all the lines
  for(i=0; i<lines.length; i++) {
    drawLine(ctx, lines[i]);
  }
}

// draws a line
function drawLine(ctx, line) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(line.from[0], line.from[1]);
  ctx.lineTo(line.to[0], line.to[1]);
  ctx.stroke();
}