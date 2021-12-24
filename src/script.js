import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import Court from './components/Court';

import grassModel3d from './assets/model-3d/simple_grass/scene.gltf';

import grass from './assets/img/grass.jpg';
import grassNormal from './assets/img/grassNormal.png';

const scene = new THREE.Scene()

const GLTFloader = new GLTFLoader();
const setGroundTexture = () => {
    // GLTFloader.load(grassModel3d, model => {
    //     model.scene.position.set(5,0,-0.42);
    //     model.scene.scale.set(0.1,0.1,0.1);
    //     model.scene.rotation.x = Math.PI / 2;
    //     scene.add(model.scene) 
    // });

    const groundTexture = {
        map: new THREE.TextureLoader().load(`${grass}`),
        normalMap:  new THREE.TextureLoader().load(`${grassNormal}`)
    };

    groundTexture.map.wrapS = THREE.RepeatWrapping;
    groundTexture.map.wrapT = THREE.RepeatWrapping;

    groundTexture.map.repeat.set( 10, 10 );

    const planeBack = new THREE.Mesh(
        new THREE.PlaneGeometry(100,100),
        new THREE.MeshPhongMaterial({map: groundTexture.map, dithering: true})
    );

    planeBack.position.set(0,0,-0.1)
    planeBack.receiveShadow = true;

    scene.add( planeBack );

}
setGroundTexture();


scene.fog = new THREE.Fog(0xffffff, 20,100)
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const canvas = document.querySelector('canvas.webgl');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const clock = new THREE.Clock()

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

const controls = new OrbitControls( camera, renderer.domElement );


const court = new Court();
scene.add(court.threeGroup);

const court2 = new Court();
court2.threeGroup.position.set(12,0,0)
scene.add(court2.threeGroup);

const ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
scene.add( ambient );

const geometry = new THREE.TorusGeometry( .7, .2, 16, 100 );


const material = new THREE.MeshPhongMaterial({color: 0xff0000})

const sphere = new THREE.Mesh(geometry,material)
scene.add(sphere)
sphere.position.z = 1;
sphere.castShadow = true;
sphere.receiveShadow = true;

const box = new THREE.Mesh (
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true } )
);
box.position.set(-2,2,1.2);
box.receiveShadow = true;
box.castShadow = true;

scene.add(box)

let materialCiliner = new THREE.MeshPhongMaterial( { color: 0x4080ff, dithering: true } );

let geometryCilinder = new THREE.CylinderGeometry( 0.5, 0.5, 4, 32, 1, false );

let meshCilinder = new THREE.Mesh( geometryCilinder, materialCiliner );
meshCilinder.position.set( .5, 1, 1 );
meshCilinder.castShadow = true;
meshCilinder.receiveShadow = true;  
scene.add( meshCilinder );

const sphereGeometryA = new THREE.SphereGeometry( .4, 32, 32 );
const sphereMaterialA = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
const sphereA = new THREE.Mesh( sphereGeometryA, sphereMaterialA );
sphereA.position.set(3,0,0.5)
sphereA.castShadow = true; //default is false
sphereA.receiveShadow = true; //default
scene.add( sphereA );


const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()
    sphere.rotation.y = .5 * elapsedTime

    renderer.render(scene, camera)
    controls.update();

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
