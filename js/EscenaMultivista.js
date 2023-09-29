/**
 * EscenaMultivista.js
 * 
 * Seminario #3 GPC: Pintar una escena básica con transformaciones, 
 * y modelos importados en 4 vistas diferentes.
 * 
 * @author <pmarara@upv.es, Pablo Martínez Aragón>, 2023
 * 
 */

// Modulos necesarios 
import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"

// Variables de consenso
let renderer, scene, camera;

// Otras globales
let esferaCubo;
let angulo = 0;

//Controlador de camara
let cameraControls;

// Camaras adicionales
let planta, alzado, perfil;
const L = 5;

// Acciones
init();
loadScene();
render();

function init(){
    // Motor de reglas
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color( 0.0, 0.2, 0.9));
    document.getElementById("container").appendChild( renderer.domElement);
    renderer.autoClear = false;

    // Escena
    scene = new THREE.Scene();
    //scene.background = new THREE.Color( 0.0, 0.2, 0.9); //DA ERROR AL HACER UN CLEAR DEL RENDERER

    //Camara
    const ar = window.innerWidth/window.innerHeight;
    setOrtographicCameras(ar);

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set( 0.5, 2, 7);
    cameraControls = new OrbitControls( camera,renderer.domElement);
    cameraControls.target.set( 0,1,0);
    camera.lookAt( 0, 1, 0);

    //Events
    window.addEventListener('resize', updateAspectRatio);
    window.addEventListener('dblclick', rotateElement );
}

function setOrtographicCameras(ar){
    let camaraOrtografica;

    if (ar>1){
        camaraOrtografica = new THREE.OrthographicCamera( -L*ar, L*ar, L, -L, -100, 100);
    }else{
        camaraOrtografica = new THREE.OrthographicCamera( -L, L, L/ar, -L/ar, -100, 100);
    }

    alzado = camaraOrtografica.clone();
    alzado.position.set( 0,0,L);
    alzado.lookAt(0,1,0);

    perfil = camaraOrtografica.clone();
    perfil.position.set( L,0,0);
    perfil.lookAt(0,1,0);

    planta = camaraOrtografica.clone();
    planta.position.set( 0,L,0);
    planta.lookAt(0,1,0);
    planta.up = new THREE.Vector3(0,0,-1);
}

function loadScene(){
    const material = new THREE.MeshBasicMaterial( {color:'yellow', wireframe: true});

    const geoCubo = new THREE.BoxGeometry( 2, 2, 2);
    const geoEsfera = new THREE.SphereGeometry( 1, 10, 10);

    const cubo = new THREE.Mesh( geoCubo, material );
    const esfera = new THREE.Mesh( geoEsfera, material );

    esferaCubo = new THREE.Object3D();
    esferaCubo.name = 'grupoEC';

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

function rotateElement(event){
    // Capturo la posición del click (s.r. top-left)
    let x = event.clientX;
    let y = event.clientY;

    // Cambia al s.r. cuadrado de 2x2
    x = (x / window.innerWidth) * 2 - 1;
    y = - (y / window.innerHeight) * 2 + 1;

    // Rayo y la interseccion
    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x,y), camera);

    const intersecciones = rayo.intersectObjects( scene.getObjectByName('grupoEC').children, false);
    if(intersecciones.length > 0){
        intersecciones[0].object.rotation.y += Math.PI/8;
    }
}


function updateAspectRatio(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    const ar = window.innerWidth / window.innerHeight;

    camera.aspect = ar;
    

    if(ar>1){
        alzado.left = planta.left = perfil.left = -L*ar;
        alzado.right = planta.right = perfil.right = L*ar;
        alzado.top = planta.top = perfil.top = L;
        alzado.bottom = planta.bottom = perfil.bottom = -L;
    }else{
        alzado.left = planta.left = perfil.left = -L;
        alzado.right = planta.right = perfil.right = L;
        alzado.top = planta.top = perfil.top = L/ar;
        alzado.bottom = planta.bottom = perfil.bottom = -L/ar;
    }
    camera.updateProjectionMatrix();
    alzado.updateProjectionMatrix();
    perfil.updateProjectionMatrix();
    planta.updateProjectionMatrix();
}

function update(){
    angulo += 0.01;
    //esferaCubo.rotation.y = ( angulo);
}

function render(){
    requestAnimationFrame( render);
    update();

    renderer.clear();

    //El origen del viewport es bottom-left

    //Planta
    renderer.setViewport(0,0, window.innerWidth/2, window.innerHeight/2);
    renderer.render(scene,planta);

    //Alzado
    renderer.setViewport(0, window.innerHeight/2, window.innerWidth/2, window.innerHeight/2);
    renderer.render(scene,alzado);

    //Perfil
    renderer.setViewport(window.innerWidth/2, window.innerHeight/2, window.innerWidth/2, window.innerHeight/2);
    renderer.render(scene,perfil);

    //Perspectiva
    renderer.setViewport(window.innerWidth/2,0, window.innerWidth/2, window.innerHeight/2);
    renderer.render(scene,camera);
}