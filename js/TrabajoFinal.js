/**
 * TrabajoFinal.js
 * 
 * Trabajo Final GPC: Pequeño videojuego de puzzles de figuras y luces.
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
let renderer, scene, camera, cameraLuz;
let box, levelController;
let animation, instrucciones = "Utiliza las teclas W y S para girar las figuras en X, A y D para girar en Y y Q y E para girar en Z. Para superar el nivel, debe dar la luz en el detector rojo.";

//Controlador de camara
let cameraControls;

// Otras globales
let pieza, pieza1, pieza2, pieza3, pieza4, pieza5;
let cilindro1, cilindro2, cilindro3, detector;
const L = 90;
let rotX = 0, rotY = 0, rotZ = 0;
let changeLevel = false;

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
    renderer.antialias = true,
    renderer.shadowMap.enabled = true;

    // Escena
    scene = new THREE.Scene();
    //scene.background = new THREE.Color( 1, 1, 1);

    //Camara
    const ar = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera( 75, ar, 0.1, 100000);
    camera.position.set( -700, 1500, 600);
    cameraControls = new OrbitControls( camera,renderer.domElement);
    camera.lookAt( 0, 700, 0);

    //Camara ortografica
    
    /*let camaraOrtografica;
    if (ar>1){
        camaraOrtografica = new THREE.PerspectiveCamera( 90, ar, 0.1, 100000);
    }else{
        camaraOrtografica = new THREE.PerspectiveCamera( 90, ar, 0.1, 100000);
    }

    cameraLuz = camaraOrtografica.clone();*/
    cameraLuz = new THREE.PerspectiveCamera( 60, 1, 0.1, 100000);
    cameraLuz.position.set(0,500,750);
    cameraLuz.lookAt( 0,500,0);


    //Luces
    const ambiental = new THREE.AmbientLight(0x808080);
    scene.add(ambiental);

    const focal = new THREE.SpotLight(0xFFFFFF,1);
    focal.position.set(0,500,750);
    focal.target.position.set(0,500,0);
    focal.shadow.camera.far = 2000;
    focal.angle = Math.PI/9;
    focal.penumbra = 0.05;
    focal.castShadow = true;
    focal.decay = 2000;
    scene.add(focal);
    scene.add(focal.target);
    //scene.add(new THREE.CameraHelper(focal.shadow.camera));

    //Eventos
    window.addEventListener('resize', updateAspectRatio);
    window.addEventListener('keydown', rotacionPieza);
}

