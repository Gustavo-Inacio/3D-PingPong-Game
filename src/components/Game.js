import * as THREE from 'three';
import Ball from './Ball';
import Player from './Player';

import eleticSound from '../assets/audio/circuit-shock/audio01.ogg';
import eleticSound02 from '../assets/audio/circuit-shock/audio02.ogg';
import eleticSound03 from '../assets/audio/circuit-shock/audio03.ogg';

class Game{
    constructor(court, camera, gameSize, ball = new Ball(), player1 = new Player(), player2 = new Player()){
        this.threeGroup = new THREE.Group();
        this.ball = ball;
        this.balls = [
            ball
        ]
        this.players = [
            player1,
            player2
        ];
        this.gameSize = gameSize;
        this.camera = camera;
        this.court = court;

        this.allDelta = 0;

        this.threeGroup.position.set( this.court.threeGroup.position.x,  this.court.threeGroup.position.y,  this.court.threeGroup.position.z) 

        this.playersScore = [0,0];

        this.gameTimeLine = [
            {
                name: 'flashLight',
                method: () => {this.flashingLight()},
                done: false,
                action: {
                    type: 'velocity',
                    mark: 13
                }
            },
            {
                name: 'flashLight',
                method: () => {this.flashingLight()},
                done: false,
                action: {
                    type: 'velocity',
                    mark: 25
                }
            },
        ];

        this.assets = {
            audio : {
                'shortCircuit0': undefined, 
                'shortCircuit1': undefined, 
                'shortCircuit2': undefined, 
            }
        }

        this.initThree();

        
    }

    loadAssets(){
        const audioLoader = new THREE.AudioLoader();
        const audioListener = new THREE.AudioListener();
        
        audioListener.setMasterVolume(.2);

        const shortCircuit = [
            [eleticSound, new THREE.Audio(audioListener)],
            [eleticSound02, new THREE.Audio(audioListener)],
            [eleticSound03, new THREE.Audio(audioListener)],
        ];

        shortCircuit.forEach((audio, key) => {
            audioLoader.load(audio[0], (audioBuffer) => {
                audio[1].setBuffer(audioBuffer);

                this.assets.audio[`shortCircuit${key}`] = audio[1];

                if(key == 2){
                    this.assets.audio[`shortCircuit${key}`].onEnded = () => {
                        this.assets.audio[`shortCircuit${key}`].stop();
                        this.changeLightsColor(new THREE.Color(0xffffffff));
                    }
                }
            });
        });


        
    }

