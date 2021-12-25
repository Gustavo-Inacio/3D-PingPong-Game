import * as THREE from 'three';
class Field {
    constructor(size, img, pos){
        this.img = img;
        this.loadedTexture = new THREE.TextureLoader().load(`${this.img.texture}`);
        this.size = size;
        this.height;
        this.pos = pos;
        this.three = new THREE.Group();
        this.initThree();
    }

    initThree(){
        //loadSVG();
        const fieldRatio = 1.9892;
        const planeWidth = this.size;
        this.height = planeWidth * fieldRatio;
        const texture = new THREE.TextureLoader().load(`${this.img.texture}`);

        const newPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(planeWidth, planeWidth * fieldRatio),
            new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true , map: this.loadedTexture} )
        );

        newPlane.receiveShadow = true;

        this.three.add(newPlane);
    }

}

export default Field;