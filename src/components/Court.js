import * as THREE from 'three';
import Field from './Field';
import LampPost from './LampPost';
import fieldImg from '../assets/img/field.svg';

class Court{
    constructor(){
        this.fieldSize = 10;
        this.field = new Field(this.fieldSize, {texture: fieldImg}, 10);
        this.lampPosts = {
            quantity: Math.abs(4),
            height: 3,
            lightColor: 0xffffff 
        }
        this.threeGroup = new THREE.Group();
        this.initThree();
      
    }

    plotField(){
        this.threeGroup.add(this.field.three);
    }

    plotLampPosts(){
        if(!(this.lampPosts.quantity % 2 == 0)) this.lampPosts.quantity -= 1; // deixando par o num de lampas

        let lampAreaLength = this.field.height / (this.lampPosts.quantity / 2);

        let actualLampMatrix = {
            x: 0, y: 0, z:0
        }

        let row = 0; // contador dos postes -> serve para determinar sua posicao na horizontal da quadra, pq o i so aumenta, e quando coloca em em cada linha e acaba um lado, eh preciso voltar a priemira linha para adicionar do outro lado
        for(let i = 0; i < this.lampPosts.quantity; i++){
            actualLampMatrix.x = this.fieldSize / 2;
            if(i < this.lampPosts.quantity / 2){ // esquerdo
                actualLampMatrix.x *= -1;
                row = i;
            } else { // direito
                row = i - (this.lampPosts.quantity / 2) // retorna o contador para a primeira linha
            }

            actualLampMatrix.y = row * lampAreaLength;
            actualLampMatrix.y -= this.field.height / 2 - lampAreaLength / 2;

            let actualLamp = new LampPost(
                this.lampPosts.lightColor, 0.3,
                actualLampMatrix,
            )

            this.threeGroup.add(actualLamp.threeLamp);

            actualLampMatrix = {
                x: 0, y: 0, z:0
            }

        }
    }

    initThree(){
        this.plotField();
        this.plotLampPosts();
    }
}

export default Court;