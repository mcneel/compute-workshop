var rhino = null;
var model = {
  curves: [],
  points: null,
};

rhino3dm().then(function(m) {
  rhino = m; // global
  run();
});

RhinoCompute.authToken = RhinoCompute.getAuthToken(true);

function run() {
  let canvas = getCanvas();
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  window.addEventListener('keydown', onKeyDown);
  model.points = new rhino.Point3dList();
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
  let [x,y] = getXY(evt);
  if (model.points.count > 0) {
    let index = model.points.count - 1;
    model.points.set(index, [x, y, 0])
  } else {
    model.points.add(x, y, 0);
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

async function onKeyDown(evt) {
  switch(evt.key) {
    case "Enter":
      save();
      break;
    case "u":
      await createBooleanUnion();
      break;
  }
  draw();
}

function save() {
  if (model.points.count < 4) { // 3 pts (min.) + next pt
    console.error('Not enough points!');
  } else {
    let index = model.points.count - 1;
    model.points.removeAt(index);
    let degree = model.points.count - 1;
    if (degree > 3)
      degree = 3;
    model.curves.push(rhino.NurbsCurve.create(true, degree, model.points));
  }
  model.points = new rhino.Point3dList();
}

function draw() {
  let canvas = getCanvas();
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i=0; i<model.curves.length; i++) {
    drawNurbsCurve(ctx, model.curves[i]);
  }
  if (model.points !== null && model.points.count > 0) {
    // close
    // let points = clonePoint3dList(model.points);
    // let [x, y, z] = points.get(0);
    // points.add(x, y, z);
    let degree = model.points.count - 1;
    if (degree > 3)
      degree = 3;
    let curve = rhino.NurbsCurve.create(true, degree, model.points);
    drawNurbsCurve(ctx, curve);
    // let dup = curve.clone();
    // console.log(curve.points());
    drawControlPolygon(ctx, curve.points());
    curve.delete();
  }
}

function drawNurbsCurve(ctx, curve) {
  // if( controlPoints.count<2 )
  //   return;
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';

  const divisions = 200; // TODO
  ctx.beginPath();

  let [t0,t1] = curve.domain;
  let [x,y,z] = curve.pointAt(t0);
  ctx.moveTo(x,y);
  for(let j=1; j<=divisions; j++) {
    let t = t0 + j / divisions * (t1-t0);
    let [x,y,z] = curve.pointAt(t);
    ctx.lineTo(x,y);
  }
  ctx.stroke();
}

function drawControlPolygon(ctx, points) {
  ctx.strokestyle = 'darkgray';
  ctx.setLineDash([4,4]);
  ctx.beginPath();
  for(let i=0; i<points.count; i++) {
    let [x,y,z] = points.get(i);
    if(0==i)
      ctx.moveTo(x, y);
    else
      ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  for(i=0; i<points.count; i++) {
    let [x,y,z] = points.get(i);
    ctx.fillRect(x-1,y-1, 3, 3);
    ctx.strokeRect(x-2, y-2, 5, 5);
  }
}

async function createBooleanUnion() {
  let unionCurves = [];
  try {
    let res = await RhinoCompute.Curve.createBooleanUnion(model.curves);
    for (let i=0; i<res.length; i++) {
      unionCurves.push(rhino.CommonObject.decode(res[i]));
    }
  } catch (e) {
    console.error(e);
    return;
  }
  if (unionCurves.length > 0) {
    model.curves = unionCurves;
  }
}