function loadScene(){

    // Materiales
    //material = new THREE.MeshNormalMaterial({wireframe: false, flatShading: true, side: THREE.DoubleSide});

    //const texSuelo = new THREE.TextureLoader().load("./images/pisometalico_1024.jpg");
    const matSuelo = new THREE.MeshStandardMaterial( {color: 'grey', side: THREE.DoubleSide});

    //const texPared =
    const matPared = new THREE.MeshStandardMaterial({color: 'grey', side: THREE.DoubleSide});

    //const entorno1 = ["./images/1_posx.jpg","./images/1_negx.jpg","./images/1_posy.jpg","./images/1_negy.jpg","./images/1_posz.jpg","./images/1_negz.jpg"];
    //const entorno2 = ["./images/posx.jpg","./images/negx.jpg","./images/posy.jpg","./images/negy.jpg","./images/posz.jpg","./images/negz.jpg"];
    //const entorno3 = ["./images/posx.jpg","./images/negx.jpg","./images/posy.jpg","./images/negy.jpg","./images/posz.jpg","./images/negz.jpg"];
    
    //const texPieza1 = new THREE.CubeTextureLoader().load(entorno);
    const matPieza1 = new THREE.MeshLambertMaterial( {color: 'white'});

    //const texPieza2 = new THREE.CubeTextureLoader().load(entorno);
    //const matPieza2 = new THREE.MeshPhongMaterial( {color: 'white', specular: 'grey', shininess: 10, envMap: texRotula});

    //const texPieza3 = new THREE.CubeTextureLoader().load(entorno);
    //const matPieza3 = new THREE.MeshPhongMaterial( {color: 'white', specular: 'grey', shininess: 10, envMap: texRotula});

    //const texDetector1 = new THREE.CubeTextureLoader().load(entorno);
    const matDetector1 = new THREE.MeshLambertMaterial( {color: 'white'});
    const matDetector2 = new THREE.MeshPhongMaterial( {color: 'red'});

    //const texDetector2 = new THREE.CubeTextureLoader().load(entorno);
    //const matDetector2 = new THREE.MeshPhongMaterial( {color: 'white', specular: 'grey', shininess: 10, envMap: texRotula});
    
    //const texDetector3 = new THREE.CubeTextureLoader().load(entorno);
    //const matDetector3 = new THREE.MeshPhongMaterial( {color: 'white', specular: 'grey', shininess: 10, envMap: texRotula});



    // Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(3000,3000,1000,1000), matSuelo);
    suelo.rotation.x = -Math.PI/2;
    suelo.receiveShadow = true;
    //scene.add(suelo);

    //Pared
    const pared = new THREE.Mesh( new THREE.PlaneGeometry(1250,1250,100,100), matPared);
    pared.receiveShadow = true;
    pared.position.set(0,500,-750);
    scene.add(pared);


    // Habitacion
    const paredes = [];
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load("./images/1_posx.png")}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load("./images/1_negx.png")}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load("./images/1_posy.png")}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load("./images/1_negy.png")}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load("./images/1_posz.png")}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load("./images/1_negz.png")}));

    const geoHabitacion =  new THREE.BoxGeometry(10000,10000,10000);
    const habitacion = new THREE.Mesh(geoHabitacion, paredes);
    habitacion.position.set(0,500,0);
    habitacion.receiveShadow = true;
    scene.add(habitacion);

    //Pieza1 
    var geoPieza1 = new THREE.TorusGeometry(190,80,80,80);
    pieza1 = new THREE.Mesh( geoPieza1, matPieza1);
    pieza1.position.set(0,500,0);
    pieza1.castShadow = true;
    pieza1.receiveShadow = true;
    rotX += Math.PI/2;
    pieza = pieza1.clone();
    scene.add(pieza);


    //Pieza2
    var geoCubo1 = new THREE.BoxGeometry(400,200,200,80);
    var geoCubo2 = new THREE.BoxGeometry(200,200,200,80);
    const cubo1 = new THREE.Mesh( geoCubo1, matPieza1);
    const cubo2 = new THREE.Mesh( geoCubo2, matPieza1);
    const cubo3 = new THREE.Mesh( geoCubo2, matPieza1);
    cubo2.position.set(-200,0,200);
    cubo3.position.set(200,0,200);
    cubo1.castShadow = true;
    cubo1.receiveShadow = true;
    cubo2.castShadow = true;
    cubo2.receiveShadow = true;
    cubo3.castShadow = true;
    cubo3.receiveShadow = true;

    pieza2 = new THREE.Object3D();
    pieza2.add(cubo1);
    pieza2.add(cubo2);
    pieza2.add(cubo3);

    
    pieza2.position.set(0,500,0);
    pieza2.castShadow = true;
    pieza2.receiveShadow = true;

    //Pieza 3

    var geoKnot = new THREE.TorusKnotGeometry(300,80, 200);
    pieza3 = new THREE.Mesh( geoKnot, matPieza1);
    pieza3.position.set(0,500,0);
    pieza3.castShadow = true;
    pieza3.receiveShadow = true;

    //Pieza 4
    var geoSphere = new THREE.SphereGeometry(100,100,100);
    var geoCilindro3 = new THREE.CylinderGeometry(100,100,650,100,100);
    const esfera = new THREE.Mesh(geoSphere, matPieza1);
    esfera.castShadow = true;
    esfera.receiveShadow = true;
    const cil1 = new THREE.Mesh(geoCilindro3, matPieza1);
    cil1.castShadow = true;
    cil1.receiveShadow = true;
    cil1.rotation.z += Math.PI/2;
    const cil2 = new THREE.Mesh(geoCilindro3, matPieza1);
    cil2.rotation.x += Math.PI/2;
    cil2.castShadow = true;
    cil2.receiveShadow = true;
    const cil3 = new THREE.Mesh(geoCilindro3, matPieza1);
    cil3.rotation.y += Math.PI/2;
    cil3.castShadow = true;
    cil3.receiveShadow = true;

    pieza4 = new THREE.Object3D();
    pieza4.add(esfera);
    pieza4.add(cil1);
    pieza4.add(cil2);
    pieza4.add(cil3);
    pieza4.position.set(0,500,-200);
    pieza4.castShadow = true;
    pieza4.receiveShadow = true;

    //Pieza 5
    



    
    //Detector 
    var geoCilindro1 = new THREE.CylinderGeometry(50,50,15,100);
    cilindro1 = new THREE.Mesh( geoCilindro1, matDetector1);
    var geoCilindro2 = new THREE.CylinderGeometry(40,40,2,40);
    cilindro2 = new THREE.Mesh( geoCilindro2, matDetector2);
    cilindro2.position.y = 8.5;
    cilindro1.add(cilindro2);
    cilindro1.position.set(0,500,-750);
    cilindro1.rotation.x = Math.PI/2;
    cilindro1.castShadow = true;
    cilindro1.receiveShadow = true;


    detector = cilindro1.clone()
    scene.add(detector);


    //Linterna

    //Importar modelo en GLTF
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('models/torch/scene.gltf',
                    function(gltf){
                       gltf.scene.name = 'torch';
                       gltf.scene.scale.set (0.2, 0.2, 0.2);
                       gltf.scene.position.set(0,500,830);
                       gltf.scene.rotation.y = Math.PI/2;
                       gltf.scene.traverse(ob=>{
                        if(ob.isObject3D) ob.castShadow = ob.receiveShadow = true;
                       })
                       scene.add( gltf.scene);
                    }
    );
    
    
    //scene.add( new THREE.AxisHelper(100));
}




