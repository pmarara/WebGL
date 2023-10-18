/**
 * EscenaIluminada.js
 * 
 * Seminario #5 GPC: Pintar una escena con luces, materiales, sombras y video.
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
let renderer, scene, camera, cameraControls, stats, effectController, video;

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
    renderer.setClearColor( new THREE.Color(0xAABBCC));
    document.getElementById("container").appendChild( renderer.domElement);
    renderer.antialias = true,
    renderer.shadowMap.enabled = true;

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0.0, 0.2, 0.9);

    //Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set( 0.5, 2, 7);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0,1,0);
    camera.lookAt( 0, 1, 0);

    //Luces
    const ambiental = new THREE.AmbientLight(0x222222);
    scene.add(ambiental);

    const direccional = new THREE.DirectionalLight(0xFFFFFF,0.5);
    direccional.position.set(-1,1,-1);
    direccional.castShadow = true;
    scene.add(direccional);

    const puntual = new THREE.PointLight(0xFFFFFF,0.3);
    puntual.position.set(2,7,-4);
    scene.add(puntual);

    const focal = new THREE.SpotLight(0xFFFFFF,1);
    focal.position.set(-2,7,4);
    focal.target.position.set(0,0,0);
    focal.angle = Math.PI/7;
    focal.penumbra = 0.3;
    focal.castShadow = true;
    scene.add(focal);
    scene.add(new THREE.CameraHelper(focal.shadow.camera));

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
    
    const texCubo = new THREE.TextureLoader().load('./images/wood512.jpg');
    const matCubo = new THREE.MeshLambertMaterial( {color: 'red', map: texCubo});
    const entorno = ["./images/posx.jpg","./images/negx.jpg","./images/posy.jpg","./images/negy.jpg","./images/posz.jpg","./images/negz.jpg"];
    const texEsfera = new THREE.CubeTextureLoader().load(entorno);
    const matEsfera = new THREE.MeshPhongMaterial( {color: 'white', specular: 'grey', shininess: 30, envMap: texEsfera});
    const texSuelo = new THREE.TextureLoader().load("./images/wet_ground_512x512.jpg");
    const matSuelo = new THREE.MeshStandardMaterial( {color: 'grey', map: texSuelo});
    const geoCubo = new THREE.BoxGeometry( 2, 2, 2);
    const geoEsfera = new THREE.SphereGeometry( 1, 10, 10);

    cubo = new THREE.Mesh( geoCubo, matCubo );
    cubo.castShadow = true;
    cubo.receiveShadow = true;
    esfera = new THREE.Mesh( geoEsfera, matEsfera );
    esfera.castShadow = true;
    esfera.receiveShadow = true;

    esferaCubo = new THREE.Object3D();

    cubo.position.set( 1, 0, 0);
    esfera.position.set(-1, 0, 0);
    esferaCubo.position.set(0, 1, 0);

    esferaCubo.add(cubo);
    esferaCubo.add(esfera);
    scene.add(esferaCubo)


    // Suelo
    suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10,10,10), matSuelo);
    suelo.rotation.x = -Math.PI/2;
    suelo.receiveShadow = true;
    scene.add(suelo);

    //Importar un modelo JSON
    const loader = new THREE.ObjectLoader;
    loader.load('models/soldado/soldado.json', 
                function(objeto){
                    cubo.add(objeto);
                    objeto.position.set(0,1,0);
                    objeto.rotation.y = (Math.PI);
                    objeto.name = 'soldado';
                    objeto.receiveShadow = true;
                    objeto.castShadow = true;
                    objeto.material.setValues({map: new THREE.TextureLoader().load("./models/soldado/soldado.png")});
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
                       gltf.scene.traverse(ob=>{
                        if(ob.isObject3D) ob.castShadow = ob.receiveShadow = true;
                       })
                       esfera.add( gltf.scene);
                    }
    );

    // Habitacion
    const paredes = [];
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load("./images/posx.jpg")}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load("./images/negx.jpg")}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load("./images/posy.jpg")}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load("./images/negy.jpg")}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load("./images/posz.jpg")}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load("./images/negz.jpg")}));

    const geoHabitacion =  new THREE.BoxGeometry(40,40,40);
    const habitacion = new THREE.Mesh(geoHabitacion, paredes);
    scene.add(habitacion);

    // Pantalla de cine
    video = document.createElement('video');
    video.src = "./videos/Pixar.mp4";
    video.load();
    video.muted = true;
    const videotextura = new THREE.VideoTexture( video);
    const matPantalla = new THREE.MeshBasicMaterial( {map: videotextura,side:THREE.DoubleSide});
    const pantalla = new THREE.Mesh( new THREE.PlaneGeometry( 20, 6, 4, 4), matPantalla);
    pantalla.position.set(0,3,-6);
    scene.add(pantalla);



    scene.add( new THREE.AxisHelper(5));
}

function setupGUI(){
    // Definición del objeto controlador
    effectController = {
        mensaje: 'Soldado y Robot',
        giroY: 0.0,
        separacion: 0,
        coloralambres: 'rgb(150,150,150)',
        silencio: true,
        play: function(){video.play()},
        pause: function(){video.pause()}
    }

    // Crear la GUI 
    const gui = new GUI();

    // Construir el menu de widgets
    const h = gui.addFolder("Controles");
    h.add(effectController,"mensaje").name("Aplicación");
    h.add(effectController,"giroY", -180.0, 180.0, 0.025).name("Giro en Y").listen();
    h.add(effectController,"separacion",{'Ninguna':0, 'Media': 2, 'Total': 5}).name("Separación");
    h.addColor(effectController, "coloralambres").name("Color alambres");
    const videoFolder = gui.addFolder("Video control");
    videoFolder.add(effectController,"silencio").onChange(v=>{video.muted = v;}).name("Mutear");
    videoFolder.add(effectController, "play");
    videoFolder.add(effectController,"pause");

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
    //effectController.giroY += 0.1;
    esferaCubo.rotation.y = effectController.giroY * Math.PI/180;
}

function render(delta){
    requestAnimationFrame( render);
    update(delta);
    renderer.render( scene, camera);
}