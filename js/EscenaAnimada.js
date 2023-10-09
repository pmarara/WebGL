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
import {OrbitControls} from "../lib/OrbitControls.module.js"
import {TWEEN} from "../lib/tween.module.min.js"
import Stats from "../lib/stats.module.js"
import {GUI} from "../lib/lil-gui.module.min.js"

// Variables de consenso
let renderer, scene, camera, cameraControls, stats, effectController;

// Otras globales
let esferaCubo,cubo,esfera,suelo;
let angulo = 0;

// Acciones
init();
loadScene();
setupGUI();
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
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0,1,0);
    camera.lookAt( 0, 1, 0);

    //Eventos atentidos
    window.addEventListener('resize', updateAspectRatio);
    renderer.domElement.addEventListener('dblclick', animate);

    //Monitor
    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.botton = '30px';
    stats.domElement.style.left = '0px';
    document.getElementById('container').appendChild(stats.domElement);
}

function loadScene(){
    const material = new THREE.MeshBasicMaterial( {color:'yellow', wireframe: true});

    const geoCubo = new THREE.BoxGeometry( 2, 2, 2);
    const geoEsfera = new THREE.SphereGeometry( 1, 10, 10);

    cubo = new THREE.Mesh( geoCubo, material );
    esfera = new THREE.Mesh( geoEsfera, material );

    esferaCubo = new THREE.Object3D();

    cubo.position.set( 1, 0, 0);
    esfera.position.set(-1, 0, 0);
    esferaCubo.position.set(0, 1, 0);

    esferaCubo.add(cubo);
    esferaCubo.add(esfera);
    scene.add(esferaCubo)


    // Suelo
    suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10,10,10), material);
    suelo.rotation.x = -Math.PI/2;
    scene.add(suelo);

    //Importar un modelo JSON
    const loader = new THREE.ObjectLoader;
    loader.load('models/soldado/soldado.json', 
                function(objeto){
                    cubo.add(objeto);
                    objeto.position.set(0,1,0);
                    objeto.name = 'soldado';
                }
    );

    //Importar modelo en GLTF
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('models/robota/scene.gltf',
                    function(gltf){
                       gltf.scene.position.y = 1;
                       gltf.scene.rotation.y = Math.PI/2;
                       gltf.scene.name = 'robot';
                       gltf.scene.scale.set (1.2, 1.2, 1.2);
                       esfera.add( gltf.scene);
                    }
    );

    scene.add( new THREE.AxisHelper(5));
}

function setupGUI(){
    // Definición del objeto controlador
    effectController = {
        mensaje: 'Soldado y Robot',
        giroY: 0.0,
        separacion: 0,
        coloralambres: 'rgb(150,150,150)'
    }

    // Crear la GUI 
    const gui = new GUI();

    // Construir el menu de widgets
    const h = gui.addFolder("Controles");
    h.add(effectController,"mensaje").name("Aplicación");
    h.add(effectController,"giroY", -180.0, 180.0, 0.025).name("Giro en Y").listen();
    h.add(effectController,"separacion",{'Ninguna':0, 'Media': 2, 'Total': 5}).name("Separación");
    h.addColor(effectController, "coloralambres").name("Color alambres");

}

function updateAspectRatio(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
}

function animate(event){

    //Capturar posición del click
    let x = event.clientX;
    let y = event.clientY;

    //Normalizar al cuadrado de 2x2
    x = ( x /window.innerWidth) * 2 - 1;
    y = -(y / window.innerHeight) * 2 + 1;

    //Construir el rayo
    const rayo = new THREE.Raycaster();
    rayo.setFromCamera( new THREE.Vector2(x,y), camera );

    // Intersecciones con soldado y robot
    const soldado = scene.getObjectByName('soldado');
    let intersecciones = rayo.intersectObject(soldado,false);
    if(intersecciones.length > 0){

        console.log("Tocado!");
        // Animación
        new TWEEN.Tween( soldado.position)
        .to( {x:[0,0], y:[3,1], z:[0,0]}, 2000)
        .interpolation( TWEEN.Interpolation.Bezier )
        .easing( TWEEN.Easing.Bounce.Out)
        .start();
    }

        // Intersecciones con soldado y robot
    const robot = scene.getObjectByName('robot');
    intersecciones = rayo.intersectObjects(robot.children,true);
    if(intersecciones.length > 0){

        console.log("Tocado!");
        // Animación
        new TWEEN.Tween( robot.rotation)
        .to( {x:[0,0], y:[-Math.PI,Math.PI/2], z:[0,0]}, 5000)
        .interpolation( TWEEN.Interpolation.Linear )
        .easing( TWEEN.Easing.Exponential.InOut)
        .start();
    }
}

function update(delta){
    //angulo += 0.01;
    //esferaCubo.rotation.y = ( angulo);
    stats.update();
    TWEEN.update(delta);
    cubo.position.set( 1+effectController.separacion/2,0,0);
    esfera.position.set( -1-effectController.separacion/2,0,0)
    suelo.material.setValues( {color:effectController.coloralambres});    
    effectController.giroY += 0.1;
    esferaCubo.rotation.y = effectController.giroY * Math.PI/180;
}

function render(delta){
    requestAnimationFrame( render);
    update(delta);
    renderer.render( scene, camera);
}