import * as THREE from 'three';

class Player{
    constructor(){
        this.threeGroup = new THREE.Group();
        
        this.initThree();
    }

    initThree(){
        const playerBox = new THREE.Mesh(
            new THREE.BoxGeometry(2,1,1),
            new THREE.MeshStandardMaterial({color: 0xfffff})
        );

        playerBox.castShadow = true;
        playerBox.receiveShadow = true;
        playerBox.position.set(0,0,0);

        this.threeGroup.add(playerBox);
    }
}

export default Player;