var _a = null;
var _b = null;

function run() {
  let canvas = getCanvas();
  canvas.addEventListener('mousedown', onMouseDown);
}

function getCanvas() { return document.getElementById('canvas'); }

function getXY(evt) {
  let canvas = getCanvas();
  let rect = canvas.getBoundingClientRect();
  let x = evt.clientX - rect.left;
  let y = evt.clientY - rect.top;
  return [x,y];
}

function onMouseDown(evt) {
  if(evt.buttons==2) {
    // right mouse button down... start over
    clear();
    _a = null;
    _b = null;
  } else {
    let [x,y] = getXY(evt);
    if (_a == null) {
      _a = [x, y, 0]
    } else {
      _b = [x, y, 0]
      draw()
      _a = null;
      _b = null;
    }
  }
}

function clear() {
  let canvas = getCanvas();
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  drawLine(_a, _b)
}

function drawLine(a, b) {
  let canvas = getCanvas();
  let ctx = canvas.getContext('2d');
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  var line = new rhino.Line(a, b);
  ctx.beginPath();
  ctx.moveTo(line.from[0], line.from[1]);
  ctx.lineTo(line.to[0], line.to[1]);
  ctx.stroke();
}
