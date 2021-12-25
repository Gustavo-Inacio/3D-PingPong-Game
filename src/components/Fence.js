import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fenceGLTF from '../assets/model-3d/rabitz_grid/scene.gltf';

class Fence {
    constructor(pos, width, height, deph){
        this.width = width;
        this.deph = deph;
        this.height = height;
        this.position = pos;
        this.threeGroup = new THREE.Group();

        this.threeInit();
    }

    threeInit(){
        const myGLTFLoader = new GLTFLoader();

        myGLTFLoader.load(fenceGLTF, (module) => {
            const fenceBounding  = new THREE.Box3().setFromObject(module.scene);
            const fenceSize = fenceBounding.getSize(new THREE.Vector3());
            this.position.z += fenceSize.z / 2;

            module.scene.castShadow = true;
            module.scene.receiveShadow = true;
    
            const scaleFactor = this.height / fenceSize.y;
            module.scene.scale.set(scaleFactor, this.width / fenceSize.y, scaleFactor);
            module.scene.rotation.y = Math.PI / 2;

    
            module.scene.position.set(this.position.x, this.position.y, this.position.z);
            this.threeGroup.add(module.scene);
        });
    }
}

export default Fence;