import * as THREE from 'three';
import {Lensflare, LensflareElement} from 'three/examples/jsm/objects/Lensflare';
import flareTexture01 from '../assets/img/lensFlare/lensflare3.png';
import flareTexture02 from '../assets/img/lensFlare/lensflare1.png';

import lampPost from '../assets/model-3d/lamp_post/scene.gltf';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class LampPost{
    constructor(color, internsity, pos, height){
        this.color = color;
        this.internsity = internsity;
        this.pos = pos;
        this.threeLamp = new THREE.Group();
        this.threeLamp.name = 'lampPost';
        this.threeLamp.receiveShadow = true;
        this.threeLamp.castShadow = true;
        this.height = height;
        
        this.initThree();
    }

    constructSimplesPost(){
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, this.height),
            new THREE.MeshStandardMaterial({color: 0x740202})
        );

        box.castShadow = true;
        box.receiveShadow = true;

        this.threeLamp.add(box);
    }

    constructPost(){
        const GLTFloader = new GLTFLoader();
        GLTFloader.load(lampPost, module => {
            module.castShadow = true;
            module.receiveShadow = true;
            module.scene.rotation.x = Math.PI / 2;

            // module.scene.position.set(0,0,-2.6);

            const postBoundingBox = new THREE.Box3().setFromObject(module.scene);
            const postSize = postBoundingBox.getSize(new THREE.Vector3());

            let scaleFactor = this.height / postSize.z;
            module.scene.scale.set(scaleFactor,scaleFactor,scaleFactor);

            module.scene.position.set(0,0, - (postSize.z  * module.scene.scale.z / 2));
            

            this.threeLamp.add(module.scene);
            // console.log(this.threeLamp)
        }, undefined, 
        () => {
            console.log("error on loading lamp post model");
            this.constructSimplesPost();
        });
    }

    constructLight(){
        const light = new THREE.SpotLight(
            this.color,
            this.internsity,
        );
        light.name = 'light';

        const textureLoader = new THREE.TextureLoader();

        const lensTexture = [
            textureLoader.load(flareTexture01),
            textureLoader.load(flareTexture02),
        ];

        const multValue = 2;

        const lensFlare = new Lensflare();
        lensFlare.addElement( new LensflareElement( lensTexture[0], 70 * multValue, 0, light.color ) );
        lensFlare.addElement( new LensflareElement( lensTexture[2], 6 * multValue, 0.6 ) );
        lensFlare.addElement( new LensflareElement( lensTexture[2], 7 * multValue, 0.7 ) );
        lensFlare.addElement( new LensflareElement( lensTexture[2], 12 * multValue, 0.9 ) );
        lensFlare.addElement( new LensflareElement( lensTexture[2], 7 * multValue, 1 ) );
        light.add(lensFlare)

        const pos = this.pos;
        
        light.angle = Math.PI / 3;
        light.castShadow = true;
        
        light.position.set(0, 0, pos.z + (this.height / 2) - 1);
        this.threeLamp.add(light);
    }

    initThree(){
        this.constructPost();
        this.constructLight();
        const pos = this.pos;
        this.threeLamp.position.set(pos.x, pos.y, pos.z + (this.height / 2));

    }
}

export default LampPost;