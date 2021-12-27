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

        this.allDelta = 0;

        this.threeGroup.position.set( this.court.threeGroup.position.x,  this.court.threeGroup.position.y,  this.court.threeGroup.position.z) 

        this.playersScore = [0,0];

        this.initThree();
    }

    initThree(){
        this.ball.threeGroup.position.set(0,0, 0.5)
        this.threeGroup.add(this.ball.threeGroup);

        this.player1.threeGroup.position.set(0,-10,0);
        this.player2.threeGroup.position.set(5,10,0);

        this.threeGroup.add(this.player1.threeGroup);
        this.threeGroup.add(this.player2.threeGroup);

        this.gameBounding = new THREE.Box3().setFromObject(this.court.threeGroup);
        this.playerBounding = new THREE.Box3().setFromObject(this.player1.threeGroup);
        this.ballBounding = new THREE.Box3().setFromObject(this.ball.threeGroup);

        this.lastDeltaGame = 0;

        this.setPlayerScore(0,0);
        this.setPlayerScore(1,0);

       this.handlePlayer1Motion();
    }

    handlePlayer1Motion(){
        const gameSize = this.gameBounding.getSize(new THREE.Vector3);
        const playerSize = this.playerBounding.getSize(new THREE.Vector3);

        window.addEventListener('mousemove', (event) => {
            let vector = new THREE.Vector3((event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
            vector.unproject( this.camera );
            let dir = vector.sub( this.camera.position ).normalize();
            let distance = - this.camera.position.z / dir.z;
            let pos = this.camera.position.clone().add( dir.multiplyScalar( distance ) );

            let mousePosIn = (pos.x >= this.threeGroup.position.x - (gameSize.x / 2) + playerSize.x ) && (pos.x <= this.threeGroup.position.x + (gameSize.x /2 ) - playerSize.x );
            if(mousePosIn) 
                this.player1.threeGroup.position.set(pos.x, - this.gameSize.y / 2, 0.5)
    
        })
    }

    simpleAIPlayerMovement(player){
        player.threeGroup.position.set(this.ball.threeGroup.position.x, player.threeGroup.position.y, 0)
    }

    ballMotion(){
        let delta = this.allDelta;

        this.ball.velocity.set(
            this.ball.velocity.x += this.ball.acceleration.x * delta,
            this.ball.velocity.y += this.ball.acceleration.y * delta,
        )
        this.ball.threeGroup.position.set(
            this.ball.threeGroup.position.x += this.ball.velocity.x * delta,
            this.ball.threeGroup.position.y += this.ball.velocity.y * delta,
        );

        this.handleCollision(delta);
    }

    handleCollision(delta){
        if(this.ballCollideFence()){
            this.ball.threeGroup.position.set(
                this.ball.threeGroup.position.x -= this.ball.velocity.x * delta,
                this.ball.threeGroup.position.y -= this.ball.velocity.y * delta,
            );

            this.ball.velocity.set(
                this.ball.velocity.x *= -1,
                this.ball.velocity.y,
            );
            this.ball.acceleration.set(
                this.ball.acceleration.x *= -1,
                this.ball.acceleration.y,
            );
        }

        if(this.ballCollidePlayer()) {
            this.ball.velocity.y *= -1;
            this.ball.acceleration.y *= -1;
    
            this.ball.threeGroup.position.set(
                this.ball.threeGroup.position.x += this.ball.velocity.x * delta,
                this.ball.threeGroup.position.y += this.ball.velocity.y * delta,
            );
        }

        let gool = this.ballGool()
        if(gool.isGool){
            let newScore = this.playersScore[gool.point] + 1;
            this.setPlayerScore(gool.point, newScore); 
            this.resetGame(delta);
        }
    }

    setPlayerScore(player, score){
        this.playersScore[player] = score;

        let scoreElment = document.querySelector(`#player${player}Score`);
        scoreElment.innerHTML = this.playersScore[player];
    }

    ballCollideFence(){
        const gameSize = this.gameBounding.getSize(new THREE.Vector3);
        const ballSize = this.ballBounding.getSize(new THREE.Vector3);

        return !(
                (this.ball.threeGroup.position.x - (ballSize.x * 1.5) >= this.threeGroup.position.x - (gameSize.x / 2)) && 
                (this.ball.threeGroup.position.x + (ballSize.x * 1.5) <= this.threeGroup.position.x + (gameSize.x / 2))
        )
    }

    ballCollidePlayer(){
        const playerSize = this.playerBounding.getSize(new THREE.Vector3());
        const ballSize = this.ballBounding.getSize(new THREE.Vector3);

        let players = [
            this.player1,
            this.player2
        ];

        let collided = false;

        players.forEach((actualPlayer) => {
            if(
                (this.ball.threeGroup.position.x + ballSize.x / 2 >= actualPlayer.threeGroup.position.x - playerSize.x / 2) &&
                (this.ball.threeGroup.position.x - ballSize.x / 2 <= actualPlayer.threeGroup.position.x + playerSize.x / 2) &&
                (this.ball.threeGroup.position.y - ballSize.y / 2 <= actualPlayer.threeGroup.position.y + playerSize.y / 2) && 
                (this.ball.threeGroup.position.y + ballSize.y / 2 >= actualPlayer.threeGroup.position.y - playerSize.y / 2)
            ) collided = true;
        });

        return collided;
    }

    ballGool(){
        const ballSize = this.ballBounding.getSize(new THREE.Vector3);
        const gameSize = this.gameBounding.getSize(new THREE.Vector3);

        let balls = [
            this.ball
        ];

        let toReturn = {
            isGool : false,
        };

        balls.forEach((actualBall) => {
            const passedBottomLimit = actualBall.threeGroup.position.y + ballSize.y / 2 < this.court.threeGroup.position.y - gameSize.y / 2;
            const passedUpperLimit = actualBall.threeGroup.position.y - ballSize.y / 2 > this.court.threeGroup.position.y + gameSize.y / 2;

            if(passedBottomLimit){
                toReturn.isGool = true;
                toReturn.point = 1;// upper Player
                toReturn.ball = actualBall;
            }
            else if(passedUpperLimit){
                toReturn.isGool = true;
                toReturn.point = 0;// bottom 
                toReturn.ball = actualBall;
            }
                
        });

        return toReturn;
    }

    resetGame(){
        this.ball.threeGroup.position.set(0,0, 0.5)
        this.threeGroup.add(this.ball.threeGroup);

        this.player1.threeGroup.position.set(0,-10,0);
        this.player2.threeGroup.position.set(5,10,0);

        this.lastDeltaGame = this.allDelta;

        let vel = 10 * ( Math.random() - 0.5) / 1;
        if(vel > -0.05 && vel < 0.05) vel += (vel / Math.abs(vel)) * 0.05;
        
        this.ball.velocity.set(vel, vel)
        this.ball.acceleration.set((vel / Math.abs(vel)) * 0.1 , (vel / Math.abs(vel) * 0.1))
    }

    update(delta){
        this.allDelta = delta;
        this.ballMotion();
        this.simpleAIPlayerMovement(this.player2)
    }
}

export default Game;