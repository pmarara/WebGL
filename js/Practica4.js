/**
 * Practica4.js
 * 
 * Practica #4 GPC: Animar la escena del robot además de añadir 
 * un interfaz.
 * 
 * @author <pmarara@upv.es, Pablo Martínez Aragón>, 2023
 * 
 */

// Modulos necesarios 
import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"
import {GUI} from "../lib/lil-gui.module.min.js"
import {TWEEN} from "../lib/tween.module.min.js"


// Variables de consenso
let renderer, scene, camera, planta, effectController;

//Controlador de camara
let cameraControls;

// Otras globales
let robot, base, brazo, mano, antebrazo, pinzaIz, pinzaDe, material;
const L = 70;
let baseX = 0, baseZ = 0;


// Acciones
init();
loadScene();
setupGUI();
render();

function init(){
    // Motor de reglas
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(1, 1, 1));
    document.getElementById("container").appendChild( renderer.domElement);
    renderer.autoClear = false;

    // Escena
    scene = new THREE.Scene();
    //scene.background = new THREE.Color( 1, 1, 1);

    //Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 2000);
    camera.position.set( 80, 280, 80);
    cameraControls = new OrbitControls( camera,renderer.domElement);
    cameraControls.target.set( 0,1,0);
    camera.lookAt( 0, 150, 0);

    //Camara ortografica
    const ar = window.innerWidth/window.innerHeight;
    setOrtographicCameras(ar);

    //Eventos
    window.addEventListener('resize', updateAspectRatio);
    window.addEventListener('keydown', movimientoBase);
}

function loadScene(){

    // Material
    material = new THREE.MeshNormalMaterial({wireframe: false, flatShading: true, side: THREE.DoubleSide});
    //const material = new THREE.MeshBasicMaterial({color:'red', wireframe: false, side: THREE.DoubleSide});
    const materialSuelo = new THREE.MeshBasicMaterial({color:'blue', wireframe: true});
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
    pinzaIz = new THREE.Mesh( pinza, material);
    pinzaIz.position.set(0,10,-10);
    pinzaIz.rotation.x = Math.PI/2;

    pinzaDe = new THREE.Mesh( pinza, material);
    pinzaDe.position.set(0,-10,10);
    pinzaDe.rotation.x = 3*Math.PI/2;


    //Construimos la mano
    const geoMano = new THREE.CylinderGeometry(15, 15, 40, 15);
    mano = new THREE.Mesh( geoMano, material);
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
    antebrazo = new THREE.Object3D();
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
    brazo = new THREE.Object3D();
    brazo.add(eje);
    brazo.add(esparrago);
    brazo.add(rotula);
    brazo.add(antebrazo);

    // Construimos el objeto base
    const geoCilindro = new THREE.CylinderGeometry( 50, 50, 15, 50);
    base = new THREE.Mesh( geoCilindro, material );
    base.add(brazo);
    base.add(planta);

    // Construimos el objeto robot
    robot = new THREE.Object3D();
    robot.add(base);
    robot.position.set(0,7.5,0);
   

   
   
    // Añadimos el robot a la escena
    scene.add(robot);
    //scene.add( new THREE.AxisHelper(100));
}

function setupGUI(){
    // Definición del objeto controlador
    effectController = {
        giroBase: 0.0,
        giroBrazo: 0.0,
        giroAntebrazoY: 0.0,
        giroAntebrazoZ: 0.0,
        giroPinza: 0.0,
        separacionPinza: 10,
        alambres: false,
        boton: animate
    }

    // Crear la GUI 
    const gui = new GUI();

    // Construir el menu de widgets
    gui.title("Control robot");
    const h = gui.addFolder("Controles");
    h.add(effectController,"giroBase", -180.0, 180.0, 0.025).name("Giro de la base");
    h.add(effectController,"giroBrazo", -45.0, 45.0, 0.025).name("Giro del brazo");
    h.add(effectController,"giroAntebrazoY", -180.0, 180.0, 0.025).name("Giro del antebrazo en Y");
    h.add(effectController,"giroAntebrazoZ", -90.0, 90.0, 0.025).name("Giro del antebrazo en Z");
    h.add(effectController,"giroPinza", -40.0, 220.0, 0.025).name("Giro de la pinza");
    h.add(effectController,"separacionPinza", 0.0, 15.0, 0.025).name("Separación de la Pinza");
    h.add(effectController,"alambres", false ).name("Alambres");
    h.add(effectController, 'boton').name('Animación');
}

