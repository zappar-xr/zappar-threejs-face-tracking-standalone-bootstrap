// ZapparThree provides a LoadingManager that shows a progress bar while
// the assets are downloaded
let manager = new ZapparThree.LoadingManager();

// Setup ThreeJS in the usual way
let renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Setup a Zappar camera instead of one of ThreeJS's cameras
let camera = new ZapparThree.Camera();

// The Zappar library needs your WebGL context, so pass it
ZapparThree.glContextSet(renderer.getContext());

// Create a ThreeJS Scene and set its background to be the camera background texture
let scene = new THREE.Scene();
scene.background = camera.backgroundTexture;

// Request the necessary permission from the user
ZapparThree.permissionRequestUI().then(function(granted) {
    if (granted) camera.start(true); // For face tracking let's use the user-facing camera
    else ZapparThree.permissionDeniedUI();
});

// Set up our face tracker group
// Pass our loading manager in to ensure the progress bar works correctly
let tracker = new ZapparThree.FaceTrackerLoader(manager).load();
let trackerGroup = new ZapparThree.FaceAnchorGroup(camera, tracker);
scene.add(trackerGroup);

// Add some content
let box = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshBasicMaterial()
);
box.scale.set(0.1, 0.1, 0.1);
box.position.set(0, 0, 0.5);
trackerGroup.add(box);

// If you'd like, you can have a textured face-fitting mesh
// Pass our loading manager in to ensure the progress bar works correctly
let faceMesh = new ZapparThree.FaceMeshLoader(manager).load();
let faceBufferGeometry = new ZapparThree.FaceBufferGeometry(faceMesh);
let faceMeshObject = new THREE.Mesh(
    faceBufferGeometry,
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader(manager).load("faceMeshTemplate.png"),
        transparent: true
    })
);

trackerGroup.add(faceMeshObject);

// Set up our render loop
function render() {
    requestAnimationFrame(render);
    camera.updateFrame(renderer);
    faceBufferGeometry.updateFromFaceAnchorGroup(trackerGroup);

    renderer.render(scene, camera);
}

requestAnimationFrame(render);