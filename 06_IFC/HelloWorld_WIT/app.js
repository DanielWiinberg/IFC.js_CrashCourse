import {
  AmbientLight,
  AxesHelper,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Raycaster,
  Vector2,
  MeshLambertMaterial,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {IFCLoader} from "web-ifc-three"
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree
} from 'three-mesh-bvh';

//Creates the Three.js scene
const scene = new Scene();

//Object to store the size of the viewport
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Creates the camera (point of view of the user)
const camera = new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 15;
camera.position.y = 13;
camera.position.x = 8;

//Creates the lights of the scene
const lightColor = 0xffffff;

const ambientLight = new AmbientLight(lightColor, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(lightColor, 2);
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);

//Sets up the renderer, fetching the canvas of the HTML
const threeCanvas = document.getElementById("three-canvas");
const renderer = new WebGLRenderer({ canvas: threeCanvas, alpha: true });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//Creates grids and axes in the scene
const grid = new GridHelper(50, 30);
scene.add(grid);

const axes = new AxesHelper();
axes.material.depthTest = false;
axes.renderOrder = 1;
scene.add(axes);

//Creates the orbit controls (to navigate the scene)
const controls = new OrbitControls(camera, threeCanvas);
controls.enableDamping = true;
controls.target.set(-2, 0, 0);

//Animation loop
const animate = () => {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

//Adjust the viewport to the size of the browser
window.addEventListener("resize", () => {
  (size.width = window.innerWidth), (size.height = window.innerHeight);
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
});


// IFC LOADER
const ifcModels = [];
const ifcLoader = new IFCLoader();

// Sets up optimized picking
ifcLoader.ifcManager.setupThreeMeshBVH(
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast);

const filePath = "ifc_sampleFiles/01.ifc"

async function loadIFC() {
  await ifcLoader.ifcManager.setWasmPath("wasm/");
  const model = await ifcLoader.loadAsync(filePath);
  scene.add(model);
  ifcModels.push(model);
}

loadIFC();

// Loading with file-input picker 
// const input = document.getElementById("file-input");

// input.addEventListener("change", async () => {

//     await ifcLoader.ifcManager.setWasmPath("wasm/");

//     const file = input.files[0];
//     const url = URL.createObjectURL(file);
//     const model = await ifcLoader.loadAsync(url);
//     scene.add(model);
// })

// SELECTING ELEMENTS
const raycaster = new Raycaster();
raycaster.firstHitOnly = true;
const mouse = new Vector2();

function cast(event) {

  // Computes the position of the mouse on the screen
  const bounds = threeCanvas.getBoundingClientRect();

  const x1 = event.clientX - bounds.left;
  const x2 = bounds.right - bounds.left;
  mouse.x = (x1 / x2) * 2 - 1;

  const y1 = event.clientY - bounds.top;
  const y2 = bounds.bottom - bounds.top;
  mouse.y = -(y1 / y2) * 2 + 1;

  // Places it on the camera pointing to the mouse
  raycaster.setFromCamera(mouse, camera);

  // Casts a ray
  return raycaster.intersectObjects(ifcModels);
}

// Event that gets executed when an item is picked
async function pick(event) {
  const found = cast(event)[0];
  if (found) {
      const index = found.faceIndex;
      const geometry = found.object.geometry;
      const ifc = ifcLoader.ifcManager;
      const id = ifc.getExpressId(geometry, index);
      const modelID = found.object.modelID;
      const props = await ifc.getItemProperties(modelID, id);
      console.log(JSON.stringify(props, null, 2));
  }
}

threeCanvas.ondblclick = (event) => pick(event);

// Creates subset material
const preselectMat = new MeshLambertMaterial({
  transparent: true,
  opacity: 0.6,
  color: 0xff88ff,
  depthTest: false
})

const ifc = ifcLoader.ifcManager;

// Reference to the previous selection
let preselectModel = { id: - 1};

function highlight(event, material, model) {
    const found = cast(event)[0];
    if (found) {

        // Gets model ID
        model.id = found.object.modelID;

        // Gets Express ID
        const index = found.faceIndex;
        const geometry = found.object.geometry;
        const id = ifc.getExpressId(geometry, index);

        // Creates subset
        ifcLoader.ifcManager.createSubset({
            modelID: model.id,
            ids: [id],
            material: material,
            scene: scene,
            removePrevious: true
        })
    } else {
        // Removes previous highlight
        ifc.removeSubset(model.id, material);
    }
}

window.onmousemove = (event) => highlight(event, preselectMat, preselectModel);

const selectMat = new MeshLambertMaterial({
  transparent: true,
  opacity: 0.6,
  color: 0xff00ff,
  depthTest: false })

const selectModel = { id: - 1};
window.ondblclick = (event) => highlight(event, selectMat, selectModel);