function setOrtographicCameras(ar){
    let camaraOrtografica;

    if (ar>1){
        camaraOrtografica = new THREE.OrthographicCamera( -L, L, L, -L, -300, 300);
    }else{
        camaraOrtografica = new THREE.OrthographicCamera( -L, L, L, -L, -300, 300);
    }

    planta = camaraOrtografica.clone();
    planta.position.set( 0,L,0);
    planta.lookAt( 0,1,0);
    planta.rotation.z = -Math.PI/2;
    planta.up = new THREE.Vector3(0,0,-1);
}

function updateAspectRatio(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    const ar = window.innerWidth / window.innerHeight;
    camera.aspect = ar;

    if(ar>1){
        planta.left = -L;
        planta.right = L;
        planta.top = L;
        planta.bottom = -L;
    }else{
        planta.left = -L;
        planta.right = L;
        planta.top = L;
        planta.bottom = -L;
    }
    camera.updateProjectionMatrix();    
    planta.updateProjectionMatrix();
}

function movimientoBase(event){
    if (event.code === "ArrowDown"){
        baseX -= 5;
    } else if (event.code === "ArrowUp"){
        baseX += 5;
    } else if (event.code === "ArrowLeft"){
        baseZ -= 5;
    } else if (event.code === "ArrowRight"){
        baseZ += 5;
    }
}

function animate(){

    new TWEEN.Tween( robot.position)
    .to( {x:[robot.position.x+100,robot.position.x+100], y:[robot.position.y+150,robot.position.y+100], z:[robot.position.z,robot.position.z]}, 2000)
    .interpolation( TWEEN.Interpolation.CatmullRom )
    .easing( TWEEN.Easing.Cubic.InOut)
    .start()
    .onComplete(()=>{
        new TWEEN.Tween( robot.position)
        .to( {x:[robot.position.x,robot.position.x], y:[robot.position.y+80,robot.position.y], z:[robot.position.z,robot.position.z]}, 1500)
        .interpolation( TWEEN.Interpolation.CatmullRom )
        .easing( TWEEN.Easing.Back.In)
        .start()
        .onComplete(()=>{
            new TWEEN.Tween( robot.position)
            .to( {x:[robot.position.x,robot.position.x], y:[robot.position.y+80,robot.position.y], z:[robot.position.z,robot.position.z]}, 1000)
            .interpolation( TWEEN.Interpolation.CatmullRom )
            .easing( TWEEN.Easing.Back.In)
            .start()
            .onComplete(() => {
                new TWEEN.Tween( robot.position)
                .to( {x:[robot.position.x,robot.position.x], y:[robot.position.y+100,robot.position.y-100], z:[robot.position.z,robot.position.z]}, 2000)
                .interpolation( TWEEN.Interpolation.CatmullRom )
                .easing( TWEEN.Easing.Elastic.InOut)
                .start();
            });
        });
    });
}

function update(delta){
    robot.position.set(baseX,0,baseZ);
    base.rotation.y = effectController.giroBase * Math.PI/180;
    brazo.rotation.z = effectController.giroBrazo * Math.PI/180;
    antebrazo.rotation.y = effectController.giroAntebrazoY * Math.PI/180;
    antebrazo.rotation.z = effectController.giroAntebrazoZ * Math.PI/180;
    mano.rotation.y = effectController.giroPinza * Math.PI/180;
    pinzaIz.position.set(0,effectController.separacionPinza, -10);
    pinzaDe.position.set(0,-effectController.separacionPinza, 10);
    if(effectController.alambres){
        material.wireframe = true;
    }else{
        material.wireframe = false;
    }
    TWEEN.update(delta);
}

function render(){
    requestAnimationFrame( render);
    update();
    renderer.clear();

    //Renderizar cámara
    renderer.setViewport(0,0, window.innerWidth, window.innerHeight);
    renderer.render( scene, camera);

    //Renderizar planta
    let ar = window.innerWidth/window.innerHeight;
    if(ar > 1){
        renderer.setViewport(0, window.innerHeight-window.innerHeight/4, window.innerHeight/4, window.innerHeight/4);
        renderer.render(scene,planta);
    }else{
        renderer.setViewport(0, window.innerHeight-window.innerWidth/4, window.innerWidth/4, window.innerWidth/4);
        renderer.render(scene,planta);
    }



}