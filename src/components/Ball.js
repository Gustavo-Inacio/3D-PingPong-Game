import * as THREE from 'three';

class Ball{
    constructor(color = 0xffff00 , radius = 0.5, pos = new THREE.Vector3(0,0,0)){
        this.threeGroup = new THREE.Group();
        this.color = color;
        this.radius = radius;
        this.pos = pos;
        
        this.initThree();
    }

    initThree(){
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, 40, 20),
            new THREE.MeshStandardMaterial({color: this.color})
        );

        sphere.castShadow = true;
        sphere.receiveShadow = true;

        this.threeGroup.add(sphere)
    }
}

export default Ball;