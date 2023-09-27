/**
 * Practica2.js
 * 
 * Practica #2 GPC: Pintar una escena de un brazo robot usando
 * distintas geometrías de threejs
 * 
 * @author <pmarara@upv.es, Pablo Martínez Aragón>, 2023
 * 
 */

// Modulos necesarios 
import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"

// Variables de consenso
let renderer, scene, camera;

// Otras globales
let robot, brazo;
let angulo = 0;

// Acciones
init();
loadScene();
render();

function init(){
    // Motor de reglas
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild( renderer.domElement);

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 1, 1, 1);

    //Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set( 80, 280, 80);
    camera.lookAt( 0, 150, 0);
    //camera.position.set( 70, 207.5, 0); camera.lookAt( 0, 207.5, 10);
   
}

function loadScene(){

    // Material
    const material = new THREE.MeshBasicMaterial( {color:'red', wireframe: true, side: THREE.DoubleSide});
    const materialSuelo = new THREE.MeshBasicMaterial({color:'blue', wireframe: false});
    const materialVisual = new THREE.MeshBasicMaterial({color:'black', wireframe: true});

    // Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(1000,1000,100,100), materialSuelo);
    suelo.rotation.x = -Math.PI/2;
    scene.add(suelo);


    //Construimos las pinzas
    const pinza = new THREE.BufferGeometry();
    const coordenadasPinzas = [ //12 vértices
        0,0,0,  0,0,-4,  19,0,0,  19,0,-4,  38,3,0,  38,3,-2,
        0,20,0,  0,20,-4,  19,20,0,  19,20,-4,  38,17,0, 38,17,-2
    ]
    const indicesPinzas = [ //20 triangulos
        0,1,3,  0,2,3,  2,3,5,  2,4,5,  
        0,2,6,  2,6,8,  2,4,8,  4,8,10,
        0,1,6,  1,6,7,  4,5,11, 4,10,11,
        6,8,9,  6,7,9,  8,10,11,  8,9,11, 
        1,3,7,  3,7,9,  3,5,9,  5,9,11
    ]
    pinza.setAttribute('position', new THREE.Float32BufferAttribute(coordenadasPinzas,3));
    pinza.setIndex(indicesPinzas);
    const pinzaIz = new THREE.Mesh( pinza, material);
    pinzaIz.position.set(0,10,-10);
    pinzaIz.rotation.x = Math.PI/2;

    const pinzaDe = new THREE.Mesh( pinza, material);
    pinzaDe.position.set(0,-10,10);
    pinzaDe.rotation.x = 3*Math.PI/2;

    

    //Construimos la mano
    const geoMano = new THREE.CylinderGeometry(15, 15, 40, 15);
    const mano = new THREE.Mesh( geoMano, material);
    mano.position.set(0,80,0);
    mano.rotation.x = Math.PI/2;
    mano.add(pinzaIz);
    mano.add(pinzaDe);

    //Construimos los nervios
    const geoNervios = new THREE.BoxGeometry( 4, 80, 4);
    const nervio1 = new THREE.Mesh(geoNervios, material);
    const nervio2 = new THREE.Mesh(geoNervios, material);
    const nervio3 = new THREE.Mesh(geoNervios, material);
    const nervio4 = new THREE.Mesh(geoNervios, material);
    nervio1.position.set(8,0,8);
    nervio2.position.set(-8,0,8);
    nervio3.position.set(8,0,-8);
    nervio4.position.set(-8,0,-8);
    const nervios = new THREE.Object3D();
    nervios.add(nervio1);
    nervios.add(nervio2);
    nervios.add(nervio3);
    nervios.add(nervio4);
    nervios.position.set(0,40,0);

    //Construimos el objeto disco
    const geoDisco = new THREE.CylinderGeometry(22, 22, 6, 22);
    const disco = new THREE.Mesh( geoDisco, material);

    //Contruimos el objeto antebrazo
    const antebrazo = new THREE.Object3D();
    antebrazo.add(disco);
    antebrazo.add(nervios);
    antebrazo.add(mano);
    antebrazo.position.y = 120;

    //Construimos el objeto rotula
    const geoRotula = new THREE.SphereGeometry(20,20,20);
    const rotula = new THREE.Mesh(geoRotula, material);
    rotula.position.set(0,120,0);
    
    // Construimos el objeto esparrago
    const geoEsparrago = new THREE.BoxGeometry( 12, 120, 18);
    const esparrago = new THREE.Mesh(geoEsparrago, material);
    esparrago.position.set(0,60,0);

    // Construimos el objeto eje
    const geoEje = new THREE.CylinderGeometry( 20, 20, 18, 20);
    const eje = new THREE.Mesh( geoEje, material );
    eje.rotation.x = Math.PI/2;

    // Construimos el objeto brazo
    const brazo = new THREE.Object3D();
    brazo.add(eje);
    brazo.add(esparrago);
    brazo.add(rotula);
    brazo.add(antebrazo);

    // Construimos el objeto base
    const geoCilindro = new THREE.CylinderGeometry( 50, 50, 15, 50);
    const base = new THREE.Mesh( geoCilindro, material );
    base.add(brazo);

    // Construimos el objeto robot
    robot = new THREE.Object3D();
    robot.add(base);
    robot.position.set(0,7.5,0);
   
   
    // Añadimos el robot a la escena
    scene.add(robot);
    scene.add( new THREE.AxisHelper(100));
}

function update(){
    angulo += 0.01;
    robot.rotation.y = angulo;
}

function render(){
    requestAnimationFrame( render);
    update();
    renderer.render( scene, camera);
}