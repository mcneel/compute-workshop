// global variables
var rhino = null;
var model = {
  // saved polylines
  polylines: [],
  // new polyline
  points: null,
};

// wait for the rhino3dm web assembly to load asynchronously
rhino3dm().then(function(m) {
  rhino = m; // global
  run();
});

// initialise canvas and model
function run() {
  let canvas = getCanvas();
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  window.addEventListener('keyup', onKeyUp);
  model.points = new rhino.Point3dList();
}

/* * * * * * * * * * * * * * * *  interaction   * * * * * * * * * * * * * * * */

// handles mouse down events
// adds a new vertex at the location of the mouse
function onMouseDown(event) {
  let [x,y] = getXY(event);

  // if this is a brand new polyline, add the first vertex
  if (model.points.count === 0) {
    model.points.add(x, y, 0);
  }
  
  // add a new control point that will be saved on the next mouse click
  // (the location of the previous control point is now frozen)
  model.points.add(x, y, 0);
  draw();
}

// handles mouse move events
// the next (potential) vertex follows the mouse
function onMouseMove(event) {
  let index = model.points.count - 1;
  if (index >= 0) {
    let [x,y] = getXY(event);
    model.points.set(index, [x, y, 0]);
    draw();
  }
}

// handles key up events
function onKeyUp(event) {
  switch (event.key) {
    // when the enter key is pressed, save the new polyline
    case "Enter":
      if (model.points.count < 4) { // 3 pts (min.) + next pt
        console.error('Not enough points!');
      } else {
        // remove the last point in the list (a.k.a. next)
        let index = model.points.count - 1;
        model.points.removeAt(index);

        // construct a polyline from the points list
        let polyline = new rhino.Polyline(model.points.count);
        for (let i=0; i<model.points.count; i++) {
          let [x, y, z] = model.points.get(i);
          polyline.add(x, y, z);
        }

        // close polyline
        let [x, y, z] = model.points.get(0);
        polyline.add(x, y, z);

        // store new polyline
        model.polylines.push(polyline);
      }
      // clear points list
      model.points = new rhino.Point3dList();
      break;
  }
  draw();
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

  // draw saved polylines
  for (let i=0; i<model.polylines.length; i++) {
    drawPolyline(ctx, model.polylines[i]);
  }

  // draw new (in-progress) polyline
  // (Polyline herits Point3dList, so we can use the same draw function)
  if (model.points !== null && model.points.count > 0) {
    drawPolyline(ctx, model.points);
  }
}

// draws a polyline
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