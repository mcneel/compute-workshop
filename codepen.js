var rhino = null;
var model = {
  polylines: [],
  points: null,
};

rhino3dm().then(function(m) {
  rhino = m; // global
  run();
});

function run() {
  let canvas = getCanvas();
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  window.addEventListener('keydown', onKeyDown);
  model.points = new rhino.Point3dList();
}

function getCanvas() { return document.getElementById('canvas'); }

function onMouseDown(evt) {
  let [x,y] = getXY(evt);
  if (model.points.count > 0) {
    let index = model.points.count - 1;
    model.points.set(index, [x, y, 0])
  } else {
    model.points.add(x, y, 0);
    // model.points.add(x, y, 0);
  }
  model.points.add(x, y, 0);
  draw();
}

function onMouseMove(evt) {
  let index = model.points.count - 1;
  if (index >= 0) {
    let [x,y] = getXY(evt);
    model.points.set(index, [x, y, 0]);
    draw();
  }
}

function onKeyDown(event) {
  if (event.keyCode !== 13) { // 13 == Enter
    return;
  }
  // console.log(model.points.count);
  if (model.points.count < 4) { // 3 pts (min.) + next pt
    console.error('Not enough points!');
  } else {
    let index = model.points.count - 1;
    model.points.removeAt(index);
    let polyline = new rhino.Polyline(model.points.count);
    for (let i=0; i<model.points.count; i++) {
      let [x, y, z] = model.points.get(i);
      polyline.add(x, y, z);
    }
    // close
    let [x, y, z] = model.points.get(0);
    polyline.add(x, y, z);
    // store new polyline
    model.polylines.push(polyline);
  }
  model.points = new rhino.Point3dList();

  // debug
  // let lengths = [];
  // for (let i=0; i<model.polylines.length; i++) {
  //   lengths.push(model.polylines[i].count);
  // }
  // console.log(lengths);

  draw();
}

function getXY(evt) {
  let canvas = getCanvas();
  let rect = canvas.getBoundingClientRect();
  let x = evt.clientX - rect.left;
  let y = evt.clientY - rect.top;
  return [x,y];
}

function draw() {
  let canvas = getCanvas();
  let ctx = canvas.getContext('2d');
  clear(ctx);
  for (let i=0; i<model.polylines.length; i++) {
    drawPolyline(ctx, model.polylines[i]);
  }
  if (model.points !== null && model.points.count > 0) {
    drawPolyline(ctx, model.points);
  }
}

function drawPolyline(ctx, points) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  for (let i=0; i<points.count; i++) {
    let [x, y, z] = points.get(i);
    if (0 === i)
      ctx.moveTo(x, y);
    else
      ctx.lineTo(x, y);
  }
  // draw all polylines closed
  if (points.get(0) !== points.get(points.count - 1)) {
    let [x, y, z] = points.get(0);
    ctx.lineTo(x, y, 0);
  }
  ctx.stroke();
}

function clear(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
