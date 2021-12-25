import * as THREE from 'three';
import Ball from './Ball';
import Player from './Player';

class Game{
    constructor(court, camera, gameSize, ball = new Ball(), player1 = new Player(), player2 = new Player()){
        this.threeGroup = new THREE.Group();
        this.ball = ball;
        this.player1 = player1;
        this.player2 = player2;
        this.gameSize = gameSize;
        this.camera = camera;
        this.court = court;

        this.threeGroup.position.set( this.court.threeGroup.position.x,  this.court.threeGroup.position.y,  this.court.threeGroup.position.z) 
        this.initThree();
    }

    initThree(){
        this.ball.threeGroup.position.set(0,0, 0.5)
        this.threeGroup.add(this.ball.threeGroup);

        this.player1.threeGroup.position.set(0,-10,0);

        this.threeGroup.add(this.player1.threeGroup);
        this.threeGroup.add(this.player2.threeGroup);

       this.handlePlayer1Motion();
    }

    handlePlayer1Motion(){
        const gameBounding = new THREE.Box3().setFromObject(this.threeGroup);
        const gameSize = gameBounding.getSize(new THREE.Vector3);

        const playerBounding = new THREE.Box3().setFromObject(this.player1.threeGroup);
        const playerSize = playerBounding.getSize(new THREE.Vector3);

        window.addEventListener('mousemove', (event) => {
            let vector = new THREE.Vector3((event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
            vector.unproject( this.camera );
            let dir = vector.sub( this.camera.position ).normalize();
            let distance = - this.camera.position.z / dir.z;
            let pos = this.camera.position.clone().add( dir.multiplyScalar( distance ) );

            let mousePosIn = (pos.x >= this.threeGroup.position.x - gameSize.x - playerSize.x) && (pos.x <= this.threeGroup.position.x + gameSize.x + playerSize.x);
            if(mousePosIn) 
                this.player1.threeGroup.position.set(pos.x, - this.gameSize.y / 2, 0.5)
        
            console.log(pos)
        })
    }

    update(delta){
        // this.ball.threeGroup.position.x -= 0.01 * delta;
    }
}

export default Game;