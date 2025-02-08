import * as THREE from "three";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "../node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "../node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "../node_modules/three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "../node_modules/three/examples/jsm/shaders/RGBShiftShader.js";
import { GammaCorrectionShader } from "../node_modules/three/examples/jsm/shaders/GammaCorrectionShader.js";

const METALNESS_PATH = "https://res.cloudinary.com/dg5nsedzw/image/upload/v1641657200/blog/vaporwave-threejs-textures/metalness.png";

console.log(THREE.REVISION);

const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener("resize", onResize);

const scene = new THREE.Scene(); // créer la scène
scene.fog = new THREE.Fog("#000000", 1, 2.5); // ajout d'un brouillard

const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 0.01, 20); // Créer une caméra

const renderer = new THREE.WebGLRenderer({ antialias: true }); // Créer un renderer
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// CONTROLES
const controle = new OrbitControls(camera, renderer.domElement);

// CAMERA
camera.position.set(0, 0.06, 1.1);

// TEXTURE LOADER
const loader = new THREE.TextureLoader();
const gridTexture = loader.load("./assets/grid.png");
const terrainTexture = loader.load("./assets/heightImage.png");
const metalnessTexture = loader.load(METALNESS_PATH);

// BUILD SCENE
const planeFront = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 2, 24, 24),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: gridTexture,
    displacementMap: terrainTexture,
    displacementScale: 0.4,
    metalnessMap: metalnessTexture,
    metalness: 0.86,
    roughness: 0.8,
  })
);
scene.add(planeFront);
planeFront.rotation.x = -Math.PI * 0.5;
planeFront.position.z = 0.15;

// SECOND PLANE
const planeBack = planeFront.clone();
scene.add(planeBack);

// POST PROCESSING
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const rgbShiftPass = new ShaderPass(RGBShiftShader);
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);

composer.addPass(renderPass);
composer.addPass(rgbShiftPass);
composer.addPass(gammaCorrectionPass);

rgbShiftPass.uniforms.amount.value = 0.00015; // A modifier pour modifier le RGB des lignes et l'espacement

// LIGHT
const light = new THREE.AmbientLight(0xffffff, 10);
scene.add(light);

// Spotlight droit qui vise à droite
const spotlight = new THREE.SpotLight('#d53c3d', 20, 25, Math.PI * 0.1, 0.25);
spotlight.position.set(0.5, 0.75, 2.2);

// Target les lumières en direction des flancs
spotlight.target.position.x = -0.25;
spotlight.target.position.y = 0.25;
spotlight.target.position.z = 0.25;
scene.add(spotlight);
scene.add(spotlight.target);

// Spotlight gauche qui vise à droite
const spotlight2 = new THREE.SpotLight('#d53c3d', 20, 25, Math.PI * 0.1, 0.25);
spotlight2.position.set(-0.5, 0.75, 2.2);

// Target les lumières en direction des flancs
spotlight2.target.position.x = 0.25;
spotlight2.target.position.y = 0.25;
spotlight2.target.position.z = 0.25;
scene.add(spotlight2);
scene.add(spotlight2.target);

// Animation
const clock = new THREE.Clock();

function animation(time) {
  const elapsedTime = clock.getElapsedTime();

  requestAnimationFrame(animation);
  
  planeFront.position.z = (elapsedTime * 0.15) % 2;
  planeBack.position.z = ((elapsedTime * 0.15) % 2) - 2;

  controle.update();
  composer.render();
}

// Render
animation();
