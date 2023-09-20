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
    scene.background = new THREE.Color( 0.0, 0.2, 0.9);

    //Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set( 0.5, 2, 7);
    camera.lookAt( 0, 1, 0);
}

function loadScene(){
    const material = new THREE.MeshBasicMaterial( {color:'yellow', wireframe: true});

    const geoCubo = new THREE.BoxGeometry( 2, 2, 2);
    const geoEsfera = new THREE.SphereGeometry( 1, 10, 10);

    const cubo = new THREE.Mesh( geoCubo, material );
    const esfera = new THREE.Mesh( geoEsfera, material );

    esferaCubo = new THREE.Object3D();

    cubo.position.set( 1, 0, 0);
    esfera.position.set(-1, 0, 0);
    esferaCubo.position.set(0, 1, 0);

    esferaCubo.add(cubo);
    esferaCubo.add(esfera);
    scene.add(esferaCubo)


    // Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10,10,10), material);
    suelo.rotation.x = -Math.PI/2;
    scene.add(suelo);

    //Importar un modelo JSON
    const loader = new THREE.ObjectLoader;
    loader.load('models/soldado/soldado.json', 
                function(objeto){
                    cubo.add(objeto);
                    objeto.position.set(0,1,0);
                }
    );

    //Importar modelo en GLTF
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('models/robota/scene.gltf',
                    function(gltf){
                       gltf.scene.position.y = 1;
                       gltf.scene.rotation.y = -Math.PI/2;
                       gltf.scene.scale.set (1.2, 1.2, 1.2);
                       esfera.add( gltf.scene);
                    }
    );

    scene.add( new THREE.AxisHelper(5));
}

function update(){
    angulo += 0.01;
    esferaCubo.rotation.y = ( angulo);
}

function render(){
    requestAnimationFrame( render);
    update();
    renderer.render( scene, camera);
}