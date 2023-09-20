/**
 * Escena.js
 * 
 * Seminario #2 GPC: Pintar una escena básica con transformaciones, 
 * aminación y modelos importados.
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
let esferaCubo;
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
    scene.background = new THREE.Color( 0.0, 0.0, 0.2);

    //Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set( 0.5, 2, 7);
    camera.lookAt( 0, 1, 0);
}

function loadScene(){
    const material = new THREE.MeshBasicMaterial( {color:'yellow', wireframe: true});

    const geoCubo = new THREE.BoxGeometry( 2, 2, 2);

    const cubo = new THREE.Mesh( geoCubo, material );

    scene.add(cubo);

}

function update(){

}

function render(){
    requestAnimationFrame( render);
    update();
    renderer.render( scene, camera);
}