function updateAspectRatio(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    const ar = window.innerWidth / window.innerHeight;
    camera.aspect = ar;

    if(ar>1){
        cameraLuz.left = -L;
        cameraLuz.right = L;
        cameraLuz.top = L;
        cameraLuz.bottom = -L;
    }else{
        cameraLuz.left = -L;
        cameraLuz.right = L;
        cameraLuz.top = L;
        cameraLuz.bottom = -L;
    }
    camera.updateProjectionMatrix();    
    cameraLuz.updateProjectionMatrix();
}

function rotacionPieza(event){
    if (event.code == "KeyW"){
        rotX -= Math.PI/32;
    } else if (event.code == "KeyS"){
       rotX += Math.PI/32;
    } else if (event.code == "KeyQ"){
       rotZ -= Math.PI/32;
    } else if (event.code == "KeyE"){
       rotZ += Math.PI/32;
    }else if (event.code == "KeyA"){
        rotY -= Math.PI/32;
    } else if (event.code == "KeyD"){
       rotY += Math.PI/32;
    }
}

function comprobarRayo(){

    scene.updateMatrixWorld(true);
    pieza.updateMatrixWorld(true);

    //Construir el rayo
    const rayo = new THREE.Raycaster();
    var dir = new THREE.Vector3().subVectors(detector.position, cameraLuz.position).normalize();
    rayo.setFromCamera(dir, cameraLuz );
    //scene.add(new THREE.ArrowHelper(dir, rayo.ray.origin, 3000, 0xff0000));
    
    // Intersecciones con pieza
    let intersecciones = rayo.intersectObject(pieza,true);
    if(intersecciones.length == 0){
        console.log("Has completado el nivel ", levelController.level);
        levelController.level += 1;
        changeLevel = true;
    }else{
        console.log("Intersecciones ", intersecciones.length);
    }

}

function updateLevel(){
    scene.remove(pieza);
            if(levelController.level == 2){
                pieza = pieza2.clone();
                detector.position.x +=500;

                rotY = 0;
                rotZ = 0;
                rotX = 0;
        
            }else if(levelController.level == 3){
                pieza = pieza3.clone();
                detector.position.x -=800;
                detector.position.y -=350;
                rotX = 0;
                rotY = 0;
                rotZ = 0;
            }else if(levelController.level == 4){
                pieza = pieza4.clone();
                detector.position.x -=200;
                detector.position.y +=350;
                rotX = 0;
                rotY = 0;
                rotZ = 0;
            }
        scene.add(detector);
        scene.add(pieza);
        changeLevel = false;
}

function animate(){

    new TWEEN.Tween(pieza.scale)
        .to({ x: 0.1, y: 0.1, z: 0.1 }, 500)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start().onStart(() => { animation = true;})
        .onComplete(() => { 
            updateLevel();
            animation = false;
        });
           
}

function update(delta){
    pieza.rotation.x = rotX;
    pieza.rotation.y = rotY;
    pieza.rotation.z = rotZ;
    
    //scene.remove(box);
    //box = new THREE.BoxHelper( pieza, 0xffff00 );
    //scene.add( box );

    if(!animation){
        comprobarRayo();
        if(changeLevel){
            animate();
        }
    }

    
    TWEEN.update(delta);
}

function setupGUI(){
    // Definición del objeto controlador
    levelController = {
            level:1
    }

    // Crear la GUI 
    const gui = new GUI();

    // Construir 
    gui.title("Juego de figuras y luces.");
    const info = gui.addFolder("Info del juego.");
    info.add(levelController,"level").name("Nivel").disable().listen();
}

function render(){
    requestAnimationFrame( render);
    update();
    renderer.clear();

    //Renderizar cámara
    renderer.setViewport(0,0, window.innerWidth, window.innerHeight);
    renderer.render( scene, camera);
    renderer.clearDepth();

    //Renderizar cameraLuz
    let ar = window.innerWidth/window.innerHeight;
    if(ar > 1){
        renderer.setViewport(0, window.innerHeight-window.innerHeight/3, window.innerHeight/3, window.innerHeight/3);
        renderer.render(scene,cameraLuz);
    }else{
        renderer.setViewport(0, window.innerHeight-window.innerWidth/3, window.innerWidth/3, window.innerWidth/3);
        renderer.render(scene,cameraLuz);
    }



}