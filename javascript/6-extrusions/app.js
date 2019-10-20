let args = {
    algo : null,
    pointer : null,
    values : []
};

let definition = null;

// get slider values
let count = document.getElementById("count").value;
let radius = document.getElementById("radius").value;
let length = document.getElementById("length").value;

console.log(count);

let param1 = new RhinoCompute.Grasshopper.DataTree("RH_IN:201:Length");
param1.append([0], [length]);

let param2 = new RhinoCompute.Grasshopper.DataTree("RH_IN:201:Radius");
param2.append([0], [radius]);

let param3 = new RhinoCompute.Grasshopper.DataTree("RH_IN:201:Count");
param3.append([0], [count]);



rhino3dm().then(async m => {
    console.log('Loaded rhino3dm.');
    rhino = m; // global

    // authenticate
    RhinoCompute.authToken = RhinoCompute.getAuthToken();

    // if you have a different Rhino.Compute server, add the URL here:
    //RhinoCompute.url = "";

    // load a .gh (binary) file!
    let url = 'BranchNodeRnd.gh';
    let res = await fetch(url);
    let buffer = await res.arrayBuffer();
    let arr = new Uint8Array(buffer);
    definition = arr;

    // try this instead to load a .ghx (xml) file!
    // let url = 'BranchNodeRnd.ghx';
    // let res = await fetch(url);
    // let text = await res.text();
    // definition = text;

    init();
    compute();
});

function compute(){

    console.log('compute()')
    // console.log(param3.data.InnerTree)

    // clear values
    trees = [];

    trees.push(param1);
    trees.push(param2);
    trees.push(param3);

    // trees = [param1, param2, param3]

    // console.log(param3);

    RhinoCompute.Grasshopper.evaluateDefinition(definition, trees).then(result => {
    // RhinoCompute.computeFetch("grasshopper", args).then(result => {
        console.log(result);

        let data = JSON.parse(result.values[0].InnerTree['{ 0; }'][0].data);
        let mesh = rhino.CommonObject.decode(data);

        let material = new THREE.MeshNormalMaterial();
        let threeMesh = meshToThreejs(mesh, material);

        // clear meshes from scene
        scene.traverse(child => {
            if(child.type === 'Mesh'){
                scene.remove(child);
            }
        });

        scene.add(threeMesh);
    });
}

function onSliderChange(){

    // get slider values
    count = document.getElementById("count").value;
    radius = document.getElementById("radius").value;
    length = document.getElementById("length").value;

    // console.log(count);

    param1 = new RhinoCompute.Grasshopper.DataTree("RH_IN:201:Length");
    param1.append([0], [length]);

    param2 = new RhinoCompute.Grasshopper.DataTree("RH_IN:201:Radius");
    param2.append([0], [radius]);

    param3 = new RhinoCompute.Grasshopper.DataTree("RH_IN:201:Count");
    param3.append([0], [count]);

    // console.log(param3.data.InnerTree)

    compute();

}

// BOILERPLATE //

var scene, camera, renderer, controls, composer;

function init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(1,1,1);
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 10000 );

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    var canvas = document.getElementById("canvas");
    canvas.appendChild( renderer.domElement );

    controls = new THREE.OrbitControls( camera, renderer.domElement  );

    camera.position.z = 50;

    window.addEventListener( 'resize', onWindowResize, false );

    animate();
}

var animate = function () {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    animate();
}

function meshToThreejs(mesh, material) {
    var geometry = new THREE.BufferGeometry();
    var vertices = mesh.vertices();
    var vertexbuffer = new Float32Array(3 * vertices.count);
    for( var i=0; i<vertices.count; i++) {
      pt = vertices.get(i);
      vertexbuffer[i*3] = pt[0];
      vertexbuffer[i*3+1] = pt[1];
      vertexbuffer[i*3+2] = pt[2];
    }
    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.addAttribute( 'position', new THREE.BufferAttribute( vertexbuffer, 3 ) );

    indices = [];
    var faces = mesh.faces();
    for( var i=0; i<faces.count; i++) {
      face = faces.get(i);
      indices.push(face[0], face[1], face[2]);
      if( face[2] != face[3] ) {
        indices.push(face[2], face[3], face[0]);
      }
    }
    geometry.setIndex(indices);

    var normals = mesh.normals();
    var normalBuffer = new Float32Array(3*normals.count);
    for( var i=0; i<normals.count; i++) {
      pt = normals.get(i);
      normalBuffer[i*3] = pt[0];
      normalBuffer[i*3+1] = pt[1];
      normalBuffer[i*3+2] = pt[1];
    }
    geometry.addAttribute( 'normal', new THREE.BufferAttribute( normalBuffer, 3 ) );
    return new THREE.Mesh( geometry, material );
}