// global variables
var rhino = null;
var model = {
  // saved nurbs curves
  curves: [],
  // new nurbs curve
  points: null,
};

// wait for the rhino3dm web assembly to load asynchronously
rhino3dm().then(function(m) {
  rhino = m; // global
  run();
});

// pop up a dialog asking the user to authorise the compute client
RhinoCompute.authToken = RhinoCompute.getAuthToken(true);

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
// adds a new control point at the location of the mouse
function onMouseDown(event) {
  // get the location of the mouse on the canvas
  let [x,y] = getXY(event);

  // if this is a brand new curve, add the first control point
  if (model.points.count === 0) {
    model.points.add(x, y, 0);
  }

  // add a new control point that will be saved on the next mouse click
  // (the location of the previous control point is now frozen)
  model.points.add(x, y, 0);
  draw();
}

// handles mouse move events
// the last control point in the list follows the mouse
function onMouseMove(event) {
  let index = model.points.count - 1;
  if (index >= 0) {
    let [x,y] = getXY(event);
    model.points.set(index, [x, y, 0]);
    draw();
  }
}

// handles key up events
async function onKeyUp(event) {
  switch (event.key) {
    // when the enter key is pressed, save the new nurbs curve
    case "Enter":
      save();
      break;
    case "u":
      await createBooleanUnion();
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

function save() {
  if (model.points.count < 4) { // 3 pts (min.) + next pt
    console.error('Not enough points!');
  } else {
    // remove the last point in the list (a.k.a. next)
    let index = model.points.count - 1;
    model.points.removeAt(index);

    // construct a curve from the points list
    let degree = model.points.count - 1;
    if (degree > 3)
      degree = 3;

      // construct a nurbs curve
      // (first arg == true to create a closed periodic uniform curve)
    model.curves.push(rhino.NurbsCurve.create(true, degree, model.points));
  }

  // clear points list
  model.points = new rhino.Point3dList();
}

/* * * * * * * * * * * * * * * * *  drawing   * * * * * * * * * * * * * * * * */

// clears the canvas and draws the model
function draw() {
  // get canvas' 2d context
  let canvas = getCanvas();
  let ctx = canvas.getContext('2d');

  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw saved nurbs curves
  for (let i=0; i<model.curves.length; i++) {
    drawNurbsCurve(ctx, model.curves[i]);
  }

  // create a temporary curve from the points and draw it
  if (model.points !== null && model.points.count > 0) {
    let degree = model.points.count - 1;
    if (degree > 3)
      degree = 3;
    let curve = rhino.NurbsCurve.create(true, degree, model.points);
    drawNurbsCurve(ctx, curve);

    // draw control polygon from the temp curve's control points
    drawControlPolygon(ctx, curve.points());

    // delete the temp curve when we're done using it
    // (webassembly memory management isn't great)
    curve.delete();
  }
}

// draws a nurbs curve
function drawNurbsCurve(ctx, curve) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';

  const divisions = 200; // TODO: dynamic
  ctx.beginPath();

  let [t0,t1] = curve.domain;
  let [x,y,z] = curve.pointAt(t0);
  ctx.moveTo(x,y);
  for (let j=1; j<=divisions; j++) {
    let t = t0 + j / divisions * (t1-t0);
    let [x,y,z] = curve.pointAt(t);
    ctx.lineTo(x,y);
  }
  ctx.stroke();
}

// draws a control polygon
function drawControlPolygon(ctx, points) {
  // draw dashed lines between control points
  ctx.strokestyle = 'darkgray';
  ctx.setLineDash([4,4]);
  ctx.beginPath();
  for (let i=0; i<points.count; i++) {
    let [x,y,z] = points.get(i);
    if (0 === i)
      ctx.moveTo(x, y);
    else
      ctx.lineTo(x, y);
  }
  ctx.stroke();

  // draw control points
  ctx.setLineDash([]);
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  for (let i=0; i<points.count; i++) {
    let [x,y,z] = points.get(i);
    ctx.fillRect(x-1,y-1, 3, 3);
    ctx.strokeRect(x-2, y-2, 5, 5);
  }
}

// uses compute to create a boolean union of all the curves
// if successful, the curves are replaced with the result of the boolean union
async function createBooleanUnion() {
  let unionCurves = [];

  // catch errors in the compute call and deserialisation
  try {
    // send curves to compute for boolean union operation
    let res = await RhinoCompute.Curve.createBooleanUnion(model.curves);

    // deserialise opennurbs curves individually
    for (let i=0; i<res.length; i++) {
      unionCurves.push(rhino.CommonObject.decode(res[i]));
    }
  } catch (e) {
    // log errors to console
    console.error(e);
  }

  // replace the curves with the result of the boolean union
  if (unionCurves.length > 0) {
    model.curves = unionCurves;
  }
}