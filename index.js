
const faceMeshTexturePath = new URL("./faceMeshTemplate.png", import.meta.url).href;

// ZapparThree provides a LoadingManager that shows a progress bar while
// the assets are downloaded
const manager = new ZapparThree.LoadingManager();

// Setup ThreeJS in the usual way
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(render);

// Setup a Zappar camera instead of one of ThreeJS's cameras
const camera = new ZapparThree.Camera();

// The Zappar library needs your WebGL context, so pass it
ZapparThree.glContextSet(renderer.getContext());

// Create a ThreeJS Scene and set its background to be the camera background texture
const scene = new THREE.Scene();
scene.background = camera.backgroundTexture;

// Request the necessary permission from the user
ZapparThree.permissionRequestUI().then((granted) => {
    if (granted) camera.start(true); // For face tracking let's use the user-facing camera
    else ZapparThree.permissionDeniedUI();
});

// Set up our image tracker group
// Pass our loading manager in to ensure the progress bar works correctly
const tracker = new ZapparThree.FaceTrackerLoader(manager).load();
const trackerGroup = new ZapparThree.FaceAnchorGroup(camera, tracker);
scene.add(trackerGroup);

// Add some content
const box = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshBasicMaterial()
);
box.scale.set(0.1, 0.1, 0.1);
trackerGroup.add(box);

// Face mesh
// Pass our loading manager in to ensure the progress bar works correctly
const faceMesh = new ZapparThree.FaceMeshLoader(manager).load();
const faceBufferGeometry = new ZapparThree.FaceBufferGeometry(faceMesh);
const faceMeshObject = new THREE.Mesh(
    faceBufferGeometry,
    new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader(manager).load(faceMeshTexturePath),
        transparent: true
    })
);
trackerGroup.add(faceMeshObject);


// Set up our render loop
function render() {
    camera.updateFrame(renderer);
    faceBufferGeometry.updateFromFaceAnchorGroup(trackerGroup);
    renderer.render(scene, camera);
}