    initThree(){
        this.balls[0].threeGroup.position.set(0,0, 0.5)
        this.threeGroup.add(this.balls[0].threeGroup);

        this.players[0].threeGroup.position.set(0,-10,0);
        this.players[1].threeGroup.position.set(5,10,0);

        this.threeGroup.add(this.players[0].threeGroup);
        this.threeGroup.add(this.players[1].threeGroup);

        this.gameBounding = new THREE.Box3().setFromObject(this.court.threeGroup);
        this.playerBounding = new THREE.Box3().setFromObject(this.players[0].threeGroup);
        this.ballBounding = new THREE.Box3().setFromObject(this.balls[0].threeGroup);

        this.lastDeltaGame = 0;

        this.setPlayerScore(0,0);
        this.setPlayerScore(1,0);

       this.handlePlayer1Motion();
       this.loadAssets();
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
                this.players[0].threeGroup.position.set(pos.x, - this.gameSize.y / 2, 0.5)
    
        })
    }

    simpleAIPlayerMovement(player){
        player.threeGroup.position.set(this.balls[0].threeGroup.position.x, player.threeGroup.position.y, 0.5)
    }

    ballMotion(){
        let delta = this.allDelta;

        this.balls[0].velocity.set(
            this.balls[0].velocity.x += this.balls[0].acceleration.x * delta,
            this.balls[0].velocity.y += this.balls[0].acceleration.y * delta,
        )
        this.balls[0].threeGroup.position.set(
            this.balls[0].threeGroup.position.x += this.balls[0].velocity.x * delta,
            this.balls[0].threeGroup.position.y += this.balls[0].velocity.y * delta,
        );

        this.handleCollision(delta);
    }

    handleCollision(delta){
        if(this.ballCollideFence()){
            this.balls[0].threeGroup.position.set(
                this.balls[0].threeGroup.position.x -= this.balls[0].velocity.x * delta,
                this.balls[0].threeGroup.position.y -= this.balls[0].velocity.y * delta,
            );

            this.balls[0].velocity.set(
                this.balls[0].velocity.x *= -1,
                this.balls[0].velocity.y,
            );
            this.balls[0].acceleration.set(
                this.balls[0].acceleration.x *= -1,
                this.balls[0].acceleration.y,
            );
        }

        this.players.forEach((actualPlayer) => {
            this.balls.forEach((actualBall) => {
                const colision = this.ballCollidePlayer(actualBall, actualPlayer);
                if(colision.collided) {
                    actualBall.threeGroup.position.set(
                        actualBall.threeGroup.position.x -= actualBall.velocity.x * delta,
                        actualBall.threeGroup.position.y -= actualBall.velocity.y * delta,
                    ); // redo the action

                    if(this.ballCollidePlayer(actualBall, actualPlayer).collided){ // if even redoing the action , it still collided, it means the ball has collided to the player sides
                        actualBall.velocity.set( // collided in the playser sides, therefore it has to act like the fences
                            actualBall.velocity.x *= -1,
                            actualBall.velocity.y,
                        );
                        actualBall.acceleration.set(
                            actualBall.acceleration.x *= -1,
                            actualBall.acceleration.y,
                        );
                    }
                    else{
                        actualBall.velocity.set(
                            actualBall.velocity.x,
                            actualBall.velocity.y *= -1,
                        );
                        actualBall.acceleration.set(
                            actualBall.acceleration.x ,
                            actualBall.acceleration.y *= -1,
                        );
                    }
            
                    actualBall.threeGroup.position.set(
                        actualBall.threeGroup.position.x += actualBall.velocity.x * delta,
                        actualBall.threeGroup.position.y += actualBall.velocity.y * delta,
                    );
                }
            });
            
        });

        

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
                (this.balls[0].threeGroup.position.x - (ballSize.x * 1.5) >= this.threeGroup.position.x - (gameSize.x / 2)) && 
                (this.balls[0].threeGroup.position.x + (ballSize.x * 1.5) <= this.threeGroup.position.x + (gameSize.x / 2))
        )
    }

    ballCollidePlayer(ball, player){
        const playerSize = this.playerBounding.getSize(new THREE.Vector3());
        const ballSize = this.ballBounding.getSize(new THREE.Vector3);

        let toReturn = {
            collided: false,
            sides: false
        };

        if(
            (ball.threeGroup.position.x - ballSize.x / 2 <= player.threeGroup.position.x + playerSize.x / 2) &&
            (ball.threeGroup.position.y - ballSize.y / 2 <= player.threeGroup.position.y + playerSize.y / 2) && 
            (ball.threeGroup.position.y + ballSize.y / 2 >= player.threeGroup.position.y - playerSize.y / 2) && 
            (ball.threeGroup.position.x + ballSize.x / 2 >= player.threeGroup.position.x - playerSize.x / 2)
        ) toReturn.collided = true;

        return toReturn;
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
        this.balls[0].threeGroup.position.set(0,0, 0.5)
        this.threeGroup.add(this.balls[0].threeGroup);

        this.gameTimeLine.forEach((elem) => {
            elem.done = false;
        });

        this.players[0].threeGroup.position.set(0,-10,0);
        this.players[1].threeGroup.position.set(5,10,0);

        this.lastDeltaGame = this.allDelta;

        let vel = 10 * ( Math.random() - 0.5) / 1;
        if(vel > -0.05 && vel < 0.05) vel += (vel / Math.abs(vel)) * 0.05;
        
        this.balls[0].velocity.set(vel, vel)
        this.balls[0].acceleration.set((vel / Math.abs(vel)) * 0.1 , (vel / Math.abs(vel) * 0.2))
    }

    changeBallColor(){
        this.balls[0].threeGroup.children[0].material.color.set(`hsl(0, 100%, ${Math.floor(2000/ (Math.abs(this.balls[0].velocity.x) + Math.abs(this.balls[0].velocity.y)) /2)}%)`);
    }

    changeLightsColor(color){
        let coutObj = this.court.threeGroup.children;
        for(let i in coutObj){
            if(coutObj[i].name == 'lampPost'){
                const lampPostChildren = coutObj[i].children;
                for(let i in lampPostChildren){
                    if(lampPostChildren[i].name === "light"){
                        lampPostChildren[i].color.set(color);
                    }
                }
            }
        }
    }

    flashingLight(){
        const flashLight = (time)=>{
            // lights of 0.5s
            this.changeLightsColor(new THREE.Color(0,0,0));

            //lights on 0.3s
            setTimeout(() => {
                this.changeLightsColor(new THREE.Color(10,20,10));
            }, time);
            // this.changeLightsColor(new THREE.Color(0xffffff));
        }

        const allAnimation = () => {
            this.assets.audio['shortCircuit0'].play();
            setTimeout(() => {
                if(!this.assets.audio['shortCircuit1'].isPlaying)
                    this.assets.audio['shortCircuit1'].play();
                flashLight(300);
                setTimeout(() => {
                    flashLight(200);
        
                    setTimeout(() => {
                        flashLight(100);
        
                        setTimeout(() => {
                            flashLight(160);
                            setTimeout(() => {
                                this.changeLightsColor(new THREE.Color(0,0,0));
        
                                setTimeout(() => {
                                    if(this.assets.audio['shortCircuit1'].isPlaying)
                                        requestAnimationFrame(allAnimation);
                                    else{
                                        this.assets.audio['shortCircuit2'].play();
                                        flashLight((this.assets.audio['shortCircuit2'].source.buffer.duration * 1000) /2);   
                                    }
                                    
                                }, 500 );
        
                            }, 200);
                        }, 300);
                    }, 700);
                    
                }, 310);
            }, 2000)
        }

        allAnimation();
    }

    changeObjsColor()
    {
        this.changeBallColor();
    }

    runTimeLine(){
        for(let i in this.gameTimeLine){
            if(this.gameTimeLine[i].done === false && this.gameTimeLine[i].action.type === 'velocity' && this.gameTimeLine[i].action.mark < (Math.abs(this.balls[0].velocity.x) + Math.abs(this.balls[0].velocity.y))){
                this.gameTimeLine[i].method();
                this.gameTimeLine[i].done = true;

            }
        }
            
    }

    update(delta){
        this.allDelta = delta;
        this.ballMotion();
        this.simpleAIPlayerMovement(this.players[1])
        this.runTimeLine();
        this.changeObjsColor();
    }
}

export default Game;