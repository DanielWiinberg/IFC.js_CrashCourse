import {
    Scene,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    PerspectiveCamera,
    WebGLRenderer,
    MOUSE,
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
    MathUtils,
    Clock,
    MeshLambertMaterial,
    DirectionalLight,
    AmbientLight,
    HemisphereLight,
    SphereGeometry,
    Light,
    AxesHelper,
    GridHelper
} from "three";

import CameraControls from "camera-controls";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import gsap from "gsap";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {CSS2DRenderer, CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer.js";

/* SCENE 
Creating the 3D scene
*/
const scene = new Scene();
const threeCanvas= document.getElementById('three-canvas');

const axes = new AxesHelper();
axes.material.depthTest = false;
axes.renderOrder = 2;
scene.add(axes);

const grid = new GridHelper();
grid.renderOrder = 1;
scene.add(grid);

/* OBJECTS
Different sections of objects and geometries from the tutorial

*/

// Simple objects
// const orangeMaterial = new MeshLambertMaterial({color: "orange"});
// const blueMaterial = new MeshLambertMaterial({color: "blue"});
// const whiteMaterial = new MeshLambertMaterial({color: "white"});

// const cube = new BoxGeometry(0.5, 0.5, 0.5);
// const sphere = new SphereGeometry(0.5);

// const orangeCube = new Mesh(cube,orangeMaterial);
// orangeCube.scale.set(2,2,2);

// const blueCube = new Mesh(cube, blueMaterial);
// blueCube.position.x += 2;

// scene.add(blueCube);
// scene.add(orangeCube);

// const cubes = [blueCube, orangeCube];

// const sun = new Mesh(sphere, orangeMaterial);
// scene.add(sun)

// const earth = new Mesh(sphere, blueMaterial);
// earth.scale.set(0.2, 0.2, 0.2);
// earth.position.x += 2;
// sun.add(earth);

// const moon = new Mesh(sphere, whiteMaterial);
// moon.scale.set(0.1, 0.1, 0.1);
// moon.position.x += 2;
// earth.add(moon);

// Primitive geometries: https://threejs.org/manual/#en/primitives

/* LOADERS
Using loaders
*/

// GLTF Loader
const loader = new GLTFLoader();

const loadingScreen = document.getElementById("loader-container");
const loadingProgress = document.getElementById("loading-progress");
let policeStation;

loader.load("./gltf/police_station.glb", 
    (gltf) => {
        policeStation = gltf.scene;
        scene.add(policeStation);
        loadingScreen.classList.add("hidden");
    },

    (progress) => {
        const progressProcent = Math.trunc(progress.loaded / progress.total * 100);
        loadingProgress.textContent = `Loading: ${progressProcent}%`;
    },

    (error) => {
        console.log(error);
    }

);


/* CAMERA 
Defining and adding a camera
*/
const camera = new PerspectiveCamera(75, threeCanvas.clientWidth / threeCanvas.clientHeight);
camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 5;
scene.add(camera);


/* RENDERER

*/

const renderer = new WebGLRenderer({
    canvas: threeCanvas,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(threeCanvas.clientWidth, threeCanvas.clientHeight, false);
renderer.setClearColor(0xE3E3E3, 1);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(threeCanvas.clientWidth, threeCanvas.clientHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.pointerEvents = "none";
labelRenderer.domElement.style.top = "0";
document.body.appendChild(labelRenderer.domElement);


/* LIGHTS
ThreeJS resource for manipulating lights:
https://threejs.org/manual/examples/lights-ambient.html
Substitute the word before .html to check different lighting options.
For example: https://threejs.org/manual/examples/lights-hemisphere.html
*/


const color = 0xffffff;
const intensity = 1;
const ambientLight = new AmbientLight(color, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(color, intensity);
directionalLight.position.set(1,2,0);
scene.add(directionalLight);

/* RESPONSIVITY 
Adjusting the view window so it always fills the screen. 
*/

window.addEventListener("resize", () => {
    camera.aspect = threeCanvas.clientWidth / threeCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(threeCanvas.clientWidth, threeCanvas.clientHeight, false);
    labelRenderer.setSize(threeCanvas.clientWidth, threeCanvas.clientHeight);
})

/* CONTROLS 
Importing and using the CameraControls package
*/

const subsetOfTHREE = {
    MOUSE,
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
    MathUtils: {
      DEG2RAD: MathUtils.DEG2RAD,
      clamp: MathUtils.clamp
    }
};

CameraControls.install( { THREE: subsetOfTHREE } )
const clock = new Clock();
const cameraControls = new CameraControls(camera, threeCanvas);
cameraControls.dollyToCursor = true;

/* PICKING 
Using raycasting to find elements that the mouse hovers over
*/

const raycaster = new Raycaster();
const mouse = new Vector2();

const highlightMaterial = new MeshBasicMaterial({color: "red"});
const previousSelection = {
    mesh: null,
    material: null
}

// HOVERING OVER
// window.addEventListener("mousemove", (event) => {
//     // Formula for getting position of the mouse when using "mousemove" event
//     mouse.x = event.clientX / threeCanvas.clientWidth * 2 - 1;
// 	mouse.y = - (event.clientY / threeCanvas.clientHeight) * 2 + 1;

//     raycaster.setFromCamera(mouse, camera);
//     const intersection = raycaster.intersectObjects(cubes);
    
//     if(intersection.length == 0){
//         if(previousSelection.mesh){
//             previousSelection.mesh.material = previousSelection.material;
//             previousSelection.material = null;
//             previousSelection.mesh = null;
//         }
//         return;
//     }

//     const intersectedObject = intersection[0].object;
//     if(previousSelection.mesh === intersectedObject) return;

//     previousSelection.mesh = intersectedObject;
//     previousSelection.material = intersectedObject.material;

//     intersectedObject.material = highlightMaterial;
// })



window.addEventListener("dblclick", (event) => {
    mouse.x = event.clientX / threeCanvas.clientWidth * 2 - 1;
	mouse.y = - (event.clientY / threeCanvas.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersection = raycaster.intersectObject(policeStation);

    if(!intersection.length) return;

    const intersectionPoint = intersection[0].point;

    const message = window.prompt("Write message");

    const labelContainer = document.createElement("div");
    labelContainer.className = "label-container";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.className = "delete-button hidden";
    labelContainer.appendChild(deleteButton);

    const label = document.createElement("p");
    label.textContent = message;
    label.classList.add("label");
    labelContainer.appendChild(label);

    const labelObject = new CSS2DObject(labelContainer);
    labelObject.position.copy(intersectionPoint);
    scene.add(labelObject);

    deleteButton.onclick = () => {
        labelObject.removeFromParent();
        labelObject.element = null;
        labelContainer.remove();
    }

    labelContainer.onmouseenter = () => deleteButton.classList.remove("hidden");
    labelContainer.onmouseleave = () => deleteButton.classList.add("hidden");
})


/* ANIMATION 
Updating the renderer continiously
*/
function animate() {
    const delta = clock.getDelta();
    cameraControls.update(delta);

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();


/* DEBUGGING 
Adding simple gui elements to the scene, so elements can be changed without reloading. 
*/

// const gui = new GUI();

// const transformationFolder = gui.addFolder("Transformation");

// transformationFolder.add(sun.position, "x", -3, 3, 0.1).name("Position X");
// transformationFolder.add(sun.position, "y", -3, 3, 0.1).name("Position Y");
// transformationFolder.add(sun.position, "z", -3, 3, 0.1).name("Position Z");

// const colorParam = {value: 0xffffff};

// gui.addColor(colorParam, "value").name("Color").onChange(() => {
//     sun.material.color.set(colorParam.value);
// })

// const functionParam = {
//     spin: () => {
//         gsap.to(sun.rotation, {y: sun.rotation.y + 10, duration: 1});
//     }
// }

// gui.add(functionParam, "spin");