import './style.scss'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import Court from './components/Court';

import grass from './assets/img/grass.jpg';
import grassNormal from './assets/img/grassNormal.png';
import Game from './components/Game';

let scene, camera, renderer, clock, gameObj = [], controls;

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const size = 20;
const divisions = 2;

// let gridHelper;


const tick = () =>
{
    const elapsedTime = clock.getDelta()
    gameObj.forEach(actualGame => {
        actualGame.update(elapsedTime); 
    });
    

    renderer.render(scene, camera)
    controls.update();

    // gridHelper.position.set(gameObj[0].player1.threeGroup.position.x, 0,0.5)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

const init = () => {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 20,100)

    // gridHelper = new THREE.GridHelper( size, divisions );
    // gridHelper.rotation.x = Math.PI /2;
    // gridHelper.position.set(0,0,0.5)
    // scene.add( gridHelper );

    
    const canvas = document.querySelector('canvas.webgl');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas
    });

    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    clock = new THREE.Clock()

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
        
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200)
    camera.position.x = 0
    camera.position.y = 0
    camera.position.z = 2
    scene.add(camera)

    controls = new OrbitControls( camera, renderer.domElement );

    const gameSize = new THREE.Vector3();

    const court = new Court();
    court.threeGroup.position.set(0,0,0)
    scene.add(court.threeGroup);

    const ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
    scene.add( ambient );


    
    // const axesHelper = new THREE.AxesHelper( 5 );
    // scene.add( axesHelper );


    const initGame = async () => {


        gameObj[0] = new Game(court, camera, new THREE.Vector3(10,20,0));
        scene.add(gameObj[0].threeGroup);
    }
    initGame();


    THREE.DefaultLoadingManager.onLoad = () => {
        tick();
    }
}

const addTestGeometry = () => {

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
}


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

init();